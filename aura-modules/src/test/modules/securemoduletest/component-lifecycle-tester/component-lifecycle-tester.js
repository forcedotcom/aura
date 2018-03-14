import { Element, api } from 'engine';
import * as testUtil from 'securemoduletest-test-util';

export default class ComponentLifecycleTester extends Element {
    // Boolean flags to indicate which lifecycle hooks are being tested
    @api shouldTestConstructorHook = false;
    @api shouldTestConnectedCallbackHook = false;
    @api shouldTestDisconnectedCallbackHook = false;
    @api shouldTestAttributeChangedCallbackHook = false;
    @api shouldTestRenderedCallbackHook = false;

    connectedCallback() {
        if (this.shouldTestConnectedCallbackHook) {
            // Verify that render method has access to secure wrappers when invoked through interop
            testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
                + " return SecureWindow in connectedCallback");
            testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
                "Expected $A to be not accessible in connectedCallback");
            testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
                + " return SecureDocument in connectedCallback");
            testUtil.assertTrue(this instanceof ComponentLifecycleTester,
                "Expected context to be an instance of the component class in connectedCallback");
            window.connectedCallbackHookCalled = true;
        }
    }

    disconnectedCallback() {
        if (this.shouldTestDisconnectedCallbackHook) {
            // Verify that render method has access to secure wrappers when invoked through interop
            testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
                + " return SecureWindow in disconnectedCallback");
            testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
                "Expected $A to be not accessible in disconnectedCallback");
            testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
                + " return SecureDocument in disconnectedCallback");
            testUtil.assertTrue(this instanceof ComponentLifecycleTester,
                "Expected context to be an instance of the component class in disconnectedCallback");
            window.disconnectedCallbackHookCalled = true;
        }
    }

    renderedCallback() {
        if (this.shouldTestRenderedCallbackHook) {
            // Verify that render method has access to secure wrappers when invoked through interop
            testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
                + " return SecureWindow in renderedCallback");
            testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
                "Expected $A to be not accessible in renderedCallback");
            testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
                + " return SecureDocument in renderedCallback");
            testUtil.assertTrue(this instanceof ComponentLifecycleTester,
                "Expected context to be an instance of the component class in renderedCallback");
            window.renderedCallbackHookCalled = true;
        }
    }
}
