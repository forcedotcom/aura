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
import java.net.URI;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.resource.AppCss;
import org.auraframework.http.resource.AppJs;
import org.auraframework.http.resource.ClientLibraryCss;
import org.auraframework.http.resource.ClientLibraryJs;
import org.auraframework.http.resource.EncryptionKey;
import org.auraframework.http.resource.Manifest;
import org.auraframework.http.resource.ResourceSvg;
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

    private static ServletContext servletContext;

    private final Map<String,AuraResource> nameToResource = Maps.newHashMap();

    public AuraResourceServlet() {
        addResource(new AppCss());
        addResource(new AppJs());
        addResource(new ClientLibraryJs());
        addResource(new ClientLibraryCss());
        addResource(new Manifest());
        addResource(new ResourceSvg());
        addResource(new EncryptionKey());
    }

    public void addResource(AuraResource resource) {
        this.nameToResource.put(resource.getName(), resource);
    }

    protected AuraResource findResource(AuraContext context, String fullName) {
        if (fullName == null) {
            return null;
        }
        int lindex = fullName.lastIndexOf("/");
        String last = null;
        int qindex;

        if (lindex < fullName.length()) {
            last = fullName.substring(lindex+1);;
            qindex = last.indexOf("?");
            if (qindex > -1) {
                last = last.substring(0, qindex);
            }
            AuraResource resource = nameToResource.get(last);
            if (resource != null) {
                return resource;
            }
        }
        System.out.println("ERROR: Unable to find resource for " + (last != null ? last : fullName));
        return null;
    }

    /**
     * Serves up CSS or JS resources for an app.
     *
     * @param request the HTTP Request.
     * @param response the HTTP response.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        AuraContext context = Aura.getContextService().getCurrentContext();
        AuraResource resource = findResource(context, (String)request.getAttribute(ORIG_REQUEST_URI));
        ServletUtilAdapter servletUtil = Aura.getServletUtilAdapter();
        if (resource == null) {
            servletUtil.send404(request, response);
            return;
        }
        if (servletUtil.resourceServletGetPre(request, response, resource)) {
            return;
        }
        AuraContext.Format format = context.getFormat();
        response.setContentType(getContentType(format));
        setBasicHeaders(context.getApplicationDescriptor(), request, response);
        if (resource.isCSRFProtect()) {
            try {
                Aura.getConfigAdapter().validateCSRFToken(csrfToken.get(request));
            } catch (Throwable t) {
                servletUtil.handleServletException(t, true, context, request, response, false);
                return;
            }
        }
        resource.write(request, response, context);
    }

    public static boolean isResourceLocallyAvailable(String resourceURI) {
        if (resourceURI != null && resourceURI.startsWith("/") && servletContext != null) {
            try {
                URI uri = URI.create(resourceURI);
                if (uri != null) {
                    ServletContext c = servletContext.getContext(uri.getPath());
                    if (c != null && c.getResource(uri.getPath()) != null) {
                        return true;
                    }
                }
            } catch (Exception e) {
            }
        }
        return false;
    }

    @Override
    public void init(ServletConfig config) {
        servletContext = config.getServletContext();
    }
}
