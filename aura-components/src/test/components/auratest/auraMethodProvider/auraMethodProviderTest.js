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
            function(cmp){
            	var methodName = "auraMethodProviderMethod";
            	$A.test.assertFalse($A.util.isFunction(cmp[methodName]));
            }            
        ]
    },

    testMethodsFromProvidededComponentArePresent: {
    	test: function(cmp) {
	        var methodName = "hasAttr";
	        $A.test.assertTrue($A.util.isFunction(cmp[methodName]));
	        //run the method
	        cmp[methodName]();
	        $A.test.addWaitForWithFailureMessage("default string, return from hasAttr",
	        		function() { return cmp.get("v.outputStringAttr"); },
	        		"fail to change outputStringAttr"
	        );
	    }
       
    },

    testSharedMethodFromProvidedComponentsIsPresent: {
    	test: function(cmp) {
    		var methodName = "noAttr";
        	$A.test.assertTrue($A.util.isFunction(cmp[methodName]));
        	//run the method
        	cmp[methodName]();
        	$A.test.addWaitForWithFailureMessage("paramArray: , return from noAttr",
        			function() { return cmp.get("v.outputStringAttr"); },
        			"fail to change outputStringAttr"
        	);
    	}
    }
    
})