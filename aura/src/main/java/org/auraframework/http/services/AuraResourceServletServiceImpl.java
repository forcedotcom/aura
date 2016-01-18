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
package org.auraframework.http.services;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.http.resource.*;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraResource;

import com.google.common.collect.Maps;

public final class AuraResourceServletServiceImpl implements AuraResourceServletService {

    private final static String ORIG_REQUEST_URI = "aura.origRequestURI";
    private final static StringParam csrfToken = new StringParam(AuraBaseServlet.AURA_PREFIX + "token", 0, true);
    private final Map<String,AuraResource> nameToResource = Maps.newHashMap();

    private final ServletUtilAdapter servletUtilAdapter;
    
    public AuraResourceServletServiceImpl(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
        
        addResource(new AppCss());
        addResource(new AppJs());
        addResource(new ClientLibraryJs());
        addResource(new ClientLibraryCss());
        addResource(new Manifest());
        addResource(new ResourceSvg());
        addResource(new EncryptionKey());
    }
    
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response, ServletContext servletContext) throws ServletException, IOException {
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        AuraContext context = Aura.getContextService().getCurrentContext();
        AuraResource resource = findResource((String)request.getAttribute(ORIG_REQUEST_URI), context);
        ServletUtilAdapter servletUtil = Aura.getServletUtilAdapter();
        if (resource == null) {
            servletUtil.send404(servletContext, request, response);
            return;
        }
        if (servletUtil.resourceServletGetPre(request, response, resource)) {
            return;
        }
        resource.setContentType(response);
        servletUtilAdapter.setCSPHeaders(context.getApplicationDescriptor(), request, response);
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
    
    
    private void addResource(AuraResource resource) {
        this.nameToResource.put(resource.getName(), resource);
    }

    /*
     * we pass in context, just in case someone overriding this function might want to use it.
     */
    private AuraResource findResource(String fullName, AuraContext context) {
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

}
