({
    setUp: function (cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the test delegates
     * verification to the controller, which operate in user mode.
     */
    testCmpLockerStateNotAffectedByEquivalentModule: {
        test: function (cmp) {
            cmp.testCmpLockerStateNotAffectedByEquivalentModule();
        }
    }
})