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

import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.service.*;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

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

    @Inject
    private ContextService contextService;

    @Inject
    private CachingService cachingService;
    
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

    @SuppressWarnings({"unchecked", "cast"})
    @Override
    public <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws QuickFixException {
        contextService.assertEstablished();

        AuraContext context = contextService.getCurrentContext();
        T def;

        // TODO: Remove SubDefDescriptor and with it this block of code.
        if (descriptor instanceof SubDefDescriptor) {
            SubDefDescriptor<T, ?> subDefDescriptor = (SubDefDescriptor<T, ?>) descriptor;
            def = getDefinition(subDefDescriptor.getParentDescriptor()).getSubDefinition(subDefDescriptor);
        } else {
            def = context.getDefRegistry().getDef(descriptor);
        }
        if (def != null && descriptor.getDefType() == DefType.APPLICATION && def.getAccess().requiresAuthentication() &&
                context.getAccess() != Authentication.AUTHENTICATED) {
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
    public Definition getDefinition(String qualifiedName, DefType... defTypes) throws QuickFixException {
        contextService.assertEstablished();

        if (defTypes == null || defTypes.length == 0) {
            throw new AuraRuntimeException("defType is required");
        }

        DefDescriptor<?> desc = null;
        for (DefType defType : defTypes) {
            desc = getDefDescriptor(qualifiedName, defType.getPrimaryInterface());
            Definition ret = null;
            try {
                ret = getDefinition(desc);
            } catch (DefinitionNotFoundException e) {
                // ignore
            }
            if (ret != null) {
                return ret;
            }
        }
        throw new DefinitionNotFoundException(desc);
    }

    /**
     * Get the def registry currently in use.
     *
     * @return the master def registry.
     * @throws RuntimeException if the context has not been initialized.
     */
    @Override
    public MasterDefRegistry getDefRegistry() {
        contextService.assertEstablished();
        return contextService.getCurrentContext().getDefRegistry();
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        contextService.assertEstablished();

        AuraContext context = contextService.getCurrentContext();
        return context.getDefRegistry().find(matcher);
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
        MasterDefRegistry mdr;
        Set<DefDescriptor<?>> loaded = Sets.newHashSet();
        Set<DefDescriptor<?>> prev = Sets.newHashSet();
        Set<DefDescriptor<?>> remove = null;

        contextService.assertEstablished();
        context = contextService.getCurrentContext();
        mdr = context.getDefRegistry();
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
                        tuid = mdr.getUid(uid, descriptor);
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
                    Set<DefDescriptor<?>> deps = mdr.getDependencies(uid);
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
            String uid = mdr.getUid(null, loading);

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
}
