({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate
     * probing to component the controller, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    testDocumentQuerySelectorAccessFromLockerizedFirst: {
        test: function(cmp) {
        	var results = {
        		"#foo": undefined,
        		"#bar": undefined,
        		".foobar": undefined
            };
    	
            var fooCmp = cmp.find("foo");
            fooCmp.documentQuerySelector(["#foo", "#bar", ".foobar"], results);

            $A.test.assertNotNull(results["#foo"], "Expected document.querySelector()"
            + " from user mode to return own elements");
            $A.test.assertNotNull(results["#bar"], "Expected document.querySelector()"
            + " from user mode to return elements in same namespace");
            $A.test.assertEquals("foo", results[".foobar"] && results[".foobar"].id, "Expected document.querySelector()"
            + " from user mode component to select own elements when multiple exist");
        }
    },

    testDocumentQuerySelectorAccessFromLockerizedSecond: {
        test: function(cmp) {
        	var results = {
        		"#foo": undefined,
        		"#bar": undefined,
        		".foobar": undefined
            };
        	
            var barCmp = cmp.find("bar");
            barCmp.documentQuerySelector(["#foo", "#bar", ".foobar"], results);

            $A.test.assertNotNull(results["#foo"], "Expected document.querySelector()"
            + " from user mode to return own elements");
            $A.test.assertNotNull(results["#bar"], "Expected document.querySelector()"
            + " from user mode to return elements in same namespace");
            $A.test.assertEquals("foo", results[".foobar"] && results[".foobar"].id, "Expected document.querySelector()"
            + " from lockerized component to select own elements when multiple exist");
        }
    }
})
