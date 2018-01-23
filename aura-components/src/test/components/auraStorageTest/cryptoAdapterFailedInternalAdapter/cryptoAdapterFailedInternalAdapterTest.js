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
    browsers:["-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // threadHostile - test modifies/deletes the persistent database.
    // UnAdaptableTest - must be run on https or localhost otherwise CryptoAdapter will not register
    labels : [ "threadHostile", "UnAdaptableTest" ],

    // Keep list of MetricsService transactions to verify we're logging failed operations
    transactions: [],

    STORAGE_NAME: "crypto-failed-adapter",

    setUp: function(cmp) {
        var that = this;

        // override IndexedDBAdapter with a mock that:
        // a. lets CryptoAdapter complete its initialization
        // b. then fails for all operations
        this.operationCount = 4;
        this.transactions = [];

        var FailingAdapter;
        if(cmp.get("v.failedAdapterType") === "initialization") {
            FailingAdapter = cmp.helper.lib.adapters.getAdapterThatFailsInitialization("mock", false, false);
        } else {
            FailingAdapter = cmp.helper.lib.adapters.getAdapterThatFailsAfterNOperations("mock", false, false, this.operationCount);
        }

        $A.storageService.getAdapterConfig("indexeddb").adapterClass = FailingAdapter;
        $A.installOverride("StorageService.selectAdapter", function(){ return "crypto" }, this);

        this.storage = $A.storageService.initStorage({
            name: this.STORAGE_NAME,
            maxSize: 32768,
            expiration: 2000,
            autoRefreshInterval: 3000,
            clearOnInit: false,
            debugLogging: true
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

    testInternalAdapterInitFails: {
        attributes: {failedAdapterType: "initialization"},
        test: function(cmp) {
            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.set("hi", "bye")
                .then(
                    function() {
                        $A.test.assertEquals("memory", storage.adapter.getName(),
                            "adapter should fall back to MemoryAdapter when internal adapter fails to initialize");
                        that.verifyLogs("adapterReady");
                    }
                );
        }
    },

    testSetFails: {
        test: function(cmp) {
            var expectedMessage = "Error: setItems(): mock fails after " + this.operationCount + " operations";

            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.set("hi", "bye")
                .then(
                    function() {
                        $A.test.fail("set() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                        that.verifyLogs("setAll");
                    }
                );
        }
    },

    testGetFails: {
        test: function(cmp) {
            var expectedMessage = "Error: getItems(): mock fails after " + this.operationCount + " operations";

            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.get("hi")
                .then(
                    function() {
                        $A.test.fail("get() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                        that.verifyLogs("getAll");
                    }
                );
       }
    },

    testGetAllFails: {
        test: function(cmp) {
            var expectedMessage = "Error: getItems(): mock fails after " + this.operationCount + " operations";

            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.getAll()
                .then(
                    function() {
                        $A.test.fail("getAll() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                        that.verifyLogs("getAll");
                    }
                );
       }
    },

    testClearFails: {
        test: function(cmp) {
            var expectedMessage = "Error: clear(): mock fails after " + this.operationCount + " operations";

            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.clear()
                .then(
                    function() {
                        $A.test.fail("clear() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                        that.verifyLogs("clear");
                    }
                );
        }
    },

    testRemoveFails: {
        test: function(cmp) {
            var expectedMessage = "Error: removeItems(): mock fails after " + this.operationCount + " operations";

            var that = this;
            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.remove("key")
                .then(
                    function() {
                        $A.test.fail("remove() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                        that.verifyLogs("removeAll");
                    }
                );
        }
    },

    testGetSizeFails: {
        test: function(cmp) {
            var expectedMessage = "Error: getSize(): mock fails after " + this.operationCount + " operations";

            var storage = $A.storageService.getStorage(this.STORAGE_NAME);
            return storage.getSize()
                .then(
                    function() {
                        $A.test.fail("getSize() should return a rejected promise as test setup");
                    },
                    function(error) {
                        $A.test.assertEquals(expectedMessage, error.toString(), "Unexpected error from CryptoAdapter");
                    }
                );
        }
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
        $A.test.assertTrue(found, "Did not receive expected MetricsService log for failed " + operation + " operation: " + JSON.stringify(this.transactions));
    }
})
