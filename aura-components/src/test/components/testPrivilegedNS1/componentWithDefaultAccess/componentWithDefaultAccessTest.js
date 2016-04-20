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
        //tests for method
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPrivateMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
        	//this.componentCreated.privateMethod();
        //},
        //function canNotAccessPublicMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
        	//this.componentCreated.publicMethod();
        //},
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
         //test for component event registered in the component we created
        function canAccessPrivilegedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        function canAccessNS1PrivilegedEventRegisteredWithPrivateAccess(cmp) {// bug?
        	var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess");
        	$A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function cannotAccessNS2DefaultEventRegisteredWithDefaultAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithDefaultAccess");
        },
        function cannotAccessNS2DefaultEventRegisteredWithGlobalAccess(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
        },
        function cannotAccessNS2PublicEventRegisteredWithDefaultAccess(cmp) {
       	    $A.test.expectAuraError("Access Check Failed!");
        	var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithDefaultAccess");
        },
        function cannotAccessNS2PrivilegedEventRegisteredWithDefaultAccess(cmp) {
        	var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess");
        	$A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        }
        ]
    },
    
    //we cannot create component with default access in a different privileged namespace
    testCreateComponentWithDefaultAccessOfAnotherPrivilegedNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){ 
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
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
		//function canNotAccessPrivateMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.privateMethod();
        //},
        //function canNotAccessPublicMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.publicMethod();
        //},
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
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPrivateMethod(cmp) {
			//$A.test.expectAuraError("Access Check Failed!");
			//this.componentCreated.privateMethod();
        //},
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
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPrivateMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.privateMethod();
        //},
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
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPrivateMethod(cmp) {
			//$A.test.expectAuraError("Access Check Failed!");
			//this.componentCreated.privateMethod();
        //},
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
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
		//function canNotAccessPrivateMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.privateMethod();
        //},
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPublicMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.publicMethod();
        //},
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        //},
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessInternalMethod(cmp) {
        	//$A.test.expectAuraError("Access Check Failed!");
        	//this.componentCreated.internalMethod();
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
        //tests for method
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessPrivateMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
		//	this.componentCreated.privateMethod();
        //},
        //function canNotAccessPublicMethod(cmp) {
		//	$A.test.expectAuraError("Access Check Failed!");
        	//this.componentCreated.publicMethod();
        //},
        function canAccessGlobalMethod(cmp) {
        	this.componentCreated.globalMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canAccessPrivilegedMethod(cmp) {
        	this.componentCreated.privilegedMethod();
        	$A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'privilegedMethod', "get unexpected outcome from calling privileged method");
        },
		//UNCOMMENT TEST WHEN METHOD ACFs GO LIVE
        //function canNotAccessInternalMethod(cmp) {
        	//$A.test.expectAuraError("Access Check Failed!");
        	//this.componentCreated.internalMethod();
        //},
        //tests for events
        function canAccessSystemNSGLobalEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSameSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSameSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        }
        //W-2999718
        /*function canAccessSystemNSDefaultEventRegisteredWithGlobalAccess(cmp) {
        	var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSameSystemNamespaceRegisteredWithGlobalAccess");
        	$A.test.assertTrue(evt.getName() === "eventWithDefaultAccessInSameSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        }*/
        ]
    }
 })