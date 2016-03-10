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

    testFallbackModeReported: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            $A.test.assertFalse(this.storage.isPersistent(), "CryptoAdapter should be in fallback mode so not persistent");
        }]
    },

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

    // memory storage stores the actual object so functions are not serialized to strings
    _testGetFunctionValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetFunctionValue(cmp, this.storage);
        }
    },

    // memory storage stores the actual object so error values are possible
    _testGetErrorValue: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetErrorValue(cmp, this.storage);
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

    testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage1(cmp, this.storage);
        },
        function getItem(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage2(cmp, this.storage);
        }]
    },

    // memory storage stores the actual object so cyclic objects are possible
    _testCyclicObjectFails: {
        test: function(cmp){
            cmp.helper.lib.storageTest.testCyclicObjectFails(cmp, this.storage);
        }
    },

    // memory storage stores the actual object so changing the object changes the persisted object
    _testModifyObject: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testModifyObject(cmp, this.storage);
        }
    },

    testUpdate: {
        test:function(cmp){
            cmp.helper.lib.storageTest.testUpdate(cmp, this.storage);
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
                var die = function(error) { completed=true; cmp.helper.lib.storageTest.dieDieDie(cmp, error); }.bind(this);
                var completed = false;
                storage.get("valueTooLarge")
                    .then(function (item) {
                        completed = true;
                        $A.test.assertUndefinedOrNull(item, "value too large should not be stored.");
                    })['catch'](die);
                $A.test.addWaitFor(true, function() { return completed; });
            }]
    },

    testGetAll: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetAll(cmp, this.storage);
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

    testStorageInfo: {
        test:[function(cmp){
            // do a get so next test stage is run after adapter finishes initializing
            cmp.helper.lib.storageTest.testGetNullValue(cmp, this.storage);
        },
        function(cmp){
            cmp.helper.lib.storageTest.testStorageInfo(this.storage, false, true);
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
