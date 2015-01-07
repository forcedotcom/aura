({
    // WebSQL is supported in only these modern browsers. http://caniuse.com/sql-storage
    // TODO(W-1766465): Currently we hardcode the size of the websql database. This pops up a box in Safari(Desktop, iPhone & iPad) that we
    //                  can't accept or override from the test. Re-enable for iOS when fixed.
    browsers:["GOOGLECHROME", "ANDROID_PHONE", "ANDROID_TABLET"],
    setUp : function(cmp) {
		$A.test.overrideFunction($A.storageService, "selectAdapter", function() {
			return "websql";});
		var storage = $A.storageService.initStorage("browserdb", false, true, 1024, 2000, 3000, true, true);
        var completed = false;
        storage.clear().then(function() {
            // websql clear() recreates 'cache' table. We want to ensure the table is available
            // before running websql queries.
            completed = true;
        });

        $A.test.addWaitFor(true, function() { return completed; });
    },

    resetCounters:function(cmp){
		cmp._storageModified = false;
		cmp._storageModifiedCounter = 0;
    },

    assertAfterStorageChange:function(cmp, callback){
		$A.test.addWaitFor(2, function() {
		    return cmp._storageModified?cmp._storageModifiedCounter:0;
		}, callback);
    },

    testGetName : {
		test : function(cmp) {
		    var storage = $A.storageService.getStorage("browserdb");
		    $A.test.assertEquals("websql", storage.getName());
		}
    },

    testClear:{
		test:[function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            var completed = false;
		    this.resetCounters(cmp);

            storage.clear()
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 0 && size <= 0.1, "testClear: Expected size of 0, but got " + size);
                    completed = true;
                });

            $A.test.addWaitFor(true, function() { return completed; });
		},
		/**
		 * Call clear() after the cache has some values
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
		    this.resetCounters(cmp);

            storage.put("key1" , new Array(1024).join("x"))
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 1 && size <= 1.1, "testClear: Expected size of 1, but got " + size);
                })
                .then(function() { return storage.clear(); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 0 && size <= 0.1, "testClear: Expected size of 0, but got " + size);
                });
		}]
    },

    testGetSize:{
		test:[function(cmp){
            var completed = false;
		    var storage = $A.storageService.getStorage("browserdb");
            storage.put("key1", new Array(1024).join("x"))  // 1kb
                .then(function() { return storage.get("key1"); })
                .then(function(item) { $A.test.assertDefined(item.value, "Fail item."); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 1 && size < 1.001, "testGetSize: Expected size of 1, but got " + size);
                    completed = true;
                });

            // Allow this promise chain to complete before starting the next test.
            // If we don't wait, the chains are interleaved.
            $A.test.addWaitFor(true, function() { return completed; });

		}, function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            var completed = false;

		    //Two value to see that size is recalculated
		    storage.put("key2" , new Array(5120).join("y")) //5kb
                .then(function() { return storage.get("key2"); })
                .then(function(item) { $A.test.assertDefined(item.value, "testGetSize: Fail - item undefined."); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 6 && size < 6.002, "testGetSize: Expected size of 6, but got " + size);
                    completed = true;
                });

            $A.test.addWaitFor(true, function() { return completed; });

        }, function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            var completed = false;

            // Overwrite previous key2
            storage.put("key2" , new Array(1024).join("z")) //1kb
                .then(function() { return storage.get("key2"); })
                .then(function(item) { $A.test.assertDefined(item.value); })
                .then(function() { return storage.getSize(); })
                .then(function(size) {
                    $A.test.assertTrue(size >= 2 && size < 2.002, "testGetSize: Expected size of 2, but got " + size);
                    completed = true;
                });

            $A.test.addWaitFor(true, function() { return completed; });
        } ]
    },

    testGetMaxSize:{
		test:function(cmp){
		    //Max Size doesn't seem to mean anything in the case of WebSQLAdapter. It just a transient variable.
            var storage = $A.storageService.getStorage("browserdb");
            $A.test.assertEquals(1, storage.getMaxSize(), "testGetMaxSize: Failed to configure max size of storage");
		}
    },

    testGet:{
        test:[
        /**
         * Bad key values
         */
        function(cmp){
            var completed = false;
            var storage = $A.storageService.getStorage("browserdb");
            storage.get("key1")
                .then(function(item) { $A.test.assertUndefinedOrNull(item); } )
                .then(function() { return storage.get(undefined); })
                .then(function(item) { $A.test.assertUndefinedOrNull(item); } )
                .then(function() { return storage.get(null); })
                .then(function(item) { $A.test.assertUndefinedOrNull(item); } )
                .then(function() { return storage.get(""); })
                .then(function(item) {
                    $A.test.assertUndefinedOrNull(item);
                    completed = true;
                } );

            $A.test.addWaitFor(true, function() { return completed; });
        },
		/**
		 * Insert a map as value.
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            var map = { "NBA": "Basketball" };
            var completed = false;

            //Assert that item was retrieved from storage
            storage.put("sport", map)
                .then(function() { return storage.get("sport"); })
                .then(function(item) {
                    $A.test.assertDefined(item);
                    $A.test.assertEquals("Basketball", item.value["NBA"], "testGet: Failed to retrieve map value");
                    completed = true;
                });

            $A.test.addWaitFor(true, function() { return completed; });
        },
		/**
		 * Insert a literal value
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            var completed = false;
            storage.put("sounds", "Boogaboo")
                .then(function() { return storage.get("sounds")})
                .then(function(item) {
                    $A.test.assertEquals("Boogaboo", item.value, "testGet: Failed to retrieve string value");
                })
                .then(function() { return storage.put("array", ["foo","bar"]); })
                .then(function() { return storage.get("array")})
                .then(function(item) {
                    $A.test.assertEquals("foo", item.value[0], "testGet: Failed to retrieve array value");
                    $A.test.assertEquals("bar", item.value[1], "testGet: Failed to retrieve all array values");
                })
                .then(function() { return storage.put("score", 999); })
                .then(function() { return storage.get("score")})
                .then(function(item) {
                    $A.test.assertEquals(999, item.value, "testGet: Failed to retrieve numeric value");
                    completed = true;
                });
		    /*TODO: W-1620507 cannot put boolean values
		     * storage.put("flag", false);
		    this.assertAfterGet(cmp, storage, "flag",
		    		function(){
					$A.test.assertFalse(cmp["flag"], "Failed to retrieve string value")
				});*/

            $A.test.addWaitFor(true, function() { return completed; });
        }
        ]
    },

    testPutGoodValue: {
        /**
         * Insert a value
         */
         test: function(cmp){
                var storage = $A.storageService.getStorage("browserdb");
                storage.put("key1", new Array(1024).join("x"))  // 1kb
                    .then(function() {return storage.get("key1"); })
                    .then(function(item) {
                        $A.test.assertDefined(item.value, "testPutGoodValue: Failed to put an item.");
                    });
         }
    },

    testPutBadValues: {
        test:[
        /**
		 * Insert bad values
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
		    storage.put("NULL", null)
                .then(function() { return storage.get("NULL"); })
                .then(function(item) {
                    $A.test.assertUndefinedOrNull(item.value, "testPutBadValues: Failed to put null value")
                });
		},
		/**
		 * Insert bad keys
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
            storage.put(null, "NULL")
                .then(function() { return storage.get(null); })
                .then(function(item) { $A.test.assertUndefinedOrNull(item); })
                .then(function() { storage.put(undefined, "UNDEFINED"); })
                .then(function() { return storage.get(undefined); })
                .then(function(item) {
                    // iOS implementation of WebSql doesn't store an entry if key is undefined
                    // but google chrome's implementation does. Test makes sure, if a browser
                    // does store, it stores the right value
                    if (item)
                        $A.test.assertEquals("UNDEFINED", item.value);
                })
                .then(function() { storage.put("", "EMPTY"); })
                .then(function() { return storage.get(""); })
                .then(function(item) { $A.test.assertEquals("EMPTY", item.value); });
		},
		/**
		 * Inset duplicate keys
		 */
		function(cmp){
		    var storage = $A.storageService.getStorage("browserdb");
		    storage.put("dup", "ORIGINAL")
                .then(function() { return storage.get("dup"); })
                .then(function(item) { $A.test.assertEquals("ORIGINAL", item.value); })
                .then(function() { return storage.put("dup", "DUPLICATE"); })
                .then(function() { return storage.get("dup"); })
                .then(function(item) { $A.test.assertEquals("DUPLICATE", item.value); });
		}]
    },

    testGetAll: {
        test: function() {
            var storage = $A.storageService.getStorage("browserdb");
            var completed = false;

            Promise.all([
                storage.put("2", {
                    "a" : 5,
                    "b" : 6
                }),
                storage.put("0", {
                    "a" : 1,
                    "b" : 2
                }),
                storage.put("3", {
                    "a" : 7,
                    "b" : 8
                }),
                storage.put("1", {
                    "a" : 3,
                    "b" : 4
                })
            ])
                .then(function() { return storage.getAll(); })
                .then(
                function(results) {
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
                .then(function() { completed = true; }, function(err) { $A.test.fail(err); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testStorageInfo: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage("browserdb");
            $A.test.assertTrue(storage.isPersistent(), "websql is a persistent storage");
            $A.test.assertFalse(storage.isSecure(), "websql is not a secure storage");
        }
    }
})
