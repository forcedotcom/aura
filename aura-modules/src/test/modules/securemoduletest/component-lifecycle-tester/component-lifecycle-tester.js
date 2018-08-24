import { LightningElement, api } from "lwc";
import * as testUtil from 'securemoduletest-test-util';

const SECURE_ELEMENT_REGEX = /^SecureElement: \[.+\]{ key: {"namespace":"secureModuleTest"} }$/
const isSecureWindow = function(win) {
    testUtil.assertEquals(
        'SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }',
        win.toString(),
        'Expected window to be a SecureWindow'
    );
}

const isSecureDocument = function(doc) {
    testUtil.assertEquals(
        'SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }',
        doc.toString(),
        'Expected window to be a SecureDocument'
    );
}

export default class ComponentLifecycleTester extends LightningElement {
    // Boolean flags to indicate which lifecycle hooks are being tested
    @api shouldTestConstructorHook = false;
    @api shouldTestConnectedCallbackHook = false;
    @api shouldTestDisconnectedCallbackHook = false;
    @api shouldTestAttributeChangedCallbackHook = false;
    @api shouldTestRenderedCallbackHook = false;

    get customEvent() {
        return new CustomEvent('foo', {
            bubbles: true,
            composed: true,
            detail: this.complexDataStructure
        });
    }

    get complexDataStructure() {
        return {           
            domElement: this.template.querySelector('section.component-lifecyle-tester > p'),
            win: window,
            doc: document
        };
    }

    connectedCallback() {
        if (!this.shouldTestConnectedCallbackHook) {
            return;
        }
        // Verify that render method has access to secure wrappers when invoked through interop
        isSecureWindow(window);
        isSecureDocument(document);
        
        testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
            "Expected $A to be not accessible in connectedCallback");        
        testUtil.assertTrue(this instanceof ComponentLifecycleTester,
            "Expected context to be an instance of the component class in connectedCallback");
        const data = this.complexDataStructure;
        testUtil.assertEquals(
            null,
            data.domElement,
            'Mismatch in domElement value'
        );
        isSecureWindow(data.win);
        isSecureDocument(data.doc);
        setTimeout(() => {
            this.dispatchEvent(this.customEvent);
        }, 1000);        
        window.connectedCallbackHookCalled = true;
    }

    disconnectedCallback() {
        if (!this.shouldTestDisconnectedCallbackHook) {
            return;
        }
        // Verify that render method has access to secure wrappers when invoked through interop
        isSecureWindow(window);
        isSecureDocument(document);
        testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
            "Expected $A to be not accessible in disconnectedCallback");
        testUtil.assertTrue(this instanceof ComponentLifecycleTester,
            "Expected context to be an instance of the component class in disconnectedCallback");
        const data = this.complexDataStructure;
        isSecureDocument(data.doc);
        isSecureWindow(data.win);
        testUtil.assertEquals(
            true,
            SECURE_ELEMENT_REGEX.test(data.domElement),
            'Mismatch in domElement value'
        );
        setTimeout(() => {
            this.dispatchEvent(this.customEvent);
        }, 1000);        

        window.disconnectedCallbackHookCalled = true;        
    }

    renderedCallback() {
        if (!this.shouldTestRenderedCallbackHook) {
            return;
        }
        // Verify that render method has access to secure wrappers when invoked through interop
        isSecureWindow(window);
        isSecureDocument(document);
        testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
            "Expected $A to be not accessible in renderedCallback");
        testUtil.assertTrue(this instanceof ComponentLifecycleTester,
            "Expected context to be an instance of the component class in renderedCallback");
        
        const data = this.complexDataStructure;
        isSecureWindow(data.win);
        isSecureDocument(data.doc);
        testUtil.assertEquals(
            true,
            SECURE_ELEMENT_REGEX.test(data.domElement),
            'Mismatch in domElement value'
        );
        setTimeout(() => {
            this.dispatchEvent(this.customEvent);
        }, 1000);        

        window.renderedCallbackHookCalled = true;
    }
}
