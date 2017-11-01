({
    testInteropLifeCycle: {
        browsers: ['GOOGLECHROME'],
        test: [
            function (cmp) {
                var expected = [
                    'component render',
                    'interop afterRender',
                    'module connected',
                    'module rendered',
                    'component afterRender'
                ].join('\n');
                $A.test.assertEquals(expected, cmp.get('v.lifeCycleLog').join('\n'));
            }
        ]
    }
})