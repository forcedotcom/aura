({
    init: function(cmp) {
        $A.enqueueAction(cmp.get("c.updateTokenOutput"));
        if (cmp.get("v.getValueOnInit")) {
            $A.enqueueAction(cmp.get("c.getValue"));
        }
    },
    
    updateTokenOutput : function(cmp) {
        var storage = $A.storageService.getStorage("actions");
        // key from AuraClientService.TOKEN_KEY
        var key = "$AuraClientService.token$";
        storage.adapter.getItems([key]).then(
            function(items) {
                if (items[key]) {
                    cmp.set("v.token", items[key].value.token);
                }
            },
            function() {
                cmp.set("v.token", "ERROR: failed to get token from storage");
            }
        );
    },
    
    getValue : function(cmp) {
        var action = cmp.get("c.getBuffer");
        action.setStorable({
            refresh : cmp.get("v.refreshIntervalInSeconds")
        });
        action.setCallback(this, function(response){
            cmp.set("v.value", response.returnValue);
            $A.enqueueAction(cmp.get("c.updateTokenOutput"));
        });
        $A.enqueueAction(action);
    }
})
