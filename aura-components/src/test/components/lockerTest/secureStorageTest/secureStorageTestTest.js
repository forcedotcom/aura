({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10"],

    setUp: function(cmp) {
    	function verifyRawStorage(storage, type, expectedNextSynthtic, expectedIndex) {
    		var nextSyntheticKey = "LSSNextSynthtic:" + type;		
    		var storedIndexKey = "LSSIndex:" + type + "{\"namespace\":\"lockerTest\"}";
    
    		$A.test.assertEquals(expectedNextSynthtic, storage.getItem(nextSyntheticKey));
    		$A.test.assertEquals(expectedIndex, storage.getItem(storedIndexKey));
    	}
        
        cmp.set("v.testUtils", $A.test);
        cmp.set("v.verifyRawStorage", verifyRawStorage);
    },

    testSecureLocalStorage: {
        test: function(cmp) {
        	localStorage.clear();
        	
            cmp.testSecureLocalStorage();
        }
    },
    
    testSecureSessionStorage: {
        test: function(cmp) {
        	sessionStorage.clear();
        	
            cmp.testSecureSessionStorage();
        }
    }
})