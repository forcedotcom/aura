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

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.http.AuraFrameworkServlet;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;

import com.google.common.collect.ImmutableMap;

/**
 * Service for including external client libraries (CSS or JS)
 */
@ServiceComponent
public class ClientLibraryServiceImpl implements ClientLibraryService {
    private ContextService contextService;

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    private static class Paths {
        private final String normal;
        private final String minified;

        public Paths(String normal, String minified) {
            this.normal = normal;
            this.minified = minified;
        }

        public String getNormal() {
            return this.normal;
        }

        public String getMinified() {
            return this.minified;
        }
    }

    private final Map<String, Paths> libraryMap;

    public ClientLibraryServiceImpl() {
        this.libraryMap = new ImmutableMap.Builder<String,Paths>()
            .put("CkEditor",
                 new Paths("ckeditor/ckeditor-4.x/rel/ckeditor.js", "ckeditor/ckeditor-4.x/rel/ckeditor.js"))
            .put("DOMPurify",
                 new Paths("DOMPurify/DOMPurify.js", "DOMPurify/DOMPurify.min.js"))
            .put("engine",
                 new Paths("engine/engine.js", "engine/engine.min.js"))
            .put("locker", 
                 new Paths("lockerservice/aura-locker.js", "lockerservice/aura-locker.min.js"))
            .put("locker-disabled", 
                 new Paths("lockerservice/aura-locker-disabled.js", "lockerservice/aura-locker-disabled.min.js"))
            .build();
    }

    /**
     * Gets resolver for resolution. Empty string if none
     *
     * @return resolved url or null
     */
    @Override
    public String getResolvedUrl(ClientLibraryDef clientLibrary) {
        if (clientLibrary == null || clientLibrary.getType() != ClientLibraryDef.Type.JS) {
            return null;
        }
        return getResolvedUrlByName(clientLibrary.getLibraryName());
    }

    /**
     * Gets resolver for resolution. Empty string if none
     *
     * @return resolved url or null
     */
    @Override
    public String getResolvedUrlByName(String name) {
        Paths paths = libraryMap.get(name);
        if (paths == null) {
            return null;
        }
        AuraContext.Mode mode = contextService.getCurrentContext().getMode();
        String location;

        if (mode.prettyPrint()) {
            location = paths.getNormal();
        } else {
            location = paths.getMinified();
        }

        String nonce = contextService.getCurrentContext().getFrameworkUID();
        String contextPath = contextService.getCurrentContext().getContextPath();
        return String.format(AuraFrameworkServlet.RESOURCES_FORMAT, contextPath, nonce, location);
    }
}
