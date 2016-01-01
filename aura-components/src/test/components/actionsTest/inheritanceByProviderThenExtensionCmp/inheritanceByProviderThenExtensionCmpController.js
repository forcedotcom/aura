({
	clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledSolid", "clientSideActionInBoth from Solid");
    },
    
    clientSideActionInSolidOnly : function(component) {
    	component.set("v.WhichControllerWasCalledSolid", "clientSideActionInSolidOnly");
    },
    
    //server action from JavaTestController.java
    serverSideActionInBoth : function(component) {
    	component.get("c.getString");
    	var serverAction = component.get("c.getString");
        serverAction.setParams({ param : "getString"+" called from Solid's serverSideActionInBoth" });
        serverAction.setCallback(this, function(action) {
        	if(action.getReturnValue()) {
        		component.set("v.WhichControllerWasCalledSolid", action.getReturnValue());
        	} else {
        		component.set("v.WhichControllerWasCalledSolid", "Error: failed to run serverAction:getString");
        	}
        });

        $A.enqueueAction(serverAction);
    },
    
    setAttributeAuraActionSolid: function(component) {
    	component.set("v.WhichControllerWasCalledSolid", "setAttributeAuraAction in Solid");
    },
    
    fireAttributeAuraAction: function(component) {
    	var clientAction = component.get("v.attributeAuraActionAbstract");
    	$A.enqueueAction(clientAction);
    }
})