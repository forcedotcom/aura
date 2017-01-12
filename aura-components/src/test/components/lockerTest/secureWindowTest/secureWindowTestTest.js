({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

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
        // window.open will not open a new window for mobile autobuild runs
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-IPHONE", "-IPAD"],
        test: function(cmp) {
            cmp.testOpen_HttpsUrl();
        }
    },

    testOpen_HttpUrl: {
        // window.open will not open a new window for mobile autobuild runs
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-IPHONE", "-IPAD"],
        test: function(cmp) {
            cmp.testOpen_HttpUrl();
        }
    },

    testOpen_RelativeUrl:{
        // window.open will not open a new window for mobile autobuild runs
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-IPHONE", "-IPAD"],
        test: function(cmp) {
            cmp.testOpen_RelativeUrl();
        }
    },

    testOpen_JavascriptIsBlocked: {
        test: function(cmp) {
            cmp.testOpen_JavascriptIsBlocked();
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

    testBlob_WithScriptTagsBlocked: {
        test: function (cmp) {
            cmp.testBlob_WithScriptTagsBlocked();
        }
    },

    testFile: {
        // window.File is not implemented correctly in iOS 9.2
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-IPHONE", "-IPAD"],
        test: function(cmp) {
            cmp.testFile();
        }
    },

    testFile_WithScriptTagsBlocked: {
        // window.File is not implemented correctly in iOS 9.2
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-IPHONE", "-IPAD"],
        test: function (cmp) {
            cmp.testFile_WithScriptTagsBlocked();
        }
    }
})
