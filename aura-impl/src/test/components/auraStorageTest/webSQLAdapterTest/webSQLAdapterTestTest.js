({
    //WebSQL is supported in only these modern browsers. http://caniuse.com/sql-storage
    browsers:["GOOGLECHROME", "SAFARI", "IPAD", "IPHONE", "ANDROID_PHONE", "ANDROID_TABLET"],
    setUp : function(cmp) {
	$A.test.overrideFunction($A.storageService, "selectAdapter", function() {
		return "websql";});
	$A.storageService.initStorage("browserdb", false, true, 1024, 200, 300, true, true);
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
	    $A.test.setTestTimeout(5000);
	    var storage = $A.storageService.getStorage("browserdb");
	    this.resetCounters(cmp);
	    storage.clear();
	    /*TODO: W-1620503 - auraStorage:modified is fired twice, once by AuraStorage and once by the Adapter
	     * this.assertAfterStorageChange(cmp, function(){
		    			$A.test.assertEquals(0, storage.getSize(), 
		    				"Storage size not 0 after clear()");
					});*/
	    $A.test.addWaitFor(0, function(){return storage.getSize()});
	},
	/**
	 * Call clear() after the cache has some values
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    this.resetCounters(cmp);
	    storage.put("key1" , new Array(1024).join("x"));
	    /*W-1620503
	     * this.assertAfterStorageChange(cmp, function(){
					    debugger;
	    				    $A.test.assertEquals(1.00, storage.getSize().toFixed(2), "Storage size doesn't reflect size of items stored");
	    				} );*/
	    $A.test.addWaitFor(true, function(){
			return storage.getSize()>=1 && storage.getSize()<1.001
			}, function(){
			    storage.clear();
			    $A.test.addWaitFor(0, function(){return storage.getSize()});
			});
	},
	]
    },
    testGetSize:{
	test:[function(cmp){
	    $A.test.setTestTimeout(15000);
	    var storage = $A.storageService.getStorage("browserdb");
	    //One value
	    storage.put("key1" , new Array(1024).join("x")); //1kb
	    this.assertAfterGet(cmp, storage, "key1", function(){
		var item = cmp["key1"];
		$A.test.assertDefined(item);
		$A.test.assertTrue(storage.getSize()>=1 && storage.getSize()<1.001);		
	    });
	},function(cmp){    
	    var storage = $A.storageService.getStorage("browserdb");
	    //Two value to see that size is recalculated
	    storage.put("key2" , new Array(1024*5).join("y")); //5kb
	    this.assertAfterGet(cmp, storage, "key2", function(){
		var item = cmp["key2"];
		$A.test.assertDefined(item);
		$A.test.assertTrue(storage.getSize()>=6 && storage.getSize()<6.002);		
	    });
	},function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    //Reset flags
	    cmp["key2"] = undefined;
	    cmp["key2flag"] = undefined;
	    //Dup value to see that only incremental value
	    storage.put("key2" , new Array(1024).join("z")); //1kb
	    this.assertAfterGet(cmp, storage, "key2", function(){
		var item = cmp["key2"];
		$A.test.assertDefined(item);
		$A.test.assertTrue(storage.getSize()>=2 && storage.getSize()<2.002);		
	    });
	}
	]
    },
    testGetMaxSize:{
	test:function(cmp){
	    //Max Size doesn't seem to mean anything incase of WebSQLAdapter. It just a transient variable.
	    $A.test.assertEquals(1, $A.storageService.getStorage("browserdb").getMaxSize(), 
		    "Failed to configure max size of storage");
	}
	
    },
    testGet:{
	test:[
	 /**
	  * Bad key values
	  */     
	 function(cmp){
	    $A.test.setTestTimeout(15000);
	    var storage = $A.storageService.getStorage("browserdb");
	    storage.get("key1", function(item) {$A.test.assertUndefinedOrNull(item);});
	    storage.get(undefined, function(item) { $A.test.assertUndefinedOrNull(item);});
	    storage.get(null, function(item) { $A.test.assertUndefinedOrNull(item);});
	    storage.get("", function(item) { $A.test.assertUndefinedOrNull(item);});
	},
	/**
	 * Insert a map as value.
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    var map = {"NBA": "Basketball"};
	    storage.put("sport", map);
	    //Assert that item was retrieved from storage
	    this.assertAfterGet(cmp, storage, "sport", 
		    		function(){
					var item = cmp["sport"];
					$A.test.assertEquals("Basketball", item["NBA"], "Failed to retrieve map value");
				});
	},
	/**
	 * Insert a literal value
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    storage.put("sounds", "Boogaboo");
	    //Assert that item was retrieved from storage
	    this.assertAfterGet(cmp, storage, "sounds", 
		    		function(){
					$A.test.assertEquals("Boogaboo", cmp["sounds"], "Failed to retrieve string value");
				});
	    /*TODO: W-1620507 cannot put boolean values
	     * storage.put("flag", false);
	    this.assertAfterGet(cmp, storage, "flag", 
	    		function(){
				$A.test.assertFalse(cmp["flag"], "Failed to retrieve string value")
			});*/
	    storage.put("array", ["foo","bar"]);
	    this.assertAfterGet(cmp, storage, "array", 
		    		function(){
					$A.test.assertEquals("foo", cmp["array"][0], "Failed to retrieve array value");
					$A.test.assertEquals("bar", cmp["array"][1], "Failed to retrieve all array values");
				});
	    storage.put("score", 999);
	    this.assertAfterGet(cmp, storage, "score", 
		    		function(){
					$A.test.assertEquals(999, cmp["score"], "Failed to retrieve numeric value");
				});
	}, 
	/**
	 * Insert a action return value
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    var a = $A.get("c.aura://ComponentController.getComponent");
	    a.setParams({
		"name" : 'auraStorageTest:teamFacet'
	    });
	    a.setCallback(cmp,function(a){
		//Verify that original action is usable
		$A.test.assertEquals("SUCCESS", a.getState())
		$A.test.assertDefined(a.getReturnValue);
		var newCmp = $A.newCmpDeprecated(a.getReturnValue());
		$A.test.assertEquals("markup://auraStorageTest:teamFacet", newCmp.getDef().getDescriptor().toString());
		storage.put("actionResponse", a);
	    });
	    $A.enqueueAction(a);
	    $A.eventService.finishFiring();
	    this.assertAfterGet(cmp, storage, "actionResponse", 
	    		function(){
				/*TODO: W-1620511 - actions are not flattened correctly, most properties are ommited
				 * //Verify that action is usable after it was retrieved from cache
				var item = cmp["actionResponse"];
				$A.test.assertEquals("SUCCESS", item.getState());
				$A.test.assertDefined(item.getReturnValue);
				var newCmp = $A.newCmpDeprecated(item.getReturnValue());
				$A.test.assertEquals("markup://auraStorageTest:teamFacet", newCmp.getDef().getDescriptor().toString());*/
			});
	}
	]
	
    },
    /**
     * Utillity method to verify cached value. Very helpful when insertion happens in an asynchronous fashion. 
     */
    assertAfterGet:function(cmp, storage, key, callback){
	$A.test.addWaitFor(true, function(){
		storage.get(key, function(item) {
		    //Value 
		    cmp[key] = item;
		    //Flag to signal item retrieval, cannot use the item itself as flag because item can be null  
		    cmp[key+"flag"] = true;
		});
		return !$A.util.isUndefinedOrNull(cmp[key+"flag"]);
	     }, callback);
    },
    testPut:{
	test:[
	/**
	 * Insert bad values
	 */      
	function(cmp){
	    $A.test.setTestTimeout(15000);
	    var storage = $A.storageService.getStorage("browserdb");
	    /*TODO: W-1620514 - TypeError: Cannot read property 'length' of undefined WebSQLAdapter.setItem()
	     * storage.put("unDefined", undefined);
	    this.assertAfterGet(cmp, storage, "unDefined", 
		    		function(){$A.test.assertUndefinedOrNull(cmp["unDefined"], "Failed to put undefined value")});*/
	    storage.put("NULL", null);
	    this.assertAfterGet(cmp, storage, "NULL", 
		    		function(){$A.test.assertUndefinedOrNull(cmp["NULL"], "Failed to put null value")});
	    /* TODO - W-1620514 Can't seem to insert an empty string as value
	     * storage.put("EMPTY", "");
	    this.assertAfterGet(cmp, storage, "EMPTY", 
		    		function(){debugger; $A.test.assertEquals("", cmp["EMPTY"], "Failed to put an empty string")});*/
	},
	/**
	 * Insert bad keys
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    storage.put(null, "NULL");
	    storage.get(null, function(item) { $A.test.assertUndefinedOrNull(item);});
	    storage.put(undefined, "UNDEFINED");
	    storage.get(undefined, function(item) { $A.test.assertEquals("UNDEFINED", item);});
	    storage.put("", "EMPTY");
	    storage.get("", function(item) { $A.test.assertEquals("EMPTY", item);});
	},
	/**
	 * Inset duplicate keys
	 */
	function(cmp){
	    var storage = $A.storageService.getStorage("browserdb");
	    storage.put("dup", "ORIGINAL");
	    storage.get("dup", function(item) { 
				    $A.test.assertEquals("ORIGINAL", item);
				    storage.put("dup", "DUPLICATE");
				    storage.get("dup", function(item) { $A.test.assertEquals("DUPLICATE", item);});
				});
	}
	]
    },
    testExpiry:{
	test:[function(cmp){
	    $A.test.setTestTimeout(30000);
	    //defaultExpiration of 5 seconds
	    $A.storageService.initStorage("testExpiry", false, true, 1024, 5, 300, true, true);
	    var storage = $A.storageService.getStorage("testExpiry");
	    storage.put("key", "Value");
	    this.assertAfterGet(cmp, storage, "key", function(){
		var item = cmp["key"];
		$A.test.assertDefined(item);
		cmp._time = new Date().getTime();
		$A.log(cmp._time);
		//Assert after 5 seconds
		$A.test.addWaitFor(true, function(){
		    			     return (new Date().getTime() - cmp._time)/1000 > 5;
		    			 },function(){
					     $A.log((new Date().getTime() - cmp._time)/1000);
		    			     storage.get("key",function(item){
		    				 $A.log("Even after expiry:" + item)
		    				 //TODO-W-1620521 Expiry is not synchronous, get() still fetches expired items 
		    				 //$A.test.assertUndefinedOrNull(item, "Failed to expire items in cache");
		    			     });
		    			 })
	    });
	},function(cmp){
	    var storage = $A.storageService.getStorage("testExpiry");
	    $A.test.addWaitFor(0, function(){return storage.getSize()});
	}]
    }
})
