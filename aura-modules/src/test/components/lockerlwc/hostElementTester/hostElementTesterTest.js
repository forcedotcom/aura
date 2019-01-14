({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testInternalFieldsOnHostElement: {
        test: function(cmp) {
            cmp.find('lwcChild').testInternalFieldsOnHostElement();
        }
    }
})