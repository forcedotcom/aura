({
    testEventHandlerOnBody: function(cmp) {
        var eventHandlerCalled;
        var testUtils = cmp.get("v.testUtils");
        var body = document.body;
        body.onclick = function(event) {
            eventHandlerCalled = true;
            testUtils.assertStartsWith("SecureDOMEvent", event.toString(), "Expected to receive a SecureDOMEvent");
            testUtils.assertStartsWith("SecureElement", event.target.toString(), "Expected target to be a SecureElement");
            testUtils.assertEquals("BODY", event.target.tagName.toUpperCase());
        }
        body.click();
        testUtils.addWaitForWithFailureMessage(
            true,
            function() { return eventHandlerCalled; },
            "Event handler on shared element was not called"
        );
    }
})
