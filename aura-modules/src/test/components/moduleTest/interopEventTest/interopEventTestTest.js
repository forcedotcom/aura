({
    selector: {
        removeBtn : '#remove-btn',
        removeWithCallbackBtn : '#remove-with-callback-btn',
        onClickWithCallbackBtn : '#onclick-with-callback-btn',
        removePrevented : '#remove-prevented',
        evtWithDetails : '#onclick-dispatch-evt-with-details-btn'
    },
    assertMethodThrowError: function (cmp, method) {
        var interopCmp = cmp.find('errorTest');
        var removeBtn = interopCmp.getElement().querySelector(this.selector.removeBtn);

        removeBtn.click();
        var expectedMessage = 'Interop event tried calling function [' + method + '] with arguments [arg1,arg2,arg3], InteropComponent: markup://moduleTest:interopEvent [';
        var isCorrectMessage = cmp.get('v.methodCallError').startsWith(expectedMessage);

        $A.test.assertEquals(true, isCorrectMessage, 'calling method "' + method + '" should throw exception with correct message.');
    },
    testInteropEventThrowError: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var methodsThatThrow = ['getPhase', 'pause', 'resume', 'fire'];

                for (var i = 0; i < methodsThatThrow.length; i++) {
                    cmp.set('v.method', methodsThatThrow[i]);
                    this.assertMethodThrowError(cmp, methodsThatThrow[i]);
                }
            },
        ]
    },
    testInteropEventWrapDetailAsParam: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var interopCmp = cmp.find('paramTests');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.removeBtn);

                removeBtn.click();
                var expectedIds = [113];

                $A.test.assertEquals(expectedIds[0], cmp.get('v.ids')[0], 'A CustomEvent of an eventHandler should set as params the detail property');
                $A.test.assertEquals('remove', cmp.get('v.evtName'), 'Event name should be the type of the customEvent');
            },
        ]
    },
    testCantAttachActionToMissingPublicProperty: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var message = '';
                var expectedMessage = "Assertion Failed!: Attribute not defined in the component : false";

                try {
                    cmp.set('v.errorAction', 1);
                } catch (e) {
                    message = e.message;
                }

                $A.test.assertEquals(expectedMessage, message, 'interop should throw error when attaching a controller action to a non public property');
            }
        ]
    },
    testCantAttachActionToGlobalAttribute: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var message = '';
                var expectedMessage = "Assertion Failed!: Attribute not defined in the component : false";

                try {
                    cmp.set('v.errorAction', 2);
                } catch (e) {
                    message = e.message;
                }

                $A.test.assertEquals(expectedMessage, message, 'interop should throw error when attaching a controller action to a html global attribute');
            }
        ]
    },
    testCanAttachActionToPropStartingWithOnAsCallback: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var interopCmp = cmp.find('paramTests');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.onClickWithCallbackBtn);

                removeBtn.click();

                $A.test.assertTruthy(cmp.get('v.ids') instanceof MouseEvent, 'An attribute that starts with "on" should be treated as a callback and set argument as params of the aura event');
            },
        ]
    },
    /**
     * Other than on...
     */
    testInteropEventMapPropertiesAsParamInActionCalbacks: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var interopCmp = cmp.find('paramTests');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.removeWithCallbackBtn);

                removeBtn.click();

                $A.test.assertTruthy(cmp.get('v.ids') instanceof MouseEvent, 'An attribute as a callback should and set argument as params of the aura event');
            },
        ]
    },
    testCanPreventDefaultOfCustomEvent: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var interopCmp = cmp.find('simple');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.removeBtn);

                removeBtn.click();
            },
            function (cmp) {
                var interopCmp = cmp.find('simple');
                var removePrevented = interopCmp.getElement().querySelector(this.selector.removePrevented).innerText;
                $A.test.assertEquals('true', removePrevented, 'it should prevent default of custom event fired on LWC and prevented in aura land.');
            },
            function (cmp) {
                var removePropagated = cmp.find('evt-propagated').getElement().innerText;
                $A.test.assertEquals('false', removePropagated, 'it should stop propagation of custom event fired on LWC and prevented in aura land.');
            },
        ]
    },
	testUnwrapEventDetailFromRaptorComponent: {
        // this is specifically for ie11
		test: [
			function (cmp) {
		        cmp._valueObject = {
		            prop1: 'value1',
		            prop2: 'value2',

                }
                cmp.set('v.value', cmp._valueObject);
				var interopCmp = cmp.find('eventWithDetails');
				var triggerEvtBtn = interopCmp.getElement().querySelector(this.selector.evtWithDetails);

				triggerEvtBtn.click();
			},
			function (cmp) {
		        var value = cmp._valueObject;
		        var valueFromEvent = cmp.get('v.value');
				$A.test.assertEquals(value.prop1, valueFromEvent.prop1, 'it should be able to read correct values from the event.details.');
				$A.test.assertEquals(value.prop2, valueFromEvent.prop2, 'it should be able to read correct values from the event.details');
			},
		]
	},
	testUnwrapEventDetailAsProxyFromRaptorComponent: {
		// this is specifically for ie11
		test: [
			function (cmp) {
				cmp._valueObject = {
					prop1: 'value1',
					prop2: 'value2',

				}
				cmp.set('v.value', cmp._valueObject);
				var interopCmp = cmp.find('eventWithDetailsAsProxy');
				var triggerEvtBtn = interopCmp.getElement().querySelector(this.selector.evtWithDetails);

				triggerEvtBtn.click();
			},
			function (cmp) {
				var value = cmp._valueObject;
				var valueFromEvent = cmp.get('v.value');
				$A.test.assertEquals(value.prop1, valueFromEvent.prop1, 'it should be able to read correct values from the event.details.');
				$A.test.assertEquals(value.prop2, valueFromEvent.prop2, 'it should be able to read correct values from the event.details');
			},
		]
	},
})
