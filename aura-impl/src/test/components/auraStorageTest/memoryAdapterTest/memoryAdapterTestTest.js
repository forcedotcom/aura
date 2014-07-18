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
            $A.test.assertEquals(0, this.adapter.getSize());
        }
    },

    testSizeOneObject : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            $A.test.assertEquals(40, this.adapter.getSize());
        }
    },

    testSizeSameKeySameObject : {
        test : function(cmp) {
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            var originalSize = this.adapter.getSize();

            // do nothing and the size should not have changed
            $A.test.assertEquals(originalSize, this.adapter.getSize());

            // add another object to trigger a recalculation of size
            this.adapter.setItem("key2", {});
            // size should be the original + the 8 for the new key
            $A.test.assertEquals(originalSize + (8), this.adapter.getSize());
        }
    },

    testSizeSameKeyEqualObject : {
        test : function(cmp) {
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            var originalSize = this.adapter.getSize();

            // set the key with an equal (===) object.
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            // the size should not have changed
            $A.test.assertEquals(originalSize, this.adapter.getSize());
        }
    },

    testSizeSameKeyDifferentObject : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            $A.test.assertEquals(40, this.adapter.getSize());

            // key: 4 chars = 8 bytes
            // value: ~45 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "epsilon",
                    "gamma" : "zeta",
                    "now" : true
                }
            });

            $A.test.assertEquals(53, this.adapter.getSize());
        }
    },

    testSizeMultipleObjects : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            // key: 4 chars = 8 bytes
            // value: ~34 bytes
            this.adapter.setItem("key2", {
                "value" : {
                    "alpha" : "epsilon",
                    "gamma" : "zeta"
                }
            });
            // key: 4 chars = 8 bytes
            // value: ~31 bytes
            this.adapter.setItem("key3", {
                "value" : {
                    "alpha" : "eta",
                    "gamma" : "theta"
                }
            });
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key4", {
                "value" : {
                    "alpha" : "iota",
                    "gamma" : "kappa"
                }
            });

            $A.test.assertEquals(40+42+39+40, this.adapter.getSize());
        }
    },

    testSizeAfterRemoveKey : {
        test : function(cmp) {
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "beta",
                    "gamma" : "delta"
                }
            });
            // key: 4 chars = 8 bytes
            // value: ~32 bytes
            this.adapter.setItem("key2", {
                "value" : {
                    "alpha" : "iota",
                    "gamma" : "kappa"
                }
            });
            $A.test.assertEquals(40+40, this.adapter.getSize());

            this.adapter.removeItem("key1");
            // removing the key, removes it from this.storage
            $A.test.assertEquals(40, this.adapter.getSize());

            // adding a new key
            // key: 4 chars = 8 bytes
            // value: ~34 bytes
            this.adapter.setItem("key1", {
                "value" : {
                    "alpha" : "epsilon",
                    "gamma" : "zeta"
                }
            });
            $A.test.assertEquals(40+42, this.adapter.getSize());
        }
    },

    testLeastRecentlyUsedEviction : {
        test : [ function(cmp) {
            var adapter = this.adapter;

            // key: 4 chars = 8 bytes
            // value: ~265 bytes
            adapter.setItem("key1", {
                "value" : {
                    "foo" : new Array(256).join("x")
                }
            });
            var size1 = adapter.getSize();
            $A.test.assertEquals(273, size1);
            $A.test.assertEquals("key1", adapter.getMRU().toString());

            // key: 4 chars = 8 bytes
            // value: ~521 bytes
            adapter.setItem("key2", {
                "value" : {
                    "bar" : new Array(512).join("y")
                }
            });
            var size2 = adapter.getSize();
            $A.test.assertEquals(273+529, size2);
            $A.test.assertEquals("key1,key2", adapter.getMRU().toString());
        }, function(cmp) {
            var adapter = this.adapter;
            // Touch key1 to move it up to the top of the MRU
            // Oldest (key2) item should have been evicted
            var item1WasTouched;
            $A.test.addWaitFor(true, function() {
                adapter.getItem("key1", function(item) {
                    item1WasTouched = !$A.util.isUndefined(item);
                });

                return item1WasTouched;
            }, function(cmp) {
                $A.test.assertEquals("key2,key1", adapter.getMRU().toString());

                // key: 4 chars = 8 bytes
                // value: ~3309 bytes
                adapter.setItem("key3", {
                    "value" : {
                        "baz" : new Array(3300).join("z")
                    }
                });

                // Oldest (key2) item should have been evicted
                var itemWasEvicted;
                $A.test.addWaitFor(true, function() {
                    adapter.getItem("key2", function(item) {
                        itemWasEvicted = $A.util.isUndefined(item);
                    });

                    return itemWasEvicted;
                }, function(cmp) {
                    $A.test.assertEquals(273+3317, adapter.getSize());
                    $A.test.assertEquals("key1,key3", adapter.getMRU().toString());
                });
            });
        },
        // Complete eviction
        function(cmp) {
            var adapter = this.adapter;
            // Add a new key which would require all the current entries to be
            // evicted
            // key: 4 chars = 8 bytes
            // value: ~4009 bytes
            adapter.setItem("key4", {
                "value" : {
                    "buz" : new Array(4000).join("w")
                }
            });
            var size1 = adapter.getSize();
            $A.test.assertEquals(4017, size1);
            $A.test.assertEquals("key4", adapter.getMRU().toString());
        } ]
    },

    testSetItemOverMaxSize : {
            test : function(cmp) {
                var adapter = this.adapter;
                try {
                    adapter.setItem("overSize", {
                        "value" : {
                            "BigMac" : new Array(5000).join("x")
                        }
                    });

                    $A.test.fail("Test should not reach here an error should be thrown");
                } catch (error) {
                    $A.test.assertEquals("MemoryStorageAdapter.setItem() cannot store an item over the maxSize", error);
                }
            }
    }
})
