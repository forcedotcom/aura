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
	labels : ["UnAdaptableTest"],
	
	componentCreated: {},//we use this to store component created in the test, so next test stage can try to access attributes etc
	
	setUp: function(cmp){
		this.componentCreated = undefined;
    },
    
    /**************************************************************************************************
	    Test for nested components.
		we create a component in system namespace with privileged access as container component (accessPrivilegedComponentWithaccessDefaultComponentInMarkup)
		the container component has another component(accessDefaultComponent) in its markup. 
		accessDefaultComponent is a component in system namespace with default access
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithDefaultAccessComponentInMarkup:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	//$A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithaccessDefaultComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"auratest$accessPrivilegedComponentWithaccessDefaultComponentInMarkup");
            		completed = true;
            		that.componentCreated = newCmp;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        /************************************************* test for attribute ************************************/
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        },
        function cannotAccessPrivilegedAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.privilegedAttribute");
        },
    	]
    },
    
    /**************************************************************************************************
	    Test for nested components.
		we create a component in system namespace with privileged access as container component (accessPrivilegedComponentWithaccessPrivilegedComponentInMarkup)
		the container component has another component(accessPrivilegedComponent) in its markup. 
		accessPrivilegedComponent is a component in system namespace with default access
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithPrivilegedAccessComponentInMarkup:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	//$A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithaccessPrivilegedComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"auratest$accessPrivilegedComponentWithaccessPrivilegedComponentInMarkup");
            		completed = true;
            		that.componentCreated = newCmp;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        /************************************************* test for attribute ************************************/
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        },
        function cannotAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
    	]
    }



})