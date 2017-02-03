({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate
     * probing to component the controller, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    testElementQuerySelectorAccessFromLockerized: {
        test: function(cmp) {
            var results = {
        		"#foo": undefined,
        		"#bar": undefined,
        		".foobar": undefined
            };
            
            var contentCmp = cmp.find("content");
            
            contentCmp.elementQuerySelector(["#foo", "#bar", ".foobar"], results);

            $A.test.assertNotNull(results["#foo"], "Expected element.querySelector()"
            + " from user mode to return own elements");
            $A.test.assertNotNull(results["#bar"], "Expected element.querySelector()"
            + " from user mode to return elements in same namespace");
            $A.test.assertEquals("foo", results[".foobar"] && results[".foobar"].id, "Expected element.querySelector()"
            + " from user mode component to select own elements when multiple exist");
        }
    }
})
