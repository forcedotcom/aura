({
    setStatus: function(cmp, status) {
        cmp.set("v.status", status);
        this.log(cmp, "\nStatus update: " + status);
    },

    log: function(cmp, log) {
        var l = cmp.get("v.log");
        l += log + "\n";
        cmp.set("v.log", l);
    },

    clearActionAndDefStorage: function(cmp) {
        // def store is not created until a dynamic def is received. if it doesn't exist
        // in aura storage service then create it, clear it (to clear the underlying persistent
        // store), then remove it.
        var defs = $A.storageService.getStorage("ComponentDefStorage");
        var defsCreated = false;
        if (!defs) {
            defsCreated = true;
            defs = $A.storageService.initStorage({
                name: "ComponentDefStorage",
                persistent: true,
                secure: false,
                maxSize: 442368,
                expiration: 10886400,
                debugLogging: true,
                clearOnInit: false
            });
        }

        return Promise.all([$A.storageService.getStorage("actions").clear(), defs.clear()])
            .then(
                function() {
                    if (defsCreated) {
                        return $A.storageService.deleteStorage("ComponentDefStorage");
                    }
                }
            )
            .then(
                function() {
                    cmp.helper.log(cmp, "Action and def storage cleared");
                },
                function(e) {
                    cmp.helper.log(cmp, "Error clearing action and def storage: " + e);
                }
            );
    }
})