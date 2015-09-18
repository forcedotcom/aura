({
    /**
     * Fire an action to set the value of a GVP on the server.
     */
    updateGvpValue: function(cmp, event, helper) {
        var action = cmp.get("c.setContextVPValue");
        action.setParams(event.getParam("arguments"));
        $A.enqueueAction(action);
    }
})