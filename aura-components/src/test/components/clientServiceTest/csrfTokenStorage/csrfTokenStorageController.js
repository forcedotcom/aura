({
    init: function(cmp) {
        var storage = $A.storageService.getStorage("actions");
        // TODO - straight against adapter so must use value.value
        storage.adapter.getItem("$AuraClientService.token$").then(
            function(item) {
                if(item && item.value && item.value.token) {
                    cmp.set("v.token", item.value.token);
                }
            }, function() {
                cmp.set("v.token", "ERROR: failed to get token from storage");
            });
    }
})