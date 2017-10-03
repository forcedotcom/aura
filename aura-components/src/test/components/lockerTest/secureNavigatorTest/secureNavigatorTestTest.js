({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741): FF version in autobuilds is too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testPropertiesExposed: {
        test: function(cmp) {
            cmp.testPropertiesExposed();
        }
    },
    
    testLanguage: {
        test: function(cmp) {
            cmp.testLanguage();
        }
    },

    /**
     * navigator.mediaDevices is enabled only for 2 specific namespaces in SecureObject.addRTCMediaApis
     */
    testMediaDevicesBlocked: {
        test: function(cmp) {
            cmp.testMediaDevicesBlocked();
        }
    }
})