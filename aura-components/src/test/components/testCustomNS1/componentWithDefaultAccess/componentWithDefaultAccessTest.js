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
                    $A.test.assertEquals(newCmp.getName(),"testCustomNS1:componentWithDefaultAccess2");
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
        /*********************************** tests for method ******************************************/
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
                    $A.test.assertEquals(newCmp.getName(),"testCustomNS1:componentWithPublicAccess");
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
        /*********************************** tests for method ******************************************/
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
                    $A.test.assertEquals(newCmp.getName(),"testCustomNS1:componentWithGlobalAccess");
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
        /*********************************** tests for method ******************************************/
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
            $A.test.addWaitFor(true, function(){ return completed; });
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
            $A.test.addWaitFor(true, function(){ return completed; });
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
                    $A.test.assertEquals(newCmp.getName(),"testCustomNS2:componentWithGlobalAccess");
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
        function canNotAccessPublicAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.publicAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
            var actual = this.componentCreated.get("v.globalAttribute");
            $A.test.assertEquals(actual, "GLOBAL");
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
         /*********************************** test for component event ****************************************/
        //some of these tests are disabled because of W-2999718 W-3015661

        //we register event(testCustomNS2:componentEventWithDefaultAccess) in component we just created (testCustomNS2:componentWithGlobalAccess)
        //the event itself is defined with default access
        /*function canAccessDefaultEventRegisteredWithDefaultAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },
        function cannotAccessDefaultEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessDefaultEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithPublicAccess");
        },
        function canAccessDefaultEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("NS2eventWithDefaultAccessRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === 'NS2eventWithDefaultAccessRegisteredWithGlobalAccess', "get unexpected event name");
        },*/

        //we register event(testCustomNS2:componentEventWithPublicAccess) in component we just created (testCustomNS2:componentWithGlobalAccess)
        //the event itself is defined with access='Public'
        function cannotAccessPublicEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithDefaultAccess");
        },
        function cannotAccessPublicEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPrivateAccess");
        },
        function cannotAccessPublicEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS2eventWithPublicAccessRegisteredWithPublicAccess");
        },
        /*function canAccessPublicEventRegisteredWithGlobalAccess(cmp) {
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
        /*function cannotAccessGlobalEventRegisteredWithPublicAccess(cmp) {
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
        },
        /*function canAccessGlobalEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPublicAccess");
        },
        function canAccessGlobalEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("NS1eventWithGlobalAccessRegisteredWithPrivateAccess");
        }*/
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
            $A.test.addWaitFor(true, function(){ return completed; });
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
            $A.test.addWaitFor(true, function(){ return completed; });
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
            $A.test.addWaitFor(true, function(){ return completed; });
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
                    $A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1:componentWithGlobalAccess");
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
        function cannotAccessPrivilegedAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privilegedAttribute");
        },
        function canAccessGlobalAttribute(cmp) {
            var actual = this.componentCreated.get("v.globalAttribute");
            $A.test.assertEquals(actual, "GLOBAL");
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
        function cannotAccessPrivilegedMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privilegedMethod();
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
                    $A.test.assertEquals(newCmp.getName(),"auratest:accessGlobalComponent");
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
        function cannotAccessPrivilegedAttribute(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var actual = this.componentCreated.get("v.privilegedAttribute");
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
        function canNotAccessPrivilegedMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.privilegedMethod();
        },
        function canNotAccessInternalMethod(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            this.componentCreated.internalMethod();
        },
        /*********************************** tests for component event ******************************************/
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
        function cannotAccessSystemNSDefaultAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithDefaultAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        /*function canAccessSystemNSDefaultAccessEventRegisteredWithGlobalAccess(cmp) {
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
        function canNotAccessSystemNSInternalAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithInternalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        /*function canAccessSystemNSInternalAccessEventRegisteredWithGlobalAccess(cmp) {
            //$A.test.expectAuraError("Access Check Failed!");
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
        function canNotAccessSystemNSPublicAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        /*function canAccessSystemNSPublicAccessEventRegisteredWithGlobaldAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPublicAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/

        //tests for accessing event "accessPrilegedEvent" in system namespace "auratest", the event itself is defined with privileged access
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithDefaultAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithDefaultAccess");
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivateAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivateAccess");
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPublicAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPublicAccess");
        },
        function canNotAccessSystemNSPrivilegedAccessEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        /*function canAccessSystemNSPrivilegedAccessEventRegisteredWithGlobalAccess(cmp) {
            var evt = this.componentCreated.getEvent("eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess");
            $A.test.assertTrue(evt.getName() === "eventWithPrivilegedAccessInSystemNamespaceRegisteredWithGlobalAccess", "get unexpected event name:"+evt.getName());
        },*/

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
        function canNotAccessSystemNSGLobalEventRegisteredWithPrivilegedAccess(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            var evt = this.componentCreated.getEvent("eventWithGlobalAccessInSystemNamespaceRegisteredWithPrivilegedAccess");
        },
        */
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
                        $A.test.assertEquals(newCmpDescriptor, newCmp.getName(),
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
                });
            }
        ]
    },

    testFailingDescriptorForSetAttributeAccessCheckFailure:{
        test:[
            function(cmp){
                $A.test.expectAuraError("Access Check Failed! AttributeSet.get():");
                $A.test.expectAuraError("Access Check Failed! AttributeSet.set():");

                var newCmpDescriptor = "testCustomNS1:componentWithDefaultAccess2";
                $A.createComponent(newCmpDescriptor, {},
                    function(newCmp){
                        $A.test.assertEquals(newCmpDescriptor, newCmp.getName(),
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
                        $A.test.assertEquals(newCmp.getName(),newCmpDescriptor);
                        // Access Check Failure
                        newCmp.privateMethod();
                    }
                );

                var that = this;
                this.waitForErrorModal(function() {
                    var failingDescriptor = that.findFailingDescriptorFromErrorModal();

                    var expected = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expected, failingDescriptor);
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
                        $A.test.assertEquals(newCmp.getName(),newCmpDescriptor,
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
                });
            },
        ]
    },

    waitForErrorModal: function(callback) {
        $A.test.addWaitForWithFailureMessage(true,
            function(){
                var element = document.getElementById('auraErrorMask');
                var style = $A.test.getStyle(element, 'display');
                return style === 'block';
            },
            "Error Model didn't show up.",
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
