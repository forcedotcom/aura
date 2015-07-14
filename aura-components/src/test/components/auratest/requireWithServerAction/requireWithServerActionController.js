({
    updateVersionFromServerController: function(cmp, evt, helper) {
        var a = cmp.get("c.getContextAccessVersion");
        a.setCallback(this, function(action){
            if(action.getState() === "SUCCESS") {
                helper.updateVersion(cmp, action.returnValue);
                cmp.set("v.actionDone", true);
            } else if(state === "INCOMPLETE" || state === "ERROR") {
                $A.test.fail("Failed to get version from server: "+response.getError());
            }
        });
        $A.enqueueAction(a);
    },

    updateVersionFromClientController: function(cmp, evt, helper) {
        helper.updateVersion(cmp, cmp.getVersion());
    },

    fireVersionEvent: function(cmp) {
        cmp.get("e.versionEvt").fire();
    }
})
