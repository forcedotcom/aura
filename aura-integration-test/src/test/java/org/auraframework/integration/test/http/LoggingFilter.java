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
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.HttpFilter;

import com.google.common.collect.Lists;

public class LoggingFilter implements HttpFilter {
	private List<String> logs = Lists.newArrayList();
	
    @Override
    public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
		StringBuffer urlBuffer = new StringBuffer(request.getRequestURI());
		String qs = request.getQueryString();
		if (qs != null) {
			urlBuffer.append('?').append(qs);
		}
		logs.add(urlBuffer.toString());
		chain.doFilter(request, response);
    }

    public List<String> getLogs() {
		return Lists.newArrayList(logs);
	}
    
    public void clear() {
    	logs.clear();
    }
}
