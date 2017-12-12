import * as testUtil from 'securemoduletest-test-util';
import { toString } from 'engine';

export function testCanAccessDocumentBodyFromInternalLib() {
    verifySharedSecureElement("body");
}

export function testCanAccessDocumentHeadFromInternalLib() {
    verifySharedSecureElement("head");
}

export function testWindowIsSecureInInternalLib() {
    testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
        + " return SecureWindow in internal library");
}

export function testDollarAuraNotAccessibleInInternalLib() {
    testUtil.assertEquals("undefined", typeof $A, "Expected $A to be not accessible in internal library"); // eslint-disable-line lwc/no-aura
}

export function testEngineIsSecureInInternalLib() {
    testUtil.assertStartsWith("SecureEngine", toString(), "Expected engine to return" +
        "SecureEngine in internal library");
}

export function testDocumentIsSecureInInternalLib() {
    testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
        + " return SecureDocument in internal library");
}

export function testContextInModuleInternalLib() {
    testUtil.assertUndefined(this, "Internal Library: 'this' should be undefined");
}

function verifySharedSecureElement(property) {
    const el = document[property];
    testUtil.assertStartsWith("SecureElement", el.toString(), "Expected document." + property + " in internal helper to be a SecureElement");

    try {
        el.innerHTML = "<div>Should throw an Aura exception</div>"; // eslint-disable-line lwc/no-inner-html
        testUtil.fail("Should not be able to set innerHTML property on shared SecureElement: " + property);
    } catch (e) {
        testUtil.assertEquals("SecureElement.innerHTML cannot be used with " + property.toUpperCase() + " elements!", e.toString());
    }
}