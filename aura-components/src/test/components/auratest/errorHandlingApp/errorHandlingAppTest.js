({
    /**
     * Verify that AuraError's severity default value is Alert
     */
    testAuraErrorDefaultSeverity : {
        attributes: {"handleSystemError": true},
        test: function(cmp) {
            $A.test.expectAuraError("AuraError from app client controller");
            $A.test.clickOrTouch(cmp.find("auraErrorFromClientControllerButton").getElement());
            //cmp.throwAuraErrorFromClientController();

            var expected = $A.severity.ALERT;
            var actual = cmp.get("v.severity");

            // set handler back to default, so that error model can show up
            cmp.set("v.handleSystemError", false);
            $A.test.assertEquals(expected, actual);
        }
    },

    /**
     * Verify that AuraError's severity default value is Quiet
     */
    testAuraFriendlyErrorDefaultSeverity : {
        attributes: {"handleSystemError": true},
        test: function(cmp) {
            $A.test.expectAuraError("AuraFriendlyError from app client controller");
            $A.test.clickOrTouch(cmp.find("auraFriendlyErrorFromClientControllerButton").getElement());

            var expected = $A.severity.QUIET;
            var actual = cmp.get("v.severity");

            // set handler back to default, so that error model can show up
            cmp.set("v.handleSystemError", false);
            $A.test.assertEquals(expected, actual);
        }
    },

    /**
     * Verify that AuraError's severity default value is Alert
     */
    testAuraErrorWithNonDefaultSeverityInHanlder : {
        attributes: {
            "handleSystemError": true,
            "severity": "FATAL"
        },
        test: function(cmp) {
            $A.test.expectAuraError("AuraError from app client controller");
            $A.test.clickOrTouch(cmp.find("auraErrorFromClientControllerButton").getElement());

            var expected = $A.severity.FATAL;
            var actual = cmp.get("v.severity");

            // set handler back to default, so that error model can show up
            cmp.set("v.handleSystemError", false);
            $A.test.assertEquals(expected, actual);
        }
    },

    /**
     * Verify that a non-AuraError is wrapped in an AuraError when it's handled in error handler
     */
     testNonAuraErrorIsWrappedAsAuraErrorInHandler: {
        attributes: {"handleSystemError": true},
        test: function(cmp) {
            var expectedMessage = "Error from app client controller";
            $A.test.expectAuraError(expectedMessage);
            $A.test.clickOrTouch(cmp.find("errorFromClientControllerButton").getElement());

            // cmp._auraError gets assigned in error handler
            var targetError = cmp._auraError;
            cmp.set("v.handleSystemError", false);
            $A.test.assertTrue(targetError instanceof AuraError);
            $A.test.assertTrue($A.test.contains(targetError.message, expectedMessage),
                    "Error in handler doesn't contain the original error message.");
        }
     }
})
