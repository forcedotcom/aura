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
    testAddValueProviderAndGetWithCallback: {
        test: [function(component){
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
            $A.test.addWaitForWithFailureMessage("[task_mode_today]",
        			function() { 
            			return $A.get("$Custom.task_mode_today", 
        				function(value) { 
        					component.set("v.stringValue","callback passed to get, value="+value);
        				} ); 
            		},
        			"fail to get the correct value from Custom Global Value Provider",
        			function() {
        						$A.test.addWaitForWithFailureMessage("callback passed to get, value=Today",
        							function() {
        								return component.get("v.stringValue");
        							},
        							"fail to excute callback passed to get"
        						);
        					}
            );
        }]
    },
    
    testAddDuplicateValueProvider: {
    	test: [function(component){
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
            $A.test.expectAuraError("$A.addValueProvider(): '$Custom' has already been registered. : false");
        	$A.addValueProvider('$Custom', cgvp);
        }]
    },
    
    testAddValueProvider_InvalidType: {
    	test: [function(component){
    		$A.test.expectAuraError("$A.addValueProvider(): 'type' must be a valid String.");
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider({}, cgvp);
        }]
    },
    
    testAddValueProvider_InvalidName: {
    	test: [function(component){
    		$A.test.expectAuraError("$A.addValueProvider(): 'type' must start with '$'.");
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('Something', cgvp);
        }]
    },
    
    testAddValueProvider_AuraReserved: {
    	test: [function(component){
    		$A.test.expectAuraError("$A.addValueProvider(): '$Browser' is a reserved valueProvider.");
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Browser', cgvp);
        }]
    },
    
    testAddValueProvider_ValueProviderMissing: {
    	test: [function(component){
    		$A.test.expectAuraError("$A.addValueProvider(): 'valueProvider' is required.");
            $A.addValueProvider('$Custom', null);
        }]
    },
    
    testSetSupported : {
    	test: [function(component){
        	var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
        	$A.set("$Custom.task_mode_today","Tomorrow");
        	var res = $A.get("$Custom.task_mode_today");
        	$A.test.assertEquals("Tomorrow", res, 
    		"fail to set the value in Custom Global Value Provider");
        }]
    }
    
})