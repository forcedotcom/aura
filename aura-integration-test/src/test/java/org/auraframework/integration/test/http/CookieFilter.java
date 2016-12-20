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
package org.auraframework.integration.test.http;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.HttpFilter;

/**
 * Apply a Filter if the request has an expected cookie (by name)
 */
public class CookieFilter implements HttpFilter {
	private String cookieName;
	
	CookieFilter(String cookieName){
		this.cookieName = cookieName;
	}
	
    @Override
    public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
		if (getCookieNamed(request, cookieName) != null) {
			chain.doFilter(request, response);
		}
    }
    
	protected String getCookieName() {
		return cookieName;
	}
	
    private Cookie getCookieNamed(HttpServletRequest request, String name){
    	for(Cookie cookie: request.getCookies()){
    		if(cookie.getName().equals(name)){
    			return cookie;
    		}
    	}
    	return null;
    }
}
