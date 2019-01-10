({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    testCustomEventAuraAfterRender: {
        test: function(cmp) {
            var target = cmp.get("v.auraEventTarget");
            $A.test.assertStartsWith("SecureElement: [object HTMLDivElement]", target, "Expected event target to be defined");
        }
    },

    testCustomEventLWCAfterRender: {
        test: function(cmp) {
            var target = cmp.get("v.lwcEventTarget");
            $A.test.assertStartsWith("SecureElement: [object HTMLDivElement]", target, "Expected event target to be defined");
        }
    }
})