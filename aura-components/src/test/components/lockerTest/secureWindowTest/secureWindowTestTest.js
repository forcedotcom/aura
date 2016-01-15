({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    test$AExposedOnWindow: {
        test: function(cmp) {
            cmp.getWindow();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureAura", wrapped["$A"].toString(), "Expected window.$A to return SecureAura");
        }
    },

    testDocumentExposedOnWindow: {
        test: function(cmp) {
            cmp.getWindow();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureDocument", wrapped["document"].toString(), "Expected window.document to"
                    + " return SecureDocument");
        }
    },

    testCircularReferenceIsSecureWindow: {
        test: function(cmp) {
            cmp.getWindow();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureWindow", wrapped["window"].toString(), "Expected window.window to"
                    + " return SecureWindoe");
        }
    }
})