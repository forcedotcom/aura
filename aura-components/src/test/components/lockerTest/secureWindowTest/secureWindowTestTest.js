({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    test$AExposedOnWindow: {
        test: function(cmp) {
            cmp.test$AExposedOnWindow();
        }
    },

    testDocumentExposedOnWindow: {
        test: function(cmp) {
            cmp.testDocumentExposedOnWindow();
        }
    },

    testCircularReferenceIsSecureWindow: {
        test: function(cmp) {
            cmp.testCircularReferenceIsSecureWindow();
        }
    },

    testNoAccessToWindowViaSetTimeout: {
        test: function(cmp) {
            cmp.testNoAccessToWindowViaSetTimeout();
            $A.test.addWaitFor(true, function() {
                return !!cmp.get("v.testComplete");
            });
        }
    },

    testLocationExposedOnWindow: {
        test: function(cmp) {
            cmp.testLocationExposedOnWindow();
        }
    },

    testNavigatorExposedOnWindow: {
        test: function(cmp) {
            cmp.testNavigatorExposedOnWindow();
        }
    },

    testObjectExposedOnWindow: {
        test: function(cmp) {
            cmp.testObjectExposedOnWindow();
        }
    },

    testWhitelistedGlobalAttributeExposedOnWindow: {
        test: function(cmp) {
            cmp.testWhitelistedGlobalAttributeExposedOnWindow();
        }
    },

    testHostedDefinedGlobalsExposedOnWindow: {
        test: function(cmp) {
            cmp.testHostedDefinedGlobalsExposedOnWindow();
        }
    },

    testTimerReturns: {
        test: function(cmp) {
            cmp.testTimerReturns();
        }
    }
})
