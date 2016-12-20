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
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.AuraServlet;
import org.auraframework.http.HttpFilter;
import org.auraframework.http.RequestParam.StringParam;

public enum AuraRequest implements HttpFilter {
	BOOTSTRAP(equalsURI("/auraResource","bootstrap", "js")),
	INLINE(equalsURI("/auraResource","inline", "js")),
	APPJS(equalsURI("/auraResource","app", "js")),
	APPCSS(equalsURI("/auraResource","app", "css")),
	MANIFEST(equalsURI("/auraResource","app", "manifest")),
	RESETCSS(matchesURI("/auraFW/resources/.*/aura/resetCSS.css")),
	FRAMEWORK(matchesURI("/auraFW/javascript/.*/aura_.+\\.js")),
	LOCKER(matchesURI("/auraFW/resources/.*/lockerservice/safeEval.html"));
	
	private static final StringParam FORMAT = new StringParam(AuraServlet.AURA_PREFIX + "format", 0, false);
	private static final StringParam TYPE = new StringParam(AuraServlet.AURA_PREFIX + "type", 0, false);

	private HttpFilter httpFilter;
	
	private AuraRequest(HttpFilter delegate){
		this.httpFilter = delegate;
	}
	
	@Override
	public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		httpFilter.doFilter(request, response, chain);
	}
	
	public static HttpFilter equalsURI(String uri) {
		return equalsURI(uri, null, null);
	}
	
	public static HttpFilter equalsURI(String uri, String type, String format) {
		return (request, response, chain) -> {
			if ((request != null) && (request.getRequestURI() != null) && (request.getRequestURI().equals(uri))
					&& (type == null || type.equals(TYPE.get(request)))
					&& (format == null || format.equals(FORMAT.get(request)))) {
				chain.doFilter(request, response);
			}
		};
	}
	
	public static HttpFilter matchesURI(String uriPattern) {
		return (request, response, chain) -> {
			if (request != null && request.getRequestURI() != null && request.getRequestURI().matches(uriPattern)) {
				chain.doFilter(request, response);
			}
		};
	}
}
