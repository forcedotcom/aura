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
package org.auraframework.impl;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;

import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.AuraTextUtil;

public class DefinitionAccessImpl implements DefinitionAccess {
	
	static public DefinitionAccess  defaultAccess() {
		return new DefinitionAccessImpl();
	}

	public DefinitionAccessImpl(String access) throws InvalidAccessValueException {
		parseAccess(access);
	}
	
	private DefinitionAccessImpl() {
		accessMethod = null;
	}

	private void parseAccess(String accessValue) throws InvalidAccessValueException {
		List<String> items = AuraTextUtil.splitSimpleAndTrim(accessValue, ",", 10);
		for (String item: items) {
			parseAccessItem(item);
		}
	}
	
	protected void parseAccessItem(String item) throws InvalidAccessValueException {
		// See if we have authentication
		String ucItem = item.toUpperCase();
		try {
			Authentication auth = Authentication.valueOf(ucItem);
			if (authentication != null && auth != authentication) {
				throw new InvalidAccessValueException("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED");
			}
			authentication = auth;
			return;
		} catch (IllegalArgumentException e) {
			// continue to try other possibilities
		}
		
		// See if it is one of the scope constants
		try {
			Access acc = Access.valueOf(item.toUpperCase());
			if (access != null && access != acc) {
				throw new InvalidAccessValueException("Access attribute can only specifiy one of GLOBAL, PUBLIC, or PRIVATE"); // or internal
			}
			access = acc;
			return;
		} catch (IllegalArgumentException e) {
			// continue to try other possibilities
		}
		
		// Look for classname.methodname
		int dotPos = item.lastIndexOf('.');
		if (dotPos > 0) {
			String className = item.substring(0, dotPos);
			String methodName = item.substring(dotPos + 1);
			try {
				Class<?> clazz = Class.forName(className);
				Method meth = clazz.getMethod(methodName, new Class[0]);
                if (!Modifier.isStatic(meth.getModifiers())) {
            		throw new InvalidAccessValueException("\"" + item + "\" must be a static method");
                }
                Class<?> retType = meth.getReturnType();
                if (! Access.class.equals(retType)) {
            		throw new InvalidAccessValueException("\"" + item + "\" must return a result of type " + 
                        Access.class.getName());
                }	
                this.accessMethod = meth;
                return;
			} catch (ClassNotFoundException e) {
			} catch (SecurityException e) {
			} catch (NoSuchMethodException e) {
			}
    		throw new InvalidAccessValueException("\"" + item + "\" is not a valid public method reference");
		}
		
		throw new InvalidAccessValueException("Invalid access atttribute value \"" + item + "\"");
	}

	@Override
	public boolean requiresAuthentication() {
		return authentication == null || authentication == Authentication.AUTHENTICATED;
	}

	@Override
	public boolean isGlobal() {
		return access == Access.GLOBAL;
	}

	@Override
	public boolean isPublic() {
		return access == null || access == Access.PUBLIC;
	}

	@Override
	public boolean isPrivate() {
		return access == Access.PRIVATE;
	}

	@Override
	public boolean isInternal() {
		// Default is at least INTERNAL
		return access == null || access == Access.INTERNAL;
	}

	@Override
	public boolean isAccessible() {
		return false;
	}

	@Override
	public void validate(boolean allowAuth, boolean allowPrivate)
			throws InvalidAccessValueException {
		if (authentication != null && !allowAuth) {
			throw new InvalidAccessValueException("Invalid access atttribute value \"" + authentication.name() + "\"");
		}
		if (access == Access.PRIVATE  && !allowPrivate) {
			throw new InvalidAccessValueException("Invalid access atttribute value \"" + access.name() + "\"");
		}
		
	}

	private Authentication authentication = null;
	private Access access = null;
	private Method accessMethod;

}
