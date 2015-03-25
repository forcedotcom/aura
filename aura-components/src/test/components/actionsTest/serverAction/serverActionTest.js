({
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
            $A.test.expectAuraError("Uncaught error in actionCallback : this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.run(function() { $A.enqueueAction(a); });
            $A.test.addWaitFor(true, function() { return a.getState() != "NEW" && a.getState() != "RUNNING"; },
                    function() {});
        }
    },

    testRunActionsCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraError("Uncaught error in actionCallback : this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.clientService.runActions([ a ], cmp, function() { });
            $A.test.addWaitFor(true, function() { return a.getState() != "NEW" && a.getState() != "RUNNING"; },
                    function() {});
        }
    },

    testRunActionsGroupCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraError("Uncaught error in actionCallback : this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() { });
            $A.clientService.runActions([ a ], cmp, function() {
                throw new Error("this is intentional");
            });
            $A.test.addWaitFor(true, function() { return a.getState() != "NEW" && a.getState() != "RUNNING"; },
                    function() {});
        }
    },

    testServerActionSendsError : {
        test : [ function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.set("v.errorMessage", action.error[0].message);
                      });
                $A.clientService.runActions([ a ], cmp);
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
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, "prime");
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitForAction(true, "prime");
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
            $A.test.markForCompletion(a, "action1");
            $A.enqueueAction(a);
            $A.test.addWaitForAction(true, "action1");
        }]
    },

    /**
     * Verify when a retry action from the server fails the error is properly displayed to the user.
     */
    testStorableRetry_errorOnRetry: {
        test : [ function(cmp) {
            // prime storage
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, "prime");
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitForAction(true, "prime");
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

    isAuraErrorDivVisible: function() {
        var element = $A.util.getElement("auraErrorMessage");
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    }
})
