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

public class EventAccessAttributeEnforcementTest extends
		BaseAccessAttributeEnforcementTest {
		
	public EventAccessAttributeEnforcementTest(String name) {
		super(name);
		testResource = TestResource.Event;
	}
	
	/**
	 * Verify Creating an application works
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
