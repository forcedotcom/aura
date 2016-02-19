({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    // TODO(tbliss): make these lists on SecureElement accessible here for maintainablility
    ElementPropertiesWhitelist: ['attributes', 'childElementCount', 'classList', 'className', 'id', 'tagName'],
    ElementProperitesBlacklast: ['children', 'firstElementChild', 'innerHTML', 'lastElementChild', 'namespaceURI',
                                 'nextElementSibling', 'previousElementSibling'],

    HTMLPropertiesWhitelist: ['accessKey', 'accessKeyLabel', 'contentEditable', 'isContentEditable',
                              'contextMenu', 'dataset', 'dir', 'draggable', 'dropzone', 'hidden', 'lang', 'spellcheck',
                              'style', 'tabIndex', 'title'],
    HTMLPropertiesBlacklist: ['offsetParent'],

    OtherPropertiesWhitelist: ["childNodes", "children", "innerText", "ownerDocument", "parentNode"],

    MethodsWhitelist: ["appendChild", "addEventListener", "removeEventListener", "dispatchEvent",
                       "getAttribute", "setAttribute", "blur", "click", "focus"],

    testElementProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.ElementPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(element.hasOwnProperty(name));
            });
            this.ElementProperitesBlacklast.forEach(function(name) {
                $A.test.assertFalse(element.hasOwnProperty(name));
            });
        }
    },

    testHtmlProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.HTMLPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(element.hasOwnProperty(name));
            });
            this.HTMLPropertiesBlacklist.forEach(function(name) {
                $A.test.assertFalse(element.hasOwnProperty(name));
            });
        }
    },
    
    // TODO(tbliss): Need special setup to get some of these to be available, need to revisit
    _testOtherProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.OtherPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(element.hasOwnProperty(name));
            });
        }
    },

    testExposedMethods: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.MethodsWhitelist.forEach(function(name) {
                $A.test.assertDefined(element[name]);
            });
        }
    },
})