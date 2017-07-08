({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

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

    testCreateScriptElementReturnsSecureElement: {
        test: function(cmp) {
            cmp.testCreateScriptElementReturnsSecureElement();
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

    // remove cookies here in system mode to bypass Locker filtering logic
    removeCookies: function() {
        document.cookie = "foo=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "LSKey[lockerTestOtherNamespace]keyChild=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "LSKey[lockerTest]key1=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "LSKey[lockerTest]key2=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    },

    testSecureDocumentCookieFiltersSystemMode: {
        test: function(cmp) {
            $A.test.addCleanup(this.removeCookies);
            document.cookie = "foo=bar";
            cmp.testSecureDocumentCookieFiltersSystemMode(document.cookie);
        }
    },

    testCookiesIsolatedToNamespace: {
        test: function(cmp) {
            $A.test.addCleanup(this.removeCookies);
            cmp.testCookiesIsolatedToNamespace();
        }
    },

    testCookiesAddRemove: {
        test: function(cmp) {
            $A.test.addCleanup(this.removeCookies);
            cmp.testCookiesAddRemove();
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

    testDocumentBodyConstructorNotInvocable: {
        test: function(cmp) {
            cmp.testDocumentBodyConstructorNotInvocable();
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
