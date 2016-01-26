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
    
    /**
     * both Parent and Parent has server controller: JavaTestController.java
     * This verify when client call its server action, it go through the correct one
     */
    testServerSideActionInBoth : {
    	test : function(component) {
        	var serverAction = component.get("c.serverSideActionGetString");
            $A.enqueueAction(serverAction);
            
            $A.test.addWaitFor(true, function() { 
        		return (component.get("v.WhichControllerWasCalledParent") === "getString called from Parent's serverSideActionInBoth")
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
    }
})