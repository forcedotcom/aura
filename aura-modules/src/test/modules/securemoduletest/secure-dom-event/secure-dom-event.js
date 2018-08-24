import { LightningElement, track, api } from "lwc";
import * as testUtil from 'securemoduletest-test-util';

export default class SecureDOMEventClazz extends LightningElement {
    _event = null;
    @track accounts = [{ id: 1, Name: "account1" }];
    @track boolVar = true;

    @api
    testClickEvent() {
        let domEvent;
        const element = this.template.querySelector("#title");
        element.addEventListener("click", (e) => {
            domEvent = e;
        });
        element.click();
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString(),
            "Expected event param in listener to be a wrapped event");
        testUtil.assertStartsWith("SecureElement", domEvent.target.toString(),
            "Expected event.target to return SecureElement");
        testUtil.assertEquals("click", domEvent.type, "Unexpected DOM event type");
        // Verify non-wrapped method is still accessible
        testUtil.assertEquals("number", typeof domEvent.timeStamp);
    }

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
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString(),
            "Expected event param in listener to be a wrapped event");
        testUtil.assertStartsWith("SecureElement", targetElem.toString(),
            "Expected event.target to return SecureElement");
    }

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
        testUtil.assertDefined(domEvent,
            "Event handler never called after firing event created via document.createEvent");
        testUtil.assertStartsWith("SecureDOMEvent", domEvent.toString(),
            "Expected event param in listener to be a wrapped event");
        testUtil.assertStartsWith("SecureElement", domEvent.target.toString(),
            "Expected event.target to return SecureElement");
        testUtil.assertEquals("SECUREMODULETEST-SECURE-DOM-EVENT", targetElement.tagName,
            "Expected event.target to be retargeted to host");
    }

    @api
    testRemoveEventListenerOnTemplateElement() {
        let domEvent;
        const event = new Event("change");
        const eventFunction = function(e) {
            domEvent = e;
        }

        this.addEventListener("change", eventFunction);
        this.removeEventListener("change", eventFunction);
        this.dispatchEvent(event);

        testUtil.assertUndefined(domEvent,
            "Event handler was called after firing event created via document.createEvent!");
    }

    // W-4462187
    @api
    testEventView() {
        let domEvent;
        const element = this.template.querySelector("#title");
        element.addEventListener("click", (e) => {
            domEvent = e;
        });

        element.click();
        testUtil.assertEquals(window, domEvent.view, "DOMEvent view is not the window");
    }

    @api
    testEventTargetOfHtmlElementHandler() {
        const buttonInMarkup = this.template.querySelector("#buttonInMarkup");
        buttonInMarkup.click();
        this.assertClickHandlerCalled();

        const buttonInIteration = this.template.querySelector("#buttonInIteration");
        buttonInIteration.click();
        this.assertClickHandlerCalled();

        const buttonInIf = this.template.querySelector("#buttonInIf");
        buttonInIf.click();
        this.assertClickHandlerCalled();

        const buttonInNestedIteration = this.template.querySelector("#buttonInNestedIteration");
        buttonInNestedIteration.click();
        this.assertClickHandlerCalled();

        const buttonInFacet = this.template.querySelector("#buttonInFacet");
        buttonInFacet.click();
        this.assertClickHandlerCalled();
    }

    @api
    testInitEventOnElementOfChildModule() {
        const child = this.template.querySelector("#childModule");
        child.testInitEventOnElementOfChildModule();
    }

    @api
    testCustomEvent() {
        let listenerCalled = false;
        this.addEventListener("customevent", event => {
            const eventData = event.detail.welcome;
            testUtil.assertEquals("Hello", eventData[0], "Expected data to be equal to 'Hello'");
            testUtil.assertEquals("World!", eventData[1], "Expected data to be equal to 'World!'");
            listenerCalled = true;
        });

        const testData = {composed: true, detail: {welcome: ["Hello", "World!"]}};
        const customEvt = new CustomEvent("customevent", testData);
        this.dispatchEvent(customEvt);

        testUtil.assertEquals(true, listenerCalled, "Expected custom event to be dispatched.");
    }

    assertClickHandlerCalled() {
        testUtil.assertStartsWith("SecureElement", this._event.target.toString(),
            "Expected event target in listener to be a wrapped element");
        this._event = null;
    }

    handleClick(event) {
        this._event = event;
    }
}