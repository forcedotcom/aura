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
    }
})