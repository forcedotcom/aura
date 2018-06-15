({
    browsers: ['GOOGLECHROME', "IE11"],

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

                cmp.set('v.items', [{ label: 'item1', id: 1 }, { label: 'item2', id: 2 }]);

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

                list.set('v.items', [{ label: 'item1', id: 1 }, { label: 'item2', id: 2 }]);

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
    },

    testReadOnlyAttrUpdatesWhenItsDependentChanged: {
        test: [
            function(cmp) {
                var target = cmp.find('input');
                var validity = target.get('v.validity');
                $A.test.assertEquals('', validity);

                target.set('v.value', 'foo');

                validity = target.get('v.validity');
                $A.test.assertEquals('foo', validity);
            }
        ]
    },

    testReadOnlyBoundAttrUpdatesWhenItsDependentChanged: {
        test: [
            function(cmp) {
                var target = cmp.find('input');
                var myValidity = cmp.get('v.myValidity');
                $A.test.assertEquals('', myValidity);

                target.set('v.value', 'foo');

                myValidity = cmp.get('v.myValidity');
                $A.test.assertEquals('foo', myValidity);
            }
        ]
    },

    testAuraActionAttributeIsCalledWhenEventIsFired: {
        attributes: {
            'result': '',
        },
        test: [
            function(cmp) {
                var target = cmp.find('input1');
                target.set('v.value', 'foo');
                var detail = {
                    value: 'foo'
                };
                target.getElement().querySelector('input').dispatchEvent(
                    new CustomEvent('change', {
                        composed: true,
                        bubbles: true,
                        detail: detail,
                    })
                );
                $A.test.assertEquals(cmp.get('v.result'), 'foo');
            }
        ]
    },

    testCreateComponentWithAuraActionAttribute: {
        test: [
            function(cmp) {
                $A.createComponent(
                    "moduleTest:simpleInput",
                    {
                        "onchange": cmp.get('v.onChange'),
                        "aura:id": "input2"
                    },
                    function(newCmp) {
                        var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    }
                );
            },
            function(cmp) {
                var target = cmp.find('input2');
                target.set('v.value', 'bar');
                var detail = {
                    value: 'bar'
                };
                target.getElement().querySelector('input').dispatchEvent(
                    new CustomEvent('change', {
                        composed: true,
                        bubbles: true,
                        detail: detail,
                    })
                );

                $A.test.assertEquals(cmp.get('v.result'), 'bar');
            }
        ]
    },

    testBooleanAttributeUpdatesWhenChangeHappenedInElement: {
        test: [
            function(cmp) {
                var target = cmp.find('inputRadio');

                target.set('v.checked', false);
                target.getElement().querySelector('input').click();

                $A.test.assertTrue(cmp.get('v.radioChecked'));
            }
        ]
    },

    testCompatGetAttribute: {
        test: [
            function(cmp) {
                var target = cmp.find('input');
                target.set('v.value', 'foo');
                var validity = target.get('v.inputValidity');
                $A.test.assertTrue(validity.valid);
            }
        ]
    },

    testDynamicCreationNonExistentAttr: {
        test: [
           function(cmp) {
               var createdCmp;
               $A.createComponent("moduletest:simpleCmp", { nonExistent: "foo" }, function(newCmp) {
                   createdCmp = newCmp;
               });
               $A.test.addWaitFor(true, function() { return createdCmp !== undefined; }, function() {
                   $A.test.assertNotNull(createdCmp, "No component returned from $A.createComponent");
                   var qualifiedName = createdCmp.getDef().getDescriptor().getQualifiedName();
                   $A.test.assertEquals("markup://moduleTest:simpleCmp", qualifiedName, "Unexpected component returned from $A.createComponent");
               });
           }
       ]
    }
})
