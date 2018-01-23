({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // threadHostile - test modifies/deletes the persistent database.
    // UnAdaptableTest - must be run on https or localhost otherwise CryptoAdapter will not register
    labels : [ "threadHostile", "UnAdaptableTest" ],

    setUp : function(cmp) {
        cmp._storageLib = cmp.helper.storageLib.storageTest;
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;

        if (!$A.storageService.isRegisteredAdapter($A.storageService.CryptoAdapter.NAME)) {
            $A.test.fail("CryptoAdapter failed to register. You must run these tests against localhost or with HTTPS (see http://sfdc.co/bO9Hok).");
        }

        $A.installOverride("StorageService.selectAdapter", function(){ return "crypto"; }, this);
        this.storage = this.createStorage("crypto-store", 32768, 2000, 3000);
        $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("crypto-store"); });
    },

    tearDown : function(cmp) {
        // verify adapter in tear down so any adapter fallback would've occurred
        $A.test.assertEquals("crypto", this.storage.getName(), "CryptoAdapter not used in test. Did CryptoAdapter fail initialization and trigger adapter fallback?");
    },


    createStorage: function(name, maxSize, expiration, autoRefreshInterval) {
        // StorageService.selectAdapter override ensures crypto is always returned
        return $A.storageService.initStorage({
            name: name,
            maxSize: maxSize,
            expiration: expiration,
            autoRefreshInterval: autoRefreshInterval,
            debugLogging: true
        });
    },

    /**
     * Test cases common to all adapters. Implementations in storageTest.js
     */

    testSizeInitial: {
        test: function(cmp) {
            return cmp._storageLib.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp._storageLib.testGetName(cmp, this.storage, "crypto");
        }
    },

   testGetMaxSize: {
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

    testGetFunctionValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetFunctionValue(cmp, this.storage);
        }
    },

    testGetErrorValue: {
        test: function(cmp) {
            return cmp._storageLib.testGetErrorValue(cmp, this.storage);
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
            return cmp._storageLib.testReplaceExistingWithEntryTooLarge(cmp, this.storage);
        }
    },

    testStorageInfo: {
        test: function(cmp) {
            return cmp._storageLib.testStorageInfo(this.storage, true, true);
        }
    },

    testCyclicObjectFails: {
        test: function (cmp) {
            return cmp._storageLib.testCyclicObjectFails(cmp, this.storage);
        }
    },

    testModifyObject: {
        test:function(cmp){
            return cmp._storageLib.testModifyObject(cmp, this.storage);
        }
    },

    testModifyGetAllObject: {
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
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("crypto-store-overflow"); });

            return cmp._storageLib.testOverflow(cmp, storage);
        }
    },

    testClear: {
        test:function(cmp){
            return cmp._storageLib.testClear(cmp, this.storage);
        }
    },

    testClearThenKeyChangeAndReload: {
        test: [
           function loadComponentInIframe(cmp) {
                $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("persistentStorageCmp"); });
                return cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=true",
                        "iframeContainer", "first load");
           },
           function setKeyAndClearStorage(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey(1));

                var targetStorage = iframeCmp._storage;
                return targetStorage.clear();
           },
           function addItemToStorage(cmp) {
                var targetStorage = cmp._iframeLib.getIframeRootCmp()._storage;
                return targetStorage.set("key1", cmp._expected);
           },
           function reloadIframe(cmp) {
               return cmp._iframeLib.reloadIframe(cmp, false, "first reload");
           },
           function changeKeyAndGetItemFromStorage(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey(2));

                var targetStorage = iframeCmp._storage;
                return targetStorage.get("key1").
                    then(function(value) {
                        $A.test.assertUndefined(value, "Found unexpected item from storage.");
                    });
            }
        ]
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
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("crypto-store-overflow"); });
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
     * Tests that verify behavior specific to CryptoAdapter.
     */

    /**
     * TODO: when we store an Error object it stores without issue but when we retrieve it there is no value.
     */
    testPutErrorValueFails: {
        test: function(cmp) {
            var that = this;
            return this.storage.set("testErrorValue", new Error("hello, error"))
                .then(undefined, function(e) {
                    // put back in resolved state
                    cmp._storageLib.appendLine(cmp, e.message);
                })
                .then(function() { return that.storage.get("testErrorValue"); })
                .then(
                    function(value) {
                        $A.test.assertDefined(value, "Could not retrieve Error object");
                        // TODO: ideally this would have the error object, or fail earlier and let the user know
                        // we can't store it
                    }
                );
        }
    },

    testValueTooLarge: {
        test: function(cmp) {
                var storage = $A.storageService.getStorage("crypto-store");
                return storage.remove("valueTooLarge")
                    .then(function () {
                        return storage.set("valueTooLarge", new Array(32768).join("x"));
                    }).then(function() {
                        $A.test.fail("Successfully stored value that is too large");
                    }, function(e) {
                        cmp._storageLib.appendLine(cmp, e.message);
                    })
                    .then(function() {
                        return storage.get("valueTooLarge");
                    })
                    .then(function (value) {
                        $A.test.assertUndefinedOrNull(value, "value too large should not be stored.");
                    });
            }
    },

    /**
     * Store an item in the database and reload the page (iframe) to verify data is persisted.
     * Flapping in jenkins, disable it for now.
     */
    _testReloadPage: {
        test: [
            function loadComponentInIframe(cmp) {
                $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("persistentStorageCmp"); });
                cmp._expected = "expected";
                return cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=true",
                        "iframeContainer", "first load");
            },
            function addItemToStorage(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey(1));

                var targetStorage = iframeCmp._storage;
                return targetStorage.set("key1", cmp._expected)
                    .then(function() {
                        return targetStorage.get("key1");
                    })
                    .then(function(value) {
                        // Make sure test setup is ready.
                        // There is just a warning when crypto adapter fails to initialize.
                        $A.test.assertEquals("crypto", targetStorage.getName(),
                                "Test setup fails: adapter falls back to alternative adapter");
                        $A.test.assertEquals(cmp._expected, value, "Failed to add item to storage");
                    });
            },
            function reloadIframe(cmp) {
                return cmp._iframeLib.reloadIframe(cmp, false, "first reload");
            },
            function getItemFromStorage(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                // same encryption key
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey(1));

                var targetStorage = iframeCmp._storage;
                return targetStorage.get("key1").
                    then(function(value) {
                        $A.test.assertEquals("crypto", targetStorage.getName(),
                                "Adapter falls back to alternative adapter");
                        $A.test.assertEquals(cmp._expected, value, "Found unexpected item from storage after page reload");
                    });
            }
        ]
    },

    /**
     * When the encryption key provided cannot decrypt the sentinel entry, we should clear storage
     */
    testDifferentEncryptKeysShouldClearStorage: {
        test: [
            function loadComponentInIframe(cmp) {
                $A.test.addCleanup(function(){ return $A.storageService.deleteStorage("persistentStorageCmp"); });
                return cmp._iframeLib.loadIframe(cmp, "/auraStorageTest/persistentStorage.app?secure=true",
                        "iframeContainer", "first load");
            },
            function clearStorageAndAddItem(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey(1));

                var targetStorage = iframeCmp._storage;
                return targetStorage.clear()
                    .then(function() {
                        return targetStorage.set("key1", "value1");
                    })
                    .then(function() {
                        return targetStorage.getSize();
                    });
            },
            function reloadFrame(cmp) {
                return cmp._iframeLib.reloadIframe(cmp, false, "first reload");
            },
            function verifyNoItemWithDifferentKeyAndStorageCleared(cmp) {
                var iframeCmp = cmp._iframeLib.getIframeRootCmp();
                // Provide different key
                iframeCmp.helper.setEncryptionKey(this.createCryptoKey("Z"));

                var targetStorage = iframeCmp._storage;
                return targetStorage.get("key1")
                    .then(function(value) {
                        $A.test.assertUndefined(value, "Got unexpected item from storage.");
                    })
                    .then(function(value) {
                        return targetStorage.getSize();
                    })
                    .then(function(value) {
                        $A.test.assertEquals(0, value, "Storage should be cleared.");
                    });
            }
        ]
    },

    /**
     * Verify getAll() returns decryptable items from storage and doesn't reject entire request
     * if decrpt fails.
     */
    testGetAllReturnsDecryptableItems: {
        test: function(cmp) {
            var that = this;
            var emptyCipherAndIv = [
                    "key2",
                    {
                        expires : new Date().getTime() + 60000,
                        value: {
                            cipher: new ArrayBuffer(),
                            iv: new Uint8Array()
                        },
                    },
                    10
                ];
            var absentValue = [
               "key3",
                    {
                        expires : new Date().getTime() + 60000
                        // value is absent
                    },
                    5
                ];

            return this.storage.set("key1", "decryptable")
                .then(function() {
                    return $A.test.storageAdapterSetItems(that.storage, [emptyCipherAndIv, absentValue]);
                })
                .then(function() {
                    return that.storage.getAll();
                })
                .then(function(items) {
                    $A.test.assertEquals(1, Object.keys(items).length,
                            "getAll() should return one key-value pair added with the latest secret key:" + JSON.stringify(items));
                    $A.test.assertEquals("decryptable", items["key1"]);
                })
        }
    },

    testDeleteDatabase: {
        test: [
        function waitForDatabaseInitialize(cmp) {
            // Wait for an arbritrary command to complete so we know DB is initialized
            // This is necessary only on slower browsers when the first command we run is a delete
            return $A.storageService.getStorage("crypto-store").getSize();
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
                        window.indexedDB.webkitGetDatabaseNames().onerror = function(e) {
                            $A.test.fail(e.toString());
                        };
                    } else {
                        completed = true;
                    }
                })
                .catch(cmp._failTest);

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
            return $A.storageService.getStorage("crypto-store").getSize();
        },
        function deleteDatabaseTwice(cmp) {
            var dbName = "crypto-store";

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
        function waitForDatabaseInitialize(cmp) {
            // Wait for an arbritrary command to complete so we know DB is initialized
            // This is necessary only on slower browsers when the first command we run is a delete
            $A.storageService.getStorage("crypto-store").getSize();
        },
        function deleteAndRecreateDatabase(cmp) {
            var completed = false;
            cmp._dbName = "crypto-store";
            var that = this;
            return $A.storageService.deleteStorage(cmp._dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(cmp._dbName));
                    return that.createStorage(cmp._dbName, 32768, 2000, 3000);
                })
                .then(function() {
                    $A.test.assertDefined($A.storageService.getStorage(cmp._dbName));
                })
                .then(function() {
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
                });
        }]
    },

    /**
     * Creates a basic 32-byte crypto key.
     * @param {Number} n The value to repeat in the key.
     * @return {Array} A 32-byte crypto key.
     */
    createCryptoKey: function(n) {
        var key = new Array(32);
        for (var i = 0; i < key.length; i++) {
            key[i] = n;
        }
        return key;
    }
})
