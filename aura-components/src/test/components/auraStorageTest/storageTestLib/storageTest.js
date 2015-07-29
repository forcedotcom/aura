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

function () {
    function dieDieDie(cmp, thing) {
        var string;
        if (typeof thing === "string") {
            string = thing;
        } else {
            string = thing.message;
        }
        appendLine(cmp, string);
        $A.test.fail(string);
    }

    /**
     * Asserts that sizes are within an acceptable range of one another.
     * @param {Number} expected - the expected size (in bytes)
     * @param {Number} actual - the actual size (in bytes)
     */
    function assertSimilarSize(expected, actual) {
        // range is arbitrarily picked to deal with javascript floating point calculations
        var range = 10;
        var delta = Math.abs(expected-actual);
        var acceptable = -range <= delta && delta <= range;
        $A.test.assertTrue(acceptable, "expected (" + expected + ") and actual (" + actual + ") not within acceptable range (" + range + ")");
    }

    function appendLine(cmp, text) {
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
        var die = function(error) { completed = true; dieDieDie(cmp, error); }.bind(this);
        appendLine(cmp, "put("+key+",value);");
        storage.put(key, "value")
            .then(function() {
                appendLine(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                appendLine(cmp, "value="+item);
                if (item) {
                    $A.test.assertEquals("value", item.value, "Failed initial get for "+key);
                }
                appendLine(cmp,"remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                appendLine(cmp,"get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                appendLine(cmp,"value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            }, die)
        $A.test.addWaitFor(true, function() { return completed; });
    }
    
    function runFullCycle(cmp, storage, key, value) {
        var completed = false;
        var die = function(error) { completed=true; dieDieDie(cmp, error); }.bind(this);
        appendLine(cmp, "put("+key+","+value+");");
        storage.put(key, value)
            .then(function() {
                appendLine(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                appendLine(cmp, "value="+item);
                if ($A.util.isObject(value)) {
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
                } else {
                    $A.test.assertEquals(value, item.value, "Failed initial get for "+value);
                }
                appendLine(cmp, "remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                appendLine(cmp, "get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                appendLine(cmp, "value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            }, die);

        $A.test.addWaitFor(true, function() { return completed; });
    }

    return {
        testSizeInitial: function(storage) {
            var completed = false;
            storage.getSize().then(function(size) { $A.test.assertEquals(0, size); })
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testGetName: function(cmp, storage, expected) {
            appendLine(cmp, "Name "+storage.getName());
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

        testCacheMiss: function(cmp, storage) {
            var completed = false;
            storage.get("iDontExist")
                .then(function(item){
                    $A.test.assertUndefined(item, "Expectd to receive undefined on cache miss");
                    completed = true;
                },
                function(err) { dieDieDie(cmp, err); });
            $A.test.addWaitFor(true, function(){ return completed; });
        },

        testSetItemOverMaxSize_stage1: function(cmp, storage, expected) {
            var completed = false;
            var result = "";
            var sizeTooBig = (storage.getMaxSize() + 1) * 1000;

            storage.put("overSize", { "value" : { "BigMac" : new Array(sizeTooBig).join("x") } })
                .then(
                    function() { dieDieDie(cmp, "Promise to put item too late should not be resolved"); },
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
            var completed = false;
            storage.get("overSize")
                .then(function (item) {
                    completed = true;
                    $A.test.assertUndefinedOrNull(item, "Value too large should not be stored.");
                }, dieDieDie);

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
                 function(err) { dieDieDie(cmp, err); }
             );

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testReplaceExistingWithEntryTooLarge_stage1: function(cmp, storage, expectedError) {
            var sizeTooBig = (storage.getMaxSize() + 1) * 1000;
            var itemTooLarge = new Array(sizeTooBig).join("x");
            var completed = false;

            storage.put("testReplaceExistingWithEntryTooLarge", "ORIGINAL")
                .then(function() { return storage.get("testReplaceExistingWithEntryTooLarge"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return storage.put("testReplaceExistingWithEntryTooLarge", itemTooLarge); })
                .then(function(){
                        $A.test.fail("Should not be able to save an item above the maxSize");
                     },
                     function(error){
                         $A.test.assertEquals(expectedError, error.message, "Unexpected error message trying to save item too large");
                     })
                 .then(function() { completed = true; }, function(err) { dieDieDie(cmp, err)});

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testReplaceExistingWithEntryTooLarge_stage2: function(cmp, storage) {
            var completed = false;

            storage.get("testReplaceExistingWithEntryTooLarge")
                .then(function(item) { $A.test.assertEquals("", item.value, "Entry should be empty after attemping to put item too large"); })
                .then(function(){ completed = true;}, function(err) { dieDieDie(cmp, err)});

            $A.test.addWaitFor(true, function() { return completed; });
        },
        
        testStorageInfo: function(storage, persistent, secure) {
            $A.test.assertEquals(persistent, storage.isPersistent(), "Unexpected value for persistent");
            $A.test.assertEquals(secure, storage.isSecure(), "Unexpected value for secure");
        },
        
        testTwistedObject: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            var stuff = { "a": 2 };
            stuff["b"] = stuff;

            storage.put("testTwistedObject", stuff)
                .then(function() { return storage.get("testTwistedObject"); })
                .then(function(item) {
                    $A.test.assertEquals(2, item.value["a"], "testTwistedObject: constant is wrong");
                    $A.test.assertEquals(item.value["b"], item.value, "testTwistedObject: looped value is wrong");
                    completed = true;
                }, die);
            $A.test.addWaitFor(true, function() { return completed; });
        },

        testModifyObject: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
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
                }, die);
            $A.test.addWaitFor(true, function() { return completed; });
        },
        
        testUpdate: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
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
                }, die);
            $A.test.addWaitFor(true, function() { return completed; });
        },

        //
        // Overflow has some interesting problems, among them, we have a problem with
        // races, because everything is done asynchronously. To avoid this, we use getAll to
        // try to ensure that we are very likely to win any races by being the slowest one
        // there. However, there is a chance that we will lose...
        //
        testOverflow_stage1: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            var chunk = new Array(512).join("x");

            storage.put("testOverflow.1", chunk)
                .then(function() {
                    return storage.put("testOverflow.2", chunk);
                }).then(function() {
                    return storage.put("testOverflow.3", chunk);
                }).then(function() {
                    return storage.put("testOverflow.4", chunk);
                }).then(function() {
                    return storage.put("testOverflow.5", chunk);
                }).then(function() {
                    return storage.getSize();
                }).then(function(size) {
                    appendLine(cmp, "finished add, size = "+size);
                    return storage.getAll();
                }).then(function(result) {
                    appendLine(cmp, "get all finished, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        appendLine(cmp, result[i]);
                    }
                    return storage.getSize();
                }).then(function(size) {
                    appendLine(cmp, "post getAll size = "+size);
                    completed = true;
                }, die);
            $A.test.addWaitFor(true, function() { return completed; });
        },

        testOverflow_stage2: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            storage.getAll()
                .then(function(result) {
                    appendLine(cmp, "Race 1, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        appendLine(cmp, result[i]);
                    }
                    return storage.getAll();
                }).then(function(result) {
                    appendLine(cmp, "Race 2, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        appendLine(cmp, result[i]);
                    }
                    return storage.getSize();
                }).then(function(size) {
                    appendLine(cmp, "post getAll size = "+size);
                    $A.assert(size < 5.3, "Size is too large");
                    completed = true;
                }, die);

            $A.test.addWaitFor(true, function() { return completed; });
        },
        
        testClear_stage1: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
            var completed = false;

            storage.clear()
                .then(function() {
                    appendLine(cmp, "finished clear");
                        return storage.getSize();
                    })
                .then(function(size) {
                        appendLine(cmp, "size = "+size);
                        $A.test.assertTrue(size >= 0 && size <= 0.1,
                            "testClear: Expected size of 0, but got " + size);
                        appendLine(cmp, "complete");
                        completed = true;
                    }, die);

            $A.test.addWaitFor(true, function() { return completed; });
        },

        testClear_stage2: function(cmp, storage) {
            var die = function(error) { dieDieDie(cmp, error); }.bind(this);
            var completed = false;

            storage.put("key1" , new Array(1024).join("x"))
                .then(function() {
                    appendLine(cmp, "added item");
                    return storage.getSize();
                })
                .then(function(size) {
                    appendLine(cmp, "size = "+size);
                    // Size calculations vary across adapters so mostly just verify something was added
                    $A.test.assertTrue(size >= 1 && size <= 2.1, "testClear: Expected size of 1kb to 2kb, but got " + size);
                })
                .then(function() { return storage.clear(); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    appendLine(cmp, "size = "+size);
                    $A.test.assertTrue(size >= 0 && size <= 0.1, "testClear: Expected size of 0, but got " + size);
                    completed = true;
                }, die);
            $A.test.addWaitFor(true, function() { return completed; });
        }
    };
}