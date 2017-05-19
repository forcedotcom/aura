({
    browsers: ['GOOGLECHROME'],
    testGlobalAttrInCustomELement: {
        attributes: {
            'title': 'my-title',
            'accesskey': 'Z',
            'tabindex': 2,
            'contentEditable': false,
            'class': 'my-class',
            'role': 'navigation'
        },
        test: [
            function (cmp) {
                var customEl = this.getCustomElement(cmp);
                var expectedClass = 'my-class';
                var expectedTitle = 'my-title';
                var expectedAccesskey = 'Z';
                var expectedTabindex = 2;
                var expectedRole = 'navigation';

                $A.test.assertTrue(customEl.classList.contains(expectedClass), 'The class attribute is not being set in the custom element');
                $A.test.assertEquals(expectedTitle, customEl.title, 'The title attribute is not being set in the custom element');
                $A.test.assertEquals(expectedAccesskey, customEl.accessKey, 'The accesskey attribute is not being set in the custom element');
                $A.test.assertEquals(expectedTabindex, customEl.tabIndex, 'The tabindex attribute is not being set in the custom element');
                $A.test.assertEquals(expectedRole, customEl.getAttribute('role'), 'The role attribute is not being set in the custom element');
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