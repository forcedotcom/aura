({
    testServerActionIsSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.getString");
        testUtils.assertStartsWith("SecureAction", secureAction.toString(), "Expected server-side action in the locker" +
            " to be a SecureAction");
    },

    testClientActionIsSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.clientActionForTest");
        testUtils.assertStartsWith("SecureAction", secureAction.toString(), "Expected client-side action in the locker" +
            " to be a SecureAction");
    },

    testActionThatErrors: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.throwException");
        secureAction.setCallback(this, function(a) {
            var error = a.getError();
            testUtils.assertTrue(error && error.length > 0, "Expected Action error not present in callback");
            testUtils.assertTrue(error[0].message.indexOf("intentionally generated") >= 0, "Unexpected Action error");
            testUtils.assertEquals("ERROR", a.getState());
            cmp.set("v.testComplete", true);
        });
        $A.enqueueAction(secureAction);
    },

    testDifferentNamespacedActionPassedFromSystemMode: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var facetAction = event.getParam("arguments").facetAction;
        facetAction.setCallback(this, function(a) {
            testUtils.assertEquals("SUCCESS", a.getState());
            cmp.set("v.testComplete", true);
        });
        $A.enqueueAction(facetAction);
    },

    clientActionForTest: function(cmp) {
        // dummy client action to use in test
    }
})
