({
    selector: {
        somethingButton: 'button.something-button',
        changeTrigger: 'button.change-trigger-button'
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
    },
    testGetParamInRegularEvents: {
        browsers : [ 'GOOGLECHROME', 'FIREFOX' ],
        test: [
            function (cmp) {
                var element = cmp.getElement();
                var button = element.querySelector(this.selector.changeTrigger);

                button.click();
            },
            function (cmp) {
                var expectedSomethingName = undefined;
                var actualSomethingName = cmp.get('v.somethingName');
                var errorMsg = 'In regular event detail prop isn\'t attach getParam for any key should return undefined';

                $A.test.assertEquals(expectedSomethingName, actualSomethingName, errorMsg);
            }
        ]
    }
})
