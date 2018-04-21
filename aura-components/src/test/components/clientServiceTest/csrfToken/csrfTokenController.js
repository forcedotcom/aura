({
    init: function(cmp) {
        if (cmp.get("v.getValueOnInit")) {
            $A.enqueueAction(cmp.get("c.getValue"));
        }
    },

    getValue : function(cmp) {
        var action = cmp.get("c.getBuffer");
        action.setStorable({
            refresh : cmp.get("v.refreshIntervalInSeconds")
        });
        action.setCallback(this, function(response){
            cmp.set("v.value", response.returnValue);
        });
        $A.enqueueAction(action);
    }
})
