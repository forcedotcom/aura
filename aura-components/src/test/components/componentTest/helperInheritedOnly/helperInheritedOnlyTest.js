({
    testCallingHelperMethodWhenCmpOnlyHasInheritedHelper: {
        test: function(cmp) {
            var expected = "Message From Super Component Helper Method";
            var actual = cmp.helper.getMessageFromSuperCmp();

            $A.test.assertEquals(expected, actual);
        }
    },

    testHelperIsDifferentInstanceWithSuperCmpHelperWhenCmpOnlyHasInheritedHelper: {
        test: function(cmp) {
            var superCmp = cmp.getSuper();
            $A.test.assertTrue(superCmp.helper !== cmp.helper,
                    "component helper should has its own helper instance.");
        }
    }
})
