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

import java.io.IOException;
import java.io.StringReader;
import java.util.Collections;
import java.util.LinkedHashSet;
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
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Location;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Overall Master definition registry implementation.
 * 
 * This 'master' definition registry is actually a single threaded, per request
 * registry that caches certain things in what is effectively a thread local
 * cache. This means that once something is pulled into the local thread, it
 * will not change.
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

    private static class DependencyEntry {
        public final String uid;
        public final long lastModTime;
        public final SortedSet<DefDescriptor<?>> dependencies;

        public DependencyEntry(String uid, SortedSet<DefDescriptor<?>> dependencies, long lastModTime) {
            this.uid = uid;
            this.dependencies = Collections.unmodifiableSortedSet(dependencies);
            this.lastModTime = lastModTime;
        }
    }

    private final static Cache<String, DependencyEntry> dependencies = CacheBuilder.newBuilder()
            .initialCapacity(DEPENDENCY_CACHE_SIZE).maximumSize(DEPENDENCY_CACHE_SIZE).build();

    private final static Cache<String, String> strings = CacheBuilder.newBuilder().initialCapacity(STRING_CACHE_SIZE)
            .maximumSize(STRING_CACHE_SIZE).build();

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
     * This embodies a definition that is in the process of being compiled. It
     * stores the descriptor, definition, and the registry to which it belongs
     * to avoid repeated lookups.
     */
    private static class CompilingDef<T extends Definition> {
        public DefDescriptor<T> descriptor;
        public T def;
        public DefRegistry<T> registry;
        public Set<Definition> parents = Sets.newHashSet();

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
     * This processes a single definition in a dependency tree. It works as a
     * single step in a breadth first traversal of the tree, accumulating
     * children in the 'deps' set, and updating the compile context with the
     * current definition.
     * 
     * This handles definitions already in the local cache specially, just
     * skipping over the def and putting the children in the dependency tree.
     * Since this is a per-request entity, that should be ok.
     * 
     * Note that once the definition has been retrieved, this code uses the
     * 'canonical' descriptor from the definition, discarding the incoming
     * descriptor.
     * 
     * @param descriptor the descriptor that we are currently handling, must not
     *            be in the compiling defs.
     * @param cc the compile context to allow us to accumulate information.
     * @param deps the set of dependencies that we are accumulating.
     * @throws QuickFixException if the definition is not found, or
     *             validateDefinition() throws one.
     */
    private <D extends Definition> D getHelper(DefDescriptor<D> descriptor, CompileContext cc,
            Set<DefDescriptor<?>> deps) throws QuickFixException {
        @SuppressWarnings("unchecked")
        D def = (D) defs.get(descriptor);

        if (def != null) {
            //
            // Short circuit on something already compiled in our registry.
            // In this case, we have no need to compile this def, but we do
            // have to continue the tree walk because some defs might not be
            // cached (FIXME: we should cache all defs).
            //
            if (cc.dependencies != null && !cc.dependencies.containsKey(def.getDescriptor())) {
                def.appendDependencies(deps);
                cc.dependencies.put(def.getDescriptor(), def);
            }
            return def;
        }
        DefRegistry<D> registry = getRegistryFor(descriptor);
        CompilingDef<D> cd = cc.getCompiling(descriptor);

        if (registry != null) {
            def = registry.getDef(descriptor);
            if (def != null) {
                @SuppressWarnings("unchecked")
                DefDescriptor<D> canonical = (DefDescriptor<D>) def.getDescriptor();

                cd.descriptor = canonical;
                cd.def = def;
                cd.registry = registry;
                // cc.dependencies.put(canonical, def);
                if (!def.isValid()) {
                    cc.loggingService.incrementNum(LoggingService.DEF_COUNT);
                    // FIXME: setting the current namespace on the context seems
                    // extremely hackish
                    cc.context.setCurrentNamespace(canonical.getNamespace());
                    def.validateDefinition();
                }
                if (!defs.containsKey(def.getDescriptor())) {
                    Set<DefDescriptor<?>> newDeps = Sets.newHashSet();

                    defs.put(def.getDescriptor(), def);
                    def.appendDependencies(newDeps);
                    deps.addAll(newDeps);
                    if (cc.dependencies != null) {
                        cc.dependencies.put(canonical, def);
                    }
                    def.appendDependencies(newDeps);
                    for (DefDescriptor<?> dep : newDeps) {
                        if (!defs.containsKey(dep)) {
                            CompilingDef<?> depcd = cc.getCompiling(dep);
                            depcd.parents.add(def);
                        }
                    }
                }
                return def;
            }
        }
        //
        // At this point, we have failed to get the def, so we should throw an
        // error. The first stanza is to provide a more useful error description
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

    /**
     * Compile a single definition, finding all of the static dependencies.
     * 
     * This is the primary entry point for compiling a single definition. The
     * basic guarantees enforced here are:
     * <ol>
     * <li>Each definition has 'validateDefinition()' called on it exactly once.
     * </li>
     * <li>No definition is marked as valid until all definitions in the
     * dependency set have been validated</li>
     * <li>Each definition has 'validateReferences()' called on it exactly once,
     * after the definitions have been put in local cache</li>
     * <li>All definitions are marked valid by the DefRegistry after the
     * validation is complete</li>
     * <li>No definition should be available to other threads until it is marked
     * valid</li>
     * <ol>
     * 
     * In order to do all of this, we keep a set of 'compiling' definitions
     * locally, and use that to calculate dependencies and walk the tree.
     * Circular dependencies are handled gracefully, and no other thread can
     * interfere because everything is local.
     * 
     * FIXME: this should really cache invalid definitions and make sure that we
     * don't bother re-compiling until there is some change of state. However,
     * that is rather more complex than it sounds.... and shouldn't really
     * manifest much in a released system.
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
                    if (!cc.compiled.containsKey(cdesc) || cc.compiled.get(cdesc).def == null) {
                        getHelper(cdesc, cc, next);
                    }
                }
            }

            //
            // This is a bit odd, but necessary. We have to put the defs in our
            // local cache
            // even though they are not complete. This is so that when someone
            // tries to get
            // the defs, they will be returned from this registry. I suspect
            // that there is
            // a better way of doing this, but, well, this is all we have for
            // now.
            //
            for (CompilingDef<?> cd : cc.compiled.values()) {
                if (cd.def != null) {
                    defs.put(cd.descriptor, cd.def);
                }
            }

            //
            // Now validate our references.
            //
            for (CompilingDef<?> cd : cc.compiled.values()) {
                if (cd.def != null) {
                    // FIXME: setting the current namespace on the context seems
                    // extremely hackish
                    cc.context.setCurrentNamespace(cd.descriptor.getNamespace());
                    cd.def.validateReferences();
                }
            }

            //
            // FIXME: figure out the global version here for the def being
            // requested. Also, do
            // something useful with dependencies to figure out if it is stale.
            // If so, we'd have
            // to invalidate the whole set and start over. Rather a painful
            // thing to do.
            //

            //
            // And finally, mark everything as happily compiled.
            //
            for (CompilingDef<?> cd : cc.compiled.values()) {
                // FIXME: setting the current namespace on the context seems
                // extremely hackish
                if (cd.def != null) {
                    cc.context.setCurrentNamespace(cd.descriptor.getNamespace());
                    cd.markValid();
                    if (defs != null) {
                        defs.put(cd.descriptor, cd.def);
                    }
                }
            }
            return def;
        } finally {
            cc.loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
        }
    }

    /**
     * Internal routine to compile and return a DependencyEntry.
     */
    private <T extends Definition> DependencyEntry compileDE(DefDescriptor<T> descriptor)
            throws QuickFixException {
        Map<DefDescriptor<?>, Definition> dds = Maps.newTreeMap();
        String lk = descriptor.getQualifiedName().toLowerCase();
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

        for (Definition t : dds.values()) {
            Hash hash = t.getOwnHash();

            // TODO: we need to ensure that null hashes are ok
            if (hash != null) {
                sb.append(hash.toString());
            }
        }
        Hash global;

        try {
            global = new Hash(new StringReader(sb.toString()));
        } catch (IOException ioe) {
            throw new AuraError("StringReader IO exception", ioe);
        }
        uid = global.toString();
        //
        // Now try a re-lookup. This may catch existing cached
        // entries where uid was null.
        //
        de = getDE(uid, lk);
        if (de == null) {
            de = new DependencyEntry(uid, Sets.newTreeSet(dds.keySet()), lmt);
            dependencies.put(de.uid + lk, de);
            localDependencies.put(de.uid, de);
        }
        return de;
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

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D getDef(DefDescriptor<D> descriptor) throws QuickFixException {
        Definition def;

        if (!defs.containsKey(descriptor)) {
            //
            // Go and build the dependency tree.
            //
            if (compileDE(descriptor) == null) {
                return null;
            }
        }

        //
        // If we have stored the def in our table, use it, whether null or
        // not. Note that the above call _must_ generate a def. If it fails
        // we'll either get a null here (top level not found), or an
        // exception. Either of which will simply be sent back to the
        // caller.
        //
        def = defs.get(descriptor);

        //
        // Check authentication. All defs should really support this but right
        // now
        // it's specific to Applications, so putting this special case here
        // until
        // we have a more generic check on all defs.
        //
        // Not sure why this is here, as we should be doing something at a
        // higher level.
        //
        if (def != null && def.getDescriptor().getDefType() == DefType.APPLICATION
                && ((ApplicationDef) def).getAccess() == Access.AUTHENTICATED) {
            AuraContext context = Aura.getContextService().getCurrentContext();
            if (context.getAccess() != Access.AUTHENTICATED) {
                //
                // FIXME: Should we store this in the local table as null?
                //
                def = null;
            }
        }
        return (D) def;
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
     * This figures out based on prefix what registry this component is for, it
     * could return null if the prefix is not found.
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
            if (!securedDefTypes.contains(defType)
                    || unsecuredPrefixes.contains(prefix)
                    || unsecuredNamespaces.contains(ns)
                    || (mode != Mode.PROD && (!Aura.getConfigAdapter().isProduction()) && unsecuredNonProductionNamespaces
                            .contains(ns))) {
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
     * This filtering is very simple, it just looks for local definitions that
     * are not included in the preload set.
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
        if (localDependencies.containsKey(descriptor)) {
            localDependencies.remove(descriptor);
        }
        // TODO: this should be optimized.
        dependencies.invalidateAll();
        // TODO: need to remove from the registries.
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
     * Get a dependency entry for a given uid.
     *
     * This is a convenience routine to check both the local and global
     * cache for a value.
     *
     * @param uid the uid (must not be null).
     * @param lk the lower case descriptor name.
     * @return the DependencyEntry or null if none present.
     */
    private DependencyEntry getDE(String uid, String lk) {
        DependencyEntry de = localDependencies.get(uid);
        if (de != null) {
            return de;
        }
        de = dependencies.getIfPresent(uid + lk);
        if (de != null) {
            localDependencies.put(uid, de);
            return de;
        }
        return null;
    }

    /**
     * Get the UID.
     *
     * @param uid the uid expected (null means unknown).
     * @param descriptor the descriptor to fetch.
     */
    @Override
    public <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor) throws QuickFixException,
            ClientOutOfSyncException {
        DependencyEntry de = null;
        String lk = descriptor.getQualifiedName().toLowerCase();

        if (uid != null) {
            de = getDE(uid, lk);
        }
        if (de == null) {
            de = compileDE(descriptor);
            if (uid != null && !uid.equals(de.uid)) {
                throw new ClientOutOfSyncException("Mismatched UIDs expected '"+de.uid+"' got '"+uid+"'");
            }
        }
        if (de != null) {
            return de.uid;
        }
        return null;
    }
}
