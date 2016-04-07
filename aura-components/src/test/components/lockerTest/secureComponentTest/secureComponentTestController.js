({
    testBlockedAPI: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertUndefined(cmp.removeDocumentLevelHandler, "An unexposed API (removeDocumentLevelHandler)"
                + " is exposed on SecureComponent");
    },

    testFindReturnsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var cmpViaFind = cmp.find("innerCmp");
        testUtils.assertStartsWith("SecureComponent", cmpViaFind.toString(), "Expected component found via find()"
                + " to be a SecureComponent");
    },

    testGetElementReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureElement = cmp.getElement();
        testUtils.assertStartsWith("SecureElement", secureElement.toString(), "Expected return of cmp.getElement()"
                + " to be a SecureElement");
    },

    testGetEventReturnsSecureEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureEvent = cmp.getEvent("press");
        testUtils.assertStartsWith("SecureAuraEvent", secureEvent.toString(), "Expected return of cmp.event()"
                + " to be a SecureAuraEvent");
    },

    testGetCThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        try {
            cmp.get("c");
            testUtils.fail("Expected error when executing SecureComponent.get('c')");
        } catch (e) {
            testUtils.assertEquals("Invalid key c", e.message);
        }
    },

    testAddValueProviderExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var vp = {
            get: function(key, comp) {
                testUtils.assertStartsWith("SecureComponent", comp.toString(), "Component passed to value provider should be SecureComponent");
            }
        }
        cmp.addValueProvider('foo', vp); 
        cmp.get('foo.x');
    }
})