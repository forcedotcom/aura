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
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.http.HttpFilter;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.Lists;

/**
 * Specify the order of requests to be processed with a given set of
 * FilterPredicates. Any requests not matching the given set will be processed in
 * an arbitrary order after the defined set has been processed.
 *
 */
public class OrderingFilter implements HttpFilter {
	private static final long MAX_WAIT = 300000;
	
	private final List<HttpFilter> filters;
	
	public OrderingFilter(HttpFilter... filters) {
		this.filters = Collections.synchronizedList(Lists.newArrayList(filters));
	}
	
	@Override
	public synchronized void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		while(!filters.isEmpty()){
			HttpFilter head = filters.get(0);
			final AtomicBoolean processed = new AtomicBoolean(false);
			head.doFilter(request, response, (req, res) -> {
				processed.set(true);
				filters.remove(0);
			});
			if (processed.get()) {
				break;
			}
			try {
				wait(MAX_WAIT);
				Thread.sleep(100);
			} catch (InterruptedException e) {
				throw new AuraRuntimeException(e);
			}
		}
		
		chain.doFilter(request, response);
		notifyAll();
	}
}
