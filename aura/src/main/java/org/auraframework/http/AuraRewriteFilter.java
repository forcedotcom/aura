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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;

/**
 */
public class AuraRewriteFilter implements Filter {

    private ServletContext servletContext;

    private static final String uriPattern = "/aura?aura.tag=%s:%s&aura.format=HTML&aura.deftype=%s&aura.access=%s";

    private static final Pattern publicPattern = Pattern.compile("^/public/([^/]*)/([^/]*).app");
    private static final Pattern appPattern = Pattern.compile("^/([^/]*)/([^/]*).app");
    private static final Pattern cmpPattern = Pattern.compile("^/([^/]*)/([^/]*).cmp");

    @Override
    public void destroy() {

    }

    private static String createURI(String namespace, String name, String defType, String access, String qs) {
        String ret = String.format(uriPattern, namespace, name, defType, access);

        if (qs != null) {
            ret = String.format("%s&%s", ret, qs);
        }

        return ret;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException,
            IOException {

        HttpServletRequest request = (HttpServletRequest) req;

        String path = request.getRequestURI().substring(request.getContextPath().length());
        String qs = request.getQueryString();

        String newUri = null;
        Matcher pubMatcher = publicPattern.matcher(path);
        if (pubMatcher.matches()) {
            newUri = createURI(pubMatcher.group(1), pubMatcher.group(2), DefType.APPLICATION.name(),
                    Access.PUBLIC.name(), qs);
        } else {
            Mode mode = AuraContextFilter.mode.get(request, Mode.PROD);
            String ns;
            String name;
            String type = null;
            Matcher matcher = null;

            Matcher appMatcher = appPattern.matcher(path);
            if (appMatcher.matches()) {
                matcher = appMatcher;
                type = DefType.APPLICATION.name();
            } else {
                Matcher cmpMatcher = cmpPattern.matcher(path);
                if (cmpMatcher.matches()) {
                    matcher = cmpMatcher;
                    type = DefType.COMPONENT.name();
                }
            }
            if (matcher != null) {
                if (mode == Mode.JSTEST || mode == Mode.JSTESTDEBUG) {
                    qs = String.format("descriptor=%s:%s&defType=%s", matcher.group(1), matcher.group(2), type);
                    ns = "aurajstest";
                    name = "jstest";
                    type = DefType.APPLICATION.name();
                } else {
                    ns = matcher.group(1);
                    name = matcher.group(2);
                }
                newUri = createURI(ns, name, type, Access.AUTHENTICATED.name(), qs);
            }

        }
        if (newUri != null && !newUri.isEmpty()) {
            RequestDispatcher dispatcher = servletContext.getRequestDispatcher(newUri);

            if (dispatcher != null) {
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
