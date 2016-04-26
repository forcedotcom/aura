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

    HTMLPropertiesWhitelist: ['accessKey', 'accessKeyLabel', 'contentEditable', 'isContentEditable',
                              'contextMenu', 'dataset', 'dir', 'draggable', 'dropzone', 'hidden', 'lang', 'spellcheck',
                              'style', 'tabIndex', 'title'],
    
    HTMLPropertiesBlacklist: [],

    OtherPropertiesWhitelist: ["childNodes", "children", "ownerDocument", "parentNode", "offsetParent"],

    MethodsWhitelist: ["appendChild", "addEventListener", "removeEventListener", "dispatchEvent",
                       "getAttribute", "setAttribute", "blur", "click", "focus"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testElementProperties: {
        test: function(cmp) {
            cmp.testElementProperties(this.ElementPropertiesWhitelist, this.ElementProperitesBlacklist);
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
})
