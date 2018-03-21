({
    /**
     * Note that this test file operates in system mode so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // TODO(W-3674741, W-4446969): FF version in autobuilds is too far behind, and LockerService disabled for iOS browser in 212
    browsers: ["GOOGLECHROME", "-SAFARI", "-IPHONE", "-IPAD"],

    testProxyIsNative: {
        test: function(cmp) {
            cmp.testProxyIsNative();
        }
    },
    testSymbolIsNative: {
        test: function(cmp) {
            cmp.testSymbolIsNative();
        }
    },
    testIntrinsicsAreFrozen: {
        test: function(cmp) {
            cmp.testIntrinsicsAreFrozen();
        }
    }
})
