import { Element, createElement, toString, track, api } from "engine";
import * as testUtil from 'securemoduletest-test-util';

export default class Simple extends Element {
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
    testEngineIsUnsecure() {
        // Verify that createElement can be accessed
        testUtil.assertDefined(createElement, "Expected to have access to all properties of engine");
        testUtil.assertTrue(toString().indexOf("SecureEngine") === -1, "Expected to not see SecureEngine");
        return true;
    }
}