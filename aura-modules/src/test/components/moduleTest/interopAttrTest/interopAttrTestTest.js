({
    browsers: ['GOOGLECHROME'],

    selector: {
        literal: '.m-literal span',
        expression: '.m-expr span'
    },

    testFalsy: {
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

    testGVPexpression: {
        test: [
            function(cmp) {
                var expected = 'Renderer';
                var element = cmp
                    .getElement()
                    .querySelector(this.selector.expression);
                return new Promise(function(resolve, reject) {
                    var actual = element.textContent;
                    $A.test.assertEquals(actual, expected, 'Wrong expression result');
                    resolve();
                });
            }
        ]
    },

    testProgrammaticInstantiation: {
        test: [
            function (cmp) {
                var done = false;

                $A.createComponent('markup://moduleTest:simpleCmp', {
                    'aura:id': 'programmatic'
                }, $A.getCallback(function (simpleCmp) {
                    cmp.set('v.programmatic', simpleCmp);
                    done = true;
                }));

                $A.test.addWaitFor(true, function () {
                    return done;
                });
            },
            function (cmp) {
                var el = document
                    .querySelector('.programmatic')
                    .querySelector('moduletest-simple-cmp');
                var message = 'Should support programmatic instantiation with an aura:id';
                $A.test.assertTrue(el !== null, message);
            }
        ]
    },

    testAttributesAreReflectedOnInteropComponent: {
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
