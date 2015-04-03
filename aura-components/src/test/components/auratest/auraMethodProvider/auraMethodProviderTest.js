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
    testMethodsFromPreProvidedComponentAreNotPresent:{
        test:[
            function(){
            	var methodName = "auraMethodProviderMethod";
            	$A.componentService.createComponent("auratest:auraMethodProvider", {}, function(instance) {
            		
            		// Assert that we have auratest:auraMethod methods, not auraMethodProvider methods
            		$A.test.assertUndefined(instance[methodName], methodName + " is not present on the client provided component and should not be on the returned instance.");
            	});
            }            
        ]
    },

    testMethodsFromProvidededComponentArePresent: {
    	test: [
	    	function() {
	        	var methodName = "hasAttr";
	        	var actual;
	        	$A.componentService.createComponent("auratest:auraMethodProvider", {}, function(instance) {
	        		
	        		actual = $A.util.isFunction(instance[methodName]);

	        		// Assert that we have auratest:auraMethod methods, not auraMethodProvider methods
	        		$A.test.assertTrue(actual, methodName + " is present on the client provided component and should be on the returned instance.");
	        	});
	        }
       ]
    },

    testSharedMethodFromProvidedComponentsIsPresent: {
    	test: function() {
    		var methodName = "noAttr";
        	var actual;
        	$A.componentService.createComponent("auratest:auraMethodProvider", {}, function(instance) {
        		
        		actual = $A.util.isFunction(instance[methodName]);

        		// Assert that we have auratest:auraMethod methods, not auraMethodProvider methods
        		$A.test.assertTrue(actual, methodName + " is present on the client provided component and should be on the returned instance.");
        	});
    	}
    }
    
})