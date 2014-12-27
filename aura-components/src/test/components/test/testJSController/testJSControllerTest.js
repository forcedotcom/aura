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
({
    /**
     * Assert that controller functions are not exposed globally.
     */
    testControllerNotExposedGlobally:{
	test : function(component){
	    var controller = component.get("c.functionName1");
	    $A.test.assertNotNull(controller);
	    $A.test.assertEquals("Action", controller.auraType);
	    $A.test.assertFalse($A.util.isFunction(window.functionName1), "Controller method exposed on window");
	    $A.test.assertFalse($A.util.isFunction(window.setFocus), "Controller methods exposed on window");
	}
    }
})