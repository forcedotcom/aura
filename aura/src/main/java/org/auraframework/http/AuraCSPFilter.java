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
import java.util.Set;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.CSP.PolicyBuilder;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

import com.google.common.collect.ImmutableSet;

/**
 * Servlet filter for adding Content Security Policy headers,
 * per the <a href="http://www.w3.org/TR/CSP/">W3C Content Security
 * Policy 1.0 spec</a>.
 */
public class AuraCSPFilter implements Filter {
    
    /* TODO: try and get rid of these--see comments on doesUrlAllowInline() */
    private static final String APPLICATION = ".*\\.app";
    private static final String COMPONENT   = ".*\\.cmp";
    private static final String FRAMEWORK_JS= ".*/aura_" + getFrameworkJsSuffixRegex() + "\\.js";
    
    private static final Set<String> INLINE_ALLOWED_URLS = ImmutableSet.of(APPLICATION, COMPONENT, FRAMEWORK_JS);
    
    protected static final String CHROME_EXTENSION = "chrome-extension:";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
            ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        
        // set the policy to only report--not disallow--violations
        if (response.getHeader(CSP.Header.REPORT_ONLY) == null) {
            /* 
             * only set header if not already set--important because Aura request URIs get rewritten
             * and run through here multiple times, and we must use the client's (first) version of the URI
             * to choose our policy
             */
            response.setHeader(CSP.Header.REPORT_ONLY, getPolicy(request.getRequestURI()));
        }
        
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {}
    
    @Override
    public void destroy() {}
    
    protected String getPolicy(String url) { 
        PolicyBuilder p = new PolicyBuilder();
        p.connect_src(CSP.SELF)
            .default_src(CSP.SELF)
            .img_src(CSP.ALL)
            .font_src(CSP.ALL)
            .report_uri(CSPReporterServlet.URL);
        
        // note that chrome-extensions can cause violations, and we don't generally care.
        if (doesUrlAllowInline(url)) {
            p.script_src(CSP.SELF, CHROME_EXTENSION, CSP.UNSAFE_EVAL, CSP.UNSAFE_INLINE)
                .style_src(CSP.SELF, CHROME_EXTENSION, CSP.UNSAFE_INLINE);
        } else {
            p.script_src(CSP.SELF, CHROME_EXTENSION)
                .style_src(CSP.SELF, CHROME_EXTENSION);
        }
        
        return p.build();
    }
    
    /*
     * This is a (hopefully) temporary solution.
     * 
     * As the names imply, CSP strongly discourages use of unsafe-eval and unsafe-inline,
     * but parts of the Aura client depend on inlining, in particular the initial page template,
     * and fixing this the last week of feature development is scary.
     * 
     * NOTE: this should be fixed sooner rather than later, because the initial template *is*
     * configurable by consumers, and is therefore a vector for attack.
     */
    protected final boolean doesUrlAllowInline(String url) {
        for (String pattern : INLINE_ALLOWED_URLS) {
            if (url.matches(pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    private static String getFrameworkJsSuffixRegex() {
        StringBuilder sb = new StringBuilder();
        sb.append("(");
        boolean first = true;
        for (String suffix : JavascriptGeneratorMode.getSuffixes()) {
            if (!first) {
                sb.append("|");
            }
            sb.append(suffix);
            
            first = false;
        }
        sb.append(")");
        
        return sb.toString();
    }
}
