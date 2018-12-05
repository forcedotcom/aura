({
    dispatchEventAndAssert: function(testUtils, targetElement, eventName, dispatchRoutine, expectedCurrentTarget, expectedTarget) {
        var done = false;
        targetElement.addEventListener(eventName, function(event) {
            testUtils.assertEquals(expectedCurrentTarget, event.currentTarget, "Expected currentTarget element not received");
            testUtils.assertEquals(expectedTarget, event.target, "Expected target element not received");
            done = true;
        });
        dispatchRoutine();
        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return done;
            },
            'Event handler in Aura component should have been triggered by event'
        );
    }
})