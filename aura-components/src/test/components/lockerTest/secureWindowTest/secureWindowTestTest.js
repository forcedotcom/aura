({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    /**
     * Test that $A is available on window
     */
    testDollarAExposedOnWindow: {
        test: function(cmp) {
            cmp.testDollarAExposedOnWindow();
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
            // v.expectedPath is a string and will not be altered by Locker filtering
            cmp.set("v.expectedPath", window.location.pathname);
            cmp.testLocationExposedOnWindow();
        }
    },

    testModifyWindowLocation: {
        test: function(cmp) {
            cmp.set("v.expectedPath", window.location.pathname);
            cmp.testModifyWindowLocation();
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

    testArbitrarySchemes: {
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testArbitrarySchemes();
        }
    },

    testOpen_HttpsUrl: {
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testOpen_HttpsUrl();
        }
    },

    testOpen_HttpUrl: {
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testOpen_HttpUrl();
        }
    },

    testOpen_RelativeUrl:{
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testOpen_RelativeUrl();
        }
    },

    testOpen_JavascriptIsBlocked: {
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testOpen_JavascriptIsBlocked();
        }
    },

    testOpen_UrlRestrictionByPass: {
        // "window.open" will not open a new window for mobile autobuild runs.
        test: function(cmp) {
            cmp.testOpen_UrlRestrictionByPass();
        }
    },

    testCreateImageElement: {
        test: function(cmp) {
            cmp.testCreateImageElement();
        }
    },

    testBlob: {
        test: function(cmp) {
            cmp.testBlob();
        }
    },

    testFile: {
        // window.File is not implemented correctly in iOS 9.2
        test: function(cmp) {
            cmp.testFile();
        }
    },

    testFile_WithScriptTagsBlocked: {
        // window.File is not implemented correctly in iOS 9.2
        test: function (cmp) {
            cmp.testFile_WithScriptTagsBlocked();
        }
    },

    testMediaStreamBlocked: {
        test: function (cmp) {
            cmp.testMediaStreamBlocked();
        }
    },

    testJavascriptPseudoScheme: {
        test: function(component) {
            component.testJavascriptPseudoScheme();
        }
    },

    testLocationAssign: {
        test: function(component) {
            component.testLocationAssign();
        }
    }
})
