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

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.CSP.PolicyBuilder;

/**
 * Servlet filter for adding Content Security Policy headers,
 * per the <a href="http://www.w3.org/TR/CSP/">W3C Content Security
 * Policy 1.0 spec</a>.
 */
public class AuraCSPFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
            ServletException {

        HttpServletResponse response = (HttpServletResponse) res;
        
        PolicyBuilder p = new PolicyBuilder();
        p
        .default_src(CSP.NONE)
        .report_uri(CSPReporterServlet.URL);
        
        // TODO only set if not previously set?
        response.setHeader(CSP.Header.REPORT_ONLY, p.build());
        
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {}
    
    @Override
    public void destroy() {}
}
