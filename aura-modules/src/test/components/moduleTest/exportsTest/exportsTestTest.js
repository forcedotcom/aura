({
    testExecutedGlobalControllerWithCustomException: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                return cmp.helper.exports.executedGlobalControllerWithCustomException().catch(function(err) {
                    $A.test.assertEquals("testCustomMessage", err.message);
                });
            }
        ]
    },
    testExecuteGlobalControllerNoAccessError: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var expected = "woot";
                return cmp.helper.exports.executeTestInternalGlobalController(expected).then(function(actual) {
                    $A.test.assertEquals(expected, actual, "Internal controller response does not match.");
                }).catch(function() {
                    $A.test.fail("Calling internal global controller from executeGlobalController should not fail")
                });
            }
        ]
    }
})
