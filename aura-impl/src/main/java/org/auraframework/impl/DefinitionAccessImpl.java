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

import java.util.*;

import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DefinitionAccessImpl implements DefinitionAccess {
	
	static public DefinitionAccess parseAccess(String access) throws InvalidAccessValueException {
		List<String> items = AuraTextUtil.splitSimpleAndTrim(access, ",", 10);
		Set<BasicAccessType> values = new HashSet<BasicAccessType>();
		for (String item: items) {
			try {
				BasicAccessType at = BasicAccessType.valueOf(item.toUpperCase());
				values.add(at);
			} catch (IllegalArgumentException e) {
				throw new InvalidAccessValueException("Invalid access atttribute value \"" + item + "\"");
			}
		}
        return new DefinitionAccessImpl(values);          

	}

	static public DefinitionAccess  defaultAccess() {
		return new DefinitionAccessImpl(new HashSet<BasicAccessType>());
	}

	private DefinitionAccessImpl(Set<BasicAccessType> values) {
		access = values;
	}
	
	@Override
	public boolean requiresAuthentication() {
		return !access.contains(BasicAccessType.UNAUTHENTICATED);   // default is authenticated
	}

	@Override
	public boolean isGlobal() {
		return access.contains(BasicAccessType.GLOBAL);
	}

	@Override
	public boolean isPublic() {
		return !(access.contains(BasicAccessType.GLOBAL) || access.contains(BasicAccessType.PRIVATE));  // default is public
	}

	@Override
	public boolean isPrivate() {
		return access.contains(BasicAccessType.PRIVATE);
	}

	@Override
	public boolean isAccessible(AuraContext context) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void validate(Set<BasicAccessType> allowed) throws InvalidAccessValueException {
		// First make sure all the specified options are allowed for this definition
		for (BasicAccessType a : access) {
			if (!allowed.contains(a)) {
				throw new InvalidAccessValueException("Invalid access atttribute value \"" + a.name() + "\"");
			}
		}
		// Now check for invalid/contradictory combinations
		if (access.contains(BasicAccessType.AUTHENTICATED) && access.contains(BasicAccessType.UNAUTHENTICATED)) {
			throw new InvalidAccessValueException("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED");
		}

		Set<BasicAccessType> scopes = new HashSet<BasicAccessType>(SCOPE_ACCESS_VALUES);
		scopes.retainAll(access);   // intersection
		if (scopes.size() > 1) {
			throw new InvalidAccessValueException("Access attribute can only specifiy one of GLOBAL, PUBLIC, or PRIVATE");
		}
		
	}
	
    private final static Set<BasicAccessType> SCOPE_ACCESS_VALUES = new ImmutableSet.Builder<BasicAccessType>()
            .add(BasicAccessType.GLOBAL, BasicAccessType.PUBLIC, BasicAccessType.PRIVATE).build();

	private final Set<BasicAccessType> access;

}
