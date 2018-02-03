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

    // Disabled until LWC supports * imports again
    _testEngineIsImmutable: {
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
    },

    /**
     * Verify that modules are evaluated in browsers where locker is gracefully degraded
     */
    testSecureModulesInUnsupportedBrowsers: {
        // only run in unsupported browsers where we fallback to non-Locker mode
        browsers: ["IE8", "IE9", "IE10", "IE11"],
        test: function (cmp) {
            cmp.testSecureModulesInUnsupportedBrowsers();
        }
    },

    testCanAccessDocumentBodyFromInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testCanAccessDocumentBodyFromInternalLib");
        }
    },

    testCanAccessDocumentHeadFromInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testCanAccessDocumentHeadFromInternalLib");
        }
    },

    testWindowIsSecureInInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testWindowIsSecureInInternalLib");
        }
    },

    testDollarAuraNotAccessibleInInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testDollarAuraNotAccessibleInInternalLib");
        }
    },

    testEngineIsSecureInInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testEngineIsSecureInInternalLib");
        }
    },

    testSecureWrappersInRenderer: {
        attributes: {
            testRenderer: true
        },
        test: function(cmp) {
            // Renderer will throw an error on load if anything is not Lockerized as expected, nothing to assert here.
        }
    },

    testDocumentIsSecure: {
        test: function(cmp) {
            cmp.sanityChecksTester("testDocumentIsSecure");
        }
    },

    testDocumentIsSecureInInternalLib: {
        test: function(cmp) {
            cmp.sanityChecksTester("testDocumentIsSecureInInternalLib");
        }
    },

    // W-4240480: Because of LS has not fully hooked into locker-membrane, appendChild() will fail (Documented here W-4389861)
    _testAppendDynamicallyCreatedDivToMarkup: {
        test: function(cmp) {
            cmp.sanityChecksTester("testAppendDynamicallyCreatedDivToMarkup");
        }
    },

    testContextInModule: {
        test: function(cmp) {
            cmp.sanityChecksTester("testContextInModule");
        }
    },

    testDefineGetterExploit: {
        // This exploit not covered in IE11
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
        // Remove UnAdaptableTest label when unsafe-eval and unsafe-inline are added back to CSP
        labels: ["UnAdaptableTest"],
        test: function(cmp) {
            cmp.sanityChecksTester("testDefineGetterExploit");
        }
    },

    /**
     * See W-2974202 for original exploit.
     */
    testSetTimeoutNonFunctionParamExploit: {
        test: function(cmp) {
            cmp.sanityChecksTester("testSetTimeoutNonFunctionParamExploit");
        }
    },

    testLocationExposed: {
        test: function(cmp) {
            cmp.sanityChecksTester("testLocationExposed");
        }
    },

    testCtorAnnotation: {
        test: function(cmp) {
            cmp.sanityChecksTester("testCtorAnnotation");
        }
    },

    testSecureElementPrototypeCounterMeasures: {
        test: function(cmp) {
            cmp.sanityChecksTester("testSecureElementPrototypeCounterMeasures");
        }
    },

    testInstanceOf: {
        test: function(cmp) {
            cmp.sanityChecksTester("testInstanceOf");
        }
    }
})
