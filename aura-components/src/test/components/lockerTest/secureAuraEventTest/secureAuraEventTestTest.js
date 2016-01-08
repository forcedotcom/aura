({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testGetEventSourceReturnsSecureComponent: {
        test: function(cmp) {
            cmp.getEvent();
            var event = cmp.get("v.log");
            $A.test.assertStartsWith("SecureComponent", event.source.toString());
            $A.test.assertStartsWith("SecureComponent", event.getSource().toString());
        }
    },
    
    testExerciseEventAPIs: {
        test: function(cmp) {
            cmp.getEvent();
            var event = cmp.get("v.log");
            var params = { "type": "event", "message": "testMessage" };
            event.setParams(params);
            $A.test.assertEquals("debugLog", event.getName());
            $A.test.assertEquals(params.message, event.getParams().message);
            $A.test.assertDefined(event.fire);
        }
    }
})