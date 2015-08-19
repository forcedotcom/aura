({
    updateTextWithStringFromServerController: function(cmp, evt) {
        var a = cmp.get("c.getString");

        var params = evt.getParam('arguments');
        if(params && params.setStorableAction) {
            a.setStorable();
        }

        a.setCallback(this, function(result){
            if(result.getState() === "SUCCESS") {
                cmp.get("v.text", result.getReturnValue());
                cmp.set("v.actionDone", true);
                cmp.set("v.isTextFromCache", result.isFromStorage());
            } else if(state === "INCOMPLETE" || state === "ERROR") {
                throw new $A.auraError("Failed to get text from server: "+response.getError());
            }
        });
        $A.enqueueAction(a);
    }
})
