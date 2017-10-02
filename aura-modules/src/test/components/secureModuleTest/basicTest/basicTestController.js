({
    testDollarAuraNotAccessibleInModules: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureAura", $A.toString(), "Expected $A in controller to be a SecureAura");
        var testModule = cmp.find("bootstrap");
        var returnStatus = testModule.testDollarAuraNotAccessibleInModules(testUtils);
        testUtils.assertTrue(returnStatus);
    },
    testWindowIsSecure: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window in controller to be a SecureWindow");
        var testModule = cmp.find("bootstrap");
        var returnStatus = testModule.testWindowIsSecure(testUtils);
        testUtils.assertTrue(returnStatus);
    }
})
