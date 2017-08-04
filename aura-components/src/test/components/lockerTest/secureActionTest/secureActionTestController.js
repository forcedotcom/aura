({
    testServerActionIsSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.getString");
        testUtils.assertStartsWith("SecureAction", secureAction.toString(), "Expected server-side action in the locker" +
            " to be a SecureAction");
        testUtils.assertEquals("getString", secureAction.getName(), "Unexpected action name");
    },

    testClientActionIsSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.clientActionForTest");
        testUtils.assertStartsWith("SecureAction", secureAction.toString(), "Expected client-side action in the locker" +
            " to be a SecureAction");
    },

    testActionThatErrors: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.throwExceptionNoLineNums");
        secureAction.setCallback(this, function(a) {
            var error = a.getError();
            testUtils.assertTrue(error && error.length > 0, "Expected Action error not present in callback");
            testUtils.assertTrue(error[0].message.indexOf("throwExceptionNoLineNums") >= 0, "Unexpected Action error");
            testUtils.assertEquals("ERROR", a.getState());
            cmp.set("v.testComplete", true);
        });
        $A.enqueueAction(secureAction);
    },

    testSetParams: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.getString");
        secureAction.setParams({
            "param": "foo"
        });
        secureAction.setCallback(this, function(a) {
            testUtils.assertStartsWith("SecureAction", a.toString());
            testUtils.assertEquals("foo", a.getReturnValue());
            cmp.set("v.testComplete", true);
        });
        $A.enqueueAction(secureAction);
    },

    testDifferentNamespacedActionPassedFromSystemMode: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var facetAction = event.getParam("arguments").facetAction;
        testUtils.assertStartsWith("SecureObject", facetAction.toString(), "Action from another component passed from " +
                "system mode should be SecureObject");
        testUtils.assertUndefined(facetAction.setCallback, "Action.js APIs should not be defined on action we don't have access to");
    },

    testGlobalControllerBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var action = $A.get("c.aura://ComponentController.getComponent");
        testUtils.assertStartsWith("SecureObject", action.toString(), "Action from global controller should be SecureObject");
        testUtils.assertUndefined(action.setCallback, "Action.js APIs should not be defined on action we don't have access to");
    },

    clientActionForTest: function(cmp) {
        // dummy client action to use in test
    }
})
