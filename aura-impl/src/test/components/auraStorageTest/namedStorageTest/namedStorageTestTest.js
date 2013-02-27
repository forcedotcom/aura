({
	/**
     * Verify AuraStorageService.initStorage() with various name related scenarios
     */

	testCreateMultipleUniquelyNamedStores: {
        test: [function(cmp){
        	var foo = $A.storageService.initStorage("foo", false, true, 100, 200, 300, true, true);
        	foo.put("key1", "value1");
        	
        	var bar = $A.storageService.initStorage("bar", false, true, 100, 200, 300, true, true);
        	bar.put("key2", "value2");
        	
        	foo.get("key1", function(v) {
        		cmp._fooValue1 = v;
        	});

        	// Insure that foo and bar are truly isolated stores and do not contain each other's values
        	foo.get("key2", function(v) {
        		cmp._fooValue2Retrieved = $A.util.isUndefined(v);
        	});

        	bar.get("key2", function(v) {
        		cmp._barValue2 = v;
        	});

        	// Insure that foo and bar are truly isolated stores and do not contain each other's values
        	bar.get("key1", function(v) {
        		cmp._barValue1Retrieved = $A.util.isUndefined(v);
        	});

			$A.test.addWaitFor(true, function(){
				return !$A.util.isUndefined(cmp._fooValue1) && !$A.util.isUndefined(cmp._barValue2) && cmp._fooValue2Retrieved && cmp._barValue1Retrieved;
			});
        },
        function(cmp) {
        	$A.test.assertEquals("value1", cmp._fooValue1);
        	$A.test.assertEquals("value2", cmp._barValue2);
        }]
    },
    
	testCreateDuplicateNamedStores: {
        test: function(cmp){
        	var foo = $A.storageService.initStorage("foo", false, true, 100, 200, 300, true, true);
        	
        	try {
	        	// This should fail with a duplicate store exception
	        	var foo2 = $A.storageService.initStorage("foo", false, true, 100, 200, 300, true, true);
	        	$A.test.fail("Expected exception was not thrown!");
        	} catch (e) {
                $A.test.assertTrue(e.message.indexOf("Storage named 'foo' already exists!") == 0, e.message);
        	}
        }
    }
})