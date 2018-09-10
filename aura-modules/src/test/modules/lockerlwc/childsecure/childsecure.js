import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";
import { LockerLWCEventName } from "lockerlwc/lockerlwcevent";

export default class ChildSecure extends LightningElement {
    @api arrayProp = [91, 92, 93];
    @api objProp = {
        foo: 'bar',
        bar: {
            baz: 'foo'
        }
    };
    @api stringProp = "childSecure";
    @api booleanProp = false;
    @api integerProp = 99;
    @api foo;

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
        assertDataObject(ev.detail.data);

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

        testUtils.assertEquals('SecureElement: [object HTMLElement]{ key: {"namespace":"lockerlwc"} }',
            `${ev.target}`,
            'event.target should be SecureElement');
        this.setAttribute('data-triggered', 'true');
    }

    assertPlatformEventData(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object Event]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'CustomEvent constructor should return a SecureEvent'
        );

        assertDataObject(ev.evData);
    }

    connectedCallback() {
        this.template.addEventListener('customEvent', this.assertCustomEvent.bind(this));
        this.template.addEventListener('click', this.assertDOMEvent.bind(this));
        this.template.addEventListener(LockerLWCEventName, this.assertPlatformEventData);
    }

    @api assertParamsInPublicMethod(data) {
        assertDataObject(data);
    }
}

function assertDataObject(data) {
    testUtils.assertEqualsValue({
        foo: 'bar',
        bar: {
            baz: 'foo'
        }
    },
        data.object,
        'Expected object was not received in event data'
    );
    testUtils.assertEqualsValue([0, 1, 2], data.array, 'Expected array was not received in event data');
    testUtils.assertEquals('foobar', data.string, 'Expected string was not received in event data');
    testUtils.assertEquals(1, data.number, 'Expected number was not received in event data');
    testUtils.assertEquals(true, data.boolean, 'Expected boolean was not received in event data');
    if (data.isSecure) {
        testUtils.assertEquals(
            'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
            data.domElement.toString(),
            'Should receive a SecureElement'
        );
    } else {
        testUtils.assertEquals(
            'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
            data.domElement.toString(),
            'Should receive SecureElement from an unlockerized environment'
        );
    }
    testUtils.assertEquals(
        'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
        `${data.win}`,
        'Expected window to be a SecureWindow'
    );

    testUtils.assertEquals(
        'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
        `${data.doc}`,
        'Expected document to be a SecureDocument: [object HTMLDocument]'
    );

    testUtils.assertEquals(
        'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
        `${data.body}`,
        'Expected body to be a SecureElement: [object HTMLBodyElement]'
    );

    testUtils.assertEquals(
        'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
        `${data.head}`,
        'Expected head to be a SecureElement: [object HTMLHeadElement]'
    );

    testUtils.assertEquals(
        true,
        data.func instanceof Function,
        'Mismatch in expected function parameter'
    );
    data.func();
}