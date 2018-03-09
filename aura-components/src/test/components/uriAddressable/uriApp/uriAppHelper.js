({
    createComponentAction: function(cmp) {
        var action = $A.get("c.aura://ComponentController.getComponent");
        var desc = cmp.get("v.dynamicallyCreatedDescriptor");
        var value = cmp.get("v.dynamicallyCreatedValue");

        action.setParams({
            "name" : desc,
            "attributes": {value: value}
        });
        action.setCallback(this, function(a) {
            var c = a.getReturnValue();
            var cc = $A.createComponentFromConfig(c);
            cmp.set('v.dynamic2', cc);
        });

        $A.enqueueAction(action);
    }
})
