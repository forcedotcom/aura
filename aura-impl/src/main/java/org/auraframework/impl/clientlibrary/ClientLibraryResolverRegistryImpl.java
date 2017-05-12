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

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.clientlibrary.ClientLibraryResolverRegistry;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.impl.clientlibrary.resolver.AuraResourceResolver;

/**
 * Url resolver registry singleton
 */
public enum ClientLibraryResolverRegistryImpl implements ClientLibraryResolverRegistry {
    INSTANCE;

    private final Map<String, ClientLibraryResolver> resolvers;

    /**
     * Load framework client libraries
     */
    ClientLibraryResolverRegistryImpl() {
        this.resolvers = new HashMap<>();
        register(new AuraResourceResolver("CkEditor", ClientLibraryDef.Type.JS, "ckeditor/ckeditor-4.x/rel/ckeditor.js", "ckeditor/ckeditor-4.x/rel/ckeditor.js"));
        register(new AuraResourceResolver("DOMPurify", ClientLibraryDef.Type.JS, "DOMPurify/DOMPurify.js", "DOMPurify/DOMPurify.min.js"));
        register(new AuraResourceResolver("engine", ClientLibraryDef.Type.JS, "engine/engine.js", "engine/engine.min.js"));
    }

    /**
     * Register url resolver and adds for cache
     * @param resolver url resolver
     */
    @Override
    public void register(ClientLibraryResolver resolver) {
        if (resolver != null) {
            String name = resolver.getName();
            ClientLibraryDef.Type type = resolver.getType();
            if (StringUtils.isNotBlank(name) && type != null) {
                String key = makeKey(name, type);
                this.resolvers.put(key, resolver);
            }
        }
    }

    /**
     * Returns resolver based on name and type
     *
     * @param name library name
     * @param type library type
     * @return url resolver
     */
    @Override
    public ClientLibraryResolver get(String name, ClientLibraryDef.Type type) {
        if (StringUtils.isBlank(name) || type == null) {
            return null;
        }
        return resolvers.get(makeKey(name, type));
    }

    /**
     * Generate key for resolver
     *
     * @param name name of client library
     * @param type type of client library
     * @return string key
     */
    private String makeKey(String name, ClientLibraryDef.Type type) {
        StringBuilder key = new StringBuilder();
        key.append(name).append(":").append(type);
        return key.toString();
    }
}
