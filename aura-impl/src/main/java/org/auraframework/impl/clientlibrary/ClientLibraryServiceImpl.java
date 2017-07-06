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
package org.auraframework.impl.clientlibrary;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.clientlibrary.ClientLibraryResolverRegistry;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Service for including external client libraries (CSS or JS)
 */
@ServiceComponent
public class ClientLibraryServiceImpl implements ClientLibraryService {

    @Inject
    DefinitionService definitionService;

    public ClientLibraryServiceImpl() {
    }

    /**
     * Gets resolver for resolution. Empty string if none
     *
     * @return resolved url or null
     */
    @Override
    public String getResolvedUrl(ClientLibraryDef clientLibrary) {
        if (clientLibrary == null) {
            return null;
        }

        ClientLibraryResolver resolver = getResolver(clientLibrary);
        if (resolver == null) {
            return null;
        }
        return resolver.getUrl();
    }

    @Override
    public ClientLibraryResolverRegistry getResolverRegistry() {
        return ClientLibraryResolverRegistryImpl.INSTANCE;
    }

    /**
     * Returns urls that should be requested. All combined client libraries are in resources.(css|js) while other has
     * their own entry
     *
     * @param type CSS or JS
     * @return urls
     * @throws QuickFixException
     */
    @Override
    public Set<String> getUrls(AuraContext context, ClientLibraryDef.Type type) throws QuickFixException {

        if (context == null) {
            throw new NoContextException();
        }

        String uid = context.getUid(context.getApplicationDescriptor());
        if (uid == null) {
            return Collections.emptySet();
        }

        Set<String> urls = Sets.newLinkedHashSet();

        List<ClientLibraryDef> clientLibs = getClientLibraries(context, type);

        String url = null;

        for (ClientLibraryDef clientLib : clientLibs) {

            // add url to list when client library is not combined
            url = getResolvedUrl(clientLib);
            if (StringUtils.isNotBlank(url)) {
                urls.add(url);
            }

        }
        return urls;
    }
    

    @Override
    public Set<String> getPrefetchUrls(AuraContext context, Type type) throws QuickFixException {

        if (context == null) {
            throw new NoContextException();
        }

        String uid = context.getUid(context.getApplicationDescriptor());
        if (uid == null) {
            return Collections.emptySet();
        }

        Set<String> urls = Sets.newLinkedHashSet();

        List<ClientLibraryDef> clientLibs = getClientLibraries(context, type);

        String url = null;

        for (ClientLibraryDef clientLib : clientLibs) {
            if(clientLib.shouldPrefetch()){
                // add url to list when client library is not combined
                url = getResolvedUrl(clientLib);
                if (StringUtils.isNotBlank(url)) {
                    urls.add(url);
                }
            }
        }
        return urls;
    }

    /**
     * Convenience wrapper to get corresponding resolver from registry
     *
     * @param clientLibrary client library
     * @return resolver for client library
     */
    private ClientLibraryResolver getResolver(ClientLibraryDef clientLibrary) {
        return getResolverRegistry().get(clientLibrary.getLibraryName(), clientLibrary.getType());
    }

    /**
     * Loops through all client library definitions of current application and filters by type and current mode
     *
     * @param context current aura context
     * @param type CSS or JS
     * @return list
     */
    private List<ClientLibraryDef> getClientLibraries(AuraContext context, ClientLibraryDef.Type type) {
        AuraContext.Mode mode = context.getMode();
        String uid = context.getUid(context.getApplicationDescriptor());
        // get all client libraries specified for current app (cmp).
        List<ClientLibraryDef> clientLibs = definitionService.getClientLibraries(uid);
        List<ClientLibraryDef> ret = Lists.newArrayList();

        if (clientLibs != null) {
            for (ClientLibraryDef clientLib : clientLibs) {
                // check if client library should be added based on type and current mode
                if (clientLib.shouldInclude(mode, type)) {
                    // check for duplicate client library
                    if (!ret.contains(clientLib)) {
                        ret.add(clientLib);
                    }
                }
            }
        }

        return ret;
    }

}
