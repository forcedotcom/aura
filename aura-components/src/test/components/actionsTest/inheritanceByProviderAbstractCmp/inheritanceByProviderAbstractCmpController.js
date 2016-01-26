({
	clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledAbstract", "clientSideActionInBoth from Abstract");
    },
    
    clientSideActionInAbstractOnly : function(component) {
    	component.set("v.WhichControllerWasCalledAbstract", "clientSideActionInAbstractOnly");
    },
    
    //server action from JavaTestController.java
    serverSideActionInBoth : function(component) {
    	component.get("c.getString");
    	var serverAction = component.get("c.getString");
        serverAction.setParams({ param : "getString"+" called from Abstract's serverSideActionInBoth" });
        serverAction.setCallback(this, function(action) {
        	if(action.getReturnValue()) {
        		component.set("v.WhichControllerWasCalledAbstract", action.getReturnValue());
        	} else {
        		component.set("v.WhichControllerWasCalledAbstract", "Error: failed to run serverAction:getString");
        	}
        });

        $A.enqueueAction(serverAction);
    },
    
    setAttributeAuraActionAbstract: function(component) {
    	component.set("v.WhichControllerWasCalledAbstract", "attributeAuraActionAbstract in Abstract");
    },
    
    fireAttributeAuraAction: function(component) {
    	var clientAction = component.get("v.attributeAuraActionAbstract");
    	$A.enqueueAction(clientAction);
    }
})