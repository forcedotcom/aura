({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    setUp : function(cmp) {
        cmp._storageLib = cmp.helper.storageLib.storageTest;
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;

        $A.installOverride("StorageService.selectAdapter", function(){ return "indexeddb" }, this);
        this.storage = $A.storageService.initStorage(
                "browserdb",    // name
                true,           // persistent
                false,          // secure
                32768,          // size
                2000,           // expiration
                3000,           // auto-refresh
                true,           // debug logging
                true);          // clear on init

        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb"); });
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

    testGetSize:{
        test:[function (cmp) {
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 32768, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow"); });
            cmp._die = function(error) { cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { cmp._storageLib.appendLine(cmp, string); }.bind(this);
        }, function(cmp){
            var completed = false;

            cmp._storage.put("testGetSize.key1", new Array(1024).join("x"))  // 1kb
                .then(function() { return cmp._storage.get("testGetSize.key1"); })
                .then(function(item) { $A.test.assertDefined(item.value, "Fail item."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(result) { cmp._append("result length = "+result.length); return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 2 && size < 2.2, "testGetSize: Expected size of 2, but got " + size);
                    completed = true;
                }, cmp._die);

            // Allow this promise chain to complete before starting the next test.
            // If we don't wait, the chains are interleaved.
            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            //Two value to see that size is recalculated
            cmp._storage.put("testGetSize.key2" , new Array(3072).join("y")) //5kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(item) { $A.test.assertDefined(item.value, "testGetSize: Fail - item undefined."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 8 && size < 8.3, "testGetSize: Expected size of 8, but got " + size);
                    completed = true;
                }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            // Overwrite previous key2
            // Careful... this does not calculate size correctly.
            cmp._storage.put("testGetSize.key2" , new Array(1024).join("z")) //1kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(item) { $A.test.assertDefined(item.value); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(results) { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 4 && size < 4.3, "testGetSize: Expected size of 4, but got " + size);
                    completed = true;
                }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        } ]
    },

    testGetMaxSize:{
        test:function(cmp){
            cmp._storageLib.testGetMaxSize(this.storage, 32);
        }
    },

    testNullKey: {
        test: function(cmp) {
            cmp._storageLib.testNullKey(cmp, this.storage);
        }
    },

    testUndefinedKey: {
        test: function(cmp) {
            cmp._storageLib.testUndefinedKey(cmp, this.storage);
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

    // function values are not supported by IndexedDB adapter unlike all other adapters
    testPutFunctionValueFails: {
        test: function(cmp) {
            var completed = false;
            var that = this;
            this.storage.put("testFunctionValue", function(x){})
                .then(
                    function() {
                        completed = true;
                        $A.test.fail("Expected put() to fail but it succeeded");
                    },
                    function(e) {
                        cmp._storageLib.appendLine(cmp, e.message);
                    }
                )
                .then(function() { return that.storage.get("testFunctionValue"); })
                .then(
                    function(item){
                        $A.test.assertUndefined(item, "Expected undefined because put() failed");
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

    testPutErrorValueFails: {
        test: function(cmp) {
            cmp._storageLib.testPutErrorValueFails(cmp, this.storage);
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

    // cyclic objects are supported by IndexedDB adapter unlike all other adapters
    testCyclicObject:{
        test:function(cmp){
            var completed = false;
            var stuff = { "a": 2 };
            stuff["b"] = stuff;

            var that = this;
            this.storage.put("testCyclicObject", stuff)
                .then(function() { return that.storage.get("testCyclicObject"); })
                .then(function(item) {
                    $A.test.assertEquals(2, item.value["a"], "testCyclicObject: constant is wrong");
                    $A.test.assertEquals(item.value["b"], item.value, "testCyclicObject: looped value should be defined");
                    completed = true;
                })['catch'](function(e) {
                   completed = true;
                   $A.test.fail("Cyclic object put/get failed: " + e.message);
                });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testModifyObject:{
        test:function(cmp){
            cmp._storageLib.testModifyObject(cmp, this.storage);
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
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 5000, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow"); });

            cmp._storageLib.testOverflow(cmp, cmp._storage);
        }
    },

    testGetAll: {
        test: function(cmp) {
            cmp._storageLib.testGetAll(cmp, this.storage);
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

    testStorageInfo: {
        test: function(cmp) {
            cmp._storageLib.testStorageInfo(this.storage, true, false);
        }
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
            cmp._expected = "expected value";
            cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=false&value="+cmp._expected,
                    "iframeContainer", "first load");
        },
        function resetDatabase(cmp) {
            cmp._iframeLib.getIframeRootCmp().resetStorage();
            cmp._iframeLib.waitForStatus("Resetting", "Done Resetting");
        },
        function addItemToDatabase(cmp) {
            cmp._iframeLib.getIframeRootCmp().addToStorage();
            cmp._iframeLib.waitForStatus("Adding", "Done Adding");
        },
        function reloadIframe(cmp) {
            cmp._iframeLib.reloadIframe(cmp, false, "first reload");
        },
        function getItemFromDatabase(cmp) {
            var iframeCmp = cmp._iframeLib.getIframeRootCmp();
            iframeCmp.getFromStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
            }, function() {
                var actual = $A.util.getText(iframeCmp.find("output").getElement());
                $A.test.assertEquals(cmp._expected, actual, "Got unexpected item from storage after page reload");
            });
        },
        function cleanupDatabase(cmp) {
            cmp._iframeLib.getIframeRootCmp().deleteStorage();
        }]
    },

    testDeleteDatabase: {
        // Safari doesn't like deleting the database immediately after initializing it.
        browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],
        test: [
        function deleteDatabase(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
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
                    } else {
                        completed = true;
                    }
                })["catch"](die);

            $A.test.addWaitFor(
                    true,
                    function() {
                        return completed;
                    }, function() {
                        $A.test.assertUndefined($A.storageService.getStorage(dbName),
                                "Storage service still has reference to deleted database "+dbName);
                        if (window.indexedDB.webkitGetDatabaseNames) {
                            $A.test.assertFalse(results.contains(dbName), "IndexedDb "+dbName+" still present in browser");
                        }
                    });
        }]
    },

    testDeleteDatabaseTwice: {
        // Safari doesn't like deleting the database immediately after initializing it.
        browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],
        test: [
        function deleteDatabaseTwice(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
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
                })["catch"](die);

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },

    testDeleteAndRecreateDatabase: {
        // Safari doesn't like deleting the database immediately after initializing it.
        browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],
        test: [
        function deleteAndRecreateDatabase(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            cmp._dbName = "browserdb";

            $A.storageService.deleteStorage(cmp._dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(cmp._dbName));
                    $A.storageService.initStorage(cmp._dbName, true, false, 32768, 2000, 3000, true, true);
                })
                .then(function() {
                    $A.test.assertDefined($A.storageService.getStorage(cmp._dbName));
                    completed = true;
                })["catch"](die);

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

    testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            var maxSize = 5120;
            $A.installOverride("StorageService.selectAdapter", function(){ return "indexeddb" }, this);
            cmp._storage = $A.storageService.initStorage("browserdb-testReplaceTooLarge",
                    true, false, maxSize, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testReplaceTooLarge"); });

            cmp._storageLib.testReplaceExistingWithEntryTooLarge_stage1(cmp, cmp._storage);
        },
        function getItem(cmp) {
            cmp._storageLib.testReplaceExistingWithEntryTooLarge_stage2(cmp, cmp._storage);
        }]
    },

    /**
     * Verify that sweeping never evicts blacklisted keys.
     *
     * Verifies by creating a store with a minimal size and sweep timing. Stores a sentinel item (the prefix),
     * items for the blacklist, and more sentinel items (the suffix), then triggers sweeping. Verifies that
     * the prefix and suffix items are evicted -- and thus sweeping has run -- and the blacklisted items remain.
     *
     * TODO W-2481519 - when aura framework-required data moved to its own storage this test needs to be
     * moved and refactored. it will no longer be indexeddb adapter specific.
     */
    testSweepNeverEvictsBlacklist: {
        test: [
           function setup(cmp) {
               // force rapid sweeps so test runs quickly
               AuraStorage.SWEEP_INTERVAL.MIN = 1;
               AuraStorage.SWEEP_INTERVAL.MAX = 2;

               // store max size
               var maxSize = 400;

               cmp._storage = $A.storageService.initStorage(
                       "actions", // name
                       true,      // persistent
                       false,     // secure
                       maxSize,   // size
                       0.1,       // expiration
                       1,         // auto-refresh
                       true,      // debug logging
                       true);     // clear on init

               // blacklisted keys to never expire. copied from AuraComponentService.js
               cmp._actionsBlacklist = ["globalValueProviders",                                /* GlobalValueProviders.js */
                                       "aura://ComponentController/ACTION$getApplication",     /* AuraClientService.js */
                                       "$AuraContext$"];                                       /* AuraContext.js */

               // stored value for blacklisted keys. must be sufficiently small so JSON.stringify() comparison below works.
               cmp._expected = {"foo": "bar"};

               cmp._prefix = cmp._storageLib.buildEntry("prefix", maxSize/3);
               cmp._suffix1 = cmp._storageLib.buildEntry("suffix1", maxSize/3);
               cmp._suffix2 = cmp._storageLib.buildEntry("suffix2", maxSize/3);
           },
           function insertEntries(cmp) {
               var completed = false;
               cmp._storage.put(cmp._prefix.key, cmp._prefix.value)
                   .then(function() {
                       var promises = [];
                       for (var i = 0; i < cmp._actionsBlacklist.length; i++) {
                           promises.push(cmp._storage.put(cmp._actionsBlacklist[i], cmp._expected));
                       }
                       return Promise.all(promises);
                   })
                   .then(function() {
                       return cmp._storage.put(cmp._suffix1.key, cmp._prefix.value);
                   })
                   .then(function() {
                       return cmp._storage.put(cmp._suffix2.key, cmp._prefix.value);
                   })
                   .then(function() {
                       completed = true;
                   })
                   ["catch"](function(e) {
                       $A.test.fail("Storage operation failed: " + e.message);
                   });

               $A.test.addWaitForWithFailureMessage(
                   true,
                   function(){ return completed; },
                   "Inserting storage entries never completed");
           },
           function sweepAndVerify(cmp) {
               /**
                * Recursive function that runs until prefix + suffix entries are evicted,
                * and blacklist entries are not. Uses promise chaining for recursion.
                */
               function checkStorage() {
                   // can't call sweep() directly so rely on get() to trigger sweep().
                   return cmp._storage.get("anything")
                       .then(function() {
                           return cmp._storage.getAll();
                       })
                       .then(function(items) {
                           var indexedItems = {};
                           items.forEach(function(item) {
                               indexedItems[item["key"]] = item["value"];
                           });

                           // if sweep() hasn't cleared the items then recurse
                           if (indexedItems[cmp._prefix.key] || indexedItems[cmp._suffix1.key]) {
                               return checkStorage();
                           }

                           // verify the blacklisted items remain
                           for (var i = 0; i < cmp._actionsBlacklist.length; i++) {
                               var item = indexedItems[cmp._actionsBlacklist[i]];
                               if (!item) {
                                   return Promise["reject"](new Error("Blacklisted entry '" + cmp._actionsBlacklist[i] + "' was incorrectly evicted"));
                               }
                               if (JSON.stringify(cmp._expected) !== JSON.stringify(item)) {
                                   return Promise["reject"](new Error("Blacklisted entry '" + cmp._actionsBlacklist[i] + "' has wrong value"));
                               }
                           }
                           // success so do not recurse
                       });
               }

               var completed = false;
               Promise["resolve"]()
                   .then(function() {
                       return checkStorage();
                   })
                   .then(function() {
                       completed = true;
                   })
                   ["catch"](function(e) {
                       $A.test.fail("Failure while waiting for sweep to evict items: " + e.message);
                   });

               $A.test.addWaitForWithFailureMessage(
                       true,
                       function(){ return completed; },
                       "Sweeping items never completed");
           }
       ]
    }

})
