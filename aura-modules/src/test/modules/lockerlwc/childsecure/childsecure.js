import { Element } from 'engine';
import * as testUtils from 'securemoduletest-test-util';

export default class ChildSecure extends Element {
    assertCustomEvent(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object CustomEvent]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'Expected SecureEvent in event handler'
        );

        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
            `${window}`,
            'Expected SecureWindow object in event handler'
        );

        testUtils.assertEqualsValue({
            foo: 'bar',
            bar: {
                baz: 'foo'
            }
        },
            ev.detail.data.object,
            'Expected object was not received in event data'
        );
        testUtils.assertEqualsValue([0, 1, 2], ev.detail.data.array, 'Expected array was not received in event data');
        testUtils.assertEquals('foobar', ev.detail.data.string, 'Expected string was not received in event data');
        testUtils.assertEquals(1, ev.detail.data.number, 'Expected number was not received in event data');
        testUtils.assertEquals(true, ev.detail.data.boolean, 'Expected boolean was not received in event data');
        if (ev.detail.data.isSecure) {
            testUtils.assertEquals(
                'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.data.domElement.toString(),
                'Should receive a SecureElement'
            );
        } else {
            testUtils.assertEquals(undefined, ev.detail.data.domElement, 'Should not receive an element from an unlockerized environment');
        }
        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
            `${ev.detail.data.win}`,
            'Expected window to be a SecureWindow'
        );

        testUtils.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
            `${ev.detail.data.doc}`,
            'Expected document to be a SecureDocument: [object HTMLDocument]'
        );

        testUtils.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
            `${ev.detail.data.body}`,
            'Expected body to be a SecureElement: [object HTMLBodyElement]'
        );

        testUtils.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
            `${ev.detail.data.head}`,
            'Expected head to be a SecureElement: [object HTMLHeadElement]'
        );

        testUtils.assertEquals(
            true,
            ev.detail.data.func instanceof Function,
            'Mismatch in expected function parameter'
        );
        ev.detail.data.func();
    }

    assertDOMEvent(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object MouseEvent]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'Expected SecureEvent in event handler'
        );

        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
            `${window}`,
            'Expected SecureWindow object in event handler'
        );

        testUtils.assertEquals(
            'SecureElement: [object HTMLElement]{ key: {"namespace":"lockerlwc"} }',
            `${ev.currentTarget}`,
            'event.currentTarget should be a SecureElement'
        );

        testUtils.assertEquals(ev.target, undefined);
    }

    connectedCallback() {
        this.template.addEventListener('customEvent', this.assertCustomEvent);
        this.template.addEventListener('click', this.assertDOMEvent);
    }
}