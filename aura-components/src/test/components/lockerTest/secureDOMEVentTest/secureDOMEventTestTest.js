({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testClickEvent: {
        test: function(cmp) {
            cmp.getClickDOMEvent();
            var event = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", event.target.toString(), "Expected event.target to return SecureElement");
            $A.test.assertStartsWith("SecureElement", event.srcElement.toString(), "Expected event.srcElement to return SecureElement");
            $A.test.assertEquals("SecureDOMEvent test", event.target.innerText, "Unexpected text on event.target");
            // Verify non-wrapped method is still accessible
            $A.test.assertEquals("number", typeof event.timeStamp);
        }
    },

    testEventViewThrowsError: {
        test: function(cmp) {
            cmp.getClickDOMEvent();
            var event = cmp.get("v.log");
            try {
                event.view;
                $A.test.fail("Expected event.view to throw an Error");
            } catch (e) {
                $A.test.assertStartsWith("Access denied for insecure", e.message, "Unexpected error accessing event.view");
            }
        }
    }
})