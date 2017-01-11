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

    testCreateDocumentFragmentReturnsSecureElement: {
        test: function(cmp) {
            cmp.testCreateDocumentFragmentReturnsSecureElement();
        }
    },

    testCreateDocumentFragmentAndVerifyShape: {
        test: function(cmp) {
            cmp.testCreateDocumentFragmentAndVerifyShape();
        }
    },

    testCreateScriptElementReturnsSecureScript: {
        test: function(cmp) {
            cmp.testCreateScriptElementReturnsSecureScript();
        }
    },

    testCreateTextNodeReturnsSecureElement: {
        test: function(cmp) {
            cmp.testCreateTextNodeReturnsSecureElement();
        }
    },

    testCreateElementsAndPushToMarkup: {
        test: function(cmp) {
            cmp.testCreateElementsAndPushToMarkup();
        }
    },

    testGetElementByIdReturnsSecureElement: {
        test: function(cmp) {
            cmp.testGetElementByIdReturnsSecureElement();
        }
    },

    testQuerySelectorReturnsSecureElement: {
        test: function(cmp) {
            cmp.testQuerySelectorReturnsSecureElement();
        }
    },

    testSecureDocumentCookie: {
        test: function(cmp) {
            cmp.testSecureDocumentCookie(document.cookie);
        }
    },

    testDocumentTitle: {
        test: function(cmp) {
            cmp.testDocumentTitle();
            // Verify title is set in system-mode
            $A.test.assertEquals("secureDocumentTest", document.title);
        }
    },

    testQuerySelectorAllReturnsSecureNodeList: {
        test: function(cmp) {
            cmp.testQuerySelectorAllReturnsSecureNodeList();
        }
    },

    testDocumentBodyConstructorNotExposed: {
        test: function(cmp) {
            cmp.testDocumentBodyConstructorNotExposed();
        }
    },

    /**
     * Prevent malicious users from passing in a carefully designed object to SecureDocument.createElement() that may
     * break out of the Locker.
     */
    testCreateElementCoersionExploit: {
        test: function(cmp) {
            cmp.testCreateElementCoersionExploit();
        }
    },

    testCreateElementNSForSVGElement: {
        test: function(cmp) {
            cmp.testCreateElementNSForSVGElement();
        }
    },

    testGetElementsByTagNameForScriptTag: {
        test: function(cmp) {
            cmp.testGetElementsByTagNameForScriptTag();
        }
    },

    testCreateEvent: {
        test: function(cmp) {
            cmp.testCreateEvent();
        }
    },

    testDefaultView: {
        test: function(cmp) {
            cmp.testDefaultView();
        }
    },

    testDocumentImplementationHTMLDocumentCreation: {
        test: function(cmp) {
            cmp.testDocumentImplementationHTMLDocumentCreation();
        }
    },

    /**
     * Previously, documentElement was a clone of the raw value. This caused issues when trying to read values off of
     * the cloned object since they will all be reset. Verify we get a real value back as a basic test.
     */
    testDocumentElementHasNonZeroPropertyValues: {
        test: function(cmp) {
            cmp.testDocumentElementHasNonZeroPropertyValues();
        }
    },

    testDocumentConstructorPassesInstanceOf: {
        test: function(cmp) {
            cmp.testDocumentConstructorPassesInstanceOf();
        }
    }
})
