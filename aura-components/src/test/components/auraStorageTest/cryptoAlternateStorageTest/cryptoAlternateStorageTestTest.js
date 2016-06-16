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
            cmp.helper.lib.storageTest.testSizeInitial(this.storage);
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

    testGetFunctionValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetFunctionValue(cmp, this.storage);
        }
    },

    testGetErrorValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetErrorValue(cmp, this.storage);
        }
    },

    testCacheMiss: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testCacheMiss(cmp, this.storage);
        }
    },

    testSetItemUnderMaxSize : {
        test : [function(cmp) {
            cmp.helper.lib.storageTest.testSetItemUnderMaxSize(cmp, this.storage, "Item smaller than size limit");
        }]
    },

    testSetItemOverMaxSize : {
        test : [function(cmp) {
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage1(cmp, this.storage, "Item larger than size limit");
        },
        function(cmp) {
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage2(cmp, this.storage);
        }]
    },

    testGetAll: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetAll(cmp, this.storage);
        }
    },

    testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage1(cmp, this.storage);
        },
        function getItem(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage2(cmp, this.storage);
        }]
    },

    testStorageInfo: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            cmp.helper.lib.storageTest.testStorageInfo(this.storage, false, true);
        }]
    },

    testCyclicObjectFails: {
        test: function(cmp){
            cmp.helper.lib.storageTest.testCyclicObjectFails(cmp, this.storage);
        }
    },

    testModifyObject: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testModifyObject(cmp, this.storage);
        }
    },

    testModifyGetAllObject: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testModifyGetAllObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testUpdate(cmp, this.storage);
        }
    },

    testOverflow: {
        test: function(cmp) {
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-overflow"); });
            cmp.helper.lib.storageTest.testOverflow(cmp, storage);
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

    testBulkGetInnerItemNotInStorage: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testBulkGetInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkGetOuterItemsNotInStorage: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testBulkGetOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    testBulkSet: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testBulkSet(cmp, this.storage);
        }
    },

    testBulkSetLargerThanMaxSize: {
        test: function(cmp) {
            var storage = this.createStorage("crypto-store-overflow", 5000, 2000, 3000);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("crypto-store-overflow"); });
            cmp.helper.lib.storageTest.testBulkSetLargerThanMaxSize(cmp, storage);
        }
    },

    testBulkRemoveInnerItemNotInStorage: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testBulkRemoveInnerItemNotInStorage(cmp, this.storage);
        }
    },

    testBulkRemoveOuterItemsNotInStorage: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testBulkRemoveOuterItemsNotInStorage(cmp, this.storage);
        }
    },

    /**
     * Tests that verify behavior specific to CryptoAdapter in fallback mode.
     */

    testFallbackModeReported: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            $A.test.assertFalse(this.storage.isPersistent(), "CryptoAdapter should be in fallback mode so not persistent");
        }]
    },

    testValueTooLarge: {
        test:[ function(cmp) {
                var completed = false;
                var storage = $A.storageService.getStorage("crypto-store");
                storage.remove("valueTooLarge")
                    .then(function() {
                        return storage.set("valueTooLarge", new Array(32768).join("x"));
                    }).then(function() {
                        $A.test.fail("Successfully stored value that is too large");
                        completed = true;
                    }, function() {
                        completed = true;
                    });
                    $A.test.addWaitFor(true, function() { return completed; });
            }, function(cmp) {
                var storage = $A.storageService.getStorage("crypto-store");
                var failTest = function(error) { completed=true; cmp._storageLib.failTest(cmp, error); }
                var completed = false;
                storage.get("valueTooLarge")
                    .then(function(value) {
                        completed = true;
                        $A.test.assertUndefinedOrNull(value, "value too large should not be stored.");
                    })['catch'](failTest);
                $A.test.addWaitFor(true, function() { return completed; });
            }]
    },

    /**
     * TODO: when we store an Error object it stores without issue but when we retrieve it there is no value.
     */
    testPutErrorValueFails: {
        test: function(cmp) {
            var that = this;
            var completed = false;
            var failTest = function(cmp, error) { cmp._storageLib.failTest(cmp, error); }
            this.storage.set("testErrorValue", new Error("hello, error"))
                .then(function() {
                    completed = true;
                }, function(e) {
                    cmp._storageLib.appendLine(cmp, e.message);
                })
                .then(function() { return that.storage.get("testErrorValue"); })
                .then(
                    function(value) {
                        $A.test.assertDefined(value, "Could not retrieve Error object");
                        // TODO: ideally this would have the error object, or fail earlier and let the user know
                        // we can't store it
                        completed = true;
                    },
                    function(err) { failTest(cmp, err); }
                );
            $A.test.addWaitFor(true, function(){ return completed; });
        }
    }
})
