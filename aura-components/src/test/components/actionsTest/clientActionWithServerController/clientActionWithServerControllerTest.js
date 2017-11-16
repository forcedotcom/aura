({
    tearDown : function(component) {
        component._gotResponse = null;
        delete component._gotResponse;
    },

    /**
     * Test the client side action is a background action
     */
    testClientActionIsBackground : {
        test : function(component) {
            var clientSideAction = component.get("c.clientSideAction");
            $A.test.assertFalse(clientSideAction.isBackground(),
                    "clientSideAction should have had isBackground === false");

            clientSideAction.setBackground(true);
            $A.test.assertTrue(clientSideAction.isBackground(),
                    "clientSideAction should have had isBackground === true after calling setBackground(true)");

            var clientSideAction = component.get("c.clientSideAction");
            $A.test.assertFalse(clientSideAction.isBackground(),
                    "a freshly created clientSideAction should have had isBackground === false");
        }
    },
    /**
     * Test the client side foreground action is executed once enqueued
     */
    testRunClientActionInForeground : {
        test : [ function(component) {
            var action = component.get("c.clientExecuteInForeground");
            component._gotResponse = false;
            action.setCallback(this, function() {
                component._gotResponse = true;
            });
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("SUCCESS", action.getState());
                    $A.test.assertTrue(component._gotResponse, "Client Side Action was not called after enqueue.");
                });
        } ]
    },

    /**
     * Errors thrown while executing client-side actions should be propagated to caller, and a warning logged.
     */
    testClientActionJavascriptError : {
        test : function(cmp) {
            try {
                cmp.throwsAnError();
                $A.test.fail("Expected error when running client-side action");
            } catch (e) {
                $A.test.assertEquals("Action failed: actionsTest:clientActionWithServerController$controller$throwsAnError [intentional error]", e.message);
            }
        }
    },

    testActionCaseSensitivity : {
        test : function(cmp) {
            $A.test.assertTruthy(cmp.get("c.clientExecuteInForeground"));
            $A.test.assertTruthy(cmp.get("c.clientExecuteInFOREGROUND"));

            cmp.find("executeInForeground").get("e.press").fire();
            $A.test.assertEquals("clientExecuteInForeground", cmp.get("v.value"));
            cmp.find("executeInFOREGROUND").get("e.press").fire();
            $A.test.assertEquals("clientExecuteInFOREGROUND", cmp.get("v.value"));
        }
    },

    testExceptionEventHandledByEventHandlerOnly : {
        test: function(cmp) {
            $A.test.assertFalse(cmp.get("v.coosHandled"));
            var action = cmp.get("c.throwsClientOutOfSyncException");
            var actionCallbackCalled = false;
            action.setCallback(this, function(response) {
                actionCallbackCalled = true;
            });
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function() {return cmp.get("v.coosHandled");},
               function() {
                    $A.test.assertFalse(actionCallbackCalled);
               });
        }
    }
})
