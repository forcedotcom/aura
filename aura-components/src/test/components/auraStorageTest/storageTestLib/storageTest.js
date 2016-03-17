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
    function dieDie(cmp, thing) {
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
                function(newCmps, overallStatus) {
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

    function runUnsureKey(cmp, storage, key) {
        var completed = false;
        var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
        append(cmp, "put("+key+",value);");
        storage.put(key, "value")
            .then(function() {
                append(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append(cmp, "value="+item);
                if (item) {
                    $A.test.assertEquals("value", item.value, "Failed initial get for "+key);
                }
                append(cmp,"remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                append(cmp,"get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append(cmp,"value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            })['catch'](die);
        $A.test.addWaitFor(true, function() { return completed; });
    }

    function runFullCycle(cmp, storage, key, value) {
        var completed = false;
        var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
        append(cmp, "put("+key+","+value+");");
        storage.put(key, value)
            .then(function() {
                append(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append(cmp, "value="+item);
                if (value instanceof Error) {
                    $A.test.assertUndefined(item.value.message, "Expected an empty object because errors are not JSON serializable");
                } else if ($A.util.isObject(value)) {
                    for (var x in value) {
                        if (value.hasOwnProperty(x)) {
                            $A.test.assertEquals(value[x], item.value[x], "Failed object match on property "+x);
                        }
                    }
                } else if ($A.util.isArray(value)) {
                    $A.test.assertEquals(value.length, item.value.length, "Failed match on array length");
                    for (var i =0; i < value.length; i++) {
                        $A.test.assertEquals(value[i], item.value[i], "Failed match on array index "+i);
                    }
                } else if ($A.util.isFunction(value)) {
                    $A.test.assertEquals(value+"", item.value, "Failed match on serialized function definition");
                } else {
                    $A.test.assertEquals(value, item.value, "Failed initial get for "+value);
                }
                append(cmp, "remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                append(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append(cmp, "value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            })['catch'](die);

        $A.test.addWaitFor(true, function() { return completed; });
    }

    return {
        testSizeInitial: function(storage) {
            var completed = false;
            storage.getSize()
                .then(function(size) { $A.test.assertEquals(0, size); })
                .then(function() { completed = true; })
                ["catch"](function(error) { $A.test.fail(error.toString()); });

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testGetName: function(cmp, storage, expected) {
            append(cmp, "Name "+storage.getName());
            $A.test.assertEquals(expected, storage.getName());
        },

        testGetMaxSize: function(storage, expected) {
            $A.test.assertEquals(expected, storage.getMaxSize(), "testGetMaxSize: Failed to configure max size of storage");
        },

        testNullKey: function(cmp, storage) {
            runUnsureKey(cmp, storage, null);
        },

        testUndefinedKey: function(cmp, storage) {
            runUnsureKey(cmp, storage, undefined);
        },

        testEmptyStringKey: function(cmp, storage) {
            runUnsureKey(cmp, storage, "");
        },

        testGetNullValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_Null", null);
        },

        testGetUndefinedValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_Undefined", undefined);
        },

        testGetBooleanTrueValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_True", true);
        },

        testGetZeroValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_Zero", 0);
        },

        testGetSimpleStringValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_A", "a");
        },

        testGetEmptyObjectValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_EmptyObject", {});
        },

        testGetBasicObjectValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_BasicObject", {"a": "b"});
        },

        testGetEmptyArrayValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_EmptyArray", []);
        },

        testGetBasicArrayValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_BasicArray", ["a", "b"]);
        },

        testGetBigArrayValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_BigArray", new Array(1024).join("x"));
        },

        testGetMultiByteStringValue: function(cmp, storage) {
            // 1-byte, 2-byte, 3-byte, and 4-byte characters, separated by spaces
            runFullCycle(cmp, storage, "testValues_MutlibyteString", "I ½ ♥ 💩");
        },

        testGetFunctionValue: function(cmp, storage) {
            runFullCycle(cmp, storage, "testValues_Function", function(x){});
        },

        /**
         * Tests storing an item of value error works.
         */
        testGetErrorValue: function(cmp, storage, putFails) {
            runFullCycle(cmp, storage, "testValues_Error", new Error("hello, error"));
        },

        /**
         * Tests storing an item of value error fails.
         */
        testPutErrorValueFails: function(cmp, storage, putFails) {
            var completed = false;
            storage.put("testErrorValue", new Error("hello, error"))
                .then(function() {
                    completed = true;
                    $A.test.fail("Expected put() to fail but it succeeded");
                }, function(e) {
                    append(cmp, e.message);
                })
                .then(function() { return storage.get("testErrorValue"); })
                .then(
                    function(item){
                        $A.test.assertUndefined(item, "Expected undefined because put() failed");
                        completed = true;
                    },
                    function(err) { dieDie(cmp, err); }
                );
            $A.test.addWaitFor(true, function(){ return completed; });
        },

        testCacheMiss: function(cmp, storage) {
            var completed = false;
            storage.get("iDontExist")
                .then(function(item){
                    $A.test.assertUndefined(item, "Expected to receive undefined on cache miss");
                    completed = true;
                },
                function(err) { dieDie(cmp, err); });
            $A.test.addWaitFor(true, function(){ return completed; });
        },

        testSetItemUnderMaxSize: function(cmp, storage) {
            var completed = false;
            var result = "";
            var sizeTooBig = (storage.getMaxSize() - 1) * 1024;

            storage.put("overSize", { "value" : { "LittleMac" : new Array(sizeTooBig).join("x") } })
                .then(
                    function() { completed = true; },
                    function(error) {
                        dieDie(cmp, "Promise to put item under max size should not reject");
                    }
                );

            $A.test.addWaitFor(true,
                function() { return completed; }
            );
        },

        testSetItemOverMaxSize_stage1: function(cmp, storage) {
            var key = "overSize";
            var result = "";
            var sizeTooBig = (storage.getMaxSize() + 1) * 1024;
            var expected = "AuraStorage.put() cannot store " + key;

            var completed = false;
            storage.put(key, { "value" : { "BigMac" : new Array(sizeTooBig).join("x") } })
                .then(
                    function() { dieDie(cmp, "Promise to put item too large should not be resolved"); },
                    function(error) {
                        completed = true;
                        result = error.toString();
                    }
                );

            $A.test.addWaitFor(true,
                function() { return completed; },
                function() {
                    $A.test.assertTrue(result.indexOf(expected) > -1, "Did not receive expected error. Expected error "
                            + "to contain <" + expected +">, but got <" + result + ">");
                });
        },

        testSetItemOverMaxSize_stage2: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;
            storage.get("overSize")
                .then(function (item) {
                    completed = true;
                    $A.test.assertUndefinedOrNull(item, "Value too large should not be stored.");
                })['catch'](die);

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testGetAll: function(cmp, storage) {
            var completed = false;
            storage.clear()
            .then(function() {
                return Promise.all([
                    storage.put("2", { "a" : 5, "b" : 6 }),
                    storage.put("0", { "a" : 1, "b" : 2 }),
                    storage.put("3", { "a" : 7, "b" : 8 }),
                    storage.put("1", { "a" : 3, "b" : 4 })
                ]);
            })
             .then(function() { return storage.getAll(); })
             .then(function(results) {
                     var resultsLength = results.length;
                     $A.test.assertEquals(4, resultsLength, "There should be 4 items");
                     for (var i = 0; i < resultsLength; i++) {
                         var val = results[i].value,
                             key = results[i].key,
                             keyNum = +key,
                             expected = (keyNum * 2) + 1;
                         $A.test.assertEquals(expected, val["a"], "Item 'a' value should be " + expected);
                     }
                 })
             .then(
                 function() { completed = true; },
                 function(err) { dieDie(cmp, err); }
             );

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testReplaceExistingWithEntryTooLarge_stage1: function(cmp, storage) {
            var key = "testReplaceExistingWithEntryTooLarge";
            var sizeTooBig = (storage.getMaxSize() + 1) * 1000;
            var itemTooLarge = new Array(sizeTooBig).join("x");

            var completed = false;
            var expected = "AuraStorage.put() cannot store " + key;

            storage.put(key, "ORIGINAL")
                .then(function() { return storage.get("testReplaceExistingWithEntryTooLarge"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return storage.put("testReplaceExistingWithEntryTooLarge", itemTooLarge); })
                .then(function(){
                        $A.test.fail("Should not be able to save an item above the maxSize");
                     },
                     function(result){
                         $A.test.assertTrue(result.toString().indexOf(expected) > -1, "Did not receive expected error. Expected error "
                                 + "to contain <" + expected +">, but got <" + result + ">");
                     })
                 .then(function() { completed = true; }, function(err) { dieDie(cmp, err); });

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testReplaceExistingWithEntryTooLarge_stage2: function(cmp, storage) {
            var completed = false;

            storage.get("testReplaceExistingWithEntryTooLarge")
                .then(function(item) { $A.test.assertUndefined(item, "Entry should be empty after attemping to put item too large"); })
                .then(function(){ completed = true;}, function(err) { dieDie(cmp, err)});

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testStorageInfo: function(storage, persistent, secure) {
            $A.test.assertEquals(persistent, storage.isPersistent(), "Unexpected value for persistent");
            $A.test.assertEquals(secure, storage.isSecure(), "Unexpected value for secure");
        },

        /**
         * Tests that an item with cycles can not be stored.
         */
        testCyclicObjectFails: function(cmp, storage) {
            var completed = false;
            var stuff = { "a": 2 };
            stuff["b"] = stuff;
            storage.put("testCyclicObject", stuff)
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
                    function(item){
                        $A.test.assertUndefined(item, "Expected to receive undefined on twisted object");
                        completed = true;
                    },
                    function(err) { dieDie(cmp, err); }
                );
            $A.test.addWaitFor(true, function(){ return completed; });
        },

        testModifyObject: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;
            var stuff = { "changeling": 2 };
            storage.put("testModifyObject", stuff)
                .then(function() {
                    stuff["changeling"] = 3;
                    return storage.get("testModifyObject"); })
                .then(function(item) {
                    $A.test.assertEquals(2, item.value["changeling"],
                        "testModifyObject: Object changed while stored");
                    completed = true;
                })['catch'](die);
            $A.test.addWaitFor(true, function() { return completed; });
        },

        testUpdate: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;

            storage.put("testUpdate", "ORIGINAL")
                .then(function() { return storage.get("testUpdate"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return storage.put("testUpdate", "DUPLICATE"); })
                .then(function() { return storage.get("testUpdate"); })
                .then(function(item) {
                    $A.test.assertEquals("DUPLICATE", item.value);
                    return storage.remove("testUpdate");
                }).then(function() {
                    completed = true;
                })['catch'](die);
            $A.test.addWaitFor(true, function() { return completed; });
        },


        /**
         * Fill storage up with multiple items until we go above the max size. Verify space is evicted from the storage
         * so max size is not exceeded.
         */
        testOverflow: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;
            var chunk = new Array(512).join("x");
            var keyLength = 14;
            // When SizeEstimator calculates the size it gives a value of 2 per string character so to get the total
            // size that will be added to storage we multiple 2 by the length of the chunk and key, times the number
            // of rows (5) , divided by 1024 to convert to KB.
            var totalSizeAdded = (chunk.length + keyLength) * 2 * 5 / 1024;
            var storageMax = storage.getMaxSize();
            $A.test.assertTrue(storage.getMaxSize() < totalSizeAdded, "Test setup failure: storage being tested is too"
                    + " large to properly test overflow");

            Promise.all([
                storage.put("testOverflow.1", chunk),
                storage.put("testOverflow.2", chunk),
                storage.put("testOverflow.3", chunk),
                storage.put("testOverflow.4", chunk),
                storage.put("testOverflow.5", chunk)
            ])
            .then(function() {
                // IndexedDB has funky size calculation that doesn't properly get size until after a getAll
                return storage.getAll();
            })
            .then(function(items) {
                return storage.getSize();
            })
            .then(function(size) {
                completed = true;
                $A.test.assertTrue(size < storageMax, "Size of storage is over the max size- items not properly evicted"
                        + " on overflow.");
            })
            ['catch'](die);

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testClear_stage1: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;

            storage.clear()
                .then(function() {
                    append(cmp, "finished clear");
                        return storage.getSize();
                    })
                .then(function(size) {
                        append(cmp, "size = "+size);
                        $A.test.assertTrue(size >= 0 && size <= 0.1,
                            "testClear: Expected size of 0, but got " + size);
                        append(cmp, "complete");
                        completed = true;
                })['catch'](die);

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testClear_stage2: function(cmp, storage) {
            var die = function(error) { completed=true; dieDie(cmp, error); }.bind(this);
            var completed = false;

            storage.put("key1" , new Array(1024).join("x"))
                .then(function() {
                    append(cmp, "added item");
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
                    completed = true;
                })['catch'](die);
            $A.test.addWaitFor(true, function() { return completed; });
        },

        /**
         * Asserts that sizes are within an acceptable range of one another.
         *
         * @param {Number}
         *            expected - the expected size (in bytes)
         * @param {Number}
         *            actual - the actual size (in bytes)
         */
        assertSimilarSize: function(expected, actual) {
            // range is arbitrarily picked to deal with javascript floating point calculations
            var range = 10;
            var delta = Math.abs(expected-actual);
            var acceptable = delta <= range;
            $A.test.assertTrue(acceptable, "expected (" + expected + ") and actual (" + actual + ") not within acceptable range (" + range + ")");
        },

        appendLine: append
    };
}
