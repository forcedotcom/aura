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
	componentCreated: {},//we use this to store component created in the test, so next test stage can try to access attributes etc
	
	setUp: function(cmp){
		this.componentCreated = undefined; 
    },
	
	
	/*****************************************************************************************
	    Test for creating component belong to a DIFFERENT privileged namespace starts
	******************************************************************************************/
	
    testCreateComponentWithDefaultAccessOfAnotherPrivilegedNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){ //Different
        	//so the default access level for privileged namespace is Global?
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS2:componentWithDefaultAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS2$componentWithDefaultAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    //we cannot create component with public access in another privilegedNS
    testCreateComponentWithPublicAccessOfAnotherPrivilegedNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){
        	var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
            	"markup://testPrivilegedNS2:componentWithPublicAccess", 
            	{}, 
            	function(newCmp){
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
        ]
    },
   
    testCreateComponentWithGlobalAccessOfAnotherPrivilegedNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS2:componentWithGlobalAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals("testPrivilegedNS2$componentWithGlobalAccess", newCmp.getName());
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
       	 	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.publicAttribute");
        },
        function cannotAccessGlobalAttribute(cmp) { 
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    /**************************************************************************************************
	    Test for creating component belong to the SAME privileged namespace starts
	***************************************************************************************************/
	
	testCreateComponentWithDefaultAccessOfSamePrivilegedNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){ 
        	//so the default access level for privileged namespace is Global?
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithDefaultAccess2", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1$componentWithDefaultAccess2");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithPublicAccessOfSamePrivilegedNS:{
        test:[
        function canCreateComponentWithPublicAccess(cmp){ 
        	//so the default access level for privileged namespace is Global?
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithPublicAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1$componentWithPublicAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithGlobalAccessOfSamePrivilegedNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){ 
        	//so the default access level for privileged namespace is Global?
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithGlobalAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1$componentWithGlobalAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    
    
	/**************************************************************************************************
	    Test for creating component belong to Internal/System namespace starts
	***************************************************************************************************/
	testCreateComponentWithDefaultAccessOfSystemNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){//Different
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://auratest:accessDefaultComponent", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"auratest$accessDefaultComponent");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
	testCreateComponentWithPublicAccessOfSystemNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){ 
        	$A.test.expectAuraError("Access Check Failed!");
        	var completed = false;
            $A.createComponent(
            	"markup://auratest:accessPublicComponent", 
            	{}, 
            	function(newCmp){//newCmp will be null
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
        ]
    },
    
    testCreateComponentWithGlobalAccessOfSystemNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://auratest:accessGlobalComponent", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"auratest$accessGlobalComponent");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    }
 })