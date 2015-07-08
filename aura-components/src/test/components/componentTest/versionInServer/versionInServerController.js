({
    updateVersionFromCreatedComponent: function(cmp, evt, helper) {
        $A.createComponent("auratest:requireWithServerAction", null, function(newCmp) {
                newCmp.updateVersionFromClientController();
                helper.updateVersion(cmp, newCmp.get("v.version"));
                cmp.set("v.actionDone", true);
            });
    },

    updateVersionFromSameNamespaceServerController: function(cmp, evt, helper) {
        var action = cmp.get("c.getContextAccessVersion");
        action.setCallback(this, function(action){
            if(action.getState() === "SUCCESS") {
                helper.updateVersion(cmp, action.returnValue);
                cmp.set("v.actionDone", true);
            }
        });
        $A.enqueueAction(action);
    }
})
