({
    testCallingHelperMethodWhenCmpOnlyHasInheritedHelper: {
        test: function(cmp) {
            var expected = "Message From Super Component Helper Method";
            var actual = cmp.helper.getMessageFromSuperCmp();

            $A.test.assertEquals(expected, actual);
        }
    }
})
