({
    test$AExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureAura", window.$A.toString(), "Expected $A to return SecureAura");
    },

    testDocumentExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureDocument", window.document.toString(), "Expected window.document to"
                + " return SecureDocument");
    },

    testCircularReferenceIsSecureWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureWindow", window.window.toString(), "Expected window.window to"
                + " return SecureWindow");
    },

    testNoAccessToWindowViaSetTimeout: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        window.setTimeout(function() {
            testUtils.assertStartsWith("SecureWindow", this.toString(), "Expected 'this' inside" +
                " setTimeout callback to be SecureWidow");
            cmp.set("v.testComplete", true);
        }, 0);
    },

    testLocationExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertDefined(window.location);
    },

    testNavigatorExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureNavigator", window.navigator.toString(), "Expected navigator to return SecureNavigator");
    },

    testObjectExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(Object, "Object is not exposed");
        testUtils.assertDefined(window.Object, "window.Object is not exposed");

        testUtils.assertTrue(window.Object === Object,
                "window.Object and Object should reference to same thing.");

    },

    testWhitelistedGlobalAttributeExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(decodeURIComponent, "decodeURIComponent is not exposed");
        testUtils.assertDefined(window.decodeURIComponent, "window.decodeURIComponent is not exposed");

        testUtils.assertTrue(window.decodeURIComponent === decodeURIComponent,
                "window.decodeURIComponent and decodeURIComponent should reference to same thing.");
    },

    testHostedDefinedGlobalsExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(alert, "alert() not exposed");
        testUtils.assertDefined(window.alert, "window.alert() not exposed");

        testUtils.assertTrue(window.alert === alert, "window.alert and alert should reference to same thing.");
    }
})
