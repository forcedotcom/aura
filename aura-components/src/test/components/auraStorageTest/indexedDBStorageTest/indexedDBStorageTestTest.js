({
    // IndexedDb not supported in IE < 10
    browsers:["-IE7", "-IE8", "-IE9"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    setUp : function(cmp) {
        $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
        var storage = $A.storageService.initStorage("browserdb", true, false, 32768, 2000, 3000, true, true);
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb")});
    },

    resetCounters:function(cmp){
        cmp._storageModified = false;
        cmp._storageModifiedCounter = 0;
    },

    append:function(cmp, string) {
        var helper = cmp.getDef().getHelper();
        $A.run(function() {helper.appendLine(cmp, string);});
    },

    dieDieDie:function(cmp, thing) {
        var string;
        if (typeof thing === "string") {
            string = thing;
        } else {
            string = thing.message;
        }
        this.append(cmp, string);
        $A.test.fail(string);
    },

    assertAfterStorageChange:function(cmp, callback){
        $A.test.addWaitFor(2, function() {
            return cmp._storageModified?cmp._storageModifiedCounter:0;
        }, callback);
    },

    testGetName : {
        test : function(cmp) {
            var storage = $A.storageService.getStorage("browserdb");
            this.append(cmp, "Name "+storage.getName());
            $A.test.assertEquals("indexeddb", storage.getName());
        }
    },

    testGetSize:{
        test:[function (cmp) {
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 32768, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow")});
            cmp._die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { this.append(cmp, string); }.bind(this);
        }, function(cmp){
            var completed = false;

            cmp._storage.put("testGetSize.key1", new Array(1024).join("x"))  // 1kb
                .then(function() { return cmp._storage.get("testGetSize.key1"); })
                .then(function(item) { $A.test.assertDefined(item.value, "Fail item."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(result) { cmp._append("result length = "+result.length); return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 2 && size < 2.1, "testGetSize: Expected size of 2, but got " + size);
                    completed = true;
                }, cmp._die);

            // Allow this promise chain to complete before starting the next test.
            // If we don't wait, the chains are interleaved.
            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            //Two value to see that size is recalculated
            cmp._storage.put("testGetSize.key2" , new Array(3072).join("y")) //5kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(item) { $A.test.assertDefined(item.value, "testGetSize: Fail - item undefined."); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 8 && size < 8.1, "testGetSize: Expected size of 12, but got " + size);
                    completed = true;
                }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
            var completed = false;

            // Overwrite previous key2
            // Careful... this does not calculate size correctly.
            cmp._storage.put("testGetSize.key2" , new Array(1024).join("z")) //1kb
                .then(function() { return cmp._storage.get("testGetSize.key2"); })
                .then(function(item) { $A.test.assertDefined(item.value); })
                .then(function() { return cmp._storage.getAll(); /* fake out the size calculation */ })
                .then(function(results) { return cmp._storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 4 && size < 4.1, "testGetSize: Expected size of 4, but got " + size);
                    completed = true;
                }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        } ]
    },

    testGetMaxSize:{
        test:function(cmp){
            var storage = $A.storageService.getStorage("browserdb");
            $A.test.assertEquals(32, storage.getMaxSize(), "testGetMaxSize: Failed to configure max size of storage");
        }
    },

    runUnsureKey : function(cmp, key) {
        var completed = false;
        var die = function(error) { completed = true; this.dieDieDie(cmp, error); }.bind(this);
        var storage = $A.storageService.getStorage("browserdb");
        var append = function(string) { this.append(cmp, string); }.bind(this);
        append("put("+key+",value);");
        storage.put(key, "value")
            .then(function() {
                append("get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append("value="+item);
                if (item) {
                    $A.test.assertEquals("value", item.value, "Failed initial get for "+key);
                }
                append("remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                append("get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append("value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            }, die)
        $A.test.addWaitFor(true, function() { return completed; });
    },

    testGetNoValues:{
        test: [ function(cmp){
            this.runUnsureKey(cmp, null);
        },
        function(cmp) {
            this.runUnsureKey(cmp, undefined);
        },
        function(cmp) {
            this.runUnsureKey(cmp, "");
        }]
    },

    runFullCycle : function(cmp, key, value) {
        var completed = false;
        var append = function(string) { this.append(cmp, string); }.bind(this);
        var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
        var storage = $A.storageService.getStorage("browserdb");
        append("put("+key+","+value+");");
        storage.put(key, value)
            .then(function() {
                append("get("+key+");");
                return storage.get(key);
            }).then(function(item) {
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
                append("remove("+key+");");
                return storage.remove(key);
            }).then(function() {
                append("get("+key+");");
                return storage.get(key);
            }).then(function(item) {
                append("value="+item);
                completed = true;
                $A.test.assertUndefinedOrNull(item, "remove failed");
            }, die);
        $A.test.addWaitFor(true, function() { return completed; });
    },

    testValues:{
        test:[
            function(cmp) {
                this.runFullCycle(cmp, "testValues", null);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", undefined);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", true);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", 0);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", "a");
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", {});
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", {"a": "b"});
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", []);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", ["a", "b"]);
            },
            function(cmp) {
                this.runFullCycle(cmp, "testValues", new Array(1024).join("x"));
            }
        ]
    },

    testValueTooLarge: {
        "test":[ function(cmp) {
                var completed = false;
                var storage = $A.storageService.getStorage("browserdb");
                storage.remove("valueTooLarge")
                    .then(function () {
                        return storage.put("valueTooLarge", new Array(32768).join("x"))
                    }).then(function() {
                        $A.test.fail("Successfully stored value that is too large");
                        completed = true;
                    }, function() {
                        completed = true;
                    });
                    $A.test.addWaitFor(true, function() { return completed; });
            }, function(cmp) {
                var storage = $A.storageService.getStorage("browserdb");
                var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
                var completed = false;
                storage.get("valueTooLarge")
                    .then(function (item) {
                        completed = true;
                        $A.test.assertUndefinedOrNull(item, "value too large should not be stored.");
                    }, die);
                $A.test.addWaitFor(true, function() { return completed; });
            }]
    },

    testTwistedObject:{
        test:function(cmp){
                var storage = $A.storageService.getStorage("browserdb");
                var die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
                var completed = false;
                var stuff = { "a": 2 };
                stuff["b"] = stuff;

                storage.put("testTwistedObject", stuff)
                    .then(function() { return storage.get("testTwistedObject"); })
                    .then(function(item) {
                        $A.test.assertEquals(item.value["a"], 2, "testTwistedObject: constant is wrong");
                        $A.test.assertEquals(item.value["b"], item.value, "testTwistedObject: looped value is wrong");
                        completed = true;
                    }, die);
                $A.test.addWaitFor(true, function() { return completed; });
            }
    },

    testModifyObject:{
        test:function(cmp){
                var storage = $A.storageService.getStorage("browserdb");
                var die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
                var completed = false;
                var stuff = { "changeling": 2 };
                storage.put("testModifyObject", stuff)
                    .then(function() { stuff["changeling"] = 3; return storage.get("testModifyObject"); })
                    .then(function(item) {
                        $A.test.assertEquals(item.value["changeling"], 2,
                            "testModifyObject: Object changed while stored");
                        completed = true;
                    }, die);
                $A.test.addWaitFor(true, function() { return completed; });
            }
    },

    testUpdate: {
        test:function(cmp){
            var storage = $A.storageService.getStorage("browserdb");
            var die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            var append = function(string) { this.append(cmp, string); }.bind(this);
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
        }
    },

    //
    // Overflow has some interesting problems, among them, we have a problem with
    // races, because everything is done asynchronously. To avoid this, we use getAll to
    // try to ensure that we are very likely to win any races by being the slowest one
    // there. However, there is a chance that we will lose...
    //
    testOverflow: {
        test:[function (cmp) {
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
            cmp._storage = $A.storageService.initStorage("browserdb-testOverflow",
                    true, false, 5000, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testOverflow")});
            cmp._die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { this.append(cmp, string); }.bind(this);
        }, function(cmp) {
            var completed = false;
            var chunk = new Array(512).join("x");

            cmp._storage.put("testOverflow.1", chunk)
                .then(function() {
                    return cmp._storage.put("testOverflow.2", chunk);
                }).then(function() {
                    return cmp._storage.put("testOverflow.3", chunk);
                }).then(function() {
                    return cmp._storage.put("testOverflow.4", chunk);
                }).then(function() {
                    return cmp._storage.put("testOverflow.5", chunk);
                }).then(function() {
                    return cmp._storage.getSize();
                }).then(function(size) {
                    cmp._append("finished add, size = "+size);
                    return cmp._storage.getAll();
                }).then(function(result) {
                    cmp._append("get all finished, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        cmp._append(result[i]);
                    }
                    return cmp._storage.getSize();
                }).then(function(size) {
                    cmp._append("post getAll size = "+size);
                    completed = true;
                }, cmp._die);
            $A.test.addWaitFor(true, function() { return completed; });
        }, function(cmp) {
            var completed = false;
            cmp._storage.getAll()
                .then(function(result) {
                    cmp._append("Race 1, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        cmp._append(result[i]);
                    }
                    return cmp._storage.getAll();
                }).then(function(result) {
                    cmp._append("Race 2, length="+result.length);
                    for (var i = 0; i < result.length; i++) {
                        cmp._append(result[i]);
                    }
                    return cmp._storage.getSize();
                }).then(function(size) {
                    cmp._append("post getAll size = "+size);
                    $A.assert(size < 5.0, "Size is too large");
                    completed = true;
                }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        }
        ]
    },

    testGetAll: {
        test:[function (cmp) {
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
            cmp._storage = $A.storageService.initStorage("browserdb-testGetAll",
                    true, false, 32768, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testGetAll")});
            cmp._die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { this.append(cmp, string); }.bind(this);
        }, function(cmp) {
            var completed = false;

            cmp._storage.clear()
                .then(function() {
                    return Promise.all([
                        cmp._storage.put("2", { "a" : 5, "b" : 6 }),
                        cmp._storage.put("0", { "a" : 1, "b" : 2 }),
                        cmp._storage.put("3", { "a" : 7, "b" : 8 }),
                        cmp._storage.put("1", { "a" : 3, "b" : 4 })
                    ]);
                })
            .then(function() {
                    cmp._append("finished add");
                    return cmp._storage.getAll();
                })
            .then(function(results) {
                    cmp._append("get all returned");
                    var resultsLength = results.length;
                    $A.test.assertEquals(4, resultsLength, "There should be 4 items");
                    for (var i = 0; i < resultsLength; i++) {

                        var val = results[i].value,
                            key = results[i].key,
                            keyNum = +key,
                            expected = (keyNum * 2) + 1;
                        $A.test.assertEquals(i + "", key, "Should be ordered by key asc: " + expected);
                        $A.test.assertEquals(expected, val["a"], "Item 'a' value should be " + expected);
                    }
                })
            .then(function() { return cmp._storage.clear(); })
            .then(function() { completed = true; }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        }]
    },

    testClear:{
        test:[function (cmp) {
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
            cmp._storage = $A.storageService.initStorage("browserdb-testClear-",
                    true, false, 32768, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testClear-")});
            cmp._die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            cmp._append = function(string) { this.append(cmp, string); }.bind(this);
        },
        function(cmp){
            var completed = false;
            this.resetCounters(cmp);

            cmp._storage.clear()
                .then(function() {
                        cmp._append("finished clear");
                        return cmp._storage.getSize();
                    })
                .then(function(size) {
                        cmp._append("size = "+size);
                        $A.test.assertTrue(size >= 0 && size <= 0.1,
                            "testClear: Expected size of 0, but got " + size);
                        cmp._append("complete");
                        completed = true;
                    }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        },
        function(cmp){
            var completed = false;
            this.resetCounters(cmp);

            cmp._storage.put("key1" , new Array(1024).join("x"))
                .then(function() {
                    cmp._append("added item");
                    return cmp._storage.getSize();
                })
                .then(function(size) {
                    cmp._append("size = "+size);
                    $A.test.assertTrue(size >= 1 && size <= 1.1, "testClear: Expected size of 1, but got " + size);
                })
                .then(function() { return cmp._storage.clear(); })
                .then(function() { return cmp._storage.getSize(); })
                .then(function(size) {
                    cmp._append("size = "+size);
                    $A.test.assertTrue(size >= 0 && size <= 0.1, "testClear: Expected size of 0, but got " + size);
                    completed = true;
                }, cmp._die);
            $A.test.addWaitFor(true, function() { return completed; });
        }]
    },

    testStorageInfo: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage("browserdb");
            $A.test.assertTrue(storage.isPersistent(), "indexeddb is a persistent storage");
            $A.test.assertFalse(storage.isSecure(), "indexeddb is not a secure storage");
        }
    },

    /**
     * Store an item in the database and reload the page (iframe) to verify data is persisted.
     */
    testReloadPage: {
        test: [
        function loadComponentInIframe(cmp) {
            cmp._frameLoaded = false;
            cmp._expected = "expected value";
            var frame = document.createElement("iframe");
            frame.src = "/auraStorageTest/indexedDBCmp.cmp?value="+cmp._expected;
            frame.scrolling = "auto";
            frame.id = "myFrame";
            $A.util.on(frame, "load", function(){
                cmp._frameLoaded = true;
            });
            var content = cmp.find("iframeContainer");
            $A.util.insertFirst(frame, content.getElement());

            this.waitForIframeLoad(cmp);
        },
        function resetDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.resetStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Resetting";
            }, function() {
                $A.test.assertEquals("Done Resetting", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function addItemToDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.addToStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Adding";
            }, function() {
                $A.test.assertEquals("Done Adding", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function reloadIframe(cmp) {
            cmp._frameLoaded = false;
            document.getElementById("myFrame").contentWindow.location.reload();
            this.waitForIframeLoad(cmp);
        },
        function getItemFromDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.getFromStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
            }, function() {
                var actual = $A.util.getText(iframeCmp.find("output").getElement());
                $A.test.assertEquals(cmp._expected, actual, "Got unexpected item from storage after page reload");
            });
        },
        function cleanupDatabase(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.deleteStorage();
        }]
    },

    waitForIframeLoad: function(cmp) {
        $A.test.addWaitFor(true, function() {
            return cmp._frameLoaded
                   && document.getElementById("myFrame").contentWindow.$A
                   && document.getElementById("myFrame").contentWindow.$A.getRoot() !== undefined; 
        });
    },

    testDeleteDatabase: {
        test: function(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
            var dbName = "browserdb";
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
                        }
                    } else {
                        completed = true;
                    }
                }, die);

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
        }
    },

    testDeleteDatabaseTwice: {
        test: function(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            var dbName = "browserdb";

            $A.storageService.deleteStorage(dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    return $A.storageService.deleteStorage(dbName);
                })
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(dbName));
                    completed = true;
                }, die);

            $A.test.addWaitFor(true, function(){ return completed; });
        }
    },

    testDeleteAndRecreateDatabase: {
        test: [
        function deleteAndRecreateDatabase(cmp) {
            var die = function(error) { completed=true; this.dieDieDie(cmp, error); }.bind(this);
            var completed = false;
            cmp._dbName = "browserdb";

            $A.storageService.deleteStorage(cmp._dbName)
                .then(function() {
                    $A.test.assertUndefined($A.storageService.getStorage(cmp._dbName));
                    $A.storageService.initStorage(cmp._dbName, true, false, 32768, 2000, 3000, true, true);
                })
                .then(function() {
                    $A.test.assertDefined($A.storageService.getStorage(cmp._dbName));
                    completed = true;
                }, die);

            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function verifyRecreationOfDatabase(cmp) {
            var completed = false;

            // Unfortunately, only Chrome has an easy way to check if a DB exists
            if (window.indexedDB.webkitGetDatabaseNames) {
                $A.test.addWaitFor(true, function() {
                    window.indexedDB.webkitGetDatabaseNames().onsuccess = function(event) {
                        if (event.target.result.contains(cmp._dbName)){
                            completed = true;
                        }
                    }
                    return completed;
                });
            }
        }]
    },

    // TODO(W-2599085): Storages should clear existing entry after trying to put an item above the max size
    _testReplaceExistingWithEntryTooLarge: {
        test: [
        function putItemThenReplaceWithEntryTooLarge(cmp) {
            var maxSize = 5000;
            $A.test.overrideFunction($A.storageService, "selectAdapter", function() { return "indexeddb";});
            cmp._storage = $A.storageService.initStorage("browserdb-testReplaceTooLarge",
                    true, false, maxSize, 2000, 3000, true, true);
            $A.test.addCleanup(function(){ $A.storageService.deleteStorage("browserdb-testReplaceTooLarge")});
            cmp._die = function(error) { this.dieDieDie(cmp, error); }.bind(this);
            var itemTooLarge = new Array(2560).join("x");
            var completed = false;

            cmp._storage.put("testReplaceExistingWithEntryTooLarge", "ORIGINAL")
                .then(function() { return cmp._storage.get("testReplaceExistingWithEntryTooLarge"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return cmp._storage.put("testReplaceExistingWithEntryTooLarge", itemTooLarge); })
                .then(function(){
                        $A.test.fail("Should not be able to save an item above the maxSize")
                     },
                     function(error){
                         var expectedMsg = "IndexedDBStorageAdapter.setItem(): Item larger than size limit of " + maxSize*0.25;
                         $A.test.assertEqual(expectedMsg, error, "Unexpected error message trying to save item too large");
                     })
                 .then(function() { completed = true; }, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        },
        function getItem(cmp) {
            var completed = false;

            cmp._storage.get("testReplaceExistingWithEntryTooLarge")
                .then(function(item) { $A.test.assertEquals("", item.value, "Entry should be empty after attemping to put item too large")})
                .then(function(){ completed = true;}, cmp._die);

            $A.test.addWaitFor(true, function() { return completed; });
        }]
    }
})
