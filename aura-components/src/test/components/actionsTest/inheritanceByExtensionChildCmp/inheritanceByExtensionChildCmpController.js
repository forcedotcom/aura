({
    clientSideActionInChildOnly : function(component) {
    	component.set("v.WhichControllerWasCalledChild", "clientSideActionInChildOnly");
    },
    
    clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledChild", "clientSideActionInBoth from Child");
    },
    
    //server action from JavaTestController.java
    serverSideActionInBoth : function(component) {
    	var serverAction = component.get("c.getString");
        serverAction.setParams({ param : "getString"+" called from Child's serverSideActionInBoth" });
        serverAction.setCallback(this, function(action) {
        	if(action.getReturnValue()) {
        		component.set("v.WhichControllerWasCalledChild", action.getReturnValue());
        	} else {
        		component.set("v.WhichControllerWasCalledChild", "Error: failed to run serverAction:getString");
        	}
        });

        $A.enqueueAction(serverAction);
    },
    
    setAttributeAuraActionChild: function(component) {
    	component.set("v.WhichControllerWasCalledChild", "setAttributeAuraAction in Child");
    },
    
    fireAttributeAuraAction: function(component) {
    	var clientAction = component.get("v.attributeAuraAction");
    	$A.enqueueAction(clientAction);
    }
})