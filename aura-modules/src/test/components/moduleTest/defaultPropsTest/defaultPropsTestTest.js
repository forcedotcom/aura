({
    selector: {
        button : 'button'
    },
    testModuleShouldUseDefaultValueWhenUndefinedIsPassed: {
        test: [
            function (cmp) {
                var element = cmp.getElement();
                var button = element.querySelector(this.selector.button);
                var expected = false;
                var actual = button.disabled;
                var errorMsg = 'The disabled prop value must be the default defined in the module class since the value ' +
                    'passed to the component is undefined.';

                $A.test.assertEquals(expected, actual, errorMsg);
            }
        ]
    }
})
