({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    // Many things are not exposed on SecureAura, but this one was specifically called out so writing automation for it
    testStorageServiceNotDefined: {
        test: function(cmp) {
            cmp.getSecureAura();
            var secureAura = cmp.get("v.log");
            $A.test.assertUndefined(secureAura.storageService);
        }
    },
    
    testPlatformExposedAPIs: {
        test: function(cmp) {
            // Few notes
            // (1) These are only @platform APIs exposed in Aura.js, not everything you can potentially get to from $A
            // (2) @platform APIs not exposed: localizationService, reportError, getToken, set, getReference, run, error (deprecated)
            var exposedAPIs = ["util", "warning", "getCallback", "get", "getRoot", "log"];
            cmp.getSecureAura();
            var secureAura = cmp.get("v.log");

            for (var i = 0; i < exposedAPIs.length; i++) {
                var api = exposedAPIs[i];
                $A.test.assertDefined(secureAura[api], "Expected " + api + " to be exposed on SecureAura");
            }
        }
    },

    /**
     * Dynamically creating a component in a different namespace will result in a SecureComponentRef. The
     * component has access to the newly created cmp, but more restricted than if when operating all within the same
     * namespace.
     * 
     * This also exercises $A.createComponents (plural) to create a set of components rather than a single one.
     */
    // TODO(W-2973793): $A.createComponent should return created component in the callback as SecureComponent(Ref) instead of the raw Component
    _testDynamicallyCreatedComponentDifferentNamespaceIsSecureComponentRef: {
        test: [function(cmp) {
            cmp.dynamicallyCreateCmpsDifferentNamespace();
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.dynamicCmps") && cmp.get("v.dynamicCmps").length > 0;
            });
        }, function(cmp) {
            cmp.getSecureComponent();
            var secureComponenet = cmp.get("v.log");
            var dynamicCmps = secureComponenet.get("v.dynamicCmps");
            dynamicCmps.forEach(function(component) {
                $A.test.assertStartsWith("SecureComponentRef", component.toString(), "Expected dynamic component to be"
                        + " a SecureComponentRef");
            });
        }]
    },

    // TODO(W-2973793): $A.createComponent should return created component in the callback as SecureComponent(Ref) instead of the raw Component
    _testDynamicallyCreatedComponentSameNamespaceIsSecureComponent: {
        test: [function(cmp) {
            cmp.dynamicallyCreateCmpSameNamespace();
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.dynamicCmps") && cmp.get("v.dynamicCmps").length > 0;
            });
        }, function(cmp) {
            cmp.getSecureComponent();
            var secureComponenet = cmp.get("v.log");
            var dynamicCmps = secureComponenet.get("v.dynamicCmps");
            dynamicCmps.forEach(function(component) {
                $A.test.assertStartsWith("SecureComponent", component.toString(), "Expected dynamic component to be"
                        + " a SecureComponent");
            });
        }]
    },

    testGetRootReturnsSecureComponent: {
        test: function(cmp) {
            cmp.getSecureAura();
            var secureAura = cmp.get("v.log");
            $A.test.assertStartsWith("SecureComponent", secureAura.getRoot().toString(), "Expected $A.getRoot() to return"
                    + " a SecureComponent");
        }
    },
    
    // TODO(W-2974238): issues with $A.enqueueAction
    _testEnqueueAction: {
        test: function(cmp) {
            cmp.callEnqueueAction();
        }
    },

    testGetCallback: {
        test: function(cmp) {
            cmp.callGetCallback();
            $A.test.addWaitFor(true, function() {
                return !!cmp.get("v.log");
            }, function() {
                // log returns [this, window, document] from $A.getCallback call
                var log = cmp.get("v.log");
                $A.test.assertStartsWith("SecureWindow", log[0].toString(), "Expected SecureWindow as context to $A.getCallback");
                $A.test.assertStartsWith("SecureWindow", log[1].toString(), "Expected SecureWindow for window in $A.getCallback");
                $A.test.assertStartsWith("SecureDocument", log[2].toString(), "Expected SecureDocument as document in $A.getCallback");
            });
        }
    },

    testGetGVP: {
        test: function(cmp) {
            cmp.getGVP();
            var browserGvp = cmp.get("v.log");
            // check that a couple things on $Browser are there to verify it's the correct object
            $A.test.assertDefined(browserGvp["formFactor"]);
            $A.test.assertDefined(browserGvp["isPhone"]);
        }
    },
    
    testGetDifferentNamespaceComponentReturnsSecureComponentRef: {
        test: function(cmp) {
            cmp.callGetComponentDifferentNamespace();
            var component = cmp.get("v.log");
            $A.test.assertStartsWith("SecureComponentRef", component.toString(), "Expected $A.getComponent on a component"
                    + " from another namespace to be a SecureComponentRef");
        }
    },
    
    testGetSameNamespaceComponentReturnsSecureComponent: {
        test: function(cmp) {
            cmp.callGetComponentSameNamespace();
            var component = cmp.get("v.log");
            $A.test.assertStartsWith("SecureComponent", component.toString(), "Expected $A.getComponent on a component"
                    + " from the same namespace to be a SecureComponent");
        }
    }
})