({
    triggerAction: function (cmp) {
        var action = $A.get("c.aura://ComponentController.getComponent");
        action.setParams({ name: "provider:cmpWithModel", attributes: { value: "test" } });
        action.setStorable();
        action.setCallback(this, function (action) {
            var r = action.getReturnValue();
            var btn = $A.createComponentFromConfig(r);

            console.log('DONE!', btn);
        });

        if (Aura.PrefetchActionLoader) {
            Aura.PrefetchActionLoader.enqueue([action]);
        } else {
            $A.enqueueAction(action);
        }
    }
})