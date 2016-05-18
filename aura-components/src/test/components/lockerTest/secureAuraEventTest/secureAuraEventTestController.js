({
    testGetEventSourceReturnsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertStartsWith("SecureComponent", secureAuraEvent.getSource().toString());
    },

    testExerciseEventAPIs: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        var params = { "type": "event", "message": "testMessage" };
        secureAuraEvent.setParams(params);
        testUtils.assertEquals("debugLog", secureAuraEvent.getName());
        testUtils.assertEquals(params.message, secureAuraEvent.getParams().message);
        testUtils.assertDefined(secureAuraEvent.fire);
        testUtils.assertDefined(secureAuraEvent.stopPropagation);
    }
})