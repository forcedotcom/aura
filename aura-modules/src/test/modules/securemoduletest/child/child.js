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
}