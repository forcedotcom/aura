import { LightningElement, createElement, api } from "lwc";
import * as testUtil from "securemoduletest/testUtil";
import simpleCmpHtml from "./simpleCmp.html";

export default class Simple extends LightningElement {
    @api literal = "Default literal";
    @api bound = "Default bound";
    @api unbound = "Default unbound";
    @api expression = 'Default expression';
    @api nested = "Default nested";
    @api testRenderer = false;

    render() {
        if (this.testRenderer) {
            // Verify that render method has access to secure wrappers when module included in another LWC module
            testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
                + " return SecureWindow in render method");
            testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
                "Expected $A to be not accessible in render method");
            testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
                + " return SecureDocument in render method");
        }
        return simpleCmpHtml;
    }

    @api
    testWindowIsSecure() {
        testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
            + " return SecureWindow in module");
        return true;
    }

    @api
    testDollarAuraNotAccessibleInModules() {
        testUtil.assertEquals("undefined", typeof $A, "Expected $A to be not accessible in module"); // eslint-disable-line lwc/no-aura
        return true;
    }

    @api
    testLWCIsSecure() {
        testUtil.assertDefined(LightningElement, "SecureLWC is preventing access to LightningElement in module");
        testUtil.assertUndefined(createElement, "SecureLWC is leaking properties in module");
        return true;
    }

    @api
    testContextInPublicMethod() {
        testUtil.assertTrue(this instanceof Simple, "Expected context to be an instance of the component class in module");
    }

    @api
    subtract(a, b) {
        return a - b;
    }
}
