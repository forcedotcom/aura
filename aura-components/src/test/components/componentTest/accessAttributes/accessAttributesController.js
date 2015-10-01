({
    globalMethod: function(component, event, helper) {
        component.set("v.output", "globalMethod");
    },

    publicMethod: function(component, event, helper) {
        component.set("v.output", "publicMethod");
    },

    internalMethod: function(component, event, helper) {
        component.set("v.output", "internalMethod");
    },

    privateMethod: function(component, event, helper) {
        component.set("v.output", "privateMethod");
    }
})