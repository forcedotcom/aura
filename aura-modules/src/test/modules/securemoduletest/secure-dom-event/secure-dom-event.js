import { Element } from 'engine';
import * as testUtil from 'securemoduletest-test-util';

export default class SecureDOMEventClazz extends Element {
    @track _event = null;
    @track accounts = [{ id: 1, Name: "account1" }];
    @track boolVar = true;

    @api
    testClickEvent() {
        let domEvent;
        const element = this.root.querySelector("#title");
        element.addEventListener("click", (e) => {
            domEvent = e;
        });
        element.click();
        /** TODO: W-4462187 will fix this and these lines can be uncommented then
         testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString());
         testUtil.assertStartsWith("SecureElement", domEvent.target.toString(), "Expected event.target to return SecureElement"); **/
        testUtil.assertContains("MouseEvent", domEvent.toString(), "event has been wrapped by engine");
        testUtil.assertContains("HTMLDivElement", domEvent.target.toString(), "event.target has been wrapped by engine");
        testUtil.assertEquals("click", domEvent.type, "Unexpected DOM event type");
        // Verify non-wrapped method is still accessible
        testUtil.assertEquals("number", typeof domEvent.timeStamp);
    }

    // TODO: W-4437423
    @api
    testInitEventOnDynamicElement() {
        const element = document.createElement("input");
        let targetElem;
        let domEvent;
        element.addEventListener("change", (e) => {
            domEvent = e;
            targetElem = e.target;
        });
        const event = document.createEvent("HTMLEvents");
        event.initEvent("change", false, true);
        element.dispatchEvent(event);
        testUtil.assertDefined(domEvent, "Event handler never called after firing event created via document.createEvent");
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString());
        testUtil.assertStartsWith("SecureElement", targetElem.toString(), "Expected event.target to return SecureElement");
    }

    // TODO: W-4437423 - LS does not support dispatchEvent when using a SecureDOMEvent on a host event or queried on the host
    @api
    testInitEventOnTemplateElement() {
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
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString());
        testUtil.assertEquals(this, targetElement, "Expected event.target to be retargeted to host");
    }

    // W-4462187
    @api
    testEventView() {
        let domEvent;
        const element = this.root.querySelector("#title");
        element.addEventListener("click", (e) => {
            domEvent = e;
        });

        element.click();
        testUtil.assertEquals(window, domEvent.view, "DOMEvent view is not the window");
    }

    @api
    testEventTargetOfHtmlElementHandler() {
        const buttonInMarkup = this.root.querySelector("#buttonInMarkup");
        buttonInMarkup.click();
        this.assertClickHandlerCalled();

        const buttonInIteration = this.root.querySelector("#buttonInIteration");
        buttonInIteration.click();
        this.assertClickHandlerCalled();

        const buttonInIf = this.root.querySelector("#buttonInIf");
        buttonInIf.click();
        this.assertClickHandlerCalled();

        const buttonInNestedIteration = this.root.querySelector("#buttonInNestedIteration");
        buttonInNestedIteration.click();
        this.assertClickHandlerCalled();

        const buttonInFacet = this.root.querySelector("#buttonInFacet");
        buttonInFacet.click();
        this.assertClickHandlerCalled();
    }

    assertClickHandlerCalled() {
        // W-4462187 will fix this and these lines can be uncommented then
        // testUtil.assertStartsWith("SecureElement", this._event.target.toString());
        testUtil.assertContains("HTMLButtonElement", this._event.target.toString());
        this._event = null;
    }

    handleClick(event) {
        this._event = event;
    }
}