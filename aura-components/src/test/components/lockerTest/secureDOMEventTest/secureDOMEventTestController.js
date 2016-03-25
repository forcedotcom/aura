({
    testClickEvent: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var event;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
            event = e;
        });
        element.click(); 
        testUtils.assertStartsWith("SecureDOMEvent", event.toString());
        testUtils.assertStartsWith("SecureElement", event.target.toString(), "Expected event.target to return SecureElement");
        testUtils.assertStartsWith("SecureElement", event.srcElement.toString(), "Expected event.srcElement to return SecureElement");
        testUtils.assertDefined(event.path, "Unable to access event.path");
        // Verify non-wrapped method is still accessible
        testUtils.assertEquals("number", typeof event.timeStamp);
    },
    
    testEventViewThrowsError: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var event;
        var element = cmp.find("title").getElement();
        element.addEventListener("click", function(e) {
            event = e;
        });
        element.click(); 
        try {
            event.view;
            testUtils.fail("Expected event.view to throw an Error");
        } catch (e) {
            testUtils.assertStartsWith("Access denied for insecure", e.message, "Unexpected error accessing event.view");
        }
    }
})