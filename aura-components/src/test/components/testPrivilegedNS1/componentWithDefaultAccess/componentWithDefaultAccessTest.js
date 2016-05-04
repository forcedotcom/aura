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
    
	/*****************************************************************************************
	    Test for creating component belong to a DIFFERENT privileged namespace starts
	******************************************************************************************/
	
    testCreateComponentWithPrivilegedAccessOfAnotherPrivilegedNS:{
        test:[
        function canCreateComponentWithPrivilegedAccess(cmp){ 
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS2:componentWithPrivilegedAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS2$componentWithPrivilegedAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        //tests for attribute
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
        }, 
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        }, 
         /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },

        /*********************************** test for component event ****************************************/
        //some of these tests are disabled because of W-3015661
        
        //we register event(testPrivilegedNS1:componentEventWithGlobalAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with access='Global'
        //Note: event defined in testPrivilegedNS1, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function canAccessGlobalEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        /*function canNotAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
        },
        function canNotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
        },*/
        function canAccessGlobalEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
        function canAccessGlobalEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        
        //we register event(testPrivilegedNS1:componentEventWithPrivilegedAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with access='privileged'
        //Note: event defined in testPrivilegedNS1, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function canAccessPrivilegedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        /*function canAccessNS1PrivilegedEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess");
        },*/
        function canAccessNS1PrivilegedEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
        /*function canAccessNS1PrivilegedEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPublicAccess");
        },*/
        function canAccessNS1PrivilegedEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        
        //we register event(testPrivilegedNS2:componentEventWithDefaultAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with default access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function cannotAccessNS2DefaultEventRegisteredWithDefaultAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithDefaultAccess");
        },
        function cannotAccessNS2DefaultEventRegisteredWithGlobalAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
        },
        function cannotAccessNS2DefaultEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPublicAccess");
        },
        function cannotAccessNS2DefaultEventRegisteredWithPrilegedAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivilegedAccess");
        },
        function cannotAccessNS2DefaultEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivateAccess");
        },
        
        //we register event(testPrivilegedNS2:componentEventWithPublicAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with public access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function cannotAccessNS2PublicEventRegisteredWithDefaultAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithDefaultAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithPrivateAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithPrivateAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithPublicAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithPublicAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivilegedAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithGlobalAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithGlobalAccess");
        },
        
        //we register event(testPrivilegedNS2:componentEventWithPrivilegedAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with public access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function canAccessNS2PrivilegedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        /*function cannotAccessNS2PrivilegedEventRegisteredWithPrivateAccess(cmp) {
         	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessNS2PrivilegedEventRegisteredWithPublicAccess(cmp) {
         	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithPublicAccess");
        },*/
        function canAccessNS2PrivilegedEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
         function canAccessNS2PrivilegedEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        
        
        //we register event(testPrivilegedNS2:componentEventWithGlobalAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with global access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function canAccessNS2PrivilegedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        /*function cannotAccessNS2PrivilegedEventRegisteredWithPrivateAccess(cmp) {
       		$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessNS2PrivilegedEventRegisteredWithPublicAccess(cmp) {
       		$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPublicAccess");
        },*/
        function canAccessNS2PrivilegedEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
        function canAccessNS2PrivilegedEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        
        ]
    },
    
    //we cannot create component with default access in a different privileged namespace
    testCreateComponentWithDefaultAccessOfAnotherPrivilegedNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){ 
        	$A.test.expectAuraError("Access Check Failed!");
        	var completed = false;
            $A.createComponent(
            	"markup://testPrivilegedNS2:componentWithDefaultAccess", 
            	{}, 
            	function(newCmp){
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
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
        //tests for attribute
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        //tests for method
		function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        }
        ]
    },
    
    /**************************************************************************************************
	    Test for creating component belong to the SAME privileged namespace starts
	***************************************************************************************************/
	
	testCreateComponentWithDefaultAccessOfSamePrivilegedNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){ 
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        //tests for method
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canAccessPublicMethod(cmp) {
			this.componentCreated.publicMethod();
			$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        //test for component event registered in the component we created
        function canAccessPrivigedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        function canAccessPrivigedEventRegisteredWithPrivateAccess(cmp) {// bug?
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess', "get unexpected event name");
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        //tests for method
		function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canAccessPublicMethod(cmp) {
        	this.componentCreated.publicMethod();
			$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        //tests for method
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canAccessPublicMethod(cmp) {
        	this.componentCreated.publicMethod();
			$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        }
        ]
    },
    
    
    
	/**************************************************************************************************
	    Test for creating component belong to Internal/System namespace starts
	***************************************************************************************************/
    testCreateComponentWithPrivilegedAccessOfSystemNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://auratest:accessPrivilegedComponent", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getName(),"auratest$accessPrivilegedComponent");
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        //tests for method
		function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.internalMethod();
        }
        ]
    },
    
    //we cannot create component with default access in internal/system namespace
	testCreateComponentWithDefaultAccessOfSystemNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){
        	$A.test.expectAuraError("Access Check Failed!");
        	var completed = false;
            $A.createComponent(
            	"markup://auratest:accessDefaultComponent", 
            	{}, 
            	function(newCmp){
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
        ]
    },
    
    //we cannot create component with public access in internal/system namespace
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
        },
        function canAccessPrivilegedAttribute(cmp) {
        	var actual = this.componentCreated.get("v.privilegedAttribute");
        	$A.test.assertEquals(actual, "PRIVILEGED");
        },
        
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
			this.componentCreated.privateMethod();
        },
        function canNotAccessPublicMethod(cmp) {
			$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.publicMethod();
        },
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
        function canNotAccessInternalMethod(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	this.componentCreated.internalMethod();
        },
        
        /********************************** tests for events ****************************************/
        //Some of these tests are comment out because of W-2999718
        
        //tests for accessing event "accessDefaultEvent" in system namespace "auratest", the event itself is defined with default access
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithDefaultAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithDefaultAccess");
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPublicAccess");
        },
        /*function canAccessSystemNSDefaultAccessEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSDefaultAccessEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithDefaultAccessInSameSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/
        
        //tests for accessing event "accessInternalEvent" in system namespace "auratest", the event itself is defined with internal access
        function canNotAccessSystemNSInternalAccessEventRegisteredWithDefaultAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithDefaultAccess");
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPublicAccess");
        },
        /*function canAccessSystemNSInternalAccessEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithInternalAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSInternalAccessEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithInternalAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/
        
        //tests for accessing event "accessPublicEvent" in system namespace "auratest", the event itself is defined with public access
        function canNotAccessSystemNSPublicAccessEventRegisteredWithDefaultAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithDefaultAccess");
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPublicAccess");
        },
        /*function canAccessSystemNSPublicAccessEventRegisteredWithPrivilegedAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSPublicAccessEventRegisteredWithGlobaldAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/
        
        //tests for accessing event "accessPrilegedEvent" in system namespace "auratest", the event itself is defined with privileged access
        function canAccessSystemNSPrivilegedAccessEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess", "get unexpected event name:"+evt.getName());
        },
        /*function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess");
        },*/
        function canAccessSystemNSPrivilegedAccessEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSPrivilegedAccessEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },
        
        //tests for accessing event "accessGlobalEvent" in system namespace "auratest", the event itself is defined with global access
        function canAccessSystemNSGLobalEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithDefaultAccess", "get unexpected event name:"+evt.getName());
        },
        /*function canNotAccessSystemNSGLobalEventRegisteredWithPrivateAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSGLobalEventRegisteredWithPublicAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess");
        },
        */
        function canAccessSystemNSGLobalEventRegisteredWithPrivilegedAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSGLobalEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        }
        ]
    }
 })