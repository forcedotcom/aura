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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.util.AuraTextUtil;

/**
 */

public class AuraResourceRewriteFilter implements Filter {

    private ServletContext servletContext;

    private static final String uriPattern = "/auraResource?aura.format=%s&aura.context=%s";

    private static final Pattern pattern = Pattern.compile("^/l/([^/]*)/app.?(.*)$");

    @Override
    public void destroy() {

    }

    private static String createURI(String context, String format){
        return String.format(uriPattern, format, AuraTextUtil.urldecode(context));
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        HttpServletRequest request = (HttpServletRequest)req;

        String path = request.getRequestURI().substring(request.getContextPath().length());

        String newUri = null;
        Matcher matcher = pattern.matcher(path);
        if(matcher.matches()){
            newUri = createURI(matcher.group(1), matcher.group(2));
            // Sometimes original request URI can be useful: Eg: manifast in AuraResourceServlet
            request.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI,
                    (request.getQueryString() != null) ? request.getRequestURI() + "?" + request.getQueryString()
                            : request.getRequestURI());
        }

        if (newUri != null) {
            RequestDispatcher dispatcher = servletContext.getRequestDispatcher(newUri);

            if(dispatcher != null){
                dispatcher.forward(req, res);
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {

        servletContext = config.getServletContext();
    }

}
