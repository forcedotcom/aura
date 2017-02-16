({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
    	function verifyRawStorage(type, expectedNextSynthtic, expectedIndex) {
    		var storage = type === "LOCAL" ? localStorage : sessionStorage;
    		
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