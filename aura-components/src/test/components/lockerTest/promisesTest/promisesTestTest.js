({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE & Promise is not supported in IE 11 and below
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testBasicPromiseResolve: {
        test: function(cmp) {
            cmp.verifyPromiseResolve();
        }
    },

    testBasicPromiseReject: {
        test: function(cmp) {
            cmp.verifyPromiseReject();
        }
    },

    /**
     * Automation for customer case described here
     * http://salesforce.stackexchange.com/questions/148478/promise-returns-a-locked-object-inside-lightning-component-when-locker-service-i
     */
    testNestedPromiseWithAuraCallBacks: {
        test: function(cmp) {
            cmp.verifyNestedPromiseWithAuraCallBacks();
        }
    }
})