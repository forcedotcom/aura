({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testGetEventSourceReturnsSecureComponent: {
        test: function(cmp) {
            cmp.testGetEventSourceReturnsSecureComponent();
        }
    },

    /**
     * Verify getSource returns SecureComponentRef when the event is created in
     * a component under different namespace.
     */
    testGetSourceReturnsSecureComponentRefWhenNoAccess: {
        test:function(cmp) {
            $A.test.clickOrTouch(cmp.find("button").getElement());
        }
    },

    testExerciseEventAPIs: {
        test: function(cmp) {
            cmp.testExerciseEventAPIs();
        }
    }
})
