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

import org.auraframework.system.AuraContext.Access;

public class RegisterEventAccessAttributeTest extends BaseAccessAttributeTest {

	public RegisterEventAccessAttributeTest(String name) {
		super(name);
		testResource = TestResource.RegisterEvent;
	}

	// Remove these when W-2089618, W-2089642 are fixed.
	@Override
	public void testSimpleAccessInSystemNamespace() throws Exception {		
		verifySimpleAccess(TestNamespace.System, false);
	}

	@Override
	public void testSimpleAccessDynamicInSystemNamespace() throws Exception {
		
	}
	
	@Override
	public void testSimpleAccessInCustomNamespace() throws Exception {
		verifySimpleAccess(TestNamespace.Custom, false);
	}
	
	private void verifySimpleAccess(TestNamespace namespace, boolean isDynamic) throws Exception {		
		ArrayList<String> failures = new ArrayList<String>();		
		for (Access access : Access.values()) {
			if(access != Access.INTERNAL && access != Access.PRIVATE){
				testCase = getTestCase(access, isDynamic);	
				testNamespace = namespace;
				if(testCase != null){	
					try{					
						runTestCase();
					}
					catch(Throwable e) {
						failures.add(e.getMessage());
					}
				}
				else{				
					failures.add("TestCase not found for Access: " + access.toString());				
				}
			}
		}
		
		if(!failures.isEmpty()){			
			String message = "";
			for(int i = 0; i < failures.size(); i++){
				message += failures.get(i);
				if(i != failures.size() - 1){
					message += ", ";
				}
			}
			fail("Test failed becuase: " + message);
		}
    }	
}
