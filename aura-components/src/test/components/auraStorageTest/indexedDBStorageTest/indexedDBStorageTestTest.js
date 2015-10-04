({
    // IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    setUp : function(cmp) {
        $A.test.overrideFunction($A.storageService, "selectAdapter", function(){ return "indexeddb"; });
        this.storage = $A.storageService.initStorage("browserdb", true, false, 32768, 2000, 3000, true, true);
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb"); });
    },

    testSizeInitial: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp.helper.lib.storageTest.testGetName(cmp, this.storage, "indexeddb");
        }
    },

    testGetSize:{
        test:[function (cmp) {
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 32768, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow"); });
            cmp._die = function(error) { cmp.helper.lib.storageTest.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { cmp.helper.lib.storageTest.appendLine(cmp, string); }.bind(this);
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
            cmp.helper.lib.storageTest.testGetMaxSize(this.storage, 32);
        }
    },

    testNullKey: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testNullKey(cmp, this.storage);
        }
    },

    testUndefinedKey: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testUndefinedKey(cmp, this.storage);
        }
    },

    testEmptyStringKey: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testEmptyStringKey(cmp, this.storage);
        }
    },

    testGetNullValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        }
    },
    
    testGetUndefinedValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetUndefinedValue(cmp, this.storage);
        }
    },
    
    testGetBooleanTrueValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetBooleanTrueValue(cmp, this.storage);
        }
    },
    
    testGetZeroValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetZeroValue(cmp, this.storage);
        }
    },
    
    testGetSimpleStringValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetSimpleStringValue(cmp, this.storage);
        }
    },
    
    testGetEmptyObjectValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetEmptyObjectValue(cmp, this.storage);
        }
    },
    
    testGetBasicObjectValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetBasicObjectValue(cmp, this.storage);
        }
    },
    
    testGetEmptyArrayValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetEmptyArrayValue(cmp, this.storage);
        }
    },
    
    testGetBasicArrayValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetBasicArrayValue(cmp, this.storage);
        }
    },
    
    testGetBigArrayValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetBigArrayValue(cmp, this.storage);
        }
    },
    
    testGetMultiByteStringValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetMultiByteStringValue(cmp, this.storage);
        }
    },

    // TODO(W-2701448): There are inconsistencies between Adapters on what can be stored. Formal evaluation needed.
    _testGetFunctionValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetFunctionValue(cmp, this.storage);
        }
    },

    testCacheMiss: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testCacheMiss(cmp, this.storage);
        }
    },

    testSetItemOverMaxSize : {
        test : [function(cmp) {
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage1(cmp, this.storage, "Item larger than size limit");
        },
        function(cmp) {
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage2(cmp, this.storage);
        }]
    },

    testTwistedObject:{
        test:function(cmp){
            cmp.helper.lib.storageTest.testTwistedObject(cmp, this.storage);
        }
    },

    testModifyObject:{
        test:function(cmp){
            cmp.helper.lib.storageTest.testModifyObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testUpdate(cmp, this.storage);
        }
    },

    testOverflow: {
        test:[function(cmp) {
            // Due to differences in size calculation between adapters, pass in a storage with the correct size to
            // fill up the storage after 5 entries of a 512 character string.
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 5000, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow"); });

            cmp.helper.lib.storageTest.testOverflow_stage1(cmp, cmp._storage);
        }, function(cmp) {
            cmp.helper.lib.storageTest.testOverflow_stage2(cmp, cmp._storage);
        }]
    },

    testGetAll: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetAll(cmp, this.storage);
        }
    },

    testClear:{
        test:[function(cmp){
            cmp.helper.lib.storageTest.testClear_stage1(cmp, this.storage);
        },
        function(cmp){
            cmp.helper.lib.storageTest.testClear_stage2(cmp, this.storage);
        }]
    },

    testStorageInfo: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testStorageInfo(this.storage, true, false);
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
            cmp._frameLoaded = false;
            cmp._expected = "expected value";
            var frame = document.createElement("iframe");
            frame.src = "/auraStorageTest/persistentStorage.app?secure=false&value="+cmp._expected;
            frame.scrolling = "auto";
            frame.id = "myFrame";
            $A.util.on(frame, "load", function(){
                cmp._frameLoaded = true;
            });
            var content = cmp.find("iframeContainer");
            $A.util.insertFirst(frame, content.getElement());

            this.waitForIframeLoad(cmp);
        },
        function resetDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.resetStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Resetting";
            }, function() {
                $A.test.assertEquals("Done Resetting", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function addItemToDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.addToStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Adding";
            }, function() {
                $A.test.assertEquals("Done Adding", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function reloadIframe(cmp) {
            cmp._frameLoaded = false;
            document.getElementById("myFrame").contentWindow.location.reload();
            this.waitForIframeLoad(cmp);
        },
        function getItemFromDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.getFromStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
            }, function() {
                var actual = $A.util.getText(iframeCmp.find("output").getElement());
                $A.test.assertEquals(cmp._expected, actual, "Got unexpected item from storage after page reload");
            });
        },
        function cleanupDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.deleteStorage();
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
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb"; });
            cmp._storage = $A.storageService.initStorage("browserdb-testReplaceTooLarge",
                    true, false, maxSize, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testReplaceTooLarge"); });

            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage1(cmp, cmp._storage);
        },
        function getItem(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage2(cmp, cmp._storage);
        }]
    },

    waitForIframeLoad: function(cmp) {
        $A.test.addWaitFor(true, function() {
            return cmp._frameLoaded
                   && document.getElementById("myFrame").contentWindow.$A
                   && document.getElementById("myFrame").contentWindow.$A.getRoot() !== undefined;
        });
    }
})
