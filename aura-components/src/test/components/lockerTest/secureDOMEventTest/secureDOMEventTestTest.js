({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

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

    testInitEvent: {
        browsers: ["-IE8", "-IE9", "-IE10"],
        test: function(cmp) {
            cmp.testInitEvent();
        }
    },

    testEventTargetOfHtmlElementHandler: {
        test: function(cmp) {
            cmp.testEventTargetOfHtmlElementHandler();
        }
    }
})