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

    // Keep list of MetricsService transactions to verify we're logging failed operations
    transactions: [],

    storageName: "crypto-failed-adapter",

    setUp: function(cmp) {
        var that = this;

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
        this.storage = $A.storageService.initStorage({
            name: this.storageName,
            maxSize: 32768,
            expiration: 2000,
            autoRefreshInterval: 3000,
            clearOnInit: false
        });

        $A.installOverride("MetricsService.transaction",
                function(overrideConfig, ns, name, config){
                    var transaction = {
                            ns: ns,
                            name: name,
                            config: config
                    };
                    that.transactions.push(transaction);
                },
                this);
    },

    testPutFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.put("hi", "bye");
               this.doFailedActionAndVerifyError(promise, "Error: CryptoAdapter '" + this.storageName + "' adapter failed to initialize");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("put");
           }
        ]
    },

    testGetFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.get("hi");
               this.doFailedActionAndVerifyError(promise, "Error: CryptoAdapter '" + this.storageName + "' adapter failed to initialize");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("get");
           }
        ]
    },

    testGetAllFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.getAll();
               this.doFailedActionAndVerifyError(promise, "Error: CryptoAdapter '" + this.storageName + "' adapter failed to initialize");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("getAll");
           }
        ]
    },

    testClearFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.clear();
               // All operations that go through the CryptoAdapter enqueue function will have the failure to initialize
               // error. clear() does not so has the error from the mock adapter implementation.
               this.doFailedActionAndVerifyError(promise, "Error: clear(): mock always fails");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("clear");
           }
        ]
    },

    testRemoveFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.remove("key");
               this.doFailedActionAndVerifyError(promise, "Error: CryptoAdapter '" + this.storageName + "' adapter failed to initialize");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("remove");
           }
        ]
    },

    doFailedActionAndVerifyError: function(promise, errorMessage) {
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
                    $A.test.assertEquals(errorMessage, error.toString(), "Unexpected error from CryptoAdapter");
                }
        );
    },

    /**
     * AuraStorage.js will log errors in it's promise reject handler for operations delegated to the underlying adapter.
     * We override the MetricsService API to capture the logs and verify them here. We check the 'name' and 'operation'
     * parameters of the transaction log since we can identify where the error is coming from with those 2 pieces of info.
     *
     * @param {String} operation The storage operation we are expecting to fail
     */
    verifyLogs: function(operation) {
        var found = false;
        this.transactions.forEach(function(transaction) {
            if (transaction["name"] === "errorStorage" && transaction["config"]["context"]["operation"] === operation) {
                found = true;
            }
        });
        $A.test.assertTrue(found, "Did not receive expected MetricsService log for failed " + operation + " operation");
    }
})