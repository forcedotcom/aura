/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Location;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Overall Master definition registry implementation, there be dragons here.
 * 
 * This 'master' definition registry is actually a single threaded, per request registry that caches certain things in
 * what is effectively a thread local cache. This means that once something is pulled into the local thread, it will not
 * change.
 * 
 */
public class MasterDefRegistryImpl implements MasterDefRegistry {
    private static final Set<DefType> securedDefTypes = Sets.immutableEnumSet(DefType.APPLICATION, DefType.COMPONENT,
            DefType.CONTROLLER, DefType.ACTION);
    private static final Set<String> unsecuredPrefixes = ImmutableSet.of("aura");
    private static final Set<String> unsecuredNamespaces = ImmutableSet.of("aura", "ui", "os", "auradev",
            "org.auraframework");
    private static final Set<String> unsecuredNonProductionNamespaces = ImmutableSet.of("auradev");

    private final static int DEPENDENCY_CACHE_SIZE = 100;
    private final static int STRING_CACHE_SIZE = 100;

    /**
     * A dependency entry for a uid+descriptor.
     * 
     * This entry is created for each descriptor that a context uses at the top level. It is cached globally and
     * locally. The second version of the entry (with a quick fix) is only ever cached locally.
     * 
     * all values are final, and unmodifiable.
     */
    private static class DependencyEntry {
        public final String uid;
        public final long lastModTime;
        public final SortedSet<DefDescriptor<?>> dependencies;
        public final QuickFixException qfe;

        public DependencyEntry(String uid, SortedSet<DefDescriptor<?>> dependencies, long lastModTime) {
            this.uid = uid;
            this.dependencies = Collections.unmodifiableSortedSet(dependencies);
            this.lastModTime = lastModTime;
            this.qfe = null;
        }

        public DependencyEntry(QuickFixException qfe) {
            this.uid = null;
            this.dependencies = null;
            this.lastModTime = 0;
            this.qfe = qfe;
        }

        @Override
        public String toString() {
            StringBuffer sb = new StringBuffer();

            sb.append(uid);
            sb.append(" : ");
            if (qfe != null) {
                sb.append(qfe);
            } else {
                sb.append("[");
                sb.append(lastModTime);
                sb.append("] :");
                sb.append(dependencies);
            }
            return sb.toString();
        }
    }

    private final static Cache<String, DependencyEntry> dependencies = CacheBuilder.newBuilder()
            .initialCapacity(DEPENDENCY_CACHE_SIZE).maximumSize(DEPENDENCY_CACHE_SIZE).build();

    private final static Cache<String, String> strings = CacheBuilder.newBuilder().initialCapacity(STRING_CACHE_SIZE)
            .maximumSize(STRING_CACHE_SIZE).build();

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
    private final Map<String, DependencyEntry> localDependencies = Maps.newHashMap();

    private final RegistryTrie delegateRegistries;

    private final Map<DefDescriptor<?>, Definition> defs = Maps.newLinkedHashMap();

    private final Set<DefDescriptor<?>> accessCache = Sets.newLinkedHashSet();

    private SecurityProviderDef securityProvider;

    public MasterDefRegistryImpl(DefRegistry<?>... registries) {
        delegateRegistries = new RegistryTrie(registries);
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefRegistry<?>> registries = delegateRegistries.getRegistries(matcher);
        Set<DefDescriptor<?>> matched = Sets.newHashSet();

        for (DefRegistry<?> reg : registries) {
            //
            // This could be a little dangerous, but unless we force all of our
            // registries to implement find, this is necessary.
            //
            if (reg.hasFind()) {
                matched.addAll(reg.find(matcher));
            }
        }
        return matched;
    }

    @Override
    public <D extends Definition> Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) {
        if (matcher.getNamespace().equals("*")) {
            Set<DefDescriptor<D>> matchingDesc = new LinkedHashSet<DefDescriptor<D>>();
            String qualifiedNamePattern = null;
            switch (matcher.getDefType()) {
            case CONTROLLER:
            case TESTSUITE:
            case MODEL:
            case RENDERER:
            case HELPER:
            case STYLE:
            case TYPE:
            case PROVIDER:
            case SECURITY_PROVIDER:
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
            case DOCUMENTATION:
            case LAYOUTS:
            case NAMESPACE:
                qualifiedNamePattern = "%s://%s:%s";
                break;
            case ACTION:
                // TODO: FIXME
                throw new AuraRuntimeException("Find on ACTION defs not supported.");
            }
            for (String namespace : delegateRegistries.getAllNamespaces()) {
                String qualifiedName = String.format(qualifiedNamePattern,
                        matcher.getPrefix() != null ? matcher.getPrefix() : "*", namespace,
                        matcher.getName() != null ? matcher.getName() : "*");
                @SuppressWarnings("unchecked")
                DefDescriptor<D> namespacedMatcher = (DefDescriptor<D>) DefDescriptorImpl.getInstance(qualifiedName,
                        matcher.getDefType().getPrimaryInterface());
                DefRegistry<D> registry = getRegistryFor(namespacedMatcher);
                if (registry != null) {
                    matchingDesc.addAll(registry.find(namespacedMatcher));
                }
            }
            return matchingDesc;
        } else {
            return getRegistryFor(matcher).find(matcher);
        }
    }

    /**
     * A compiling definition.
     * 
     * This embodies a definition that is in the process of being compiled. It stores the descriptor, definition, and
     * the registry to which it belongs to avoid repeated lookups.
     */
    private static class CompilingDef<T extends Definition> {
        /**
         * The descriptor we are compiling.
         */
        public DefDescriptor<T> descriptor;

        /**
         * The compiled def.
         * 
         * Should be non-null by the end of compile.
         */
        public T def;

        /**
         * The registry associated with the def.
         */
        public DefRegistry<T> registry;

        /**
         * All of the parents (needed in the case that we fail).
         */
        public Set<Definition> parents = Sets.newHashSet();

        /**
         * Did we build this definition?.
         * 
         * If this is true, we need to do the validation steps after finishing.
         */
        public boolean built = false;

        public void markValid() {
            if (def != null) {
                registry.markValid(descriptor, def);
            }
        }
    }

    /**
     * The compile context.
     * 
     * FIXME: the AuraContext is only needed for 'setNamepace()'.
     * 
     * This class holds the local information necessary for compilation.
     */
    private static class CompileContext {
        public final AuraContext context = Aura.getContextService().getCurrentContext();
        public final LoggingService loggingService = Aura.getLoggingService();
        public final Map<DefDescriptor<? extends Definition>, CompilingDef<?>> compiled = Maps.newHashMap();
        public final Map<DefDescriptor<? extends Definition>, Definition> dependencies;
        public boolean addedPreloads = false;

        // public final Map<DefDescriptor<? extends Definition>, Definition>
        // dependencies = Maps.newHashMap();
        public CompileContext(Map<DefDescriptor<? extends Definition>, Definition> dependencies) {
            this.dependencies = dependencies;
        }

        public <D extends Definition> CompilingDef<D> getCompiling(DefDescriptor<D> descriptor) {
            @SuppressWarnings("unchecked")
            CompilingDef<D> cd = (CompilingDef<D>) compiled.get(descriptor);
            if (cd == null) {
                cd = new CompilingDef<D>();
                compiled.put(descriptor, cd);
            }
            cd.descriptor = descriptor;
            return cd;
        }
    }

    /**
     * A private helper routine to make the compiler code more sane.
     * 
     * This processes a single definition in a dependency tree. It works as a single step in a breadth first traversal
     * of the tree, accumulating children in the 'deps' set, and updating the compile context with the current
     * definition.
     * 
     * Note that once the definition has been retrieved, this code uses the 'canonical' descriptor from the definition,
     * discarding the incoming descriptor.
     * 
     * @param descriptor the descriptor that we are currently handling, must not be in the compiling defs.
     * @param cc the compile context to allow us to accumulate information.
     * @param deps the set of dependencies that we are accumulating.
     * @throws QuickFixException if the definition is not found, or validateDefinition() throws one.
     */
    private <D extends Definition> D getHelper(DefDescriptor<D> descriptor, CompileContext cc,
            Set<DefDescriptor<?>> deps) throws QuickFixException {
        @SuppressWarnings("unchecked")
        D def = (D) defs.get(descriptor);
        CompilingDef<D> cd = cc.getCompiling(descriptor);
        DefRegistry<D> registry = null;

        if (cd.def != null) {
            return cd.def;
        }
        if (def == null) {
            registry = getRegistryFor(descriptor);
            if (registry != null) {
                def = registry.getDef(descriptor);
            }
            if (def == null) {
                //
                // At this point, we have failed to get the def, so we should
                // throw an
                // error. The first stanza is to provide a more useful error
                // description
                // including the set of components using the missing component.
                //
                if (!cd.parents.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    Location handy = null;
                    for (Definition parent : cd.parents) {
                        handy = parent.getLocation();
                        if (sb.length() != 0) {
                            sb.append(", ");
                        }
                        sb.append(parent.getDescriptor().toString());
                    }
                    throw new DefinitionNotFoundException(descriptor, handy, sb.toString());
                }
                throw new DefinitionNotFoundException(descriptor);
            }
        }
        //
        // Ok. We have a def. let's figure out what to do with it.
        //
        @SuppressWarnings("unchecked")
        DefDescriptor<D> canonical = (DefDescriptor<D>) def.getDescriptor();
        Set<DefDescriptor<?>> newDeps = Sets.newHashSet();

        //
        // Make sure all of our fields are correct in our compiling def.
        //
        cd.def = def;
        cd.descriptor = canonical;
        cd.registry = registry;

        if (!def.isValid()) {
            //
            // If our def is not 'valid', we must have built it, which means we
            // need
            // to validate. There is a subtle race condition here where more
            // than one
            // thread can grab a def from a registry, and they may all validate.
            //
            cd.built = true;
            if (cd.registry == null) {
                cd.registry = getRegistryFor(descriptor);
            }
            cc.loggingService.incrementNum(LoggingService.DEF_COUNT);
            // FIXME: setting the current namespace on the context seems
            // extremely hackish
            cc.context.setCurrentNamespace(canonical.getNamespace());
            def.validateDefinition();
        }
        //
        // Store the def locally.
        //
        defs.put(canonical, def);
        def.appendDependencies(newDeps);
        //
        // FIXME: this code will go away with preloads.
        // This pulls in the context preloads. not pretty, but it works.
        //
        if (!cc.addedPreloads && canonical.getDefType().equals(DefType.APPLICATION)) {
            cc.addedPreloads = true;
            Set<String> preloads = cc.context.getPreloads();
            for (String preload : preloads) {
                if (!preload.contains("_")) {
                    DependencyDefImpl.Builder ddb = new DependencyDefImpl.Builder();
                    ddb.setResource(preload);
                    ddb.setType("APPLICATION,COMPONENT,STYLE,EVENT");
                    ddb.build().appendDependencies(newDeps);
                }
            }
        }
        for (DefDescriptor<?> dep : newDeps) {
            if (!defs.containsKey(dep)) {
                CompilingDef<?> depcd = cc.getCompiling(dep);
                depcd.parents.add(def);
            }
        }
        deps.addAll(newDeps);
        cc.dependencies.put(canonical, def);
        return def;
    }

    /**
     * finish up the validation of a set of compiling defs.
     * 
     * @param context only needed to do setCurrentNamspace.
     */
    private void finishValidation(AuraContext context, Collection<CompilingDef<?>> compiling) throws QuickFixException {
        //
        // Now validate our references.
        //
        for (CompilingDef<?> cd : compiling) {
            if (cd.built) {
                // FIXME: setting the current namespace on the context seems extremely hackish
                context.setCurrentNamespace(cd.descriptor.getNamespace());
                cd.def.validateReferences();
            }
        }

        //
        // And finally, mark everything as happily compiled.
        //
        for (CompilingDef<?> cd : compiling) {
            // FIXME: setting the current namespace on the context seems extremely hackish
            if (cd.built) {
                context.setCurrentNamespace(cd.descriptor.getNamespace());
                cd.markValid();
                defs.put(cd.descriptor, cd.def);
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
    protected <D extends Definition> D compileDef(DefDescriptor<D> descriptor,
            Map<DefDescriptor<?>, Definition> dependencies) throws QuickFixException {
        Set<DefDescriptor<?>> next = Sets.newHashSet();
        CompileContext cc = new CompileContext(dependencies);
        D def;

        cc.loggingService.startTimer(LoggingService.TIMER_DEFINITION_CREATION);
        try {
            //
            // FIXME: in the event of a compiled def, we should be done at the
            // first fetch, though realistically,
            // this should require that all defs be cached, or we _will_ break.
            //
            // First, walk all dependencies, compiling them with
            // validateDefinition.
            // and accumulating the set in a local map.
            //
            try {
                def = getHelper(descriptor, cc, next);
            } catch (DefinitionNotFoundException dnfe) {
                //
                // ignore a nonexistent def here.
                // This fits the description of the routine, but it seems a bit
                // silly.
                //
                defs.put(descriptor, null);
                return null;
            }
            //
            // This loop accumulates over a breadth first traversal of the
            // dependency tree.
            // All child definitions are added to the 'next' set, while walking
            // the 'current'
            // set.
            //
            while (next.size() > 0) {
                Set<DefDescriptor<?>> current = next;
                next = Sets.newHashSet();
                for (DefDescriptor<?> cdesc : current) {
                    getHelper(cdesc, cc, next);
                }
            }

            finishValidation(cc.context, cc.compiled.values());
            return def;
        } finally {
            cc.loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
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
     * @return the definition compiled from the descriptor, or null if not found.
     * @throws QuickFixException if the definition failed to compile.
     */
    private <T extends Definition> DependencyEntry compileDE(DefDescriptor<T> descriptor) throws QuickFixException {
        // See localDependencies comment
        String key = makeLocalKey(descriptor);
        try {
            Map<DefDescriptor<?>, Definition> dds = Maps.newTreeMap();
            Definition def = compileDef(descriptor, dds);
            DependencyEntry de;
            String uid;
            long lmt = 0;

            if (def == null) {
                return null;
            }
            for (Definition t : dds.values()) {
                if (t.getLocation() != null && t.getLocation().getLastModified() > lmt) {
                    lmt = t.getLocation().getLastModified();
                }
            }
            StringBuilder sb = new StringBuilder(dds.size() * 20);

            //
            // Calculate our hash based on the descriptors and their hashes (if
            // any).
            // This uses a promise, and the string builder methods of Hash.
            //
            Hash.StringBuilder globalBuilder = new Hash.StringBuilder();
            for (Map.Entry<DefDescriptor<?>, Definition> entry : dds.entrySet()) {
                sb.setLength(0);
                sb.append(entry.getKey().getQualifiedName().toLowerCase());
                sb.append("|");
                String hash = entry.getValue().getOwnHash();
                if (hash != null) {
                    // TODO: we need to ensure that null hashes are ok
                    sb.append(hash.toString());
                }
                sb.append(",");
                globalBuilder.addString(sb.toString());
            }
            uid = globalBuilder.build().toString();
            //
            // Now try a re-lookup. This may catch existing cached
            // entries where uid was null.
            //
            // TODO : this breaks last mod time tests, as it causes the mod time
            // to stay at the first compile time. We should phase out last mod
            // time, and then re-instantiate this code.
            //
            // de = getDE(uid, key);
            // if (de == null) {
            de = new DependencyEntry(uid, Sets.newTreeSet(dds.keySet()), lmt);
            dependencies.put(makeGlobalKey(de.uid, descriptor), de);
            // See localDependencies comment
            localDependencies.put(de.uid, de);
            localDependencies.put(key, de);
            // }
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
    private DependencyEntry getDE(String uid, DefDescriptor<?> descriptor) {
        // See localDependencies comment
        String key = makeLocalKey(descriptor);
        if (uid != null) {
            DependencyEntry de = localDependencies.get(uid);
            if (de != null) {
                return de;
            }
            de = dependencies.getIfPresent(makeGlobalKey(uid, descriptor));
            if (de != null) {
                // See localDependencies comment
                localDependencies.put(uid, de);
                localDependencies.put(key, de);
                return de;
            }
            return null;
        } else {
            // See localDependencies comment
            return localDependencies.get(key);
        }
    }

    /**
     * Get a definition from a registry, and build a compilingDef if needed.
     * 
     * This retrieves the definition, and if it is validated, simply puts it in the local cache, otherwise, it builds a
     * CompilingDef for it, and returns that for further processing.
     * 
     * @param context The aura context for the compiling def.
     * @param descriptor the descriptor for which we need a definition.
     * @return A compilingDef for the definition, or null if not needed.
     */
    private <D extends Definition> CompilingDef<D> validateHelper(AuraContext context, DefDescriptor<D> descriptor)
            throws QuickFixException {
        DefRegistry<D> registry = null;
        D def;

        registry = getRegistryFor(descriptor);
        def = registry.getDef(descriptor);
        if (!def.isValid()) {
            CompilingDef<D> cd = new CompilingDef<D>();
            //
            // If our def is not 'valid', we must have built it, which means we need
            // to validate. There is a subtle race condition here where more than one
            // thread can grab a def from a registry, and they may all validate.
            //
            context.setCurrentNamespace(def.getDescriptor().getNamespace());
            def.validateDefinition();
            cd.def = def;
            cd.registry = registry;
            cd.built = true;
            cd.descriptor = descriptor;
            return cd;
        } else {
            defs.put(descriptor, def);
        }
        return null;
    }

    @Override
    public <T extends Definition> long getLastMod(String uid) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            return de.lastModTime;
        }
        return 0;
    }

    @Override
    public <T extends Definition> Set<DefDescriptor<?>> getDependencies(String uid) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            return de.dependencies;
        }
        return null;
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
    public <D extends Definition> D getDef(DefDescriptor<D> descriptor) throws QuickFixException {
        if (descriptor == null) {
            return null;
        }
        if (defs.containsKey(descriptor)) {
            @SuppressWarnings("unchecked")
            D def = (D) defs.get(descriptor);
            return def;
        }
        DependencyEntry de = getDE(null, descriptor);
        if (de == null) {
            for (DependencyEntry det : localDependencies.values()) {
                if (det.dependencies != null && det.dependencies.contains(descriptor)) {
                    de = det;
                    break;
                }
            }
        }
        if (de == null) {
            //
            // Not in any dependecies.
            // This is often a bug, and should be logged.
            //
            compileDE(descriptor);
            @SuppressWarnings("unchecked")
            D def = (D) defs.get(descriptor);
            return def;
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
        List<CompilingDef<?>> compiled = Lists.newArrayList();
        AuraContext context = Aura.getContextService().getCurrentContext();
        for (DefDescriptor<?> dd : de.dependencies) {
            CompilingDef<?> def = validateHelper(context, dd);
            if (def != null) {
                compiled.add(def);
            }
        }
        finishValidation(context, compiled);
        @SuppressWarnings("unchecked")
        D def = (D) defs.get(descriptor);
        return def;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> void save(D def) {
        getRegistryFor((DefDescriptor<D>) def.getDescriptor()).save(def);
        defs.remove(def.getDescriptor());
    }

    @Override
    public <D extends Definition> boolean exists(DefDescriptor<D> descriptor) {
        if (defs.containsKey(descriptor)) {
            return true;
        }
        DefRegistry<D> reg = getRegistryFor(descriptor);
        return reg != null && reg.exists(descriptor);
    }

    /**
     * This figures out based on prefix what registry this component is for, it could return null if the prefix is not
     * found.
     */
    @SuppressWarnings("unchecked")
    private <T extends Definition> DefRegistry<T> getRegistryFor(DefDescriptor<T> descriptor) {
        return (DefRegistry<T>) delegateRegistries.getRegistryFor(descriptor);
    }

    @Override
    public <D extends Definition> void addLocalDef(D def) {
        defs.put(def.getDescriptor(), def);
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

    /**
     * Get a security provider for the application.
     * 
     * This should probably catch the quick fix exception and simply treat it as a null security provider. This caches
     * the security provider.
     * 
     * @return the sucurity provider for the application or null if none.
     * @throws QuickFixException if there was a problem compiling.
     */
    private SecurityProviderDef getSecurityProvider() throws QuickFixException {
        if (securityProvider == null) {
            DefDescriptor<? extends BaseComponentDef> rootDesc = Aura.getContextService().getCurrentContext()
                    .getApplicationDescriptor();
            SecurityProviderDef securityProviderDef = null;
            if (rootDesc != null && rootDesc.getDefType().equals(DefType.APPLICATION)) {
                ApplicationDef root = (ApplicationDef) getDef(rootDesc);
                if (root != null) {
                    DefDescriptor<SecurityProviderDef> securityDesc = root.getSecurityProviderDefDescriptor();
                    if (securityDesc != null) {
                        securityProviderDef = getDef(securityDesc);
                    }
                }
            }
            securityProvider = securityProviderDef;
        }
        return securityProvider;
    }

    @Override
    public void assertAccess(DefDescriptor<?> desc) throws QuickFixException {

        if (!accessCache.contains(desc)) {
            Aura.getLoggingService().incrementNum("SecurityProviderCheck");
            DefType defType = desc.getDefType();
            String ns = desc.getNamespace();
            AuraContext context = Aura.getContextService().getCurrentContext();
            Mode mode = context.getMode();
            String prefix = desc.getPrefix();
            //
            // This breaks encapsulation! -gordon
            //
            boolean isTopLevel = desc.equals(context.getApplicationDescriptor());

            if (isTopLevel) {
                //
                // If we are trying to access the top level component, we need to ensure
                // that it is _not_ abstract.
                //
                BaseComponentDef def = getDef(context.getApplicationDescriptor());
                if (def != null && def.isAbstract() && def.getProviderDescriptor() == null) {
                    throw new NoAccessException(String.format("Access to %s disallowed. Abstract definition.", desc));
                }
            }
            //
            // If this is _not_ the top level, we allow circumventing the security provider.
            // This means that certain things will short-circuit, hopefully making checks faster...
            // Not sure if this is premature optimization or not.
            //
            if (!isTopLevel || desc.getDefType().equals(DefType.COMPONENT)) {
                if (!securedDefTypes.contains(defType)
                        || unsecuredPrefixes.contains(prefix)
                        || unsecuredNamespaces.contains(ns)
                        || (mode != Mode.PROD && (!Aura.getConfigAdapter().isProduction())
                            && unsecuredNonProductionNamespaces .contains(ns))) {
                    accessCache.add(desc);
                    return;
                }

                if (ns != null && DefDescriptor.JAVA_PREFIX.equals(prefix)) {
                    // handle java packages that have namespaces like aura.impl.blah
                    for (String okNs : unsecuredNamespaces) {
                        if (ns.startsWith(okNs)) {
                            accessCache.add(desc);
                            return;
                        }
                    }
                }
            }

            SecurityProviderDef securityProviderDef = getSecurityProvider();
            if (securityProviderDef == null) {
                if (mode != Mode.PROD && !Aura.getConfigAdapter().isProduction()) {
                    accessCache.add(desc);
                    return;
                } else {
                    throw new NoAccessException(String.format("Access to %s disallowed.  No Security Provider found.",
                            desc));
                }
            } else {
                if (!securityProviderDef.isAllowed(desc)) {
                    throw new NoAccessException(String.format("Access to %s disallowed by %s", desc,
                            securityProviderDef.getDescriptor().getName()));
                }
            }
            accessCache.add(desc);
        }
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
        localDependencies.clear();
        dependencies.invalidateAll();
        return false;
    }

    private String getKey(DependencyEntry de, DefDescriptor<?> descriptor, String key) {
        return String.format("%s@%s@%s", de.uid, descriptor.getQualifiedName().toLowerCase(), key);
    }

    @Override
    public <T extends Definition> String getCachedString(String uid, DefDescriptor<?> descriptor, String key) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            return strings.getIfPresent(getKey(de, descriptor, key));
        }
        return null;
    }

    @Override
    public <T extends Definition> void putCachedString(String uid, DefDescriptor<?> descriptor, String key, String value) {
        DependencyEntry de = localDependencies.get(uid);

        if (de != null) {
            strings.put(getKey(de, descriptor, key), value);
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
        if (de.qfe != null) {
            throw de.qfe;
        }
        return de.uid;
    }

    /** Creates a key for the localDependencies, using DefType and FQN. */
    private String makeLocalKey(DefDescriptor<?> descriptor) {
        return descriptor.getDefType().toString() + ":" + descriptor.getQualifiedName().toLowerCase();
    }

    /**
     * Creates a key for the global {@link #dependencies}, using UID, type, and FQN.
     */
    private String makeGlobalKey(String uid, DefDescriptor<?> descriptor) {
        return uid + "/" + makeLocalKey(descriptor);
    }
}
