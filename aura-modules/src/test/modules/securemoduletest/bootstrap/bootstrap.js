import { Element, createElement, toString } from 'engine';

export default class Bootstrap extends Element {
    @api
    testWindowIsSecure(testUtils) {
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
         + " return SecureWindow in interop component");
        const simpleCmp = this.root.querySelector("#securemoduletest-simple-cmp");
        return simpleCmp.testWindowIsSecure(testUtils);
    }

    @api
    testDollarAuraNotAccessibleInModules(testUtils) {
        testUtils.assertUndefined($A, "Expected $A to be not accessible in interop component"); // eslint-disable-line raptor/no-aura, no-undef
        // modules can access $A through window and we are hoping to catch that while linting modules.
        // It was a conscious decision to not block $A on window for the sake of performance
        // testUtils.assertUndefined(window.$A);
        const simpleCmp = this.root.querySelector("#securemoduletest-simple-cmp");
        return simpleCmp.testDollarAuraNotAccessibleInModules(testUtils);
    }

    @api
    testEngineIsSecure(testUtils) {
        testUtils.assertStartsWith("SecureEngine", toString(), "Expected engine to return" +
            "SecureEngine in interop component");
        testUtils.assertDefined(Element, "SecureEngine is preventing access to Element in interop component");
        testUtils.assertUndefined(createElement, "SecureEngine is leaking properties in interop component");
        const simpleCmp = this.root.querySelector("#securemoduletest-simple-cmp");
        return simpleCmp.testDollarAuraNotAccessibleInModules(testUtils);
    }
}
