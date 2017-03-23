({
    /**
     * Verify we can get action not accessible through current component by $A.test.getExternalAction
     * in the test down below, if we do cmp.get("c.getNamedComponent"); it will return nothing and error out
     */
    testGetExternalAction : {
        test: [
            function(cmp) {
                var eAction = $A.test.getExternalAction(cmp, "java://org.auraframework.components.test.java.controller.TestController/ACTION$getNamedComponent",
                        {"componentName":"markup://aura:text", 'attributes':{'value':'valuable'}},
                        "java://org.auraframework.instance.component",
                        function(action){
                            $A.test.assertTrue(action.state === "SUCCESS");
                        });
                $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([eAction]); },
                        "external action didn't finish");
                $A.enqueueAction(eAction);
            }
        ]
    },

    testModifyResponseFromServer : {
        test: [
            function(cmp) {
                //let's tap into transit and modify the response
                var decode_done = false;
                var cb_handle;
                var modifyResponse = function (oldResponse) {
                    var response = oldResponse["response"];
                    if (response.indexOf("testModifyResponseFromServer") >= 0 && response.indexOf("recordObjCounter") >= 0) {
                        var newResponse = {};
                        //copy everything from oldResponse
                        var responseText = oldResponse["responseText"];
                        var status = oldResponse["status"];
                        newResponse["status"] = status;
                        newResponse["response"] = response;
                        newResponse["responseText"] = responseText;
                        //change recordObjCounter to 10
                        var idx = response.indexOf("Counter");
                        var idxNumberStart = idx;// Counter":1
                        var idxNumberEnd = response.indexOf(",", idx);
                        var numberStr = response.substring(idxNumberStart, idxNumberEnd);
                        newResponse["response"] = newResponse["response"].replace(numberStr, "Counter\": 10");
                        newResponse["responseText"] = newResponse["responseText"].replace(numberStr, "Counter\": 10");
                        decode_done = true;
                        $A.test.removePreDecodeCallback(cb_handle);

                        //new feed decode with the new response
                        return newResponse;
                    } else {
                        return oldResponse;
                    }

                };

                cb_handle = $A.test.addPreDecodeCallback(modifyResponse);

                $A.test.addWaitFor(true, function() { return decode_done; });

                //now enqueue the Action
                var action = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:1});
                $A.enqueueAction(action);
                $A.test.addWaitForWithFailureMessage(true,
                    function(){ return $A.test.areActionsComplete([action])},
                    "fail waiting for server action to finish",
                    function() {
                        $A.test.assertEquals(10, action.getReturnValue().Counter, "fail to modify return Value in response");
                    });
           }
        ]
    },


    /**
     * Verifies if a storable action (with no params) has a cached response then the correct cached
     * response value is given to the callback.
     */
    testStorableActionNoParams: {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function runRefreshAction(cmp) {
                var callbackDone = false;

                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                action.setCallback(this, function(a) {
                    callbackDone = true;
                    $A.test.assertTrue(a.isFromStorage(), "Action should have reported it was from storage");
                    $A.test.assertNull(a.getReturnValue(), "Cached response value is incorrect");
                }, "SUCCESS");

                $A.enqueueAction(action);
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function(){ return callbackDone; },
                    "action callback not invoked"
                );
            }
        ]
    },

    /**
     * Verifies if a storable action (with a null parameter) has a cached response then the correct cached
     * response value is given to the callback.
     */
    testStorableActionNullParamValue: {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForegroundWithStringReturn");
                action.setParams({s:null});
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function runRefreshAction(cmp) {
                var callbackDone = false;

                var action = cmp.get("c.executeInForegroundWithStringReturn");
                action.setParams({s:null});
                action.setStorable();

                action.setCallback(this, function(a) {
                    callbackDone = true;
                    $A.test.assertTrue(a.isFromStorage(), "Action should have reported it was from storage");
                    $A.test.assertNull(a.getReturnValue(), "Cached response value is incorrect");
                }, "SUCCESS");


                $A.enqueueAction(action);
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function(){ return callbackDone; },
                    "action callback not invoked"
                );
            }
        ]
    },


    /**
     * Verifies if a storable action (with a basic param) has a cached response then the correct cached
     * response value is given to the callback.
     */
    testStorableActionWithSimpleParamValue : {
        test: [
            function primeActionStorage(cmp) {
                cmp._expected = 1;
                var action = cmp.get("c.executeInForegroundWithReturn");
                action.setParams({i:cmp._expected});
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function verifyActionStorage(cmp) {
                var callbackDone = false;

                var action = cmp.get("c.executeInForegroundWithReturn");
                action.setParams({i:cmp._expected});
                action.setStorable();

                action.setCallback(this, function(a) {
                    callbackDone = true;
                    $A.test.assertTrue(a.isFromStorage(), "Action should have reported it was from storage");
                    $A.test.assertEquals(cmp._expected, a.getReturnValue().Counter, "Return value from storage was incorrect");
                }, "SUCCESS");

                $A.enqueueAction(action);
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function(){ return callbackDone; },
                    "action callback not invoked"
                );
            }
        ]
    },

    /**
     * Verifies that if a storable action has a cached response then the callback is invoked
     * before the XHR leaves the client.
     */
    testServerActionWithStoredResponseGetStorageFirst : {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function runRefreshAction(cmp) {
                var callbackDone = false;

                var action = cmp.get("c.executeInForeground");
                action.setCallback(this, function(a) {
                    callbackDone = true;
                }, "SUCCESS");
                action.setStorable({
                    "refresh": 0
                });

                //set up watch
                var watch_done = false;
                // watch for the action we gonna enqueue
                var preSendCallback = function(actions, actionToWatch) {
                    if (actionToWatch) {
                        $A.test.assertTrue(callbackDone,
                                "we should fetch response from storage first, before sending the action to server")
                        watch_done = true;
                    }
                };
                $A.test.addPreSendCallback(action, preSendCallback);
                $A.test.addWaitFor(true, function() { return watch_done; });

                //now enqueue the action
                $A.enqueueAction(action);
            }
        ]
    },

    /**
     * Verifies that the calling component does not influence cache hits for storable actions.
     */
    testStorableActionCacheIndependentOfComponent: {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function invokeActionIndependentOfComponet(cmp) {
                var callbackDone = false;
                var action = $A.test.getExternalAction(cmp,
                        "java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground",
                        {},
                        'java://java.lang.String',
                        function(result) {
                            callbackDone = true;
                            $A.test.assertTrue(result.isFromStorage(), "Action response should've been from storage");
                        });
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function(){ return callbackDone; },
                    "action callback not invoked"
                );
            },
        ]
    },

    testIncompleteActionRefreshDoesNotInvokeCallback: {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function runRefreshActionAndVerifyNoIncompleteCallback(cmp) {
                // Disconnect from server to force INCOMPLETE state on action
                $A.test.setServerReachable(false);
                $A.test.addCleanup(function() { $A.test.setServerReachable(true)});
                var action = cmp.get("c.executeInForeground");
                action.setCallback(this, function(a) {
                    $A.test.fail("INCOMPLETE callback should not be called on refresh actions");
                }, "INCOMPLETE");
                action.setStorable({
                    "refresh": 0
                });
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){
                    return $A.test.areActionsComplete([action]) && !$A.test.isActionPending();
                });
            }
        ]
    },

    testStoredActionInvokesCallbackWhenOffline: {
        test: [
            function primeActionStorage(cmp) {
                var action = cmp.get("c.executeInForeground");
                action.setStorable();
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
            },
            function runRefreshActionAndVerifyNoIncompleteCallback(cmp) {
                var callbackCalled = false;
                $A.test.setServerReachable(false);
                $A.test.addCleanup(function() { $A.test.setServerReachable(true)});
                var action = cmp.get("c.executeInForeground");
                action.setCallback(this, function(a) {
                    callbackCalled = true;
                }, "SUCCESS");
                action.setStorable({
                    "refresh": 0
                });
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function(){
                    return $A.test.areActionsComplete([action]);
                }, function() {
                    $A.test.assertTrue(callbackCalled, "SUCCESS callback never called for stored action when offline");
                });
            }
        ]
    },

    /**
     * test for bug W-2694348
     * The bug was invalid component trying to call getVersion()
     * when component version gets wrapped into an server action.
     */
    testServerActionAssociatedWithInvalidCmp : {
        test: function(cmp) {
            var callbackCalled = false;
            var action = cmp.get("c.executeInForeground");

            cmp.destroy(false);
            $A.test.assertFalse(cmp.isValid());

            $A.enqueueAction(action);
            $A.test.addWaitFor(true,
                function(){return $A.test.areActionsComplete([action]);},
                function(){
                    // associated component is invalid, so the action will be aborted
                    $A.test.assertEquals("ABORTED", action.getState());
                });
        }
    },

    testActionStatusIsIncompleteWhenOffline : {
        test: function(cmp) {
            var callbackCalled = false;
            $A.test.setServerReachable(false);
            $A.test.addCleanup(function() {$A.test.setServerReachable(true)});
            var action = cmp.get("c.executeInForeground");
            action.setCallback(this, function(a) {
                callbackCalled = true;
            }, "INCOMPLETE");

            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("INCOMPLETE", action.getState());
                    $A.test.assertTrue(callbackCalled,
                            "INCOMPLETE callback should get called.");
                });
        }
    },

    // the test will get into infinite reload because of coos so disable for now.
    _testActionWithErrorsIsErrorState: {
        test: function(cmp) {
            var callbackCalled = false;
            var action = cmp.get("c.throwsClientOutOfSyncException");
            action.setCallback(this, function(a) {
                callbackCalled = true;
            }, "ERROR");

            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("ERROR", action.getState());
                    $A.test.assertFalse(callbackCalled,
                            "ERROR callback should not get called.");
                });
        }
    },

    /**
     * Test the server side action is a background action
     */
    testServerActionIsBackground : {
        test : function(component) {
            var foregroundAction = component.get("c.executeInForeground");
            $A.test.assertFalse(foregroundAction.isBackground(),
                    "foreground action should have had isBackground === false");
            var foregroundActionWR = component.get("c.executeInForegroundWithReturn");
            $A.test.assertFalse(foregroundActionWR.isBackground(),
                    "foreground action with return should have had isBackground === false");
            var backgroundAction = component.get("c.executeInBackground");
            $A.test.assertTrue(backgroundAction.isBackground(),
                    "background action should have had isBackground === true");
            var backgroundActionWR = component.get("c.executeInBackgroundWithReturn");
            $A.test.assertTrue(backgroundActionWR.isBackground(),
                    "background action with return should have had isBackground === true");

            var wasFG = component.get("c.executeInForeground");
            wasFG.setBackground(true);
            $A.test.assertTrue(wasFG.isBackground(), "wasFG action should have had isBackground set to true");
            var stillBG = component.get("c.executeInBackground");
            stillBG.setBackground(false);
            $A.test.assertTrue(stillBG.isBackground(), "stillBG action should not have had isBackground set to false");
        }
    },

    testEnqueuedCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraWarning("Callback failed: java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground");
            $A.test.expectAuraError("this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.run(function() { $A.enqueueAction(a); });
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }
    },

    testRunActionsCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraError("this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }
    },

    testServerActionSendsError : {
        test : [
            function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.set("v.errorMessage", action.error[0].message);
                      });
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() {
                        return !!cmp.get("v.errorMessage");
                    });
            },
            function(cmp) {
                 var message = cmp.get("v.errorMessage");
                 $A.test.assertTrue(message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                     "Wrong message received from server: " + message);
            }
        ]
    },

    testErrorServerActionNotStored: {
        test : [
            function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.set("v.errorMessage", action.error[0].message);
                      });
                a.setStorable();
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() {
                        return !!cmp.get("v.errorMessage");
                    });
            },
            function(cmp) {
                var callbackDone = false;
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                        function(action) {
                        callbackDone = true;
                            $A.test.assertFalse(action.isFromStorage(), "Errored storable actions should not be stored");
                        });
                a.setStorable();
                $A.enqueueAction(a);

                $A.test.addWaitForWithFailureMessage(
                    true,
                    function(){ return callbackDone; },
                        "action callback not invoked"
                    );
            }
        ]
    },

    /**
     * When requesting a component via an action, the returned config should be consumed on the client in the Action
     * callback. If it is not, a warning should be logged.
     */
    testUnconsumedPartialConfigsLogsWarning : {
        test : function(cmp) {
            $A.test.expectAuraWarning("unused configs");
            var action = $A.get("c.aura://ComponentController.getComponent");
            action.setParams({
                "name" : "markup://loadLevelTest:serverComponent"
            });
            action.setCallback(this, function(a) {
                if (a.getState() === "SUCCESS") {
                    // Here is where the config should normally be consumed
                }
            });
            $A.run(function(){
                $A.enqueueAction(action);
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                // This test will fail if we don't get the warning specificed by the $A.test.expectAuraWarning()
                // call above. This wait is just to ensure the Action code finishes.
            });
        }
    },

    /**
     * If you have a component with a server dependency, and you create it with a component in its attribute set
     * it should not serialize the component and try to send it to the server. That will only result in a gack.
     */
    testCreateComponentWithComponentInAttributes : {
        test : [
            /**
             * Pass an array of components as body, verify no exception on the server.
             */
            function(cmp) {
                var expected = "SUCCESS";
                var actual;

                // Request a component with a server dependency so it sends the attributes to the server.
                $A.createComponent("auratest:test_Model_Parent", { body: [cmp] }, function(component, status, errorMessage){
                    actual = status;

                    if(errorMessage) {
                        $A.test.fail(errorMessage);
                    }
                });

                // Wait for the callback to successfully come back
                $A.test.addWaitFor(expected, function() { return actual; }, function(){});
            },

            /**
             * Pass a single component as the body, verify no exception on the server.
             */
            function(cmp) {
                var expected = "SUCCESS";
                var actual;

                // Request a component with a server dependency so it sends the attributes to the server.
                $A.createComponent("auratest:test_Model_Parent", { body: cmp }, function(component, status, errorMessage){
                    actual = status;

                    if(errorMessage) {
                        $A.test.fail(errorMessage);
                    }
                });

                // Wait for the callback to successfully come back
                $A.test.addWaitFor(expected, function() { return actual; }, function(){});
            }
        ]
    },

    /**
     * When requesting a component via an action, the returned config should be consumed on the client in the Action
     * callback. If it is not, a warning should be logged.
     */
    testCreateComponentAfterGetComponent : {
        test : function(cmp) {
            var actual = null;
            var action = $A.get("c.aura://ComponentController.getComponent");
            action.setParams({
                "name" : "markup://loadLevelTest:serverComponent"
            });
            action.setCallback(this, function(a) {
                // Should be fine.
                $A.createComponent("aura:html", {}, function(auraHtml) {
                    actual = auraHtml;
                });
            });

            $A.enqueueAction(action);

            $A.test.addWaitFor(true, function() { return !!actual; }, function(){});
        }
    },

    /**
     * Storable actions without a callback are a special case and should have their unused component configs cleared
     * automatically without an error or warning.
     */
    testClearingPartialConfigsOnStorableActions : {
        failOnWarning: true,
        test : function(cmp) {
            // Run storable action (no callback) that has unconsumed component configs
            var actionStorable = $A.get("c.aura://ComponentController.getComponent");
            actionStorable.setStorable();
            actionStorable.setParams({
                "name" : "markup://loadLevelTest:serverComponent"
            });
            $A.run(function(){
                $A.enqueueAction(actionStorable);
            });

            // Wait for storable action to complete
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var action = $A.get("c.aura://ComponentController.getComponent");
                action.setParams({
                    "name" : "markup://loadLevelTest:serverComponent"
                });
                action.setCallback(this, function(a) {
                    if (a.getState() === "SUCCESS") {
                        // Consume config to avoid warning/error
                        $A.createComponentFromConfig(a.getReturnValue());
                    }
                });

                // Run another action to verify there are no lingering configs from previous storable action
                $A.run(function() {
                    $A.enqueueAction(action);
                });
                $A.test.addWaitFor(false, $A.test.isActionPending, function(){ });
            });
        }
    },

    /**
     * When a stored action fails in Action.js#finishAction we enqueue a retry action. Verify the following:
     * 1. We get a warning saying the cached action failed and we're retrying from server.
     * 2. The error message box is not displayed to users when the stored action fails.
     * 3. The server action is enqueued and ran successfully.
     */
    testStorableRetry: {
        test : [
            function(cmp) {
                // prime storage
                var a = $A.test.getAction(cmp, "c.executeInForeground", undefined);
                a.setStorable();
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
            }, function(cmp) {
                var warningMsg = "Finishing cached action failed. Trying to refetch from server";
                var errorThrown = false;
                var that = this;

                // Actions from storage will log a warning instead of displaying error box
                $A.test.expectAuraWarning(warningMsg);
                var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, function(a) {
                    if (!errorThrown) {
                        // First callback is action from storage
                        $A.test.assertTrue(a.isFromStorage(), "First action callback should be from storage");
                        errorThrown = true;
                        throw new Error("Action callback error from test");
                    } else {
                        // Second callback is retry action from server. Error from stored action should not be present.
                        $A.test.assertFalse(a.isFromStorage(), "Second action callback should be from server");
                        $A.test.assertFalse(that.isAuraErrorDivVisible(), "Unexpected error showed up");
                    }
                });
                a.setStorable();
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
            }
        ]
    },

    /**
     * Verify when a retry action from the server fails the error is properly displayed to the user.
     */
    testStorableRetry_errorOnRetry: {
        test : [
            function(cmp) {
                // prime storage
                var a = $A.test.getAction(cmp, "c.executeInForeground", undefined);
                a.setStorable();
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
            }, function(cmp) {
                var errorMsg = "Action callback error from test",
                    warningMsg = "Finishing cached action failed. Trying to refetch from server",
                    thrownErrorMsg = "Thrown by test",
                    that = this;

                // Actions from storage log a warning instead of displaying error box
                $A.test.expectAuraWarning(warningMsg);
                // Expect 3 errors in the test. 2 from our $A.error calls in the action callback below, and 1 for the
                // error thrown in the callback of the retry action. We only see the error once because the first
                // error thrown on the action from storage is intentionally swallowed.
                $A.test.expectAuraError(errorMsg);
                $A.test.expectAuraError(errorMsg);
                $A.test.expectAuraError(thrownErrorMsg);
                var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, function(a) {
                    $A.error(errorMsg);
                    if (a.isFromStorage()) {
                        // Verify no error message displayed on action from storage
                        $A.test.assertFalse(that.isAuraErrorDivVisible());
                    } else {
                        // Verify error message displayed from retry action
                        $A.test.assertTrue(that.isAuraErrorDivVisible(), "Error div should have been visible");
                        var error = $A.test.getAuraErrorMessage();
                        $A.test.assertTrue(error.indexOf(errorMsg) !== -1), "Error div didn't contain expected text (" + errorMsg + "), was actually (" + error + ")";
                    }
                    throw new Error(thrownErrorMsg);
                });
                a.setStorable();
                $A.enqueueAction(a);
                $A.test.addWaitForWithFailureMessage(true,
                        function() {
                            var error = $A.test.getAuraErrorMessage();
                            return error.indexOf(thrownErrorMsg) !== -1;
                        },
                        "Error div never displayed error thrown from retry action callback"
                );
            }
        ]
    },

    isAuraErrorDivVisible: function() {
        var element = $A.util.getElement("auraErrorMessage");
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    },

    /************************************ Test for Concurrent Server Action starts ***********************************/
    /*
     * enqueue two actions with same signature, go offline, verify both of them return with INCOMPLETE
     */
    testConcurrentServerActionsBothIncomplete : {
        test : [
            function doTest(cmp) {
                //create two actions with same signature
                //also set current transcationId to be the same as first abortable action
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
                a1.setStorable();
                a2.setStorable();
                //do some sanity check callbacks
                a1.setCallback(cmp, function(action) {
                    $A.test.assertTrue(action.isFromStorage() === false, "1st action should get response from server");
                });
                a2.setCallback(cmp, function(action) {
                    $A.test.assertTrue(action.isFromStorage() === false, "2st action should get response from 1st action");
                });
                //let's cut the server so we don't get any response
                $A.test.setServerReachable(false);
                //make sure both actions get schedule to send in a same XHR box
                $A.run(
                        function() {
                            $A.enqueueAction(a1);
                            $A.enqueueAction(a2);
                        }
                );
                //need to make sure both actions return as INCOMPLETE
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a1.state==="INCOMPLETE")},
                        "fail waiting for action 1 return with state=INCOMPLETE"
                );

                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a2.state==="INCOMPLETE"); },
                        "fail waiting for action 2 return with state=INCOMPLETE"
                );
            }, function reconnectTheServer(cmp) {
                $A.test.setServerReachable(true);
            }
        ]
    },


    /*
     * two concurrent background actions, 2nd action get copy of 1st's response
     */
    testConcurrentBackgroundServerActionsBothStorable : {
        test : [
            function(cmp) {
                var a1Return = undefined, a2Return = undefined;
                var recordObjCounterFromA1 = undefined;
                //create two actions with same signature
                var a1 = $A.test.getAction(cmp, "c.executeInBackgroundWithReturn", {i:1});
                var a2 = $A.test.getAction(cmp, "c.executeInBackgroundWithReturn", {i:1});
                a1.setStorable();
                a2.setStorable();
                //we check response in callbacks
                a1.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                    a1Return = action.getReturnValue();
                    $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                    recordObjCounterFromA1 = a1Return.recordObjCounter;
                    $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
                });
                a2.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from 1st, but not from storage");
                    a2Return = action.getReturnValue();
                    $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                    $A.test.assertEquals(recordObjCounterFromA1, a2Return.recordObjCounter, "2nd action should get a copy response from 1st action");
                });
                //make sure both ations get schedule to send in a same XHR box
                $A.run ( function() {
                    $A.enqueueAction(a1);
                    $A.enqueueAction(a2);
                    }
                );

                //just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a1Return!==undefined); },
                        "fail waiting for action1 returns something"
                );
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a2Return!==undefined); },
                        "fail waiting for action2 returns something"
                );
            }
        ]
    },

    /*
     * we enqueue two server frontend action with identical action signature
     * 1st action get send to server then return with ERROR state
     * 2nd will copy the error response from 1st one.
     */
    testConcurrentServerActionsBothStorable1stActionErrorOut : {
        test : [
            function(cmp) {
                //create two actions with same signature
                var a1 = $A.test.getAction(cmp, "c.errorInForeground", null);
                var a2 = $A.test.getAction(cmp, "c.errorInForeground", null);
                a1.setStorable();
                a2.setStorable();
                //we check response in callbacks
                a1.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                    $A.test.assertEquals("ERROR", action.state, "we expect 1st action to error out on server");
                    $A.test.assertTrue(action.error[0].message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                            "expect error message from 1st action");
                });
                a2.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "2st action should get response from 1st action");
                    $A.test.assertEquals("ERROR", action.state, "we expect 2nd action to get error response like 1st action");
                    $A.test.assertTrue(action.error[0].message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                            "expect error message from 2nd action");
                });
                //make sure both ations get schedule to send in a same XHR box
                $A.run(
                        function() {
                            $A.enqueueAction(a1);
                            $A.enqueueAction(a2);
                        }
                );
                //just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a1.state==="ERROR")&&(a2.state==="ERROR"); },
                        "fail waiting for both action return ERROR"
                );
            }
        ]
    },


    /**
     * Tests that storable actions with identical signatures, when there is not a client-side cache hit, are:
     * 1. Deduped so only 1 goes to the server yet both callbacks are invoked.
     * 2. Action return values are isolated across callbacks so if a callback mutates the value no other callback sees it.
     */
    testConcurrentServerActionsBothStorable : {
        test : [
            function(cmp) {
                var returnValueFromA1;
                var returnValueFromA2;
                // create two actions with same signature.
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                a1.setStorable();
                a2.setStorable();

                a1.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");

                    var returnValue  = action.getReturnValue();
                    returnValueFromA1 = returnValue;

                    $A.test.assertEquals(1, returnValue.Counter, "counter of 1nd action should be 1");
                    returnValue.Counter = 2; // mutate the value, shouldn't be visible in other callbacks

                    $A.test.assertNotUndefinedOrNull(returnValue.recordObjCounter, "expect to get recordObjCounter from 1st action");
                });

                a2.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from 1st, but not from storage");

                    var returnValue = action.getReturnValue();
                    returnValueFromA2 = returnValue;

                    $A.test.assertEquals(1, returnValue.Counter, "counter of 2nd action should be 1 (and not the mutated value from 1st action");

                    // deep copy of values is passed to each callback
                    $A.test.assertTrue(returnValueFromA1 !== returnValue, "returnValue provided to each callback should be distinct objects");
                    // primitive values are not deep copied b/c they're immutable
                    $A.test.assertEquals(returnValueFromA1.recordObjCounter, returnValue.recordObjCounter, "2nd action should get a copy response from 1st action");
                });

                $A.enqueueAction(a1);
                $A.enqueueAction(a2);

                // just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return returnValueFromA1 !== undefined; },
                        "fail waiting for action 1 returns something"
                );
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return returnValueFromA2 !== undefined; },
                        "fail waiting for action 2 returns something"
                );
            }
        ]
    },


     /**
     * Tests that storable actions with identical signatures, when there is a client-side cache hit, are:
     * 1. Action return values are isolated across callbacks so if a callback mutates the value no other callback sees it.
     * 2. Only 1 refresh action is sent to the server (the 2nd is deduped). TODO - why is this?
     * 3. The refresh action triggers callbacks to both actions.
     */
    testConcurrentServerActionsBothStorableWithResponseStored : {
        labels : [ "threadHostile" ],
        test : [
            function primeActionStorage(cmp) {
                var a0 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 10});
                a0.setStorable();
                cmp._storageKey = a0.getStorageKey();
                $A.enqueueAction(a0);
                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return $A.test.areActionsComplete([a0]) && !$A.test.isActionPending();
                        },
                        "a0 doesn't finish",
                        function() {
                            cmp._counter = a0.getReturnValue().recordObjCounter;
                        });
            },
            function enqueueTwoActionWithSameSignature(cmp) {
                var returnValueFromA1;
                var returnValueFromA2;

                // create two actions with same signature (and same as above)
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 10});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 10});
                // force action refresh to go to server. for each refresh recordObjCounter will be incremented.
                a1.setStorable({"refresh": 0});
                a2.setStorable({"refresh": 0});

                // callbacks will be invoked 2 times: from storage then with refresh action.
                // note that action invocation order is not guaranteed so identical checks in each is required.

                a1.setCallback(cmp, function(action) {
                    var returnValue  = action.getReturnValue();
                    returnValueFromA1 = returnValue;

                    $A.test.assertTrue(returnValueFromA2 !== returnValue, "returnValue provided to each callback should be distinct objects");
                    $A.test.assertEquals(10, returnValue.Counter, "counter of 1st action should be 10");
                    // mutate the value, shouldn't be visible in other callbacks
                    returnValue.Counter = 2;

                    if (action.isFromStorage()) {
                        $A.test.assertEquals(cmp._counter, returnValue.recordObjCounter, "expect to get recordObjCounter from storage");
                    } else {
                        $A.test.assertTrue(action.isRefreshAction(), "1st action should be refresh if not from storage");
                        // a1 and a2 get refreshed, order is not guaranteed, so just require value to have incremented
                        $A.test.assertTrue(cmp._counter < returnValue.recordObjCounter, "expect to get recordObjCounter from storage");
                        $A.test.assertNotEquals(returnValueFromA2 && returnValueFromA2.recordObjCounter, returnValue.recordObjCounter, "refreshed 1st and 2nd action recordObjCounter should differ");
                    }
                });

                a2.setCallback(cmp, function(action) {
                    var returnValue  = action.getReturnValue();
                    returnValueFromA2 = returnValue;

                    $A.test.assertTrue(returnValueFromA1 !== returnValue, "returnValue provided to each callback should be distinct objects");
                    $A.test.assertEquals(10, returnValue.Counter, "counter of 2nd action should be 10");
                    // mutate the value, shouldn't be visible in other callbacks
                    returnValue.Counter = 3;

                    if (action.isFromStorage()) {
                        $A.test.assertEquals(cmp._counter, returnValue.recordObjCounter, "expect to get recordObjCounter from storage");
                    } else {
                        $A.test.assertTrue(action.isRefreshAction(), "2nd action should be refresh if not from storage");
                        // a1 and a2 get refreshed, order is not guaranteed, so just require value to have incremented
                        $A.test.assertTrue(cmp._counter < returnValue.recordObjCounter, "expect to get recordObjCounter from storage");
                        $A.test.assertNotEquals(returnValueFromA1 && returnValueFromA1.recordObjCounter, returnValue.recordObjCounter, "refreshed 1st and 2nd action recordObjCounter should differ");
                    }
                });

                $A.enqueueAction(a1);
                $A.enqueueAction(a2);

                // just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() {
                            // second part of check is true only after refresh action arrives
                            return returnValueFromA1 !== undefined && cmp._counter < returnValueFromA1.recordObjCounter;
                        },
                        "fail waiting for action 1 returns something"
                );
                $A.test.addWaitForWithFailureMessage(true,
                        function() {
                            // second part of check is true only after refresh action arrives
                            return returnValueFromA2 !== undefined && cmp._counter < returnValueFromA2.recordObjCounter;
                        },
                        "fail waiting for action 2 returns something"
                );
            }
        ]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * only 2nd are storable
     * both actions get to send to the server
     */
    testConcurrentServerActions1stNonstorable : {
        test : [
            function(cmp) {
                var a1Return = undefined, a2Return = undefined;
                var recordObjCounterFromA1 = undefined;
                //create two actions with same signature
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                a2.setStorable();
                //we check response in callbacks
                a1.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                    a1Return = action.getReturnValue();
                    $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                    recordObjCounterFromA1 = a1Return.recordObjCounter;
                    $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
                });
                a2.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from server, as 1st isn't storable");
                    a2Return = action.getReturnValue();
                    $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                    $A.test.assertTrue(a2Return.recordObjCounter > recordObjCounterFromA1, "2nd action should get response from server, after 1st");
                });
                //make sure both ations get schedule to send in a same XHR box
                $A.run(
                        function() {
                            $A.enqueueAction(a1);
                            $A.enqueueAction(a2);
                        }
                );
                //just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a1Return!==undefined); },
                        "fail waiting for action 1 returns something"
                );
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a2Return!==undefined); },
                        "fail waiting for action 2 returns something"
                );
            }
        ]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * only 1st is storable
     * both action get the send to server
     */
    testConcurrentServerActions2ndNonstorable : {
        test : [
            function(cmp) {
                var a1Return = undefined, a2Return = undefined;
                var recordObjCounterFromA1 = undefined;
                //create two actions with same signature
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
                a2.setStorable();
                //we check response in callbacks
                a1.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                    a1Return = action.getReturnValue();
                    $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                    recordObjCounterFromA1 = a1Return.recordObjCounter;
                    $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
                });
                a2.setCallback(cmp, function(action) {
                    $A.test.assertFalse(action.isFromStorage(), "2nd action should send to server");
                    a2Return = action.getReturnValue();
                    $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                    $A.test.assertTrue(a2Return.recordObjCounter > recordObjCounterFromA1, "2nd action should send to server, after 1st");
                });
                //make sure both ations get schedule to send in a same XHR box
                $A.run(
                        function() {
                            $A.enqueueAction(a1);
                            $A.enqueueAction(a2);
                        }
                );
                //just need to make sure both actions get some return
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a1Return!==undefined); },
                        "fail waiting for action1 returns something"
                );
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a2Return!==undefined); },
                        "fail waiting for action2 returns something"
                );
            }
        ]
    }
})
