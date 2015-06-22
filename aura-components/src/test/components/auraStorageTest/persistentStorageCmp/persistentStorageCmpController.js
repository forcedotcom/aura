({
    init: function(cmp) {
        var secure = cmp.get("v.secure");
        cmp._storage = $A.storageService.initStorage("persistentStorageCmp", true, secure, 32768, 2000, 3000, true, false);
    },

    resetStorage: function(cmp) {
        cmp.set("v.status", "Resetting");
        debugger;
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
            .then(function(item) {
                if (item === undefined) {
                    cmp.set("v.return", "undefined");
                } else {
                    cmp.set("v.return", item.value);
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
        cmp._storage.put(key, value)
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