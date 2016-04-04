({
    testChangeEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'change');
        },function (cmp) {
            this.assertEventFired(cmp, 'change', 1);
        }]
    },

    testInputEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'input');
        },function (cmp) {
            this.assertEventFired(cmp, 'input', 1);
        }]
    },

    testKeypressEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'keypress');
        },function (cmp) {
            this.assertEventFired(cmp, 'keypress', 1);
        }]
    },

    testKeydownEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'keydown');
        },function (cmp) {
            this.assertEventFired(cmp, 'keydown', 1);
        }]
    },

    testKeyupEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'keyup');
        },function (cmp) {
            this.assertEventFired(cmp, 'keyup', 1);
        }]
    },

    testCopyEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'copy');
        },function (cmp) {
            this.assertEventFired(cmp, 'copy', 1);
        }]
    },

    testPasteEvent: {
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'paste');
        },function (cmp) {
            this.assertEventFired(cmp, 'paste', 1);
        }]
    },

    getInputElement: function (cmp) {
        return cmp.getElement().getElementsByTagName('input')[0];
    },

    assertEventFired: function (cmp, eventName, eventCounter) {
        $A.test.assertEquals(eventName, cmp.get('v.eventFired').getName(),
                'The last fired event was ' + eventName);
        $A.test.assertEquals(eventCounter, cmp.get('v.eventList').length,
                'The event counter doesn\'t match');
    }
})