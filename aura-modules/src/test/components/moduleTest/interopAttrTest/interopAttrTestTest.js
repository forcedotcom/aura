({
    browsers: ['GOOGLECHROME'],

    selector: {
        literal: '.m-literal span',
        expression: '.m-expr span',
        changeValuesBtn: '#change-values'
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

    testReturnsDefaultFromInteropComponent: {
        test: [
            function defaultProps(cmp) {
                var list = cmp.find('list-without-items');

                // The default value held by the InteropComponent element shouldn't be retrievable using the cmp.get
                $A.test.assertEquals(
                    0,
                    list.get('v.items').length,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    0,
                    list.getElement().items.length,
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
                    2,
                    list.get('v.items').length,
                    'Wrong number of items on InteropComponent'
                );
                $A.test.assertEquals(
                    2,
                    list.getElement().items.length,
                    'Wrong number of items on Element'
                );
            },
            function renderUpdatedProps(cmp) {
                var itemElement = cmp
                    .find('list-without-items')
                    .getElement()
                    .querySelectorAll('li');

                $A.test.assertEquals(
                    2,
                    itemElement.length,
                    'Wrong number of items has been rendered'
                );
            }
        ]
    },
    testCanReadPublicAccessors: {
        test: [
            function (cmp) {
                var interopCmp = cmp.find('main');

                $A.test.assertEquals('accessor-test-value', interopCmp.get('v.myAccessor'), 'should be able to read public accessor');
            }
        ]
    },
    testCanReadUpdatedAccessorValue: {
        test: [
            function (cmp) {
                var interopCmp = cmp.find('main');
                interopCmp.getElement().querySelector(this.selector.changeValuesBtn).click();

                $A.test.assertEquals('modified-accessor-value', interopCmp.get('v.myAccessor'), 'should be able to read accessor modified value');
            }
        ]
    },
    testCanPassPRV: {
        test: [
            function (cmp) {
                $A.test.assertEquals('accessor-test-value', cmp.get('v.accessorValue'), 'accessor value should be reflected on the PRV.');

                var interopCmp = cmp.find('main');
                interopCmp.getElement().querySelector(this.selector.changeValuesBtn).click();

                $A.test.assertEquals('modified-accessor-value', cmp.get('v.accessorValue'), 'should be able to read accessor modified value from the bound template');
            }
        ]
    },
    testAccessorIgnoresPassedPrimitiveValue: {
        test: [
            function (cmp) {
                var interopCmp = cmp.find('accessor-primitive-value');
                $A.test.assertEquals('accessor-test-value', interopCmp.get('v.myAccessor'), 'accessor should ignore passed primitive value.');

                var interopCmp = cmp.find('accessor-primitive-value');
                interopCmp.getElement().querySelector(this.selector.changeValuesBtn).click();

                $A.test.assertEquals('modified-accessor-value', interopCmp.get('v.myAccessor'), 'should be able to read accessor modified value');
            }
        ]
    },
    // Interop: Cannot get value of attribute that's not bound to parent cmp #784
    testCanGetUnboundAttributes: {
        test: [
            function(cmp) {
                var unboundChild = cmp.find('unbound');
                var attributes = ['literal', 'bound', 'unbound', 'expression', 'nested'];
                attributes.forEach(function(attribute) {
                    $A.test.assertDefined(unboundChild.get('v.' + attribute), 'attribute [' + attribute + '] should be defined');
                });
            }
        ]
    },

    getNullValueText: function (cmp) {
        return cmp
            .find('nullTest')
            .getElement()
            .querySelector('.null-test')
            .innerText;
    },
    testNullValue: {
        attributes: {
            'nullValueTest': 'John',
        },
        test: [
            function(cmp) {
                var actual = this.getNullValueText(cmp);

                $A.test.assertEquals('John', actual, 'The bound value should be John');
                cmp.set("v.nullValueTest", null);
            },
            function (cmp) {
                var actual = this.getNullValueText(cmp);

                $A.test.assertEquals('', actual, 'After setting the nullTest attribute to null the rendered text should be empty');
            }
        ]
    },

    testUndefinedValue: {
        attributes: {
            'nullValueTest': 'John',
        },
        test: [
            function(cmp) {
                var actual = this.getNullValueText(cmp);

                $A.test.assertEquals('John', actual, 'The bound value should be John');
                cmp.set("v.nullValueTest", undefined);
            },
            function (cmp) {
                var actual = this.getNullValueText(cmp);

                $A.test.assertEquals('', actual, 'After setting the nullTest attribute to undefined the rendered text should be empty');
            }
        ]
    }
})
