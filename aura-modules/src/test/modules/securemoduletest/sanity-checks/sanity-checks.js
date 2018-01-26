import { Element, api } from 'engine';
import * as testUtil from 'securemoduletest-test-util';
import * as helper from './helper.js';
import sanityChecksHtml from './sanity-checks.html';

export default class SanityChecks extends Element {
    @api testRenderer = false;

    render() {
        if (this.testRenderer) {
            // Verify that render method has access to secure wrappers when invoked through interop
            testUtil.assertStartsWith("SecureWindow", window.toString(), "Expected window to"
                + " return SecureWindow in render method");
            testUtil.assertEquals("undefined", typeof $A, // eslint-disable-line lwc/no-aura
                "Expected $A to be not accessible in render method");
            testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
                + " return SecureDocument in render method");
        }
        return sanityChecksHtml;
    }
    @api
    testCanAccessDocumentBodyFromInternalLib() {
        helper.testCanAccessDocumentBodyFromInternalLib();
    }

    @api
    testCanAccessDocumentHeadFromInternalLib() {
        helper.testCanAccessDocumentHeadFromInternalLib();
    }

    @api
    testWindowIsSecureInInternalLib() {
        helper.testWindowIsSecureInInternalLib();
    }

    @api
    testDollarAuraNotAccessibleInInternalLib() {
        helper.testDollarAuraNotAccessibleInInternalLib();
    }

    @api
    testEngineIsSecureInInternalLib() {
        helper.testEngineIsSecureInInternalLib();
    }

    @api
    testDocumentIsSecure() {
        testUtil.assertStartsWith("SecureDocument", document.toString(), "Expected document to"
            + " return SecureDocument in module");
    }

    @api
    testDocumentIsSecureInInternalLib() {
        helper.testDocumentIsSecureInInternalLib();
    }

    @api
    testAppendDynamicallyCreatedDivToMarkup() {
        const contentEl = this.root.querySelector("#content");
        let div = document.createElement("div");
        div.id = "myId";
        div.className = "fancypants";
        contentEl.appendChild(div);

        div = this.root.querySelector("#content");
        const appendedDiv = div.childNodes[0];
        testUtil.assertEquals("myId", appendedDiv.id);
        testUtil.assertEquals("fancypants", appendedDiv.className);
    }

    @api
    testContextInModule() {
        // Public method invoked via interop
        testUtil.assertTrue(this instanceof SanityChecks, "Expected context to be an instance of the component class in interop layer");
        // Public method invoked on internal library
        helper.testContextInModuleInternalLib();
        // Public method invoked on facet
        const simpleCmp = this.root.querySelector("#securemoduletest-simple-cmp");
        simpleCmp.testContextInPublicMethod();
    }

    // Reference W-2961201
    @api
    testDefineGetterExploit() {
        const defprop = ({}).__defineGetter__;

        // Without our patch:
        // - On Safari the defineGetter call errors with
        //   "TypeError: undefined is not an object"
        // - On Firefox the defineGetter call errors with
        //   "TypeError: can't convert undefined to object"
        // - On Chrome, the property is defined on window.
        // With our patch:
        // - On all browsers, we should get somehting along the lines
        //   "TypeError: Object.defineProperty called on non-object".
        // See https://github.com/tc39/ecma262/issues/907
        try {
            // This might not fail, the TC39 specifications appear to have a
            // but. We might be checking for a side effect by expecting an
            // error. See https://github.com/tc39/ecma262/issues/907
            defprop('FOO', function () {
                return this;
            });
        } catch (e) {
            // Checking for the error message is incorrect: many situations can
            // create that error (for example, a coding error in our secure
            // implementation can generate an error of any type), and the error
            // messages are too inconsistent to be reliable (we might disable
            // our workaround for the platform that behave properly).
        }

        // The exploit we need to guard against is the creation of a property
        // FOO accessible in the current context (and giving us access to window).
        testUtil.assertTrue(typeof FOO === 'undefined', "And unexpected property FOO was found in the current context");
    }

    @api
    testSetTimeoutNonFunctionParamExploit() {
        try {
            setTimeout({ bind: () => {
                return () => {
                    alert(this); // eslint-disable-line no-alert
                };
            }});
            testUtil.fail("setTimeout with a non-function parameter should throw error");
        } catch (e) {
            testUtil.assertStartsWith("TypeError", e.toString(), "Unexpected error. Expected TypeError, got " + e);
        }
    }

    @api
    testLocationExposed() {
        testUtil.assertDefined(location, "Expected location to be defined");
    }

    @api
    testCtorAnnotation() {
        const audio = new Audio();
        testUtil.assertStartsWith("SecureElement", audio.toString(), "Expected result of new Audio() to be a SecureElement");
        testUtil.assertTrue(audio.toString().indexOf("HTMLAudioElement") > 0, "Expected result of new Audio() to be an HTMLAudioElement");
    }

    @api
    testSecureElementPrototypeCounterMeasures() {
        // Try to access the internal prototype of a SecureElement
        const el = this.root.querySelector("#content");
        const prototype = Object.getPrototypeOf(el);
        testUtil.assertTrue(prototype === HTMLDivElement.prototype); // Will start failing once W-4184609 or W-4180046 or W-4274468 is fixed
    }
    @api
    testInstanceOf() {
        let array = new Array(); // eslint-disable-line no-array-constructor
        let o = new Object(); // eslint-disable-line no-new-object
        const date = new Date();
        const element = document.createElement("div");

        // Test Object
        testUtil.assertTrue(o instanceof Object, "Object created via 'new Object()' should be an instance of Object");

        o = Object.create(Object.prototype);
        testUtil.assertTrue(o instanceof Object, "Object created via 'Object.create(null)'  should be an instance of Object");

        o = {};
        testUtil.assertTrue(o instanceof Object, "Object created via object literal should be an instance of Object");

        // Test Function
        function foo() {
            return "foo";
        }

        testUtil.assertTrue(foo instanceof Function, "Function foo() should be an instance of Function");

        // Test Array
        testUtil.assertTrue(array instanceof Array, "Array created via 'new Array()' should be an instance of Array");

        array = [1, 2, 3];
        testUtil.assertTrue(array instanceof Array, "Array created via array literal should be an instance of Array");

        // Test Date
        testUtil.assertTrue(date instanceof Date, "Array created via 'new Date()' should be an instance of Date");

        // Test Element
        testUtil.assertTrue(element instanceof HTMLDivElement, "DIV element should be an instance of HTMLDivElement");
        testUtil.assertTrue(element instanceof HTMLElement, "DIV element should be an instance of HTMLElement");
        // Because LWC is redefining the Element class
        testUtil.assertTrue(element instanceof window.Element, "DIV element should be an instance of Element");
        testUtil.assertTrue(element instanceof Node, "DIV element should be an instance of Node");
        testUtil.assertTrue(element instanceof EventTarget, "DIV element should be an instance of EventTarget");
    }
}

