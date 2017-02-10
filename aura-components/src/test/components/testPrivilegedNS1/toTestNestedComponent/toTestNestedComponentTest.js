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
		we create a component in system namespace with privileged access as container component (auratest:accessPrivilegedComponentWithAccessDefaultComponentInMarkup)
		the container component has another component(accessDefaultComponent) in its markup. 
		accessDefaultComponent is a component in system namespace with default access
		for attribute, 
			we can access global and privileged only if access directly.
			if access via method of container component, we can access global,privileged, internal and public (because accessDefaultComponent is in the same system ns as its container)
		for method, 
			we can access global and privileged only if access directly
			if access via method of container component, we can access global,privileged, public and internal
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithDefaultAccessComponentInMarkup:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	$A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithAccessDefaultComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"auratest:accessPrivilegedComponentWithAccessDefaultComponentInMarkup");
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
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        function cannotAccessInternalAttribute(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessDefaultComponent").get("v.internalAttribute");
        },
         /****** access attribute of accessDefaultComponent via method in container component ****/
         function canAccessGlobalAttributeInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setGlobalAttributeInComponentWithDefaultAccess();
        	 $A.test.assertEquals(
        	 this.componentCreated.find("accessDefaultComponent").get("v.globalAttribute"), 
        	 "new global");
         },
         function canAccessPublicAttributeInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPublicAttributeInComponentWithDefaultAccess();
         },
         //we need to expect aura error twice because set throw error twice
         function cannotAccessPrivateAttributeInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.setPrivateAttributeInComponentWithDefaultAccess();
         },
         function canAccessInternalAttributeInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setInternalAttributeInComponentWithDefaultAccess();
         },
         function canAccessPrivilegedAttributeInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPrivilegedAttributeInComponentWithDefaultAccess();
        	 $A.test.assertEquals(
        	 	this.componentCreated.find("accessDefaultComponent").get("v.privilegedAttribute"), 
        	 	"new privileged");
         },
         /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessDefaultComponent").privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessDefaultComponent").publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.find("accessDefaultComponent").globalMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessDefaultComponent").get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.find("accessDefaultComponent").privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessDefaultComponent").get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessDefaultComponent").internalMethod();
        },
        /*** call method of accessDefaultComponent via container component's method ***/
         function canAccessGlobalMethodInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callGlobalMethodInComponentWithDefaultAccess();
         },
         function canAccessPublicMethodInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPublicMethodInComponentWithDefaultAccess();
         },
         function cannotAccessPrivateMethodInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.callPrivateMethodInComponentWithDefaultAccess();
         },
         function canAccessPrivilegedMethodInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPrivilegedMethodInComponentWithDefaultAccess();
         },
         function canAccessInternalMethodInComponentWithDefaultAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callInternalMethodInComponentWithDefaultAccess();
         }
        /************************************* tests for component event ********************************/
         //TODO : W-3015661
    	]
    },
    
    /**************************************************************************************************
	    Test for nested components.
		we create a component in system namespace with privileged access as container component (auratest:accessPrivilegedComponentWithAccessPrivilegedComponentInMarkup)
		the container component has another component(accessPrivilegedComponent) in its markup. 
		accessPrivilegedComponent is a component in system namespace with privileged access
		for attribute, 
			we can access global and privileged only if access directly.
			if access via method of container component, we can access global,privileged, internal and public (because accessGlobalComponent is in the same system ns as its container)
		for method, 
			we can access global and privileged only if access directly
			if access via method of container component, we can access global,privileged, public and internal
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithPrivilegedAccessComponentInMarkup:{
        test:[
        function canCreateComponentWithPrivilegedAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	$A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithAccessPrivilegedComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"auratest:accessPrivilegedComponentWithAccessPrivilegedComponentInMarkup");
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
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        function cannotAccessInternalAttribute(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessPrivilegedComponent").get("v.internalAttribute");
        },
        /****** access attribute of accessDefaultComponent via method in container component ****/
         function canAccessGlobalAttributeInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setGlobalAttributeInComponentWithPrivilegedAccess();
        	 $A.test.assertEquals(
        	 this.componentCreated.find("accessPrivilegedComponent").get("v.globalAttribute"), 
        	 "new global");
         },
         function canAccessPublicAttributeInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPublicAttributeInComponentWithPrivilegedAccess();
         },
         //we need to expect aura error twice because set throw error twice
         function cannotAccessPrivateAttributeInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.setPrivateAttributeInComponentWithPrivilegedAccess();
         },
         function canAccessInternalAttributeInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setInternalAttributeInComponentWithPrivilegedAccess();
         },
         function canAccessPrivilegedAttributeInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPrivilegedAttributeInComponentWithPrivilegedAccess();
        	 $A.test.assertEquals(
        	 	this.componentCreated.find("accessPrivilegedComponent").get("v.privilegedAttribute"), 
        	 	"new privileged");
         },
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPrivilegedComponent").privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPrivilegedComponent").publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.find("accessPrivilegedComponent").globalMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessPrivilegedComponent").get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.find("accessPrivilegedComponent").privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessPrivilegedComponent").get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPrivilegedComponent").internalMethod();
        },
        /*** call method of accessPrivilegedComponent via container component's method ***/
         function canAccessGlobalMethodInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callGlobalMethodInComponentWithPrivilegedAccess();
         },
         function canAccessPublicMethodInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPublicMethodInComponentWithPrivilegedAccess();
         },
         function cannotAccessPrivateMethodInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.callPrivateMethodInComponentWithPrivilegedAccess();
         },
         function canAccessPrivilegedMethodInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPrivilegedMethodInComponentWithPrivilegedAccess();
         },
         function canAccessInternalMethodInComponentWithPrivilegedAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callInternalMethodInComponentWithPrivilegedAccess();
         }
        /************************************* tests for component event ********************************/
         //TODO : W-3015661
    	]
    },
    
     /**************************************************************************************************
	    Test for nested components.
		we create a component in system namespace with privileged access as container component (auratest:accessPrivilegedComponentWithAccessPublicComponentInMarkup)
		the container component has another component(accessPublicComponent) in its markup. 
		accessPublicComponent is a component in system namespace with public access
		for attribute, 
			we can access global and privileged only if access directly.
			if access via method of container component, we can access global,privileged, internal and public (because accessPublicComponent is in the same system ns as its container)
		for method, 
			we can access global and privileged only if access directly
			if access via method of container component, we can access global,privileged, public and internal
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithPublicAccessComponentInMarkup:{
        test:[
        function canCreateComponentWithPublicAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	$A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithAccessPublicComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"auratest:accessPrivilegedComponentWithAccessPublicComponentInMarkup");
            		completed = true;
            		that.componentCreated = newCmp;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        /************************************************* test for attribute ************************************/
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessPublicComponent").get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessPublicComponent").get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.find("accessPublicComponent").get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        },
        function cannotAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.find("accessPublicComponent").get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        /****** access attribute of accessPublicComponent via method in container component ****/
         function canAccessGlobalAttributeInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setGlobalAttributeInComponentWithPublicAccess();
        	 $A.test.assertEquals(
        	 this.componentCreated.find("accessPublicComponent").get("v.globalAttribute"), 
        	 "new global");
         },
         function canAccessPublicAttributeInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPublicAttributeInComponentWithPublicAccess();
         },
         //we need to expect aura error twice because set throw error twice
         function cannotAccessPrivateAttributeInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.setPrivateAttributeInComponentWithPublicAccess();
         },
         function canAccessInternalAttributeInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setInternalAttributeInComponentWithPublicAccess();
         },
         function canAccessPrivilegedAttributeInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPrivilegedAttributeInComponentWithPublicAccess();
        	 $A.test.assertEquals(
        	 	this.componentCreated.find("accessPublicComponent").get("v.privilegedAttribute"), 
        	 	"new privileged");
         },
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPublicComponent").privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPublicComponent").publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.find("accessPublicComponent").globalMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessPublicComponent").get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.find("accessPublicComponent").privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessPublicComponent").get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessPublicComponent").internalMethod();
        },
        /*** call method of accessPublicComponent via container component's method ***/
         function canAccessGlobalMethodInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callGlobalMethodInComponentWithPublicAccess();
         },
         function canAccessPublicMethodInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPublicMethodInComponentWithPublicAccess();
         },
         function cannotAccessPrivateMethodInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.callPrivateMethodInComponentWithPublicAccess();
         },
         function canAccessPrivilegedMethodInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPrivilegedMethodInComponentWithPublicAccess();
         },
         function canAccessInternalMethodInComponentWithPublicAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callInternalMethodInComponentWithPublicAccess();
         }
        /************************************* tests for component event ********************************/
         //TODO : W-3015661
    	]
    },
    
     /**************************************************************************************************
	    Test for nested components.
		we create a component in system namespace with privileged access as container component (auratest:accessPrivilegedComponentWithAccessGlobalComponentInMarkup)
		the container component has another component(auratest:accessGlobalComponent) in its markup. 
		accessGlobalComponent is a component in system namespace with global access
		for attribute, 
			we can access global and privileged only if access directly.
			if access via method of container component, we can access global,privileged, internal and public (because accessGlobalComponent is in the same system ns as its container)
		for method, 
			we can access global and privileged only if access directly
			if access via method of container component, we can access global,privileged, public and internal
	***************************************************************************************************/
	testCreateComponentWithPrivilegedAccessInSystemNSWithGlobalAccessComponentInMarkup:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){ 
        	var completed = false;
        	var that = this;
        	$A.createComponent(
            	"markup://auratest:accessPrivilegedComponentWithAccessGlobalComponentInMarkup", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"auratest:accessPrivilegedComponentWithAccessGlobalComponentInMarkup");
            		completed = true;
            		that.componentCreated = newCmp;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        /************************************************* test for attribute ************************************/
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessGlobalComponent").get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.find("accessGlobalComponent").get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.find("accessGlobalComponent").get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.find("accessGlobalComponent").get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        /****** access attribute of accessGlobalComponent via method in container component ****/
         function canAccessGlobalAttributeInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setGlobalAttributeInComponentWithGlobalAccess();
        	 $A.test.assertEquals(
        	 this.componentCreated.find("accessGlobalComponent").get("v.globalAttribute"), 
        	 "new global");
         },
         function canAccessPublicAttributeInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPublicAttributeInComponentWithGlobalAccess();
         },
         //we need to expect aura error twice because set throw error twice
         function cannotAccessPrivateAttributeInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.setPrivateAttributeInComponentWithGlobalAccess();
         },
         function canAccessInternalAttributeInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setInternalAttributeInComponentWithGlobalAccess();
         },
         function canAccessPrivilegedAttributeInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.setPrivilegedAttributeInComponentWithGlobalAccess();
        	 $A.test.assertEquals(
        	 	this.componentCreated.find("accessGlobalComponent").get("v.privilegedAttribute"), 
        	 	"new privileged");
         },
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessGlobalComponent").privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessGlobalComponent").publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.find("accessGlobalComponent").globalMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessGlobalComponent").get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.find("accessGlobalComponent").privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.find("accessGlobalComponent").get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.find("accessGlobalComponent").internalMethod();
        },
        /*** call method of accessGlobalComponent via container component's method ***/
         function canAccessGlobalMethodInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callGlobalMethodInComponentWithGlobalAccess();
         },
         function canAccessPublicMethodInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPublicMethodInComponentWithGlobalAccess();
         },
         function cannotAccessPrivateMethodInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
         	 $A.test.expectAuraError("Access Check Failed!");
        	 this.componentCreated.callPrivateMethodInComponentWithGlobalAccess();
         },
         function canAccessPrivilegedMethodInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callPrivilegedMethodInComponentWithGlobalAccess();
         },
         function canAccessInternalMethodInComponentWithGlobalAccessViaMethodInOutsideCmp(cmp) {
        	 this.componentCreated.callInternalMethodInComponentWithGlobalAccess();
         }
        /************************************* tests for component event ********************************/
         //TODO : W-3015661
    	]
    }



})
