({
    init: function(cmp) {
        var moduleDescriptor = cmp.get('v.moduleDescriptor');
        var action = cmp.get("c.getModuleAttributes");
        action.setParam("module", moduleDescriptor);
        action.setCallback(this, function(response) {
            cmp.set("v.attributeList", response.getReturnValue());
        });
        $A.enqueueAction(action);
    }
})