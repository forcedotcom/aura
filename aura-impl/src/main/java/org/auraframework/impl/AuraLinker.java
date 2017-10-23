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
package org.auraframework.impl;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.validation.ReferenceValidationContextImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Location;
import org.auraframework.system.RegistrySet;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.CompositeValidationException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.validation.ErrorAccumulator;
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
    public final AuraContext context;
    public final List<ClientLibraryDef> clientLibs;
    public final DefDescriptor<? extends Definition> topLevel;
    public final RegistrySet registries;
    private final LoggingService loggingService;
    private final ConfigAdapter configAdapter;
    private final Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
    private final Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> descriptorCache;

    private final Map<DefDescriptor<? extends Definition>, LinkingDefinition<?>> compiled = Maps.newHashMap();
    private final Map<DefDescriptor<? extends Definition>, Definition> subDefinitions = Maps.newHashMap();
    private final ReferenceValidationContextImpl validationContext;

    private final AccessComputer accessComputer;

    /**
     * The 'level' in the dependency tree.
     */
    public int level;

    /**
     * Is it possible to cache dependencies for the linking definition.
     */
    public boolean shouldCacheDependencies;

    public AuraLinker(DefDescriptor<? extends Definition> topLevel, AuraContext context,
            Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache,
            Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> descriptorCache,
            LoggingService loggingService, ConfigAdapter configAdapter,
            AccessComputer accessComputer) {
        this.defsCache = defsCache;
        this.context = context;
        this.registries = context.getRegistries();
        this.clientLibs = Lists.newArrayList();
        this.topLevel = topLevel;
        this.level = 0;
        this.shouldCacheDependencies = true;
        this.descriptorCache = descriptorCache;
        this.loggingService = loggingService;
        this.configAdapter = configAdapter;
        this.validationContext = new ReferenceValidationContextImpl(null);
        this.accessComputer = accessComputer;
    }

    public <D extends Definition> LinkingDefinition<D> getCompiling(DefDescriptor<D> descriptor) {
        @SuppressWarnings("unchecked")
        LinkingDefinition<D> cd = (LinkingDefinition<D>) compiled.get(descriptor);
        if (cd == null) {
            cd = new LinkingDefinition<>(descriptor);
            compiled.put(descriptor, cd);
        }
        return cd;
    }

    public ReferenceValidationContext getValidationContext() {
        return validationContext;
    }

    public <D extends Definition> D getDefinitionDuringLink(DefDescriptor<D> descriptor) throws QuickFixException {
        @SuppressWarnings("unchecked")
        LinkingDefinition<D> cd = (LinkingDefinition<D>) compiled.get(descriptor);
        if (cd == null) {
            return null;
        }
        if (cd.def == null) {
            fillLinkingDefinition(cd);
        }
        return cd.def;
    }

    private <D extends Definition> void addEntry(DefDescriptor<D> dd, Definition def) {
        @SuppressWarnings("unchecked")
        D realDef = (D)def;
        LinkingDefinition<D> cd = getCompiling(dd);
        cd.def = realDef;
    }

    public void addMap(Map<DefDescriptor<? extends Definition>,Definition> toAdd) {
        for (Map.Entry<DefDescriptor<? extends Definition>,Definition> entry : toAdd.entrySet()) {
            addEntry(entry.getKey(), entry.getValue());
        }
    }

    /**
     * Put subdefs in our caches.
     */
    private void populateSubDefs(Definition def) {
        if (def instanceof RootDefinition) {
            RootDefinition rootDef = (RootDefinition)def;
            for (Definition subdef : rootDef.getBundledDefs().values()) {
                subDefinitions.put(subdef.getDescriptor(), subdef);
            }
        }
    }

    /**
     * Fill a compiling def for a descriptor.
     *
     * This makes sure that we can get a registry for a given def, then tries to get the def from the global cache, if
     * that fails, it retrieves from the registry, and marks the def as locally built.
     *
     * FIXME: (GPO) this is _way_ too complicated
     *
     * @param compiling the current compiling def (if there is one).
     * @throws QuickFixException if validateDefinition caused a quickfix.
     */
    public <D extends Definition> boolean fillLinkingDefinition(LinkingDefinition<D> compiling) throws QuickFixException {
        assert compiling.def == null;

        //
        // First, check our local cached defs to see if we have a fully compiled version.
        // in this case, we don't care about caching, since we are done.
        //
        // Already compiled defs are retrieved from cache even during recompilation for modules
        //
        Optional<D> optLocalDef = context.getLocalDef(compiling.descriptor);
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
                if (shouldCacheDependencies && context.isLocalDefNotCacheable(compiling.descriptor)) {
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
        Optional<D> opt = (Optional<D>) (defsCache != null?defsCache.getIfPresent(compiling.descriptor):null);
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
            context.addLocalDef(compiling.descriptor, null);
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
            context.setLocalDefNotCacheable(compiling.descriptor);
        }

        //
        // The last case. This is our first compile or the def is uncacheable.
        // In this case, we make sure that the initial validation is called, and put
        // the def in the 'built' set.
        //
        compiling.def = registry.getDef(compiling.descriptor);
        if (compiling.def == null) {
            context.addLocalDef(compiling.descriptor, null);
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
     * Link a single definition, finding all of the static dependencies.
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
    public <D extends Definition> D linkDefinition(@Nonnull DefDescriptor<D> descriptor,
            boolean nested) throws QuickFixException {
        D def;

        Set<DefDescriptor<?>> stack = Sets.newLinkedHashSet();
        def = getHelper(descriptor, stack, null);
        if (!nested) {
            for (DefDescriptor<?> inheritable : compiled.keySet()) {
                inheritanceHelper(inheritable, stack, 0);
            }
            finishValidation();
        }
        return def;
    }

    private void cleanEmptyDefs() {
        Iterator<Map.Entry<DefDescriptor<? extends Definition>, LinkingDefinition<?>>> iterator;

        iterator = compiled.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<DefDescriptor<? extends Definition>, LinkingDefinition<?>> entry = iterator.next();
            if (entry.getValue().def == null) {
                iterator.remove();
            }
        }
    }

    public void cleanupValidation() {
        //
        // !!!EXTREMELY HACKISH!!!!
        // walk all defs, and if they are not validated, force a JavaScript validation.
        // This is a last resort, attempting to catch anything that fails above. This is
        // bad juju.
        //
        int iteration = 0;
        cleanEmptyDefs();
        List<LinkingDefinition<?>> compiling;
        do {
            compiling = sortForVerification();
            Map<DefDescriptor<? extends Definition>,Definition> accessible = Maps.newHashMap();
            compiling.stream().forEach(cd -> accessible.put(cd.descriptor, cd.def));
            validationContext.setDefinitionMap(accessible);

            for (LinkingDefinition<?> cd : compiling) {
                context.pushCallingDescriptor(cd.descriptor);
                try {
                    if (cd.built && !cd.validated) {
                        if (iteration != 0) {
                            loggingService.warn("warmCaches: Nested add of " + cd.descriptor);
                        }
                        try {
                            cd.def.validateReferences(validationContext);
                        } catch (Throwable t) {
                            loggingService.error("warmCaches: Failed to validate "+cd.descriptor, t);
                        }
                        // Always mark as validated to avoid future complaints.
                        cd.validated = true;
                    }
                } finally {
                    context.popCallingDescriptor();
                }
            }
            iteration += 1;
            cleanEmptyDefs();
        } while (compiling.size() < compiled.size());
    }

    public void convertErrorsToQFE() throws QuickFixException {
        Collection<QuickFixException> errors = validationContext.getErrors();
        if (errors.size() > 0) {
            Collection<ErrorAccumulator.Warning> warnings = validationContext.getWarnings();
            StringBuffer sb = new StringBuffer("Errors occurred during linking\n");
            if (warnings != null && warnings.size() > 0) {
                warnings.stream().forEach(warning -> {
                    sb.append(warning.location);
                    sb.append(" : ");
                    sb.append(warning.message);
                });
            }
            Map<Throwable, Collection<Location>> errorMap = Maps.newLinkedHashMap();
            errors.stream().forEach(error -> {errorMap.put(error, Lists.newArrayList(error.getLocation()));});
            throw new CompositeValidationException(sb.toString(), errorMap);
        }
    }

    /**
     * finish up the validation of a set of compiling defs.
     *
     */
    public void finishValidation() throws QuickFixException {
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
            compiling = sortForVerification();
            Map<DefDescriptor<? extends Definition>,Definition> accessible = Maps.newHashMap();
            compiling.stream().forEach(cd -> accessible.put(cd.descriptor, cd.def));
            validationContext.setDefinitionMap(accessible);

            for (LinkingDefinition<?> cd : compiling) {
                context.pushCallingDescriptor(cd.descriptor);
                try {
                    if (cd.built && !cd.validated) {
                        if (iteration != 0) {
                            validationContext.addWarning("Nested add of " + cd.descriptor
                                    + " during validation of " + topLevel, new Location(topLevel.toString(), 0));
                        }
                        cd.def.validateReferences(validationContext);
                        cd.validated = true;
                    }
                } finally {
                    context.popCallingDescriptor();
                }
            }
            iteration += 1;
        } while (validationContext.getErrors().size() == 0 && compiling.size() < compiled.size());

        convertErrorsToQFE();

        //
        // And finally, mark everything as happily compiled.
        //
        for (LinkingDefinition<?> cd : compiling) {
            if (cd.def != null) {
                context.addLocalDef(cd.descriptor, cd.def);
                if (cd.built) {
                    if (cd.cacheable) { // false for non-internal namespaces, or non-cacheable registries
                        defsCache.put(cd.descriptor, Optional.of(cd.def));
                    }
                    cd.def.markValid();
                }
            } else {
                throw new AuraRuntimeException("Missing def for " + cd.descriptor + " during validation of "
                        + topLevel);
            }
        }
    }

    private void inheritanceHelper(@Nonnull DefDescriptor<?> descriptor, @Nonnull Set<DefDescriptor<?>> stack, int level) {
        LinkingDefinition<? extends Definition> cd = getCompiling(descriptor);
        if (cd.def == null) {
            // Whoops, we have no def... something already broke.
            return;
        }
        //
        // We should never have loops in inheritance. If we do, something bad happened.
        //
        if (stack.contains(descriptor)) {
            // FIXME: error
            return;
        }
        if (level > cd.inheritanceLevel) {
            cd.inheritanceLevel = level;
        // FIXME:
        // when we put an error-out in the stack check, we can add back the following:
        // } else if (cd.def != null) {
        //     return;
        // }
        }
        stack.add(descriptor);
        Set<DefDescriptor<?>> supers = Sets.newHashSet();
        try {
            cd.def.appendSupers(supers);
            for (DefDescriptor<?> sup : supers) {
                inheritanceHelper(sup, stack, level+1);
            }
        } catch (QuickFixException qfe) {
            validationContext.addError(qfe);
        }
        stack.remove(descriptor);
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
        LinkingDefinition<D> cd = getCompiling(descriptor);

        try {
            //
            // We have to drop out when we have a loop in the stack, otherwise we recurse forever.
            //
            if (stack.contains(descriptor)) {
                return null;
            }
            //
            // This is how we update the 'level'. Theoretically, we could go and return if the level is <= to
            // the level for the linking definition, but this conflicts with the loop detection above. In particular
            // we have a case in aura core that starts with application:
            // application -> template  -> component -> template -> html
            //                          -> html      -> component
            //             -> component -> template
            // note that depending on order, things get all confused and the level of html will be set inconsistently
            // depending on the order of processing.
            //
            // To avoid this inconsistency, we continue processing even if it appears that we should not need to.
            //
            if (level > cd.level) {
                cd.level = level;
            }
            level += 1;
            stack.add(descriptor);
            try {
                //
                // careful here. We don't just return with the non-null def because that breaks our levels.
                // We need to walk the whole tree, which is unfortunate perf-wise.
                //
                if (cd.def == null) {
                    if (!fillLinkingDefinition(cd)) {
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
                    if (clientLibs != null && cd.def instanceof BaseComponentDef) {
                        BaseComponentDef baseComponent = (BaseComponentDef) cd.def;
                        baseComponent.addClientLibs(clientLibs);
                    }
                }
                Set<DefDescriptor<?>> newDeps = Sets.newLinkedHashSet();
                cd.def.appendDependencies(newDeps);

                for (DefDescriptor<?> dep : newDeps) {
                    getHelper(dep, stack, cd.def);
                }

                return cd.def;
            } finally {
                level -= 1;
                stack.remove(descriptor);
            }
        } finally {
            if (parent != null && cd.def != null) {
                String status = accessComputer.computeAccess(parent.getDescriptor(), cd.def,
                        context.getAccessCheckCache());
                if (status != null) {
                    throw new NoAccessException(status);
                }
            }
        }
    }

    /**
     * Sort for verification, guarantee a consistent order.
     */
    public List<LinkingDefinition<?>> sortForVerification() {
        List<LinkingDefinition<?>> sortable = Lists.newArrayList(compiled.values());
        Comparator<LinkingDefinition<?>> comparator = Comparator.comparing(ld -> -ld.inheritanceLevel);
        comparator = comparator.thenComparing(ld -> ld.descriptor);
        Collections.sort(sortable, comparator.thenComparing(ld -> ld.def.getOwnHash()));
        return sortable;
    }

    /**
     * Sort for verification, guarantee a consistent order.
     */
    public List<LinkingDefinition<?>> sortForLevel() {
        List<LinkingDefinition<?>> sortable = Lists.newArrayList(compiled.values());
        Comparator<LinkingDefinition<?>> comparator = Comparator.comparing(ld -> -ld.level);
        comparator = comparator.thenComparing(ld -> ld.descriptor);
        Collections.sort(sortable, comparator.thenComparing(ld -> ld.def.getOwnHash()));
        return sortable;
    }
}
