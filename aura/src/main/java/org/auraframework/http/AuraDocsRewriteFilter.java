/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import javax.servlet.*;

/**
 * A quick and dirty way to add a cross-app-server compatible mount point for AuraDocs that will always use PROD mode.
 *
 *
 *
 */
public class AuraDocsRewriteFilter implements Filter {

    private ServletContext servletContext;

    private static final String uriPattern = "/aura?aura.tag=auradocs:docs.app&aura.format=HTML&aura.deftype=APPLICATION&aura.access=AUTHENTICATED&aura.mode=PROD";

    @Override
    public void destroy() {

    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        RequestDispatcher dispatcher = servletContext.getRequestDispatcher(uriPattern);

        if(dispatcher != null){
            dispatcher.forward(req, res);
            return;
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {

        servletContext = config.getServletContext();
    }

}
