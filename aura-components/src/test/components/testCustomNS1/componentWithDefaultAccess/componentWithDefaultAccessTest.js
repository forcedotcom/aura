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
        Test for creating component belong to a Same custom namespace starts
    ******************************************************************************************/

    testCreateComponentWithDefaultAccessOfSameCustomNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){//default access is Public
            var that = this;
            var completed = false;
            $A.createComponent(
                "markup://testCustomNS1:componentWithDefaultAccess2",
                {},
                function(newCmp){
                    $A.test.assertEquals(newCmp.getType(),"testCustomNS1:componentWithDefaultAccess2");
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
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS1:componentWithDefaultAccess2",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privateMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testCustomNS1:privateMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessPublicMethod(cmp) {
            this.componentCreated.publicMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        }
        ]
    },

    testCreateComponentWithPublicAccessOfSameCustomNS:{
        test:[
        function canCreateComponentWithPublicAccess(cmp){
            var that = this;
            var completed = false;
            $A.createComponent(
                "markup://testCustomNS1:componentWithPublicAccess",
                {},
                function(newCmp){
                    $A.test.assertEquals(newCmp.getType(),"testCustomNS1:componentWithPublicAccess");
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
                        "Access Check Failed! AttributeSet.get(): attribute 'privateAttribute' of component 'markup://testCustomNS1:componentWithPublicAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privateMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():'markup://testCustomNS1:privateMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessPublicMethod(cmp) {
            this.componentCreated.publicMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        }
        ]
    },

    testCreateComponentWithGlobalAccessOfSameCustomNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
            var that = this;
            var completed = false;
            $A.createComponent(
                "markup://testCustomNS1:componentWithGlobalAccess",
                {},
                function(newCmp){
                    $A.test.assertEquals(newCmp.getType(),"testCustomNS1:componentWithGlobalAccess");
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
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS1:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
        /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privateMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testCustomNS1:privateMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessPublicMethod(cmp) {
            this.componentCreated.publicMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'publicMethod', "get unexpected outcome from calling public method");
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        }
        ]
    },

    /*****************************************************************************************
        Test for creating component belong to a Different custom namespace starts
    ******************************************************************************************/

    testCreateComponentWithDefaultAccessOfDifferentCustomNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){//default access is Public
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testCustomNS2:componentWithDefaultAccess",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testCustomNS2:componentWithDefaultAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }]
    },

    testCreateComponentWithPublicAccessOfDifferentCustomNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testCustomNS2:componentWithPublicAccess",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "AuraComponentService.createComponentFromConfig(): \'markup://testCustomNS2:componentWithPublicAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }]
    },

    testCreateComponentWithGlobalAccessOfDifferentCustomNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
            var that = this;
            var completed = false;
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
        function cannotAccessPrivateAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privateAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testCustomNS2:publicMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
        /* Below test is same as canAccessDefaultEventRegisteredWithGlobalAccess, should be deleted.
           //TODO(W-3722142): Issues changing access level during event registration
        function canAccessDefaultEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        //TODO(W-3722142): Issues changing access level during event registration
        function canAccessDefaultEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithDefaultAccess', "get unexpected event name");
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
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():'NS2eventWithPublicAccessRegisteredWithPrivateAccess' of component 'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPublicAccess\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
        function cannotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
        function cannotAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        function cannotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
        function cannotAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        },
        //we register event(testCustomNS1:componentEventWithGlobalAccess) in component we just created (testCustomNS2:componentWithGlobalAccess)
        //the event itself is defined with global access
        function canAccessGlobalEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithDefaultAccess', "get unexpected event name");
        },
        function canAccessGlobalEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithGlobalAccess', "get unexpected event name");
        }, 
        function canAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        }, 
        function canAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        }, 
        function canAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPublicAccess', "get unexpected event name");
        },
        function canAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === 'NS1eventWithGlobalAccessRegisteredWithPrivateAccess', "get unexpected event name");
        }
        ]
    },

     /*****************************************************************************************
        Test for creating component belong to a Privileged namespace starts
    ******************************************************************************************/

    testCreateComponentWithDefaultAccessOfPrivilegedNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testPrivilegedNS1:componentWithDefaultAccess",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AuraComponentService.createComponentFromConfig(): 'markup://testPrivilegedNS1:componentWithDefaultAccess",
                            "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }]
    },

    testCreateComponentWithPublicccessOfPrivilegedNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testPrivilegedNS1:componentWithPublicAccess",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testPrivilegedNS1:componentWithPublicAccess",
                            "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }]
    },

    testCreateComponentWithPrivilegedAccessOfPrivilegedNS:{
        test:[
        function cannotCreateComponentWithPrivilegedAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://testPrivilegedNS1:componentWithPrivilegedAccess",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testPrivilegedNS1:componentWithPrivilegedAccess",
                            "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }]
    },

    testCreateComponentWithGlobalAccessOfPrivilegedNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
            var that = this;
            var completed = false;
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
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://testPrivilegedNS1:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPrivilegedAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privilegedAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privilegedAttribute\' of component \'markup://testPrivilegedNS1:componentWithGlobalAccess",
                        "markup://testCustomNS1:componentWithDefaultAccess");
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
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:privateMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:publicMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function cannotAccessPrivilegedMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privilegedMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://testPrivilegedNS1:privilegedMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        }
        ]
    },

    /*****************************************************************************************
        Test for creating component belong to a System namespace starts
    ******************************************************************************************/

    testCreateComponentWithDefaultAccessOfSystemNS:{
        test:[
        function cannotCreateComponentWithDefaultAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://auratest:accessDefaultComponent",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },

    testCreateComponentWithPublicAccessOfSystemNS:{
        test:[
        function cannotCreateComponentWithPublicAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://auratest:accessPublicComponent",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },

    testCreateComponentWithPrivilegedAccessOfSystemNS:{
        test:[
        function cannotCreateComponentWithPrivilegedAccess(cmp){
            var completed = false;
            $A.test.expectAuraError("Access Check Failed!");
            $A.createComponent(
                "markup://auratest:accessPrivilegedComponent",
                {},
                function(newCmp){
                    completed = true;
                }
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        }]
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
                        "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessGlobalAttribute(cmp) {
            var actual = this.componentCreated.get("v.globalAttribute");
            $A.test.assertEquals(actual, "GLOBAL");
        },
        function cannotAccessPrivilegedAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privilegedAttribute");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get(): attribute \'privilegedAttribute\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
         /*********************************** tests for method ******************************************/
        function canNotAccessPrivateMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privateMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:privateMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessPublicMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.publicMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:publicMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessGlobalMethod(cmp) {
            this.componentCreated.globalMethod();
            $A.test.assertTrue(this.componentCreated.get("v.globalAttribute") === 'globalMethod', "get unexpected outcome from calling global method");
        },
        function canNotAccessPrivilegedMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privilegedMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:privilegedMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessInternalMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.internalMethod();
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.method():\'markup://auratest:internalMethod",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        /*********************************** tests for component event ******************************************/
        //Some of these tests are comment out because of W-2999718

        //tests for accessing event "accessDefaultEvent" in system namespace "auratest", the event itself is defined with default access
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSDefaultAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function cannotAccessSystemNSDefaultAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        /* 
           //TODO(W-3722142): Issues changing access level during event registration 
           function canAccessSystemNSDefaultAccessEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithDefaultAccessInSameSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/

        //tests for accessing event "accessInternalEvent" in system namespace "auratest", the event itself is defined with internal access
        function canNotAccessSystemNSInternalAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithInternalAccessInSystemNamespaceRegisteredWithPrivilegedAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canAccessSystemNSInternalAccessEventRegisteredWithGlobalAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithGlobalAccess");
        },
        //tests for accessing event "accessPublicEvent" in system namespace "auratest", the event itself is defined with public access
        function canNotAccessSystemNSPublicAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        /* 
           //TODO(W-3722142): Issues changing access level during event registration
           function canAccessSystemNSPublicAccessEventRegisteredWithGlobaldAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/

        //tests for accessing event "accessPrilegedEvent" in system namespace "auratest", the event itself is defined with privileged access
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            this.waitForErrorModal(function() {
                $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                        "Access Check Failed! Component.getEvent():\'eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivilegedAccess\' of component \'markup://auratest:accessGlobalComponent",
                        "markup://testCustomNS1:componentWithDefaultAccess");
            });
        },
        /* 
           //TODO(W-3722142): Issues changing access level during event registration
           function canAccessSystemNSPrivilegedAccessEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/

        //tests for accessing event "accessGlobalEvent" in system namespace "auratest", the event itself is defined with global access
        function canAccessSystemNSGLobalEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithDefaultAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithDefaultAccess", "get unexpected event name:"+evt.getName());
        },
        /* Below test is incorrect: It should not ACF
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },  Below test is incorrect: It should not ACF
        function canNotAccessSystemNSGLobalEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess");
        },  Below test is incorrect: It should not ACF
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },*/
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivateAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivateAccess", "get unexpected event name:"+evt.getName());
        },
        function canNotAccessSystemNSGLobalEventRegisteredWithPublicAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPublicAccess", "get unexpected event name:"+evt.getName());
        }, 
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivilegedAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess", "get unexpected event name:"+evt.getName());
        },
        function canAccessSystemNSGLobalEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithGlobalAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        }
        ]
    },

    /*****************************************************************************************
        Test for failing descriptor Access Check Failures error
    ******************************************************************************************/
    testFailingDescriptorForCreateComponentFromConfigAccessCheckFailure:{
        test:[
            function(cmp) {
                $A.test.expectAuraError("Access Check Failed! AuraComponentService.createComponentFromConfig():");
                
                // Access check failure
                $A.createComponent("markup://testCustomNS2:componentWithDefaultAccess", {}, function(){});

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                            "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://testCustomNS2:componentWithDefaultAccess",
                                "markup://testCustomNS1:componentWithDefaultAccess");
                });
            }
        ]
    },

    testFailingDescriptorForGetAttributeAccessCheckFailure:{
        test:[
            function(cmp){
                $A.test.expectAuraError("Access Check Failed! AttributeSet.get():");
                
                var newCmpDescriptor = "testCustomNS1:componentWithDefaultAccess2";
                $A.createComponent(newCmpDescriptor, {},
                    function(newCmp){
                        $A.test.assertEquals(newCmpDescriptor, newCmp.getType(),
                                "Test setup fails. Failed to create expected component.");
                        // Access check failure
                        newCmp.get("v.privateAttribute");
                    }
                );

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                            "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS1:componentWithDefaultAccess2",
                                "markup://testCustomNS1:componentWithDefaultAccess");
                });
            }
        ]
    },

    testFailingDescriptorForSetAttributeAccessCheckFailure:{
        test:[
            function(cmp){
                $A.test.expectAuraError("Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS1:componentWithDefaultAccess2");
                $A.test.expectAuraError("Access Check Failed! AttributeSet.set():");
                var newCmpDescriptor = "testCustomNS1:componentWithDefaultAccess2";
                $A.createComponent(newCmpDescriptor, {},
                    function(newCmp){
                        $A.test.assertEquals(newCmpDescriptor, newCmp.getType(),
                                "Test setup fails. Failed to create expected component.");
                        // Access check failure
                        newCmp.set("v.privateAttribute", "value");
                    }
                );

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                            "Access Check Failed! AttributeSet.set(): \'privateAttribute\' of component \'markup://testCustomNS1:componentWithDefaultAccess2",
                                "markup://testCustomNS1:componentWithDefaultAccess");
                });
            }
        ]
    },

    testFailingDescriptorForAuraMethodAccessCheckFailure:{
        test:[
            function (cmp){
                $A.test.expectAuraError("Access Check Failed! Component.method():");
                var newCmpDescriptor = "testCustomNS1:componentWithGlobalAccess";

                $A.createComponent(newCmpDescriptor, {},
                    function(newCmp){
                        $A.test.assertEquals(newCmp.getType(),newCmpDescriptor);
                        // Access Check Failure
                        newCmp.privateMethod();
                    }
                );

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                            "Access Check Failed! Component.method():\'markup://testCustomNS1:privateMethod",
                                "markup://testCustomNS1:componentWithDefaultAccess");
                });
            },
        ]
    },

    testFailingDescriptorForGetEventAccessCheckFailure:{
        test:[
            function (cmp){
                $A.test.expectAuraError("Access Check Failed! Component.getEvent():");
                var newCmpDescriptor = "testCustomNS2:componentWithGlobalAccess";

                $A.createComponent(newCmpDescriptor, {},
                    function(newCmp){
                        $A.test.assertEquals(newCmp.getType(),newCmpDescriptor,
                                "Test setup fails. Failed to create expected component.");
                        // Access Check Failure
                        newCmp.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
                    }
                );

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                            "Access Check Failed! Component.getEvent():\'NS2eventWithPublicAccessRegisteredWithPublicAccess",
                            "markup://testCustomNS1:componentWithDefaultAccess");
                });
            },
        ]
    },
    
    testGetDefinitionForComponentWithAccessSameNamespace:{
        test:[
              function(cmp){
                  var descriptor = "testCustomNS1:componentWithDefaultAccess2";
                  var complete = false;
                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNotNull(definition,"component definition requested is null");
                      $A.test.assertEquals("markup://testCustomNS1:componentWithDefaultAccess2", definition.getDescriptor().getQualifiedName());
                      complete = true;
                  });
                  $A.test.addWaitFor(true, function(){ return complete; });       
                  
              },     
        ]
    },
 
    //Access check test for $A.getDefinition - component definition requested is not on client (privileged namespace)
    testGetDefinitionForComponentWithoutAccessPrivilegedNamespace:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "testPrivilegedNS1:componentWithDefaultAccess";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition,"component definition requested from server is not null");
                      complete = true;
                  });
                  this.waitForErrorModal(function() {
                      $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! ComponentService.getDef():'markup://testPrivilegedNS1:componentWithDefaultAccess",
                                  "markup://testCustomNS1:componentWithDefaultAccess");
                  });
              },     
        ]  
    },
    
    //Access check test for $A.getDefinition - component definition requested is not on client (other custom NS)
    testGetDefinitionForComponentWithoutAccessDifferentCustomNamespace:{
        test:[
              function(cmp){
                  $A.test.expectAuraError("Access Check Failed!");
                  var descriptor = "testCustomNS2:componentWithDefaultAccess";
                  var complete = false;

                  $A.getDefinition(descriptor, function(definition) {
                      $A.test.assertNull(definition,"component definition requested from server is not null");
                      complete = true;
                  });
                  this.waitForErrorModal(function() {
                      $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                              "Access Check Failed! ComponentService.getDef():'markup://testCustomNS2:componentWithDefaultAccess",
                                  "markup://testCustomNS1:componentWithDefaultAccess");
                  });
              },     
        ]  
    },
    
    //Access check test for $A.getDefinition - application event in privileged namespace
    testGetDefinitionForApplicationEventWithGlobalAccessInPrivilegedNamespace: {
        test: function(){
            var actionComplete = false;
           $A.getDefinition("e.testPrivilegedNS1:applicationEventWithGlobalAccess", function(definition) {
               $A.test.assertNotNull(definition,"event definition requested is null");
               $A.test.assertEquals("markup://testPrivilegedNS1:applicationEventWithGlobalAccess", definition.getDescriptor().getQualifiedName());
               actionComplete = true;
           });
           $A.test.addWaitFor(true, function(){ return actionComplete; }); 
        }     
   },
   
   //Access check test for $A.getDefinition - application event in privileged namespace
   testGetDefinitionForApplicationEventWithPublicAccessInPrivilegedNamespace: {
       test: function(){
          $A.test.expectAuraError("Access Check Failed!");
           var actionComplete = false;

          $A.getDefinition("e.testPrivilegedNS1:applicationEventWithPublicAccess", function(definition) {
              $A.test.assertNull(definition,"application event definition requested is not null");
              actionComplete = true;
          });
          this.waitForErrorModal(function() {
              $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                      "Access Check Failed! EventService.getEventDef():'markup://testPrivilegedNS1:applicationEventWithPublicAccess",
                          "markup://testCustomNS1:componentWithDefaultAccess");
          });
      }
  
  },
   
    //TODO(W-3736608): Put waitForErrorModal logic and ACF error verification in Test.js in library 
    waitForErrorModal: function(callback) {
        $A.test.addWaitForWithFailureMessage(true,
            function(){
                var element = document.getElementById('auraErrorMask');
                var style = $A.test.getStyle(element, 'display');
                return style === 'block';
            },
            "Error Modal didn't show up.",
            callback);
    },

    /**
     * This function doesn't check if error modal exist. If expected error is from async
     * code, using waitForErrorModal() to guarantee error modal is shown.
     */
    findFailingDescriptorFromErrorModal: function() {
        var errorMsg = $A.test.getText(document.getElementById('auraErrorMessage'));
        if(!errorMsg) {
            $A.test.fail("Failed to find error message.");
        }
        var matches = errorMsg.match(/^Failing descriptor: \{(.*)\}$/m);
        if(!matches) {
            $A.test.fail("Failed to find Failing Descriptor from error message: " + errorMsg);
        }
        var failingDescriptor = matches[1];
        return failingDescriptor;
    }

})
