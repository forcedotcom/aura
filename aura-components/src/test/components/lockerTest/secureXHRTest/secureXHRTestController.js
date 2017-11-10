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
    },

    testResponseXML: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");

        var client = new XMLHttpRequest();
        client.open("GET", "https://localhost/document.xml");
        client.send();

        testUtils.addWaitFor(true, function() {
          return client.readyState === 4;
        }, function() {
            testUtils.assertEquals(200, client.status, "XHR Response should be 200");
            testUtils.assertStartsWith("[object XMLDocument]", client.responseXML + '', "XHR Response should be XMLDocument");
        });
    },

    testOpenMethodURLParameter: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        var urlSafe = "/api/get";
        var urlUnsafe = "/auraFW/resources/qa/testScript.js";

        var urlShapeShifter = {
           toString: function() {
                if (this.x) {
                    return urlUnsafe;
                }
                this.x = true
                return urlSafe;
           }
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", urlSafe, true);
        xhr.send("requestbody");
        testUtils.assertEquals("good", xhr.responseText, "");

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", urlUnsafe, true);
            xhr.send("requestbody");
            testUtils.fail("SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints " + urlUnsafe + "!");
        } catch (e) {
            testUtils.assertEquals("SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints " + urlUnsafe + "!", e.toString());
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", urlShapeShifter, true);
        xhr.send("requestbody");
        testUtils.assertEquals("good", xhr.responseText, "");
    }
})
