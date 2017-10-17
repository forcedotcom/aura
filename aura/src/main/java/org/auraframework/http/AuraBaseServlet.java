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

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

@SuppressWarnings("serial")
public abstract class AuraBaseServlet extends HttpServlet {
    public static final String AURA_PREFIX = "aura.";
    public static final String CSRF_PROTECT = "while(1);\n";

    /**
     * "Short" pages (such as manifest cookies and AuraFrameworkServlet pages) expire in 1 day.
     */
    public static final long SHORT_EXPIRE_SECONDS = 24L * 60 * 60;
    public static final long SHORT_EXPIRE = SHORT_EXPIRE_SECONDS * 1000;

    /**
     * "Long" pages (such as resources and cached HTML templates) expire in 45 days. We also use this to "pre-expire"
     * no-cache pages, setting their expiration a month and a half into the past for user agents that don't understand
     * Cache-Control: no-cache.
     * This is the same as ServletUtilAdapterImpl.java
     */
    public static final long LONG_EXPIRE = 45 * SHORT_EXPIRE;
    public static final String UTF_ENCODING = "UTF-8";

    protected ServletUtilAdapter servletUtilAdapter;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        processInjection(config);
    }
    
    public void processInjection(ServletConfig config) {
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, config.getServletContext());
    }
    
    @Deprecated
    protected void send404(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        servletUtilAdapter.send404(getServletConfig().getServletContext(), request, response);
    }
    
    @Inject
    public void setServletUtilAdapter(ServletUtilAdapter servletUtilAdapter) {
        this.servletUtilAdapter = servletUtilAdapter;
    }
}
