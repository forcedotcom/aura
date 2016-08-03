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
            cmp._storageLib.testSizeInitial(this.storage);
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
            cmp._storageLib.testEmptyStringKey(cmp, this.storage);
        }
    },

    testGetNullValue: {
        test: function(cmp) {
            cmp._storageLib.testGetNullValue(cmp, this.storage);
        }
    },

    testGetUndefinedValue: {
        test: function(cmp) {
            cmp._storageLib.testGetUndefinedValue(cmp, this.storage);
        }
    },

    testGetBooleanTrueValue: {
        test: function(cmp) {
            cmp._storageLib.testGetBooleanTrueValue(cmp, this.storage);
        }
    },

    testGetZeroValue: {
        test: function(cmp) {
            cmp._storageLib.testGetZeroValue(cmp, this.storage);
        }
    },

    testGetSimpleStringValue: {
        test: function(cmp) {
            cmp._storageLib.testGetSimpleStringValue(cmp, this.storage);
        }
    },

    testGetEmptyObjectValue: {
        test: function(cmp) {
            cmp._storageLib.testGetEmptyObjectValue(cmp, this.storage);
        }
    },

    testGetBasicObjectValue: {
        test: function(cmp) {
            cmp._storageLib.testGetBasicObjectValue(cmp, this.storage);
        }
    },

    testGetEmptyArrayValue: {
        test: function(cmp) {
            cmp._storageLib.testGetEmptyArrayValue(cmp, this.storage);
        }
    },

    testGetBasicArrayValue: {
        test: function(cmp) {
            cmp._storageLib.testGetBasicArrayValue(cmp, this.storage);
        }
    },

    testGetBigArrayValue: {
        test: function(cmp) {
            cmp._storageLib.testGetBigArrayValue(cmp, this.storage);
        }
    },

    testGetMultiByteStringValue: {
        test: function(cmp) {
            cmp._storageLib.testGetMultiByteStringValue(cmp, this.storage);
        }
    },

    testCacheMiss: {
        test: function(cmp) {
            cmp._storageLib.testCacheMiss(cmp, this.storage);
        }
    },

    testSetItemUnderMaxSize : {
        test : [function(cmp) {
            cmp._storageLib.testSetItemUnderMaxSize(cmp, this.storage, "Item smaller than size limit");
        }]
    },

    testSetItemOverMaxSize : {
        test : [function(cmp) {
            cmp._storageLib.testSetItemOverMaxSize_stage1(cmp, this.storage, "Item larger than size limit");
        },
        function(cmp) {
            cmp._storageLib.testSetItemOverMaxSize_stage2(cmp, this.storage);
        }]
    },

    testGetAll: {
        test: function(cmp) {
            cmp._storageLib.testGetAll(cmp, this.storage);
        }
    },

    testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            var maxSize = 5120;
            cmp._storage = $A.storageService.initStorage({
                name: "browserdb-testReplaceExistingWithEntryTooLarge",
                maxSize: maxSize,
                expiration: 2000,
                debugLogging: true
            });
            $A.test.addCleanup(function(){ this.deleteStorage("browserdb-testReplaceExistingWithEntryTooLarge"); }.bind(this));

            cmp._storageLib.testReplaceExistingWithEntryTooLarge_stage1(cmp, cmp._storage);
        },
        function getItem(cmp) {
            cmp._storageLib.testReplaceExistingWithEntryTooLarge_stage2(cmp, cmp._storage);
        }]
    },

    testStorageInfo: {
        test: function(cmp) {
            cmp._storageLib.testStorageInfo(this.storage, true, false);
        }
    },

    // cyclic objects are supported by IndexedDB adapter unlike all other adapters
    testCyclicObject:{
        test:function(cmp){
            var completed = false;
            var stuff = { "a": 2 };
            stuff["b"] = stuff;

            var that = this;
            this.storage.set("testCyclicObject", stuff)
                .then(function() { return that.storage.get("testCyclicObject"); })
                .then(function(value) {
                    $A.test.assertEquals(2, value["a"], "testCyclicObject: constant is wrong");
                    $A.test.assertEquals(value["b"], value, "testCyclicObject: looped value should be defined");
                    completed = true;
                })['catch'](function(e) {
                   completed = true;
                   $A.test.fail("Cyclic object set/get failed: " + e.message);
                });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testModifyObject:{
        test:function(cmp){
            cmp._storageLib.testModifyObject(cmp, this.storage);
        }
    },

    testModifyGetAllObject:{
        test:function(cmp){
            cmp._storageLib.testModifyGetAllObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            cmp._storageLib.testUpdate(cmp, this.storage);
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

            cmp._storageLib.testOverflow(cmp, cmp._storage);
        }
    },

    testClear:{
        test:[function(cmp){
            cmp._storageLib.testClear_stage1(cmp, this.storage);
        },
        function(cmp){
            cmp._storageLib.testClear_stage2(cmp, this.storage);
        }]
    },

    testBulkGetInnerItemNotInStorage: {
        test: function(cmp) {
            cmp._storageLib.testBulkGetInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkGetOuterItemsNotInStorage: {
        test: function(cmp) {
            cmp._storageLib.testBulkGetOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    testBulkSet: {
        test: function(cmp) {
            cmp._storageLib.testBulkSet(cmp, this.storage);
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
            cmp._storageLib.testBulkSetLargerThanMaxSize(cmp, storage);
        }
    },

    testBulkRemoveInnerItemNotInStorage: {
        test: function(cmp) {
            cmp._storageLib.testBulkRemoveInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkRemoveOuterItemsNotInStorage: {
        test: function(cmp) {
            cmp._storageLib.testBulkRemoveOuterItemsNotInStorage(cmp, this.storage);
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
            var completed = false;
            var failTest = function(cmp, error) { cmp._storageLib.failTest(cmp, error); }
            this.storage.set("testErrorValue", new Error("hello, error"))
                .then(function() {
                    completed = true;
                    $A.test.fail("Expected set() to fail but it succeeded");
                }, function(e) {
                    cmp._storageLib.appendLine(cmp, e.message);
                })
                .then(function() { return that.storage.get("testErrorValue"); })
                .then(
                    function(value){
                        $A.test.assertUndefined(value, "Expected undefined because set() failed");
                        completed = true;
                    },
                    function(err) { failTest(cmp, err); }
                );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
    },

    // function values are not supported by IndexedDB adapter unlike all other adapters
    testSetFunctionValueFails: {
        test: function(cmp) {
            var completed = false;
            var that = this;
            this.storage.set("testFunctionValue", function(x){})
                .then(
                    function() {
                        completed = true;
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
                        completed = true;
                    },
                    function(e) {
                        completed = true;
                        $A.test.fail("Function value get failed: " + e.message);
                    }
                );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
    },

    testGetSize:{
        test:[function (cmp) {
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
            var completed = false;

            cmp._storage.set("testGetSize.key1", new Array(1024).join("x"))  // 1kb
                .then(function() { return cmp._storage.get("testGetSize.key1"); })
                .then(function(value) { $A.test.assertDefined(value, "Fail item."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(result) { cmp._append("result length = "+Object.keys(result).length); return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 2 && size < 2.2, "testGetSize: Expected size of 2, but got " + size);
                    completed = true;
                }, cmp._failTest);

            // Allow this promise chain to complete before starting the next test.
            // If we don't wait, the chains are interleaved.
            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            //Two value to see that size is recalculated
            cmp._storage.set("testGetSize.key2" , new Array(3072).join("y")) //5kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(value) { $A.test.assertDefined(value, "testGetSize: Fail - item undefined."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 8 && size < 8.3, "testGetSize: Expected size of 8, but got " + size);
                    completed = true;
                }, cmp._failTest);

            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            // Overwrite previous key2
            // Careful... this does not calculate size correctly.
            cmp._storage.set("testGetSize.key2" , new Array(1024).join("z")) //1kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(value) { $A.test.assertDefined(value); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 4 && size < 4.3, "testGetSize: Expected size of 4, but got " + size);
                    completed = true;
                }, cmp._failTest);

            $A.test.addWaitFor(true, function() { return completed; });
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
                    var descriptor = cmp.getDef().getDescriptor();
                    var expected = descriptor.getNamespace() + ":" + descriptor.getName();
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
                cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=false",
                        "iframeContainer", "first load");
            },
            function addItemToStorage(cmp) {
                var completed = false;
                var targetStorage = cmp._iframeLib.getIframeRootCmp()._storage;

                targetStorage.set("key1", cmp._expected)
                    .then(function(){ completed = true; })
                    .catch(function(e){ $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            },
            function reloadIframe(cmp) {
                cmp._iframeLib.reloadIframe(cmp, false, "first reload");
            },
            function getItemFromStorage(cmp) {
                var completed = false;
                var targetStorage = cmp._iframeLib.getIframeRootCmp()._storage;

                targetStorage.get("key1").
                    then(function(value) {
                        $A.test.assertEquals(cmp._expected, value, "Found unexpected item from storage after page reload");
                        completed = true;
                    })
                    .catch(function(e){ $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
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
            var failTest = function(error) { completed=true; cmp._storageLib.failTest(cmp, error); };
            var completed = false;
            var dbName = "browserdb";

            $A.storageService.deleteStorage(dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    return $A.storageService.deleteStorage(dbName);
                })
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    completed = true;
                })["catch"](failTest);

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },

    testDeleteAndRecreateDatabase: {
        test: [
        function deleteAndRecreateDatabase(cmp) {
            var failTest = function(error) { completed=true; cmp._storageLib.failTest(cmp, error); };
            var completed = false;
            cmp._dbName = "browserdb";

            $A.storageService.deleteStorage(cmp._dbName)
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
                    completed = true;
                })["catch"](failTest);

            $A.test.addWaitFor(true, function(){ return completed; });
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
                var completed = false;
                cmp._expected = "blacklistedItem";

                var values = {};
                cmp._actionsBlacklist.forEach(function(key) {
                    values[key] = cmp._expected;
                });

                cmp._storage.setAll(values)
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
                        $A.test.storageAdapterSetItems(cmp._storage.adapter, [evictedItem]);
                    })
                    .then(function() { completed = true; })
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function sweepAndVerify(cmp) {
                var completed = false;

                // sweep() gets run asyncly in API, so explicitly call it.
                $A.test.storageSweep(cmp._storage)
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
                    })
                    .then(function() { completed = true; })
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function(){ return completed; });
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
                var completed = false;
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

                $A.test.storageAdapterSetItems(cmp._storage.adapter, [diffPrefixedKeyItem])
                    .then(function() { completed = true; } )
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            },
            function verifyGetItemsNotReturnDiffPrefixedItem(cmp) {
                var completed = false;

                // TODO: add a case for getItems with explicitly given keys when W-2531907 is done.
                // Currently only getting all items excludes different prefix keyed item.
                cmp._storage.adapter.getItems([])
                    .then(function(items) {
                        $A.test.assertEquals(0, Object.keys(items).length,
                                "getItems() should not include items with different prefixed key");
                        completed = true;
                    })
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            }
        ]
    },

    testGetSizeIncludesSizeOfItemsWithDifferentPrefixKey: {
        test: [
            function createStorageAndSetDiffPrefixedItem(cmp) {
                var completed = false;
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

                $A.test.storageAdapterSetItems(cmp._storage.adapter, [diffPrefixedKeyItem])
                    .then(function() { completed = true; } )
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            },
            function verifyGetSizeBeforeDiffPrefixedItemGetEvicted(cmp) {
                var completed = false;

                // storage.getSize() uses KB as unit, so getting size through adapter (Byte as unit)
                // for more accurate comparison.
                // Note: getSize() normally gives estimated size. Calling after getAll() can force it
                // to scan entire table to get actual size. More details in IndexedDBAdapter.js docs.
                cmp._storage.getAll().
                    then(function() {
                        return cmp._storage.adapter.getSize();
                    })
                    .then(function(size) {
                        $A.test.assertEquals(cmp._expectedSize, size,
                               "getSize() should include size of items with different prefixed key");
                        completed = true;
                    })
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            }
        ]
    },

    testSweepEvictsItemsWithDifferentKeyPrefix: {
        test: [
            function createStorageAndSetDiffPrefixedItem(cmp) {
                var completed = false;
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

                $A.test.storageAdapterSetItems(cmp._storage.adapter, [diffPrefixedKeyItem])
                    .then(function() { completed = true; } )
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            },
            function sweepAndVerifyStorageSize(cmp) {
                var completed = false;

                $A.test.storageSweep(cmp._storage)
                    .then(function() {
                        return cmp._storage.getSize();
                    })
                    .then(function(size) {
                        $A.test.assertEquals(0, size, "Item with different key prefix should be swept");
                        completed = true;
                    })
                    .catch(function(e) { $A.test.fail(e.toString()); });

                $A.test.addWaitFor(true, function() {return completed;});
            }
        ]
    }
})
