({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    setUp : function(cmp) {
        cmp._storageLib = cmp.helper.storageLib.storageTest;
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;

        $A.installOverride("StorageService.selectAdapter", function(){ return "indexeddb" }, this);
        this.storage = $A.storageService.initStorage({
            name: "browserdb",
            maxSize: 32768,
            expiration: 2000,
            debugLogging: true,
            clearOnInit: true
        });

       $A.test.addCleanup(function(){ this.deleteStorage("browserdb"); }.bind(this));
    },

    tearDown : function(cmp) {
        // verify adapter in tear down so any adapter fallback would've occurred
        $A.test.assertEquals("indexeddb", this.storage.getName(), "IndexedDBAdapter not used in test. Did IndexedDBAdapter fail initialization and trigger adapter fallback?");
    },

    deleteStorage: function(storageName) {
        var completed = false;

        $A.storageService.deleteStorage(storageName)
            .then(function() {completed = true;})
            .catch(function(e) {
                var msg = "Failed to delete storage [" + storageName + "] :" + e.toString();
                $A.test.fail(msg);
            });

        $A.test.addWaitFor(true, function() {return completed;});
    },

    testSizeInitial: {
        test: function(cmp) {
            return cmp._storageLib.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp._storageLib.testGetName(cmp, this.storage, "indexeddb");
        }
    },

    testGetMaxSize:{
        test:function(cmp){
            cmp._storageLib.testGetMaxSize(this.storage, 32);
        }
    },

    testEmptyStringKey: {
        test: function(cmp) {
            return cmp._storageLib.testEmptyStringKey(cmp, this.storage);
        }
    },

    testGetNullValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetNullValue(cmp, this.storage);
        }
    },

    testGetUndefinedValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetUndefinedValue(cmp, this.storage);
        }
    },

    testGetBooleanTrueValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetBooleanTrueValue(cmp, this.storage);
        }
    },

    testGetZeroValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetZeroValue(cmp, this.storage);
        }
    },

    testGetSimpleStringValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetSimpleStringValue(cmp, this.storage);
        }
    },

    testGetEmptyObjectValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetEmptyObjectValue(cmp, this.storage);
        }
    },

    testGetBasicObjectValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetBasicObjectValue(cmp, this.storage);
        }
    },

    testGetEmptyArrayValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetEmptyArrayValue(cmp, this.storage);
        }
    },

    testGetBasicArrayValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetBasicArrayValue(cmp, this.storage);
        }
    },

    testGetBigArrayValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetBigArrayValue(cmp, this.storage);
        }
    },

    testGetMultiByteStringValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetMultiByteStringValue(cmp, this.storage);
        }
    },

    testCacheMiss: {
        test: function(cmp) {
            return cmp._storageLib.testCacheMiss(cmp, this.storage);
        }
    },

    testSetItemUnderMaxSize : {
        test : [function(cmp) {
            return cmp._storageLib.testSetItemUnderMaxSize(cmp, this.storage, "Item smaller than size limit");
        }]
    },

    testSetItemOverMaxSize : {
        test : function(cmp) {
            return cmp._storageLib.testSetItemOverMaxSize(cmp, this.storage, "Item larger than size limit");
        }
    },

    testGetAll: {
        test: function(cmp) {
            return cmp._storageLib.testGetAll(cmp, this.storage);
        }
    },

    testReplaceExistingWithEntryTooLarge: {
        test: function(cmp) {
            var maxSize = 5120;
            cmp._storage = $A.storageService.initStorage({
                name: "browserdb-testReplaceExistingWithEntryTooLarge",
                maxSize: maxSize,
                expiration: 2000,
                debugLogging: true
            });
            $A.test.addCleanup(function(){ this.deleteStorage("browserdb-testReplaceExistingWithEntryTooLarge"); }.bind(this));

            return cmp._storageLib.testReplaceExistingWithEntryTooLarge(cmp, cmp._storage);
        }
    },

    testStorageInfo: {
        test: function(cmp) {
            return cmp._storageLib.testStorageInfo(this.storage, true, false);
        }
    },

    // cyclic objects are supported by IndexedDB adapter unlike all other adapters
    testCyclicObject:{
        test:function(cmp){
            var stuff = { "a": 2 };
            stuff["b"] = stuff;

            var that = this;
            return this.storage.set("testCyclicObject", stuff)
                .then(function() { return that.storage.get("testCyclicObject"); })
                .then(
                    function(value) {
                        $A.test.assertEquals(2, value["a"], "testCyclicObject: constant is wrong");
                        $A.test.assertEquals(value["b"], value, "testCyclicObject: looped value should be defined");
                    },
                    function(e) {
                        throw new Error("Cyclic object set/get failed: " + e.message);
                    }
                );
        }
    },

    testModifyObject:{
        test:function(cmp){
            return cmp._storageLib.testModifyObject(cmp, this.storage);
        }
    },

    testModifyGetAllObject:{
        test:function(cmp){
            return cmp._storageLib.testModifyGetAllObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            return cmp._storageLib.testUpdate(cmp, this.storage);
        }
    },

    testOverflow: {
        test:function(cmp) {
            // Due to differences in size calculation between adapters, pass in a storage with the correct size to
            // fill up the storage after 5 entries of a 512 character string.
            cmp._storage = $A.storageService.initStorage({
                name: "browserdb-testOverflow",
                maxSize: 5000,
                expiration: 2000,
                debugLogging: true
            });
            $A.test.addCleanup(function(){ this.deleteStorage("browserdb-testOverflow"); }.bind(this));

            return cmp._storageLib.testOverflow(cmp, cmp._storage);
        }
    },

    testClear:{
        test:function(cmp){
            return cmp._storageLib.testClear(cmp, this.storage);
        }
    },

    testBulkGetInnerItemNotInStorage: {
        test: function(cmp) {
            return cmp._storageLib.testBulkGetInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkGetOuterItemsNotInStorage: {
        test: function(cmp) {
            return cmp._storageLib.testBulkGetOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    testBulkSet: {
        test: function(cmp) {
            return cmp._storageLib.testBulkSet(cmp, this.storage);
        }
    },

    testBulkSetLargerThanMaxSize: {
        test: function(cmp) {
            // Due to differences in size calculation between adapters, pass in a storage with the correct size to
            // fill up the storage after 5 entries of a 512 character string.
            var storage = $A.storageService.initStorage({
                name: "browserdb-testBulkSetLargerThanMaxSize",
                maxSize: 5000,
                expiration: 2000,
                debugLogging: true
            });
            $A.test.addCleanup(function(){ this.deleteStorage("browserdb-testBulkSetLargerThanMaxSize"); }.bind(this));
            return cmp._storageLib.testBulkSetLargerThanMaxSize(cmp, storage);
        }
    },

    testBulkRemoveInnerItemNotInStorage: {
        test: function(cmp) {
            return cmp._storageLib.testBulkRemoveInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkRemoveOuterItemsNotInStorage: {
        test: function(cmp) {
            return cmp._storageLib.testBulkRemoveOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    /**
     * Tests that verify behavior specific to IndexedDB.
     */

    /**
     * Verify trying to store an Error object errors out.
     */
    testSetErrorValueFails: {
        test: function(cmp) {
            var that = this;
            return this.storage.set("testErrorValue", new Error("hello, error"))
                .then(function() {
                    $A.test.fail("Expected set() to fail but it succeeded");
                }, function(e) {
                    cmp._storageLib.appendLine(cmp, e.message);
                })
                .then(function() { return that.storage.get("testErrorValue"); })
                .then(
                    function(value){
                        $A.test.assertUndefined(value, "Expected undefined because set() failed");
                    }
                );
        }
    },

    // function values are not supported by IndexedDB adapter unlike all other adapters
    testSetFunctionValueFails: {
        test: function(cmp) {
            var that = this;
            return this.storage.set("testFunctionValue", function(x){})
                .then(
                    function() {
                        $A.test.fail("Expected set() to fail but it succeeded");
                    },
                    function(e) {
                        cmp._storageLib.appendLine(cmp, e.message);
                    }
                )
                .then(function() { return that.storage.get("testFunctionValue"); })
                .then(
                    function(value){
                        $A.test.assertUndefined(value, "Expected undefined because set() failed");
                    }
                );
        }
    },

    testGetSize:{
        test:[function(cmp) {
            cmp._storage = $A.storageService.initStorage({
                name: "browserdb-testGetSize",
                maxSize: 32768,
                expiration: 2000,
                debugLogging: true
            });
            $A.test.addCleanup(function(){ this.deleteStorage("browserdb-testGetSize"); }.bind(this));
            cmp._failTest = function(error) { cmp._storageLib.failTest(cmp, error); };
            cmp._append = function(string) { cmp._storageLib.appendLine(cmp, string); };
        }, function(cmp){
            return cmp._storage.set("testGetSize.key1", new Array(1024).join("x"))  // 1kb
                .then(function() { return cmp._storage.get("testGetSize.key1"); })
                .then(function(value) { $A.test.assertDefined(value, "Fail item."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(result) { cmp._append("result length = "+Object.keys(result).length); return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 2 && size < 2.2, "testGetSize: Expected size of 2, but got " + size);
                });
        }, function(cmp){
            //Two value to see that size is recalculated
            return cmp._storage.set("testGetSize.key2" , new Array(3072).join("y")) //5kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(value) { $A.test.assertDefined(value, "testGetSize: Fail - item undefined."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 8 && size < 8.3, "testGetSize: Expected size of 8, but got " + size);
                });
        }, function(cmp){
            // Overwrite previous key2
            // Careful... this does not calculate size correctly.
            return cmp._storage.set("testGetSize.key2" , new Array(1024).join("z")) //1kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(value) { $A.test.assertDefined(value); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 4 && size < 4.3, "testGetSize: Expected size of 4, but got " + size);
                });
        } ]
    },

    /**
     * Verify indexedDB is scoped per app
     */
    testIndexedDBScopedByApp: {
        test: [
            function(cmp) {
                var completed = false;
                var request = indexedDB.open('browserdb');
                request.onsuccess = function(event) {
                    var objectStoreNames = event.target.result.objectStoreNames;
                    $A.test.assertEquals(1, objectStoreNames.length);

                    // We use app/cmp name work as table name. An app should only get items from its own table.
                    var expected = cmp.getType();
                    $A.test.assertEquals(expected, objectStoreNames[0]);
                    completed = true;
                };
                request.onerror = function(event) {
                    $A.test.fail("Failed to connect to 'browserdb': " + event.target.error);
                };

                $A.test.addWaitFor(true, function() { return completed; });
            }
        ]
    },

    /**
     * Store an item in the database and reload the page (iframe) to verify data is persisted.
     */
    testReloadPage: {
        test: [
            function loadComponentInIframe(cmp) {
                $A.test.addCleanup(function(){ this.deleteStorage("persistentStorageCmp"); }.bind(this));

                cmp._expected = "expected value";
                return cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=false",
                        "iframeContainer", "first load");
            },
            function addItemToStorage(cmp) {
                var targetStorage = cmp._iframeLib.getIframeRootCmp()._storage;

                return targetStorage.set("key1", cmp._expected);
            },
            function reloadIframe(cmp) {
                return cmp._iframeLib.reloadIframe(cmp, false, "first reload");
            },
            function getItemFromStorage(cmp) {
                var targetStorage = cmp._iframeLib.getIframeRootCmp()._storage;

                return targetStorage.get("key1").
                    then(function(value) {
                        $A.test.assertEquals(cmp._expected, value, "Found unexpected item from storage after page reload");
                    });
            }
        ]
    },

    testDeleteDatabase: {
        test: function deleteDatabase(cmp) {
            var dbName = "browserdb";
            var completed = false;
            var results;

            $A.test.assertDefined($A.storageService.getStorage(dbName));
            $A.storageService.deleteStorage(dbName)
                .then(function(){
                    // Only Chrome currently provides an easy way to check current DBs
                    if (window.indexedDB.webkitGetDatabaseNames) {
                        window.indexedDB.webkitGetDatabaseNames().onsuccess = function(event) {
                            results = event.target.result;
                            completed = true;
                        };
                        window.indexedDB.webkitGetDatabaseNames().onerror = function(e) {
                            $A.test.fail(e.toString());
                        };
                    } else {
                        completed = true;
                    }
                })
                .catch(function(e) { $A.test.fail(e.toString()); });

            $A.test.addWaitFor(true, function() { return completed; },
                function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName),
                            "Storage service still has reference to deleted database "+dbName);
                    if (window.indexedDB.webkitGetDatabaseNames) {
                        $A.test.assertFalse(results.contains(dbName), "IndexedDb "+dbName+" still present in browser");
                    }
                });
        }
    },

    testDeleteDatabaseTwice: {
        test: [
        function deleteDatabaseTwice(cmp) {
            var dbName = "browserdb";

            return $A.storageService.deleteStorage(dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    return $A.storageService.deleteStorage(dbName);
                })
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                });
        }]
    },

    testDeleteAndRecreateDatabase: {
        test: [
        function deleteAndRecreateDatabase(cmp) {
            cmp._dbName = "browserdb";

            return $A.storageService.deleteStorage(cmp._dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(cmp._dbName));
                    $A.storageService.initStorage({
                        name: cmp._dbName,
                        maxSize: 32768,
                        expiration: 2000,
                        debugLogging: true
                    });
                })
                .then(function() {
                    $A.test.assertDefined($A.storageService.getStorage(cmp._dbName));
                });
        },
        function verifyRecreationOfDatabase(cmp) {
            var completed = false;

            // Unfortunately, only Chrome has an easy way to check if a DB exists
            if (window.indexedDB.webkitGetDatabaseNames) {
                $A.test.addWaitFor(true, function() {
                    window.indexedDB.webkitGetDatabaseNames().onsuccess = function(event) {
                        if (event.target.result.contains(cmp._dbName)){
                            completed = true;
                        }
                    };
                    return completed;
                });
            }
        }]
    },

    /**
     * Verify that sweeping never evicts blacklisted keys.
     *
     * TODO W-2481519 - when aura framework-required data moved to its own storage this test needs to be
     * moved and refactored. it will no longer be indexeddb adapter specific.
     */
    testSweepNeverEvictsBlacklist: {
        test: [
           function createStorage(cmp) {
                var storageName = "actions";
                cmp._storage = $A.storageService.initStorage({
                    name: storageName,
                    maxSize: 400,
                    // make stored item expired quickly
                    expiration: 0.0001,
                    debugLogging: true
                });
                $A.test.addCleanup(function(){ this.deleteStorage(storageName); }.bind(this));

                // blacklisted keys that never gets evicted. copied from AuraClientService.js
                cmp._actionsBlacklist = ["globalValueProviders",             /* GlobalValueProviders.js */
                                         "$AuraClientService.token$",        /* AuraClientService.js */
                                         "$AuraClientService.bootstrap$"];   /* AuraClientService.js */
           },
           function storeBlacklistedItems(cmp) {
                cmp._expected = "blacklistedItem";

                var values = {};
                cmp._actionsBlacklist.forEach(function(key) {
                    values[key] = cmp._expected;
                });

                return cmp._storage.setAll(values)
                    .then(function() {
                        var evictedItem = [
                            "evictedItemKey",
                            {
                                expires : new Date().getTime() + 0.0001,
                                value: "value"
                            },
                            50
                        ];
                        // Store a normal item to guarantee expired item gets evicted so that we
                        // don't have false positive result.
                        // Setting item through adapter to avoid calling sweep() when setting items.
                        return $A.test.storageAdapterSetItems(cmp._storage, [evictedItem]);
                    });
            },
            function sweepAndVerify(cmp) {
                // sweep() gets run asyncly in API, so explicitly call it.
                return $A.test.storageSweep(cmp._storage)
                    .then(function() {
                        return cmp._storage.getAll([], true);
                    })
                    .then(function(items) {
                        $A.test.assertUndefined(items["evictedItemKey"]);

                        // verify the blacklisted items remain
                        cmp._actionsBlacklist.forEach(function(key) {
                            var value = items[key];

                            $A.test.assertDefined(value, "Blacklisted entry '" + key + "' was incorrectly evicted");
                            $A.test.assertEquals(cmp._expected, value,
                                    "Blacklisted entry '" + key + "' has wrong value");
                        });
                    });
           }
       ]
    },

    /**
     * Verify that IndexedDBAdapter.getItems() excludes the items with different key prefix.
     * Since storage.getAll() has the key prefix exclusion logic, calling getItems() directly
     * through adapter.
     */
    testGetItemsExcludesItemsWithDifferentKeyPrefix: {
        test: [
            function createStorageAndSetDiffPrefixedItem(cmp) {
                var targetStorageName = "keyPrefixTestDB";
                $A.test.addCleanup(function(){ this.deleteStorage(targetStorageName); }.bind(this));

                // prefixKey is prefix:1
                $A.storageService.setIsolation("prefix");
                cmp._storage = $A.storageService.initStorage({
                    name: targetStorageName,
                    maxSize: 32768,
                    expiration: 2000,
                    debugLogging: true,
                    clearOnInit: true,
                    version: 1
                });

                var diffPrefixedKeyItem = [
                    "diffPrefixedKey",
                    {
                        expires : new Date().getTime() + 60000,
                        value: "value"
                    },
                    15];

                return $A.test.storageAdapterSetItems(cmp._storage, [diffPrefixedKeyItem])
                    .then(function() {
                        // TODO: add a case for getItems with explicitly given keys when W-2531907 is done.
                        // Currently only getting all items excludes different prefix keyed item.
                        return cmp._storage.adapter.getItems([]);
                    })
                    .then(function(items) {
                        $A.test.assertEquals(0, Object.keys(items).length,
                                "getItems() should not include items with different prefixed key");
                    });
            }
        ]
    },

    testGetSizeIncludesSizeOfItemsWithDifferentPrefixKey: {
        test: [
            function createStorageAndSetDiffPrefixedItem(cmp) {
                var targetStorageName = "keyPrefixTestDB";
                $A.test.addCleanup(function(){ this.deleteStorage(targetStorageName); }.bind(this));

                // prefixKey is prefix:1
                $A.storageService.setIsolation("prefix");
                cmp._storage = $A.storageService.initStorage({
                    name: targetStorageName,
                    maxSize: 32768,
                    expiration: 2000,
                    debugLogging: true,
                    clearOnInit: true,
                    version: 1
                });
                cmp._expectedSize = 15;

                var diffPrefixedKeyItem = [
                    "diffPrefixedKey",
                    {
                        expires : new Date().getTime() + 60000,
                        value: "value"
                    },
                    cmp._expectedSize];

                return $A.test.storageAdapterSetItems(cmp._storage, [diffPrefixedKeyItem])
                    .then(function() {
                        // storage.getSize() uses KB as unit, so getting size through adapter (Byte as unit)
                        // for more accurate comparison.
                        // Note: getSize() normally gives estimated size. Calling after getAll() can force it
                        // to scan entire table to get actual size. More details in IndexedDBAdapter.js docs.
                        return cmp._storage.getAll();
                    })
                    .then(function() {
                        return cmp._storage.adapter.getSize();
                    })
                    .then(function(size) {
                        $A.test.assertEquals(cmp._expectedSize, size,
                               "getSize() should include size of items with different prefixed key");
                    });
            }
        ]
    },

    testSweepEvictsItemsWithDifferentKeyPrefix: {
        test: [
            function createStorageAndSetDiffPrefixedItem(cmp) {
                var targetStorageName = "keyPrefixTestDB";
                $A.test.addCleanup(function(){ this.deleteStorage(targetStorageName); }.bind(this));

                // prefixKey is prefix:1
                $A.storageService.setIsolation("prefix");
                cmp._storage = $A.storageService.initStorage({
                    name: targetStorageName,
                    maxSize: 32768,
                    expiration: 2000,
                    debugLogging: true,
                    clearOnInit: true,
                    version: 1
                });

                var diffPrefixedKeyItem = [
                    "diffPrefixedKey",
                    {
                        expires : new Date().getTime() + 60000,
                        value: "value"
                    },
                    15];

                return $A.test.storageAdapterSetItems(cmp._storage, [diffPrefixedKeyItem])
                    .then(function() {
                        return $A.test.storageSweep(cmp._storage);
                    })
                    .then(function() {
                        return cmp._storage.getSize();
                    })
                    .then(function(size) {
                        $A.test.assertEquals(0, size, "Item with different key prefix should be swept");
                    });
            }
        ]
    }
})
