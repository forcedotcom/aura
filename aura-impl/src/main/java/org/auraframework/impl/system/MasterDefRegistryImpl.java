/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.impl.system;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;

import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.service.CachingService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.Location;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.GlobMatcher;
import org.auraframework.util.text.Hash;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import edu.umd.cs.findbugs.annotations.CheckForNull;
import edu.umd.cs.findbugs.annotations.NonNull;

/**
 * Overall Master definition registry implementation, there be dragons here.
 * 
 * This 'master' definition registry is actually a single threaded, per request registry that caches certain things in
 * what is effectively a thread local cache. This means that once something is pulled into the local thread, it will not
 * change.
 * 
 */
public class MasterDefRegistryImpl implements MasterDefRegistry {
    private static final Logger logger = Logger.getLogger(MasterDefRegistryImpl.class);

    private static final ImmutableSortedSet<String> cacheDependencyExceptions = ImmutableSortedSet.of(
            "apex://array",
            "apex://aura.component",
            "apex://blob",
            "apex://boolean",
            "apex://date",
            "apex://datetime",
            "apex://decimal",
            "apex://double",
            "apex://event",
            "apex://id",
            "apex://integer",
            "apex://list",
            "apex://long",
            "apex://map",
            "apex://object",
            "apex://set",
            "apex://string",
            "apex://sobject",
            "apex://time"
            );
    private final static int ACCESS_CHECK_CACHE_SIZE = 4096;

    private final Lock rLock;
    private final Lock wLock;

    private final Cache<DefDescriptor<?>, Boolean> existsCache;
    private final Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
    private final Cache<String, DependencyEntry> depsCache;
    private final Cache<String, String> stringsCache;
    private final Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache;
    private final Cache<String, String> accessCheckCache;

    /**
     * A local dependencies cache.
     * 
     * We store both by descriptor and by uid. The descriptor keys must include the type, as the qualified name is not
     * sufficient to distinguish it. In the case of the UID, we presume that we are safe.
     * 
     * The two keys stored in the local cache are:
     * <ul>
     * <li>The UID, which should be sufficiently unique for a single request.</li>
     * <li>The type+qualified name of the descriptor. We store this to avoid construction in the case where we don't
     * have a UID. This is presumed safe because we assume that a single session will have a consistent set of
     * permissions</li>
     * </ul>
     */
    private final Map<String, DependencyEntry> localDependencies;

    private final RegistryTrie delegateRegistries;

    private final Map<DefDescriptor<? extends Definition>, Definition> defs;

    private Set<DefDescriptor<? extends Definition>> localDescs;

    private CompileContext currentCC;

    private final MasterDefRegistryImpl original;

    private MasterDefRegistryImpl(RegistryTrie delegate, MasterDefRegistryImpl original) {
        CachingService acs = Aura.getCachingService();

        this.delegateRegistries = delegate;
        this.original = original;
        this.rLock = acs.getReadLock();
        this.wLock = acs.getWriteLock();
        this.existsCache = acs.getExistsCache();
        this.defsCache = acs.getDefsCache();
        this.depsCache = acs.getDepsCache();
        this.stringsCache = acs.getStringsCache();
        this.descriptorFilterCache = acs.getDescriptorFilterCache();
        this.accessCheckCache = acs.<String, String> getCacheBuilder()
                .setInitialSize(ACCESS_CHECK_CACHE_SIZE)
                .setMaximumSize(ACCESS_CHECK_CACHE_SIZE)
                .setRecordStats(true)
                .setSoftValues(true)
                .build();
        this.localDependencies = Maps.newHashMap();
        this.defs = Maps.newHashMap();
        this.localDescs = null;
        this.currentCC = null;
    }

    /**
     * Build a system def registry that is meant to be used as a shadowing registry.
     * 
     * This builds a registry that will not add new defs to the def set, and will allow any access (the access checks
     * MUST have been done before this is instantiated). Note that none of the defs built off of this will be sent to
     * the client, so it should be safe to allow this access.
     * 
     * @param original the registry that is the 'public' registry.
     */
    public MasterDefRegistryImpl(@NonNull MasterDefRegistryImpl original) {
        this(original.delegateRegistries, original);
    }

    /**
     * Build a master def registry with a set of registries.
     * 
     * This is the normal constructor for a master def registry.
     * 
     * @param registries the registries to use in the mdr.
     */
    public MasterDefRegistryImpl(@NonNull DefRegistry<?>... registries) {
        this(new RegistryTrie(registries), null);
    }

    private boolean isOkForDependencyCaching(DefDescriptor<?> descriptor) {
        // if compound, OK as these tests are also conducted on the compound's target
        if (descriptor.getPrefix().equals("compound")) {
            return true;
        }

        // test cacheDependencyExceptions (like static types in Apex)
        String descriptorName = descriptor.getQualifiedName().toLowerCase();

        // truncate array markers
        if (descriptorName.endsWith("[]")) {
            descriptorName = descriptorName.substring(0, descriptorName.length() - 2);
        }
        if (cacheDependencyExceptions.contains(descriptorName)) {
            return true;
        }
        return false;
    }

    @Override
    @NonNull
    public Set<DefDescriptor<?>> find(@NonNull DescriptorFilter matcher) {
        final String filterKey = matcher.toString();
        Set<DefRegistry<?>> registries = delegateRegistries.getRegistries(matcher);
        Set<DefDescriptor<?>> matched = Sets.newHashSet();

        rLock.lock();
        try {
            boolean cacheable = shouldCache(matcher);
            for (DefRegistry<?> reg : registries) {
                //
                // This could be a little dangerous, but unless we force all of our
                // registries to implement find, this is necessary.
                //
                if (reg.hasFind()) {
                    Set<DefDescriptor<?>> registryResults = null;

                    if (cacheable && reg.isCacheable()) {
                        // cache results per registry
                        String cacheKey = filterKey + "|" + reg.toString();
                        registryResults = descriptorFilterCache.getIfPresent(cacheKey);
                        if (registryResults == null) {
                            registryResults = reg.find(matcher);
                            descriptorFilterCache.put(cacheKey, registryResults);
                        }
                    } else {
                        registryResults = reg.find(matcher);
                    }

                    matched.addAll(registryResults);
                }
            }
            if (localDescs != null) {
                for (DefDescriptor<? extends Definition> desc : localDescs) {
                    if (matcher.matchDescriptor(desc)) {
                        matched.add(desc);
                    }
                }
            }
        } finally {
            rLock.unlock();
        }

        return matched;
    }

    @Override
    @NonNull
    public <D extends Definition> Set<DefDescriptor<D>> find(@NonNull DefDescriptor<D> matcher) {
        Set<DefDescriptor<D>> matched;
        if (matcher.getNamespace().equals("*")) {
            matched = new LinkedHashSet<>();
            String qualifiedNamePattern = null;
            switch (matcher.getDefType()) {
            case CONTROLLER:
            case TESTSUITE:
            case MODEL:
            case RENDERER:
            case HELPER:
            case STYLE:
            case TYPE:
            case RESOURCE:
            case PROVIDER:
            case THEME_PROVIDER:
            case THEME_MAP_PROVIDER:
                qualifiedNamePattern = "%s://%s.%s";
                break;
            case ATTRIBUTE:
            case LAYOUT:
            case LAYOUT_ITEM:
            case TESTCASE:
            case APPLICATION:
            case COMPONENT:
            case INTERFACE:
            case EVENT:
            case LIBRARY:
            case DOCUMENTATION:
            case LAYOUTS:
            case NAMESPACE:
            case THEME:
            case THEME_DEF_REF:
            case VAR:
            case DESIGN:
            case ATTRIBUTE_DESIGN:
            case DESIGN_TEMPLATE:
            case DESIGN_TEMPLATE_REGION:
                qualifiedNamePattern = "%s://%s:%s";
                break;
            case ACTION:
            case DESCRIPTION:
            case EXAMPLE:
            case INCLUDE:
                // TODO: FIXME
                throw new AuraRuntimeException(String.format("Find on %s defs not supported.", matcher.getDefType()
                        .name()));
            }
            rLock.lock();
            try {
                for (String namespace : delegateRegistries.getAllNamespaces()) {
                    String qualifiedName = String.format(qualifiedNamePattern,
                            matcher.getPrefix() != null ? matcher.getPrefix() : "*", namespace,
                            matcher.getName() != null ? matcher.getName() : "*");
                    @SuppressWarnings("unchecked")
                    DefDescriptor<D> namespacedMatcher = (DefDescriptor<D>) DefDescriptorImpl.getInstance(
                            qualifiedName,
                            matcher.getDefType().getPrimaryInterface());
                    DefRegistry<D> registry = getRegistryFor(namespacedMatcher);
                    if (registry != null) {
                        matched.addAll(registry.find(namespacedMatcher));
                    }
                }
            } finally {
                rLock.unlock();
            }
        } else {
            rLock.lock();
            try {
                matched = getRegistryFor(matcher).find(matcher);
            } finally {
                rLock.unlock();
            }
        }
        if (localDescs != null) {
            DescriptorFilter filter = new DescriptorFilter(matcher.getQualifiedName());
            for (DefDescriptor<? extends Definition> desc : localDescs) {
                if (filter.matchDescriptor(desc)) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<D> localDesc = (DefDescriptor<D>) desc;
                    matched.add(localDesc);
                }
            }
        }
        return matched;
    }

    /**
     * A compiling definition.
     * 
     * This embodies a definition that is in the process of being compiled. It stores the descriptor, definition, and
     * the registry to which it belongs to avoid repeated lookups.
     */
    private static class CompilingDef<T extends Definition> implements Comparable<CompilingDef<?>> {
        public CompilingDef(@NonNull DefDescriptor<T> descriptor) {
            this.descriptor = descriptor;
        }

        /**
         * The descriptor we are compiling.
         */
        @NonNull
        public DefDescriptor<T> descriptor;

        /**
         * The compiled def.
         * 
         * Should be non-null by the end of compile.
         */
        public T def;

        /**
         * Did we build this definition?.
         * 
         * If this is true, we need to do the validation steps after finishing.
         */
        public boolean built = false;

        /**
         * The 'level' of this def in the compile tree.
         */
        public int level = 0;

        /**
         * Is this def cacheable?
         */
        public boolean cacheable = false;

        /**
         * have we validated this def yet?
         */
        public boolean validated = false;

        @Override
        public String toString() {
            StringBuffer sb = new StringBuffer();

            sb.append(descriptor);
            if (def != null) {
                sb.append("[");
                sb.append(def.getOwnHash());
                sb.append("]");

                sb.append("<");
                sb.append(level);
                sb.append(">");
            } else {
                sb.append("[not-compiled]");
            }
            sb.append(" : built=");
            sb.append(built);
            sb.append(", cacheable=");
            sb.append(cacheable);
            return sb.toString();
        }

        @Override
        public int compareTo(CompilingDef<?> o) {
            if (o.level != this.level) {
                return o.level - this.level;
            }
            return this.descriptor.compareTo(o.descriptor);
        }
    }

    /**
     * The compile context.
     * 
     * This class holds the local information necessary for compilation.
     */
    private static class CompileContext {
        public final AuraContext context = Aura.getContextService().getCurrentContext();
        public final LoggingService loggingService = Aura.getLoggingService();
        public final Map<DefDescriptor<? extends Definition>, CompilingDef<?>> compiled = Maps.newHashMap();
        public final List<ClientLibraryDef> clientLibs;
        public final DefDescriptor<? extends Definition> topLevel;
        public int level;

        /** Is this def's dependencies cacheable? */
        public boolean shouldCacheDependencies;

        public CompileContext(DefDescriptor<? extends Definition> topLevel, List<ClientLibraryDef> clientLibs) {
            this.clientLibs = clientLibs;
            this.topLevel = topLevel;
            this.level = 0;
            this.shouldCacheDependencies = true;
        }

        public CompileContext(DefDescriptor<? extends Definition> topLevel) {
            this.clientLibs = null;
            this.topLevel = topLevel;
            this.shouldCacheDependencies = true;
        }

        public <D extends Definition> CompilingDef<D> getCompiling(DefDescriptor<D> descriptor) {
            @SuppressWarnings("unchecked")
            CompilingDef<D> cd = (CompilingDef<D>) compiled.get(descriptor);
            if (cd == null) {
                cd = new CompilingDef<>(descriptor);
                compiled.put(descriptor, cd);
            }
            return cd;
        }
    }

    /**
     * Check to see if we have a def locally.
     */
    private boolean hasLocalDef(DefDescriptor<?> descriptor) {
        return (original != null && original.defs.containsKey(descriptor)) || defs.containsKey(descriptor);
    }

    private <D extends Definition> D getLocalDef(DefDescriptor<D> descriptor) {
        if (original != null && original.defs.containsKey(descriptor)) {
            @SuppressWarnings("unchecked")
            D origDef = (D) original.defs.get(descriptor);
            return origDef;
        }
        if (defs.containsKey(descriptor)) {
            @SuppressWarnings("unchecked")
            D localDef = (D) defs.get(descriptor);
            return localDef;
        }
        return null;
    }

    /**
     * Fill a compiling def for a descriptor.
     * 
     * This makes sure that we can get a registry for a given def, then tries to get the def from the global cache, if
     * that fails, it retrieves from the registry, and marks the def as locally built.
     * 
     * @param compiling the current compiling def (if there is one).
     * @throws QuickFixException if validateDefinition caused a quickfix.
     */
    private <D extends Definition> boolean fillCompilingDef(CompilingDef<D> compiling, AuraContext context)
            throws QuickFixException {
        assert compiling.def == null;

        //
        // First, check our local cached defs to see if we have a fully compiled version.
        // in this case, we don't care about caching, since we are done.
        //
        if (hasLocalDef(compiling.descriptor)) {
            D localDef = getLocalDef(compiling.descriptor);
            if (localDef != null) {
                compiling.def = localDef;
                // I think this is no longer possible.
                compiling.built = !localDef.isValid();
                if (compiling.built) {
                    localDef.validateDefinition();
                }
                return true;
            } else {
                return false;
            }
        }

        //
        // If there is no local cache, we must first check to see if there is a registry, as we may not have
        // a registry (depending on configuration). In the case that we don't find one, we are done here.
        //
        DefRegistry<D> registry = getRegistryFor(compiling.descriptor);
        if (registry == null) {
            defs.put(compiling.descriptor, null);
            return false;
        }

        //
        // Now, check if we can cache the def later, as we won't have the registry to check at a later time.
        // If we can cache, look it up in the cache. If we find it, we have a built definition.
        // Currently, static registries are neither cached, nor do they affect dependency caching
        //
        if (!registry.isStatic()) {
            if (registry.isCacheable() && shouldCache(compiling.descriptor)) {
                compiling.cacheable = true;

                @SuppressWarnings("unchecked")
                Optional<D> opt = (Optional<D>) defsCache.getIfPresent(compiling.descriptor);
                if (opt != null) {
                    D cachedDef = opt.orNull();

                    if (cachedDef != null) {
                        @SuppressWarnings("unchecked")
                        DefDescriptor<D> canonical = (DefDescriptor<D>) cachedDef.getDescriptor();

                        compiling.def = cachedDef;
                        compiling.descriptor = canonical;
                        compiling.built = false;
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                // if not a cacheable registry or not shouldCache, test other exceptions that might still
                // allow dependency caching (if it's from static registry, it can't affect our decision on
                // depsCaching) test for special cases: compounds and static apex types
                boolean qualified = isOkForDependencyCaching(compiling.descriptor);

                currentCC.shouldCacheDependencies = qualified;
            }
        }

        //
        // The last case. This is our first compile or the def is uncacheable.
        // In this case, we make sure that the initial validation is called, and put
        // the def in the 'built' set.
        //
        compiling.def = registry.getDef(compiling.descriptor);
        if (compiling.def == null) {
            return false;
        }
        @SuppressWarnings("unchecked")
        DefDescriptor<D> canonical = (DefDescriptor<D>) compiling.def.getDescriptor();
        compiling.descriptor = canonical;
        currentCC.loggingService.incrementNum(LoggingService.DEF_COUNT);
        context.pushCallingDescriptor(canonical);
        try {
            compiling.def.validateDefinition();
        } finally {
            context.popCallingDescriptor();
        }
        compiling.built = true;
        return true;
    }

    /**
     * A private helper routine to make the compiler code more sane.
     * 
     * @param descriptor the descriptor that we are currently handling, must not be in the compiling defs.
     * @param cc the compile context to allow us to accumulate information.
     * @param stack the incoming stack (linked hash set, so order is preserved).
     * @param parent the direct parent of the definition we are looking up.
     * @throws QuickFixException if the definition is not found, or validateDefinition() throws one.
     */
    private <D extends Definition> D getHelper(@NonNull DefDescriptor<D> descriptor,
            @NonNull CompileContext cc, @NonNull Set<DefDescriptor<?>> stack,
            @CheckForNull Definition parent) throws QuickFixException {
        currentCC.loggingService.incrementNum(LoggingService.DEF_VISIT_COUNT);
        if (stack.contains(descriptor)) {
            // System.out.println("cycle at "+stack+" "+descriptor);
            return null;
        }
        CompilingDef<D> cd = cc.getCompiling(descriptor);
        if (cc.level > cd.level) {
            cd.level = cc.level;
            if (cd.def != null) {
                // System.out.println("recalculating at "+stack+" "+descriptor);
            }
        } else {
            if (cd.def != null) {
                return cd.def;
            }
        }
        cc.level += 1;
        stack.add(descriptor);
        try {
            //
            // careful here. We don't just return with the non-null def because that breaks our levels.
            // We need to walk the whole tree, which is unfortunate perf-wise.
            //
            if (cd.def == null) {
                if (!fillCompilingDef(cd, cc.context)) {
                    // No def. Blow up.
                    Location l = null;
                    if (parent != null) {
                        l = parent.getLocation();
                    }
                    stack.remove(descriptor);
                    throw new DefinitionNotFoundException(descriptor, l, stack.toString());
                }
                // get client libs
                if (cc.clientLibs != null && cd.def instanceof BaseComponentDef) {
                    BaseComponentDef baseComponent = (BaseComponentDef) cd.def;
                    baseComponent.addClientLibs(cc.clientLibs);
                }
            }

            Set<DefDescriptor<?>> newDeps = Sets.newHashSet();
            cd.def.appendDependencies(newDeps);

            for (DefDescriptor<?> dep : newDeps) {
                getHelper(dep, cc, stack, cd.def);
            }

            return cd.def;
        } finally {
            cc.level -= 1;
            stack.remove(descriptor);
        }
    }

    /**
     * finish up the validation of a set of compiling defs.
     * 
     * @param context only needed to do setCurrentNamspace.
     */
    private void finishValidation() throws QuickFixException {
        int iteration = 0;
        List<CompilingDef<?>> compiling = null;

        //
        // Validate our references. This part is uh, painful.
        // Turns out that validating references can pull in things we didn't see, so we
        // loop infinitely... or at least a few times.
        //
        // This can be changed once we remove the ability to nest, as we will never allow
        // this. That way we won't have to copy our list so many times.
        //
        do {
            compiling = Lists.newArrayList(currentCC.compiled.values());

            for (CompilingDef<?> cd : compiling) {
                currentCC.context.pushCallingDescriptor(cd.descriptor);
                try {
                    if (cd.built && !cd.validated) {
                        if (iteration != 0) {
                            logger.warn("Nested add of " + cd.descriptor + " during validation of "
                                    + currentCC.topLevel);
                            // throw new
                            // AuraRuntimeException("Nested add of "+cd.descriptor+" during validation of "+currentCC.topLevel);
                        }
                        cd.def.validateReferences();
                        cd.validated = true;
                    }
                } finally {
                    currentCC.context.popCallingDescriptor();
                }
            }
            iteration += 1;
        } while (compiling.size() < currentCC.compiled.size());

        //
        // And finally, mark everything as happily compiled.
        //
        for (CompilingDef<?> cd : compiling) {
            if (cd.def == null) {
                throw new AuraRuntimeException("Missing def for " + cd.descriptor + " during validation of "
                        + currentCC.topLevel);
            }
            if (cd.def != null) {
                defs.put(cd.descriptor, cd.def);
                if (cd.built) {
                    if (cd.cacheable) { // false for non-privileged namespaces, or non-cacheable registries
                        defsCache.put(cd.descriptor, Optional.of(cd.def));
                    }
                    cd.def.markValid();
                }
            }
        }
    }

    /**
     * Compile a single definition, finding all of the static dependencies.
     * 
     * This is the primary entry point for compiling a single definition. The basic guarantees enforced here are:
     * <ol>
     * <li>Each definition has 'validateDefinition()' called on it exactly once.</li>
     * <li>No definition is marked as valid until all definitions in the dependency set have been validated</li>
     * <li>Each definition has 'validateReferences()' called on it exactly once, after the definitions have been put in
     * local cache</li>
     * <li>All definitions are marked valid by the DefRegistry after the validation is complete</li>
     * <li>No definition should be available to other threads until it is marked valid</li>
     * <ol>
     * 
     * In order to do all of this, we keep a set of 'compiling' definitions locally, and use that to calculate
     * dependencies and walk the tree. Circular dependencies are handled gracefully, and no other thread can interfere
     * because everything is local.
     * 
     * FIXME: this should really cache invalid definitions and make sure that we don't bother re-compiling until there
     * is some change of state. However, that is rather more complex than it sounds.... and shouldn't really manifest
     * much in a released system.
     * 
     * @param descriptor the descriptor that we wish to compile.
     */
    @CheckForNull
    private <D extends Definition> D compileDef(@NonNull DefDescriptor<D> descriptor, @NonNull CompileContext cc)
            throws QuickFixException {
        D def;
        boolean nested = (cc == currentCC);

        if (!nested && currentCC != null) {
            throw new AuraRuntimeException("Unexpected nesting of contexts. This is not allowed");
        }
        currentCC = cc;
        if (!nested) {
            currentCC.loggingService.startTimer(LoggingService.TIMER_DEFINITION_CREATION);
        }
        try {
            Set<DefDescriptor<?>> stack = Sets.newLinkedHashSet();
            try {
                def = getHelper(descriptor, currentCC, stack, null);
            } catch (DefinitionNotFoundException ndfe) {
                if (nested) {
                    // ooh, nasty, we might be in a 'failure is ok state', in which case
                    // we need to be sure that we don't mess up the finishValidation step
                    // by leaving an empty entry around... If failure is _not_ ok, the next
                    // level up will break.
                    if (currentCC.compiled.containsKey(descriptor)) {
                        currentCC.compiled.remove(descriptor);
                    }
                }
                if (descriptor.equals(ndfe.getDescriptor())) {
                    //
                    // ignore a nonexistent def here.
                    //
                    return null;
                } else {
                    throw ndfe;
                }
            }

            if (!nested) {
                finishValidation();
            }
            return def;
        } finally {
            if (!nested) {
                currentCC.loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
                currentCC = null;
            }
        }
    }

    /**
     * Internal routine to compile and return a DependencyEntry.
     * 
     * This routine always compiles the definition, even if it is in the caches. If the incoming descriptor does not
     * correspond to a definition, it will return null, otherwise, on failure it will throw a QuickFixException.
     * 
     * Please look at {@link #localDependencies} if you are mucking in here.
     * 
     * Side Effects:
     * <ul>
     * <li>All definitions that were encountered during the compile will be put in the local def cache, even if a QFE is
     * thrown</li>
     * <li>A hash is compiled for the definition if it compiles</li>
     * <li>a dependency entry is cached locally in any case</li>
     * <li>a dependency entry is cached globally if the definition compiled</li>
     * </ul>
     * 
     * @param descriptor the incoming descriptor to compile
     * @return the definition compiled from the descriptor, or null if not found.currentCC
     * @throws QuickFixException if the definition failed to compile.
     */
    @CheckForNull
    protected <T extends Definition> DependencyEntry compileDE(@NonNull DefDescriptor<T> descriptor)
            throws QuickFixException {
        // See localDependencies commentcurrentCC
        String key = makeLocalKey(descriptor);

        if (currentCC != null) {
            throw new AuraRuntimeException("Ugh, nested compileDE/buildDE on " + currentCC.topLevel
                    + " trying to build " + descriptor);
        }

        try {
            List<ClientLibraryDef> clientLibs = Lists.newArrayList();
            CompileContext cc = new CompileContext(descriptor, clientLibs);
            Definition def = compileDef(descriptor, cc);
            DependencyEntry de;
            String uid;

            if (def == null) {
                return null;
            }

            List<CompilingDef<?>> compiled = Lists.newArrayList(cc.compiled.values());
            Collections.sort(compiled);

            Set<DefDescriptor<? extends Definition>> deps = Sets.newLinkedHashSet();

            //
            // Now walk the sorted list, building up our dependencies, and uid
            //
            StringBuilder sb = new StringBuilder(256);
            Hash.StringBuilder globalBuilder = new Hash.StringBuilder();
            for (CompilingDef<?> cd : compiled) {
                if (cd.def == null) {
                    // actually, this should never happen.
                    throw new DefinitionNotFoundException(cd.descriptor);
                }

                deps.add(cd.descriptor);

                //
                // Now update our hash.
                //
                sb.setLength(0);
                sb.append(cd.descriptor.getQualifiedName().toLowerCase());
                sb.append("|");
                String hash = cd.def.getOwnHash();
                if (hash != null) {
                    sb.append(hash);
                }
                sb.append(",");
                globalBuilder.addString(sb.toString());
            }
            uid = globalBuilder.build().toString();

            //
            // Now try a re-lookup. This may catch existing cached
            // entries where uid was null.
            //
            de = getDE(uid, descriptor);
            if (de != null) {
                return de;
            }

            de = new DependencyEntry(uid, Collections.unmodifiableSet(deps), clientLibs);
            if (shouldCache(descriptor)) {
                // put UID-qualified descriptor key for dependency
                depsCache.put(makeGlobalKey(de.uid, descriptor), de);

                // put unqualified descriptor key for dependency
                if (cc.shouldCacheDependencies) {
                    depsCache.put(makeNonUidGlobalKey(descriptor), de);
                }
            }
            // See localDependencies comment
            localDependencies.put(de.uid, de);
            localDependencies.put(key, de);
            return de;
        } catch (QuickFixException qfe) {
            // See localDependencies comment
            localDependencies.put(key, new DependencyEntry(qfe));
            throw qfe;
        }
    }

    /**
     * Get a dependency entry for a given uid.
     * 
     * This is a convenience routine to check both the local and global cache for a value.
     * 
     * Please look at {@link #localDependencies} if you are mucking in here.
     * 
     * Side Effects:
     * <ul>
     * <li>If a dependency is found in the global cache, it is populated into the local cache.</li>
     * </ul>
     * 
     * @param uid the uid may be null, if so, it only checks the local cache.
     * @param descriptor the descriptor, used for both global and local cache lookups.
     * @return the DependencyEntry or null if none present.
     */
    private DependencyEntry getDE(@CheckForNull String uid, @NonNull DefDescriptor<?> descriptor) {
        // See localDependencies comment
        String key = makeLocalKey(descriptor);
        DependencyEntry de;

        if (uid != null) {
            de = localDependencies.get(uid);
            if (de != null) {
                return de;
            }
            if (shouldCache(descriptor)) {
                de = depsCache.getIfPresent(makeGlobalKey(uid, descriptor));
            }
        } else {
            // See localDependencies comment
            de = localDependencies.get(key);
            if (de != null) {
                return de;
            }
            if (shouldCache(descriptor)) {
                de = depsCache.getIfPresent(makeNonUidGlobalKey(descriptor));
            }
        }
        if (de != null) {
            // See localDependencies comment
            localDependencies.put(de.uid, de);
            localDependencies.put(key, de);
        }
        return de;
    }

    @Override
    public Set<DefDescriptor<?>> getDependencies(String uid) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            return de.dependencies;
        }
        return null;
    }

    @Override
    public List<ClientLibraryDef> getClientLibraries(String uid) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            return de.clientLibraries;
        }
        return null;
    }

    /**
     * Typesafe helper for getDef.
     * 
     * This adds new definitions (unvalidated) to the list passed in. Definitions that were previously built are simply
     * added to the local cache.
     * 
     * The quick fix exception case is actually a race condition where we previously had a set of depenendencies, and
     * something changed, making our set inconsistent. There are no guarantees that during a change all MDRs will have a
     * correct set of definitions.
     * 
     * @param descriptor the descriptor for which we need a definition.
     * @return A compilingDef for the definition, or null if not needed.
     * @throws QuickFixException if something has gone terribly wrong.
     */
    private <D extends Definition> void validateHelper(@NonNull DefDescriptor<D> descriptor) throws QuickFixException {
        CompilingDef<D> compiling = new CompilingDef<>(descriptor);
        currentCC.compiled.put(descriptor, compiling);
    }

    /**
     * Build a DE 'in place' with no tree traversal.
     */
    private <D extends Definition> void buildDE(@NonNull DependencyEntry de, @NonNull DefDescriptor<?> descriptor)
            throws QuickFixException {
        if (currentCC != null) {
            throw new AuraRuntimeException("Ugh, nested compileDE/buildDE on " + currentCC.topLevel
                    + " trying to build " + descriptor);
        }
        currentCC = new CompileContext(descriptor);
        try {
            validateHelper(descriptor);
            for (DefDescriptor<?> dd : de.dependencies) {
                validateHelper(dd);
            }
            for (CompilingDef<?> compiling : currentCC.compiled.values()) {
                if (!fillCompilingDef(compiling, currentCC.context)) {
                    throw new DefinitionNotFoundException(descriptor);
                }
            }
            finishValidation();
        } finally {
            currentCC = null;
        }
    }

    /**
     * Get a definition.
     * 
     * This does a scan of the loaded dependency entries to check if there is something to pull, otherwise, it just
     * compiles the entry. This should log a warning somewhere, as it is a dependency that was not noted.
     * 
     * @param descriptor the descriptor to find.
     * @return the corresponding definition, or null if it doesn't exist.
     * @throws QuickFixException if there is a compile time error.
     */
    @Override
    @CheckForNull
    public <D extends Definition> D getDef(@CheckForNull DefDescriptor<D> descriptor) throws QuickFixException {
        if (descriptor == null) {
            return null;
        }

        //
        // Always check for a local def before locking.
        //
        if (hasLocalDef(descriptor)) {
            return getLocalDef(descriptor);
        }
        //
        // If our current context is not null, we always want to recurse
        // in to properly include the defs. Note that in this case, we already
        // own the lock, so it can be outside the locking below.
        //
        if (currentCC != null) {
            if (currentCC.compiled.containsKey(descriptor)) {
                @SuppressWarnings("unchecked")
                CompilingDef<D> cd = (CompilingDef<D>) currentCC.compiled.get(descriptor);
                if (cd.def != null) {
                    return cd.def;
                }
            }

            //
            // If we are nested, compileDef will do the right thing.
            // This is a bit ugly though.
            //
            return compileDef(descriptor, currentCC);
        }
        rLock.lock();
        try {
            DependencyEntry de = getDE(null, descriptor);
            if (de == null) {
                for (DependencyEntry det : localDependencies.values()) {
                    if (det.dependencies != null && det.dependencies.contains(descriptor)) {
                        de = det;
                        break;
                    }
                }

                if (de == null) {
                    compileDE(descriptor);

                    @SuppressWarnings("unchecked")
                    D def = (D) defs.get(descriptor);
                    return def;
                }
            }

            //
            // found an entry.
            // In this case, throw a QFE if we have one.
            //
            if (de.qfe != null) {
                throw de.qfe;
            }

            //
            // Now we need to actually do the build..
            //
            buildDE(de, descriptor);

            @SuppressWarnings("unchecked")
            D def = (D) defs.get(descriptor);
            return def;
        } finally {
            rLock.unlock();
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> void save(@NonNull D def) {
        wLock.lock();
        try {
            getRegistryFor((DefDescriptor<D>) def.getDescriptor()).save(def);
            invalidate(def.getDescriptor());
        } finally {
            wLock.unlock();
        }
    }

    @Override
    public <D extends Definition> boolean exists(DefDescriptor<D> descriptor) {
        boolean cacheable;
        boolean regExists;

        if (hasLocalDef(descriptor)) {
            return getLocalDef(descriptor) != null;
        }
        DefRegistry<D> reg = getRegistryFor(descriptor);
        if (reg == null) {
            return false;
        }
        cacheable = reg.isCacheable() && shouldCache(descriptor);
        if (cacheable) {
            //
            // Try our various caches.
            //
            Boolean val = existsCache.getIfPresent(descriptor);
            if (val != null && val.booleanValue()) {
                return true;
            }
        }
        rLock.lock();
        try {
            if (cacheable) {
                Optional<?> opt = defsCache.getIfPresent(descriptor);
                if (opt != null) {
                    //
                    // We cache here.
                    //
                    if (opt.isPresent()) {
                        existsCache.put(descriptor, Boolean.TRUE);
                        return true;
                    } else {
                        existsCache.put(descriptor, Boolean.FALSE);
                        return false;
                    }
                }
            }
            regExists = reg.exists(descriptor);
            if (cacheable) {
                Boolean cacheVal = Boolean.valueOf(regExists);
                existsCache.put(descriptor, cacheVal);
            }
        } finally {
            rLock.unlock();
        }
        if (regExists == false) {
            // Cache negatives to avoid excessive lookups.
            defs.put(descriptor, null);
        }
        return regExists;
    }

    /**
     * This figures out based on prefix what registry this component is for, it could return null if the prefix is not
     * found.
     * 
     * Note: The generic typing here is incorrect, as in not true.
     */
    private <T extends Definition> DefRegistry<T> getRegistryFor(@NonNull DefDescriptor<T> descriptor) {
        @SuppressWarnings("unchecked")
        DefRegistry<T> reg = (DefRegistry<T>) delegateRegistries.getRegistryFor(descriptor);
        return reg;
    }

    @Override
    public <D extends Definition> void addLocalDef(D def) {
        DefDescriptor<? extends Definition> desc = def.getDescriptor();

        defs.put(desc, def);
        if (localDescs == null) {
            localDescs = Sets.newHashSet();
        }
        localDescs.add(desc);
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        DefRegistry<T> reg = getRegistryFor(descriptor);
        if (reg != null) {
            return reg.getSource(descriptor);
        }
        return null;
    }

    @Override
    public boolean namespaceExists(String ns) {
        return delegateRegistries.getAllNamespaces().contains(ns);
    }

    @Override
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def)
            throws QuickFixException {
        assertAccess(referencingDescriptor, def, accessCheckCache);
    }

    <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def,
            Cache<String, String> accessCheckCache) {
        String status = hasAccess(referencingDescriptor, def, accessCheckCache);
        if (status != null) {
            DefDescriptor<? extends Definition> descriptor = def.getDescriptor();
            String message = Aura.getConfigAdapter().isProduction() ? DefinitionNotFoundException.getMessage(
                    descriptor.getDefType(), descriptor.getName()) : status;
            throw new NoAccessException(message);
        }
    }

    @Override
    public <D extends Definition> String hasAccess(DefDescriptor<?> referencingDescriptor, D def) {
        return hasAccess(referencingDescriptor, def, accessCheckCache);
    }

    <D extends Definition> String hasAccess(DefDescriptor<?> referencingDescriptor, D def,
            Cache<String, String> accessCheckCache) {
        // If the def is access="global" or does not require authentication then anyone can see it
        DefinitionAccess access = def.getAccess();
        if (access.isGlobal() || !access.requiresAuthentication()) {
            return null;
        }

        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        String referencingNamespace = null;
        if (referencingDescriptor != null) {
            String prefix = referencingDescriptor.getPrefix();
            if (configAdapter.isUnsecuredPrefix(prefix)) {
                return null;
            }

            referencingNamespace = referencingDescriptor.getNamespace();

            // The caller is in a system namespace let them through
            if (configAdapter.isPrivilegedNamespace(referencingNamespace)) {
                return null;
            }
        }

        DefDescriptor<?> desc = def.getDescriptor();

        String namespace;
        String target;
        if (def instanceof AttributeDef) {
            AttributeDef attributeDef = (AttributeDef) def;
            DefDescriptor<? extends RootDefinition> parentDescriptor = attributeDef.getParentDescriptor();
            namespace = parentDescriptor.getNamespace();
            target = String.format("%s:%s.%s", namespace, parentDescriptor.getName(), desc.getName());
        } else {
            namespace = desc.getNamespace();
            target = String.format("%s:%s", namespace, desc.getName());
        }

        // Cache key is of the form "referencingNamespace>defNamespace:defName[.subDefName].defTypeOrdinal"
        DefType defType = desc.getDefType();
        String key = String.format("%s>%s.%d", referencingNamespace == null ? "" : referencingNamespace, target,
                defType.ordinal());
        String status = accessCheckCache.getIfPresent(key);
        if (status == null) {
            status = "";

            // Protect against re-entry
            accessCheckCache.put(key, status);

            // System.out.printf("** MDR.miss.assertAccess() cache miss for: %s\n", key);

            DefDescriptor<? extends Definition> descriptor = def.getDescriptor();
            if (!configAdapter.isUnsecuredNamespace(namespace)
                    && !configAdapter.isUnsecuredPrefix(descriptor.getPrefix())) {
                if (referencingNamespace == null || referencingNamespace.isEmpty()) {
                    status = String
                            .format("Access to %s '%s' disallowed by MasterDefRegistry.assertAccess(): referencing namespace was empty or null",
                                    defType, target);
                } else if (!referencingNamespace.equals(namespace)) {
                    // The caller and the def are not in the same namespace
                    status = String
                            .format("Access to %s '%s' from namespace '%s' in '%s(%s)' disallowed by MasterDefRegistry.assertAccess()",
                                    defType.toString().toLowerCase(), target, referencingNamespace,
                                    referencingDescriptor, referencingDescriptor.getDefType());
                }
            }

            if (!status.isEmpty()) {
                accessCheckCache.put(key, status);
            }
        } else {
            // System.out.printf("** MDR.hit.assertAccess() cache hit for: %s\n", key);
        }

        return status.isEmpty() ? null : status;
    }

    /**
     * only used by admin tools to view all registries
     */
    public DefRegistry<?>[] getAllRegistries() {
        return delegateRegistries.getAllRegistries();
    }

    /**
     * Filter the entire set of current definitions by a set of preloads.
     * 
     * This filtering is very simple, it just looks for local definitions that are not included in the preload set.
     */
    @Override
    public Map<DefDescriptor<? extends Definition>, Definition> filterRegistry(Set<DefDescriptor<?>> preloads) {
        Map<DefDescriptor<? extends Definition>, Definition> filtered;

        if (preloads == null || preloads.isEmpty()) {
            return Maps.newHashMap(defs);
        }
        filtered = Maps.newHashMapWithExpectedSize(defs.size());
        for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defs.entrySet()) {
            if (!preloads.contains(entry.getKey())) {
                filtered.put(entry.getKey(), entry.getValue());
            }
        }
        return filtered;
    }

    @Override
    public <T extends Definition> boolean invalidate(DefDescriptor<T> descriptor) {
        defs.clear();
        if (localDescs != null) {
            localDescs.clear();
        }
        localDependencies.clear();
        if (shouldCache(descriptor)) {
            depsCache.invalidateAll();
            defsCache.invalidateAll();
            existsCache.invalidateAll();
            descriptorFilterCache.invalidateAll();
        }
        return false;
    }

    private String getKey(DependencyEntry de, DefDescriptor<?> descriptor, String key) {
        return String.format("%s@%s@%s", de.uid, descriptor.getQualifiedName().toLowerCase(), key);
    }

    @Override
    public String getCachedString(String uid, DefDescriptor<?> descriptor, String key) {
        if (shouldCache(descriptor)) {
            DependencyEntry de = localDependencies.get(uid);

            if (de != null) {
                return stringsCache.getIfPresent(getKey(de, descriptor, key));
            }
        }
        return null;
    }

    @Override
    public void putCachedString(String uid, DefDescriptor<?> descriptor, String key, String value) {
        if (shouldCache(descriptor)) {
            DependencyEntry de = localDependencies.get(uid);

            if (de != null) {
                stringsCache.put(getKey(de, descriptor, key), value);
            }
        }
    }

    /**
     * Get the UID.
     * 
     * This uses some trickery to try to be efficient, including using a dual keyed local cache to avoid looking up
     * values more than once even in the absense of remembered context.
     * 
     * Note: there is no guarantee that the definitions have been fetched from cache here, so there is a very subtle
     * race condition.
     * 
     * Also note that this _MUST NOT_ be called inside of a compile, or things may get out of wack. We probably should
     * be asserting this somewhere.
     * 
     * @param uid the uid for cache lookup (null means unknown).
     * @param descriptor the descriptor to fetch.
     * @return the correct uid for the definition, or null if there is none.
     * @throws QuickFixException if the definition cannot be compiled.
     */
    @Override
    public <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor) throws QuickFixException {
        if (descriptor == null) {
            return null;
        }

        DependencyEntry de = null;

        rLock.lock();
        try {
            de = getDE(uid, descriptor);
            if (de == null) {
                try {
                    de = compileDE(descriptor);
                    //
                    // If we can't find our descriptor, we just give back a null.
                    if (de == null) {
                        return null;
                    }
                } catch (QuickFixException qfe) {
                    // try to pick it up from the cache.
                    de = getDE(null, descriptor);
                    // this should never happen.
                    if (de == null) {
                        throw new AuraRuntimeException("unexpected null on QFE");
                    }
                }
            }
        } finally {
            rLock.unlock();
        }
        if (de.qfe != null) {
            throw de.qfe;
        }
        return de.uid;
    }

    /** Creates a key for the localDependencies, using DefType and FQN. */
    private String makeLocalKey(@NonNull DefDescriptor<?> descriptor) {
        return descriptor.getDefType().toString() + ":" + descriptor.getQualifiedName().toLowerCase();
    }

    /**
     * Creates a key for the global {@link #depsCache}, using UID, type, and FQN.
     */
    private String makeGlobalKey(String uid, @NonNull DefDescriptor<?> descriptor) {
        return uid + "/" + makeLocalKey(descriptor);
    }

    /**
     * Creates a key for the global {@link #depsCache}, using only descriptor (and Mode internally).
     * 
     * @param descriptor - the descriptor use for the key
     */
    private String makeNonUidGlobalKey(@NonNull DefDescriptor<?> descriptor) {
        return makeLocalKey(descriptor);
    }

    /**
     * Return true if the namespace of the provided descriptor supports caching.
     */
    private boolean shouldCache(DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return false;
        }
        String prefix = descriptor.getPrefix();
        String namespace = descriptor.getNamespace();
        return shouldCache(prefix, namespace);
    }

    /**
     * Return true if the descriptor filter meets all requirements for the result of find to be cached
     */
    private boolean shouldCache(DescriptorFilter filter) {
        GlobMatcher p = filter.getPrefixMatch();
        String prefix = ((p.isConstant()) ? p.toString() : null);

        GlobMatcher ns = filter.getNamespaceMatch();
        String namespace = ((ns.isConstant()) ? ns.toString() : null);

        return (prefix != null || namespace != null) && shouldCache(prefix, namespace);
    }

    /**
     * Return true if the namespace supports cacheing
     */
    private boolean shouldCache(String prefix, String namespace) {
        boolean cacheable = false;
        if (namespace == null) {
            if (prefix == null) {
                cacheable = false;
            } else {
                ConfigAdapter configAdapter = Aura.getConfigAdapter();
                cacheable = configAdapter.isCacheablePrefix(prefix);
            }
        } else if (prefix == null) {
            ConfigAdapter configAdapter = Aura.getConfigAdapter();
            cacheable = configAdapter.isPrivilegedNamespace(namespace);
        } else {
            ConfigAdapter configAdapter = Aura.getConfigAdapter();
            cacheable = configAdapter.isCacheablePrefix(prefix) || configAdapter.isPrivilegedNamespace(namespace);
        }
        return cacheable;
    }

    // TODO - W-2105858 - re-enable with either the private implementation of the Cache used, or
    // a least-common-denominator implementation

    // public static Collection<Optional<? extends Definition>> getCachedDefs() {
    // return defsCache.asMap().values();
    // }
    //
    // public static CacheStats getDefsCacheStats() {
    // return defsCache.stats();
    // }
    //
    // public static CacheStats getExistsCacheStats() {
    // return existsCache.stats();
    // }
    //
    // public static CacheStats getStringsCacheStats() {
    // return stringsCache.stats();
    // }
    //
    // public static CacheStats getDescriptorFilterCacheStats() {
    // return descriptorFilterCache.stats();
    // }
}
