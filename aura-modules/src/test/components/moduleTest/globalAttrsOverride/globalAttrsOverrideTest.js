({
    browsers: ['GOOGLECHROME'],

    testSetGlobalAttribute: {
        attributes: {
            myTabIndex: '-1',
            myReadOnly: true,
        },
        test: [
            function (cmp) {
                var expected = -1;
                var actual = cmp.getElement().querySelector('#foo').tabIndex;
                var message = '"tabindex" attribute value set on interop component should propagate to LWC component as "tabIndex"';
                $A.test.assertEquals(expected, actual, message);
            },
            function (cmp) {
                var expected = true;
                var actual = cmp.getElement().querySelector('#foo').readOnly;
                var message = '"readonly" attribute value set on interop component should propagate to LWC component as "readOnly"';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    testCanExposeAriaAttributes: {
        attributes: {
            myAriaDescribedBy: 'foo'
        },
        test: [
            function (cmp) {
                var expected = 'foo';
                var actual = cmp.getElement().querySelector('#foo').getAttribute('aria-describedby');
                var message = '"ariaDescribedBy" attribute value set on interop component should propagate to LWC component as "ariaDescribedBy"';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    },

    // Backwards-compatibility for https://git.soma.salesforce.com/aura/lightning-global/blob/fc8a30fd3c0158c6a7acec78610c84f75c29966d/ui-lightning-components/src/main/components/lightning/inputRichText/inputRichText.cmp#L27-L28
    testCanExposeIncorrectlyCasedAriaAttributes: {
        attributes: {
            myAriaLabelledBy: 'foo'
        },
        test: [
            function (cmp) {
                var expected = 'foo';
                var actual = cmp.getElement().querySelector('#foo').getAttribute('aria-labelledby');
                var message = 'Incorrectly cased "ariaLabelledby" ("ariaLabelledBy" is standards-compliant) attribute value set on interop component should propagate to LWC component as "ariaLabelledby"';
                $A.test.assertEquals(expected, actual, message);
            }
        ]
    }
})
