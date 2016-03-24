({
    testSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAction = cmp.get("c.getString");
        testUtils.assertStartsWith("SecureAction", secureAction.toString(), "Expected server-side action in the locker" +
        " to be a SecureAction");
    }
})
