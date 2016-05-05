({
    testCannotAccessAuraEndpoints: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        ["/aura", "/\nau\nra", "/%61ura", "/aur%61", "/A/..%2Faura"].forEach(function(url) {
	        try {
	            var xhr = new XMLHttpRequest();
	            xhr.open("POST", url, true);
	            xhr.send();
	            testUtils.fail("Should not be able to access " + url);
	        } catch(e) {
	            testUtils.assertEquals("SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints " + url + "!", e.toString());
	        }
        });
    },

    testAddEventListener: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        helper.testCallback(cmp, function(xhr, testUtils) {
            xhr.addEventListener("load", helper.createXHRHandler(cmp, testUtils));
        });

        testUtils.addWaitFor(true, function() { return cmp.get("v.completed") });
    },

    testOnReadyStateChange: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        helper.testCallback(cmp, function(xhr, testUtils) {
            xhr.onreadystatechange = helper.createXHRHandler(cmp, testUtils);
        });

        testUtils.addWaitFor(true, function() { return cmp.get("v.completed") });
    }
})
