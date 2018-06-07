import { Element, api } from 'engine';
import * as testUtil from 'securemoduletest-test-util';

export default class Child extends Element {
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
        /** TODO: W-4462187 will fix this and these lines can be uncommented then
         testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString());
         testUtil.assertStartsWith("SecureElement", domEvent.target.toString(), "Expected event.target to return SecureElement"); **/
        testUtil.assertDefined(domEvent, "Event handler never called after firing event created via document.createEvent");
        // cannot detect if wrapped object is a proxy
        testUtil.assertContains("Event", domEvent.toString(), "Expected event(wrapped by engine)");
        testUtil.assertEquals(this, targetElement, "Expected event.target to be retargeted to host");
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
            'SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }',
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

    connectedCallback() {
        this.template.addEventListener('customEvent', this.assertTestAuraLWCCustomEventOnHostElement);
    }
}