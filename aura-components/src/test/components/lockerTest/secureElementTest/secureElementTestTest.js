({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    // TODO(tbliss): make these lists on SecureElement accessible here for maintainablility
    ElementPropertiesWhitelist: ['childElementCount', 'classList', 'className', 'id', 'tagName', 'innerHTML'],
    ElementProperitesBlacklist: ['attributes', 'firstElementChild', 'lastElementChild', 'namespaceURI',
                                 'nextElementSibling', 'previousElementSibling'],

    HTMLPropertiesWhitelist: ['accessKey', 'contentEditable', 'isContentEditable',
                              'dataset', 'dir', 'lang', 'spellcheck', 'style', 'tabIndex', 'title'],

    HTMLPropertiesBlacklist: [],

    OtherPropertiesWhitelist: ["childNodes", "children", "ownerDocument", "parentNode", "offsetParent"],

    MethodsWhitelist: ["appendChild", "addEventListener", "removeEventListener", "dispatchEvent",
                       "getAttribute", "setAttribute", "blur", "click", "focus"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testElementProperties: {
        test: function(cmp) {
            cmp.testElementProperties("title", this.ElementPropertiesWhitelist, this.ElementProperitesBlacklist);
        }
    },

    testInputProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var inputProperties = [
                "type",
                "accept",
                "autocomplete",
                "autofocus",
                //"autosave",
                "checked",
                "disabled",
                "form",
                "formAction",
                "formEnctype",
                "formMethod",
                "formNoValidate",
                "formTarget",
                "height",
                //"inputmode",
                "list",
                "max",
                "maxLength",
                "min",
                //"minLength",
                "multiple",
                "name",
                "pattern",
                "placeholder",
                "readOnly",
                "required",
                "selectionDirection",
                "size",
                "src",
                "step",
                "tabIndex",
                "value",
                "width"];
            cmp.testElementProperties("input", inputProperties, []);
        }
    },

    testHtmlProperties: {
        test: function(cmp) {
            cmp.testHtmlProperties(this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
        }
    },

    // TODO(tbliss): Need special setup to get some of these to be available, need to revisit
    _testOtherProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.OtherPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(name in element);
            });
        }
    },

    testExposedMethods: {
        test: function(cmp) {
            cmp.testExposedMethods(this.MethodsWhitelist);
        }
    },

    testFramesBlocked: {
        test: function(cmp) {
            cmp.testFramesBlocked();
        }
    },

    /**
     * removeEventListener() is special in SecureElement, so besides verifying it's exposed,
     * it also needs to be verified working correctly.
     */
    testRemoveEventListener: {
        test: function(cmp) {
            cmp.testRemoveEventListener(false);
        }
    },

    testRemoveEventListenerWithUseCapture: {
        test: function(cmp) {
            cmp.testRemoveEventListener(true);
        }
    }
})
