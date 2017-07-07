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

    testFacetFromAnotherNamespaceIsSecureComponentRef: {
        test: function(cmp) {
            cmp.testFacetFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testUnexposedPlatformAPIs: {
        test: function(cmp) {
            var unexposedPlatformApis = ["destroy", "getSuper", "getElement", "getElements", "getReference",
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
    },
    
    testGetComponentEvent: {
        test: function(cmp) {
            cmp.testGetComponentEvent();
        }
    },
    
    testAuraMethod: {
        test: function(cmp) {
            cmp.testAuraMethod();
        }
    },

    testAddHandler: {
        test: function(cmp) {
            cmp.testAddHandler();
        }
    },

    testAddValueHandler: {
        test: function(cmp) {
            cmp.testAddValueHandler();
        }
    },

    testDestroy: {
        test: function(cmp) {
            cmp.testDestroy();
        }
    }
})