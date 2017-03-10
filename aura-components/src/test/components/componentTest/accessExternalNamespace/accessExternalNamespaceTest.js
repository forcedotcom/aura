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
        Test for creating component belong to a DIFFERENT System namespace starts
    ******************************************************************************************/

    testCreateComponentWithDefaultAccessOfSystemNS:{
        test:[
            function canCreateComponentWithDefaultAccess(cmp){//Different
                var completed = false;
                var that = this;
                $A.createComponent(
                    "markup://auratest:accessDefaultComponent",
                    {},
                    function(newCmp){
                        $A.test.assertEquals(newCmp.getType(),"auratest:accessDefaultComponent");
                        that.componentCreated = newCmp;
                        completed = true;
                    }
                );
                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function cannotAccessPrivateAttribute(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                var actual = this.componentCreated.get("v.privateAttribute");
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://auratest:accessDefaultComponent",
                                        "markup://componentTest:accessExternalNamespace");
                 });
            },
            function cannotAccessPublicAttribute(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                var actual = this.componentCreated.get("v.publicAttribute");
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://auratest:accessDefaultComponent",
                                        "markup://componentTest:accessExternalNamespace");
                 });
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
                //$A.test.addWaitFor(true, function(){ return completed; });
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AuraComponentService.createComponentFromConfig(): \'markup://auratest:accessPublicComponent",
                                        "markup://componentTest:accessExternalNamespace");
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
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://auratest:accessGlobalComponent",
                                        "markup://componentTest:accessExternalNamespace");
                });
            },
            function cannotAccessPublicAttribute(cmp) {
                $A.test.expectAuraError("Access Check Failed!");
                var actual = this.componentCreated.get("v.publicAttribute");
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'publicAttribute\' of component \'markup://auratest:accessGlobalComponent",
                                        "markup://componentTest:accessExternalNamespace");
                });
            },
            function canAccessGlobalAttribute(cmp) {
                var actual = this.componentCreated.get("v.globalAttribute");
                $A.test.assertEquals("GLOBAL", actual);
            }
        ]
    }

 })
