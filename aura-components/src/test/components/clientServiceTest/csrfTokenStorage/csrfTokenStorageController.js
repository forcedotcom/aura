({
    init: function(cmp) {
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
            });
    }
})
