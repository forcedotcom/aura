({
    /**
     * CryptoAdapter delegates its storage operations to an underlying adapter: IndexedDB. If
     * IndexedDB successfully initializes but then fails all operations, CryptoAdapter will fail
     * all operations.
     *
     * Note that this is different than IndexedDB failing all operations including initialization.
     * That scenario results in AuraStorage performing a fallback from CryptoAdapter to MemoryAdapter.
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

        // override IndexedDBAdapter with a mock that:
        // a. lets CryptoAdapter complete its initialization
        // b. then fails for all operations
        this.operationCount = 4;
        var FailingAdapter = cmp.helper.lib.adapters.getAdapterThatFailsAfterNOperations("mock", false, false, this.operationCount);
        $A.storageService.getAdapterConfig("indexeddb").adapterClass = FailingAdapter;
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

    testSetFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.set("hi", "bye");
               this.doFailedActionAndVerifyError(promise, "Error: setItems(): mock fails after " + this.operationCount + " operations");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("setAll");
           }
        ]
    },

    testGetFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.get("hi");
               this.doFailedActionAndVerifyError(promise, "Error: getItems(): mock fails after " + this.operationCount + " operations");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("getAll");
           }
        ]
    },

    testGetAllFails: {
        test: [
           function doFailedStorageOperationAndVerifyError(cmp) {
               var storage = $A.storageService.getStorage(this.storageName);
               var promise = storage.getAll();
               this.doFailedActionAndVerifyError(promise, "Error: getItems(): mock fails after " + this.operationCount + " operations");
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
               this.doFailedActionAndVerifyError(promise, "Error: clear(): mock fails after " + this.operationCount + " operations");
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
               this.doFailedActionAndVerifyError(promise, "Error: removeItems(): mock fails after " + this.operationCount + " operations");
           },
           function verifyExpectedLogs(cmp) {
               this.verifyLogs("removeAll");
           }
        ]
    },

    doFailedActionAndVerifyError: function(promise, errorMessage) {
        var completed = false;
        var error;
        promise.then(
            undefined, // Resolve handler should not be called
            function(err) {
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
     * AuraStorage.js will log errors in its promise reject handler for operations delegated to the underlying adapter.
     * We override the MetricsService API to capture the logs and verify them here. We check the 'name' and 'operation'
     * parameters of the transaction log since we can identify where the error is coming from with those 2 pieces of info.
     *
     * @param {String} operation The storage operation we are expecting to fail
     */
    verifyLogs: function(operation) {
        var found = false;
        this.transactions.forEach(function(transaction) {
            if (transaction["name"] === "error:storage" && transaction["config"]["context"]["attributes"]["operation"] === operation) {
                found = true;
            }
        });
        $A.test.assertTrue(found, "Did not receive expected MetricsService log for failed " + operation + " operation");
    }
})
