({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */


    testBlockedAPI: {
        test: function(cmp) {
            cmp.getWrapperFromController();
            var wrapped = cmp.get("v.log");
            $A.test.assertUndefined(wrapped.removeDocumentLevelHandler, "An unexposed API (removeDocumentLevelHandler)"
                    + " is exposed on SecureComponent");
        }
    },

    testFindReturnsSecureComponent: {
        test: function(cmp) {
            cmp.getWrapperFromController();
            var wrapped = cmp.get("v.log");
            var cmpViaFind = wrapped.find("innerCmp");
            $A.test.assertStartsWith("SecureComponent", cmpViaFind.toString(), "Expected component found via find()"
                    + " to be a SecureComponent");
        }
    },

    testGetElementReturnsSecureElement: {
        test: function(cmp) {
            cmp.getElementTest();
            var element = cmp.get("v.log");
            $A.test.assertStartsWith("SecureElement", element.toString(), "Expected return of cmp.getElement()"
                    + " to be a SecureElement");
        }
    },

    testGetEventReturnsSecureEvent: {
        test: function(cmp) {
            cmp.getEventTest();
            var event = cmp.get("v.log");
            $A.test.assertStartsWith("SecureAuraEvent", event.toString(), "Expected return of cmp.event()"
                    + " to be a SecureAuraEvent");
        }
    },

    // TODO: re-enable when $A.createComponents is exposed on SecureAura
    _testDynamicallyCreatedComponentIsSecureComponent: {
        test: [function(cmp) {
            cmp.dynamicallyCreateCmps();
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.dynamicCmps").length > 0;
            });
        }, function(cmp) {
            cmp.getWrapperFromController();
            var wrapped = cmp.get("v.log");
            var dynamicCmps = wrapped.get("v.dynamicCmps");
            dynamicCmps.forEach(function(component) {
                $A.test.assertStartsWith("SecureComponent", component.toString(), "Expected dynamic component to be"
                        + " a SecureComponent");
            });
        }]
    }
})