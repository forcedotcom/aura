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
package org.auraframework.test;

import java.util.Set;

import org.auraframework.def.Definition;

/**
 * Represent the context of a test.
 */
public interface TestContext {
	
	/**
	 * The name of this TestContext, which should uniquely identify it.
	 * 
	 * @return the name of this TestContext
	 */
    public String getName();

	/**
	 * Definitions that are expected to be present for this TestContext,
	 * typically stubbed implementations of actual Definitions. These should
	 * take precedence over any existing Definitions with the same
	 * DefDescriptor.
	 * 
	 * @return the set of Definitions expected by this TestContext
	 */
    public Set<Definition> getLocalDefs();
}
