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
package org.auraframework.test.root.parser.handler;

import java.util.ArrayList;

import org.auraframework.impl.root.parser.handler.BaseAccessAttributeEnforcementTest;

public class EventAccessAttributeEnforcementTest extends BaseAccessAttributeEnforcementTest { 
	public EventAccessAttributeEnforcementTest(String name) {
		super(name);
		testResource = TestResource.Event;
	}
	
	/**
	 * Verify Creating a events of different types works
	 * @throws Exception
	 */
	public void testCreateAuraEventTypes() throws Exception {
		ArrayList<String> failures = new ArrayList<>();
		verifyCreateAuraEventTypes("APPLICATION", failures);
		verifyCreateAuraEventTypes("COMPONENT", failures);
		verifyCreateAuraEventTypes("VALUE", failures);
		
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
	
	private void verifyCreateAuraEventTypes(String type, ArrayList<String> failures) throws Exception {
		String resourceSource = "<aura:event type='"+type+"' />";

		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}
		
    }
	
	/**
	 * Verify Extending an Application Event works
	 * @throws Exception
	 */
	public void testExtendsAuraApplicationEvents() throws Exception {
		ArrayList<String> failures = new ArrayList<>();
		verifyExtendsAuraEvents("APPLICATION", "aura:doneRendering", failures);
		verifyExtendsAuraEvents("APPLICATION", "aura:doneWaiting", failures);
		verifyExtendsAuraEvents("APPLICATION", "aura:locationChange", failures);
		verifyExtendsAuraEvents("APPLICATION", "aura:noAccess", failures);
		verifyExtendsAuraEvents("APPLICATION", "aura:systemError", failures);
		verifyExtendsAuraEvents("APPLICATION", "aura:waiting", failures);
		
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
	 * Verify Extending a Value Event works
	 * @throws Exception
	 */
	public void testExtendsAuraValueEvents() throws Exception {
		ArrayList<String> failures = new ArrayList<>();
		
		verifyExtendsAuraEvents("VALUE", "aura:valueChange", failures);		
		verifyExtendsAuraEvents("VALUE", "aura:valueInit", failures);
		
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
	
	private void verifyExtendsAuraEvents(String type, String baseEvent, ArrayList<String> failures) throws Exception {
		String resourceSource = "<aura:event type='"+type+"' extends='"+baseEvent+"' />";
		
		for (TestNamespace targetNamespace : TestNamespace.values()) {
			testResourceNamespace = targetNamespace;
			
			try {
				runSimpleTestCase(resourceSource);
			} catch (Throwable e) {
				failures.add(e.getMessage());
			}	
			
		}
    }
	
	/**
	 * Verify Creating a Component works
	 * @throws Exception
	 */
	public void testAccess() throws Exception {
		verifyAccess();
    }
		
	/**
	 * Verify Default access enforcement
	 * @throws Exception
	 */
	public void testDefaultAccessForExtends() throws Exception {
		testCase = TestCase.DEFAULT;
		verifyAccess(new TestResource[]{TestResource.Event});
    }
	
	/**
	 * Verify Public access enforcement
	 * @throws Exception
	 */
	public void testPublicAccessForExtends() throws Exception {
		testCase = TestCase.PUBLIC;
		verifyAccess(new TestResource[]{TestResource.Event});
    }
	
	/**
	 * Verify Global access enforcement
	 * @throws Exception
	 */
	public void testGlobalAccessForExtends() throws Exception {
		testCase = TestCase.GLOBAL;
		verifyAccess(new TestResource[]{TestResource.Event});
    }
	
	/**
	 * Verify Default access enforcement when event is used in aura:registerEvent
	 * @throws Exception
	 */	
	public void testDefaultAccessForRegisterEvent() throws Exception {
		testCase = TestCase.DEFAULT;
		verifyAccess(new TestResource[]{TestResource.Component});
    }
	
	/**
	 * Verify Public access enforcement when event is used in aura:registerEvent
	 * @throws Exception
	 */	
	public void testPublicAccessForRegisterEvent() throws Exception {
		testCase = TestCase.PUBLIC;
		verifyAccess(new TestResource[]{TestResource.Component});
    }
	
	/**
	 * Verify Global access enforcement when event is used in aura:registerEvent
	 * @throws Exception
	 */	
	public void testGlobalAccessForRegisterEvent() throws Exception {
		testCase = TestCase.GLOBAL;
		verifyAccess(new TestResource[]{TestResource.Component});
    }
}
