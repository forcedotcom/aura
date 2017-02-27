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
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
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
        // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],
        test: function(cmp) {
            //Taking into account if its a manual run (which runs inside an iframe) or an auto run
            cmp.testEvalBlocking(window !== window.parent);

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
        browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPAD", "-IPHONE"],
        test: function(cmp) {
            cmp.testInstanceOf(window);
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
            		enumerable: true,
            		value: "somePropertyValue",
            	},

            	nonEnumerableProperty: {
            		configurable: true,
            		value: "nonEnumerablePropertyValue",
            	},
            	
            	foo: {
            		enumerable: true,
            		value: function() {
            			return "fooValue";
            		}
            	}
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
