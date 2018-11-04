import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";
import { LockerLWCEvent, LockerLWCEventName } from "lockerlwc/lockerlwcevent";

const NAMESPACE_KEY = 'lockerlwc';
export default class ParentSecure extends LightningElement {
    // properties
    @api callback;

    // utilities
    getCustomEventData(doneObj) {
        return {
            object: {
                foo: 'bar',
                bar: {
                    baz: 'foo'
                }
            },
            array: [0, 1, 2],
            string: 'foobar',
            number: 1,
            boolean: true,
            domElement: this.template.querySelector('.parent-secure'),
            win: window,
            doc: document,
            body: document.body,
            head: document.head,
            func: this.createDoneCallback(doneObj),
            NAMESPACE_KEY: NAMESPACE_KEY
        };
    }

    createDoneCallback(doneObj = {}) {
        const fn = function (cb) {
            doneObj.triggered = true;
            return cb ? cb() : undefined;
        }

        return fn
    }

    // assertion helpers
    assertIsSecureElement(el) {
        testUtils.assertEquals(
            true,
            `${el}`.startsWith('SecureElement:'),
            'Expected a SecureElement object in Lockerized LWC component'
        );
    }

    assertIsSecureWindow(window) {
        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
            `${window}`,
            'Expected window to be a SecureWindow'
        );
    }

    assertIsSecureDocument(doc) {
        testUtils.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
            `${doc}`,
            'Expected document to be a SecureDocument'
        );
    }

    assertIsSecureBody(body) {
        testUtils.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
            `${body}`,
            'Expected body to be a SecureElement: [object HTMLBodyElement]'
        );
    }

    assertIsSecureHead(head) {
        testUtils.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
            `${head}`,
            'Expected head to be a SecureElement: [object HTMLHeadElement]'
        );
    }

    assertIsFunction(func) {
        testUtils.assertEquals(
            true,
            func instanceof Function,
            'Expected instance of Function'
        );
    }

    assertIsSecureObjectElement(el) {
        testUtils.assertEquals(
            'SecureObject: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
            `${el}`,
            'Should receive a SecureObject'
        );
    }

    assertIsSecureDOMEvent(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object MouseEvent]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'Expected SecureEvent in event handler'
        );

    }

    assertIsSecureCustomEvent(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object CustomEvent]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'CustomEvent constructor should return a SecureEvent'
        );
    }

    assertIsSecureEvent(ev) {
        testUtils.assertEquals(
            'SecureDOMEvent: [object Event]{ key: {"namespace":"lockerlwc"} }',
            `${ev}`,
            'CustomEvent constructor should return a SecureEvent'
        );
    }

    assertCustomEventDataPayload(ev) {
        this.assertIsSecureCustomEvent(ev);
        this.assertIsSecureWindow(window);
        this.assertDataPayload(ev.detail.data);
    }

    assertDataPayload(data) {
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
        if (NAMESPACE_KEY === data.NAMESPACE_KEY) {
            this.assertIsSecureElement(data.domElement);
        } else {
            this.assertIsSecureObjectElement(data.domElement);
        }

        this.assertIsSecureWindow(data.win);
        this.assertIsSecureDocument(data.doc);
        this.assertIsSecureBody(data.body);
        this.assertIsSecureHead(data.head);
        this.assertIsFunction(data.func);
    }

    @api triggerCustomEvent() {
        const ev = new CustomEvent('foo', {
            bubbles: true,
            detail: this.getCustomEventData(),
        });

        this.dispatchEvent(ev);
    }

    // tests
    @api testAura2SLWCApiMethodSend(data, cb) {
        this.assertDataPayload(data);
        this.assertIsFunction(data.func);
        data.func();
        cb();
    }

    @api testAura2SLWCApiMethodReceive() {
        return this.getCustomEventData();
    }
    @api
    testAura2SLWCApiProp =  {
        object: {
            foo: 'bar',
            bar: {
                baz: 'foo'
            }
        }
    };

    @api testTemplateQuerySelectorReturnsSecureElement() {
        const el = this.template.querySelector('.parent-secure');
        this.assertIsSecureElement(el);
    }

    @api testLWCCustomEventOnSelf() {
        const doneObj = {};
        const _this = this;
        const ev = new CustomEvent('testLWCCustomEventOnSelf', {
            detail: {
                data: _this.getCustomEventData(doneObj)
            }
        });

        this.assertIsSecureCustomEvent(ev);

        const promise = testUtils.waitForPromise(
            true,
            function () {
                return doneObj.triggered;
            },
            'Function in CustomEvent payload could not be called'
        )

        this.dispatchEvent(ev);
        return promise;
    }

    @api testSecureLWC2SecureLWCCustomEvent() {
        const doneObj = {};
        const child = this.template.querySelector('lockerlwc-childsecure');
        const _this = this;

        const ev = new CustomEvent('customEvent', {
            detail: {
                data: _this.getCustomEventData(doneObj)
            }
        });

        this.assertIsSecureCustomEvent(ev);
        const promise = testUtils.waitForPromise(
            true,
            function () {
                return doneObj.triggered;
            },
            'Function in CustomEvent payload was not invoked '
        );

        child.dispatchEvent(ev);
        return promise;
    }

    @api testSecureLWC2SecureLWCDomEvent() {
        const child = this.template.querySelector('lockerlwc-childsecure');

        const promise = testUtils.waitForPromise(
            'true',
            function () {
                return child.getAttribute('data-triggered');
            },
            'Child component handler did not fire'
        );

        child.click();
        return promise;
    }

    @api testSecureLWC2UnsecureLWCCustomEvent() {
        const doneObj = {};
        const child = this.template.querySelector('lockerlwc-parentunsecure');
        const _this = this;

        const ev = new CustomEvent('customEvent', {
            detail: {
                data: _this.getCustomEventData(doneObj)
            }
        });

        this.assertIsSecureCustomEvent(ev);
        const promise = testUtils.waitForPromise(
            true,
            function () {
                return doneObj.triggered;
            },
            'Function in CustomEvent payload was not invoked '
        );

        child.dispatchEvent(ev);
        return promise;
    }

    @api testSecureLWC2UnsecureLWCDOMEvent(cb) {
        const child = this.template.querySelector('lockerlwc-parentunsecure');
        child.callback = cb;
        child.click();
    }

    @api testSecureLWC2SecureLWCCustomEventCrossNamespace() {
        const doneObj = {};
        const child = this.template.querySelector('securemoduletest-child');
        const _this = this;

        const ev = new CustomEvent('customEvent', {
            detail: {
                data: _this.getCustomEventData(doneObj)
            }
        });

        this.assertIsSecureCustomEvent(ev);
        const promise = testUtils.waitForPromise(
            true,
            function () {
                return doneObj.triggered;
            },
            'Function in CustomEvent payload was not invoked '
        );

        child.dispatchEvent(ev);
        return promise;
    }

    @api
    testSLWC2SWLCParentCanCallAPIProp() {
        const doneObj = {};
        const child = this.template.querySelector('lockerlwc-childsecure');

        // Access properties
        const expectedValue = {
            foo: 'bar',
            bar: {
                baz: 'foo'
            }
        };
        testUtils.assertEquals('childSecure', child.stringProp, 'Unable to access string property on child component');
        testUtils.assertEquals(99, child.integerProp, 'Unable to access integer property on child component');
        testUtils.assertFalse(child.booleanProp, 'Unable to access boolean property on child component');

        testUtils.assertEqualsValue([91, 92, 93], child.arrayProp, 'Unable to access array on child component');
        testUtils.assertEqualsValue(expectedValue, child.objProp, 'Unable to access object property on child component');
        // Access public methods
        testUtils.assertDefined(child.assertParamsInPublicMethod, 'Unable to access @api method on child component');
        testUtils.assertTrue(child.assertParamsInPublicMethod instanceof Function, 'Unexpected wrapped value received on child');
        child.assertParamsInPublicMethod(this.getCustomEventData(doneObj));
        testUtils.assertTrue(doneObj.triggered, 'Failed to execute callback in child component');
    }
    @api
    testSLWC2SLWCChildApiPropValueIsReadOnly() {
        const expectedErrorMessage = 'Invalid mutation: Cannot set "foo" on "[object Object]". "[object Object]" is read-only.';
        const sameNamespaceChild = this.template.querySelector('lockerlwc-childsecure');
        try {
            sameNamespaceChild.objProp.foo = 'Immutable?';
            testUtils.fail('API property value should be immutable');
        } catch(e) {
            testUtils.assertEquals(expectedErrorMessage, e.message, 'Api property value of same namespace child should remain readonly');
        }
        const crossNamespaceChild = this.template.querySelector('securemoduletest-child');
        try {
            crossNamespaceChild.apiProp.object.foo = 'Immutable?';
            testUtils.fail('API property value should be immutable');
        } catch(e) {
            testUtils.assertEquals(expectedErrorMessage, e.message, 'Api property value of cross namespace child should remain readonly');
        }
    }
    @api
    testSLWC2UnsecureLWCChildApiPropValueIsReadOnly() {
        const unsecureChild = this.template.querySelector('lockerlwc-parentunsecure');
        try {
            unsecureChild.apiProp.object.foo = 'Immutable?';
            testUtils.fail('API property value should be immutable');
        } catch(e) {
            testUtils.assertEquals(
                'Invalid mutation: Cannot set "foo" on "[object Object]". "[object Object]" is read-only.',
                e.message,
                'Api property of an unsecure child should remain readonly'
            );
        }
        const unsecureCrossNamespaceChild = this.template.querySelector('securemoduletest-non-lockerized-cmp');
        try {
            unsecureCrossNamespaceChild.apiProp.object.foo = 'Immutable?';
            testUtils.fail('API property value should be immutable');
        } catch(e) {
            testUtils.assertEquals(
                'Invalid mutation: Cannot set "foo" on "[object Object]". "[object Object]" is read-only.',
                e.message,
                'Api property of an unsecure child from cross namespace should remain readonly'
            );
        }
    }
    @api testPlatformEventsOnSelf(objDone) {
        this.addEventListener(LockerLWCEventName, (ev) => {
            testUtils.assertEquals(
                'SecureDOMEvent: [object Event]{ key: {"namespace":"lockerlwc"} }',
                `${ev}`,
                'Event constructor should return a SecureDOMEvent'
            );
            this.assertDataPayload(ev.evData);
            ev.evData.func();
        });

        this.dispatchEvent(new LockerLWCEvent(this.getCustomEventData(objDone)));
    }

    @api testPlatformEventsOnChild(objDone) {
        const child = this.template.querySelector('lockerlwc-childsecure');
        child.dispatchEvent(new LockerLWCEvent(this.getCustomEventData(objDone)));
    }

    @api testPlatformEventsOnChildCrossNamespace(objDone) {
        const child = this.template.querySelector('securemoduletest-child');
        child.dispatchEvent(new LockerLWCEvent(this.getCustomEventData(objDone)));
    }


    assertTestAuraLWCDomEventOnHostElement(ev) {
        this.assertIsSecureDOMEvent(ev);
        this.assertIsSecureWindow(window);
        this.assertIsSecureDocument(document);
        this.assertIsSecureElement(ev.currentTarget);

        this.assertIsSecureElement(ev.target);
        if (this.callback) {
            this.callback();
        }
    }

    assertTestLWCCustomEventOnSelf(ev) {
        this.assertIsSecureCustomEvent(ev);
        this.assertIsSecureWindow(window);
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
        this.assertIsSecureElement(ev.detail.data.domElement);
        this.assertIsSecureWindow(ev.detail.data.win);
        this.assertIsSecureDocument(ev.detail.data.doc);
        this.assertIsSecureBody(ev.detail.data.body);
        this.assertIsSecureHead(ev.detail.data.head);
        this.assertIsFunction(ev.detail.data.func);
        ev.detail.data.func();
    }

    connectedCallback() {
        this.addEventListener('testAura2SLWCCustomEventReceive', (ev) => {
            this.assertCustomEventDataPayload(ev);
            this.assertIsFunction(ev.detail.data.func);
            ev.detail.data.func();
        });
        this.addEventListener('testLWCCustomEventOnSelf', this.assertTestLWCCustomEventOnSelf);
        this.addEventListener('click', this.assertTestAuraLWCDomEventOnHostElement)
    }
}
