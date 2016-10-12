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

    testHistoryExposedOnWindow: {
        test: function(cmp) {
            cmp.testHistoryExposedOnWindow();
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
    },

    testOpen_HttpsUrl: {
        // TODO(W-3407050): IE11 returns custom objects for window.open and similar APIs and should be
        //                  conditionally disabled on the client.
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
        test: function(cmp) {
            cmp.testOpen_HttpsUrl();
        }
    },

    testOpen_HttpUrl: {
        // TODO(W-3407050): IE11 returns custom objects for window.open and similar APIs and should be
        //                  conditionally disabled on the client.
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
        test: function(cmp) {
            cmp.testOpen_HttpUrl();
        }
    },

    testOpen_RelativeUrl:{
        // TODO(W-3407050): IE11 returns custom objects for window.open and similar APIs and should be
        //                  conditionally disabled on the client.
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
        test: function(cmp) {
            cmp.testOpen_RelativeUrl();
        }
    },

    testOpen_JavascriptIsBlocked: {
        test: function(cmp) {
            cmp.testOpen_JavascriptIsBlocked();
        }
    }
})
