({
    selector: {
        somethingButton: 'button.something-button'
    },
    testGetParam: {
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test: [
            function (cmp) {
                var element = cmp.getElement();
                var button = element.querySelector(this.selector.somethingButton);

                button.click();
            },
            function (cmp) {
                var expectedSomethingName = 'salesforce.com';
                var actualSomethingName = cmp.get('v.somethingName');
                var errorMsg = 'Data within event.detail must be accessible via getParam';
                
                $A.test.assertEquals(expectedSomethingName, actualSomethingName, errorMsg);
            }
        ]
    }
})
