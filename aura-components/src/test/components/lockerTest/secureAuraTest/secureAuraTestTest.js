({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    // TODO(tbliss): WIP - not much exposed on SecureAura yet
    testGetComponentReturnsSecureComponent: {
        test: function(cmp) {
            cmp.getSecureAura();
            var wrapped = cmp.get("v.log");
            
        }
    },

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
            // (2) "error" is deprecated so may need to be removed from this list
            // (3) @platform APIs not exposed: localizationService, reportError, getToken, set, getReference, run
            var exposedAPIs = ["util", "error", "warning", "getCallback", "get", "getRoot", "log"];
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
    testDynamicallyCreatedComponentDifferentNamespaceIsSecureComponentRef: {
        test: [function(cmp) {
            cmp.dynamicallyCreateCmpsDifferentNamespace();
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.dynamicCmps") && cmp.get("v.dynamicCmps").length > 0;
            });
        }, function(cmp) {
            cmp.getSecureComponent();
            var secureAura = cmp.get("v.log");
            var dynamicCmps = secureAura.get("v.dynamicCmps");
            dynamicCmps.forEach(function(component) {
                $A.test.assertStartsWith("SecureComponentRef", component.toString(), "Expected dynamic component to be"
                        + " a SecureComponentRef");
            });
        }]
    },
    
    testDynamicallyCreatedComponentSameNamespaceIsSecureComponent: {
        test: [function(cmp) {
            cmp.dynamicallyCreateCmpSameNamespace();
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.dynamicCmps") && cmp.get("v.dynamicCmps").length > 0;
            });
        }, function(cmp) {
            cmp.getSecureComponent();
            var secureAura = cmp.get("v.log");
            var dynamicCmps = secureAura.get("v.dynamicCmps");
            debugger;
            dynamicCmps.forEach(function(component) {
                $A.test.assertStartsWith("SecureComponent", component.toString(), "Expected dynamic component to be"
                        + " a SecureComponent");
            });
        }]
    }
})