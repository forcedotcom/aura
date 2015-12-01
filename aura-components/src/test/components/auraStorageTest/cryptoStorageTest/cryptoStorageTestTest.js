({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // threadHostile - test modifies/deletes the persistent database.
    // UnAdaptableTest - must be run on https or localhost otherwise CryptoAdapter will not register
    labels : [ "threadHostile", "UnAdaptableTest" ],

    setUp : function(cmp) {
        cmp._storageLib = cmp.helper.storageLib.storageTest;
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;

        if (!$A.storageService.isRegisteredAdapter($A.storageService.CryptoAdapter.NAME)) {
            $A.test.fail("CryptoAdapter failed to register. You must run these tests against localhost or with HTTPS (see http://sfdc.co/bO9Hok).");
        }

        $A.installOverride("StorageService.selectAdapter", function(){ return "crypto" }, this); 
        this.storage = this.createStorage("crypto-store", 32768, 2000, 3000);
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store"); });
    },

    testFallbackModeNotReported: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            cmp._storageLib.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            $A.test.assertTrue(this.storage.isPersistent(), "CryptoAdapter should not be in fallback mode so is persistent");
        }]
    },

    testSizeInitial: {
        test: function(cmp) {
            cmp._storageLib.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp._storageLib.testGetName(cmp, this.storage, "crypto");
        }
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

    testJsonErrorRejectsPut:{
        test: function (cmp) {
            var completed = false;
            var stuff = { "a": 2 };
            stuff["b"] = stuff;

            this.storage.put("testTwistedObject", stuff)
                .then(function() { return storage.get("testTwistedObject"); })
                .then(function() {
                    var fail = "Expecting JSON stringify error. JSON should NOT be able to encode circular references";
                    $A.test.fail(fail);
                }, function(e) {
                    cmp._storageLib.appendLine(cmp, e.message);
                    completed = true;
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

    testValueTooLarge: {
        test:[ function(cmp) {
                var completed = false;
                var storage = $A.storageService.getStorage("crypto-store");
                storage.remove("valueTooLarge")
                    .then(function () {
                        return storage.put("valueTooLarge", new Array(32768).join("x"));
                    }).then(function() {
                        $A.test.fail("Successfully stored value that is too large");
                        completed = true;
                    }, function() {
                        completed = true;
                    });
                    $A.test.addWaitFor(true, function() { return completed; });
            }, function(cmp) {
                var storage = $A.storageService.getStorage("crypto-store");
                var die = function(error) { completed=true; cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
                var completed = false;
                storage.get("valueTooLarge")
                    .then(function (item) {
                        completed = true;
                        $A.test.assertUndefinedOrNull(item, "value too large should not be stored.");
                    })['catch'](die);
                $A.test.addWaitFor(true, function() { return completed; });
            }]
    },

    testOverflow: {
        test:function(cmp) {
            // Due to differences in size calculation between adapters, pass in a storage with the correct size to
            // fill up the storage after 5 entries of a 512 character string.
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-overflow"); });

            cmp._storageLib.testOverflow(cmp, storage);
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
            cmp._storageLib.testStorageInfo(this.storage, true, true);
        }
    },

    /**
     * Store an item in the database and reload the page (iframe) to verify data is persisted.
     */
    testReloadPage: {
        test: [
        function loadComponentInIframe(cmp) {
            cmp._expected = "expected value";
            cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=true&value="
                    + cmp._expected, "iframeContainer");
        },
        function resetDatabase(cmp) {
            var iframeCmp = cmp._iframeLib.getIframeRootCmp();
            iframeCmp.setEncryptionKey(new Array(32).join("1"));
            iframeCmp.resetStorage();
            cmp._iframeLib.waitForStatus("Resetting", "Done Resetting");
        },
        function addItemToDatabase(cmp) {
            cmp._iframeLib.getIframeRootCmp().addToStorage();
            cmp._iframeLib.waitForStatus("Adding", "Done Adding");
        },
        function reloadIframe(cmp) {
            cmp._iframeLib.reloadIframe(cmp);
        },
        function getItemFromDatabase(cmp) {
            var iframeCmp = cmp._iframeLib.getIframeRootCmp();
            // same encryption key
            iframeCmp.setEncryptionKey(new Array(32).join("1"));
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

    /**
     * When the encryption key provided cannot decrypt the sentinel entry, we should clear storage
     */
    testDifferentEncryptKeysShouldClearStorage: {
        test: [
            function loadComponentInIframe(cmp) {
                cmp._expected = "expected value";
                cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=true&value="
                        + cmp._expected, "iframeContainer");
            },
            function resetDatabase(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                iframeCmp.setEncryptionKey(new Array(32).join("1"));
                iframeCmp.resetStorage();
                cmp._iframeLib.waitForStatus("Resetting", "Done Resetting");;
            },
            function addItemToDatabase(cmp) {
                cmp._iframeLib.getIframeRootCmp().addToStorage();
                cmp._iframeLib.waitForStatus("Adding", "Done Adding");
            },
            function reloadFrame(cmp) {
                cmp._iframeLib.reloadIframe(cmp);
            },
            function verifyNoItemWithDifferentKey(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                // Provide different key
                iframeCmp.setEncryptionKey(new Array(32).join("Z"));
                iframeCmp.getFromStorage();
                $A.test.addWaitFor(true, function() {
                    return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
                }, function() {
                    var actual = $A.util.getText(iframeCmp.find("output").getElement());
                    $A.test.assertEquals("undefined", actual, "Got unexpected item from storage after page reload");
                });
            },
            function cleanupDatabase(cmp) {
                cmp._iframeLib.getIframeRootCmp().deleteStorage();
            }]
    },

    testDeleteDatabase: {
        test: [
        function waitForDatabaseInitialize(cmp) {
            // Wait for an arbritrary command to complete so we know DB is initialized
            // This is necessary only on slower browsers when the first command we run is a delete
            cmp._die = function(error) { completed=true; cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
            var completed = false;

            $A.storageService.getStorage("crypto-store").getSize()
                .then(function() { completed = true; }, cmp._die);

            $A.test.addWaitFor(true, function(){ return completed;});
        },
        function deleteDatabase(cmp) {
            var dbName = "crypto-store";
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
                })['catch'](cmp._die);

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
        test: [
        function waitForDatabaseInitialize(cmp) {
            // Wait for an arbritrary command to complete so we know DB is initialized
            // This is necessary only on slower browsers when the first command we run is a delete
            cmp._die = function(error) { completed=true; cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
            var completed = false;

            $A.storageService.getStorage("crypto-store").getSize()
                .then(function() { completed = true; }, cmp._die);

            $A.test.addWaitFor(true, function(){ return completed;});
        },
        function deleteDatabaseTwice(cmp) {
            var completed = false;
            var dbName = "crypto-store";

            $A.storageService.deleteStorage(dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    return $A.storageService.deleteStorage(dbName);
                })
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    completed = true;
                })['catch'](cmp._die);

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },

    testDeleteAndRecreateDatabase: {
        test: [
        function waitForDatabaseInitialize(cmp) {
            // Wait for an arbritrary command to complete so we know DB is initialized
            // This is necessary only on slower browsers when the first command we run is a delete
            cmp._die = function(error) { completed=true; cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
            var completed = false;

            $A.storageService.getStorage("crypto-store").getSize()
                .then(function() { completed = true; }, cmp._die);

            $A.test.addWaitFor(true, function(){ return completed;});
        },
        function deleteAndRecreateDatabase(cmp) {
            var completed = false;
            cmp._dbName = "crypto-store";
            var that = this;
            $A.storageService.deleteStorage(cmp._dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(cmp._dbName));
                    that.createStorage(cmp._dbName, 32768, 2000, 3000);
                })
                .then(function() {
                    $A.test.assertDefined($A.storageService.getStorage(cmp._dbName));
                    completed = true;
                })['catch'](cmp._die);

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


    // TODO(W-2599085): Storages should clear existing entry after trying to put an item above the max size
    _testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            var maxSize = 5000;
            cmp._storage = this.createStorage("crypto-store-testReplaceTooLarge", maxSize, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-testReplaceTooLarge"); });
            cmp._die = function(error) { cmp._storageLib.dieDieDie(cmp, error); }.bind(this);
            var itemTooLarge = new Array(2560).join("x");
            var completed = false;

            cmp._storage.put("testReplaceExistingWithEntryTooLarge", "ORIGINAL")
                .then(function() { return cmp._storage.get("testReplaceExistingWithEntryTooLarge"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return cmp._storage.put("testReplaceExistingWithEntryTooLarge", itemTooLarge); })
                .then(function(){
                        $A.test.fail("Should not be able to save an item above the maxSize");
                     },
                     function(error){
                         var expectedMsg = "IndexedDBStorageAdapter.setItem(): Item larger than size limit of " + maxSize*0.25;
                         $A.test.assertEqual(expectedMsg, error, "Unexpected error message trying to save item too large");
                     })
                 .then(function() { completed = true; })['catch'](cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        },
        function getItem(cmp) {
            var completed = false;

            cmp._storage.get("testReplaceExistingWithEntryTooLarge")
                .then(function(item) { $A.test.assertEquals("", item.value, "Entry should be empty after attemping to put item too large"); })
                .then(function(){ completed = true;})['catch'](cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        }]
    },


    createStorage: function(name, maxSize, defaultExpiration, defaultAutoRefreshInterval) {
        return $A.storageService.initStorage(
                name,
                true,   // secure
                true,   // persistent
                maxSize,
                defaultExpiration,
                defaultAutoRefreshInterval,
                true,   // debug logging
                true);  // clear on init
    }
})
