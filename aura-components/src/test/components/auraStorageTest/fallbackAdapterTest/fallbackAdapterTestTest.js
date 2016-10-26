({
    // When an adapter fails to initialize, AuraStorage falls back to the memory adapter
    setUp : function(cmp) {
        // setup mock to have the opposite of memory adapter characteristics: insecure, persistent
        var secure = false;
        var persistent = true;
        var FailInitAdapter = cmp.helper.lib.adapters.getAdapterThatFailsInitialization("mock", secure, persistent);
        $A.storageService.registerAdapter({
            "name": FailInitAdapter.NAME,
            "adapterClass": FailInitAdapter,
            "secure": secure,
            "persistent": persistent
        });
        $A.installOverride("StorageService.selectAdapter", function(){ return FailInitAdapter.NAME; }, this);

        this.storage =  $A.storageService.initStorage({
            name: "alternateAdapterTest",
            maxSize: 32768,
            expiration: 2000,
            autoRefreshInterval: 3000,
            debugLogging: true
        });

        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("alternateAdapterTest"); });
    },

    /**
     * Verifies when an adapter fails initialization that AuraStorage falls back to the memory adapter
     */
    testFailedAdapterInitializationFallsbackToMemory: {
        test: function(cmp) {
            var that = this;
            // perform an operation that won't complete until initialization (and fallback) is complete
            return this.storage.get("any key")
                .then(function() {
                    $A.test.assertEquals("memory", that.storage.getName(), "Should have fallen back to memory adapter");
                });
        }
    },

    /**
     * Verifies after AuraStorage falls back to the memory adapter that a basic set + get of an object works.
     */
    testGetBasicObjectValue: {
        test: function(cmp) {
            var that = this;
            return cmp.helper.lib.storageTest.testGetBasicObjectValue(cmp, this.storage)
                .then(function() {
                    $A.test.assertEquals("memory", that.storage.getName(), "Should have fallen back to memory adapter");
                });
        }
    },

    /**
     * Verifies after AuraStorage falls back to the memory adapter that a basic set + get of an array works.
     */
    testGetBasicArrayValue: {
        test: function(cmp) {
            var that = this;
            return cmp.helper.lib.storageTest.testGetBasicArrayValue(cmp, this.storage)
                .then(function() {
                    $A.test.assertEquals("memory", that.storage.getName(), "Should have fallen back to memory adapter");
                });
        }
    }
})
