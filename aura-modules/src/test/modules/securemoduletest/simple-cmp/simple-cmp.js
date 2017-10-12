import { Element, createElement, toString } from "engine";
import * as testUtil from 'securemoduletest-test-util';

export default class Simple extends Element {
    @api
    testWindowIsSecure() {
        testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
            + " return SecureWindow in module");
        return true;
    }

    @api
    testDollarAuraNotAccessibleInModules() {
        testUtil.assertEquals("undefined", typeof $A, "Expected $A to be not accessible in module"); // eslint-disable-line raptor/no-aura
        return true;
    }

    @api
    testEngineIsSecure() {
        testUtil.assertStartsWith("SecureEngine", toString(), "Expected engine to return" +
            "SecureEngine in module");
        testUtil.assertDefined(Element, "SecureEngine is preventing access to Element in module");
        testUtil.assertUndefined(createElement, "SecureEngine is leaking properties in module");
        return true;
    }
}
