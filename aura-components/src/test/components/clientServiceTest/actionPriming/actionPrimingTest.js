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
     * Extra actions sent from the server are stored in the actions storage.
     */
    testExtraActionsAddedToStorage: {
        test: [
            function primeAction(cmp) {
                // prefix of action descriptors to be be primed
                cmp.PRIMED_ACTION_DESCRIPTOR1 = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getInt";
                cmp.PRIMED_ACTION_DESCRIPTOR2 = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getLoggableString";

                // actions with and without parameters
                var actionsToInject = [
                   { descriptor: cmp.PRIMED_ACTION_DESCRIPTOR1, params: {} },
                   { descriptor: cmp.PRIMED_ACTION_DESCRIPTOR2, params: undefined },
                ];
                var config = $A.test.addPreDecodeCallback(this.injectActionsToResponse.bind(this, cmp, actionsToInject));
                $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config); });

                cmp.getStringAction();
                $A.test.addWaitForWithFailureMessage(true, function(){ return cmp.get("v.completed"); }, "action failed to complete");
            },
            function verifyActionsStored(cmp) {
                var completed = false;
                this.verifyActionInStorage(cmp, cmp.PRIMED_ACTION_DESCRIPTOR1, this.ACTION_RETURN_VALUE)
                    .then(function() {
                        this.verifyActionInStorage(cmp, cmp.PRIMED_ACTION_DESCRIPTOR2, this.ACTION_RETURN_VALUE)
                    }.bind(this))
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(error) { $A.test.fail(error.toString()); });

                $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, "error verifying action in storage");
            }
        ]
    },


    /**
     * Extra actions, from controllers other than this component's controller, are stored in the actions storage.
     */
    testExtraActionsFromOtherControllersAddedToStorage: {
        test: [
            function hydrateDef(cmp) {
                var completed = false;
                // prerequisite: component def (and therefore controller def and action defs) must be hydrated
                var desc = "markup://clientServiceTest:actionPrimingDependency";
                $A.getDefinition(desc, function(def) {
                    if (!def) {
                        $A.test.fail("Def not found: " + desc);
                    }
                    completed = true;
                });
                $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, "Def failed to load: " + desc);
            },
            function primeAction(cmp) {
                // prefix of action descriptor to be be primed. controller is different than in auraStorageTest:actionPriming
                cmp.PRIMED_ACTION_DESCRIPTOR = "java://org.auraframework.components.test.java.controller.TestController/ACTION$getString";
                var actionsToInject = [{ descriptor: cmp.PRIMED_ACTION_DESCRIPTOR, params: {} }];
                var config = $A.test.addPreDecodeCallback(this.injectActionsToResponse.bind(this, cmp, actionsToInject));
                $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config); });

                cmp.getStringAction();
                $A.test.addWaitForWithFailureMessage(true, function(){ return cmp.get("v.completed"); }, "action failed to complete");
            },
            function verifyActionStored(cmp) {
                var completed = false;
                this.verifyActionInStorage(cmp, cmp.PRIMED_ACTION_DESCRIPTOR, this.ACTION_RETURN_VALUE)
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(error) { $A.test.fail(error.toString()); });

                $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, "error verifying action in storage");
            }
        ]
    },


    /**
     * Extra actions in ERROR state are not added to the actions storage.
     */
    testExtraActionsInErrorStateNotAddedToStorage: {
        test: [
            function(cmp) {
                // prefix of action descriptor to be be primed
                cmp.PRIMED_ACTION_DESCRIPTOR = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getInt";
                var actionsToInject = [{
                    state: "ERROR", // action is in error state
                    descriptor: cmp.PRIMED_ACTION_DESCRIPTOR,
                    params: undefined
                }];
                var config = $A.test.addPreDecodeCallback(this.injectActionsToResponse.bind(this, cmp, actionsToInject));
                $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config); });

                cmp.getStringAction();
                $A.test.addWaitForWithFailureMessage(true, function(){ return cmp.get("v.completed"); }, "action failed to complete");
            },
            function verifyActionNotStored(cmp) {
                // action storage is async so wait for:
                // a) action store to become idle
                // b) verify the successful action is in storage
                // then c) check that the errored action is not in storage.
                var completed = false;
                var storageContents = cmp.helper.storageTestLib.storageContents;
                storageContents.waitForActionStorageIdle()
                    .then(function() {
                        return this.verifyActionInStorage(cmp, cmp.ACTION_DESCRIPTOR, cmp.ACTION_PARAM);
                    }.bind(this))
                    .then(function() {
                        return storageContents.waitForActionNotInStorage(cmp.PRIMED_ACTION_DESCRIPTOR, true);
                    })
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(error) { $A.test.fail(error.toString()); });

                $A.test.addWaitForWithFailureMessage(true, function() { return completed; }, "error verifying actions in storage");
            }
        ]
    },


    /**
     * Extra actions not marked as storable throw an error.
     */
    testExtraActionsNotStorableDisplaysError: {
        test: function(cmp) {
            // error message thrown by framework
            var expected = "Unable to find an action for 12345;a";
            $A.test.expectAuraError(expected);

            // prefix of action descriptor to be be primed
            cmp.PRIMED_ACTION_DESCRIPTOR = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getInt";
            var actionsToInject = [{
                storable: false, // action is not storable
                descriptor: cmp.PRIMED_ACTION_DESCRIPTOR,
                params: undefined
            }];

            var config = $A.test.addPreDecodeCallback(this.injectActionsToResponse.bind(this, cmp, actionsToInject));
            $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config); });

            cmp.getStringAction();
            $A.test.addWaitForWithFailureMessage(true, function(){ return cmp.get("v.completed"); }, "action failed to complete");

            cmp.getStringAction();

            // The priming action is handled in a special way so we cannot wait for the action like we do in other
            // tests. Instead, just wait for the expected error message to be displayed.
            $A.test.addWaitForWithFailureMessage(true,
                function() {
                    var errorElement = document.getElementById("auraErrorMessage");
                    return $A.test.getText(errorElement).indexOf(expected) > -1;
                },
                "Error dialog not displayed"
            );
        }
    },


    /**
     * Trims and decodes the action response.
     */
    decodeResponse: function(response) {
        var text = response["responseText"];
        // Strip off the while(1) at the beginning. Logic borrowed from AuraClientService.js#decode
        if (text.charAt(0) === "w") {
            text = text.substring(text.indexOf("\n")+1);
        }
        return $A.test.json.decode(text);
    },

    /**
     * Encodes and pads the action response so AuraClientService can process it.
     */
    encodeResponse: function(response) {
        return "while(1);\n" + $A.util.json.encode(response);
    },

    /**
     * Copies an action and add fields AuraClientService.js#buildStorableServerAction expects
     * @param {Action} action the action to copy.
     * @param {String} descriptor the action descriptor.
     * @param {Object} params the action parameters.
     */
    copyAction: function(action, descriptor, params) {
        action = $A.util.copy(action);
        action["id"] = this.ACTION_ID;
        action["storable"] = true;
        action["action"] = descriptor;
        action["params"] = params;
        action["returnValue"] = this.ACTION_RETURN_VALUE;
        return action;
    },

    /**
     * Injects the actions into the response. To be done in the preDecodeCallback hook.
     * @param {Component} cmp
     * @param {Object[]} actions List of actions to inject. The properties of each object are copied onto the cloned action.
     * @param {Object} response the XHR response object
     * @return {Object} the modified response object.
     */
    injectActionsToResponse: function(cmp, actions, response) {
        // ensure this is the action response we care about
        if (response["responseText"].indexOf(cmp.ACTION_PARAM) === -1) {
            return response;
        }

        response = $A.util.copy(response);
        var decoded = this.decodeResponse(response);

        var propertiesToIgnore = ["descriptor", "params"];
        var newAction;
        for (var i = 0; i < actions.length; i++) {
            newAction = this.copyAction(decoded["actions"][0], actions[i].descriptor, actions[i].params);
            for (var prop in actions[i]) {
                if (propertiesToIgnore.indexOf(prop) === -1) {
                    newAction[prop] = actions[i][prop];
                }
            }
            decoded["actions"].push(newAction);
        }

        var encoded = this.encodeResponse(decoded);
        response["response"] = encoded;
        response["responseText"] = encoded;

        return response;
    },


    /**
     * Verifies an action, identified by descriptor, is in storage with a known return value.
     * @param {Component} cmp
     * @param {String} descriptorPrefix prefix of the action descriptor to verify
     * @param {String} expectedReturnValue the return value to verify
     * @return {Promise} a promise that resolves when the action is verified in storage, rejects otherwise.
     */
    verifyActionInStorage: function(cmp, descriptorPrefix, expectedReturnValue) {
        var storageContents = cmp.helper.storageTestLib.storageContents;
        return storageContents.waitForActionInStorage(descriptorPrefix, true)
            .then(function(value) {
                $A.test.assertEquals(expectedReturnValue, value["returnValue"], "Action (" + descriptorPrefix + ") found in storage but with wrong value");
            });
    },


    /**
     * Return value of copied actions.
     */
    ACTION_RETURN_VALUE: "copied action response",

    /**
     * Action ID of copied actions.
     */
    ACTION_ID: "12345;a"
})
