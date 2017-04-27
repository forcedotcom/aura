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
function storageTest () {
    function logAndFailTest(cmp, thing) {
        var string;
        if (typeof thing === "string") {
            string = thing;
        } else {
            string = thing.message;
        }
        append(cmp, string);
        $A.test.fail(string);
    }

    function append(cmp, text) {
        $A.run(function() {
            var content = cmp.find("content");
            var body;
            var configs = [];
            configs[0] = ["aura:text", { "value": text }];
            configs[1] = ["aura:html", { "tag": "br" }];
            $A.createComponents(configs,
                function(newCmps, status, statusMessagesList) {
                    $A.test.assertEquals("SUCCESS", status, "$A.createComponents() failed: " + JSON.stringify(statusMessagesList));
                    if (content.isValid() && newCmps) {
                        body = content.get("v.body");
                        for (var i = 0; i < newCmps.length; i++) {
                            body.push(newCmps[i]);
                        }
                        content.set("v.body", body);
                    }
            });
        });
    }

    function runFullCycle(cmp, storage, key, value) {
        append(cmp, "set("+key+","+value+");");
        return storage.set(key, value)
            .then(function() {
                append(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(v) {
                append(cmp, "value="+v);
                if (value instanceof Error) {
                    $A.test.assertUndefined(v.message, "Expected an empty object because errors are not JSON serializable");
                } else if ($A.util.isObject(value)) {
                    for (var x in value) {
                        if (value.hasOwnProperty(x)) {
                            $A.test.assertEquals(value[x], v[x], "Failed object match on property "+x);
                        }
                    }
                } else if ($A.util.isArray(value)) {
                    $A.test.assertEquals(value.length, v.length, "Failed match on array length");
                    for (var i =0; i < value.length; i++) {
                        $A.test.assertEquals(value[i], v[i], "Failed match on array index "+i);
                    }
                } else if ($A.util.isFunction(value)) {
                    $A.test.assertEquals(value+"", v, "Failed match on serialized function definition");
                } else {
                    $A.test.assertEquals(value, v, "Failed initial get for "+value);
                }
                append(cmp, "remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                append(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(v) {
                append(cmp, "value="+v);
                $A.test.assertUndefinedOrNull(v, "remove failed");
            });
    }

    return {
        testSizeInitial: function(storage) {
            return storage.getSize()
                .then(function(size) { $A.test.assertEquals(0, size); });
        },

        testGetName: function(cmp, storage, expected) {
            append(cmp, "Name "+storage.getName());
            $A.test.assertEquals(expected, storage.getName());
        },

        testGetMaxSize: function(storage, expected) {
            $A.test.assertEquals(expected, storage.getMaxSize(), "testGetMaxSize: Failed to configure max size of storage");
        },

        testEmptyStringKey: function(cmp, storage) {
            return runFullCycle(cmp, storage, "");
        },

        testGetNullValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_Null", null);
        },

        testGetUndefinedValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_Undefined", undefined);
        },

        testGetBooleanTrueValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_True", true);
        },

        testGetZeroValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_Zero", 0);
        },

        testGetSimpleStringValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_A", "a");
        },

        testGetEmptyObjectValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_EmptyObject", {});
        },

        testGetBasicObjectValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_BasicObject", {"a": "b"});
        },

        testGetEmptyArrayValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_EmptyArray", []);
        },

        testGetBasicArrayValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_BasicArray", ["a", "b"]);
        },

        testGetBigArrayValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_BigArray", new Array(1024).join("x"));
        },

        testGetMultiByteStringValue: function(cmp, storage) {
            // 1-byte, 2-byte, 3-byte, and 4-byte characters, separated by spaces
            return runFullCycle(cmp, storage, "testValues_MutlibyteString", "I ½ ♥ 💩");
        },

        testGetFunctionValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_Function", function(){});
        },

        /**
         * Tests storing an item of value error works.
         */
        testGetErrorValue: function(cmp, storage) {
            return runFullCycle(cmp, storage, "testValues_Error", new Error("hello, error"));
        },

        testCacheMiss: function(cmp, storage) {
            return storage.get("iDontExist")
                .then(function(value){
                    $A.test.assertUndefined(value, "Expected to receive undefined on cache miss");
                });
        },

        testSetItemUnderMaxSize: function(cmp, storage) {
            var sizeTooBig = (storage.getMaxSize() - 1) * 1024;
            return storage.set("overSize", { "value" : { "LittleMac" : new Array(sizeTooBig).join("x") } });
        },

        testSetItemOverMaxSize: function(cmp, storage) {
            var key = "overSize";
            var result = "";
            var sizeTooBig = (storage.getMaxSize() + 1) * 1024;
            var expected = "AuraStorage.set() cannot store " + key;

            return storage.set(key, { "value" : { "BigMac" : new Array(sizeTooBig).join("x") } })
                .then(
                    function() { logAndFailTest(cmp, "Promise to set item too large should not be resolved"); },
                    function(error) {
                        $A.test.assertTrue(error.toString().indexOf(expected) > -1, "Did not receive expected error. Expected error "
                                + "to contain <" + expected +">, but got <" + error.toString() + ">");
                    }
                )
                .then(function() {
                    return storage.get("overSize");
                })
                .then(function (value) {
                   $A.test.assertUndefinedOrNull(value, "Value too large should not be stored.");
                });
        },

        testGetAll: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return Promise.all([
                    // a = key*2+1, b = a+1
                    storage.set("2", { "a" : 5, "b" : 6 }),
                    storage.set("0", { "a" : 1, "b" : 2 }),
                    storage.set("3", { "a" : 7, "b" : 8 }),
                    storage.set("1", { "a" : 3, "b" : 4 })
                ]);
            })
             .then(function() { return storage.getAll(); })
             .then(function(items) {
                     $A.test.assertEquals(4, Object.keys(items).length, "There should be 4 items");
                     var value, expected;
                     for (var k in items) {
                         value = items[k];
                         expected = (+k) * 2 + 1;
                         $A.test.assertEquals(expected, value["a"], "Item 'a' value should be " + expected);
                     }
                 });
        },

        testReplaceExistingWithEntryTooLarge: function(cmp, storage) {
            var key = "testReplaceExistingWithEntryTooLarge";
            var sizeTooBig = (storage.getMaxSize() + 1) * 1000;
            var itemTooLarge = new Array(sizeTooBig).join("x");

            var expected = "AuraStorage.set() cannot store " + key;

            return storage.set(key, "ORIGINAL")
                .then(function() { return storage.get("testReplaceExistingWithEntryTooLarge"); })
                .then(function(value) { $A.test.assertEquals("ORIGINAL", value); })
                .then(function() { return storage.set("testReplaceExistingWithEntryTooLarge", itemTooLarge); })
                .then(function(){
                        $A.test.fail("Should not be able to save an item above the maxSize");
                     },
                     function(result){
                         $A.test.assertTrue(result.toString().indexOf(expected) > -1, "Did not receive expected error. Expected error "
                                 + "to contain <" + expected +">, but got <" + result + ">");
                     })
                .then(function() {
                    return storage.get("testReplaceExistingWithEntryTooLarge");
                })
                .then(function(value) {
                    $A.test.assertEquals("ORIGINAL", value, "Original entry should be present after attempting to set item too large");
                });
        },

        testStorageInfo: function(storage, persistent, secure) {
            $A.test.assertEquals(persistent, storage.isPersistent(), "Unexpected value for persistent");
            $A.test.assertEquals(secure, storage.isSecure(), "Unexpected value for secure");
        },

        /**
         * Tests that an item with cycles can not be stored.
         */
        testCyclicObjectFails: function(cmp, storage) {
            var stuff = { "a": 2 };
            stuff["b"] = stuff;
            return storage.set("testCyclicObject", stuff)
                .then(
                    function() {
                        $A.test.fail("Expecting JSON stringify error. JSON should NOT be able to encode circular references");
                    },
                    function(e) {
                        append(cmp, e.message);
                    }
                )
                .then(function() { return storage.get("testCyclicObject"); })
                .then(
                    function(value){
                        $A.test.assertUndefined(value, "Expected to receive undefined on twisted object");
                    }
                );
        },

        testModifyObject: function(cmp, storage) {
            var stuff = { "changeling": 2 };
            return storage.set("testModifyObject", stuff)
                .then(function() {
                    stuff["changeling"] = 3;
                    return storage.get("testModifyObject");
                })
                .then(function(value) {
                    $A.test.assertEquals(2, value["changeling"],
                        "testModifyObject: Object changed while stored");
                });
        },

        testModifyGetAllObject: function(cmp, storage) {
            var stuff = { "changeling": 2 };
            return storage.set("testModifyObject", stuff)
                .then(function() {
                    return storage.getAll();
                })
                .then(function(items) {
                    $A.test.assertEquals(1, Object.keys(items).length, "Unexpected items returned by getAll()");
                    items["testModifyObject"].changeling = 3;
                    return storage.getAll();
                })
                .then(function(items) {
                    $A.test.assertEquals(1, Object.keys(items).length, "Unexpected items returned by getAll()");
                    $A.test.assertEquals(2, items["testModifyObject"].changeling, "Object changed while stored");
                });
        },

        testUpdate: function(cmp, storage) {
            return storage.set("testUpdate", "ORIGINAL")
                .then(function() { return storage.get("testUpdate"); })
                .then(function(value) { $A.test.assertEquals("ORIGINAL", value); })
                .then(function() { return storage.set("testUpdate", "DUPLICATE"); })
                .then(function() { return storage.get("testUpdate"); })
                .then(function(value) {
                    $A.test.assertEquals("DUPLICATE", value);
                    return storage.remove("testUpdate");
                });
        },


        /**
         * Fill storage up with multiple items until we go above the max size. Verify space is evicted from the storage
         * so max size is not exceeded.
         */
        testOverflow: function(cmp, storage) {
            var chunk = new Array(512).join("x");
            var keyLength = 14;
            // When SizeEstimator calculates the size it gives a value of 2 per string character so to get the total
            // size that will be added to storage we multiple 2 by the length of the chunk and key, times the number
            // of rows (5) , divided by 1024 to convert to KB.
            var totalSizeAdded = (chunk.length + keyLength) * 2 * 5 / 1024;
            var storageMax = storage.getMaxSize();
            $A.test.assertTrue(storage.getMaxSize() < totalSizeAdded, "Test setup failure: storage being tested is too"
                    + " large to properly test overflow");

            return Promise.all([
                storage.set("testOverflow.1", chunk),
                storage.set("testOverflow.2", chunk),
                storage.set("testOverflow.3", chunk),
                storage.set("testOverflow.4", chunk),
                storage.set("testOverflow.5", chunk)
            ])
            .then(function() {
                // IndexedDB has funky size calculation that doesn't properly get size until after a getAll
                return storage.getAll();
            })
            .then(function() {
                return storage.getSize();
            })
            .then(function() {
                // many adapters perform async sweeping when the size is detected as too large. therefore
                // loop until the test passes or times out waiting for the async sweep to occur.

                return new Promise(function(resolve, reject) {
                    function checkSize() {
                        // short-circuit once the test times out
                        if ($A.test.isComplete()) {
                            reject(new Error("Test timed out"));
                        }
                        storage.getSize()
                            .then(function(size) {
                                if (size < storageMax) {
                                    resolve();
                                    return;
                                }
                                // pause then recurse
                                window.setTimeout(function() { checkSize(); }, 250);
                            });
                    }

                    checkSize();
                });
            });
        },

        testClear: function(cmp, storage) {
            var value = new Array(1024).join("ツ");
            return storage.clear()
                .then(function() {
                    append(cmp, "finished clear");
                        return storage.getSize();
                    })
                .then(function(size) {
                        append(cmp, "size = "+size);
                        $A.test.assertTrue(size >= 0 && size <= 0.1,
                            "testClear: Expected size of 0, but got " + size);
                        append(cmp, "complete");
                })
                .then(function() {
                    return storage.set("key1", value);
                })
                .then(function() {
                    append(cmp, "added item");
                    return storage.get("key1");
                })
                .then(function(v) {
                    $A.test.assertEquals(value, v, "testClear: value set after clear was not retrievable");
                    return storage.getSize();
                })
                .then(function(size) {
                    append(cmp, "size = "+size);
                    // Size calculations vary across adapters so mostly just verify something was added
                    $A.test.assertTrue(size >= 1 && size <= 2.1, "testClear: Expected size of 1kb to 2kb, but got " + size);
                })
                .then(function() { return storage.clear(); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    append(cmp, "size = "+size);
                    $A.test.assertTrue(size >= 0 && size <= 0.1, "testClear: Expected size of 0, but got " + size);
                });
        },

        testBulkGetInnerItemNotInStorage: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return Promise.all([
                    storage.set("0", { "a" : 0 }),
                    storage.set("2", { "a" : 2 })
                ]);
            })
            .then(function() {
                return storage.getAll(["0", "1", "2"]);
            })
            .then(function(results) {
                     $A.test.assertEquals(2, Object.keys(results).length, "Unexpected number of items returned");
                     $A.test.assertDefined(results["0"], "Item of key '0' not returned in bulk get");
                     $A.test.assertEquals(results["0"]["a"], 0, "Unexpected value of 'a' on item '0'");
                     $A.test.assertDefined(results["2"], "Item of key '2' not returned in bulk get");
                     $A.test.assertEquals(results["2"]["a"], 2, "Unexpected value of 'a' on item '2'");
                     $A.test.assertUndefined(results["1"], "getAll returned item for key '1' not in storage");
                 });
        },

        testBulkGetOuterItemsNotInStorage: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return Promise.all([
                    storage.set("1", { "a" : 1 })
                ]);
            })
            .then(function() {
                return storage.getAll(["0", "1", "2"]);
            })
            .then(function(results) {
                     $A.test.assertEquals(1, Object.keys(results).length, "Unexpected number of items returned");
                     $A.test.assertDefined(results["1"], "Item of key '1' not returned in bulk get");
                     $A.test.assertEquals(results["1"]["a"], 1, "Unexpected value of 'a' on item '1'");
                     $A.test.assertUndefined(results["0"], "getAll returned item for key '0', which is not in storage");
                     $A.test.assertUndefined(results["2"], "getAll returned item for key '2', which is not in storage");
                 });
        },

        testBulkSet: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return storage.setAll({ "0":{"a":0}, "1":{"a":1}, "2":{"a":2} });
            })
            .then(function() {
                return storage.getAll();
            })
            .then(function(results) {
                     $A.test.assertEquals(3, Object.keys(results).length, "Unexpected number of items returned");
                     var value;
                     for (var k in results) {
                         value = results[k];
                         $A.test.assertEquals(+k, value["a"], "Item 'a' value should be " + k);
                     }
                 });
        },

        testBulkSetLargerThanMaxSize: function(cmp, storage) {
            var chunk = new Array(512).join("ツ");
            var keyLength = 14;
            // When SizeEstimator calculates the size it gives a value of 2 per string character so to get the total
            // size that will be added to storage we multiple 2 by the length of the chunk and key, times the number
            // of rows (5) , divided by 1024 to convert to KB.
            var totalSizeAdded = (chunk.length + keyLength) * 2 * 5 / 1024;
            $A.test.assertTrue(storage.getMaxSize() < totalSizeAdded, "Test setup failure: storage being tested is too"
                    + " large to properly test overflow");

            return storage.setAll({
                "testOverflow.1": chunk,
                "testOverflow.2": chunk,
                "testOverflow.3": chunk,
                "testOverflow.4": chunk,
                "testOverflow.5": chunk
            })
            .then(function() {
                $A.test.fail("Expected setAll promise to reject when attemping to set items over maxSize");
            }, function(error) {
                $A.test.assertStartsWith("AuraStorage.set() cannot store", error.message, "Unepexpected error message");
            });
        },

        testBulkRemoveInnerItemNotInStorage: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return storage.setAll({ "0":{"a":0}, "2":{"a":2}, "3":{"a":3} });
            })
            .then(function() {
                return storage.removeAll(["0", "1", "2"]);
            })
            .then(function() {
                return storage.getAll();
            })
            .then(function(results) {
                 $A.test.assertEquals(1, Object.keys(results).length, "Unexpected number of items returned");
                 $A.test.assertEquals(3, results["3"]["a"], "Unexpected item returned from strage");
            });
        },

        testBulkRemoveOuterItemsNotInStorage: function(cmp, storage) {
            return storage.clear()
            .then(function() {
                return storage.setAll({ "1":{"a":1}, "2":{"a":2} });
            })
            .then(function() {
                return storage.removeAll(["0", "1", "3"]);
            })
            .then(function() {
                return storage.getAll();
            })
            .then(function(results) {
                 $A.test.assertEquals(1, Object.keys(results).length, "Unexpected number of items returned");
                 $A.test.assertEquals(2, results["2"]["a"], "Unexpected item returned from strage");
            });
        },

        /**
         * Asserts that sizes are within an acceptable range of one another.
         * @param {Number} expected the expected size (in bytes)
         * @param {Number} actual the actual size (in bytes)
         */
        assertSimilarSize: function(expected, actual) {
            // range is arbitrarily picked to deal with javascript floating point calculations
            var range = 10;
            var delta = Math.abs(expected-actual);
            var acceptable = delta <= range;
            $A.test.assertTrue(acceptable, "expected (" + expected + ") and actual (" + actual + ") not within acceptable range (" + range + ")");
        },

        appendLine: append,

        /**
         * Given a size, return an object greater than the size according to $A.util.estimateSize.
         * @param {Number} size a tight lower bound on the size (bytes) of the object that will be returned.
         * @return {Object} an object specifying key, value, and size.
         */
        buildEntry: function(key, size) {
            var CHAR_SIZE = 2; // from Aura's SizeEstimator

            // remove the size of the key
            size -= CHAR_SIZE * key.length;

            var numOfCharacter = Math.ceil(size/CHAR_SIZE);
            var value = new Array(numOfCharacter+1).join("x");

            // must match logic in AuraStorage.js
            var resultingSize = $A.util.estimateSize(key) + $A.util.estimateSize(value);
            $A.test.assertTrue(resultingSize > size, "_buildEntry() algorithm is wrong: requested " + size + "b but generated " + resultingSize + "b");

            return {
                "key": key,
                "value": {value:value},
                "size": resultingSize
            };
        },

        failTest: logAndFailTest
    };
}
