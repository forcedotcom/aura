({
    selector: {
        removeBtn : '#remove-btn',
        removeWithCallbackBtn : '#remove-with-callback-btn',
        onClickWithCallbackBtn : '#onclick-with-callback-btn',
        removePrevented : '#remove-prevented'
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
                $A.test.assertEquals('true', removePrevented, 'it should prevent default of custom event fired on raptor and prevented in aura land.');
            },
            function (cmp) {
                var removePropagated = cmp.find('evt-propagated').getElement().innerText;
                $A.test.assertEquals('false', removePropagated, 'it should stop propagation of custom event fired on raptor and prevented in aura land.');
            },
        ]
    },
})
