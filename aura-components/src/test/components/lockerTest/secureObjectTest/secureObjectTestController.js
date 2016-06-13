({
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
    }
})