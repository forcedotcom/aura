({
    testUsingLibraryFunctionWhenComponentOnlyInheritsHelper: {
        test: function(cmp) {
            var expected = "Message from Library Function";
            var lib = cmp.helper.libraryTestLib;

            $A.test.assertNotUndefinedOrNull(lib, "Library does NOT exist in helper.");
            $A.test.assertTrue($A.util.isFunction(lib.Basic.getMessage));
            var actual = lib.Basic.getMessage();
            $A.test.assertEquals(expected, actual);
        }
    },

    testLibraryNotExistsInSuperCmpHelperWhenComponentOnlyInheritsHelper: {
        test: function(cmp) {
            var targetComponent = cmp.getSuper();
            var lib = targetComponent.helper.libraryTestLib;

            $A.test.assertUndefined(lib, "Library should NOT exist in super component's helper.");
        }
    }
})
