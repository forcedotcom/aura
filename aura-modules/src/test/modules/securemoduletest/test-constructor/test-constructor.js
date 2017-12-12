import { Element } from "engine";
import * as testUtil from 'securemoduletest-test-util';

export default class TestConstructor extends Element {
    constructor() {
        super();
        // Verify that render method has access to secure wrappers when invoked through interop
        testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
            + " return SecureWindow in constructor");
        testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
            "Expected $A to be not accessible in constructor");
        testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
            + " return SecureDocument in constructor");
        testUtil.assertTrue(this instanceof TestConstructor,
            "Expected context to be an instance of the component class in constructor");
        window.constructorHookCalled = true;
    }
}