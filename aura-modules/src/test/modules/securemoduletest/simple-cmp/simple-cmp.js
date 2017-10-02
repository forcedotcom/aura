import { Element } from "engine";

export default class Simple extends Element {
    @api
    testWindowIsSecure(testUtils) {
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
            + " return SecureWindow in module");
        return true;
    }

    @api
    testDollarAuraNotAccessibleInModules(testUtils) {
        testUtils.assertUndefined($A, "Expected $A to be not accessible in module"); // eslint-disable-line raptor/no-aura, no-undef
        return true;
    }
}
