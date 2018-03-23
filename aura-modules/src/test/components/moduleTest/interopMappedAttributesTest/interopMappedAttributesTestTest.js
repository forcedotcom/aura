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
                $A.test.assertEquals('format-changed-value', interopCmp.get('v.style'), 'it should change the style value from inside LWC component');
                $A.test.assertEquals('msg-changed-value', interopCmp.get('v.message'), 'it should change the message value from inside LWC component');
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
                var createdCmp;
                $A.createComponent("moduleTest:mappedAttrTests", { format: 'some-value', message: 'some-message' }, function(newCmp) {
                    createdCmp = newCmp;
                });
                $A.test.addWaitFor(true, function() { return createdCmp !== undefined; }, function() {
                    $A.test.assertEquals("some-message", createdCmp.attributes.message, "Did not set mapped attribute via $A.createComponent");
                    $A.test.assertUndefined(createdCmp.attributes.format, 
                            "Should not be able to set pre-mapped attribute (attempting to set format, which has been mapped to 'style')");
                });
            }
        ]
    },
})