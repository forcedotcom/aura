import { Element } from 'engine';
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
}
