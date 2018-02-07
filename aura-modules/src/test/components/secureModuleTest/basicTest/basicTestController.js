({
    testDollarAuraIsSecure : function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        // make sure the component is lockerized and $A resolves to SecureAura when component has interop components in facet
        testUtils.assertStartsWith("SecureAura", $A.toString(), "Expected $A in controller to be a SecureAura");
    },

    testDollarAuraNotAccessibleInModules: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Verify in the module exposed as interop
        var testModule = cmp.find("bootstrap");
        var returnStatus = testModule.testDollarAuraNotAccessibleInModules();
        testUtils.assertTrue(returnStatus);
    },

    testMiscGlobalsNotAccessibleInModules: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("bootstrap");
        testModule.testMiscGlobalsNotAccessibleInModules();
    },

    testWindowIsSecure: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Sanity check: make sure the component is lockerized and its global scope is SecureWindow
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window in controller to be a SecureWindow");

        // Verify in the module exposed as interop
        var testModule = cmp.find("bootstrap");
        var returnStatus = testModule.testWindowIsSecure();
        testUtils.assertTrue(returnStatus);
    },

    testEngineIsSecure: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("bootstrap");
        var returnStatus = testModule.testEngineIsSecure();
        testUtils.assertTrue(returnStatus);
    },

    testElementIsImmutable: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("importElement");
        testUtils.assertTrue(testModule.testDefiningNewPropertiesOnElement());
        testUtils.assertTrue(testModule.testModifyExistingPropertiesOnElement());
    },

    testOptOutOfLockerUsingMetaData: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("nonLockerized");
        testUtils.assertTrue(testModule.testWindowIsUnsecure());
        testUtils.assertTrue(testModule.testEngineIsUnsecure());
    },

    testSecureModulesInUnsupportedBrowsers: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("bootstrap");
        testUtils.assertTrue(testModule.testSecureModulesInUnsupportedBrowsers());
    },

    sanityChecksTester: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var testModule = cmp.find("sanityChecks");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
