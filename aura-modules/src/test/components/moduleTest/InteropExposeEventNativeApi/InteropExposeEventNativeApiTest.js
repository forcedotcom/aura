({
    selector: {
        removeBtn : '#remove-btn',
        triggerClickBtn : '#trigger-click',
    },
    testInteropRemoveEventNativeProps: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var interopCmp = cmp.find('cmptest');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.removeBtn);

                removeBtn.click();
                var receivedEvent = cmp.get('v.evt');
                $A.test.assertFalsy(receivedEvent.target, 'Interop should remove native event API (target)');
                $A.test.assertFalsy(receivedEvent.currentTarget, 'Interop should remove native event API (currentTarget)');
                $A.test.assertFalsy(receivedEvent.relatedTarget, 'Interop should remove native event API (relatedTarget)');
            },
        ]
    },
    testInteropExposeEventNativeProps: {
        browsers : [ 'GOOGLECHROME' ],
        attributes: {
            isLegacy: true
        },
        test: [
            function (cmp) {
                var interopCmp = cmp.find('legacy');
                var removeBtn = interopCmp.getElement().querySelector(this.selector.triggerClickBtn);

                removeBtn.click();
                interopCmp.get('v.validity');
                var receivedEvent = cmp.get('v.evt');
                $A.test.assertTruthy(receivedEvent.target, 'Interop should expose native event API (target)');
                $A.test.assertTruthy(receivedEvent.currentTarget, 'Interop should expose native event API (currentTarget)');
            },
        ]
    },
})
