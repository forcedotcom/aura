/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

({
    // A large part of these tests relies on the size of values placed
    // into storage and therefore SizeEstimator.js. The size of the
    // keys and values are given in comments. It's worth emphasizing
    // that SizeEstimator provides an estimate, not exact values, so
    // as SizeEstimator evolves to give more accurate estimates while
    // maintaining its performance these tests will have to be updated.

    setUp : function(cmp) {
        // must match AuraStorage.KEY_DELIMITER
        cmp.DELIMITER = ":";

        $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "memory"; });

        this.storage = $A.storageService.initStorage(
                    "memory-store",
                    false,   // persistent
                    true,    // secure
                    4096,
                    1000,
                    0,
                    true,    // debug logging
                    true);   // clear on init

        // direct reference to the adapter to call private functions
        this.adapter = this.storage.adapter;

        // for correctness though it's a noop for this adapter
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("memory-store"); });
    },

    testSizeInitial : {
        test : function(cmp) {
            cmp.helper.lib.storageTest.testSizeInitial(this.storage);
        }
    },

    testGetName : {
        test : function(cmp) {
            cmp.helper.lib.storageTest.testGetName(cmp, this.storage, "memory");
        }
    },

    testSizeOneObject : {
        test : function(cmp) {
            var that = this;
            var completed = false;
            that.storage.put("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(50, size*1024); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeySameObject : {
        test : function(cmp) {
            var that = this;
            var size1 = NaN;
            var size2 = NaN;
            var size3 = NaN;
            var completed = false;
            this.storage.put("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" }})
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { size1 = size; })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { size2 = size; })
                .then(function() { return that.storage.put("key2", {}); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { size3 = size; })
                .then(
                    function(args) {
                        // do nothing and the size should not have changed
                        $A.test.assertEquals(size1, size2);

                        // add another object to trigger a recalculation of size
                        // size should be the original + key2's object
                        that.assertSimilarSize(size1*1024 + 10, size3*1024);

                        completed = true;
                    },
                    function(err) {
                        $A.test.fail("Failed testSizeSameKeySameObject." + err);
                    }
            );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeyEqualObject : {
        test : function(cmp) {
            var that = this;
            var originalSize = NaN;
            var completed = false;
            this.storage.put("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { originalSize = size; })
                .then(function() { return that.storage.put("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } }); })
                // the size should not have changed
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { $A.test.assertEquals(originalSize, size); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeyDifferentObject : {
        test : function(cmp) {
            var that = this;
            var completed = false;
            this.storage.put("key1", {"value" : {"alpha":"beta", "gamma":"delta" } })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(50, size*1024); })
                .then(function() { return that.storage.put("key1", {"value" : {"alpha":"epsilon", "gamma":"zeta", "now" : true }}); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(63, size*1024); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeMultipleObjects : {
        test : function(cmp) {
            var that = this;
            var completed = false;
            Promise.all([
                    that.storage.put("key1", {
                            "value" : {
                                "alpha" : "beta",
                                "gamma" : "delta"
                            }
                    }),
                    that.storage.put("key2", {
                            "value" : {
                                "alpha" : "epsilon",
                                "gamma" : "zeta"
                            }
                    }),
                    that.storage.put("key3", {
                            "value" : {
                                "alpha" : "eta",
                                "gamma" : "theta"
                            }
                    }),
                    that.storage.put("key4", {
                            "value" : {
                                "alpha" : "iota",
                                "gamma" : "kappa"
                            }
                    })
                ])
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(201, size*1024); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeAfterRemoveKey : {
        test : function(cmp) {
            var that = this;
            var completed = false;
            Promise.all([
                that.storage.put("key1", {"value" : {"alpha" : "beta","gamma" : "delta"}}),
                that.storage.put("key2", {"value" : {"alpha" : "iota","gamma" : "kappa"}})
            ])
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(100, size*1024); })
                // remove one item from storage
                .then(function() { return that.storage.remove("key1"); } )
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(50, size*1024); })
                // put a new item with same key, different object
                .then(function() { return that.storage.put("key1", {"value" : {"alpha" : "epsilon", "gamma" : "zeta"}}); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(102, size*1024); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testLeastRecentlyUsedEviction : {
        test : function(cmp) {
            /**
             * Generates raw adapter keys values given a list of keys.
             * @param {String[]} keys storage keys from which the raw adapter keys are generated.
             * @return {String[]} raw adapter keys.
             */
            function generateRawAdapterKeys(keys) {
                var s = "";
                for (var i = 0; i < keys.length; i++) {
                    s+= cmp.DELIMITER + keys[i] + ",";
                }
                return s.slice(0, -1);
            }

            var that = this;
            var completed = false;
            this.storage.put("key1", {"value" : {"foo" : new Array(256).join("x")}})
                .then(function() { return that.adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals(":key1", mru.toString()); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(283, size*1024); })

                .then(function() { return that.storage.put("key2", { "value" : { "bar" : new Array(512).join("y")}}); })
                .then(function() { return that.adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals(generateRawAdapterKeys(["key1", "key2"]), mru.toString()); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(283+539, size*1024); })

                // touch key1 to move it up to the top of the MRU
                .then(function() {return that.storage.get("key1"); })
                .then(function(item) { return that.adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals(generateRawAdapterKeys(["key2", "key1"]), mru.toString()); })

                // add another item to push out the oldest item
                // oldest (key2) item should have been evicted
                .then(function() { return that.storage.put("key3", {"value" : {"baz" : new Array(3300).join("z")}}); })
                .then(function() { return that.storage.get("key2"); })
                .then(function(item) { $A.util.isUndefined(item); })
                .then(function() { return that.adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals(generateRawAdapterKeys(["key1", "key3"]), mru.toString()); })
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(283+3327, size*1024); })

                // complete eviction
                // add a new key which would require all the current entries to be evicted
                .then(function() { return that.storage.put("key4", { "value" : { "buz" : new Array(4000).join("w") }}); })
                .then(function() { return that.adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals(generateRawAdapterKeys(["key4"]), mru.toString()); } )
                .then(function() { return that.storage.getSize(); })
                .then(function(size) { that.assertSimilarSize(4027, size*1024); })
                .then(
                    function() { completed = true; },
                    function(err) { $A.test.fail(err); }
                );

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testGetMaxSize: {
        test:function(cmp) {
            cmp.helper.lib.storageTest.testGetMaxSize(this.storage, 4);
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

    testGetFunctionValue: {
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
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage1(cmp, this.storage, "cannot store an item over the maxSize");
        },
        function(cmp) {
            cmp.helper.lib.storageTest.testSetItemOverMaxSize_stage2(cmp, this.storage);
        }]
    },

    // TODO(W-2599085): Storages should clear existing entry after trying to put an item above the max size
    _testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            var expectedError = "MemoryAdapter.setItem() cannot store an item over the maxSize";
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage1(cmp, this.storage, expectedError);
        },
        function getItem(cmp) {
            cmp.helper.lib.storageTest.testReplaceExistingWithEntryTooLarge_stage2(cmp, this.storage);
        }]
    },

    testGetAll: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testGetAll(cmp, this.storage);
        }
    },

    testStorageInfo: {
        test: function(cmp) {
            cmp.helper.lib.storageTest.testStorageInfo(this.storage, false, true);
        }
    },

    testTwistedObject:{
        test: function(cmp){
            cmp.helper.lib.storageTest.testTwistedObject(cmp, this.storage);
        }
    },

    // TODO(tbliss): This fails because we just stick the javascript object in memory so changing it in the test
    //               changes the reference in storage.
    _testModifyObject:{
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
            cmp._storage = $A.storageService.initStorage("memory-testOverflow",
                    false, true, 5500, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("memory-testOverflow"); });

            cmp.helper.lib.storageTest.testOverflow_stage1(cmp, cmp._storage);
        }, function(cmp) {
            cmp.helper.lib.storageTest.testOverflow_stage2(cmp, cmp._storage);
        }]
    },

    testClear:{
        test:[function(cmp){
            cmp.helper.lib.storageTest.testClear_stage1(cmp, this.storage);
        },
        function(cmp){
            cmp.helper.lib.storageTest.testClear_stage2(cmp, this.storage);
        }]
    },

    /**
     * Memory adapter does not implement deleting the whole storage so calling delete will just remove the reference
     * to the storage from the storage service.
     */
    testDeleteStorage: {
        test: function(cmp) {
            var completed = false;
            var name = "memoryTest";
            $A.storageService.initStorage(name, false, true, 4096);
            $A.test.assertDefined($A.storageService.getStorage(name));

            $A.storageService.deleteStorage(name)
                .then(
                    function() {
                        $A.test.assertUndefined($A.storageService.getStorage(name));
                        completed = true;
                    },
                    function(){
                        $A.test.fail("Failed to delete storage");
                    }
                );

            $A.test.addWaitFor(true, function(){ return completed; });
        }
    },

    /**
     * Asserts that sizes are within an acceptable range of one another.
     * @param {Number} expected - the expected size (in bytes)
     * @param {Number} actual - the actual size (in bytes)
     */
    assertSimilarSize: function(expected, actual) {
        // range is arbitrarily picked to deal with javascript floating point calculations
        var range = 10;
        var delta = Math.abs(expected-actual);
        var acceptable = -range <= delta && delta <= range;
        $A.test.assertTrue(acceptable, "expected (" + expected + ") and actual (" + actual + ") not within acceptable range (" + range + ")");
    }
})
