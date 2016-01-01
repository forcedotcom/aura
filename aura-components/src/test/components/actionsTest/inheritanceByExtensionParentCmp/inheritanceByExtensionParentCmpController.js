({
    clientSideActionInParentOnly : function(component) {
    	component.set("v.WhichControllerWasCalledParent", "clientSideActionInParentOnly");
    },
    
    clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledParent", "clientSideActionInBoth from Parent");
    },
    
    //server action from JavaTestController.java
    serverSideActionGetString : function(component) {
    	component.get("c.getString");
    	var serverAction = component.get("c.getString");
        serverAction.setParams({ param : "getString"+" called from Parent's serverSideActionInBoth" });
        serverAction.setCallback(this, function(action) {
        	if(action.getReturnValue()) {
        		component.set("v.WhichControllerWasCalledParent", action.getReturnValue());
        	} else {
        		component.set("v.WhichControllerWasCalledParent", "Error: failed to run serverAction:getString");
        	}
        });

        $A.enqueueAction(serverAction);
    },
    
    setAttributeAuraAction: function(component) {
    	component.set("v.WhichControllerWasCalledParent", "setAttributeAuraAction in Parent");
    },
    
    fireAttributeAuraAction: function(component) {
    	var clientAction = component.get("v.attributeAuraAction");
    	$A.enqueueAction(clientAction);
    }
})