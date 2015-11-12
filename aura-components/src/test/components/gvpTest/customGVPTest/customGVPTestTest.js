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
    /**
     * we define custom GVP in customGVPTemplate.cmp, this test component use that template
     * Note that we actually create a instance of custom GVP in the template, it's called "CustomInitInTemplate"
     * But for tests in this file, we don't want to use that instance, instead, we create new one here (called 'Custom')
     */
    testAddValueProviderAndGetWithCallback: {
        test: [function(component){
            var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
            $A.test.addWaitForWithFailureMessage("[task_mode_today]",
                    function() {
                        return $A.get("$Custom.task_mode_today", function(value) {
                                component.set("v.stringValue","callback passed to get, value="+value);
                            } );
                    },
                    "fail to get the correct value from Custom Global Value Provider",
                    function() {
                        $A.test.addWaitForWithFailureMessage("callback passed to get, value=Today",
                            function() {
                                return component.get("v.stringValue");
                            },
                            "fail to excute callback passed to get"
                        );
                    }
            );
        }]
    },

    testAddDuplicateValueProvider: {
        test: function(component) {
            var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
            try {
                $A.addValueProvider('$Custom', cgvp);
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: $A.addValueProvider(): '$Custom' has already been registered. : false", e.message);
            }
        }
    },

    testAddValueProvider_InvalidType: {
        test: function(component){
            var cgvp = new CustomGlobalValueProvider();
            try {
                $A.addValueProvider({}, cgvp);
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: $A.addValueProvider(): 'type' must be a valid String. : false", e.message);
            }
        }
    },

    testAddValueProvider_InvalidName: {
        test: function(component){
            var cgvp = new CustomGlobalValueProvider();
            try {
                $A.addValueProvider('Something', cgvp);
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: $A.addValueProvider(): 'type' must start with '$'. : false", e.message);
            }
        }
    },

    testAddValueProvider_AuraReserved: {
        test: function(component){
            var cgvp = new CustomGlobalValueProvider();
            try {
                $A.addValueProvider('$Browser', cgvp);
            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: $A.addValueProvider(): '$Browser' is a reserved valueProvider. : false", e.message);
            }
        }
    },

    testAddValueProvider_ValueProviderMissing: {
        test: function(component){
            try {
                $A.addValueProvider('$Custom', null);

            } catch (e) {
                $A.test.assertEquals("Assertion Failed!: $A.addValueProvider(): 'valueProvider' is required. : false", e.message);
            }
        }
    },

    testSetSupported : {
        test: function(component) {
            var cgvp = new CustomGlobalValueProvider();
            $A.addValueProvider('$Custom', cgvp);
            $A.set("$Custom.task_mode_today","Tomorrow");
            var res = $A.get("$Custom.task_mode_today");
            $A.test.assertEquals("Tomorrow", res,
                    "fail to set the value in Custom Global Value Provider");
        }
    }

})
