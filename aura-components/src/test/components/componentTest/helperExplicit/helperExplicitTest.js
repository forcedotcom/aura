({
    testCallingHelperMethodFromOtherComponent: {
        test: function(cmp) {
            var expected = "Message from Helper Method";
            var actual = cmp.helper.getMessage();

            $A.test.assertEquals(expected, actual);
        }
    },

    testAutowiredHelperIsInaccessibleWhenReuseHelperFromOtherCmp: {
        test: function(cmp) {
            $A.test.assertUndefined(cmp.helper.getMessageFromAutowiredHelperMethod);
        }
    }
})
