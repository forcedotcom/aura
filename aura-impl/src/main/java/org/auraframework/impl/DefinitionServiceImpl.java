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
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.controller.AuraGlobalControllerDefRegistry;
import org.auraframework.impl.linker.AccessChecker;
import org.auraframework.impl.linker.AuraLinker;
import org.auraframework.impl.linker.LinkingDefinition;
import org.auraframework.impl.system.BundleAwareDefRegistry;
import org.auraframework.impl.system.CompilingDefRegistry;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.impl.visitor.GlobalReferenceVisitor;
import org.auraframework.impl.visitor.UsageMap;
import org.auraframework.impl.visitor.UsageMapCombiner;
import org.auraframework.impl.visitor.UsageMapSupplier;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.CompositeValidationException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.text.GlobMatcher;
import org.auraframework.util.text.Hash;

import com.google.common.base.Optional;
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

    protected ContextService contextService;

    private CachingService cachingService;

    private LoggingService loggingService;

    private ConfigAdapter configAdapter;

    private AccessChecker accessChecker;

    private AuraGlobalControllerDefRegistry globalControllerDefRegistry;

    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass) {
        return getDefDescriptor(qualifiedName, defClass, null);
    }

    @Override
    @CheckForNull
    public <T extends Definition, B extends Definition> DefDescriptor<T> getDefDescriptor(
            @CheckForNull String qualifiedName, @CheckForNull Class<T> defClass,
            @CheckForNull DefDescriptor<B> bundle) {

        if (qualifiedName == null || defClass == null) {
            //FIXME: we should not throw here.
            throw new AuraRuntimeException("descriptor is null");
        }
        if (defClass == ActionDef.class) {
            return SubDefDescriptorImpl.getInstance(qualifiedName, defClass, ControllerDef.class);
        }
        DescriptorKey dk = new DescriptorKey(qualifiedName, defClass, bundle);

        Cache<DescriptorKey, DefDescriptor<? extends Definition>> cache = null;
        if (cachingService != null) {
            cache = cachingService.getDefDescriptorByNameCache();
        }

        DefDescriptor<T> result = null;
        if (cache != null) {
            @SuppressWarnings("unchecked")
            DefDescriptor<T> cachedResult = (DefDescriptor<T>) cache.getIfPresent(dk);
            result = cachedResult;
        }
        if (result == null) {
            if (defClass == TypeDef.class && qualifiedName.indexOf("://") == -1) {
                TypeDef typeDef = AuraStaticTypeDefRegistry.INSTANCE.getInsensitiveDef(qualifiedName);
                if (typeDef != null) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<T> typeDescriptor = (DefDescriptor<T>) typeDef.getDescriptor();
                    return typeDescriptor;
                }
            }
            result = new DefDescriptorImpl<>(qualifiedName, defClass, bundle, contextService);

            // Our input names may not be qualified, but we should ensure that
            // the fully-qualified is properly cached to the same object.
            // I'd like an unqualified name to either throw or be resolved first,
            // but that's breaking or non-performant respectively.
            if (!dk.getName().equals(result.getQualifiedName())) {
                DescriptorKey fullDK = new DescriptorKey(result.getQualifiedName(), defClass, result.getBundle());

                @SuppressWarnings("unchecked")
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

    // TEMPORARY HACK TO SUPPORT TEST SUITES IN MAIN WITHOUT CHANGES
    private <T extends Definition> DefDescriptor<T> replaceBundleOnTestSuiteDescriptor(DefDescriptor<T> descriptor) {
        DefDescriptor<? extends BaseComponentDef> bundle = null;

        if (descriptor.getDefType() != DefType.TESTSUITE || descriptor.getBundle() != null) {
            return descriptor;
        }
        @SuppressWarnings("unchecked")
        Class<T> clazz = (Class<T>)descriptor.getDefType().getPrimaryInterface();
        bundle = getDefDescriptor(descriptor, DefDescriptor.MARKUP_PREFIX, ComponentDef.class);
        if (!exists(bundle)) {
            bundle = getDefDescriptor(descriptor, DefDescriptor.MARKUP_PREFIX, ApplicationDef.class);
        }
        return getDefDescriptor(descriptor.getQualifiedName(), clazz, bundle);
    }
    // END TEMPORARY HACK TO SUPPORT TEST SUITES IN MAIN WITHOUT CHANGES

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

        descriptor = replaceBundleOnTestSuiteDescriptor(descriptor);        // TESTSUITE HACK.

        // TODO: Clean up so that we just walk up descriptor trees and back down them.
        Optional<T> optLocalDef = null;
        if (descriptor instanceof SubDefDescriptor) {
            // Case 1: SubDef
            SubDefDescriptor<T, ?> subDefDescriptor = (SubDefDescriptor<T, ?>) descriptor;
            def = getDefinition(subDefDescriptor.getParentDescriptor()).getSubDefinition(subDefDescriptor);
        } else if ((optLocalDef = context.getLocalDef(descriptor)) != null) {
            // Case 2: LocalDef
            def = optLocalDef.orNull();
        } else if (threadLinker.get() != null) {
            // Case 2: Nested get. This should be removed, but is somewhat complicated, because we compile
            // in-line.
            //
            // If our current linker is not null, we want to recurse in to properly include the defs when we
            // are compiling. Note that in this case, we already own the lock, so it can be outside the locking below.
            // When we are 'building' instead of 'compiling' we should already have the def somewhere, so we just
            // fill it in and continue. If no def is present, we explode.
            //
            def = threadLinker.get().getDefinitionDuringLink(descriptor);
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

                    loadDE(de);
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

        descriptor = replaceBundleOnTestSuiteDescriptor(descriptor);        // TESTSUITE HACK.
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
            Source<T> source = reg.getSource(descriptor);
            // This is a bit of a hack.
            if (source instanceof BundleSource) {
                Map<DefDescriptor<?>,Source<?>> sources = ((BundleSource<T>)source).getBundledParts();
                @SuppressWarnings("unchecked")
                Source<T> newSource = (Source<T>)sources.get(descriptor);
                return newSource;
            }
            return source;
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
            singleMatch = replaceBundleOnTestSuiteDescriptor(singleMatch);        // TESTSUITE HACK.
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
                Collection<DefRegistry> matchedRegistries = context.getRegistries().getRegistries(matcher);
                for (DefRegistry reg : matchedRegistries) {
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
                                                return accessChecker.checkAccess(
                                                    referenceDescriptor.getDescriptor(),
                                                    getUnlinkedDefinition(regRes),
                                                    context.getAccessCheckCache());
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

    @Override
    public Set<DefDescriptor<?>> findByTags(final Set<String> namespaces, Set<String> tags) {
        final String filterKey = tags.toString();
        Set<DefDescriptor<?>> matched = Sets.newHashSet();
        AuraContext context = contextService.getCurrentContext();
        Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache = cachingService.getDescriptorFilterCache();
        Lock rLock = cachingService.getReadLock();

        rLock.lock();
        try {
            //
            // We _never_ cache non-constant namespaces. We'd like to make them illegal, but for the moment
            // we will make them undesirable.
            //
            Collection<DefRegistry> registries = context.getRegistries().getAllRegistries();
            for (DefRegistry reg : registries) {
                if (reg.hasFind()) {
                    Set<DefDescriptor<?>> registryResults = null;
                    boolean partial_overlap = false;

                    if (namespaces != null) {
                        //
                        // If we have a namespace filter, we may need to filter the results from the
                        // registry, and we may be able to ignore some registries, so do that calculation
                        // here.
                        //
                        int ns_overlap = Sets.intersection(reg.getNamespaces(), namespaces).size();
                        if (ns_overlap == 0) {
                            // No namespaces from the registry are included... bolt.
                            continue;
                        }
                        if (ns_overlap != reg.getNamespaces().size()) {
                            // not all namespaces from the registry are included.
                            partial_overlap = true;
                        }
                    }
                    if (reg.isCacheable()) {
                        // cache results per registry
                        String cacheKey = filterKey + "|" + reg.toString();
                        registryResults = descriptorFilterCache.getIfPresent(cacheKey);
                        if (registryResults == null) {
                            registryResults = reg.findByTags(tags);
                            descriptorFilterCache.put(cacheKey, registryResults);
                        }
                    } else {
                        registryResults = reg.findByTags(tags);
                    }
                    if (partial_overlap) {
                        registryResults = registryResults.stream()
                            .filter(x -> namespaces.contains(x.getNamespace()))
                            .collect(Collectors.toSet());
                    }
                    matched.addAll(registryResults);
                }
            }
        } finally {
            rLock.unlock();
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

        contextService.assertEstablished();
        context = contextService.getCurrentContext();
        if (context.getPreloadedDefinitions() == null) {
            Set<DefDescriptor<?>> remove = null;
            Map<DefDescriptor<?>, String> clientLoaded = context.getClientLoaded();
            context.setPreloadedDefinitions(Collections.emptySet());
            //
            // TODO (optimize): we could reverse this set randomly to try
            // to sanitize the list in opposite directions. No need to be
            // exact (hard to test though).
            //
            for (Map.Entry<DefDescriptor<?>, String> entry : clientLoaded.entrySet()) {
                DefDescriptor<?> descriptor = entry.getKey();
                if (context.getPreloadedDefinitions().contains(descriptor)) {
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
                    context.addPreloadedDefinitions(deps);
                    if (!deps.isEmpty()) {
                        for (DefDescriptor<?> x : clientLoaded.keySet()) {
                            if (x == descriptor) break;         // only look at the descriptors before the current one in the list 
                            if (deps.contains(x)) {
                                if (remove == null) {
                                    remove = Sets.newHashSetWithExpectedSize(clientLoaded.size());
                                }
                                remove.add(x);
                            }
                        }
                    }
                }
            }
            
            if (remove != null) {
                for (DefDescriptor<?> x : remove) {
                    context.dropLoaded(x);
                }
            }
        } 

        //
        // Now make sure that our current definition is somewhere there
        // If this fails, we will throw an exception, and all will be
        // well.
        //
        if (loading != null && !context.getPreloadedDefinitions().contains(loading) && !context.getLoaded().containsKey(loading)) {
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
        this.accessChecker = new AccessChecker(configAdapter);
    }

    @Inject
    public void setAuraGlobalControllerDefRegistry(AuraGlobalControllerDefRegistry globalControllerDefRegistry) {
        this.globalControllerDefRegistry = globalControllerDefRegistry;
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
                if (threadLinker.get() != null) {
                    throw new AuraRuntimeException("Ugh, nested getUID on " + threadLinker.toString()
                            + " trying to get a UID for " + descriptor);
                }
                de = compileDE(descriptor);
                //
                // If we can't find our descriptor, we just give back a null.
                if (de == null) {
                    return null;
                }
            } else if (de.dependencyMap != null) {
                loadDE(de);
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
     * Get the cacheable flag for a uid.
     *
     * @param uid the UID for the definition (must have called {@link #getUid(String, DefDescriptor<?>)}).
     */
    @Override
    public boolean isDependencySetCacheable(String uid) {
        if (uid == null) {
            return false;
        }
        DependencyEntry de = contextService.getCurrentContext().getLocalDependencyEntry(uid);
        if (de == null) {
            return false;
        }
        return de.cacheable;
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

        if (de != null && de.dependencyMap != null) {
            return Collections.unmodifiableSet(de.dependencyMap.keySet());
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

    @Override
    public Set<PropertyReference> getGlobalReferences(String uid, String root) {
        if (uid == null) {
            return null;
        }
        DependencyEntry de = contextService.getCurrentContext().getLocalDependencyEntry(uid);

        if (de != null) {
            Set<PropertyReference> refs = (de.globalReferencesMap != null ? de.globalReferencesMap.get(root) : null);
            if (refs == null) {
                try {
                    return buildRefs(root, de.dependencyMap);
                } catch (QuickFixException qfe) {
                    return null;
                }
            }
            return refs;
        }
        return null;
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, D def)
            throws QuickFixException {
        accessChecker.assertAccess(referencingDescriptor, def, 
                contextService.getCurrentContext().getAccessCheckCache());
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> void assertAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
            throws QuickFixException {
        accessChecker.assertAccess(referencingDescriptor, getDefinition(accessDescriptor),
                contextService.getCurrentContext().getAccessCheckCache());
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public boolean hasAccess(DefDescriptor<?> referencingDescriptor, DefDescriptor<?> accessDescriptor)
            throws QuickFixException {
        return accessChecker.checkAccess(referencingDescriptor, getDefinition(accessDescriptor),
                contextService.getCurrentContext().getAccessCheckCache());
    }

    /**
     * assert that the referencingDescriptor has access to the definition.
     */
    @Override
    public <D extends Definition> boolean hasAccess(DefDescriptor<?> referencingDescriptor, D def)
            throws QuickFixException {

        return accessChecker.checkAccess(referencingDescriptor, def,
                contextService.getCurrentContext().getAccessCheckCache());
        
    }

    @Override
    public boolean hasInterface(DefDescriptor<? extends BaseComponentDef> descriptor, DefDescriptor<InterfaceDef> interfaceDef) throws QuickFixException {
        if (descriptor == null) {
            return false;
        }
        BaseComponentDef def = getDefinition(descriptor);
        if (def == null) {
            return false;
        }
        Set<DefDescriptor<InterfaceDef>> interfaces = def.getInterfaces();
        DefDescriptor<? extends BaseComponentDef> parent = def.getExtendsDescriptor();
        while (interfaces != null && interfaces.size() > 0 || (parent != null)) {
            if (interfaces.contains(interfaceDef)) {
                return true;
            }
            if (parent == null) {
                break;
            }
            def = getDefinition(parent);
            if (def == null) {
                return false;
            }
            interfaces = def.getInterfaces();
            parent = def.getExtendsDescriptor();
        }
        return false;
    }

    // FIXME: These should move to caching service.

    /**
     * Creates a key for the localDependencies, using DefType, FQN, and modules
     * */
    private String makeLocalKey(@Nonnull DefDescriptor<?> descriptor) {
        String key = descriptor.getDefType().toString() + ":" + descriptor.getQualifiedName().toLowerCase();
        return key;
    }

    /**
     * Creates a key for the global {@link CachingServiceImpl#defsCache}, using UID, type, FQN, and modules
     */
    private String makeGlobalKey(String uid, @Nonnull DefDescriptor<?> descriptor) {
        return uid + "/" + makeLocalKey(descriptor);
    }

    /**
     * Creates a key for the global {@link CachingServiceImpl#defsCache}, using only descriptor (and Mode internally).
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
     * Please look at {@link org.auraframework.impl.context.AuraContextImpl.LocalDefs#localDependencies}
     * if you are mucking in here.
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
    @CheckForNull
    protected <T extends Definition> DependencyEntry compileDE(@Nonnull DefDescriptor<T> descriptor) throws QuickFixException{
        // See localDependencies comment
        AuraLinker linker = threadLinker.get();
        AuraContext context = contextService.getCurrentContext();
        String key = makeLocalKey(descriptor);
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = cachingService.getDefsCache();

        linker = new AuraLinker(descriptor, defsCache,
                cachingService.getDefDescriptorByNameCache(),
                loggingService, configAdapter, accessChecker, context.getAuraLocalStore(),
                context.getAccessCheckCache(), context.getRegistries());

        threadLinker.set(linker);
        try {
            linker.addMap(globalControllerDefRegistry.getAll());
            Definition def;
            loggingService.startTimer(LoggingService.TIMER_DEFINITION_CREATION);
            try {
                def = linker.linkDefinition(descriptor, false);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_DEFINITION_CREATION);
            }

            if (def == null) {
                return null;
            }

            Collection<LinkingDefinition<?>> sorted = linker.getNameSort();

            //
            // Now walk the sorted list, building up our dependencies, and uid
            //
            StringBuilder sb = new StringBuilder(256);
            Hash.StringBuilder globalBuilder = new Hash.StringBuilder();
            for (LinkingDefinition<?> cd : sorted) {
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
            // UID is calculated with ALL defs of both component and module so the UID remains the same
            String uid = globalBuilder.build().toString();

            //
            // Now try a re-lookup. This may catch existing cached
            // entries where uid was null.
            //
            DependencyEntry de = getDE(uid, descriptor);
            if (de != null) {
                return de;
            }
            Map<DefDescriptor<? extends Definition>, Definition> deps = Maps.newLinkedHashMap();
            // level sorting is important for css and aura:library dependency ordering
            sorted = linker.getDepthSort();

            sorted.stream().forEach(cd -> deps.put(cd.descriptor, cd.def));

            Map<String,Set<PropertyReference>> globalRefs = null;
            if (descriptor.getDefType() == DefType.APPLICATION) {
                globalRefs = Maps.newHashMap();
                Set<PropertyReference> labels = buildRefs(AuraValueProviderType.LABEL.getPrefix(), deps);
                globalRefs.put(AuraValueProviderType.LABEL.getPrefix(), labels);
            }


            de = new DependencyEntry(uid, deps, linker.getClientLibs(),
                    linker.getShouldCacheDependencies(), globalRefs);

            Cache<String, DependencyEntry> depsCache = cachingService.getDepsCache();

            // put UID-qualified descriptor key for dependency
            // This is always placed in cache, which means that we will not trigger COOSE for components
            // that have already been put in cache, and have the UID on the client.
            // This behaviour is the same as historical behaviour, and we will not change it at the
            // moment. Note that it also helps perf markedly.
            depsCache.put(makeGlobalKey(de.uid, descriptor), de);

            if (linker.getShouldCacheDependencies()) {
                // put unqualified descriptor key for dependency
                depsCache.put(makeNonUidGlobalKey(descriptor), de);
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
            threadLinker.set(null);
        }
    }

    /**
     * Get a dependency entry for a given uid.
     *
     * This is a convenience routine to check both the local and global cache for a value.
     *
     * Please look at {@link org.auraframework.impl.context.AuraContextImpl.LocalDefs#localDependencies}
     * if you are mucking in here.
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
    @CheckForNull
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
            // retrieves correct DE via module addition to cache key
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
     * Load a DE 'in place' with no tree traversal.
     */
    private <D extends Definition> void loadDE(@Nonnull DependencyEntry de) {
        AuraContext context = contextService.getCurrentContext();
        for (Map.Entry<DefDescriptor<?>, Definition> entry : de.dependencyMap.entrySet()) {
            context.addLocalDef(entry.getKey(), entry.getValue());
        }
    }

    private final ThreadLocal<AuraLinker> threadLinker = new ThreadLocal<>();

    @Override
    public void warmCaches() {
        AuraContext context = contextService.getCurrentContext();
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = cachingService.getDefsCache();
        AuraLinker linker = new AuraLinker(null, defsCache,
                cachingService.getDefDescriptorByNameCache(),
                loggingService, configAdapter, accessChecker, context.getAuraLocalStore(),
                context.getAccessCheckCache(), context.getRegistries());
        linker.addMap(globalControllerDefRegistry.getAll());
        long startTime = System.currentTimeMillis();
        long incremental;

        DefType [] types = new DefType [] { DefType.LIBRARY, DefType.COMPONENT, DefType.MODULE, DefType.APPLICATION };

        for (DefRegistry registry : context.getRegistries().getAllRegistries()) {
            if (registry instanceof CompilingDefRegistry
                    || (registry instanceof BundleAwareDefRegistry && registry.isCacheable())) {
                incremental = System.currentTimeMillis();
                for (String namespace : registry.getNamespaces()) {
                    for (DefType type : types) {
                        DescriptorFilter filter = new DescriptorFilter(namespace+":*", type);
                        linker.warmDefinitions(registry.find(filter));
                    }
                }
                incremental = System.currentTimeMillis() - incremental;
                loggingService.info("warmCaches: PROCESSED CompilingDefRegistry with namespaces = "+registry.getNamespaces()
                        +", time = "+incremental);
            } else {
                loggingService.warn("warmCaches: SKIP "+registry.getClass().getSimpleName()
                            +" with prefixes="+registry.getPrefixes()
                            +" with namespace="+registry.getNamespaces()
                            +" with defTypes="+registry.getDefTypes());
            }
        }
        long elapsedTime = System.currentTimeMillis() - startTime;
        loggingService.info("warmCaches(END): Total time ="+elapsedTime);
    }

    private UsageMap<PropertyReference> getReferenceUsageMap(String root,
            Map<DefDescriptor<? extends Definition>, Definition> defs) {
        return defs.entrySet().stream().collect(
                Collector.of(new UsageMapSupplier<PropertyReference>(),
                    new GlobalReferenceVisitor(root),
                    new UsageMapCombiner<PropertyReference>()));
    }

    private Set<PropertyReference> buildRefs(String root, Map<DefDescriptor<? extends Definition>, Definition> defs)
            throws QuickFixException {
        GlobalValueProvider provider = contextService.getCurrentContext().getGlobalProviders().get(root);
        Map<Throwable, Collection<Location>> errors = Maps.newLinkedHashMap();
        Set<PropertyReference> result = Sets.newHashSet();
        UsageMap<PropertyReference> refs = getReferenceUsageMap(root, defs);
        for (Map.Entry<PropertyReference, Set<Location>> entry: refs.entrySet()) {
            try {
                provider.validate(entry.getKey());
                result.add(entry.getKey());
            } catch (InvalidExpressionException iee) {
                errors.put(iee, entry.getValue());
            }
        }
        if (errors.size() > 0) {
            throw new CompositeValidationException("Unable to load values for "+root, errors);
        }
        return result;
    }

    @Override
    public Set<String> getGlobalReferences(String root, Map<DefDescriptor<? extends Definition>, Definition> defs)
            throws QuickFixException {
        Set<PropertyReference> refs = buildRefs(root, defs);
        Set<String> result = Sets.newHashSet();

        for (PropertyReference pr : refs) {
            result.add(pr.toString());
        }
        return result;
    }

    @Override
    public void populateGlobalValues(String root, Map<DefDescriptor<? extends Definition>, Definition> defs)
            throws QuickFixException {
        GlobalValueProvider provider = contextService.getCurrentContext().getGlobalProviders().get(root);
        Map<Throwable, Collection<Location>> errors = Maps.newLinkedHashMap();
        UsageMap<PropertyReference> refs = getReferenceUsageMap(root, defs);
        for (Map.Entry<PropertyReference, Set<Location>> entry: refs.entrySet()) {
            try {
                provider.validate(entry.getKey());
                provider.getValue(entry.getKey());
            } catch (InvalidExpressionException iee) {
                errors.put(iee, entry.getValue());
            }
        }
        if (errors.size() > 0) {
            throw new CompositeValidationException("Unable to load values for "+root, errors);
        }
    }
}
