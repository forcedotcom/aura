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

    testClickEvent: {
        test: function(cmp) {
            cmp.testClickEvent();
        }
    },

    testEventView: {
        test: function(cmp) {
            cmp.testEventView();
        }
    },

    testMarkupDefinedClickHandler: {
        test: function(cmp) {
            cmp.testMarkupDefinedClickHandler();
        }
    }
})