({
    init : function(component) {
        var obj = {
                value1: '',
                sub: {
                    value2:''
                }
        };
        component.set('v.wrapUnwrapTestObj', obj);
    },

    createComponent : function(component, event, helper) {
        $A.createComponent("aura:text", { value: "Instance #" + helper._count++ }, function(cmp) {
            var content = component.find("content");
            var body = content.get("v.body");
            body.push(cmp);
            content.set("v.body", body);
            helper._createCmpCompletionCount++;
        });
    },

    deleteLastComponent : function(component, event, helper) {
        var content = component.find("content");
        var body = content.get("v.body");
        body.pop();
        content.set("v.body", body);
        helper._deleteLastComponentCount++;
    },

    deleteFirstComponent : function(component, event, helper) {
        var content = component.find("content");
        var body = content.get("v.body");
        body.shift();
        content.set("v.body", body);
        helper._deleteFirstComponentCount++;
    },

    checkWrapUnwrapObject: function(component) {
        var testUtils = component.get("v.testUtils");
        var obj = component.get("v.wrapUnwrapTestObj");
        testUtils.assertEquals("Value 1", obj.value1, "Unexpected value after object has been wrapped/unwrapped in SecureObject");
        testUtils.assertEquals("Value 2", obj.sub.value2, "Unexpected nested value after object has been wrapped/unwrapped in SecureObject");
    },

    setWrapUnwrapObject: function(component) {
        component.find("facet").setValues();
    }
})