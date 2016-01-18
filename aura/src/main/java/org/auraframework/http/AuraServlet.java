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
import org.auraframework.http.services.AuraServletService;
import org.auraframework.http.services.AuraServletServiceImpl;

/**
 * The servlet for initialization and actions in Aura.
 *
 * The sequence of requests is:
 * <ol>
 * <li>GET(AuraServlet): initial fetch of an aura app/component + Resource Fetches:
 * <ul>
 * <li>GET(AuraResourceServlet:MANIFESt):optional get the manifest</li>
 * <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 * <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 * <li>GET(AuraResourceServlet:JSON):???</li>
 * </ul>
 * </li>
 * <li>Application Execution
 * <ul>
 * <li>GET(AuraServlet:JSON): Fetch additional aura app/component
 * <ul>
 * <li>GET(AuraResourceServlet:MANIFEST):optional get the manifest</li>
 * <li>GET(AuraResourceServlet:CSS):get the styles for a component</li>
 * <li>GET(AuraResourceServlet:JS):get the definitions for a component</li>
 * <li>GET(AuraResourceServlet:JSON):???</li>
 * </ul>
 * </li>
 * <li>POST(AuraServlet:JSON): Execute actions.</li>
 * </ul>
 * </li>
 * </ol>
 *
 * Run from aura-jetty project. Pass in these vmargs: <code>
 * -Dconfig=${AURA_HOME}/config -Daura.home=${AURA_HOME} -DPORT=9090
 * </code>
 *
 * Exception handling is dealt with in {@link #handleServletException} which should almost always be called when
 * exceptions are caught. This routine will use {@link org.auraframework.adapter.ExceptionAdapter ExceptionAdapter} to
 * log and rewrite exceptions as necessary.
 */
public class AuraServlet extends AuraBaseServlet {
    private static final long serialVersionUID = 2218469644108785216L;

    private AuraServletService servletService;

    @Override
    public void init() throws ServletException {
        super.init();
        
        // Eventually should be injected, along with all these dependencies.
        servletService = new AuraServletServiceImpl(
        		Aura.getServletUtilAdapter(), 
        		Aura.getConfigAdapter(), 
        		Aura.getExceptionAdapter(),
        		new ManifestUtil(), 
        		Aura.getContextService(), 
        		Aura.getDefinitionService(), 
        		Aura.getSerializationService(), 
        		Aura.getLoggingService(),
        		Aura.getServerService());
    }

    /**
     * Handle an HTTP GET operation.
     *
     * The HTTP GET operation is used to retrieve resources from the Aura servlet. It is only used for this purpose,
     * where POST is used for actions.
     *
     * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	servletService.doGet(request, response, getServletConfig().getServletContext());
    }

    /**
     * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    	servletService.doPost(request, response);
    }

}
