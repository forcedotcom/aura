({
    fireDomEvent : function (elem, eventType) {
        var ev = new Event(eventType);
        elem.dispatchEvent(ev);
    },
    getInputElement : function (cmp) {
        return cmp.getElement().querySelector('input');
    },
    testChangeEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'change');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('change',lastFiredEvent.getName(),'The last fired event was change.');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testInputEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'input');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('input',lastFiredEvent.getName(),'The last fired event was input.');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testKeypressEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'keypress');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('keypress',lastFiredEvent.getName(),'The last fired event was keypress');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testKeydownEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'keydown');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('keydown',lastFiredEvent.getName(),'The last fired event was keydown');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testKeyupEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'keyup');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('keyup',lastFiredEvent.getName(),'The last fired event was keyup');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testCopyEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'copy');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('copy',lastFiredEvent.getName(),'The last fired event was copy');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');
            }
        ]
    },
    testPasteEvent : {
        test : [
            function (cmp) {
                var elem = this.getInputElement(cmp);
                this.fireDomEvent(elem,'paste');
            },
            function (cmp) {
                var lastFiredEvent = cmp.get('v.eventFired');
                var eventCounter = cmp.get('v.eventList').length;
                $A.test.assertEquals('paste',lastFiredEvent.getName(),'The last fired event was paste');
                $A.test.assertEquals(1,eventCounter,'The event counter doesn\'t match');

            }
        ]
    }

})