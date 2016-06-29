({
    init: function(cmp) {
        var secure = cmp.get("v.secure");
        $A.storageService.CryptoAdapter.register();
        cmp._storage = $A.storageService.initStorage({
            name: "persistentStorageCmp",
            persistent: true,
            secure: secure,
            maxSize: 32768,
            expiration: 2000,
            autoRefreshInterval: 3000,
            clearOnInit: false
        });
    },

    // TODO: remove the below funtions. We can directly call
    // the functions through cmp._storage in tests.
    // The functions are used in cryptoStorageTest

    resetStorage: function(cmp) {
        cmp.set("v.status", "Resetting");
        cmp._storage.clear()
            .then(function() {
                cmp.set("v.status", "Done Resetting");
            }, function(error) {
                cmp.set("v.status", "Error during reset: " + error);
            });
    },

    getFromStorage: function(cmp) {
        cmp.set("v.status", "Getting");
        var key = cmp.get("v.key");
        cmp._storage.get(key)
            .then(function(value) {
                if (value === undefined) {
                    cmp.set("v.return", "undefined");
                } else {
                    cmp.set("v.return", value);
                }
                cmp.set("v.status", "Done Getting");
            }, function(error) {
                cmp.set("v.status", "Error during get: " + error);
            });
    },

    addToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        var key = cmp.get("v.key");
        var value = cmp.get("v.value");
        cmp._storage.set(key, value)
            .then(function(){
                cmp.set("v.status", "Done Adding");
            }, function(error) {
                cmp.set("v.status", "Error during add: " + error);
            });
    },

    deleteStorage: function(cmp) {
        cmp.set("v.status", "Deleting storage");
        $A.storageService.deleteStorage("persistentStorageCmp")
            .then(function() {
                cmp.set("v.status", "Done Deleting");
            }, function(error) {
                cmp.set("v.status", "Error during delete of storage: " + error);
            });
    }
})
