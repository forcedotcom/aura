({
    // When crypto key retrieval fails, we use memory storage as alternative

    // Must be run on https or localhost otherwise CryptoAdapter will not register
    labels : [ "UnAdaptableTest" ],

    setUp : function(cmp) {
        $A.installOverride("StorageService.selectAdapter", function(){ return "crypto" }, this);
        $A.storageService.CryptoAdapter.register();
        if (!$A.storageService.isRegisteredAdapter($A.storageService.CryptoAdapter.NAME)) {
            $A.test.fail("CryptoAdapter failed to register. You must run these tests against localhost or with HTTPS (see http://sfdc.co/bO9Hok).");
        }

        this.storage = this.createStorage("crypto-store", 32768, 2000, 3000);
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store"); });

        // provide an invalid key to force CryptoAdapter into fallback mode (which uses memory adapter internally)
        $A.storageService.CryptoAdapter.setKey("invalid");
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
            return cmp.helper.lib.storageTest.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp.helper.lib.storageTest.testGetName(cmp, this.storage, "crypto");
        }
    },

   testGetMaxSize:{
        test:function(cmp){
            cmp.helper.lib.storageTest.testGetMaxSize(this.storage, 32);
        }
    },

    testEmptyStringKey: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testEmptyStringKey(cmp, this.storage);
        }
    },

    testGetNullValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        }
    },

    testGetUndefinedValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetUndefinedValue(cmp, this.storage);
        }
    },

    testGetBooleanTrueValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetBooleanTrueValue(cmp, this.storage);
        }
    },

    testGetZeroValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetZeroValue(cmp, this.storage);
        }
    },

    testGetSimpleStringValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetSimpleStringValue(cmp, this.storage);
        }
    },

    testGetEmptyObjectValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetEmptyObjectValue(cmp, this.storage);
        }
    },

    testGetBasicObjectValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetBasicObjectValue(cmp, this.storage);
        }
    },

    testGetEmptyArrayValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetEmptyArrayValue(cmp, this.storage);
        }
    },

    testGetBasicArrayValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetBasicArrayValue(cmp, this.storage);
        }
    },

    testGetBigArrayValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetBigArrayValue(cmp, this.storage);
        }
    },

    testGetMultiByteStringValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetMultiByteStringValue(cmp, this.storage);
        }
    },

    testGetFunctionValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetFunctionValue(cmp, this.storage);
        }
    },

    testGetErrorValue: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetErrorValue(cmp, this.storage);
        }
    },

    testCacheMiss: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testCacheMiss(cmp, this.storage);
        }
    },

    testSetItemUnderMaxSize : {
        test : function(cmp) {
            return cmp.helper.lib.storageTest.testSetItemUnderMaxSize(cmp, this.storage, "Item smaller than size limit");
        }
    },

    testSetItemOverMaxSize : {
        test : function(cmp) {
            return cmp.helper.lib.storageTest.testSetItemOverMaxSize(cmp, this.storage, "Item larger than size limit");
        }
    },

    testGetAll: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testGetAll(cmp, this.storage);
        }
    },

    testReplaceExistingWithEntryTooLarge: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge(cmp, this.storage);
        }
    },

    testStorageInfo: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            return cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            cmp.helper.lib.storageTest.testStorageInfo(this.storage, false, true);
        }]
    },

    testCyclicObjectFails: {
        test: function(cmp){
            return cmp.helper.lib.storageTest.testCyclicObjectFails(cmp, this.storage);
        }
    },

    testModifyObject: {
        test:function(cmp){
            return cmp.helper.lib.storageTest.testModifyObject(cmp, this.storage);
        }
    },

    testModifyGetAllObject: {
        test:function(cmp){
            return cmp.helper.lib.storageTest.testModifyGetAllObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            return cmp.helper.lib.storageTest.testUpdate(cmp, this.storage);
        }
    },

    testOverflow: {
        test: function(cmp) {
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-overflow"); });
            return cmp.helper.lib.storageTest.testOverflow(cmp, storage);
        }
    },

    testClear:{
        test:function(cmp){
            return cmp.helper.lib.storageTest.testClear(cmp, this.storage);
        }
    },

    testBulkGetInnerItemNotInStorage: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testBulkGetInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkGetOuterItemsNotInStorage: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testBulkGetOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    testBulkSet: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testBulkSet(cmp, this.storage);
        }
    },

    testBulkSetLargerThanMaxSize: {
        test: function(cmp) {
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-overflow"); });
            return cmp.helper.lib.storageTest.testBulkSetLargerThanMaxSize(cmp, storage);
        }
    },

    testBulkRemoveInnerItemNotInStorage: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testBulkRemoveInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkRemoveOuterItemsNotInStorage: {
        test: function(cmp) {
            return cmp.helper.lib.storageTest.testBulkRemoveOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    /**
     * Tests that verify behavior specific to CryptoAdapter in fallback mode.
     */

    testFallbackModeReported: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            return cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            $A.test.assertFalse(this.storage.isPersistent(), "CryptoAdapter should be in fallback mode so not persistent");
        }]
    },

    testValueTooLarge: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage("crypto-store");
            return storage.remove("valueTooLarge")
                .then(function() {
                    return storage.set("valueTooLarge", new Array(32768).join("x"));
                })
                .then(function() {
                    $A.test.fail("Expected promise to reject trying to store item too large ")
                }, function(e) {
                    // put promise back in resolved state
                })
                .then(function() {
                    return storage.get("valueTooLarge");
                })
                .then(function(value) {
                    $A.test.assertUndefinedOrNull(value, "value too large should not be stored.");
                });
        }
    },

    /**
     * TODO: when we store an Error object it stores without issue but when we retrieve it there is no value.
     */
    testPutErrorValueFails: {
        test: function(cmp) {
            var that = this;
            return this.storage.set("testErrorValue", new Error("hello, error"))
                .then(function() {
                }, function(e) {
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
    }
})
