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
     * Verify that events referenced by short descriptor on event GVP are not preloaded and not creatable.
     */
    testGvpShortDescriptorPreLoaded:{
        test: function(cmp) {
            var expected = "ERROR";
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:evtGvpShortDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    $A.test.assertEquals(expected, status,
                        "The event should not have been retreived from the GVP by short descriptor.");
                }
            );
        }
    },
    /**
     * Verify that events referenced by full descriptor on event GVP are preloaded and creatable.
     */
    testGvpFullDescriptorPreLoaded:{
        test: function(cmp) {
            var expected = "SUCCESS";
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:evtGvpFullDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    $A.test.assertEquals(expected, status,
                        "The event should have been retreived from the GVP by full descriptor.");
                }
            );
        }
    },
    /**
     * Verify that events referenced by short descriptor are not preloaded and not creatable.
     */
    testShortDescriptorNotFound:{
        test: function(cmp) {
            var expected = "ERROR";
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:evtShortDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    $A.test.assertEquals(expected, status,
                        "The event should not have been retreived from the registry by short descriptor.");
                }
            );
        }
    },
    /**
     * Verify that events referenced by full descriptor are preloaded and creatable.
     */
    testFullDescriptorPreloaded:{
        test: function(cmp) {
            var expected = "SUCCESS";
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:evtFullDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    $A.test.assertEquals(expected, status,
                        "The event should have been retreived from the registry by full descriptor.");
                }
            );
        }
    }
})