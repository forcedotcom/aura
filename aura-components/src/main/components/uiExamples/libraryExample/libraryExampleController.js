({
    initialize: function(component, event, helper) {
        component.set("v.message", helper.getLoadedScriptMessage());
    }
})