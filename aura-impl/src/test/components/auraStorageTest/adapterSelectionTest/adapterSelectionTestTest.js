({
	/**
     * Verify AuraStorageService.selectAdapter(persistent, secure) combinations
     */

    testSelectNotPersistentAndNotSecure: {
        test: function(cmp){
            $A.test.assertEquals("memory", $A.storageService.selectAdapter(false, false));
        }
    },

    testSelectPersistentAndNotSecure: {
        test: function(cmp){
        	var expectedAdapter = $A.storageService.adapters["smartstore"] ? "smartstore" : $A.storageService.adapters["websql"] ? "websql" : "memory";
            $A.test.assertEquals(expectedAdapter, $A.storageService.selectAdapter(true, false));
        }
    },
	
    testSelectNotPersistentAndSecure: {
        test: function(cmp){
            $A.test.assertEquals("memory", $A.storageService.selectAdapter(false, true));
        }
    },

    testSelectPersistentAndSecure: {
        test: function(cmp){
            $A.test.assertEquals("memory", $A.storageService.selectAdapter(true, true));
        }
    },
    testSelectDefault:{
	test: function(cmp){
	    $A.test.assertEquals("memory", $A.storageService.selectAdapter());
	}
    }
})