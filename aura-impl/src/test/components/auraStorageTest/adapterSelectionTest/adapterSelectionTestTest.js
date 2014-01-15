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
            // without a persistent and secure adapter, fallback to one that is transient and secure
            $A.test.assertEquals("memory", $A.storageService.selectAdapter(true, true));
            
            // register a persistent and secure adapter and ensure it is selected
            $A.storageService.registerAdapter({ 
                "name": "secureAdapter",
                "persistent": true,
                "secure": true
            });
            $A.test.assertEquals("secureAdapter", $A.storageService.selectAdapter(true, true));
        }
    },
    testSelectDefault:{
	test: function(cmp){
	    $A.test.assertEquals("memory", $A.storageService.selectAdapter());
	}
    }
})