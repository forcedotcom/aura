({
    /**
     * Verify that a component, which has a equivalent module that has opted into locker, is not forcefully lockerized
     * @param cmp
     */
    testCmpLockerStateNotAffectedByEquivalentModule: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertTrue(window.toString().indexOf("SecureWindow") === -1, "Expected window to"
            + " return raw window in component");
    }
})