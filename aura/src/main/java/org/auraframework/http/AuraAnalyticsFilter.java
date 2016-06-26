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

import java.io.BufferedReader;
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.throwable.AuraRuntimeException;
import org.springframework.http.MediaType;

/**
 */
public class AuraAnalyticsFilter implements Filter {

    private ServletContext servletContext;

    @Override
    public void destroy() {}

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest request = (HttpServletRequest) req;
        
        if (request.getContentType().contains(MediaType.TEXT_PLAIN_VALUE)) {
	        String path = request.getRequestURI().substring(request.getContextPath().length());
	        request.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, path);
	        
	        // This string will always be < 64k 
	        // so should be fine to have it all in memory at once 
	        StringBuffer sb = new StringBuffer("/aura?");
	        String line = null;
	        try {
	          BufferedReader reader = request.getReader();
	          while ((line = reader.readLine()) != null)
	            sb.append(line);
	        } catch (Exception e) {
	        	throw new AuraRuntimeException("Invalid payload for Analytics");
	        }
	        
	        servletContext.getRequestDispatcher(sb.toString()).forward(req, res);

        } else {
        	chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        servletContext = config.getServletContext();
    }

}
