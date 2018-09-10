import { LightningElement, api } from "lwc";
import * as testUtil from "securemoduletest/testUtil";
import { LockerLWCEventName } from "lockerlwc/lockerlwcevent";

export default class Child extends LightningElement {
    get interopData() {
        return {
                object: {
                    foo: 'bar'
                },
                array: [1],
                domElement: this.template.querySelector('#p-securemoduletest-child'),
                sharedObjects: {
                    window, 
                    document, 
                    body: document.body, 
                    head: document.head
                }
        }
    }
    
    @api
    testInitEventOnElementOfChildModule() {
        let domEvent;
        let targetElement;
        this.addEventListener("change", (e) => {
            domEvent = e;
            targetElement = e.target;
        });
        const event = document.createEvent("HTMLEvents");
        event.initEvent("change", false, true);
        this.dispatchEvent(event);
        testUtil.assertDefined(domEvent, "Event handler never called after firing event created via document.createEvent");
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString(), "Expected event param in listener to be a wrapped event");
        testUtil.assertStartsWith("SecureElement", domEvent.target.toString(), "Expected event.target to return SecureElement");
        testUtil.assertEquals("SECUREMODULETEST-CHILD", targetElement.tagName, "Expected event.target to be retargeted to host");
    }

    @api
    triggerFooEvent() {
        const ev = new CustomEvent('foo', {
            bubbles: true,
            detail: this.interopData
        });

        this.dispatchEvent(ev);
    }

    @api
    testAura2SLWCApiMethodCNReceive() {
        return this.interopData;
    }

    @api
    testAura2SLWCApiMethodCNSend(data) {
        testUtil.assertEqualsValue(
            {foo: 'bar'},
            data.object,
            'Mismatch in object parameter value'
        );
        testUtil.assertEqualsValue(
            [1,2,3],
            data.array,
            'Mismatch in array parameter value'
        );
        testUtil.assertEquals(
            'SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }',
            data.domElement.toString(),
            'Should receive a SecureElement'
        );
        testUtil.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
            `${data.win}`,
            'Expected window to be a SecureWindow'
        );

        testUtil.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }',
            `${data.doc}`,
            'Expected document to be a SecureDocument: [object HTMLDocument]'
        );

        testUtil.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"secureModuleTest"} }',
            `${data.body}`,
            'Expected body to be a SecureElement: [object HTMLBodyElement]'
        );

        testUtil.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"secureModuleTest"} }',
            `${data.head}`,
            'Expected head to be a SecureElement: [object HTMLHeadElement]'
        );

        testUtil.assertEquals(
            true,
            data.func instanceof Function,
            'Mismatch in expected function parameter'
        );

        data.func();
    }

    assertTestAuraLWCCustomEventOnHostElement(ev) {
        testUtil.assertEquals(
            'SecureDOMEvent: [object CustomEvent]{ key: {"namespace":"secureModuleTest"} }',
            `${ev}`,
            'Expected SecureEvent in event handler'
        );

        testUtil.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
            `${window}`,
            'Expected SecureWindow object in event handler'
        );

        testUtil.assertEqualsValue({
            foo: 'bar',
            bar: {
                baz: 'foo'
            }
        },
            ev.detail.data.object,
            'Expected object was not received in event data'
        );
        testUtil.assertEqualsValue([0, 1, 2], ev.detail.data.array, 'Expected array was not received in event data');
        testUtil.assertEquals('foobar', ev.detail.data.string, 'Expected string was not received in event data');
        testUtil.assertEquals(1, ev.detail.data.number, 'Expected number was not received in event data');
        testUtil.assertEquals(true, ev.detail.data.boolean, 'Expected boolean was not received in event data');
        testUtil.assertEquals(
            'SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }',
            ev.detail.data.domElement.toString(),
            'Should receive a SecureElement'
        );
        testUtil.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
            `${ev.detail.data.win}`,
            'Expected window to be a SecureWindow'
        );

        testUtil.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }',
            `${ev.detail.data.doc}`,
            'Expected document to be a SecureDocument: [object HTMLDocument]'
        );

        testUtil.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"secureModuleTest"} }',
            `${ev.detail.data.body}`,
            'Expected body to be a SecureElement: [object HTMLBodyElement]'
        );

        testUtil.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"secureModuleTest"} }',
            `${ev.detail.data.head}`,
            'Expected head to be a SecureElement: [object HTMLHeadElement]'
        );

        testUtil.assertEquals(
            true,
            ev.detail.data.func instanceof Function,
            'Mismatch in expected function parameter'
        );

        ev.detail.data.func();
    }

    assertPlatformEventPayload(ev) {
        assertDataObject(ev.evData);
    }

    connectedCallback() {
        this.template.addEventListener('customEvent', this.assertTestAuraLWCCustomEventOnHostElement);
        this.template.addEventListener(LockerLWCEventName, this.assertPlatformEventPayload);
    }
}

function assertDataObject(data) {
    testUtil.assertEqualsValue({
        foo: 'bar',
        bar: {
            baz: 'foo'
        }
    },
        data.object,
        'Expected object was not received in event data'
    );
    testUtil.assertEqualsValue([0, 1, 2], data.array, 'Expected array was not received in event data');
    testUtil.assertEquals('foobar', data.string, 'Expected string was not received in event data');
    testUtil.assertEquals(1, data.number, 'Expected number was not received in event data');
    testUtil.assertEquals(true, data.boolean, 'Expected boolean was not received in event data');

    testUtil.assertEquals(
        'SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }',
        data.domElement.toString(),
        'Should receive a SecureElement from an unlockerized environment'
    );

    testUtil.assertEquals(
        'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
        `${data.win}`,
        'Expected window to be a SecureWindow'
    );

    testUtil.assertEquals(
        'SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }',
        `${data.doc}`,
        'Expected document to be a SecureDocument: [object HTMLDocument]'
    );

    testUtil.assertEquals(
        'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"secureModuleTest"} }',
        `${data.body}`,
        'Expected body to be a SecureElement: [object HTMLBodyElement]'
    );

    testUtil.assertEquals(
        'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"secureModuleTest"} }',
        `${data.head}`,
        'Expected head to be a SecureElement: [object HTMLHeadElement]'
    );

    testUtil.assertEquals(
        true,
        data.func instanceof Function,
        'Mismatch in expected function parameter'
    );
    data.func();
}