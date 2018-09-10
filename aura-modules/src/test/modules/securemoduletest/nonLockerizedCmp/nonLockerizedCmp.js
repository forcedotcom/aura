import { LightningElement, createElement, toString, track, api } from "lwc";
import * as testUtil from "securemoduletest/testUtil";

export default class Simple extends LightningElement {
    @track message = 'Hello Locker!';

    @api
    testWindowIsUnsecure() {
        if (window.toString().indexOf("SecureWindow") === -1) {
            this.message = "Bye Locker!";
        }
        testUtil.assertTrue(window.toString().indexOf("SecureWindow") === -1, "Expected window to"
            + " return raw window in module");
        return true;
    }

    @api
    testLWCIsUnsecure() {
        // Verify that createElement can be accessed
        testUtil.assertDefined(createElement, "Expected to have access to all properties of engine");
        testUtil.assertTrue(toString().indexOf("SecureLWC") === -1, "Expected to not see SecureLWC");
        return true;
    }
}