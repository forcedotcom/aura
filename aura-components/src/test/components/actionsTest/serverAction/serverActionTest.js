({
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
        }]
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
        }]
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
        test : [ function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.set("v.errorMessage", action.error[0].message);
                      });
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() {
                        return !!cmp.get("v.errorMessage");
                    });
            }, function(cmp) {
                 var message = cmp.get("v.errorMessage");
                 $A.test.assertTrue(message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                     "Wrong message received from server: " + message);
            }]
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
                        $A.newCmpDeprecated(a.getReturnValue());
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
        test : [ function(cmp) {
            // prime storage
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined);
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }, function(cmp) {
            var errorMsg = "Action callback error from test",
                warningMsg = "Finishing cached action failed. Trying to refetch from server",
                errorThrown = false,
                that = this;

            // Actions from storage will log a warning instead of displaying error box
            $A.test.expectAuraWarning(warningMsg);
            $A.test.expectAuraError(errorMsg);
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, function(a) {
                if (!errorThrown) {
                    // First callback is action from storage
                    $A.test.assertTrue(a.isFromStorage(), "First action callback should be from storage");
                    errorThrown = true;
                    $A.error(errorMsg);
                    throw new Error("Thrown by test");
                } else {
                    // Second callback is retry action from server. Error from stored action should not be present.
                    $A.test.assertFalse(a.isFromStorage(), "Second action callback should be from server");
                    $A.test.assertFalse(that.isAuraErrorDivVisible());
                }
            });
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }]
    },

    /**
     * Verify when a retry action from the server fails the error is properly displayed to the user.
     */
    testStorableRetry_errorOnRetry: {
        test : [ function(cmp) {
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
                    $A.test.assertTrue(that.isAuraErrorDivVisible());
                    var error = $A.test.getAuraErrorMessage();
                    $A.test.assertTrue(error.indexOf(errorMsg) !== -1);
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
        }]
    },

    testCallingComponentExistsInServerAction : {
        test: function(cmp) {
            var a = cmp.get("c.updateTextWithCallingDescrptor");
            $A.enqueueAction(a);
            $A.test.addWaitFor(false,
                function() {return $A.util.isUndefined(cmp.get("v.text"));},
                function() {
                    var expect = cmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(expect, cmp.get("v.text"),
                            "Calling component should be the testing component");
                });
        }
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
        test : [ function doTest(cmp) {
            var currentTransactionId = $A.getCurrentTransactionId();
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
        }]
    },


    /**
     * ALERT : Complex test setup.
     *
     * Test for Two concurrent server actions with same signature get aborted during receive() when server is OFFLINE
     * I'm doing this using two caboose actions
     *
     * This is what we need: two abortable identical actions(a1 and a2 in test), we want them enqueued.
     * a2 is recognized as a 'dupe' of a1, so actually only a1 get pushed to action queue, a2 is stored.
     *
     * we enqueue a background action (a0) along with a1&a2, so we can have some control over when to go offline etc
     * Note: a0 needs to be background so a1&a2 don't actually get send, we go OFFLINE when a0 comeback with SUCCESS
     *
     * then we enqueue a foreground action (a3) , this will trigger sending of caboose actions(a1&a2).
     * Note: a3 cannot be abortable, or a1&a2 will get aborted without being send at all.
     *
     * BUT when sending out a1, another abortable action(a4 in test) get enqueued, push currentTransactionId forward.
     * when we deal with a1 & a3 in receive(), server is offline, we abort a1 because it belong to the
     * previous 'patch' of abortable actions, then abort a2 because its a1's 'dupe'.
     * Note: we need server to be "unReachable" because we don't abort actions if we get response
     *
     * Four places we do action.abort() on AuraClientSrevice: this test 3rd place in AuraClientService.processIncompletes().
     * 1st is test in testAbortQueuedAbortable, 2nd by testAbortInFlightAbortable , 4th by testAbortStorable,
     * all in enqueueActionTest.js
     */
    testConcurrentCabooseServerActionsBothAborted : {
        test : [
            function enqueueThreeActionsThenGoOffline(cmp) {
                var testCompleted = false;
                var a0 = $A.test.getAction(cmp, "c.executeInBackground", null,
                        function(action) {
                            $A.test.assertTrue(action.isAbortable(), "what? we did just set a0 to be abortable");
                        }
                );
                a0.setStorable();//this will also make a0 abortable
                //we go offline and enqueue a4 when a0 come back with SUCCESS
                $A.test.addWaitForWithFailureMessage(true,
                        function() { return (a0.state === "SUCCESS"); },
                        "fail waiting for a0 to finish ",
                        function() {
                             //sanity check: make sure a1&a2 are not aborted yet
                             $A.test.assertEquals("NEW", a1.getState(), "a1 should still be in New state");
                             $A.test.assertEquals("NEW", a2.getState(), "a2 should still be in New state");
                             //now let's hook our callback before send(), where we go offline and enqueue a4
                             var preSendCallback = function(actions) {
                                $A.test.setServerReachable(false);//go offline
                                //make sure a4's callback get run
                                $A.test.addWaitForWithFailureMessage(true, function() { return testCompleted; }, "callback of a4 didn't get to run");
                                var a4 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:4},
                                            function(action) {
                                                $A.test.assertEquals("INCOMPLETE", action.getState(), "a4 shouldn't get send to server");
                                                //we abort a1 and a2 in receive() after we enqueue a4
                                                $A.test.assertEquals("ABORTED", a1.getState(), "a1 should get aborted");
                                                $A.test.assertEquals("ABORTED", a2.getState(), "a2 should get aborted");
                                                testCompleted = true;
                                                $A.test.setServerReachable(true);//go back online
                                            }
                                );
                                a4.setAbortable();
                                $A.run(
                                            function() {    $A.enqueueAction(a4);  }
                                );
                                //we only need to do this callback once, once we are done, remove it
                                $A.test.removePrePostSendCallback(cb_handle);
                            }
                            var cb_handle = $A.test.addPrePostSendCallback(undefined, preSendCallback, undefined );
                    }
                );

                //now enqueue two storable&abortable server actions with same signature
                var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
                var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
                a1.setStorable(); a1.setCaboose();
                a2.setStorable(); a2.setCaboose();
                //enqueue a0,a1 and a2, we will only send out a0, keep a1 in the actionsDeferred queue, a2 is stored
                //as a1's dupe.
                $A.run(
                        function() {
                            $A.enqueueAction(a0);
                            $A.enqueueAction(a1);
                            $A.enqueueAction(a2);
                        }
                );
            }, function enqueueAnotherAbortableAction(cmp) {
                //now we enqueue another server action a3, this will send previous caboose actions: a1 and a2
                var a3 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:3},
                        function(action) {
                            $A.test.assertEquals("INCOMPLETE", action.getState(), "a3 shouldn't get send to server");
                        }
                );
                $A.enqueueAction(a3);

            }
        ]
    },


    /*
     * two concurrent background actions, 2nd action get copy of 1st's response
     */
    testConcurrentBackgroundServerActionsBothStorable : {
        test : [ function(cmp) {
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
        test : [ function(cmp) {
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

        }]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * both are storable
     * only the first action get to send to the server. second one get response from the 1st one
     */
    testConcurrentServerActionsBothStorable : {
        test : [ function(cmp) {
            var a1Return = undefined, a2Return = undefined;
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
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
     * only 2nd are storable
     * both actions get to send to the server
     */
    testConcurrentServerActions1stNonstorable : {
        test : [ function(cmp) {
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
        test : [ function(cmp) {
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
