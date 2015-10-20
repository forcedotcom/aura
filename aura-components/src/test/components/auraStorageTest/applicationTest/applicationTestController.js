({
    init: function(cmp) {
        cmp._storage = $A.storageService.getStorage('actions');
        cmp._key = 'aura://ComponentController/ACTION$getApplication:{"chainLoadLabels":true,"name":"auraStorageTest:applicationTest"}';
    },

    handleRefreshed: function(cmp) {
        cmp.set("v.refreshed", "YES");
    },

    addToStorage: function(cmp) {
        cmp.set("v.status", "Adding");
        cmp._storage.put(cmp._key,
            {
                'components': [], // components is undefined instead is real response
                'returnValue': {
                    'componentDef': { "descriptor" : "markup://auraStorageTest:applicationTest"},
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
