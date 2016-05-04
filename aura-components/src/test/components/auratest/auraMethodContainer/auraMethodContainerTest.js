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
	/*
     * Test for auraMethod.cmp starts
     */
	
	//Test the function without passed in parameter
    testHasAttributeNoPassInParameter:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethod");
            	cmpME.hasAttr();
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("default string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test the function with passed in parameter
    testHasAttrWithPassInParameter:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethod");
            	cmpME.hasAttr("pass in string");
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("pass in string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test pass two parameters to a function that only expect one
    //We throw warnings.
    testHasAttrWithExtraPassInParameter:{
    	failOnWarning: true,
        test:[ 
            function(cmp){
            	$A.test.expectAuraWarning("'argument_1'('second pass in string') is not a valid parameter. Valid parameters are 'name', 'arguments'");
            	var cmpME = cmp.find("auraMethod");
            	cmpME.hasAttr("pass in string","second pass in string");
            	$A.test.addWaitForWithFailureMessage("pass in string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },

    //Test function with pass in parameter while the function is not expecting any -- it has no attribute
    //we actually ok with this, in noAttr I concact these parameter into a string,hence the output there
    testNoAttributeWithPassInParameter:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethod");
            	cmpME.noAttr("pass in string","second pass in string");
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("paramArray: pass in string,second pass in string, return from noAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test function without pass in parameter when it's not expecting any anyway -- it has no attribute
    testNoAttributeNoPassInParameter:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethod");
            	cmpME.noAttr();
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("paramArray: , return from noAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    
    //Function with pass in action name -- instead of the default one c.$methodName
    //this method has one attribute, we don't pass in parameter.
    testWithActionHasAttr : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethod");
              	cmpME.withActionHasAttr();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("default string, return from withActionHasAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //Function with pass in action name -- instead of the default one c.$methodName
    //this method has one attribute, we also pass in one parameter
    testWithActionHasAttrWithPassInParameter : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethod");
              	cmpME.withActionHasAttr("pass in string");
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("pass in string, return from withActionHasAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //Function with pass in action name -- instead of the default one c.$methodName
    //this method has no attribute
    testWithActionNoAttr : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethod");
              	cmpME.withActionNoAttr();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("return from withActionNoAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //1. we define the method in interface(auraMethodInterface.intf), then in auraMethod.cmp, we 'over-write' it
    //by defining the method AGAIN. 
    testMethodFromInterface : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethod");
              	cmpME.methodFromInterface();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("default string2, return from methodFromInterface",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    /*
     * 
     * Test for component that extends auraMethod.cmp starts
     *
     */
    
    //Test the function without passed in parameter
    testHasAttributeNoPassInParameter_Child:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethodChild");
            	cmpME.hasAttr();
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("default string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test the function with passed in parameter
    testHasAttrWithPassInParameter_Child:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethodChild");
            	cmpME.hasAttr("pass in string");
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("pass in string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test pass two parameters to a function that only expect one
    //We throw warnings.
    testHasAttrWithExtraPassInParameter_Child:{
        test:[ 
            function(cmp){
            	$A.test.expectAuraWarning("'argument_1'('second pass in string') is not a valid parameter. Valid parameters are 'name', 'arguments'");
            	var cmpME = cmp.find("auraMethodChild");
            	cmpME.hasAttr("pass in string","second pass in string");
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("pass in string, return from hasAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test function with pass in parameter while the function is not expecting any -- it has no attribute
    //We don't check how many arguments are there
    testNoAttributeWithPassInParameter_Child:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethodChild");
            	cmpME.noAttr("pass in string","second pass in string");
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("paramArray: pass in string,second pass in string, return from noAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    //Test function without pass in parameter when it's not expecting any anyway -- it has no attribute
    testNoAttributeNoPassInParameter_Child:{
        test:[ 
            function(cmp){
            	var cmpME = cmp.find("auraMethodChild");
            	cmpME.noAttr();
            	var res = cmpME.get("v.outputStringAttr");
            	$A.test.addWaitForWithFailureMessage("paramArray: , return from noAttr",
            			function() { return cmpME.get("v.outputStringAttr"); },
            			"fail to change outputStringAttr"
            	);
            } 
        ]
    },
    
    
    //Function with pass in action name -- instead of the default one c.$methodName
    testWithActionHasAttr_Child : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethodChild");
              	cmpME.withActionHasAttr();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("default string, return from withActionHasAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //Function with pass in action name -- instead of the default one c.$methodName
    //this method has one attribute, we also pass in one parameter
    testWithActionHasAttrWithPassInParameter_Child : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethodChild");
              	cmpME.withActionHasAttr("pass in string");
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("pass in string, return from withActionHasAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //Function with pass in action name -- instead of the default one c.$methodName
    //this method has no attribute
    testWithActionNoAttr_Child : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethodChild");
              	cmpME.withActionNoAttr();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("return from withActionNoAttr",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //we define the method in interface(auraMethodInterface.intf), then in auraMethod.cmp, we 'over-write' it
    //by defining the method AGAIN. 
    testMethodFromInterface_Child : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethodChild");
              	cmpME.methodFromInterface();
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("default string2, return from methodFromInterface",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    },
    
    //test to check we can over-write method from parent component
    testMethodFromParent : {
    	test:[ 
              function(cmp){
              	var cmpME = cmp.find("auraMethodChild");
              	cmpME.methodInParent("pass in string from child");
              	var res = cmpME.get("v.outputStringAttr");
              	$A.test.addWaitForWithFailureMessage("pass in string from child, return from methodInParent",
              			function() { return cmpME.get("v.outputStringAttr"); },
              			"fail to change outputStringAttr"
              	);
              } 
          ]
    }
    
})