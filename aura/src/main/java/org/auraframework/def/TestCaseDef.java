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
package org.auraframework.def;

import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor.DefType;

/**
 * An individual test case for a component. TestCaseDef is a sub-definition of TestSuiteDef.
 */
public interface TestCaseDef extends Definition {

	/**
	 * The attributes which should be used to instantiate the component under
	 * test.
	 * 
	 * @return the Map of attribute names to values used to instantiate the
	 *         component under test
	 */
    Map<String, Object> getAttributeValues();

	/**
	 * The type of component under test, typically an Application or Component.
	 * 
	 * @return the DefType of the component under test
	 */
    DefType getDefType();

	/**
	 * Labels intended to categorize test cases, although no explicit grouping
	 * is applied.
	 * 
	 * @return the Set of labels this test is tagged with
	 */
    Set<String> getTestLabels();

	/**
	 * Specialized labels intended to describe target client platforms for this
	 * test case.
	 * 
	 * @return the Set of "browsers" this test should apply to
	 */
    Set<String> getBrowsers();

	/**
	 * Definitions that are expected to be present for this test case to run,
	 * typically stubbed implementations of actual Definitions. These should
	 * take precedence over any existing Definitions with the same
	 * DefDescriptor.
	 * 
	 * @return the Set of Definitions expected by this test case
	 */
    Set<Definition> getLocalDefs();
    
	/**
	 * The set of exceptions that are allowed during initialization. These exceptions will not cause the test to fail.
	 * 
	 * @return The Set of exceptions that are allowed during initialization
	 */
    Set<String> getExceptionsAllowedDuringInit();   
}
