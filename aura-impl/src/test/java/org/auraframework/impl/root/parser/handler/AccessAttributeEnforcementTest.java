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

package org.auraframework.impl.root.parser.handler;

import java.util.ArrayList;

public class AccessAttributeEnforcementTest extends
		BaseAccessAttributeEnforcementTest {

	public AccessAttributeEnforcementTest(String name) {
		super(name);
		testResource = TestResource.Component;
	}
	
	/**
	 * Verify Creating a component with text works
	 * @throws Exception
	 */
	public void testComponentWithText() throws Exception {
		String resourceSource = "<aura:component><aura:text value='Hello World!' /></aura:component>";
		
		ArrayList<String> failures = new ArrayList<String>();

		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}

		if (!failures.isEmpty()) {
			String message = "\n";
			for (int i = 0; i < failures.size(); i++) {
				message += failures.get(i);
				if (i != failures.size() - 1) {
					message += ",\n";
				}
			}

			fail("Test failed with " + failures.size() + " errors:" + message);
		}
    }
	
	/**
	 * Verify Creating a component with HTML works
	 * @throws Exception
	 */
	public void testComponentWithHTML() throws Exception {
		String resourceSource = "<aura:component><aura:html tag='b' body='Hello World!' /></aura:component>";
		
		ArrayList<String> failures = new ArrayList<String>();

		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}

		if (!failures.isEmpty()) {
			String message = "\n";
			for (int i = 0; i < failures.size(); i++) {
				message += failures.get(i);
				if (i != failures.size() - 1) {
					message += ",\n";
				}
			}

			fail("Test failed with " + failures.size() + " errors:" + message);
		}
	}
	
	/**
	 * Verify Using a component with aura:unescapedhtml works
	 * @throws Exception
	 */
	public void testComponentWithUnescapedHTML() throws Exception {
		String resourceSource = "<aura:component><aura:unescapedHtml/></aura:component>";
		
		ArrayList<String> failures = new ArrayList<String>();

		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}

		if (!failures.isEmpty()) {
			String message = "\n";
			for (int i = 0; i < failures.size(); i++) {
				message += failures.get(i);
				if (i != failures.size() - 1) {
					message += ",\n";
				}
			}

			fail("Test failed with " + failures.size() + " errors:" + message);
		}
	}
		
	/**
	 * Verify Creating a component with expression works
	 * @throws Exception
	 */
	public void testComponentWithExpression() throws Exception {
		String resourceSource = "<aura:component><aura:expression value='Hello + World!' /></aura:component>";
		
		ArrayList<String> failures = new ArrayList<String>();

		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}

		if (!failures.isEmpty()) {
			String message = "\n";
			for (int i = 0; i < failures.size(); i++) {
				message += failures.get(i);
				if (i != failures.size() - 1) {
					message += ",\n";
				}
			}

			fail("Test failed with " + failures.size() + " errors:" + message);
		}
    }
}
