({
    testClickEvent: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var domEvent;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
        	domEvent = e;
        });
        element.click(); 
        testUtils.assertStartsWith("SecureDOMEvent", domEvent.toString());
        testUtils.assertStartsWith("SecureElement", domEvent.target.toString(), "Expected event.target to return SecureElement");
        testUtils.assertEquals("click", domEvent.type, "Unexpected DOM event type");
        // Verify non-wrapped method is still accessible
        testUtils.assertEquals("number", typeof domEvent.timeStamp);
    },
    
    testEventViewThrowsError: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var domEvent;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
        	domEvent = e;
        });
        element.click(); 
        try {
        	domEvent.view;
            testUtils.fail("Expected event.view to throw an Error");
        } catch (e) {
            testUtils.assertStartsWith("Access denied for insecure", e.message, "Unexpected error accessing event.view");
        }
    }
})