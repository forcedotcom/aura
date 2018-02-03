import * as testUtil from 'securemoduletest-test-util';
// LWC does not currently support * imports from engine.
import * as engineAlias from 'engine';

export function testDefiningNewPropertiesOnEngine() {
    let obj = {};
    try {
        // Because rollup prevents direct manipulation of imports, using this technique as a workaround
        obj = engineAlias;
        obj.foo = "bar";
        testUtil.fail("Expandos should not be allowed on engine");
    } catch (e) {
        // Expected
    }
    testUtil.assertUndefined(engineAlias.foo, "Expandos should not be allowed on engine");
    try {
        Object.defineProperty(engineAlias, "foo", {value : "bar"});
        testUtil.fail("Defining new properties on engine should fail");
    } catch (e) {
        // Expected
    }
    testUtil.assertUndefined(engineAlias.foo, "Expected to not be able to define new properties on engine");
    // May be only this check is sufficient?
    testUtil.assertFalse(Object.isExtensible(engineAlias), "Engine is expected to be immutable");
    return true;
}

export function testModifyExistingPropertiesOnEngine() {
    const originalElement = engineAlias.Element;
    try {
        Object.defineProperty(engineAlias, "Element", {value : "bar"});
    } catch (e) {
        // Expected
    }
    testUtil.assertEquals(originalElement, engineAlias.Element, "engine properties are changed");
    return true;
}