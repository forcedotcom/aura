({
    testBidirectionalBindingPrimitives: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                return new Promise(function(resolve, reject) {
                    $A.test.assertTrue(cmp.get('v.primitiveChanged'));
                    resolve();
                });
            }
        ]
    }
})