({
    init: function(cmp) {
        cmp._storage = $A.storageService.getStorage('actions');
    },

    handleRefreshed: function(cmp) {
        cmp.set("v.refreshed", "YES");
    },

    addToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        cmp._storage.put(
            'aura://ComponentController/ACTION$getApplication:{"name":"auraStorageTest:applicationTest"}',
            {
                'components': [], // components is undefined instead is real response
                'returnValue': {
                    'componentDef': "markup://auraStorageTest:applicationTest",
                    'creationPath': "/*[0]"
                },
                'storage': {
                    'created': new Date().getTime()
                },
                state: 'SUCCESS'
            })
            .then(function(){
                $A.log("Put stale response complete");
                cmp.set("v.status", "Done Adding");
            }, function() {
                cmp.set("v.status", "Error during add");
            });
    }
})