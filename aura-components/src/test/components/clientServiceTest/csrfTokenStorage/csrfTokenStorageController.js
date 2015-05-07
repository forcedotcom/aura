({
    init: function(cmp) {
        var storage = $A.storageService.getStorage("actions");
        storage.get("$AuraClientService.priv$").then(
            function(value) {
                if(value && value.value) {
                    cmp.set("v.token", value.value.token);
                }
            }, function() {
                cmp.set("v.token", "ERROR: failed to get token from storage");
            });
    }
})