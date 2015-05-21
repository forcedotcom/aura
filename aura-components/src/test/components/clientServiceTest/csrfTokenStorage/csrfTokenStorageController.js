({
    init: function(cmp) {
        var storage = $A.storageService.getStorage("actions");
        storage.adapter.getItem("$AuraClientService.token$").then(
            function(value) {
                if(value && value.token) {
                    cmp.set("v.token", value.token);
                }
            }, function() {
                cmp.set("v.token", "ERROR: failed to get token from storage");
            });
    }
})