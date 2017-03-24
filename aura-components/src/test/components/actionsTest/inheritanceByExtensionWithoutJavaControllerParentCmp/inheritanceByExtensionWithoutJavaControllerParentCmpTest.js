({
    /**
     * verify client action exist in Parent only get called.
     */
    testClientSideActionInParentOnly : {
        test : [function(component) {
        	var clientAction = component.get("c.clientSideActionInParentOnly");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledParent") === "clientSideActionInParentOnly")
        	});
        }]
    },
    
    /**
     * both Parent and Parent has client action: clientSideActionInBoth
     * This verify the one in Parent get called.
     */
    testClientSideActionInBoth : {
    	test : function(component) {
        	var clientAction = component.get("c.clientSideActionInBoth");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledParent") === "clientSideActionInBoth from Parent")
        	});
    	}
    },
    
    testAttributeAuraAction : {
    	test : function(component) {
        	var clientAction = component.get("c.fireAttributeAuraAction");
            $A.enqueueAction(clientAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledParent") === "setAttributeAuraAction in Parent")
        	});
    	}
    },
    
    /**
     * Error Case:
     * When trying to get a non-existent action, we should fail fast by displaying an error to the user (via $A.error),
     * and throwing a Javascript exception, since $A.error will only display a message and does not stop execution.
     * notice this give us the same error as test 'testGetNonExistentParentServerAction' in the child component that extends
     * this one (inheritanceByExtensionWithJavaControllerChildCmp)
     */
    testGetNonExistentAction : {
        test : function(cmp) {
            var errorMsg = "Unknown controller action 'serverSideActionInChildOnly'";
            try {
                var action = cmp.get("c.serverSideActionInChildOnly");
                $A.test.fail("Attemping to get a non-existent controller action should have thrown error.");
            } catch (e) {
                $A.test.assertEquals(errorMsg, e.message);
            }
        }
    }
})