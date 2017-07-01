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
     * IE & FIREFOX are excluded: the tests try to send out a request to other domains http://invalid.salesforce.com,
     * IE and Firefox block it by default
     */
    browsers:["GOOGLECHROME","SAFARI"],

    /**
     * Sets up the test:
     * - cache the cmp on the test to avoid passing it everywhere
     * - create an action, and cache the action on the test to avoid passing it everywhere
     * - cache various constants on the test for convenience
     */
    setUp: function(cmp) {
        // must match AuraStorage.KEY_DELIMITER
        cmp.DELIMITER = ":";

        this._action = cmp.get("c.getString");
        this._action.setParams({
            param: "TEST_STRING"
        });
        this._action.setStorable();
        this._actionDescriptor = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getString";
        this._actionParams = this._action.getParams();
    },

    /**
     * Verifies the request count isn't incremented when an action is served from cache.
     */
    testSentRequestCount: {
         test : [
             function fireUnstoredAction(cmp) {
                 cmp.count = $A.test.getSentRequestCount();
                 this.fireAndWaitForAction();
             },
             function verifyRequestCountIncremented(cmp) {
                 $A.test.assertEquals(cmp.count+1, $A.test.getSentRequestCount(), "getSentRequestCount() never incremented");
             },
             function fireStoredAction(cmp) {
                 this.fireAndWaitForAction();
             },
             function verifyRequestCountNotIncremented(cmp) {
                 $A.test.assertEquals(cmp.count+1, $A.test.getSentRequestCount(), "getSentRequestCount() should not increment for action in storage");
             }
         ]
    },

    /**
     * Verifies AuraClientService#isInStorage returns true when an action is added to storage.
     */
    testIsInStorage: {
        test : [
            function verifyActionNotInStorage(cmp) {
                this.verifyActionNotInStorage(cmp);
            },
            function sendAction(cmp) {
                this.fireAndWaitForAction();
            },
            function verifyActionIsInStorage(cmp) {
                this.waitForActionInStorage(cmp);
            },
            function verifyUnrelatedActionNotInStorage(cmp) {
                var asyncComplete = false;
                $A.clientService.isActionInStorage("nonexistent", {param: "none"}, function(isInStorage) {
                    $A.test.assertFalse(isInStorage, "Non-existent action should not be found in storage.");
                    asyncComplete = true;
                });

                $A.test.addWaitForWithFailureMessage(
                    true,
                    function() { return asyncComplete; },
                    "isActionInStorage callback never invoked"
                );
            }
        ]
    },

    /**
     * Verifies that AuraClientService#invalidateAction removes an action response from storage.
     */
    testInvalidate: {
        test : [
            function sendAction(cmp) {
                this.fireAndWaitForAction();
            },
            function verifyActionIsInStorage(cmp) {
                this.waitForActionInStorage(cmp);
            },
            function invalidateAction(cmp) {
                var isInvalidated = false;
                $A.clientService.invalidateAction(this._actionDescriptor, this._actionParams,
                    function success() {
                        isInvalidated = true;
                    },
                    function failure(e) {
                        $A.test.fail("invalidateAction threw an error: " + e);
                    }
                );
                $A.test.addWaitFor(true,
                    function() {
                        return isInvalidated;
                    }
                );
            },
            function verifyActionIsNotInStorage(cmp) {
                this.verifyActionNotInStorage(cmp);
            }
        ]
    },

    /**
     * Verifies that AuraClientService#revalidateAction extends the expiration date of a stored action response.
     *
     * NOTE: this test makes assumptions about storable actions mechanics: it directly uses an aura storage service
     * adapter and assumes a specific format.
     */
    testRevalidate: {
        test : [
            function sendAction(cmp) {
                this.fireAndWaitForAction();
            },
            function captureExpirationTime(cmp) {
                var asyncComplete = false;
                var adapter = this._action.getStorage().adapter;
                var prefixedKey = cmp.DELIMITER + this._action.getStorageKey();
                adapter.getItems([prefixedKey])
                    .then(
                        function(items) {
                            asyncComplete = true;
                            cmp._expiryTime = items[prefixedKey].expires;
                            $A.test.assertNotUndefinedOrNull(cmp._expiryTime, "stored expiry time should not be null/undefined");
                        },
                        function(e) {
                            $A.test.fail("getItems() rejected: " + e);
                        }
                    );

                $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return asyncComplete;
                    },
                    "adapter#getItem promise never resolved"
                );
            },
            function revalidateAction(cmp) {
                var asyncComplete = false;
                $A.clientService.revalidateAction(this._actionDescriptor, this._actionParams, function(wasRevalidated) {
                    $A.test.assertTrue(wasRevalidated, "revalidateAction() should have specified that the action was found and revalidated");
                    asyncComplete = true;
                });

                $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return asyncComplete;
                    },
                    "revalidateAction never invoked callback"
                );
            },
            function verifyExpirationTimeExtended(cmp) {
                var asyncComplete = false;
                var adapter = this._action.getStorage().adapter;
                var prefixedKey = cmp.DELIMITER + this._action.getStorageKey();
                adapter.getItems([prefixedKey])
                    .then(
                        function(items) {
                            asyncComplete = true;
                            $A.test.assertTrue(items[prefixedKey].expires > cmp._expiryTime, "stored expires time should be extended by revalidateAction");
                        },
                        function(e) {
                            $A.test.fail("getItems() rejected: " + e);
                        }
                    );

                $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return asyncComplete;
                    },
                    "adapter#getItem promise never resolved"
                );
            }
        ]
    },

    /**
     * Fires this._action and waits for the server's response.
     * @param {Function=} callback an optional callback invoked when the action response is received.
     */
    fireAndWaitForAction: function(callback) {
        var actionReceived = false;
        var action = this._action;

        action.setCallback(this._cmp, function() {
            actionReceived = true;
            if (callback && callback instanceof Function) {
                callback();
            }
        });

        $A.enqueueAction(action);

        $A.test.addWaitForWithFailureMessage(
            true,
            function() {
                return actionReceived;
            },
            "action callback never invoked"
        );
    },

    /**
     * Verifies that this._action is in storage by repeatedly querying AuraClientService#isActionInStorage
     * until it returns true or the test times out.
     */
    waitForActionInStorage: function(cmp) {
        // action storage is async. loop until the item appears in storage or test times out.
        var that = this;
        var inStorage = undefined;
        $A.test.addWaitForWithFailureMessage(
            true,
            function() {
                $A.clientService.isActionInStorage(that._actionDescriptor, that._actionParams, function(isInStorage) {
                    inStorage = isInStorage;
                });
                return inStorage;
            },
            "isActionInStorage never returned true"
        );
    },

    /**
     * Verifies that this._action is not in storage by querying AuraClientService#isActionInStorage one time.
     * Sets up a test-stage wait due to the async nature of said API.
     */
    verifyActionNotInStorage: function(cmp) {
        var asyncComplete = false;
        $A.clientService.isActionInStorage(this._actionDescriptor, this._actionParams, function(isInStorage) {
            $A.test.assertFalse(isInStorage, "action should not be found in storage");
            asyncComplete = true;
        });

        $A.test.addWaitForWithFailureMessage(
            true,
            function() {
                return asyncComplete;
            },
            "isActionInStorage never invoked callback"
        );
    }

})
