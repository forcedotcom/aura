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
     * Verify creation of a component with a JS dependency not parseable requires TWO server requests.
     */
    testShortDescriptorNotPreLoaded:{
        test: function(cmp) {
            var expected = 2;
            var initialRequestCount = $A.test.getSentRequestCount();
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:cmpShortDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    var actual = $A.test.getSentRequestCount() - initialRequestCount;
                    $A.test.assertEquals(expected, actual, "Two XHRs to the server should have been sent.");
                }
            );
        }
    },
    /**
     * Verify creation of a component with a JS dependency parseable requires ONE server request.
     */
    testFullDescriptorPreLoaded:{
        test: function(cmp) {
            var expected = 1;
            var initialRequestCount = $A.test.getSentRequestCount();
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:cmpFullDescriptor", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    var actual = $A.test.getSentRequestCount() - initialRequestCount;
                    $A.test.assertEquals(expected, actual, "A single XHR to the server should have been sent.");
                }
            );
        }
    },
    /**
     * Verify non resolvable dependency for a non parseable JS dependency requires TWO server requests.
     */
    testShortDescriptorNotFound:{
        test: function(cmp) {
            var expected = 2;
            var initialRequestCount = $A.test.getSentRequestCount();
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:cmpShortDescriptorInvalid", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    var actual = $A.test.getSentRequestCount() - initialRequestCount;
                    $A.test.assertEquals(expected, actual, "Two XHRs to the server should have been sent.");
                }
            );
        }
    },
    /**
     * Verify non resolvable dependency for a parseable JS dependency requires TWO server requests.
     */
    testFullDescriptorNotFound:{
        test: function(cmp) {
            var expected = 2;
            var initialRequestCount = $A.test.getSentRequestCount();
            var status;

            $A.test.addEventHandler('dependencyTest:notify',
                function(event) {
                    status = event.getParam("status");
                }
            );

            $A.createComponent("markup://dependencyTest:cmpFullDescriptorInvalid", {},
                function (newCmp) {
                    cmp.set("v.body", newCmp);
                }
            );

            $A.test.addWaitFor(true,
                function() {
                    return !$A.util.isEmpty(status);
                },
                function() {
                    var actual = $A.test.getSentRequestCount() - initialRequestCount;
                    $A.test.assertEquals(expected, actual, "Two XHRs to the server should have been sent.");
                }
            );
        }
    },

    testWildcardDependency: {
        test: function(cmp) {
            cmp.set("v.body", []);
            $A.createComponent("markup://dependencyTest:cmpWithDependencyWildcards", {},
                function (newCmp) {
                    cmp.set("v.body", [newCmp]);
                }
            );
            $A.test.addWaitFor(true,
                function() {
                    return cmp.get("v.body").length == 1;
                });
        }
    }
})