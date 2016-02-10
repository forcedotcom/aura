({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testCreateDocumentFragmentReturnsSecureElement: {
        test: function(cmp) {
            cmp.getDocumentFragment();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", wrapped.toString(), "Expected document.createDocumentFragment()"
                    + " to return a SecureElement");
        }
    },

    testCreateScriptElementReturnsSecureScript: {
        test: function(cmp) {
            cmp.getScriptElement();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureScript", wrapped.toString(), "Expected document.createElement(script)"
                    + " to return a SecureScript");
        }
    },

    testCreateIframeElementThrowsError: {
        test: function(cmp) {
            try {
                cmp.getIframeElement();
                $A.test.fail("Expected error to be thrown trying to create an iframe element");
            } catch (e) {
                $A.test.assertStartsWith("SecureDocument: iframe element is not currently supported", e.message);
            }
        }
    },

    testCreateTextNodeReturnsSecureElement: {
        test: function(cmp) {
            cmp.getTextNode();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", wrapped.toString(), "Expected document.createTextNode()"
                    + " to return a SecureElement");
        }
    },

    testCreateElementsAndPushToMarkup: {
        test: function(cmp) {
            cmp.createElementsPushToMarkup();
            var content = cmp.find("content").getElement();
            $A.test.assertEquals("hello from the locker", content.innerText, "Unexpected text on document elements"
                    + " created in controller");
        }
    },

    testGetElementByIdReturnsSecureElement: {
        test: function(cmp) {
            cmp.getElementById();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", wrapped.toString(), "Expected document.getElementById()"
                    + " to return a SecureElement");
        }
    },

    testQuerySelectorReturnsSecureElement: {
        test: function(cmp) {
            cmp.getQuerySelector();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", wrapped.toString(), "Expected document.querySelector()"
                    + " to return a SecureElement");
        }
    },

    testSecureDocumentCookie: {
        test: function(cmp) {
            cmp.getCookie();
            var cookie = cmp.get("v.log");
            $A.test.assertEquals(document.cookie, cookie);
        }
    }
})