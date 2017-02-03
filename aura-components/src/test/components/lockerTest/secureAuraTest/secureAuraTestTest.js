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

    // Many things are not exposed on SecureAura, but this one was specifically called out so writing automation for it
    testStorageServiceNotDefined: {
        test: function(cmp) {
            cmp.testStorageServiceNotDefined();
        }
    },
    
    testPlatformExposedAPIs: {
        test: function(cmp) {
            // Few notes
            // (1) These are only @platform APIs exposed in Aura.js, not everything you can potentially get to from $A
            // (2) @platform APIs not exposed: localizationService, reportError, getToken, set, getReference, run, error (deprecated)
            var exposedAPIs = ["util", "warning", "getCallback", "get", "getRoot", "log", "localizationService"];
            cmp.testPlatformExposedAPIs(exposedAPIs);
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
        test: function(cmp) {
            cmp.testDynamicallyCreatedComponentDifferentNamespaceIsSecureComponentRef();
            $A.test.addWaitFor(true, function() {
                return !!cmp.get("v.testComplete");
            });
        }
    },

    testDynamicallyCreatedComponentSameNamespaceIsSecureComponent: {
        test: function(cmp) {
            cmp.testDynamicallyCreatedComponentSameNamespaceIsSecureComponent();
            $A.test.addWaitFor(true, function() {
                return !!cmp.get("v.testComplete");
            });
        }
    },

    testGetRootReturnsSecureComponent: {
        test: function(cmp) {
            cmp.testGetRootReturnsSecureComponent();
        }
    },

    testGetCallback: {
        test: function(cmp) {
            cmp.testGetCallback();
            $A.test.addWaitFor(true, function() {
                return !!cmp.get("v.testComplete");
            });
        }
    },

    testGetGVP: {
        test: function(cmp) {
            cmp.testGetGVP();
        }
    },
    
    testGetDifferentNamespaceComponentReturnsSecureComponentRef: {
        test: function(cmp) {
            cmp.testGetDifferentNamespaceComponentReturnsSecureComponentRef();
        }
    },
    
    testGetSameNamespaceComponentReturnsSecureComponent: {
        test: function(cmp) {
            cmp.testGetSameNamespaceComponentReturnsSecureComponent();
        }
    },
    
    testUtilExposedOnSecureAura: {
        test: function(cmp) {
            cmp.testUtilExposedOnSecureAura();
        }
    },

    testUtilHasClassAPI: {
        test: function(cmp) {
            cmp.testUtilHasClassAPI();
        }
    },

    testGetReferenceOnDynamicLabel: {
        test: function(cmp) {
            cmp.testGetReferenceOnDynamicLabel();
        }
    }
})