({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // privileged vs. internal namespaces are unreliable when the default adapters and source loaders are not used.
    labels : ["UnAdaptableTest"],

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testPrivilegedComponentIsLockerized: {
        test: function(cmp) {
            cmp.testPrivilegedComponentIsLockerized();
        }
    },

    testCreateComponentWithPRV: {
        test: function(cmp) {
            cmp.testCreateComponentWithPRV();
        }
    },

    testCreateComponentWithNestedPRV: {
        test: function(cmp) {
            cmp.testCreateComponentWithNestedPRV();
        }
    },

    testCreateComponents: {
        test: function(cmp) {
            cmp.testCreateComponents();
        }
    },
})
