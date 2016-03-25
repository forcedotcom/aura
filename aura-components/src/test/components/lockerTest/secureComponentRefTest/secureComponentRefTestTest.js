({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testFacetFromAnotherNamespaceIsSecureComponentRef: {
        test: function(cmp) {
            cmp.testFacetFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testUnexposedPlatformAPIs: {
        test: function(cmp) {
            var unexposedPlatformApis = ["addHandler", "destroy", "getSuper", "getElement", "getElements", "getReference",
                                         "clearReference", "getConcreteComponent", "autoDestroy", "isConcrete",
                                         "addValueProvider", "getEvent", "find", "getElements"];
            cmp.testUnexposedPlatformAPIs(unexposedPlatformApis);
        }
    },

    testGetCThrowsError: {
        test: function(cmp) {
            cmp.testGetCThrowsError();
        }
    },

    testGetFacetActionThrowsError: {
        test: function(cmp) {
            cmp.testGetFacetActionThrowsError();
        }
    }
})