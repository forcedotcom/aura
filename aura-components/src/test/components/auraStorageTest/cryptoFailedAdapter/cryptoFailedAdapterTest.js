({
    /**
     * CryptoAdapter delegates its storage operations to an underlying adapter, IndexedDB by default and MemoryAdapter
     * as a fallback. This class stubs in an underlying adapter that fails on all operations.
     * 
     * A real world scenario that this emulates is Firefox in private browsing mode.
     */

    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // threadHostile - test modifies/deletes the persistent database.
    // UnAdaptableTest - must be run on https or localhost otherwise CryptoAdapter will not register
    labels : [ "threadHostile", "UnAdaptableTest" ],

    setUp: function(cmp) {
        cmp.__storageName = "crypto-failed-adapter";

        // a storage adapter that fails on all operations
        var MockStorageAdapter = function MockStorageAdapter() {};
        MockStorageAdapter.NAME = "mock";
        MockStorageAdapter.prototype.getName = function() { return MockStorageAdapter.NAME; };

        MockStorageAdapter.prototype.getSize = function() {
            return Promise.reject(new Error("getSize(): mock always fails"));
        };

        MockStorageAdapter.prototype.getItem = function(key) {
            return Promise.reject(new Error("getItem(): mock always fails"));
        };

        MockStorageAdapter.prototype.getAll = function(key) {
            return Promise.reject(new Error("getAll(): mock always fails"));
        };

        MockStorageAdapter.prototype.setItem = function(key, item) {
            return Promise.reject(new Error("setItem(): mock always fails"));
        };

        MockStorageAdapter.prototype.removeItem = function(key) {
            return Promise.reject(new Error("removeItem(): mock always fails"));
        };

        MockStorageAdapter.prototype.clear = function(key) {
            return Promise.reject(new Error("clear(): mock always fails"));
        };

        MockStorageAdapter.prototype.getExpired = function() {
            return Promise.reject(new Error("getExpired(): mock always fails"));
        };

        MockStorageAdapter.prototype.clearOnInit = function() {
            return Promise.reject(new Error("clearOnInit(): mock always fails"));
        };

        MockStorageAdapter.prototype.deleteStorage = function() {
            return Promise.reject(new Error("deleteStorage(): mock always fails"));
        };

        // Override IndexedDB adapter at the StorageService layer so CryptoAdapter uses our test mock storage instead
        // of the real IndexedDBAdapter.
        $A.storageService.getAdapterConfig("indexeddb").adapterClass = MockStorageAdapter;

        $A.installOverride("StorageService.selectAdapter", function(){ return "crypto" }, this); 
        this.storage = $A.storageService.initStorage(
                cmp.__storageName,
                true,   // secure
                true,   // persistent
                32768,
                2000,
                3000,
                true,   // debug logging
                false);  // clear on init
    },

    testPutFails: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage(cmp.__storageName);
            var promise = storage.put("hi", "bye");
            this.doFailedAdapterTest(promise);
        }
    },
    

    testGetFails: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage(cmp.__storageName);
            var promise = storage.get("hi");
            this.doFailedAdapterTest(promise);
        }
    },

    testGetAllFails: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage(cmp.__storageName);
            var promise = storage.getAll();
            this.doFailedAdapterTest(promise);
        }
    },

    doFailedAdapterTest: function(promise) {
        var completed = false;
        var error;
        promise.then(function(){
                // Resolve handler should not be called
            }, function(err) {
                // Save error and let promise return to success state for test to verify error
                error = err;
            })
            .then(function(){
                completed = true;
            });

        $A.test.addWaitFor(
                true,
                function() {
                    return completed;
                },
                function(cmp) {
                    $A.test.assertDefined(error, "The reject handler for the storage operation was never called");
                    $A.test.assertEquals(this.getErrorMessage(cmp), error.toString(), "Unexpected error from CryptoAdapter");
                }
        );
    },

    /**
     * Since CryptoAdapter fails to make it past the initialization sequence when the underlying adapter fails out,
     * this same error message should be returned for all get/put operations.
     */
    getErrorMessage: function(cmp) {
        return "Error: CryptoAdapter '" + cmp.__storageName + "' adapter failed to initialize";
    }
})