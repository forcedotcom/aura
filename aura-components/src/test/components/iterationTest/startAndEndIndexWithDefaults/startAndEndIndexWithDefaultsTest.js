({
    testStartEndIndexDefaultValues: {
        attributes: { items: [ "a", "b", "c", "d", "e" ], setIndexesInInit: false },
        test: function(cmp) {
            var expected = "0:a,";

            var iteration = cmp.find("iteration");
            var actual = $A.test.getTextByComponent(iteration);

            $A.test.assertEquals(expected, actual, "Iteration is not using start and end indexes from init handler");
        }
    },

    /**
     * Verify start and end indexes set on iteration in init handler override the default attribute values defined in 
     * markup.
     */
    testChangeStartEndIndexesInInit: {
        attributes: { items: [ "a", "b", "c", "d", "e" ], setIndexesInInit: true },
        test: function(cmp) {
            var expected = "1:b,2:c,";

            var iteration = cmp.find("iteration");
            var actual = $A.test.getTextByComponent(iteration);

            $A.test.assertEquals(expected, actual, "Iteration is not using start and end indexes from init handler");
        }
    }
})