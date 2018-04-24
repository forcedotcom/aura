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

    testCanAccessDocumentBodyFromHelper: {
        test: function(cmp) {
            cmp.helper.testCanAccessDocumentBodyFromHelper($A.test);
        }
    },

    testCanAccessDocumentHeadFromHelper: {
        test: function(cmp) {
            cmp.helper.testCanAccessDocumentHeadFromHelper($A.test);
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
        // This exploit not covered in IE11
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],
        // Remove UnAdaptableTest label when unsafe-eval and unsafe-inline are added back to CSP
        labels: ["UnAdaptableTest"],
        test: function(cmp) {
            cmp.testDefineGetterExploit();
        }
    },

    /**
     * See W-2974202 for original exploit.
     */
    testSetTimeoutNonFunctionParamExploit: {
        test: function(cmp) {
            cmp.testSetTimeoutNonFunctionParamExploit();
        }
    },

    testComponentUnfilteredFromUserToSystemMode: {
        test: function(cmp) {
            cmp.testComponentUnfilteredFromUserToSystemMode();
            var component = cmp.get("v.componentStore");
            // Component should be unfiltered when returned to system mode
            $A.test.assertStartsWith("markup://lockerTest:facet", component.toString());
        }
    },

    testLocationExposed: {
        test: function(cmp) {
            cmp.testLocationExposed();
        }
    },

    testAttemptToEvalToWindow: {
        // This exploit not covered in IE11
        test: function(cmp) {
            cmp.testAttemptToEvalToWindow(window !== window.parent);

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
    },

    testValueProviderOnDynamicallyCreatedComponents: {
        test: function(cmp) {
            cmp.testValueProviderOnDynamicallyCreatedComponents();
        }
    },

    testThisVariableNotLeakedFromMarkup: {
        test: function(cmp) {
            cmp.testThisVariableNotLeakedFromMarkup();
        }
    },

    testCtorAnnotation: {
        test: function(cmp) {
            cmp.testCtorAnnotation();
        }
    },

    testUpdateElementDoesNotReturnCachedItem: {
        test: function(cmp) {
            cmp.testUpdateElementDoesNotReturnCachedItem();
        }
    },

    testAddExpandoToCachedItem: {
        test: function(cmp) {
            cmp.testAddExpandoToCachedItem();
        }
    },

    testSecureElementPrototypeCounterMeasures: {
        test: function(cmp) {
            cmp.testSecureElementPrototypeCounterMeasures();
        }
    },

    testLockerDisabledForUnsupportedBrowser: {
        // only run in unsupported browsers where we fallback to non-Locker mode
        browsers: ["IE8", "IE9", "IE10", "IE11"],
        test: function(cmp) {
            cmp.testLockerDisabledForUnsupportedBrowser();
        }
    },

    testComponentPassedToOtherNamespaceViaCreateComponent: {
        test: function(cmp) {
            cmp.testComponentPassedToOtherNamespaceViaCreateComponent();
        }
    },

    testInstanceOf: {
        // TODO: Re-enable for Firefox and iOS when autobuilds use a version that supports all Proxy traps we implement
        test: function(cmp) {
            cmp.testInstanceOf(window);
        }
    },

    testInstanceOf_IdentityDiscontinuitySymptoms: {
        // TODO: Re-enable for Firefox and iOS when autobuilds use a version that supports all Proxy traps we implement
        // TODO: Re-enable when strict CSP is on by default in core autobuilds
        labels: ["UnAdaptableTest"],
        test: function(cmp) {
            cmp.testInstanceOf_IdentityDiscontinuitySymptoms(window);
        }
    },

    testFilteringProxy: {
        test: function(cmp) {
            function TestPrototype() {
            	return this;
            };

            var o = Object.create(TestPrototype.prototype, {
            	someProperty: {
            		configurable: true,
                // writable: false (default)
            		enumerable: true,
            		value: "somePropertyValue",
            	},

            	nonEnumerableProperty: {
            		configurable: true,
                // writable: false (default)
            		value: "nonEnumerablePropertyValue",
            	},

            	foo: {
                // configurable: false (default)
                // writable: false (default)
            		enumerable: true,
            		value: function() {
            			return "fooValue";
            		}
            	},

              configurableProperty: {
                configurable: true,
                // writable: false (default)
                value: "configurableProperty",
              },

              writableProperty: {
                // configurable: false (default)
                writable: true,
                value: "writablePropertyValue",
              },

              configurableWritableProperty: {
                configurable: true,
                writable: true,
                value: "configurableWritablePropertyValue",
              },
            });

            var otherNamespace = cmp.find("otherNamespace");
            otherNamespace.set("v.obj", o);
            otherNamespace.setupTestFilteringProxy();

            helper = cmp.getDef().getHelper();
            helper._o = o;
            helper._TestPrototype = TestPrototype;
            helper._po = otherNamespace.getDef().getHelper()._po;

            cmp.testFilteringProxy();
        }
    }
})
