({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    testPropertiesNotExposedDefault: {
        test: function(cmp) {
            ["aura", "ui", "c"].forEach(function(namespace){
                var key = $A.lockerService.getKeyForNamespace(namespace);
                var win = $A.lockerService.getEnv(key);
                var nav = win.navigator;

                ["RTCPeerConnection', 'webkitRTCPeerConnection", "MediaStream"].forEach(function(name) {
                    $A.test.assertFalse(name in win, "Expected SecureWindow." + name + " to not be exposed as a property");
                });

                ['mediaDevices', 'mozGetUserMedia', 'webkitGetUserMedia'].forEach(name => {
                    $A.test.assertFalse(name in nav, "Expected SecureNavigator." + name + " to not be exposed as a property");
                });
            });
        }
    },

    testPropertiesExposedSpecialNamespace: {
        test: function(cmp) {
            ["runtime_rtc_spark", "runtime_rtc"].forEach(function(namespace){
                var key = $A.lockerService.getKeyForNamespace(namespace);
                var win = $A.lockerService.getEnv(key);
                var nav = win.navigator;

                ["RTCPeerConnection', 'webkitRTCPeerConnection", "MediaStream"].forEach(function(name) {
                    if (name in window) {
                        var prop = Object.getOwnPropertyDescriptor(win, name);
                        $A.test.assertNotUndefinedOrNull(prop, "Expected SecureWindow." + name + " to be exposed as a property");
                        $A.test.assertTrue(prop.enumerable, "Expected SecureWindow." + name + " to be exposed as an enumerable property");
                    } else {
                        $A.test.assertFalse(name in win, "Expected SecureWindow." + name + " to not be exposed as a property");
                    }
                });

                ['mediaDevices', 'mozGetUserMedia', 'webkitGetUserMedia'].forEach(name => {
                    if (name in navigator) {
                        var prop = Object.getOwnPropertyDescriptor(nav, name);
                        $A.test.assertNotUndefinedOrNull(prop, "Expected SecureNavigator." + name + " to be exposed as a property");
                        $A.test.assertTrue(prop.enumerable, "Expected SecureNavigator." + name + " to be exposed as an enumerable property");
                    } else {
                        $A.test.assertFalse(name in nav, "Expected SecureNavigator." + name + " to not be exposed as a property");
                    }
                });
            });
        }
    },
})