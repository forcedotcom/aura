import { LightningElement, api } from "lwc";
import * as testUtil from 'securemoduletest-test-util';

export default class ElementImporter extends LightningElement {
    @api
    testDefiningNewPropertiesOnElement() {
        let obj = {};
        try {
            // Because rollup prevents direct manipulation of imports, using this technique as a workaround
            obj = LightningElement;
            obj.foo = "bar";
            testUtil.fail("Expandos should not be allowed on Element");
        } catch (e) { /* Expected*/ }
        testUtil.assertUndefined(LightningElement.foo, "Expandos should not be allowed on Element");
        try {
            Object.defineProperty(LightningElement, "foo", {value : "bar"});
            testUtil.fail("Defining new properties on Element should fail");
        } catch (e) { /* Expected */ }
        testUtil.assertUndefined(LightningElement.foo, "Expected to not be able to define new properties on engine");
        // May be only this check is sufficient?
        testUtil.assertFalse(Object.isExtensible(LightningElement), "Element is expected to be immutable");
        return true;
    }

    @api
    testModifyExistingPropertiesOnElement() {
        const originalElement = LightningElement.name;
        try {
            Object.defineProperty(LightningElement, "name", {value : "bar"});
            testUtil.fail("Redefining new properties on Element should fail");
        } catch (e) { /* Expected */ }
        testUtil.assertEquals(originalElement, LightningElement.name, "Element properties are changed");
        return true;
    }
}