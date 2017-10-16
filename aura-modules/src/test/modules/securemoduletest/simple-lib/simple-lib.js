import * as testUtil from 'securemoduletest-test-util';
import { toString } from 'engine';

export function testWindowIsSecure() {
    testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
        + " return SecureWindow in library");
    return true;
}

export function testDollarAuraNotAccessibleInModules() {
    testUtil.assertEquals("undefined", typeof $A, "Expected $A to be not accessible in library"); // eslint-disable-line raptor/no-aura
    return true;
}

export function testEngineIsSecure() {
    testUtil.assertStartsWith("SecureEngine", toString(), "Expected engine to return" +
        "SecureEngine in library");
    return true;
}

export function addition(a, b) {
    return a + b;
}
