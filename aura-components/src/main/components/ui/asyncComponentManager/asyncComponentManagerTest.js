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
     * Test the new async component is queued correctly 
     * and hit the max concurrency not dequeued
     */
    testComponentRegisterHitMaxConcurrency: {
        attributes: {
        	maxConcurrency : 0 // set to 0 to mock hitting the max concurrency
        },
        test: function (cmp) {
        	$A.test.assertUndefined(cmp._registeredComponents, 
        			"Registered component initial status is not correct.");
        	$A.test.assertUndefined(cmp._numOfLoadingComponents, 
					"Number of loading component initial status is not correct.");
        	$A.get("e.ui:asyncComponentRegister").setParams({
                "asyncComponent": "toBeRegisteredCmp"
            }).fire();
        	// Verify hit the max concurrency, and this new component stays in the registered components
        	$A.test.assertEquals(1, cmp._registeredComponents.length, 
        			"regeisteredComponent length is not correct.");
        	$A.test.assertEquals("toBeRegisteredCmp", cmp._registeredComponents[0], 
        			"Registered component is not correct.");
        	$A.test.assertUndefined(cmp._numOfLoadingComponents, 
					"Number of loading component should not be set because of hitting the max concurrency.");
        }
    },
    
    /**
     * Test the new async component is queued correctly 
     * and not hit the max concurrency, so also dequeued and update the loading component number
     */
    testComponentRegisterNotHitMaxConcurrency: {
        test: function (cmp) {
        	var mockAsyncCmp = {
        			get : function() {
        				return {fire : function() {}}
        			}
        	};
        	$A.test.assertUndefined(cmp._registeredComponents, 
        			"Registered component initial status is not correct.");
        	$A.test.assertUndefined(cmp._numOfLoadingComponents, 
					"Number of loading component initial status is not correct.");
        	$A.get("e.ui:asyncComponentRegister").setParams({
                "asyncComponent": mockAsyncCmp
            }).fire();
        	// Verify hit the max concurrency, and this new component stays in the registered components
        	$A.test.assertEquals(0, cmp._registeredComponents.length, 
        			"regeisteredComponent should already be dequeued.");
        	$A.test.assertEquals(1, cmp._numOfLoadingComponents, 
					"Number of loading component should be set to 1.");
        }
    },
    
    /**
     * Test when asyncComponentLoaded event is called
     */
    testAsyncComponentLoaded : {
    	test : function (cmp) {
    		var mockAsyncCmp = {
        			get : function() {
        				return {fire : function() {}}
        			}
        	};
    		// Initial _numOfLoadingComponents 
    		cmp._numOfLoadingComponents = 1;
    		$A.get("e.ui:asyncComponentLoaded").setParams({
            	asyncComponent: mockAsyncCmp
            }).fire();
    		$A.test.assertEquals(0, cmp._numOfLoadingComponents, 
					"Number of loading component should be set to 0.");
    	}
    }
})