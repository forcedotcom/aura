({
    /*
     * Verify super component doesn't contain helper methods of its
     * extending components.
     * getMessage() exists in component componentTest:helper
     * which extends this component.
     */
    testSuperComponentNotAccessibleToSubComponentHelper: {
        test: function(cmp) {
            $A.test.assertUndefined(cmp.helper.getMessage);
        }
    }
})
