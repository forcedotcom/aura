({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testCannotAccessDocumentBodyFromHelper: {
        test: function(cmp) {
            cmp.helper.testCannotAccessDocumentBodyFromHelper($A.test);
        }
    },

    testAlertExposed: {
        test: function(cmp) {
            cmp.testAlertExposed();
        }
    },

    testAuraLockerInController: {
        test: function(cmp) {
            cmp.testAuraLockerInController();
        }
    },

    testAuraLockerInHelper: {
        test: function(cmp) {
            cmp.helper.testAuraLockerInHelper($A.test);
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

    testComponentLockerInController: {
        test: function(cmp) {
            cmp.testComponentLockerInController();
        }
    },

    testDocumentLockerInController: {
        test: function(cmp) {
            cmp.testDocumentLockerInController();
        }
    },

    testDocumentLockerInHelper: {
        test: function(cmp) {
            cmp.helper.testDocumentLockerInHelper($A.test);
        }
    },

    testWindowLockerInController: {
        test: function(cmp) {
            cmp.testWindowLockerInController();
        }
    },

    testWindowLockerInHelper: {
        test: function(cmp) {
            cmp.helper.testWindowLockerInHelper($A.test);
        }
    },

    testSecureElementFrozenAfterCreation_DynamicallyCreated: {
        test: function(cmp) {
            cmp.testSecureElementFrozenAfterCreation_DynamicallyCreated();
        }
    },

    testSecureElementFrozenAfterCreation_FromMarkup: {
        test: function(cmp) {
            cmp.testSecureElementFrozenAfterCreation_FromMarkup();
        }
    },

    testAppendDynamicallyCreatedDivToMarkup: {
        test: function(cmp) {
            cmp.testAppendDynamicallyCreatedDivToMarkup();
        }
    },

    testContextOfController: {
        test: function(cmp) {
            cmp.testContextOfController();
        }
    },

    testDefineGetterExploit: {
        test: function(cmp) {
            cmp.testDefineGetterExploit();
        }
    },

    testAttemptToEvalToWindow: {
        test: function(cmp) {
        	cmp.testEvalBlocking();

        	// DCHASMAN TOOD Port these to cmp.testEvalBlocking()

            // eval attempts that result in an error
            /*try {
                var symbol = "toString.constructor.prototype";
                cmp.testSymbol(symbol);
                $A.test.fail("eval'ing [" + symbol + "] should throw an error");
            } catch(e) {
                var error = e.toString();
                $A.test.assertStartsWith("TypeError: Cannot read property 'constructor' of undefined", error);
            }

            try {
                var symbol = "''.substring.call.call(({})[\"constructor\"].getOwnPropertyDescriptor(''.substring.__pro"
                    + "to__, \"constructor\").value, null, \"return this;\")()"
                cmp.testSymbol(symbol);
                $A.test.fail("eval'ing [" + symbol + "] should throw an error");
            } catch(e) {
                var error = e.toString();
                $A.test.assertStartsWith("Error: Security violation: use of __proto__", error);
            }*/
        }
    }
})
