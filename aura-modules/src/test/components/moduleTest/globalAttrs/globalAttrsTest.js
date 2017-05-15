({
    browsers: ['GOOGLECHROME'],
    testGlobalAttrInCustomELement: {
        attributes: {
            'class': 'my-class',
            title: 'my-title'
        },
        test: [
            function (cmp) {
                var customEl = this.getCustomElement(cmp);
                var expectedClass = 'my-class';
                var expectedTitle = 'my-title';

                $A.test.assertTrue(customEl.classList.contains(expectedClass));
                $A.test.assertEquals(expectedTitle, customEl.title);
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