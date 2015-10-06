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
     * Extra actions serialized down from the server will be stored in the client-side actions cache.
     */
    testProcessPrimingActionsMarkedSuccess: {
        test: [
        function(cmp) {
            // New action to be added to action storage in priming scenario
            cmp._actionDescriptor = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getInt";
            var that = this;
            var addAction = function(response) {
                // Make sure this is the action response we care about
                if (response["responseText"].indexOf("sent from actionPrimingController.js") === -1) {
                    return response;
                }

                // Copy response and add an additional storable action to the response object
                var newResponse = $A.util.copy(response);
                var responseMessage = that.decodeResponse(response);
                var action = that.copyAction(responseMessage["actions"][0], cmp._actionDescriptor);
                responseMessage["actions"].push(action);

                var newResponseMessage = that.encodeResponse(responseMessage);
                newResponse['response'] = newResponseMessage;
                newResponse['responseText'] = newResponseMessage;

                return newResponse;
            }
            var config = $A.test.addPreDecodeCallback(addAction);
            $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config) });

            cmp.getStringAction();

            $A.test.addWaitFor(true, function(){ return cmp.get("v.completed"); });
        },
        function(cmp) {
            var completed = false;
            var found = false;
            $A.storageService.getStorage("actions").getAll()
                .then(function(items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i]["key"].indexOf(cmp._actionDescriptor) > -1
                                && items[i]["value"]["returnValue"].indexOf("return modified in test") > -1) {
                            found = true;
                        }
                    }
                    completed = true;
                })
                ["catch"](function(error) { $A.test.fail(error.toString()); });

            $A.test.addWaitFor(
                    true,
                    function() {
                        return completed;
                    },
                    function() {
                        $A.test.assertTrue(found, "Priming action not saved to actions storage");
                    });
            
        }]
    },

    /**
     * Priming actions in the error state should not be saved to client-side actions storage.
     */
    testNoProcessOfPrimingActionsMarkedError: {
        test: [
        function(cmp) {
            cmp._actionDescriptor = "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getInt";
            var that = this;
            var addAction = function(response) {
                // Make sure this is the action response we care about
                if (response["responseText"].indexOf("sent from actionPrimingController.js") === -1) {
                    return response;
                }

                // Copy response and add an action in the ERROR state
                var newResponse = $A.util.copy(response);
                var responseMessage = that.decodeResponse(response);
                var action = that.copyAction(responseMessage["actions"][0], cmp._actionDescriptor);
                action["state"] = "ERROR";
                responseMessage["actions"].push(action);

                var newResponseMessage = that.encodeResponse(responseMessage);
                newResponse['response'] = newResponseMessage;
                newResponse['responseText'] = newResponseMessage;

                return newResponse;
            }
            var config = $A.test.addPreDecodeCallback(addAction);
            $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config) });

            cmp.getStringAction();

            $A.test.addWaitFor(true, function(){ return cmp.get("v.completed"); });
        },
        function(cmp) {
            var completed = false;
            var found = false;
            $A.storageService.getStorage("actions").getAll()
                .then(function(items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i]["key"].indexOf(cmp._actionDescriptor) > -1
                                && items[i]["value"]["returnValue"].indexOf("return modified in test") > -1) {
                            found = true;
                        }
                    }
                    completed = true;
                })
                ["catch"](function(error) { $A.test.fail(error.toString()); });

            $A.test.addWaitFor(
                    true,
                    function() {
                        return completed;
                    },
                    function() {
                        $A.test.assertFalse(found, "Priming action in ERROR state should not be saved to actions storage");
                    });
        }]
    },

    /**
     * Priming actions must be marked storable otherwise an error will be thrown.
     */
    testProcessPrimingActionsNotStorable: {
        test: function(cmp) {
            // The error message we expect displayed to the user
            var expected = "Unable to find an action for 12345;a";
            $A.test.expectAuraError(expected);

            var that = this;
            var addAction = function(response) {
                if (response["responseText"].indexOf("sent from actionPrimingController.js") === -1) {
                    return response;
                }

                // Copy response and add a non-storable action
                var newResponse = $A.util.copy(response);
                var responseMessage = that.decodeResponse(response);
                var action = that.copyAction(responseMessage["actions"][0], cmp._actionDescriptor);
                action["storable"] = false;
                responseMessage["actions"].push(action);

                var newResponseMessage = that.encodeResponse(responseMessage);
                newResponse['response'] = newResponseMessage;
                newResponse['responseText'] = newResponseMessage;

                return newResponse;
            }
            var config = $A.test.addPreDecodeCallback(addAction);
            $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config) });

            cmp.getStringAction();

            // The priming action is handled in a special way so we cannot wait for the action like we do in other
            // tests. Instead, just wait for the expected error message to be displayed.
            $A.test.addWaitFor(true, function(){ 
                return $A.test.getText(document.getElementById("auraErrorMessage")).indexOf(expected) > -1;
            });
        }
    },

    decodeResponse: function(response) {
        var text = response["responseText"];
        // Strip off the while(1) at the beginning. Logic borrowed from AuraClientService.js#decode
        if (text.charAt(0) === "w") {
            text = "//" + text;
        }
        return $A.test.json.decode(text);
    },

    encodeResponse: function(response) {
        return "while(1);\n" + $A.util.json.encode(response);
    },

    /**
     * Make a copy of an action and add fields AuraClientService.js#buildStorableServerAction expects
     */
    copyAction: function(original, descriptor) {
        var action = $A.util.copy(original);
        action["id"] = "12345;a";
        action["storable"] = true;
        action["action"] = descriptor;
        action["params"] = {"param":5};
        action["returnValue"] = "return modified in test";
        return action;
    }
})
