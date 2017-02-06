({
    testGetEventSourceReturnsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertStartsWith("SecureComponent", secureAuraEvent.getSource().toString());
    },

    testGetSourceReturnsSecureComponentRefWhenNoAccess: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var actual = event.getSource();
        testUtils.assertStartsWith("SecureComponentRef", actual.toString());
    },

    testExerciseEventAPIs: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        var params = { "type": "event", "message": "testMessage" };
        secureAuraEvent.setParams(params);
        testUtils.assertEquals("debugLog", secureAuraEvent.getName());
        testUtils.assertEquals(params.message, secureAuraEvent.getParams().message);
        testUtils.assertEquals("function", typeof secureAuraEvent.fire);
        testUtils.assertEquals("function", typeof secureAuraEvent.stopPropagation);
    },

    testGetType: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var expected = "aura:debugLog";
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertEquals(expected, secureAuraEvent.getType(), "Unexpected type returned from Event.js#getType");
    },

    testGetEventType: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var expected = "APPLICATION";
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertEquals(expected, secureAuraEvent.getEventType(), "Unexpected type returned from Event.js#getEventType");
    }
})
