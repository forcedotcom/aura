({
    addItemToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        $A.storageService.setIsolation(cmp.get("v.isolationKey"));
        var storage = $A.storageService.initStorage({
            name: "getAllIsolation",
            persistent: true,
            secure: false,
            maxSize: 1024
        });
        storage.set("keyA",cmp.get("v.storageItemValue"))
            .then(function() {
                cmp.set("v.status", "Done Adding");
            })
            ["catch"](function(error) { cmp.set("v.status", "Error adding: " + error)});
    },

    /**
     * Get all items from storage and set to v.items.
     *
     * Must be called after addItemToStorage since that is what initializes the storage.
     */
    getAllFromStorage: function(cmp) {
        cmp.set("v.status", "Getting");
        var storage = $A.storageService.getStorage("getAllIsolation");
        storage.getAll()
            .then(function(items) {
                cmp.set("v.items", items);
                cmp.set("v.status", "Done Getting");
            })
            ["catch"](function(error) { cmp.set("v.status", "Error adding: " + error)});
    }
})