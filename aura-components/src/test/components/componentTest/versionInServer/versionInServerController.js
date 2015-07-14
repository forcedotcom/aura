({
    updateVersionFromCreatedComponent: function(cmp, evt, helper) {
        $A.createComponent("auratest:requireWithServerAction", null, function(newCmp) {
                newCmp.updateVersionFromClientController();
                helper.updateVersion(cmp, newCmp.get("v.version"));
                cmp.set("v.actionDone", true);
            });
    },

    updateVersionFromCreatedComponentServerController: function(cmp, evt, helper) {
        $A.createComponent("auratest:requireWithServerAction", null, function(newCmp) {
                cmp.set("v.newComponent", newCmp);
                newCmp.updateVersionFromServerController();
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
