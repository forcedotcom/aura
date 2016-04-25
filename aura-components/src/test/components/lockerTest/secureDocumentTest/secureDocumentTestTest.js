({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testCreateDocumentFragmentReturnsSecureElement: {
        test: function(cmp) {
            cmp.testCreateDocumentFragmentReturnsSecureElement();
        }
    },

    testCreateScriptElementReturnsSecureScript: {
        test: function(cmp) {
            cmp.testCreateScriptElementReturnsSecureScript();
        }
    },

    testCreateIframeElementReturnsSecureIframeElement: {
        test: function(cmp) {
            cmp.testCreateIframeElementReturnsSecureIframeElement();
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
    }
})