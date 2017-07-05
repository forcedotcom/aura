({
    testExecutedGlobalControllerWithCustomException: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var target = cmp.helper.exports.executedGlobalControllerWithCustomException();
                target.catch(function(err) {
                    $A.test.assertEquals("testCustomMessage", err.message);
                });
            }
        ]
    }
})
