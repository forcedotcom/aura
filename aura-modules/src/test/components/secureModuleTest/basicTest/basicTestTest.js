({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741): FF browser versions in autobuilds is too far behind
    // TODO W-4363273: Bug in BrowserCompatibilityServiceImpl, serving compat version of aura fw js in Safari 11
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function (cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testDollarAuraIsSecure: {
        test: function(cmp) {
            cmp.testDollarAuraIsSecure();
        }
    },

    testDollarAuraNotAccessibleInModules: {
        test: function (cmp) {
            cmp.testDollarAuraNotAccessibleInModules();
        }
    },

    /**
     * Verify that miscellaneous globals like aura, Sfdc, sforce
     */
    testMiscGlobalsNotAccessibleInModules: {
        test: function (cmp) {
            cmp.testMiscGlobalsNotAccessibleInModules();
        }
    },

    testWindowIsSecure: {
        test: function (cmp) {
            cmp.testWindowIsSecure();
        }
    },

    testEngineIsSecure: {
        test: function (cmp) {
            cmp.testEngineIsSecure();
        }
    },

    testEngineIsImmutable: {
        test: function (cmp) {
            cmp.testEngineIsImmutable();
        }
    },

    testOptOutOfLockerUsingMetaData: {
        test: function (cmp) {
            cmp.testOptOutOfLockerUsingMetaData();
        }
    },

    testElementIsImmutable: {
        test: function (cmp) {
            cmp.testElementIsImmutable();
        }
    }
})
