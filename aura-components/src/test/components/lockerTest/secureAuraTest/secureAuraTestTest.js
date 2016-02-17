({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    // TODO(tbliss): WIP - not much exposed on SecureAura yet
    testGetComponentReturnsSecureComponent: {
        test: function(cmp) {
            cmp.getComponent();
            var wrapped = cmp.get("v.log");
            
        }
    }
})