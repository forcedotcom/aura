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
package org.auraframework.http;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraResource;

import com.google.common.collect.Maps;

/**
 * The aura resource servlet.
 * 
 * This servlet serves up the application content for 'preloaded' definitions. It should be cacheable, which means that
 * the only context used should be the context sent as part of the URL. If any other information is required, caching
 * will cause bugs.
 * 
 * Note that this servlet should be very careful to not attempt to force the client to re-sync (except for manifest
 * fetches), since these calls may well be to re-populate a cache. In general, we should send back at least the basics
 * needed for the client to survive. All resets should be done from {@link AuraServlet}, or when fetching the manifest
 * here.
 */
public class AuraResourceServlet extends AuraBaseServlet {

    private static final long serialVersionUID = -3642790050433142397L;
    public static final String ORIG_REQUEST_URI = "aura.origRequestURI";

    private final Map<String,AuraResource> nameToResource = Maps.newHashMap();

    private ContextService contextService;
    
    private void addResource(AuraResource resource) {
        String name = resource.getName();
        if (name != null) {
            this.nameToResource.put(name, resource);
        }
    }

    protected AuraResource findResource(String fullName) {
        if (fullName == null) {
            return null;
        }
        int lIndex = fullName.lastIndexOf("/");
        String last = null;
        int qIndex;

        if (lIndex < fullName.length()) {
            last = fullName.substring(lIndex + 1);
            qIndex = last.indexOf("?");
            if (qIndex > -1) {
                last = last.substring(0, qIndex);
            }
            AuraResource resource = nameToResource.get(last);
            if (resource != null) {
                return resource;
            }
        }
        return null;
    }


    /**
     * Serves up CSS or JS resources for an app.
     *
     * @param request the HTTP Request.
     * @param response the HTTP response.
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        AuraContext context = contextService.getCurrentContext();
        AuraResource resource = findResource((String) request.getAttribute(ORIG_REQUEST_URI));
        if (resource == null || context.getApplicationDescriptor() == null) {
            servletUtilAdapter.send404(getServletContext(), request, response);
            return;
        }
        if (servletUtilAdapter.resourceServletGetPre(request, response, resource)) {
            return;
        }
        resource.setContentType(response);

        resource.write(request, response, context);
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    @Inject
    public void setAuraResources(List<AuraResource> auraResources) {
        auraResources.forEach(this::addResource);
    }

}
