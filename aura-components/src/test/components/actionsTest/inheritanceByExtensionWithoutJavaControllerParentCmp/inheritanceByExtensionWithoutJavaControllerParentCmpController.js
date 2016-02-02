({
    clientSideActionInParentOnly : function(component) {
    	component.set("v.WhichControllerWasCalledParent", "clientSideActionInParentOnly");
    },
    
    clientSideActionInBoth : function(component) {
    	component.set("v.WhichControllerWasCalledParent", "clientSideActionInBoth from Parent");
    },
        
    setAttributeAuraAction: function(component) {
    	component.set("v.WhichControllerWasCalledParent", "setAttributeAuraAction in Parent");
    },
    
    fireAttributeAuraAction: function(component) {
    	var clientAction = component.get("v.attributeAuraAction");
    	$A.enqueueAction(clientAction);
    },
    
    serverSideAction : function(component) {
    	var serverAction = component.get("c.bogus");
    	$A.enqueueAction(serverAction);
    }
})