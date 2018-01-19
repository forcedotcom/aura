import { Element, api } from "engine";
import * as testUtil from 'securemoduletest-test-util';

export default class ElementImporter extends Element {
    @api
    testDefiningNewPropertiesOnElement() {
        let obj = {};
        try {
            // Because rollup prevents direct manipulation of imports, using this technique as a workaround
            obj = Element;
            obj.foo = "bar";
            testUtil.fail("Expandos should not be allowed on Element");
        } catch (e) { /* Expected*/ }
        testUtil.assertUndefined(Element.foo, "Expandos should not be allowed on Element");
        try {
            Object.defineProperty(Element, "foo", {value : "bar"});
            testUtil.fail("Defining new properties on Element should fail");
        } catch (e) { /* Expected */ }
        testUtil.assertUndefined(Element.foo, "Expected to not be able to define new properties on engine");
        // May be only this check is sufficient?
        testUtil.assertFalse(Object.isExtensible(Element), "Element is expected to be immutable");
        return true;
    }

    @api
    testModifyExistingPropertiesOnElement() {
        const originalElement = Element.name;
        try {
            Object.defineProperty(Element, "name", {value : "bar"});
            testUtil.fail("Redefining new properties on Element should fail");
        } catch (e) { /* Expected */ }
        testUtil.assertEquals(originalElement, Element.name, "Element properties are changed");
        return true;
    }
}