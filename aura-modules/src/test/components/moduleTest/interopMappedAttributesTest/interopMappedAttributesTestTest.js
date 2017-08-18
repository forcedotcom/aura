({
    selector: {
        format : '#format',
        message : '#message',
        changeValuesBtn: '#change-values'
    },
    assertDisplayedValue: function (cmp, selector, expected, msg) {
        var element = cmp.find('simple').getElement().querySelector(selector);
        var actual = element.innerText;
        $A.test.assertEquals(expected, actual, msg);
    },
    testCanSetMappedAttributes: {
        browsers : [ 'GOOGLECHROME' ],
        attributes: {
            style: 'valid-test-style',
            message: 'valid-test-message',
        },
        test: [
            function (cmp) {
                this.assertDisplayedValue(cmp, this.selector.format, 'valid-test-style', 'Invalid style value rendered');
                this.assertDisplayedValue(cmp, this.selector.message, 'valid-test-message', 'Invalid message value rendered');

                cmp.set('v.style', 'valid-modified-style');
                cmp.set('v.message', 'valid-modified-message');
            },
            function (cmp) {
                this.assertDisplayedValue(cmp, this.selector.format, 'valid-modified-style', 'Invalid style value rendered when modified');
                this.assertDisplayedValue(cmp, this.selector.message, 'valid-modified-message', 'Invalid message value rendered when modified');
            },
        ]
    },
    testCanGetMappedAttributes: {
        browsers : [ 'GOOGLECHROME' ],
        attributes: {
            style: 'valid-test-style',
            message: 'valid-test-message',
        },
        test: [
            function (cmp) {
                var interopCmp = cmp.find('simple')
                $A.test.assertEquals('valid-test-style', interopCmp.get('v.style'), 'It should be able to get the value');
                $A.test.assertEquals('valid-test-message', interopCmp.get('v.message'), 'It should be able to get the value');
                $A.test.assertEquals(undefined, interopCmp.get('v.format'), 'It should not be able to get the value of the mapped property');
                $A.test.assertEquals(undefined, interopCmp.get('v.msg'), 'It should not be able to get the value of the mapped property');
            },
        ]
    },
    testBidirectionalChanges: {
        browsers : [ 'GOOGLECHROME' ],
        attributes: {
            style: 'valid-test-style',
            message: 'valid-test-message',
        },
        test: [
            function (cmp) {
                var changeValuesBtn = cmp.find('simple').getElement().querySelector(this.selector.changeValuesBtn);
                changeValuesBtn.click();
            },
            function (cmp) {
                var interopCmp = cmp.find('simple')
                $A.test.assertEquals('format-changed-value', interopCmp.get('v.style'), 'it should change the style value from inside raptor component');
                $A.test.assertEquals('msg-changed-value', interopCmp.get('v.message'), 'it should change the message value from inside raptor component');
            }
        ]
    },
    testCantSetMapTargetAttributes: {
        browsers : [ 'GOOGLECHROME' ],
        attributes: {
            message: 'valid-test-message',
        },
        test: [
            function (cmp) {
                var hasError = false;
                try {
                    $A.createComponent("moduleTest:mappedAttrTests", { format: 'some-value' }, function(newButton, status, errorMessage) {});
                } catch (e) {
                    hasError = true;
                }

                $A.test.assertEquals(true, hasError, 'it should not be able to set an invalid attribute (format, the valid its style)');
            }
        ]
    },
})