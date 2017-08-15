({
    selector: {
        literal: '.m-literal span'
    },

    testFalsy: {
        browsers: ['GOOGLECHROME'],
        test: [
            function(cmp) {
                var expected = 'false';
                var element = cmp
                    .getElement()
                    .querySelector(this.selector.literal);
                return new Promise(function(resolve, reject) {
                    var actual = element.textContent;
                    $A.test.assertEquals(actual, expected, 'Wrong literal');
                    resolve();
                });
            }
        ]
    },

    testAttributesAreReflectedOnInteropComponent: {
        browsers: ['GOOGLECHROME'],
        test: [
            function defaultProps(cmp) {
                var list = cmp.find('list');

                $A.test.assertEquals(
                    list.get('v.items').length,
                    0,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    list.getElement().items.length,
                    0,
                    'Wrong number of items on Element'
                );
            },
            function updateProps(cmp) {
                var list = cmp.find('list');

                cmp.set('v.items', [{ label: 'item1' }, { label: 'item2' }]);

                $A.test.assertEquals(
                    list.get('v.items').length,
                    2,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    list.getElement().items.length,
                    2,
                    'Wrong number of items on Element'
                );
            },
            function renderUpdatedProps(cmp) {
                var itemElement = cmp
                    .find('list')
                    .getElement()
                    .querySelectorAll('li');

                $A.test.assertEquals(
                    itemElement.length,
                    2,
                    'Wrong number of items has been rendered'
                );
            }
        ]
    },

    testDoesntReturnDefaultFromInteropComponent: {
        browsers: ['GOOGLECHROME'],
        test: [
            function defaultProps(cmp) {
                var list = cmp.find('list-without-items');

                // The default value held by the InteropComponent element shouldn't be retrievable using the cmp.get
                $A.test.assertEquals(
                    list.get('v.items'),
                    undefined,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    list.getElement().items.length,
                    0,
                    'Wrong number of items on Element'
                );
            }
        ]
    },

    testUpdateAttributeWhenNotBoundInTheTemplate: {
        browsers: ['GOOGLECHROME'],
        test: [
            function updateProps(cmp) {
                var list = cmp.find('list-without-items');

                list.set('v.items', [{ label: 'item1' }, { label: 'item2' }]);

                $A.test.assertEquals(
                    list.get('v.items').length,
                    2,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    list.getElement().items.length,
                    2,
                    'Wrong number of items on Element'
                );
            },
            function renderUpdatedProps(cmp) {
                var itemElement = cmp
                    .find('list-without-items')
                    .getElement()
                    .querySelectorAll('li');

                $A.test.assertEquals(
                    itemElement.length,
                    2,
                    'Wrong number of items has been rendered'
                );
            }
        ]
    }
})