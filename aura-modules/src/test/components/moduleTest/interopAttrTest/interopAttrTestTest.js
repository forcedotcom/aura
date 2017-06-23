({
	selector: {
        literal : '.m-literal span'
    },
    testFalsy: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var expected = 'false';
                var element = cmp.getElement().querySelector(this.selector.literal);
                return new Promise(function(resolve, reject) {
                    var actual = element.textContent;
                	$A.test.assertEquals(actual, expected, 'Wrong literal');
                    resolve();
                });
            }
        ]
    }
})