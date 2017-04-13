({
    addItemToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        if (!!cmp.get("v.partitionName")){
            $A.storageService.setPartition(cmp.get("v.partitionName"));
        }
        var storage = $A.storageService.initStorage({
            name: "partitionTestCmp",
            persistent: true,
            secure: false,
            maxSize: 1024
        });
        storage.set(cmp.get("v.storageItemKey"), cmp.get("v.storageItemValue"))
            .then(function() {
                cmp.set("v.status", "Done Adding");
            })
            .catch(function(error) { 
                cmp.set("v.status", "Error adding: " + error)
            });
    },

    getAdapterFromStorage: function(cmp) {
        cmp.set("v.status", "Getting");
        var storage = $A.storageService.getStorage("partitionTestCmp");
        storage.get("key")
            .then( function(item) {
                cmp.set("v.item", item);
                cmp.set("v.objectStoreNames", storage.adapter.db.objectStoreNames);
                cmp.set("v.status", "Done Getting");
            })
            .catch(function(error) { 
                cmp.set("v.status", "Error getting: " + error)
            });

    },

    deleteStorage: function(cmp) {
        cmp.set("v.status", "Deleting");
        $A.storageService.deleteStorage("partitionTestCmp")
            .then(function() {
                cmp.set("v.status", "Done Deleting");
            })
            .catch(function(error) {
                cmp.set("v.status", "Failed to delete storage: " + error);
            });
    }
})