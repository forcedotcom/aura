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
        this.adapter = new $A.storageService.createAdapter("memory", "test", 4096, true);
    },

    testSizeInitial : {
        test : function(cmp) {
            var completed = false;
            this.adapter.getSize().then(function(size) {$A.test.assertEquals(0, size)})
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeOneObject : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            var that = this;
            var completed = false;
            that.adapter.setItem("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } })
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40, size); })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeySameObject : {
        test : function(cmp) {
            var adapter = this.adapter;
            var size1 = NaN;
            var size2 = NaN;
            var size3 = NaN;
            var completed = false;
            adapter.setItem("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" }})
                .then(function() { return adapter.getSize(); })
                .then(function(size) { size1 = size; })
                .then(function() { return adapter.getSize();})
                .then(function(size) { size2 = size; })
                .then(function() {return adapter.setItem("key2", {});})
                .then(function() {return adapter.getSize();})
                .then(function(size) { size3 = size; })
                .then(
                    function(args) {
                        // do nothing and the size should not have changed
                        $A.test.assertEquals(size1, size2);

                        // add another object to trigger a recalculation of size
                        // size should be the original + the 8 for the new key
                        $A.test.assertEquals(size1 + (8), size3);

                        completed = true;
                    },
                    function(err) {
                        $A.test.fail("Failed testSizeSameKeySameObject." + err);
                    }
            )

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeyEqualObject : {
        test : function(cmp) {
            var that = this;
            var originalSize = NaN;
            var completed = false;
            this.adapter.setItem("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } })
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { originalSize = size; })
                .then(function() { return that.adapter.setItem("key1", { "value" : { "alpha" : "beta", "gamma" : "delta" } }); })
                // the size should not have changed
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(originalSize, size) })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); })

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeSameKeyDifferentObject : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            var that = this;
            var completed = false;
            this.adapter.setItem("key1", {"value" : {"alpha" : "beta","gamma" : "delta" } })
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40, size); })
                .then(function() { return that.adapter.setItem("key1", {"value" : {"alpha" : "epsilon","gamma" : "zeta","now" : true }}) })
                // key: 4 chars = 8 bytes
                // value: ~45 bytes
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(53, size); })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeMultipleObjects : {
        test : function(cmp) {
            var adapter = this.adapter;
            var completed = false;
            $A.util.when(
                // key: 4 chars = 8 bytes
                // value: ~32 bytes
                adapter.setItem("key1", {
                    "value" : {
                        "alpha" : "beta",
                        "gamma" : "delta"
                    }
                }),
                // key: 4 chars = 8 bytes
                // value: ~34 bytes
                adapter.setItem("key2", {
                    "value" : {
                        "alpha" : "epsilon",
                        "gamma" : "zeta"
                    }
                }),
                // key: 4 chars = 8 bytes
                // value: ~31 bytes
                adapter.setItem("key3", {
                    "value" : {
                        "alpha" : "eta",
                        "gamma" : "theta"
                    }
                }),
                // key: 4 chars = 8 bytes
                // value: ~32 bytes
                adapter.setItem("key4", {
                    "value" : {
                        "alpha" : "iota",
                        "gamma" : "kappa"
                    }
                })
            )
                .then(function() { return adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40+42+39+40, size); })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSizeAfterRemoveKey : {
        test : function(cmp) {
            var that = this;
            var completed = false;
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            $A.util.when(
                that.adapter.setItem("key1", {"value" : {"alpha" : "beta","gamma" : "delta"}}),
                that.adapter.setItem("key2", {"value" : {"alpha" : "iota","gamma" : "kappa"}})
            )
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40+40, size); })
                // removing the key, removes it from this.storage
                .then(function() { return that.adapter.removeItem("key1"); } )
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40, size); })
                // adding a new key
                // key: 4 chars = 8 bytes
                // value: ~34 bytes
                .then(function() { return that.adapter.setItem("key1", {"value" : {"alpha" : "epsilon", "gamma" : "zeta"}}) })
                .then(function() { return that.adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(40+42, size); })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testLeastRecentlyUsedEviction : {
        test : function(cmp) {
            var adapter = this.adapter;
            var completed = false;
            adapter.setItem("key1", {"value" : {"foo" : new Array(256).join("x")}})
                // key: 4 chars = 8 bytes
                // value: ~265 bytes
                .then(function() { return adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(273, size); })
                .then(function() { return adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals("key1", mru.toString()); })

                // key: 4 chars = 8 bytes
                // value: ~521 bytes
                .then(function() { return adapter.setItem("key2", { "value" : { "bar" : new Array(512).join("y")}})})
                .then(function() { return adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(273+529, size); })
                .then(function() { return adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals("key1,key2", mru.toString()); })

                // Touch key1 to move it up to the top of the MRU
                .then(function() {return adapter.getItem("key1"); })
                .then(function(item) { return adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals("key2,key1", mru.toString()); })

                // Add another item to push out the oldest item
                // Oldest (key2) item should have been evicted
                // key: 4 chars = 8 bytes
                // value: ~3309 bytes
                .then(function() { return adapter.setItem("key3", {"value" : {"baz" : new Array(3300).join("z")}}); })
                .then(function() { return adapter.getItem("key2"); })
                .then(function(item) { $A.util.isUndefined(item); })
                .then(function() { return adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(273+3317, size); })
                .then(function() { return adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals("key1,key3", mru.toString()); })

                // Complete eviction
                // Add a new key which would require all the current entries to be evicted
                // key: 4 chars = 8 bytes
                // value: ~4009 bytes
                .then(function() { return adapter.setItem("key4", { "value" : { "buz" : new Array(4000).join("w") }}); })
                .then(function() { return adapter.getSize(); })
                .then(function(size) { $A.test.assertEquals(4017, size); })
                .then(function() { return adapter.getMRU(); })
                .then(function(mru) { $A.test.assertEquals("key4", mru.toString()); } )
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSetItemOverMaxSize : {
        test : function(cmp) {
            var that = this;
            var result = "";
            that.adapter.setItem("overSize", { "value" : { "BigMac" : new Array(5000).join("x") } })
                .then(
                    function() { throw "Should not be called"; },
                    function(error) { result = error;}
                );

            $A.test.addWaitFor('MemoryStorageAdapter.setItem() cannot store an item over the maxSize',
                function() { return result; })
        }
    }
})
