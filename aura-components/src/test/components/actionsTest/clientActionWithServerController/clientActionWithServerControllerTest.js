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
    testClientActionInForeground : {
        test : [ function(component) {
            var action = component.get("c.clientExecuteInForeground");
            component._gotResponse = false;
            action.setCallback(this, function() {
                component._gotResponse = true;
            });
            $A.test.enqueueAction(action, true);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("SUCCESS", action.getState());
                    $A.test.assertTrue(component._gotResponse, "Client Side Action was not called after enqueue.");
                });
        } ]
    },

    /**
     * Test the client side foreground action is executed once enqueued
     */
    testClientActionInBackground : {
        test : [ function(component) {
            var action = component.get("c.clientExecuteInBackground");
            component._gotResponse = false;
            action.setCallback(this, function() {
                component._gotResponse = true;
            });
            $A.test.enqueueAction(action, true);
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
            var message;
            $A.test.addFunctionHandler($A, "warning", function(msg, err) {
                message = msg;
            });

            try {
                cmp.throwsAnError();
                $A.test.fail("Expected error when running client-side action");
            } catch (e) {
                $A.test.assertEquals("intentional error", e.message);
            }

            $A.test.assertEquals("Action failed: actionsTest$clientActionWithServerController$controller$throwsAnError", message);
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
    }
})
