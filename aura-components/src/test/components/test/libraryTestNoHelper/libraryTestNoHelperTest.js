({
    testUsingLibraryFunctionWhenComponentHasNoDefinedHelper: {
        test: function(cmp) {
            var expected = "Message from Library Function";
            var lib = cmp.helper.libraryTestLib;

            $A.test.assertNotUndefinedOrNull(lib, "Library does NOT exist in helper.");
            $A.test.assertTrue($A.util.isFunction(lib.Basic.getMessage));
            var actual = lib.Basic.getMessage();
            $A.test.assertEquals(expected, actual);
        }
    },
})
