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
package org.auraframework.test.mock;

import java.lang.reflect.Method;
import java.util.List;

import com.google.common.collect.Lists;

/**
 * A call to a method, described by the name of the method and the input parameters.
 */
public class Invocation {
	private final String methodName;
	private final List<?> parameters;
	private final Class<?> returnType;

	public Invocation(String methodName, List<?> parameters, Class<?> returnType) {
		this.methodName = methodName;
		this.parameters = parameters;
		this.returnType = returnType;
	}

	public String getMethodName() {
		return methodName;
	}

	public List<?> getParameters() {
		return parameters;
	}
	
	public Class<?> getReturnType() {
		return returnType;
	}
	
	public boolean matches(Method method, Object[] args) {
		return method.getName().equals(methodName)
				&& (parameters == null || parameters.equals(Lists
						.newArrayList(args)));
	}
}
