({
    testFoo: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var value = {};
                var notProxy = cmp.find('methodReturnProxy').proxyTest(value);
                $A.test.assertEquals(value, notProxy);
            }
        ]
    }
})
