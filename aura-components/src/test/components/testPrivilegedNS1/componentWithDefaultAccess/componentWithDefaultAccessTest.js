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
        Test for creating component belong to a custom namespace starts
    ***************************************************************************************************/
    
    testCreateComponentWithDefaultAccessOfCustomNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){ 
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testCustomNS1:componentWithDefaultAccess", 
                {}, 
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testCustomNS1:componentWithDefaultAccess",
                                    "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
        }
        ]
    },
    
    testCreateComponentWithPublicAccessOfCustomNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){ 
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testCustomNS1:componentWithPublicAccess", 
                {}, 
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testCustomNS1:componentWithPublicAccess",
                                    "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
        }
        ]
    },
    
    testCreateComponentWithGlobalAccessOfCustomNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){ 
            var completed = false;
            var that = this;
            var that = this;
            $A.createComponent(
                "markup://testCustomNS2:componentWithGlobalAccess", 
                {}, 
                function(newCmp){
                    $A.test.assertEquals(newCmp.getType(),"testCustomNS2:componentWithGlobalAccess");
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canAccessGlobalAttribute(cmp) {
            var actual = this.componentCreated.get("v.globalAttribute");
            $A.test.assertEquals(actual, "GLOBAL");
        }, 
         /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privateMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testCustomNS2:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testCustomNS2:publicMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        /*********************************** test for component event ****************************************/
        //some of these tests are disabled because of W-2999718 W-3015661 
        //we register event(testCustomNS2:componentEventWithDefaultAccess) in component we just created (testCustomNS2:componentWithGlobalAccess) 
        //the event itself is defined with default access
         /*
        //TODO(W-3722142): Issues changing access level during event registration
        function cannotAccessDefaultEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },*/
        function cannotAccessDefaultEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessDefaultEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPublicAccess");
        },
        /*
        //TODO(W-3722142): Issues changing access level during event registration
        function canAccessDefaultEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },*/
        
        //we register event(testCustomNS2:componentEventWithPublicAccess) in component we just created (testCustomNS2:componentWithGlobalAccess) 
        //the event itself is defined with access='Public'
        function cannotAccessPublicEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithDefaultAccess\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPrivateAccess\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPublicAccess\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        /*
        //TODO(W-3722142): Issues changing access level during event registration
        function canAccessPublicEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithPublicAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },*/
        
        //we register event(testCustomNS2:componentEventWithGlobalAccess) in component we just created (testCustomNS2:componentWithGlobalAccess) 
        //the event itself is defined with access='Global'
        function canAccessGlobalEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        function canAccessGlobalEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        /*
        //TODO(W-3722142): Issues changing access level during event registration
        function cannotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPublicAccess");
        },
        function cannotAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivateAccess");
        },*/
        
        //we register event(testCustomNS1:componentEventWithGlobalAccess) in component we just created (testCustomNS2:componentWithGlobalAccess) 
        //the event itself is defined with global access
        function canAccessGlobalEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        function canAccessGlobalEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        }
        /*
        //TODO(W-3722142): Issues changing access level during event registration
        function canAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
        } 
        function canAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
        } */
        
        ]
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
                    $A.test.assertEquals(newCmp.getType(),"testPrivilegedNS2:componentWithPrivilegedAccess");
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS2:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS2:publicMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
        function canNotAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function canNotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
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
        function canAccessNS1PrivilegedEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function canAccessNS1PrivilegedEventRegisteredWithPrivilegedAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPrivilegedAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
        function canAccessNS1PrivilegedEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithPrivilegedAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithPrivilegedAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithDefaultAccessRegisteredWithDefaultAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2DefaultEventRegisteredWithGlobalAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithDefaultAccessRegisteredWithGlobalAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2DefaultEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithDefaultAccessRegisteredWithPublicAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2DefaultEventRegisteredWithPrilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithDefaultAccessRegisteredWithPrivilegedAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2DefaultEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithDefaultAccessRegisteredWithPrivateAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        
        //we register event(testPrivilegedNS2:componentEventWithPublicAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with public access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function cannotAccessNS2PublicEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithDefaultAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2PublicEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPrivateAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2PublicEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPrivateAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2PublicEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPublicAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2PublicEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPrivilegedAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessNS2PublicEventRegisteredWithGlobalAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithGlobalAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithGlobalAccess\' of component \'markup://testPrivilegedNS2:componentWithPrivilegedAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        
        //we register event(testPrivilegedNS2:componentEventWithPrivilegedAccess) in component we just created (testPrivilegedNS2:componentWithPrivilegedAccess) 
        //the event itself is defined with public access
        //Note: event defined in testPrivilegedNS2, registered in testPrivilegedNS2, now we try to access it in testPrivilegedNS1
        function canAccessNS2PrivilegedEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithDefaultAccess', "get unexpected event name");
        }, 
        function cannotAccessNS2PrivilegedEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function cannotAccessNS2PrivilegedEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithPrivilegedAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithPrivilegedAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
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
        function cannotAccessNS2PrivilegedEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function cannotAccessNS2PrivilegedEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
        function canAccessNS2PrivilegedEventRegisteredWithPrivilegedAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivilegedAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPrivilegedAccess', "get unexpected event name");
        },
        function canAccessNS2PrivilegedEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        }
        
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
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                           //"Access Check Failed! AuraComponentService.createComponentFromConfig(): 'markup://testPrivilegedNS2:componentWithDefaultAccess", 
                                "Access Check Failed!", "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
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
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testPrivilegedNS2:componentWithPublicAccess",
                                    "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
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
                    $A.test.assertEquals("testPrivilegedNS2:componentWithGlobalAccess", newCmp.getType());
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://testPrivilegedNS2:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS2:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS2:publicMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
                    $A.test.assertEquals(newCmp.getType(),"testPrivilegedNS1:componentWithDefaultAccess2");
                    that.componentCreated = newCmp;
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS1:componentWithDefaultAccess2",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
                    $A.test.assertEquals(newCmp.getType(),"testPrivilegedNS1:componentWithPublicAccess");
                    that.componentCreated = newCmp;
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS1:componentWithPublicAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
                    $A.test.assertEquals(newCmp.getType(),"testPrivilegedNS1:componentWithGlobalAccess");
                    that.componentCreated = newCmp;
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }, 
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS1:componentWithGlobalAccess",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
                    $A.test.assertEquals(newCmp.getType(),"auratest:accessPrivilegedComponent");
                    that.componentCreated = newCmp;
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://auratest:accessPrivilegedComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://auratest:accessPrivilegedComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:publicMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:internalMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        }
        ]
    },
    
    //we cannot create component with default access in internal/system namespace
    testCreateComponentWithDefaultAccessOfSystemNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){
            $A.test.expectAuraError("Access Check Failed!");
            var completed = false;
            $A.createComponent(
                "markup://auratest:accessDefaultComponent", 
                {}, 
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://auratest:accessDefaultComponent",
                                    "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
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
            $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, 
                    "Didn't get ACF error box",
                    function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://auratest:accessPublicComponent",
                                    "markup://testPrivilegedNS1:componentWithDefaultAccess");
                        });
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
                    $A.test.assertEquals(newCmp.getType(),"auratest:accessGlobalComponent");
                    that.componentCreated = newCmp;
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:privateMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:publicMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:internalMethod",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        
        /********************************** tests for events ****************************************/
        //Some of these tests are comment out because of W-2999718
        
        //tests for accessing event "accessDefaultEvent" in system namespace "auratest", the event itself is defined with default access
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canAccessSystemNSDefaultAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        function canAccessSystemNSDefaultAccessEventRegisteredWithGlobalAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithGlobalAccess");
        },
        
        //tests for accessing event "accessInternalEvent" in system namespace "auratest", the event itself is defined with internal access
        function canNotAccessSystemNSInternalAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        /*
        function canAccessSystemNSInternalAccessEventRegisteredWithPrivilegedAccess(cmp) {
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
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testPrivilegedNS1:componentWithDefaultAccess");
            });
        },
        function canAccessSystemNSPublicAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        /*
        //TODO(W-3722142): Issues changing access level during event registration
        function canAccessSystemNSPublicAccessEventRegisteredWithGlobaldAccess(cmp) {
            //$A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/
        
        //tests for accessing event "accessPrilegedEvent" in system namespace "auratest", the event itself is defined with privileged access
        function canAccessSystemNSPrivilegedAccessEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess", "get unexpected event name:"+evt.getName());
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess", "get unexpected event name:"+evt.getName());
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess", "get unexpected event name:"+evt.getName());
        },
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
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess", "get unexpected event name:"+evt.getName());
        },
        function canNotAccessSystemNSGLobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess", "get unexpected event name:"+evt.getName());
        },
        
        function canAccessSystemNSGLobalEventRegisteredWithPrivilegedAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSGLobalEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        }
        ]
    },
    
    waitForErrorModal: function(callback) {
        $A.test.addWaitForWithFailureMessage(true,
            function(){
                var element = document.getElementById('auraErrorMask');
                var style = $A.test.getStyle(element, 'display');
                return style === 'block';
            },
            "Error Modal didn't show up.",
            callback);
    }
 })
