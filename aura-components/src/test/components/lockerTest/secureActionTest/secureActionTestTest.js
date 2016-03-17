({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testSecureAction: {
        test: function(cmp) {
            cmp.getSecureAction();
            var secureAction = cmp.get("v.log");
            $A.test.assertStartsWith("SecureAction", secureAction.toString(), "Expected server-side action in the locker" +
                    " to be a SecureAction");
        }
    }
})