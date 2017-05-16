({
    browsers: ['GOOGLECHROME'],
    testGlobalAttrInCustomELement: {
        attributes: {
            'title': 'my-title',
            'accesskey': 'Z',
            'tabindex': 2,
            'bgcolor': 'blue',
            'colspan': 1,
            'rowspan': 1,
            'contentEditable': false,
            'datetime': '2020-01-04',
            'formaction': 'some-action',
            'ismap': false,
            'maxlength': 20,
            'usemap': false,
            'class': 'my-class',
            'for': 'some-id',
            'role': 'some-role'
        },
        test: [
            function (cmp) {
                var customEl = this.getCustomElement(cmp);
                var expectedClass = 'my-class';
                var expectedTitle = 'my-title';
                var expectedAccesskey = 'Z';
                var expectedTabindex = 2;
                var expectedBgcolor= 'blue';
                var expectedColspan = 1;
                var expectedRowspan = 1;
                var expectedContentEditable = false;
                var expectedDatetime = '2020-01-04';
                var expectedFormaction = 'some-action';
                var expectedIsmap = false;
                var expectedMaxlength = 20;
                var expectedUsemap = false;
                var expectedFor = 'some-id';
                var expectedRole = 'some-role';

                $A.test.assertTrue(customEl.classList.contains(expectedClass), 'The class attribute is not being set in the custom element');
                $A.test.assertEquals(expectedTitle, customEl.title, 'The title attribute is not being set in the custom element');
                $A.test.assertEquals(expectedAccesskey, customEl.accessKey, 'The accesskey attribute is not being set in the custom element');
                $A.test.assertEquals(expectedTabindex, customEl.tabIndex, 'The tabindex attribute is not being set in the custom element');
                $A.test.assertEquals(expectedBgcolor, customEl.bgColor, 'The bgcolor attribute is not being set in the custom element');
                $A.test.assertEquals(expectedColspan, customEl.colSpan, 'The colspan attribute is not being set in the custom element');
                $A.test.assertEquals(expectedRowspan, customEl.rowSpan, 'The rowspan attribute is not being set in the custom element');
            },
            function (cmp) {
                cmp.set('v.class', 'new-custom-class');
                cmp.set('v.title', 'new-title');
            },
            function (cmp) {
                var customEl = this.getCustomElement(cmp);
                var expectedClass = 'new-custom-class';
                var expectedTitle = 'new-title';

                $A.test.assertTrue(customEl.classList.contains(expectedClass));
                $A.test.assertEquals(expectedTitle, customEl.title);
            },
        ]
    },
    testSetGlobalAttrDirectly: {
        attributes: {
            'class': 'my-custom-class'
        },
        test: [
            function (cmp) {
                var raptorCmp = cmp.find('raptor');
                raptorCmp.set('v.class', 'new-custom-class')
            },
            function (cmp) {
                var customEl = this.getCustomElement(cmp);
                var expectedClass = 'new-custom-class';

                $A.test.assertTrue(customEl.classList.contains(expectedClass));
            }
        ]
    },
    getCustomElement: function (cmp) {
        return cmp.getElement();
    }
})