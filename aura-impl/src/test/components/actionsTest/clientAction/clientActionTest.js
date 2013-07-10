({
    /**
     * Test the client side action is a background action
     */
    testClientActionIsBackground : {
    	test : function(component) {
    		var clientSideAction = component.get("c.clientSideAction");
            $A.test.assertFalse(clientSideAction.isBackground(), "clientSideAction should have had isBackground === false");
            
            clientSideAction.setBackground(true);
            $A.test.assertTrue(clientSideAction.isBackground(), "clientSideAction should have had isBackground === true after calling setBackground(true)");
    		
            var clientSideAction = component.get("c.clientSideAction");
            $A.test.assertFalse(clientSideAction.isBackground(), "a freshly created clientSideAction should have had isBackground === false");
    	}
    },
    /**
     * Test the client side foreground action is executed once enqueued
     */
    testClientActionInForeground : {
        test : function(component) {
            var action = component.get("c.cExecuteInForeground");
            var gotResponse = false;
            action.setCallback(this, function() {
                gotResponse = true;
            });
            
            $A.test.enqueueAction(action);

            $A.test.addWaitFor(true, function() {
                return gotResponse;
            });
            $A.test.assertTrue(gotResponse, "Client Side Action was not called after enqueue.")
        }
    },
    /**
     * Test the client side foreground action is executed once enqueued
     */
    testClientActionInBackground : {
        test : function(component) {
            var action = component.get("c.cExecuteInBackground");
            var gotResponse = false;
            action.setCallback(this, function() {
                gotResponse = true;
            });
            
            $A.test.enqueueAction(action, true);

            $A.test.addWaitFor(true, function() {
                return gotResponse;
            });
            $A.test.assertTrue(gotResponse, "Background Client Side Action was not called after enqueue.")
        }
    }
})
