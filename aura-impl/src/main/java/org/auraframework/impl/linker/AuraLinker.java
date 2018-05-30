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
package org.auraframework.impl.linker;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BundleDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.validation.ReferenceValidationContextImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraLocalStore;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Location;
import org.auraframework.system.RegistrySet;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * The linker.
 *
 * This class embodies the way that aura resolves references and validates definitions. This code is neither simple
 * nor easy to change. In the event that you wish to muck around in here, please enable the test
 * AuraLinkerTest.testLinkOrderConsistencyRandom and run it to ensure sort stability.
 */
public class AuraLinker {
    private final List<ClientLibraryDef> clientLibs;
    private final DefDescriptor<? extends Definition> topLevel;
    private final RegistrySet registries;
    private final LoggingService loggingService;
    private final AuraLocalStore localStore;
    private final ConfigAdapter configAdapter;
    private final Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
    private final Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> descriptorCache;
    private final Map<String, String> accessCheckCache;

    private final Map<DefDescriptor<? extends Definition>, LinkingDefinition<?>> linked = Maps.newHashMap();
    private final Map<DefDescriptor<? extends Definition>, Definition> subDefinitions = Maps.newHashMap();

    private final AccessChecker accessChecker;

    /**
     * The 'level' in the dependency tree.
     */
    private int level;

    /**
     * Is it possible to cache dependencies for the linking definition.
     */
    private boolean shouldCacheDependencies;

    public AuraLinker(DefDescriptor<? extends Definition> topLevel,
            Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache,
            Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> descriptorCache,
            LoggingService loggingService, ConfigAdapter configAdapter,
            AccessChecker accessChecker, AuraLocalStore localStore,
            Map<String, String> accessCheckCache,
            RegistrySet registrySet) {

        this.defsCache = defsCache;
        this.registries = registrySet;
        this.accessCheckCache = accessCheckCache;
        this.clientLibs = Lists.newArrayList();
        this.topLevel = topLevel;
        this.level = 0;
        this.shouldCacheDependencies = true;
        this.descriptorCache = descriptorCache;
        this.loggingService = loggingService;
        this.configAdapter = configAdapter;
        this.accessChecker = accessChecker;
        this.localStore = localStore;
    }

    public DefDescriptor<?> getTopLevel() {
        return topLevel;
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
    public <D extends Definition> D linkDefinition(@Nonnull DefDescriptor<D> descriptor) throws QuickFixException {
        return linkDefinition(descriptor, false);
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
     * @param nested are we being called from a nested call into getDefinition (should not happen).
     */
    @CheckForNull
    public <D extends Definition> D linkDefinition(@Nonnull DefDescriptor<D> descriptor,
            boolean nested) throws QuickFixException {
        D def;

        if (!nested) {
            loggingService.startTimer(LoggingService.TIMER_DEFINITION_CREATION);
        }
        try {
            Set<DefDescriptor<?>> stack = Sets.newLinkedHashSet();
            def = getHelper(descriptor, stack, null);
            if (!nested) {
                finishValidation();
            }
            return def;
        } finally {
            if (!nested) {
                loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
            }
        }
    }

    /**
     * HACK! Allow people to get a definition during linking.
     */
    public <D extends Definition> D getDefinitionDuringLink(DefDescriptor<D> descriptor) throws QuickFixException {
        @SuppressWarnings("unchecked")
        LinkingDefinition<D> cd = (LinkingDefinition<D>) linked.get(descriptor);
        if (cd == null) {
            //
            // This should never be used, as it means we are getting a definition that was
            // not added to the tree.
            //
            return linkDefinition(descriptor, true);
        }
        if (cd.def == null) {
            fillLinkingDefinition(cd);
        }
        return cd.def;
    }

    private <D extends Definition> void addEntry(DefDescriptor<D> dd, Definition def) {
        @SuppressWarnings("unchecked")
        D realDef = (D)def;
        LinkingDefinition<D> cd = getLinkingDef(dd);
        cd.def = realDef;
    }

    /**
     * Add a set of definitions to the local cache.
     */
    public void addMap(Map<DefDescriptor<? extends Definition>,Definition> toAdd) {
        for (Map.Entry<DefDescriptor<? extends Definition>,Definition> entry : toAdd.entrySet()) {
            addEntry(entry.getKey(), entry.getValue());
        }
    }

    public void warmDefinitions(Collection<DefDescriptor<?>> descriptors) {
        for (DefDescriptor<?> descriptor : descriptors) {
            if (!linked.containsKey(descriptor) && defsCache.getIfPresent(descriptor) == null) {
                try {
                    linkDefinition(descriptor, false);
                } catch (Throwable t) {
                    // we totally ignore errors, we are just trying to warm the caches.
                    cleanupValidation();
                }
            }
        }
    }

    public boolean getShouldCacheDependencies() {
        return shouldCacheDependencies;
    }

    public List<ClientLibraryDef> getClientLibs() {
        return clientLibs;
    }

    private void cleanupValidation() {
        //
        // !!!EXTREMELY HACKISH!!!!
        // walk all defs, and if they are not validated, force a JavaScript validation.
        // This is a last resort, attempting to catch anything that fails above. This is
        // bad juju.
        //
        int iteration = 0;
        List<LinkingDefinition<?>> compiling = null;
        do {
            compiling = Lists.newArrayList(linked.values());
            Map<DefDescriptor<? extends Definition>,Definition> accessible = Maps.newHashMap();
            linked.values().stream().forEach(cd -> accessible.put(cd.descriptor, cd.def));
            ReferenceValidationContext validationContext = new ReferenceValidationContextImpl(accessible);

            for (LinkingDefinition<?> cd : compiling) {
                if (cd.def == null) {
                    if (linked.containsKey(cd.descriptor)) {
                        linked.remove(cd.descriptor);
                    }
                    continue;
                }
                validationContext.setReferencingDescriptor(cd.descriptor);
                if (cd.built && !cd.validated) {
                    if (iteration != 0) {
                        loggingService.warn("warmCaches: Nested add of " + cd.descriptor);
                    }
                    try {
                        cd.def.validateReferences(validationContext);
                    } catch (Throwable t) {
                        loggingService.warn("warmCaches: Failed to validate "+cd.descriptor, t);
                    }
                    // Always mark as validated to avoid future complaints.
                    cd.validated = true;
                }
            }
            iteration += 1;
        } while (compiling.size() < linked.size());
    }

    /**
     * A private helper routine to make the compiler code more sane.
     *
     * @param descriptor the descriptor that we are currently handling, must not be in the compiling defs.
     * @param stack the incoming stack (linked hash set, so order is preserved).
     * @param parent the direct parent of the definition we are looking up.
     * @throws QuickFixException if the definition is not found, or validateDefinition() throws one.
     */
    private <D extends Definition> D getHelper(@Nonnull DefDescriptor<D> descriptor,
            @Nonnull Set<DefDescriptor<?>> stack, @CheckForNull Definition parent) throws QuickFixException {
        loggingService.incrementNum(LoggingService.DEF_VISIT_COUNT);
        LinkingDefinition<D> linkingDef = getLinkingDef(descriptor);
        try {
            if (stack.contains(descriptor)) {
                // System.out.println("cycle at "+stack+" "+descriptor);
                return null;
            }
            if (level > linkingDef.level) {
                linkingDef.level = level;
            } else {
                if (linkingDef.def != null) {
                    return linkingDef.def;
                }
            }
            level += 1;
            stack.add(descriptor);
            try {
                //
                // careful here. We don't just return with the non-null def because that breaks our levels.
                // We need to walk the whole tree, which is unfortunate perf-wise.
                //
                if (linkingDef.def == null) {
                    if (!fillLinkingDefinition(linkingDef)) {
                        // No def. Blow up.
                        Location l = null;
                        if (parent != null) {
                            l = parent.getLocation();
                        }
                        stack.remove(descriptor);
                        String stackInfo = null;
                        if (stack.size() > 0) {
                            stackInfo = stack.toString();
                        }
                        throw new DefinitionNotFoundException(descriptor, l, stackInfo);
                    }
                    // get client libs
                    if (clientLibs != null && linkingDef.def instanceof BaseComponentDef) {
                        BaseComponentDef baseComponent = (BaseComponentDef) linkingDef.def;
                        baseComponent.addClientLibs(clientLibs);
                    }
                }

                Set<DefDescriptor<?>> newDeps = linkingDef.def.getDependencySet();

                for (DefDescriptor<?> dep : newDeps) {
                    getHelper(dep, stack, linkingDef.def);
                }

                return linkingDef.def;
            } finally {
                level -= 1;
                stack.remove(descriptor);
            }
        } finally {
            if (parent != null && linkingDef.def != null) {
                accessChecker.assertAccess(parent.getDescriptor(), linkingDef.def, accessCheckCache);
            }
        }
    }


    /**
     * finish up the validation of a set of compiling defs.
     *
     */
    private void finishValidation() throws QuickFixException {
        int iteration = 0;
        List<LinkingDefinition<?>> compiling = null;

        //
        // Validate our references. This part is uh, painful.
        // Turns out that validating references can pull in things we didn't see, so we
        // loop infinitely... or at least a few times.
        //
        // This can be changed once we remove the ability to nest, as we will never allow
        // this. That way we won't have to copy our list so many times.
        //
        // The ability to nest is nearly gone, meaning that this will get much simpler.
        //
        do {
            compiling = Lists.newArrayList(linked.values());

            Map<DefDescriptor<? extends Definition>,Definition> accessible = Maps.newHashMap();
            linked.values().stream().forEach(linkingDef -> accessible.put(linkingDef.descriptor, linkingDef.def));
            ReferenceValidationContext validationContext = new ReferenceValidationContextImpl(accessible);

            for (LinkingDefinition<?> linkingDef : compiling) {
                validationContext.setReferencingDescriptor(linkingDef.descriptor);
                if (linkingDef.built && !linkingDef.validated) {
                    if (iteration != 0) {
                        // loggingService.warn("Nested add of " + linkingDef.descriptor + " during validation of "
                        //        + topLevel);
                        // throw new
                        // AuraRuntimeException("Nested add of "+linkingDef.descriptor+" during validation of "+topLevel);
                    }
                    linkingDef.def.validateReferences(validationContext);
                    linkingDef.validated = true;
                }
            }
            iteration += 1;
        } while (compiling.size() < linked.size());

        //
        // And finally, mark everything as happily linked.
        //
        for (LinkingDefinition<?> linkingDef : compiling) {
            if (linkingDef.def != null) {
                localStore.addDefinition(linkingDef.descriptor, linkingDef.def);
                if (linkingDef.built) {
                    if (linkingDef.cacheable) { // false for non-internal namespaces, or non-cacheable registries
                        defsCache.put(linkingDef.descriptor, Optional.of(linkingDef.def));
                    }
                    linkingDef.def.markValid();
                }
            } else {
                throw new AuraRuntimeException("Missing def for " + linkingDef.descriptor + " during validation of "
                        + topLevel);
            }
        }
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
    private <D extends Definition> boolean fillLinkingDefinition(LinkingDefinition<D> compiling) throws QuickFixException {
        assert compiling.def == null;

        //
        // First, check our local cached defs to see if we have a fully linked version.
        // in this case, we don't care about caching, since we are done.
        //
        // Already linked defs are retrieved from cache even during recompilation for modules
        //
        Optional<D> optLocalDef = localStore.getDefinition(compiling.descriptor);
        if (optLocalDef != null) {
            D localDef = optLocalDef.orNull();
            if (localDef != null) {
                compiling.def = localDef;
                // I think this is no longer possible.
                compiling.built = !localDef.isValid();
                if (compiling.built) {
                    localDef.validateDefinition();
                }
                // do not perform expensive isLocalDefNotCacheable() unless needed
                if (shouldCacheDependencies && localStore.isDefNotCacheable(compiling.descriptor)) {
                    shouldCacheDependencies = false;
                }
                return true;
            } else {
                return false;
            }
        }

        @SuppressWarnings("unchecked")
        D subDef = (D)subDefinitions.get(compiling.descriptor);
        if (subDef != null) {
            @SuppressWarnings("unchecked")
            DefDescriptor<D> canonical = (DefDescriptor<D>) subDef.getDescriptor();

            compiling.def = subDef;
            compiling.cacheable = false;
            compiling.descriptor = canonical;
            compiling.built = false;
            return true;
        }

        @SuppressWarnings("unchecked")
        Optional<D> opt = (Optional<D>) defsCache.getIfPresent(compiling.descriptor);
        if (opt != null) {
            D cachedDef = opt.orNull();

            if (cachedDef != null) {
                @SuppressWarnings("unchecked")
                DefDescriptor<D> canonical = (DefDescriptor<D>) cachedDef.getDescriptor();

                compiling.cacheable = true;
                compiling.def = cachedDef;
                compiling.descriptor = canonical;
                compiling.built = false;
                populateSubDefs(cachedDef);
                return true;
            } else {
                return false;
            }
        }

        //
        // If there is no local cache, we must first check to see if there is a registry, as we may not have
        // a registry (depending on configuration). In the case that we don't find one, we are done here.
        //
        DefRegistry registry = registries.getRegistryFor(compiling.descriptor);
        if (registry == null) {
            localStore.addDefinition(compiling.descriptor, null);
            StringBuffer message = new StringBuffer(
                    "Registry not found for " + compiling.descriptor + " in registry set: "
                    +registries.toString());
            loggingService.warn(message.toString());
            return false;
        }

        //
        // Now, check if we can cache the def later, as we won't have the registry to check at a later time.
        // If we can cache, look it up in the cache. If we find it, we have a built definition.
        // Currently, static registries are neither cached, nor do they affect dependency caching
        //
        if (configAdapter.isCacheable(registry, compiling.descriptor)) {
            compiling.cacheable = true;
        } else {
            shouldCacheDependencies = false;
            localStore.setDefNotCacheable(compiling.descriptor);
        }

        //
        // The last case. This is our first compile or the def is uncacheable.
        // In this case, we make sure that the initial validation is called, and put
        // the def in the 'built' set.
        //
        compiling.def = registry.getDef(compiling.descriptor);
        if (compiling.def == null) {
            localStore.addDefinition(compiling.descriptor, null);
            StringBuffer message = new StringBuffer(compiling.descriptor + " not found in registry " + registry);
            registry.find(new DescriptorFilter("*")).stream().forEach((currentDescriptor)->{
                message.append(currentDescriptor);
                message.append(", ");
            });
            loggingService.warn(message.toString());
            return false;
        }
        compiling.built = true;
        @SuppressWarnings("unchecked")
        DefDescriptor<D> canonical = (DefDescriptor<D>) compiling.def.getDescriptor();
        compiling.descriptor = canonical;

        if (descriptorCache != null) {
            DescriptorKey dk = new DescriptorKey(canonical.getQualifiedName(),
                    canonical.getDefType().getPrimaryInterface(), canonical.getBundle());
            descriptorCache.put(dk, canonical);
        }
        populateSubDefs(compiling.def);

        if (!registry.isStatic()) {
            loggingService.incrementNum(LoggingService.DEF_COUNT);
            compiling.def.validateDefinition();
        }

        return true;
    }

    /**
     * Temporary fix to get sub definitions.
     *
     * FIXME: this needs to go away in 210 when we rework registries and source loaders to use
     * only a bundle source loader for text components.
     */
    private void populateSubDefs(Definition def) {
        if (def instanceof BundleDef) {
            BundleDef bundleDef = (BundleDef)def;
            for (Definition subdef : bundleDef.getBundledDefs().values()) {
                subDefinitions.put(subdef.getDescriptor(), subdef);
            }
        }
    }

    public <D extends Definition> LinkingDefinition<D> getLinkingDef(DefDescriptor<D> descriptor) {
        @SuppressWarnings("unchecked")
        LinkingDefinition<D> cd = (LinkingDefinition<D>) linked.get(descriptor);
        if (cd == null) {
            cd = new LinkingDefinition<>(descriptor);
            linked.put(descriptor, cd);
        }
        return cd;
    }

    public List<LinkingDefinition<?>> getNameSort() {
        List<LinkingDefinition<?>> sorted = Lists.newArrayList(linked.values());

        //
        // Sort based on descriptor only (not level) for uid calculation.
        // There are situations where components dependencies are read at different
        // levels affecting the ordering of dependencies and creates different uid.
        //
        // Using descriptor only produces a more consistent UID
        //compiled.sort((cd1, cd2) -> cd1.descriptor.compareTo(cd2.descriptor));
        Comparator<LinkingDefinition<?>> comparator = Comparator.comparing(compilingDef -> compilingDef.descriptor);
        Collections.sort(sorted, comparator.thenComparing(compilingDef -> compilingDef.def.getOwnHash()));
        return sorted;
    }

    public List<LinkingDefinition<?>> getDepthSort() {
        List<LinkingDefinition<?>> sorted = Lists.newArrayList(linked.values());

        Comparator<LinkingDefinition<?>> comparator = Comparator.comparing(compilingDef -> -compilingDef.level);
        comparator = comparator.thenComparing(compilingDef -> compilingDef.descriptor);
        Collections.sort(sorted, comparator.thenComparing(compilingDef -> compilingDef.def.getOwnHash()));
        return sorted;
    }

    @Override
    public String toString() {
        return ""+topLevel;
    }
}
