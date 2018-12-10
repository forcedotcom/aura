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
    }
})
