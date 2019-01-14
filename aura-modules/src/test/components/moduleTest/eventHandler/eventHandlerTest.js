({
    selector: {
        somethingButton: 'button.something-button',
        changeTrigger: 'button.change-trigger-button',
        valueChangeButton: 'button.value-change-trigger-button'
    },
    testGetParam: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var element = cmp.getElement();
                var button = element.shadowRoot.querySelector(this.selector.somethingButton);

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
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var element = cmp.getElement();
                var button = element.shadowRoot.querySelector(this.selector.changeTrigger);

                button.click();
            },
            function (cmp) {
                var expectedSomethingName = undefined;
                var actualSomethingName = cmp.get('v.somethingName');
                var errorMsg = 'In regular event detail prop isn\'t attach getParam for any key should return undefined';

                $A.test.assertEquals(expectedSomethingName, actualSomethingName, errorMsg);
            }
        ]
    },
    testProgramaticChangeHandler: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function(cmp) {
                var target = cmp.find('targetCmp');
                target.addValueHandler({
                    value: "v.value",
                    event: "change",
                    globalId: cmp.getGlobalId(),
                    method: function(event) {
                        var src = event.getSource();
                        $A.test.assertEquals('new', src.get('v.value'));
                        cmp.set('v.handlerCalled', true);
                    }
                });
            },
            function (cmp) {
                var element = cmp.getElement();
                var button = element.shadowRoot.querySelector(this.selector.valueChangeButton);
                button.click();
            },
            function (cmp) {
                $A.test.assertEquals(true, cmp.get('v.handlerCalled'), 'Handler not called');
                $A.test.assertEquals('new', cmp.get('v.testValue'), 'Value not propagated');
            }
        ]
    }
})
