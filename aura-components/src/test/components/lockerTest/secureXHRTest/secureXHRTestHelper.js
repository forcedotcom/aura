({
	createXHRHandler: function(testUtils) {
		return function(event) {
	        testUtils.assertStartsWith("SecureDOMEvent", event.toString(), "Expected event to be a SecureDOMEvent");
	        testUtils.assertStartsWith("SecureXMLHttpRequest", this.toString(), "Expected this to return SecureXMLHttpRequest");
	        
	        if (this.readyState == 4 && this.status == 200) {
	        	testUtils.assertStartsWith("<!DOCTYPE html><html><head><title>Aura</title>",  this.responseText.trim());
	    	}
    	};
    },
        	
    testCallback: function (cmp, wireUpEventHandler) {
    	var testUtils = cmp.get("v.testUtils");
        
        var xhr = new XMLHttpRequest();
        testUtils.assertStartsWith("SecureXMLHttpRequest", xhr.toString(), "Expected new XMLHttpRequest() to return SecureXMLHttpRequest");
                
    	xhr.open("GET", "/lockerTest/secureXHRTest.cmp", true);
        
        wireUpEventHandler(xhr, testUtils);

    	xhr.send();
    	    	
    	// DCHASMAN TODO TrevorB is there a race condition we have to deal with above wrt the async callback testing??? Seems to run correctly but am concerned about it flapping.
    	// I verified that the test completes all of the work by adding testUtils.fail("We made it"); to the end of the XHR callback.
	}
})