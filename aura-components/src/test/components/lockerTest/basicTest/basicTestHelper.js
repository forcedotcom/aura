({
    testCannotAccessDocumentBodyFromHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureThing", document.body.toString(), "Expected document.body in helper to be an SecureThing");
    },

    testAuraLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureAura", $A.toString(), "Expected $A in helper to be a SecureAura");
    },
    
    testDocumentLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureDocument", document.toString(), "Expected document in helper"
                + " to be a SecureDocument");
    },

    testWindowLockerInHelper: function(testUtils) {
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window in helper"
                + " to be a SecureWindow");
    },

    doTestSecureElementFrozenAfterCreation : function(testUtils, div) {
        testUtils.assertStartsWith("SecureElement", div.toString(), "Unexpected object returned from helper");
        testUtils.assertTrue(Object.isSealed(div), "SecureElement should be sealed");

        try {
            div.onclick = function(event) {};
            testUtils.fail("Should not be able to set a new property on SecureElement");
        } catch (e) {
            if (e.toString().indexOf("TypeError") !== 0) {
                testUtils.fail("Unexpected exception: " + e.toString());
            }
            testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");
        }

        try {
            Object.defineProperty(div, "onclick", {});
            testUtils.fail("Should not be able to define a new property via Object.defineProperty on SecureElement");
        } catch(e) {
            if (e.toString().indexOf("TypeError") !== 0) {
                testUtils.fail("Unexpected exception: " + e.toString());
            }
            testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");
        }
        testUtils.assertUndefined(div.onclick, "Should not be able to define a property on SecureElement");

        // Verify we can still modify whitelisted properties
        div.className = "fancypants";
        testUtils.assertEquals("fancypants", div.className, "Could not set property 'className' on SecureElement");
    },

    testFunction : function() {
        var f = new Function("x", "y", "return x + y");
        if (f(1, 2) !== 3) {
            throw new Error("Unable to use new Function()");
        }
    },

    doTestEvalForUndefined : function(cmp, testCase, testUtils) {
        testUtils.assertStartsWith("Global window via " + testCase.toString() + ": undefined", this.testExpression(testCase));
    },

    doTestEvalForSecureWindow : function(cmp, testCase, testUtils) {
        testUtils.assertStartsWith("Global window via " + testCase.toString() + ": SecureWindow", this.testExpression(testCase));
    },

    testExpression : function(testCase) {
        var result = testCase();
        return "Global window via " + testCase.toString() + ": " + result;
    }
})
