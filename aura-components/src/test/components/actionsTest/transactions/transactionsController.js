({
    setTransaction : function(component) {
        component.set("v.transactionId", $A.getCurrentTransactionId());
    },
    clearTransaction : function(component) {
        component.set("v.transactionId", "");
    },
    sendAbortable : function(component) {
        var serverAction = component.get("c.executeInForeground");
        var tx = component.get("v.transactionId");
        var hlp = component.getDef().getHelper();

        if (tx) {
            $A.setCurrentTransactionId(tx);
        }
        serverAction.setAbortable(true);
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "SUCCESS");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "ERROR");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "INCOMPLETE");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "ABORTED");

        $A.enqueueAction(serverAction);
    },
    sendNonAbortable : function(component) {
        var serverAction = component.get("c.executeInForeground");
        var tx = component.get("v.transactionId");
        var hlp = component.getDef().getHelper();

        if (tx) {
            $A.setCurrentTransactionId(tx);
        }
        serverAction.setAbortable(false);
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "SUCCESS");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "ERROR");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "INCOMPLETE");
        serverAction.setCallback(this, function(action) { hlp.insertResponse(component, action); }, "ABORTED");
        
        $A.enqueueAction(serverAction);
    },
})
