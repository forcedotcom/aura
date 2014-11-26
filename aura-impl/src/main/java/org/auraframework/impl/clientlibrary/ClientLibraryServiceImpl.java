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

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.cache.Cache;
import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.clientlibrary.ClientLibraryResolverRegistry;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.clientlibrary.Combinable;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ResourceDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.ClientLibraryException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

//import com.google.common.cache.Cache;
//import com.google.common.cache.CacheBuilder;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import aQute.bnd.annotation.component.Component;

/**
 * Service for including external client libraries (CSS or JS)
 */
@Component (provide=AuraServiceProvider.class)
public class ClientLibraryServiceImpl implements ClientLibraryService {


    private final Cache<String, String>  outputCache;
    private final Cache<String, Set<String>>  urlsCache;


    public ClientLibraryServiceImpl() {
    
    	outputCache = Aura.getCachingService().getClientLibraryOutputCache();
    
        urlsCache = Aura.getCachingService().getClientLibraryUrlsCache();
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

        String url = clientLibrary.getUrl();
        if (StringUtils.isBlank(url)) {
            // Use resolver if url is blank
            ClientLibraryResolver resolver = getResolver(clientLibrary);
            if (resolver != null) {
                url = resolver.getUrl();
            }
        }
        return url;
    }

    /**
     * Checks whether client library can be combined.
     *
     * @param clientLibrary client library
     * @return true if combinable
     */
    @Override
    public boolean canCombine(ClientLibraryDef clientLibrary) throws QuickFixException {

        if(clientLibrary == null) {
            return false;
        }

        if (StringUtils.isBlank(clientLibrary.getUrl())) {
            // Use resolver if url is blank
            ClientLibraryResolver resolver = getResolver(clientLibrary);
            if (resolver != null) {
                return clientLibrary.shouldCombine() && resolver.canCombine();
            } else {
                throw new ClientLibraryException("Client library must have resolver if url is blank: "
                        + clientLibrary.getLibraryName(), clientLibrary.getLocation());
            }
        }

        return clientLibrary.shouldCombine();
    }

    /**
     * Write resources.css
     *
     * @param output output
     * @throws IOException
     * @throws QuickFixException
     */
    @Override
    public void writeCss(AuraContext context, Appendable output) throws IOException, QuickFixException {
        write(context, ClientLibraryDef.Type.CSS, output);
    }

    /**
     * Write resources.js
     *
     * @param output output
     * @throws IOException
     * @throws QuickFixException
     */
    @Override
    public void writeJs(AuraContext context, Appendable output) throws IOException, QuickFixException {
        write(context, ClientLibraryDef.Type.JS, output);
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

        AuraContext.Mode mode = context.getMode();
        String uid = context.getUid(context.getApplicationDescriptor());
        String contextPath = context.getContextPath();
        String nonce = context.getFrameworkUID();

        if (uid == null) {
            return Collections.emptySet();
        }

        //
        // TODO: rethink this caching. It has an awful lot in the keys. Maybe we can prepend the
        // 'prefix' string on output if it is a relative URL.
        //
        String key = new StringBuilder(uid).append(":").append(type).append(":").append(mode)
            .append(":").append(nonce).append(":").append(contextPath).toString();
        Set<String> urls = urlsCache.getIfPresent(key);

        if (urls == null) {

            List<ClientLibraryDef> clientLibs = getClientLibraries(context, type);
            urls = Sets.newLinkedHashSet();

            boolean hasCombines = false;
            String url = null;

            for (ClientLibraryDef clientLib : clientLibs) {

                if (canCombine(clientLib)) {
                    hasCombines = true;
                } else {
                    // add url to list when client library is not combined
                    url = getResolvedUrl(clientLib);
                }

                if (StringUtils.isNotBlank(url)) {
                    urls.add(url);
                }

            }

            if (hasCombines) {
                // all combinable resources are put into resources.css or resources.js
                urls.add(getResourcesPath(context, type));
            }

            urlsCache.put(key, urls);
        }

        return urls;

    }

    /**
     * Writes resources css or js. Gets client libraries that should be combined and is written by their format adapter
     *
     * @param type CSS or JS
     * @param output output
     * @throws IOException
     * @throws QuickFixException
     */
    private void write(AuraContext context, ClientLibraryDef.Type type, Appendable output) throws IOException, QuickFixException {
        if (output == null) {
            throw new AuraRuntimeException("Output cannot be null");
        }

        if (context == null) {
            throw new NoContextException();
        }

        AuraContext.Mode mode = context.getMode();
        String uid = context.getUid(context.getApplicationDescriptor());

        String key = makeCacheKey(uid, mode, type);
        String code = outputCache.getIfPresent(key);

        if (code == null) {
            // no cache yet
            List<ClientLibraryDef> clientLibs = getClientLibraries(context, type);
            Set<Combinable> combinables = Sets.newLinkedHashSet();
            StringBuilder sb = new StringBuilder();

            for (ClientLibraryDef clientLib : clientLibs) {
                if (canCombine(clientLib)) {
                    Combinable combinable = getCombinable(clientLib);
                    if (combinable != null) {
                        combinables.add(combinable);
                    }
                }
            }

            if (!combinables.isEmpty()) {
                // ClientLibraryCSSFormatAdapter or ClientLibraryJSFormatAdapter
                Aura.getSerializationService().writeCollection(combinables, Combinable.class, sb, type.toString());
            }

            code = sb.toString();
            outputCache.put(key, code);
        }

        output.append(code);
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
    private static List<ClientLibraryDef> getClientLibraries(AuraContext context, ClientLibraryDef.Type type) {
        AuraContext.Mode mode = context.getMode();
        String uid = context.getUid(context.getApplicationDescriptor());
        // get all client libraries specified for current app (cmp).
        List<ClientLibraryDef> clientLibs = context.getDefRegistry().getClientLibraries(uid);
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

    /**
     * Calculates resources css or js url ie /l/[context]/resources.css
     *
     * @param type CSS or JS
     * @return
     * @throws QuickFixException
     */
    private static String getResourcesPath(AuraContext context, ClientLibraryDef.Type type) throws QuickFixException {
        String contextPath = context.getContextPath();
        StringBuilder path = new StringBuilder(contextPath).append("/l/");
        StringBuilder sb = new StringBuilder();

        try {
            Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }

        String contextJson = AuraTextUtil.urlencode(sb.toString());
        path.append(contextJson).append("/resources.").append(type.toString().toLowerCase());

        return path.toString();
    }

    /**
     * Creates cache key using the current uid, mode, and type. Caches uncompressed version for DEV or TEST modes,
     * compressed otherwise
     *
     * @param uid application uid
     * @param mode current aura mode
     * @param type CSS or JS
     * @return cache key
     */
    private static String makeCacheKey(String uid, AuraContext.Mode mode, ClientLibraryDef.Type type) {
        StringBuilder key = new StringBuilder();
        key.append(uid).append(":").append(type).append(":");

        if (mode.prettyPrint()) {
            key.append("DEV");
        } else {
            key.append("MIN");
        }
        return key.toString();
    }

    /**
     * Get Combinable to allow getting contents
     *
     * @param clientLibrary client library
     * @return combinable
     * @throws QuickFixException
     */
    private Combinable getCombinable(ClientLibraryDef clientLibrary) throws QuickFixException {
        String url = clientLibrary.getUrl();
        Combinable combinable = null;
        if (StringUtils.isBlank(url)) {
            ClientLibraryResolver resolver = getResolver(clientLibrary);
            if (resolver != null && resolver.canCombine()) {
                // combinable resolver
                combinable = (Combinable) resolver;
            }
        } else if (StringUtils.startsWithIgnoreCase(url, DefDescriptor.CSS_PREFIX + "://") ||
                StringUtils.startsWithIgnoreCase(url, DefDescriptor.JAVASCRIPT_PREFIX + "://")) {
            // if url is qualified name of DefDescriptor<ResourceDef>
            DefDescriptor<ResourceDef> descriptor = DefDescriptorImpl.getInstance(url, ResourceDef.class);
            if (descriptor.exists()) {
                ResourceDef def = descriptor.getDef();
                if (def != null) {
                    combinable = (Combinable) def;
                }
            }
        }
        return combinable;
    }
}
