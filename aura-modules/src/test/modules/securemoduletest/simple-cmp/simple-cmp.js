import { Element, createElement, toString } from "engine";

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

    @api
    testEngineIsSecure(testUtils) {
        testUtils.assertStartsWith("SecureEngine", toString(), "Expected engine to return" +
            "SecureEngine in module");
        testUtils.assertDefined(Element, "SecureEngine is preventing access to Element in module");
        testUtils.assertUndefined(createElement, "SecureEngine is leaking properties in module");
        return true;
    }
}
