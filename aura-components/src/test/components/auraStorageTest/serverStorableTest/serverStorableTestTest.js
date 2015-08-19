({
    setUp : function(component){
        $A.storageService.getStorage("actions").clear();
    },

    testStorageOfServerAction:{
        test:function(cmp){
            var storage = $A.storageService.getStorage("actions");
            cmp.find("button").getEvent("press").fire();
            for (var n = 1; n <= 10; n++) {
                (function() {
                    var action;
                    var key = "java://org.auraframework.impl.java.controller.ServerStorableActionController/" +
                            "ACTION$storedAction:{\"message\":\"some really cool message #" + n + "\"}";
                    var expected = "[from server] some really cool message #" + n;

                    $A.test.addWaitFor(true, function() {
                        // Wait until ServerStorableActionController.storedAction is present in storage
                        storage.get(key).then(function(item) {
                            action = item ? item.value : item;
                        });

                        return action !== undefined;
                    }, function() {
                        $A.test.assertEquals(expected, action["returnValue"]);
                    });
                })();
            }
        }
    },

    /**
     * Verify that null params don't affect the storage of actions (indirectly via storage key).
     */
    testStorageOfServerActionWithNullParams : {
        attributes : {
            defaultAutoRefreshInterval : 0 // refresh every action
        },
        test : [function(cmp) {
            this.resetCounter(cmp, "testStorageOfServerActionWithNullParams");
        }, function(cmp) {
            cmp._value = [];
            var a = cmp.get("c.simpleValuesAsParams");
            a.setParams({
                testName : "testStorageOfServerActionWithNullParams",
                year : 1,
                mvp : null
            });
            a.setStorable();
            a.setCallback(cmp, function(action) {
                cmp._value.push(action.getReturnValue());
            });
            $A.test.addWaitFor("Message 1 : null was the MVP in 1", function() {
                return cmp._value[0];
            });
            $A.enqueueAction(a);
        }, function(cmp) {
            cmp._value = [];
            var a = cmp.get("c.simpleValuesAsParams");
            a.setParams({
                testName : "testStorageOfServerActionWithNullParams",
                year : 1,
                mvp : null
            });
            a.setStorable();
            a.setCallback(cmp, function(action) {
                cmp._value.push(action.getReturnValue());
            });
            // check stored value
            $A.test.addWaitFor("Message 1 : null was the MVP in 1", function() {
                return cmp._value[0];
            });
            // check refresh value
            $A.test.addWaitFor("Message 2 : null was the MVP in 1", function() {
                return cmp._value[1];
            }, function() {
                $A.test.assertEquals(2, cmp._value.length, "Action callback called too many times");
            });
            $A.enqueueAction(a);
        }]
    },

    /**
     * Verify that an action which accepts simple values as parameters can be marked as storable at the server.
     * Also verify that the same action can be fetched from auraStorage at the client.
     */
    testStorageOfServerActionWithSimpleValues:{
        test:[function(cmp){
             $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testStorageOfServerActionWithSimpleValues");
        },function(cmp){
            //Run the action that sets up other actions to be storable
            this.initiateServerAction(cmp, "testStorageOfServerActionWithSimpleValues",
                    ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$simpleValuesAsParams"] );
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
                        var storedAction = cmp.get("c.simpleValuesAsParams");
                        //Order of parameter should not matter for storage key
                        storedAction.setParams({mvp: "Buster Posey", year: 2012,
                            testName: "testStorageOfServerActionWithSimpleValues"});
                        var storageKey = storedAction.getStorageKey();
                        //Check if storage service has the expected action
                        $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                            if(response){
                                //If the action was stored, make sure it succeeded and return value is correct
                                $A.test.assertEquals("SUCCESS", response.value.state);
                                $A.test.assertEquals("Message 1 : Buster Posey was the MVP in 2012", response.value.returnValue);
                            }else{
                                //If the action was not stored, fail
                                $A.test.fail("Storage service does not have the response for the " +
                                        "following action:c.simpleValuesAsParams");
                            }
                        });
                    });
        },function(cmp){
            //Run the action which is stored, expect to get the stored response
            var action = cmp.get("c.simpleValuesAsParams");
            action.setParams({mvp: "Buster Posey", year: 2012, testName: "testStorageOfServerActionWithSimpleValues"});
            action.setStorable();
                $A.run(function() { $A.enqueueAction(action); });
            $A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                    function(){
                        $A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
                        $A.test.assertEquals("Message 1 : Buster Posey was the MVP in 2012", action.getReturnValue(),
                                "Unexpected action response from cache");
                    });
        }, function(cmp){//Force the action to run at server
            var action = cmp.get("c.simpleValuesAsParams");
            action.setParams({mvp: "Buster Posey", year: 2012, testName: "testStorageOfServerActionWithSimpleValues"});
                $A.run(function() { $A.enqueueAction(action); });
            $A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                    function(){
                        $A.test.assertFalse(action.isFromStorage(), "Should have fetched the action response from server.");
                        $A.test.assertEquals("Message 2 : Buster Posey was the MVP in 2012", action.getReturnValue(),
                                "Failed to get updated response from server.");
                    });
        }
        ]
    },
    /**
     * Verify that an action which accepts lists and advanced data types can be marked as storable at the server.
     * This will verify that such actions and their parameters are serialized correctly.
     */
    testStorageOfServerActionWithListValues:{
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testStorageOfServerActionWithListValues");
        },function(cmp){
            this.initiateServerAction(cmp, "testStorageOfServerActionWithListValues",
                    ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$complexValuesAsParams"]);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
                        var storedAction = cmp.get("c.complexValuesAsParams");
                        //Order of parameter should not matter for storage key
                        storedAction.setParams({players: ["Buster Posey", "Pablo Sandavol", "Angel Pagan"],
                            testName: "testStorageOfServerActionWithListValues"});
                        var storageKey = storedAction.getStorageKey();
                        //Check if storage service has the expected action
                        $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                            if(response){
                                //If the action was stored, make sure it succeeded and return value is correct
                                $A.test.assertEquals("SUCCESS", response.value.state);
                                $A.test.assertEquals("Message 1 : Team contains Buster Posey, Pablo Sandavol, Angel Pagan, ",
                                        response.value.returnValue);
                            }else{
                                //If the action was not stored, fail
                                $A.test.fail("Storage service does not have the response for the following " +
                                        "action:c.complexValuesAsParams");
                            }
                        });
                    });
        }
        ]
    },
    /**
     * Verify that server actions marked as storable at the serverside are not stored if they fail.
     */
    testStorageOfFailedServerActions:{
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testStorageOfFailedServerActions");
        },function(cmp){
            this.initiateServerAction(cmp, "testStorageOfFailedServerActions",
                    ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$throwsException"]);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
                        var storedAction = cmp.get("c.throwsException");
                        //Order of parameter should not matter for storage key
                        storedAction.setParams({testName: "testStorageOfFailedServerActions"});
                        var storageKey = storedAction.getStorageKey();
                        //Check if failed action was stored.
                        $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                            if(response){
                                //If the action was stored, fail
                                $A.test.fail("Failed actions should not be stored.");
                            }
                        });
                    });
        },function(cmp){//Run the action and get the response, verify this is the second run
            var action = cmp.get("c.throwsException");
            action.setParams({testName: "testStorageOfFailedServerActions"});
                $A.run(function() { $A.enqueueAction(action); });
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
                        $A.test.assertEquals("ERROR", action.getState(),
                            "Test setup failure, expected the action to error");
                        $A.test.assertFalse(action.isFromStorage(), "Failed action should be refetched from server");
                        $A.test.assertTrue(action.getError()[0].message.indexOf("Message 2") != -1);
                    });
        }]
    },
    //W-1554547- Calling an action which expects parameters by not setting any params will cause NullPointerException
    _testStorageofActionWithNoParams:{
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testStorageofActionWithNoParams");
        },function(cmp){
            //Run the action that sets up other actions to be storable
            this.initiateServerAction(cmp, "testStorageofActionWithNoParams",
                    ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$returnNothing"] );
            $A.test.addWaitFor(false, $A.test.isActionPending,
                       function(){
                        var action = cmp.get("c.returnNothing");
                        var storageKey = action.getStorageKey();
                        //Check if storage service has the expected action
                        $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                            if(response){
                                //If the action was stored, make sure it succeeded and return value is correct
                                $A.test.assertEquals("SUCCESS", response.value.state);
                                $A.test.assertFalsy(response.value.returnValue, "Action should have no return value");
                            }else{
                                //If the action was not stored, fail
                                $A.test.fail("Storage service does not have the response " +
                                        "for the following action:c.returnNothing");
                            }
                        });
                                action.setStorable();
                                $A.run(function() { $A.enqueueAction(action); });
                        $A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                                function(){
                                    $A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
                                    $A.test.assertFalsy(action.getReturnValue(),
                                            "Action should have no return value");
                                });
                       });
        }]
    },
    //W-1554571 - Attaching actions at client and not marking them to be stored will cause JS errors
    _testChainingUnstoredAction:{
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testChainingUnstoredAction");
        },function(cmp){
            this.initiateServerAction(cmp, "testChainingUnstoredAction",
                    ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$unStoredAction"]);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
                        var unstoredAction = cmp.get("c.unStoredAction");
                        unstoredAction.setParams({testName: "testChainingUnstoredAction"});
                        var storageKey = unstoredAction.getStorageKey();
                        //Check if action was stored.
                        $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                            if(response){
                                //If the action was stored, fail
                                $A.test.fail("Action was not marked to be stored.");
                            }
                        });
                    });
        }]
    },
    testComponentsFromStoredServerAction:{
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testComponentsFromStoredServerAction");
        }, function(cmp){
            //Run the action that sets up other actions to be storable
            this.initiateServerAction(cmp, "testComponentsFromStoredServerAction",
                ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$getComponent"]);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    var storedAction = cmp.get("c.getComponent");
                    storedAction.setParams({testName: "testComponentsFromStoredServerAction"});
                    var storageKey = storedAction.getStorageKey();
                    //Check if storage service has the expected action
                    $A.storageService.getStorage("actions").get(storageKey).then(function(response){
                        if(response){
                            //If the action was stored, make sure it succeeded and return value is correct
                            $A.test.assertEquals("SUCCESS", response.value.state);
                        }else{
                            //If the action was not stored, fail
                            $A.test.fail("Storage service does not have the response " +
                                         "for the following action:c.getComponent");
                        }
                    });
                });
        },
        // Verify that components can be created with cached action response
        function(cmp){
            //Run the action which is stored, create a component with the response
            var action = cmp.get("c.getComponent");
            action.setParams({testName: "testComponentsFromStoredServerAction"});
            action.setStorable();
            action.setCallback(cmp, function(a){
                    $A.newCmpAsync(
                        this,
                        function(newComponent){
                            //Insert newly fetched component
                            cmp.find("facet").set("v.body", [newComponent]);
                        },
                        a.getReturnValue()
                    );
                });
            $A.run(function() { $A.enqueueAction(action); });
            $A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                function(){
                    $A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
                });
            $A.test.addWaitFor("National League",function(){
                    var facet = cmp.find("facet").get('v.body')[0];
                    // now that we are async, the facet might not be there.
                    if (facet) {
                        return $A.test.getTextByComponent(facet.find("Division"));
                    } else {
                        return "";
                    }
                });
        },
        //Verify that components can be created multiple times with the same action response
        function(cmp){
            var dupAction = cmp.get("c.getComponent");
            dupAction.setParams({testName: "testComponentsFromStoredServerAction"});
            dupAction.setStorable();
            dupAction.setCallback(cmp, function(a){
                    $A.newCmpAsync(
                        this,
                        function(secondNewComponent){
                            //push newly fetched component
                            var body = cmp.find("facet").get("v.body");
                            body.push(secondNewComponent);
                            cmp.find("facet").set("v.body", body);
                        },
                        a.getReturnValue()
                    );
                });
            $A.run(function() { $A.enqueueAction(dupAction); });
            $A.test.addWaitFor("SUCCESS", function(){return dupAction.getState()},
                function(){
                    $A.test.assertTrue(dupAction.isFromStorage(),
                        "Failed to fetch action response from storage for second action instance.");
                });
            $A.test.addWaitFor("National League",function(){
                    var facet_new = cmp.find("facet").get('v.body')[0];
                    return $A.test.getTextByComponent(facet_new.find("Division"));
                });
            $A.test.addWaitFor("National League",function(){
                    var facet_old = cmp.find("facet").get('v.body')[1];
                    if (facet_old) {
                        return $A.test.getTextByComponent(facet_old.find("Division"));
                    } else {
                        return "";
                    }
                });
        }]
    },
    /**
     * Verify mark original server action as storable on server side.
     */
    testMarkingOriginalActionAsStorable:{
        test:[
            function(cmp){
                //Run the action that sets up other actions to be storable
                var primingAction = cmp.get("c.markingSelfAsStorable");
                var returnValue;
                primingAction.setCallback(cmp, function(result){
                    $A.test.assertEquals("SUCCESS", primingAction.getState());
                    $A.test.assertEquals(true, result.isStorable());
                    returnValue = result.getReturnValue();
                });
                $A.test.assertFalse(primingAction.isAbortable(), "The action should start as non-abortable.");
                $A.enqueueAction(primingAction);
                $A.test.addWaitFor(true,
                    function() { return $A.test.areActionsComplete([primingAction]); },
                    function() {
                        // Verify action's callback gets called.
                        $A.test.assertEquals("SUCCESS", primingAction.getState());
                        $A.test.assertEquals("Marking my self as storable", returnValue);
                        $A.test.assertFalse(primingAction.isAbortable(), "The action should be still non-abortable.");
                    });
            },
            function(cmp){
                var storedAction = cmp.get("c.markingSelfAsStorable");
                var stored = false;
                storedAction.setStorable();

                storedAction.setCallback(cmp, function(result){
                    $A.test.assertEquals("SUCCESS", result.getState());
                    if (!stored) {
                        // Check to see that we get a result from storage.
                        $A.test.assertEquals(true, result.isFromStorage());
                        stored = true;
                    }
                });
                $A.enqueueAction(storedAction);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([storedAction]); });
            }
        ]
    },
    /**
     * Verify that new action defs can be introduced at client on the fly.
     * Chaining an action whose definition is not known to client.
     */
    _testNewStorableActionDefsInResponse:{
        test:[function(cmp){
            //
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testNewStorableActionDefsInResponse");
        }, function(cmp){
            //Run the action that sets up other actions to be storable
            this.initiateServerAction(cmp, "testNewStorableActionDefsInResponse",
                            ["java://org.auraframework.components.test.java.controller.TestController/ACTION$getString"] );
            $A.test.addWaitFor(false, $A.test.isActionPending);
        }]
    },

    /**
     * callingDescriptor is added in request for versioning use. Verify this does not impact actions
     * storage.
     */
    testCallingDescriptorNotAffectCachedStorableActions: {
        test: [
            function(cmp) {
                var targetComponent = cmp.find("test_cmpWithServerAction");
                targetComponent.updateTextWithStringFromServerController(true);
                $A.test.addWaitFor(true, function() { return targetComponent.get("v.actionDone")});
            },
            function(cmp) {
                // send same action with testing component
                var action = $A.test.getExternalAction(cmp,
                    "java://org.auraframework.components.test.java.controller.TestController/ACTION$getString",
                    {},
                    'java://java.lang.String',
                    function(result) {
                        $A.test.assertEquals("SUCCESS", result.getState());
                        $A.test.assertTrue(result.isFromStorage());
                    });
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([action]); });
            },
            function(cmp) {
                var targetComponent = cmp.find("test_cmpWithServerAction");

                targetComponent.updateTextWithStringFromServerController(true);
                $A.test.addWaitFor(true,
                    function() { return targetComponent.get("v.actionDone")},
                    function() {
                        $A.test.assertTrue(targetComponent.get("v.isTextFromCache"))
                    });
            }
        ]
    },

    initiateServerAction:function(cmp, _testName, actionNames){
        //Run the action that sets up other actions to be storable
        var a = cmp.get("c.setStorable");
        a.setParams({testName: _testName,
            actionsToMark: actionNames});
        $A.run(function() { $A.enqueueAction(a); });
    },
    resetCounter:function(cmp, testName){
        var a = cmp.get('c.resetCounter');
        a.setParams({
            testName: testName
        }),
        a.setExclusive();
        $A.run(function() { $A.enqueueAction(a); });
    }
})
