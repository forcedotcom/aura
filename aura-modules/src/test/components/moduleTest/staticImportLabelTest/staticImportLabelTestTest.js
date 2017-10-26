({
    testStaticImportLabel: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var schemaCmp = cmp.find("schema-label");
                var expected = cmp.get('v.todayLabel');
                var actual = schemaCmp.getTodayLabel();
                $A.test.assertEquals(actual, expected, 'Unable to statically import the label');
                
            }
        ]
    },
    testStaticImportAnalysisModule: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var schemaCmp = cmp.find("schema-label");
                var actual = schemaCmp.getTomorrowLabel();

                return new Promise(function (resolve, reject) {
                    $A.get('$Label.Related_Lists.task_mode_tomorrow', function (expected) {
                        $A.test.assertEquals(expected, actual , 'Unable to statically analyze label from module');
                        resolve();
                    });
                });
            }
        ]
    }
})