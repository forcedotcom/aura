({
    init: function(cmp) {
        $A.storageService.CryptoAdapter.register();

        cmp._storage = $A.storageService.initStorage({
            name: cmp.get("v.storageName"),
            persistent: true,
            secure: cmp.get("v.secure"),
            maxSize: 32768,
            expiration: 2000,
            autoRefreshInterval: 3000,
            clearOnInit: false
        });
    }
})
