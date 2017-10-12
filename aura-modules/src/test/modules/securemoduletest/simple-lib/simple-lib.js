import * as testUtil from 'securemoduletest-test-util';

export function testWindowIsSecure() {
    testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
        + " return SecureWindow in library");
    return true;
}

export function testDollarAuraNotAccessibleInModules() {
    testUtil.assertEquals("undefined", typeof $A, "Expected $A to be not accessible in library"); // eslint-disable-line raptor/no-aura
    return true;
}
