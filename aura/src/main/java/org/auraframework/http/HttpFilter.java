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
import java.util.Objects;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@FunctionalInterface
public interface HttpFilter {
	public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException;

	default HttpFilter andThen(HttpFilter after) {
		Objects.requireNonNull(after);
		final HttpFilter before = this;
		return (request, response, chain) -> {
			before.doFilter(request, response, (req, res) -> {
				after.doFilter((HttpServletRequest) req, (HttpServletResponse) res, chain);
			});
		};
	}

	default HttpFilter compose(HttpFilter before) {
		Objects.requireNonNull(before);
		final HttpFilter after = this;
		return before.andThen(after);
	}
}