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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.stream.Collectors;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.HasJavascriptReferences;
import org.auraframework.def.ParentedDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.controller.AuraStaticControllerDefRegistry;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.Location;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.Source;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.text.GlobMatcher;
import org.auraframework.util.text.Hash;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * The public access to definitions inside Aura.
 *
 * This class manages all of the permissions checking and fetching of implementations
 * for consumers of aura definitions.
 */
@ServiceComponent
public class DefinitionServiceImpl implements DefinitionService {
    private static final long serialVersionUID = -2488984746420077688L;

    private ContextService contextService;

    private CachingService cachingService;

    private LoggingService loggingService;
    
    private ConfigAdapter configAdapter;
    
    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass) {
        return getDefDescriptor(qualifiedName, defClass, null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Definition, B extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName,
            Class<T> defClass, DefDescriptor<B> bundle) {
        if (defClass == ActionDef.class) {
            return SubDefDescriptorImpl.getInstance(qualifiedName, defClass, ControllerDef.class);
        }
        if (qualifiedName == null || defClass == null) {
            throw new AuraRuntimeException("descriptor is null");
        }

        DescriptorKey dk = new DescriptorKey(qualifiedName, defClass, bundle);

        Cache<DescriptorKey, DefDescriptor<? extends Definition>> cache = null;
        if (cachingService != null) {
            cache = cachingService.getDefDescriptorByNameCache();
        }

        DefDescriptor<T> result = null;
        if (cache != null) {
            DefDescriptor<T> cachedResult = (DefDescriptor<T>) cache.getIfPresent(dk);
            result = cachedResult;
        }
        if (result == null) {
            if (defClass == TypeDef.class && qualifiedName.indexOf("://") == -1) {
                TypeDef typeDef = AuraStaticTypeDefRegistry.INSTANCE.getInsensitiveDef(qualifiedName);
                if (typeDef != null) {
                    return (DefDescriptor<T>) typeDef.getDescriptor();
                }
            }
            result = new DefDescriptorImpl<>(qualifiedName, defClass, bundle);

            // Our input names may not be qualified, but we should ensure that
            // the fully-qualified is properly cached to the same object.
            // I'd like an unqualified name to either throw or be resolved first,
            // but that's breaking or non-performant respectively.
            if (!dk.getName().equals(result.getQualifiedName())) {
                DescriptorKey fullDK = new DescriptorKey(result.getQualifiedName(), defClass, result.getBundle());

                DefDescriptor<T> fullResult = (DefDescriptor<T>) cache.getIfPresent(fullDK);
                if (fullResult == null) {
                    cache.put(fullDK, result);
                } else {
                    // We already had one, just under the proper name
                    result = fullResult;
                }
            }

            if (cache != null) {
                cache.put(dk, result);
            }
        }

        return result;
    }

    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix,
            Class<T> defClass) {

        return DefDescriptorImpl.getAssociateDescriptor(desc, defClass, prefix);
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
    @SuppressWarnings("unchecked")
    @Override
    public <T extends Definition> T getDefinition(@CheckForNull DefDescriptor<T> descriptor) throws QuickFixException {
        contextService.assertEstablished();

        AuraContext context = contextService.getCurrentContext();
        T def = null;

        if (descriptor == null) {
            return null;
        }
            
        // TODO: Clean up so that we just walk up descriptor trees and back down them.
        Optional<T> optLocalDef = null;
        if (descriptor instanceof SubDefDescriptor) {
            // Case 1: SubDef
            SubDefDescriptor<T, ?> subDefDescriptor = (SubDefDescriptor<T, ?>) descriptor;
            def = getDefinition(subDefDescriptor.getParentDescriptor()).getSubDefinition(subDefDescriptor);
        } else if ((optLocalDef = context.getLocalDef(descriptor)) != null) {
            // Case 2: LocalDef
            def = optLocalDef.orNull();
        } else if (threadContext.get() != null) {
            // Case 2: Nested get. This should be removed, but is somewhat complicated, because we compile
            // in-line.
            //
            // If our current context is not null, we want to recurse in to properly include the defs when we
            // are compiling. Note that in this case, we already own the lock, so it can be outside the locking below.
            // When we are 'building' instead of 'compiling' we should already have the def somewhere, so we just
            // fill it in and continue. If no def is present, we explode.
            //
            CompileContext currentCC = threadContext.get();
            if (currentCC.compiled.containsKey(descriptor)) {
                CompilingDef<T> cd = (CompilingDef<T>) currentCC.compiled.get(descriptor);
                if (cd.def == null && !currentCC.compiling) {
                    fillCompilingDef(cd, currentCC);
                }
                if (cd.def != null) {
                    def = cd.def;
                }
            } else if (!currentCC.compiling) {
                throw new IllegalStateException("Attempting to add missing def "+descriptor+" to "+currentCC.topLevel);
            } else {
                //
                // If we are nested, compileDef will do the right thing.
                // This is a bit ugly though.
                //
                def = compileDef(descriptor, currentCC, true);
            }
        } else {
            // Case 3: Have to find the def.
            Lock rLock = cachingService.getReadLock();
            rLock.lock();
            try {
                DependencyEntry de = getDE(null, descriptor);
                if (de == null) {
                    de = context.findLocalDependencyEntry(descriptor);
                }
                if (de == null) {
                    compileDE(descriptor);

                    Optional<T> optionalDef = context.getLocalDef(descriptor);
                    def = (optionalDef != null)? context.getLocalDef(descriptor).orNull() : null;
                } else {
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

                    Optional<T> optionalDef = context.getLocalDef(descriptor);
                    def = (optionalDef != null)? context.getLocalDef(descriptor).orNull() : null;
                }
            } finally {
                rLock.unlock();
            }
        }
        if (def != null && descriptor.getDefType() == DefType.APPLICATION
                && def.getAccess().requiresAuthentication()
                && context.getAccess() != Authentication.AUTHENTICATED) {
            def = null;
        }

        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }

        return def;
    }

    @Override
    public <T extends Definition> T getDefinition(String qualifiedName, Class<T> defClass) throws QuickFixException {
        return getDefinition(getDefDescriptor(qualifiedName, defClass));
    }

    @Override
    public <D extends Definition> D getUnlinkedDefinition(DefDescriptor<D> descriptor) throws QuickFixException {
        if (descriptor == null) {
            return null;
        }
        AuraContext context = contextService.getCurrentContext();

        //
        // Always check for a local def before locking.
        //
        Optional<D> optLocalDef = context.getLocalDef(descriptor);
        if (optLocalDef != null) {
            return optLocalDef.orNull();
        }

        //
        // If there is no local cache, we must first check to see if there is a registry, as we may not have
        // a registry (depending on configuration). In the case that we don't find one, we are done here.
        //
        DefRegistry registry = context.getRegistries().getRegistryFor(descriptor);
        if (registry == null) {
            context.addLocalDef(descriptor, null);
            return null;
        }

        //
        // check the cache.
        //
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = cachingService.getDefsCache();
        @SuppressWarnings("unchecked")
        Optional<D> opt = (Optional<D>) defsCache.getIfPresent(descriptor);
        if (opt != null) {
            return opt.orNull();
        }

        D def = registry.getDef(descriptor);
        if (def != null) {
            def.validateDefinition();
        }
        return def;
    }

    @Override
    public <D extends Definition> boolean exists(DefDescriptor<D> descriptor) {
        AuraContext context = contextService.getCurrentContext();
        boolean regExists;

        Optional<D> optLocalDef = context.getLocalDef(descriptor);
        if (optLocalDef != null) {
            return optLocalDef.isPresent();
        }
        //
        // Try our various caches.
        //
        Cache<DefDescriptor<?>, Boolean> existsCache = cachingService.getExistsCache();
        Boolean val = existsCache.getIfPresent(descriptor);
        if (val != null && val.booleanValue()) {
            return true;
        }

        Lock rLock = cachingService.getReadLock();
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = cachingService.getDefsCache();
        rLock.lock();
        try {
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
            DefRegistry reg = context.getRegistries().getRegistryFor(descriptor);
            if (reg == null) {
                return false;
            }
            regExists = reg.exists(descriptor);
            if (configAdapter.isCacheable(reg, descriptor)) {
                Boolean cacheVal = Boolean.valueOf(regExists);
                existsCache.put(descriptor, cacheVal);
            }
        } finally {
            rLock.unlock();
        }
        if (regExists == false) {
            // Cache negatives to avoid excessive lookups.
            context.addLocalDef(descriptor, null);
        }
        return regExists;
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        AuraContext context = contextService.getCurrentContext();
        DefRegistry reg = context.getRegistries().getRegistryFor(descriptor);
        if (reg != null) {
            return reg.getSource(descriptor);
        }
        return null;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher, BaseComponentDef referenceDescriptor) {
        final String filterKey = matcher.toString();
        Set<DefDescriptor<?>> matched = Sets.newHashSet();
        GlobMatcher namespaceMatcher = matcher.getNamespaceMatch();
        String namespace = namespaceMatcher.isConstant()?namespaceMatcher.toString():null;
        AuraContext context = contextService.getCurrentContext();
        Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache = cachingService.getDescriptorFilterCache();
        Lock rLock = cachingService.getReadLock();

        if (matcher.isConstant()) {
            //
            // If we have a constant matcher (i.e. namespace, name, and type), we can simply
            // figure out our def descriptor and return it. This short-circuits a lot of code,
            // and also slightly changes the validation, as we validate nothing until we try
            // to retrieve the definition during the tree walk.
            //
            String prefix = null;
            GlobMatcher prefixMatcher = matcher.getPrefixMatch();
            if (prefixMatcher.isConstant()) {
                prefix = prefixMatcher.toString();
            }

            // just one match
            DefDescriptor<?> singleMatch = getDefDescriptor(
                    prefix, matcher.getNamespaceMatch().toString(), matcher.getNameMatch().toString(),
                    matcher.getDefTypes().get(0));
            if (exists(singleMatch)) {
                matched.add(singleMatch);
            }
            return matched;
        } else {
            //
            // If we have somthing that is non-constant, we'll have to muck with caches and do some funky
            // running around.
            //
            rLock.lock();
            try {
                //
                // We _never_ cache non-constant namespaces. We'd like to make them illegal, but for the moment
                // we will make them undesirable.
                //
                boolean cacheable = configAdapter.isCacheable(matcher) && namespaceMatcher.isConstant();
                for (DefRegistry reg : context.getRegistries().getRegistries(matcher)) {
                    if (reg.hasFind()) {
                        //
                        // Now we walk then entire set of registries, and check to see if our namespace
                        // matches them. In the case of a constant namespace, this is easy, otherwise
                        // we have to do a double walk.
                        //
                        // We could theoretically do the cache lookup first, but that seems overly complicated
                        //
                        Set<String> namespaces = reg.getNamespaces();
                        boolean nsm = namespaces.contains("*");
                        if (!nsm) {
                            //
                            // Careful here. namespaces is case sensitive. If we fail to find the
                            // namespace by lookup, go ahead and walk the entire namespace set
                            // matching with our insensitive matcher. Not pretty, and not great for
                            // perf. The only way to fix this is to be case sensitive. Note that the
                            // perf penalty is paid by everyone. not just the bad case matching.
                            //
                            nsm = namespaces.contains(namespace);
                            if (!nsm) {
                                for (String ns : namespaces) {
                                    if (namespaceMatcher.match(ns)) {
                                        nsm = true;
                                    }
                                }
                            }
                        }
                        //
                        // Only look up results if we have a match.
                        //
                        if (nsm) {
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

                            if (referenceDescriptor != null) {
                                matched.addAll(registryResults.stream()
                                        .filter(regRes -> {
                                            try {
                                                return computeAccess(referenceDescriptor.getDescriptor(), regRes.getDef()) == null;
                                            } catch (QuickFixException e) {
                                                return false;
                                            }
                                        })
                                        .collect(Collectors.toSet()));
                            } else {
                                matched.addAll(registryResults);
                            }
                        }
                    }
                }
                context.addDynamicMatches(matched, matcher);
            } finally {
                rLock.unlock();
            }
        }

        return matched;
    }

    /**
     * Take in the information off the context and sanitize, populating dependencies.
     *
     * This routine takes in the current descriptor, It then expands out dependencies and
     * cleans up the set of explicitly loaded descriptors by removing descriptors that are
     * implicitly loaded by others in the set.
     *
     * Note that the client out of sync exception has higher 'precedence' than
     * the quick fix exception. This allows the servlet to correctly refresh a
     * client before presenting the quick fix (which would otherwise hide the
     * fact that the server side code changed). This is because quick fix exceptions
     * are thrown and swallowed during posts to avoid circular qfes, which cause
     * the server to not process the quick fix.
     *
     * Once this routine has completed, the master def registiry should have a
     * valid set of dependencies for the descriptor on the context.
     *
     * Note that removing things from the 'loaded' set should send them back to
     * the client, and allow our future requests to be smaller.
     *
     * @param loading The descriptor we think we are loading.
     * @throws ClientOutOfSyncException if the uid on something is a mismatch
     * @throws QuickFixException if a definition can't be compiled.
     */
    @Override
    public void updateLoaded(DefDescriptor<?> loading) throws QuickFixException, ClientOutOfSyncException {
        AuraContext context;
        Set<DefDescriptor<?>> loaded = Sets.newHashSet();
        Set<DefDescriptor<?>> prev = Sets.newHashSet();
        Set<DefDescriptor<?>> remove = null;

        contextService.assertEstablished();
        context = contextService.getCurrentContext();
        if (context.getPreloadedDefinitions() == null) {
            //
            // TODO (optimize): we could reverse this set randomly to try
            // to sanitize the list in opposite directions. No need to be
            // exact (hard to test though).
            //
            for (Map.Entry<DefDescriptor<?>, String> entry : context.getClientLoaded().entrySet()) {
                DefDescriptor<?> descriptor = entry.getKey();
                if (loaded.contains(descriptor)) {
                    context.dropLoaded(descriptor);
                } else {
                    // validate the uid.
                    String uid = entry.getValue();
                    String tuid = null;
                    QuickFixException qfe = null;

                    if (uid == null) {
                        // If we are given a null, bounce out.
                        throw new ClientOutOfSyncException(descriptor + ": missing UID ");
                    }
                    try {
                        tuid = getUid(uid, descriptor);
                    } catch (QuickFixException broke) {
                        //
                        // See note above. This is how we enforce precedence of ClientOutOfSyncException
                        //
                        qfe = broke;
                    }
                    if (!uid.equals(tuid)) {
                        throw new ClientOutOfSyncException(descriptor + ": mismatched UIDs " + uid + " != " + tuid);
                    }
                    if (qfe != null) {
                        throw qfe;
                    }
                    Set<DefDescriptor<?>> deps = getDependencies(uid);
                    loaded.addAll(deps);
                    for (DefDescriptor<?> x : prev) {
                        if (deps.contains(x)) {
                            if (remove == null) {
                                remove = Sets.newHashSet();
                            }
                            remove.add(x);
                        }
                    }
                    prev.add(descriptor);
                }
            }
            context.setPreloadedDefinitions(loaded);
        } else {
            loaded = context.getPreloadedDefinitions();
        }
        if (remove != null) {
            for (DefDescriptor<?> x : remove) {
                context.dropLoaded(x);
            }
        }
        //
        // Now make sure that our current definition is somewhere there
        // If this fails, we will throw an exception, and all will be
        // well.
        //
        if (loading != null && !loaded.contains(loading) && !context.getLoaded().containsKey(loading)) {
            String uid = getUid(null, loading);

            if (uid == null) {
                throw new DefinitionNotFoundException(loading, null);
            } else {
                context.addLoaded(loading, uid);
            }
        }
    }

    /**
     * Get an instance from name parts.
     *
     * @param name      The simple String representation of the instance requested ("foo:bar" or "java://foo.Bar")
     * @param namespace The Interface's Class for the DefDescriptor being requested.
     * @return An instance of a AuraDescriptor for the provided tag
     */
    @Override
    public DefDescriptor<?> getDefDescriptor(@CheckForNull String prefix, @Nonnull String namespace,
                                             @Nonnull String name, @Nonnull DefType defType) {
        StringBuilder sb = new StringBuilder();
        if (AuraTextUtil.isNullEmptyOrWhitespace(prefix)) {
            prefix = contextService.getCurrentContext().getDefaultPrefix(defType);
        }
        sb.append(prefix.toLowerCase());
        sb.append("://");
        sb.append(namespace);
        if (prefix.equals("markup")) {
            sb.append(":");
        } else {
            sb.append(".");
        }
        sb.append(name);
        return getDefDescriptor(sb.toString(), defType.getPrimaryInterface(), null);
    }

    /**
     * @return the contextService
     */
    public ContextService getContextService() {
        return contextService;
    }

    /**
     * @param contextService the contextService to set
     */
    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    /**
     * @return the cachingService
     */
    public CachingService getCachingService() {
        return cachingService;
    }

    /**
     * @param cachingService the cachingService to set
     */
    @Inject
    public void setCachingService(CachingService cachingService) {
        this.cachingService = cachingService;
    }

    /**
     * @return the loggingService
     */
    public LoggingService getLoggingService() {
        return loggingService;
    }

    /**
     * @param loggingService the loggingService to set
     */
    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    /**
     * @return the configAdapter
     */
    public ConfigAdapter getConfigAdapter() {
        return configAdapter;
    }

    /**
     * @param configAdapter the configAdapter to set
     */
    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    /**
     * Get the UID associated with a descriptor.
     *
     * This call must be made before any of the other UID based functions.
     * Failing to do so will give incorrect results (null).
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
     * @throws ClientOutOfSyncException if the UID is not null, and was a mismatch
     * @throws QuickFixException if the definition cannot be compiled.
     */
    @Override
    public <T extends Definition> String getUid(String uid, DefDescriptor<T> descriptor) throws QuickFixException {
        if (descriptor == null) {
            return null;
        }

        DependencyEntry de = null;
        Lock rLock = cachingService.getReadLock();

        rLock.lock();
        try {
            de = getDE(uid, descriptor);
            if (de == null) {
                de = compileDE(descriptor);
                //
                // If we can't find our descriptor, we just give back a null.
                if (de == null) {
                    return null;
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

    /**
     * Get the dependencies for a descriptor.
     *
     * This set is guaranteed to be in order of 'use' in that a component should come before
     * all components that use it or depend on it.
     *
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     */
    @Override
    public Set<DefDescriptor<?>> getDependencies(String uid) {
        if (uid == null) {
            return null;
        }
        DependencyEntry de = contextService.getCurrentContext().getLocalDependencyEntry(uid);

        if (de != null) {
            return de.dependencies;
        }
        return null;
    }

    /**
     * Returns list of client libraries for given uid
     *
     * @param uid uid of app or cmp
     * @return list of client libraries for uid
     */
    @Override
    public List<ClientLibraryDef> getClientLibraries(String uid) {
        if (uid == null) {
            return null;
        }
        DependencyEntry de = contextService.getCurrentContext().getLocalDependencyEntry(uid);

        if (de != null) {
            return de.clientLibraries;
        }
        return null;
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def)
            throws QuickFixException {
        String status = computeAccess(referencingDescriptor, def);
        if (status != null) {
            DefDescriptor<? extends Definition> descriptor = def.getDescriptor();
            String message = configAdapter.isProduction() ? DefinitionNotFoundException.getMessage(
                    descriptor.getDefType(), descriptor.getName()) : status;
                    throw new NoAccessException(message);
        }
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
            throws QuickFixException {
        assertAccess(referencingDescriptor, getDefinition(accessDescriptor));
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public boolean hasAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
            throws QuickFixException {
        return computeAccess(referencingDescriptor, getDefinition(accessDescriptor)) == null;
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> boolean hasAccess(DefDescriptor<?> referencingDescriptor, D def)
            throws QuickFixException {
        return computeAccess(referencingDescriptor, def) == null;
    }

    private <D extends Definition> String computeAccess(DefDescriptor<?> referencingDescriptor, D def) {
        if (def == null) {
            return null;
        }

        // If the def is access="global" or does not require authentication then anyone can see it
        DefinitionAccess access = def.getAccess();
        if (access == null) {
            throw new RuntimeException("Missing access declaration for " + def.getDescriptor()
                    + " of type "+def.getClass().getSimpleName());
        }
        if (access.isGlobal() || !access.requiresAuthentication()) {
            return null;
        }
        if (access.isPrivate()) {
            // make sure private is really private.
            if (def.getDescriptor().equals(referencingDescriptor)) {
                return null;
            }
        }
        String referencingNamespace = null;
        if (referencingDescriptor != null) {
            String prefix = referencingDescriptor.getPrefix();
            if (configAdapter.isUnsecuredPrefix(prefix)) {
                return null;
            }

            referencingNamespace = referencingDescriptor.getNamespace();

            // The caller is in an internal namespace let them through
            if (configAdapter.isInternalNamespace(referencingNamespace)) {
                return null;
            }

            // Both access of def and referencingNamespace are privileged so we allow
            if (access.isPrivileged() && configAdapter.isPrivilegedNamespace(referencingNamespace)) {
                return null;
            }
        }

        DefDescriptor<?> desc = def.getDescriptor();

        String namespace;
        String target;

        if (def instanceof ParentedDef) {
            ParentedDef parentedDef = (ParentedDef) def;
            DefDescriptor<? extends RootDefinition> parentDescriptor = parentedDef.getParentDescriptor();
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

        Cache<String, String> accessCheckCache = contextService.getCurrentContext().getAccessCheckCache();
        String status = accessCheckCache.getIfPresent(key);
        if (status == null) {
            // System.out.printf("** MDR.miss.assertAccess() cache miss for: %s\n", key);
            // We may re-enter this code, but only in race conditions. We should generate the
            // same string, and the only way to protect against this is to lock it.

            DefDescriptor<? extends Definition> descriptor = def.getDescriptor();
            if (!configAdapter.isUnsecuredNamespace(namespace)
                    && !configAdapter.isUnsecuredPrefix(descriptor.getPrefix())) {
                if (referencingNamespace == null || referencingNamespace.isEmpty()) {
                    status = String
                            .format("Access to %s '%s' is not allowed: referencing namespace was empty or null",
                                    defType, target);
                } else if (!referencingNamespace.equals(namespace)) {
                    // The caller and the def are not in the same namespace
                    status = String
                            .format("Access to %s '%s' with access '%s' from namespace '%s' in '%s(%s)' is not allowed",
                                    defType.toString().toLowerCase(), target, def.getAccess().toString(),
                                    referencingNamespace, referencingDescriptor, referencingDescriptor.getDefType());
                } else if (access.isPrivate()) {
                    status = String
                            .format("Access to %s '%s' with access PRIVATE from namespace '%s' in '%s(%s)' is not allowed",
                                    defType.toString().toLowerCase(), target, referencingNamespace,
                                    referencingDescriptor, referencingDescriptor.getDefType());
                }
            }
            if (status == null) {
                status = "";
            }
            accessCheckCache.put(key, status);
        } else {
            // System.out.printf("** MDR.hit.assertAccess() cache hit for: %s\n", key);
        }

        return status.isEmpty() ? null : status;
    }

    // FIXME: These should move to caching service.

    /** Creates a key for the localDependencies, using DefType and FQN. */
    private String makeLocalKey(@Nonnull DefDescriptor<?> descriptor) {
        return descriptor.getDefType().toString() + ":" + descriptor.getQualifiedName().toLowerCase();
    }

    /**
     * Creates a key for the global {@link #depsCache}, using UID, type, and FQN.
     */
    private String makeGlobalKey(String uid, @Nonnull DefDescriptor<?> descriptor) {
        return uid + "/" + makeLocalKey(descriptor);
    }

    /**
     * Creates a key for the global {@link #depsCache}, using only descriptor (and Mode internally).
     *
     * @param descriptor - the descriptor use for the key
     */
    private String makeNonUidGlobalKey(@Nonnull DefDescriptor<?> descriptor) {
        return makeLocalKey(descriptor);
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
    protected <T extends Definition> DependencyEntry compileDE(@Nonnull DefDescriptor<T> descriptor) throws QuickFixException{
        // See localDependencies commentcurrentCC
        String key = makeLocalKey(descriptor);
        CompileContext currentCC = threadContext.get();
        AuraContext context = contextService.getCurrentContext();
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = cachingService.getDefsCache();

        if (currentCC != null) {
            throw new AuraRuntimeException("Ugh, nested compileDE/buildDE on " + currentCC.topLevel
                    + " trying to build " + descriptor);
        }

        List<ClientLibraryDef> clientLibs = Lists.newArrayList();
        currentCC = new CompileContext(descriptor, context, defsCache, clientLibs);
        threadContext.set(currentCC);
        try {
            currentCC.addMap(AuraStaticControllerDefRegistry.getInstance(this).getAll());
            Definition def = compileDef(descriptor, currentCC, false);
            DependencyEntry de;
            String uid;

            if (def == null) {
                return null;
            }

            List<CompilingDef<?>> compiled = Lists.newArrayList(currentCC.compiled.values());

            // Sort based on descriptor only (not level) for uid calculation.
            // There are situations where components dependencies are read at different
            // levels where affected the ordering of dependencies creating different uid.
            //
            // Using descriptor only produces a more consistent UID
            Collections.sort(compiled, (cd1, cd2) -> cd1.descriptor.compareTo(cd2.descriptor));

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

            Set<DefDescriptor<? extends Definition>> deps = Sets.newLinkedHashSet();

            // level sorting is important for css and aura:library dependency ordering
            Collections.sort(compiled);
            for (CompilingDef<?> cd : compiled) {
                deps.add(cd.descriptor);
            }

            CompilingDef<T> cd = currentCC.getCompiling(descriptor);

            de = new DependencyEntry(uid, Collections.unmodifiableSet(deps), clientLibs);
            Cache<String, DependencyEntry> depsCache = cachingService.getDepsCache();
            if (cd.cacheable) {
                // put UID-qualified descriptor key for dependency
                depsCache.put(makeGlobalKey(de.uid, descriptor), de);

                // put unqualified descriptor key for dependency
                if (currentCC.shouldCacheDependencies) {
                    depsCache.put(makeNonUidGlobalKey(descriptor), de);
                }
            }
            // See localDependencies comment
            context.addLocalDependencyEntry(key, de);
            return de;
        } catch (QuickFixException qfe) {
            DependencyEntry de = new DependencyEntry(qfe);
            // See localDependencies comment
            context.addLocalDependencyEntry(key, de);
            throw qfe;
        } finally {
            threadContext.set(null);
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
    private DependencyEntry getDE(@CheckForNull String uid, @Nonnull DefDescriptor<?> descriptor) {
        // See localDependencies comment
        AuraContext context = contextService.getCurrentContext();
        Cache<String, DependencyEntry> depsCache = cachingService.getDepsCache();
        String key = makeLocalKey(descriptor);
        DependencyEntry de;

        if (uid != null) {
            de = context.getLocalDependencyEntry(uid);
            if (de != null) {
                return de;
            }
            de = depsCache.getIfPresent(makeGlobalKey(uid, descriptor));
        } else {
            // See localDependencies comment
            de = context.getLocalDependencyEntry(key);
            if (de != null) {
                return de;
            }
            de = depsCache.getIfPresent(makeNonUidGlobalKey(descriptor));
        }
        if (de != null) {
            // See localDependencies comment
            context.addLocalDependencyEntry(key, de);
        }
        return de;
    }

    /**
     * Build a DE 'in place' with no tree traversal.
     */
    private <D extends Definition> void buildDE(@Nonnull DependencyEntry de, @Nonnull DefDescriptor<?> descriptor)
            throws QuickFixException {
        CompileContext currentCC;
        currentCC = new CompileContext(descriptor, contextService.getCurrentContext(),
                cachingService.getDefsCache(), null);
        threadContext.set(currentCC);
        try {
            validateHelper(currentCC, descriptor);
            for (DefDescriptor<?> dd : de.dependencies) {
                validateHelper(currentCC, dd);
            }
            finishValidation(currentCC);
        } finally {
            threadContext.set(null);
        }
    }

    /**
     * Typesafe helper for buildDE.
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
    private <D extends Definition> void validateHelper(@Nonnull CompileContext currentCC,
            @Nonnull DefDescriptor<D> descriptor) throws QuickFixException {
        CompilingDef<D> compiling = new CompilingDef<>(descriptor);
        currentCC.compiled.put(descriptor, compiling);
        if (compiling.def == null && !fillCompilingDef(compiling, currentCC)) {
            throw new DefinitionNotFoundException(compiling.descriptor);
        }
    }

    /**
     * A compiling definition.
     *
     * This embodies a definition that is in the process of being compiled. It stores the descriptor, definition, and
     * the registry to which it belongs to avoid repeated lookups.
     */
    private static class CompilingDef<T extends Definition> implements Comparable<CompilingDef<?>> {
        public CompilingDef(@Nonnull DefDescriptor<T> descriptor) {
            this.descriptor = descriptor;
        }

        /**
         * The descriptor we are compiling.
         */
        @Nonnull
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
        public final AuraContext context;
        public final Map<DefDescriptor<? extends Definition>, CompilingDef<?>> compiled = Maps.newHashMap();
        public final Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
        public final List<ClientLibraryDef> clientLibs;
        public final DefDescriptor<? extends Definition> topLevel;
        public final RegistrySet registries;
        public final boolean compiling;
        public int level;

        /** Is this def's dependencies cacheable? */
        public boolean shouldCacheDependencies;

        public CompileContext(DefDescriptor<? extends Definition> topLevel, AuraContext context,
                Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache,
                List<ClientLibraryDef> clientLibs) {
            this.defsCache = defsCache;
            this.context = context;
            this.registries = context.getRegistries();
            this.clientLibs = clientLibs;
            this.topLevel = topLevel;
            this.level = 0;
            this.shouldCacheDependencies = true;
            this.compiling = true;
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

        private <D extends Definition> void addEntry(DefDescriptor<D> dd, Definition def) {
            @SuppressWarnings("unchecked")
            D realDef = (D)def;
            CompilingDef<D> cd = getCompiling(dd);
            cd.def = realDef;
        }

        public void addMap(Map<DefDescriptor<? extends Definition>,Definition> toAdd) {
            for (Map.Entry<DefDescriptor<? extends Definition>,Definition> entry : toAdd.entrySet()) {
                addEntry(entry.getKey(), entry.getValue());
            }
        }
    }

    private final ThreadLocal<CompileContext> threadContext = new ThreadLocal<>();

    /**
     * Fill a compiling def for a descriptor.
     *
     * This makes sure that we can get a registry for a given def, then tries to get the def from the global cache, if
     * that fails, it retrieves from the registry, and marks the def as locally built.
     *
     * @param compiling the current compiling def (if there is one).
     * @throws QuickFixException if validateDefinition caused a quickfix.
     */
    private <D extends Definition> boolean fillCompilingDef(CompilingDef<D> compiling,
            CompileContext currentCC) throws QuickFixException {
        assert compiling.def == null;

        //
        // First, check our local cached defs to see if we have a fully compiled version.
        // in this case, we don't care about caching, since we are done.
        //
        Optional<D> optLocalDef = currentCC.context.getLocalDef(compiling.descriptor);
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
                if (currentCC.shouldCacheDependencies && currentCC.context.isLocalDefNotCacheable(compiling.descriptor)) {
                    currentCC.shouldCacheDependencies = false;
                }
                return true;
            } else {
                return false;
            }
        }

        @SuppressWarnings("unchecked")
        Optional<D> opt = (Optional<D>) currentCC.defsCache.getIfPresent(compiling.descriptor);
        if (opt != null) {
            D cachedDef = opt.orNull();

            if (cachedDef != null) {
                @SuppressWarnings("unchecked")
                DefDescriptor<D> canonical = (DefDescriptor<D>) cachedDef.getDescriptor();

                compiling.cacheable = true;
                compiling.def = cachedDef;
                compiling.descriptor = canonical;
                compiling.built = false;
                return true;
            } else {
                return false;
            }
        }

        //
        // If there is no local cache, we must first check to see if there is a registry, as we may not have
        // a registry (depending on configuration). In the case that we don't find one, we are done here.
        //
        DefRegistry registry = currentCC.registries.getRegistryFor(compiling.descriptor);
        if (registry == null) {
            currentCC.context.addLocalDef(compiling.descriptor, null);
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
            currentCC.shouldCacheDependencies = false;
            currentCC.context.setLocalDefNotCacheable(compiling.descriptor);
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
        compiling.built = true;
        @SuppressWarnings("unchecked")
        DefDescriptor<D> canonical = (DefDescriptor<D>) compiling.def.getDescriptor();
        compiling.descriptor = canonical;
        if (!registry.isStatic()) {
            loggingService.incrementNum(LoggingService.DEF_COUNT);
            compiling.def.validateDefinition();
        }
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
    private <D extends Definition> D getHelper(@Nonnull DefDescriptor<D> descriptor,
            @Nonnull CompileContext cc, @Nonnull Set<DefDescriptor<?>> stack,
            @CheckForNull Definition parent) throws QuickFixException {
        loggingService.incrementNum(LoggingService.DEF_VISIT_COUNT);
        CompilingDef<D> cd = cc.getCompiling(descriptor);
        try {
            if (stack.contains(descriptor)) {
                // System.out.println("cycle at "+stack+" "+descriptor);
                return null;
            }
            if (cc.level > cd.level) {
                cd.level = cc.level;
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
                    if (!fillCompilingDef(cd, cc)) {
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
        } finally {
            if (parent != null && cd.def != null) {
                assertAccess(parent.getDescriptor(), cd.def);
            }
        }
    }

    /**
     * finish up the validation of a set of compiling defs.
     *
     */
    private void finishValidation(CompileContext currentCC) throws QuickFixException {
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
                            //logger.warn("Nested add of " + cd.descriptor + " during validation of "
                            //        + currentCC.topLevel);
                            // throw new
                            // AuraRuntimeException("Nested add of "+cd.descriptor+" during validation of "+currentCC.topLevel);
                        }
                        // Validate, including JavaScript if we can cache 
                        if (cd.cacheable && cd.def instanceof HasJavascriptReferences) {
                            ((HasJavascriptReferences) cd.def).validateReferences(true);
                        } else {
                            cd.def.validateReferences();
                        }
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
            if (cd.def != null) {
                currentCC.context.addLocalDef(cd.descriptor, cd.def);
                if (cd.built) {
                    if (cd.cacheable) { // false for non-internal namespaces, or non-cacheable registries
                        currentCC.defsCache.put(cd.descriptor, Optional.of(cd.def));
                    }
                    cd.def.markValid();
                }
            } else {
                throw new AuraRuntimeException("Missing def for " + cd.descriptor + " during validation of "
                        + currentCC.topLevel);
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
    private <D extends Definition> D compileDef(@Nonnull DefDescriptor<D> descriptor,
            @Nonnull CompileContext currentCC, boolean nested) throws QuickFixException {
        D def;

        if (!nested) {
            loggingService.startTimer(LoggingService.TIMER_DEFINITION_CREATION);
        }
        try {
            Set<DefDescriptor<?>> stack = Sets.newLinkedHashSet();
            def = getHelper(descriptor, currentCC, stack, null);
            if (!nested) {
                finishValidation(currentCC);
            }
            return def;
        } finally {
            if (!nested) {
                loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
            }
        }
    }
}
