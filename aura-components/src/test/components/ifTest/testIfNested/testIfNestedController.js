({
    edit : function(component, event, helper) {
        component.set("v.isEdit",true);
    },

    save : function(component, event, helper) {
        // The order of these is very important for the failing test.
        component.set("v.isSaving",true);
        component.set("v.isEdit",false);
        component.set("v.isSaving",false);

    }
})