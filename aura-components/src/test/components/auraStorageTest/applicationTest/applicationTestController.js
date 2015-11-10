({
    init: function(cmp) {
        cmp._storage = $A.storageService.getStorage('actions');
        cmp._key = 'aura://ComponentController/ACTION$getApplication:{"chainLoadLabels":true,"name":"auraStorageTest:applicationTest"}';

        // The test relies on the bootstrap action being saved to storage before it saves it's own action to storage.
        // Since the test does not own the bootstrap action it cannot explicitly wait for it (and any potential refresh)
        // to complete, so we wait for decode to be called where we at least know it's returned from the server.
        var config = $A.test.addPreDecodeCallback(function(response) {
            if (response.responseText.indexOf("aura://ComponentController/ACTION$getApplication") > 0) {
                cmp.set("v.actionComplete", true);
            }
            return response;
        });
        $A.test.addCleanup(function(){ $A.test.removePreDecodeCallback(config) });
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
                    'creationPath': "/*[0]",
                    'forceRefresh': 'yesplease' // make sure returnValue is different to force refresh
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
    },

    clearStoredAction: function(cmp) {
        cmp._storage.remove(cmp._key);
    }
})
