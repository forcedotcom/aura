({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741): FF version in autobuilds is too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function (cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testNonLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef: {
        test: function (cmp) {
            cmp.testNonLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testNonLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef: {
        test: function (cmp) {
            cmp.testNonLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef: {
        test: function (cmp) {
            cmp.testLockerizedModuleLibFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef: {
        test: function (cmp) {
            cmp.testLockerizedModuleComponentFromAnotherNamespaceIsSecureComponentRef();
        }
    },

    testLockerizedModuleLibFromSameNamespaceIsSecureComponent: {
        test: function (cmp) {
            cmp.testLockerizedModuleLibFromSameNamespaceIsSecureComponent();
        }
    },

    testLockerizedModuleComponentFromSameNamespaceIsSecureComponent: {
        test: function (cmp) {
            cmp.testLockerizedModuleComponentFromSameNamespaceIsSecureComponent();
        }
    },

    testPublicMethodsOnSecureComponentRef: {
        test: function (cmp) {
            cmp.testPublicMethodsOnSecureComponentRef();
        }
    },

    testPublicMethodsOnSecureComponent: {
        test: function (cmp) {
            cmp.testPublicMethodsOnSecureComponent();
        }
    }
})
