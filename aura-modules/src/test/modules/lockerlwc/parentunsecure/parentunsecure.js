import { Element, api } from 'engine';
import * as testUtils from 'securemoduletest-test-util';

export default class ParentUnsecure extends Element {
    @api callback;

    get customEventData() {
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
            domElement: this.template.querySelector('#parent-unsecure'),
            win: window,
            doc: document,
            body: document.body,
            head: document.head
        };
    }

    @api testUnsecureLWC2SecureLWCCustomEventCrossNamespace() {
        const child = this.template.querySelector('securemoduletest-child');
        let triggered = false;
        const _this = this;

        const ev = new CustomEvent('customEvent', {
            detail: {
                data: Object.assign(_this.customEventData, {
                    func: function () {
                        triggered = true;
                    }
                })
            }
        });

        const promise = testUtils.waitForPromise(
            true,
            function () {
                return triggered;
            },
            'Function in CustomEvent payload was not invoked '
        );

        child.dispatchEvent(ev);
        return promise;
    }

    @api testUnsecureLWC2SecureLWCCustomEvent() {
        const child = this.template.querySelector('lockerlwc-childsecure');
        let triggered = false;
        const _this = this;

        const ev = new CustomEvent('customEvent', {
            detail: {
                data: Object.assign(_this.customEventData, {
                    func: function () {
                        triggered = true;
                    }
                })
            }
        });

        const promise = testUtils.waitForPromise(
            true,
            function () {
                return triggered;
            },
            'Function in CustomEvent payload was not invoked '
        );

        child.dispatchEvent(ev);
        return promise;
    }

    assertCustomEvent(ev) {
        testUtils.assertEquals(
            '[object CustomEvent]',
            `${ev}`,
            'Expected CustomEvent in event handler'
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
        testUtils.assertEquals('[object HTMLDivElement]', ev.detail.data.domElement.toString(), 'Should not receive a SecureElement');
        testUtils.assertEquals(
            '[object Window]',
            `${ev.detail.data.win}`,
            'Expected window to be a Window'
        );

        testUtils.assertEquals(
            '[object HTMLDocument]',
            `${ev.detail.data.doc}`,
            'Expected document to be a HTMLDocument'
        );

        testUtils.assertEquals(
            '[object HTMLBodyElement]',
            `${ev.detail.data.body}`,
            'Expected body to be a HTMLBodyElement'
        );

        testUtils.assertEquals(
            '[object HTMLHeadElement]',
            `${ev.detail.data.head}`,
            'Expected head to be a HTMLHeadElement'
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
            '[object MouseEvent]',
            `${ev}`,
            'Expected MouseEvent in event handler'
        );

        testUtils.assertEquals(
            '[object HTMLElement]',
            `${ev.currentTarget}`,
            'event.currentTarget should be a HTMLElement'
        );

        testUtils.assertEquals(
            '[object HTMLElement]',
            `${ev.target}`,
            'event.target should be a HTMLElement'
        );
        if (this.callback) {
            this.callback();
        }
    }

    connectedCallback() {
        this.template.addEventListener('customEvent', this.assertCustomEvent);
        this.template.addEventListener('click', this.assertDOMEvent.bind(this));
    }
}