({
    clientSideActionInChildOnly : function(component) {
    	component.set("v.WhichControllerWasCalledChild", "clientSideActionInChildOnly");
    },
    
    clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledChild", "clientSideActionInBoth from Child");
    },
    
    //server action from TestControllerWithParameters.java
    serverSideActionInChildOnly : function(component) {
    	var serverAction = component.get("c.appendStrings");
        serverAction.setParams({ a : "appendStrings", b: " called from Child's serverSideActionInChildOnly" });
        serverAction.setCallback(this, function(action) {
        	if(action.getReturnValue()) {
        		component.set("v.WhichControllerWasCalledChild", action.getReturnValue());
        	} else {
        		component.set("v.WhichControllerWasCalledChild", "Error: failed to run serverAction:appendStrings");
        	}
        });

        $A.enqueueAction(serverAction);
    },
    
    //this will error out, because our parent has no server side controller
    serverSideActionInParent : function(component) {
    	var serverAction = component.getSuper().get("c.bogus");
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