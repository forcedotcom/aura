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

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.http.services.AuraResourceServletService;
import org.auraframework.http.services.AuraResourceServletServiceImpl;

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

    private final AuraResourceServletService servletService;

    public AuraResourceServlet() {
        servletService = new AuraResourceServletServiceImpl(Aura.getServletUtilAdapter());
    }
    
    /**
     * Serves up CSS or JS resources for an app.
     *
     * @param request the HTTP Request.
     * @param response the HTTP response.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        servletService.doGet(request, response, getServletConfig().getServletContext());
    }
}
