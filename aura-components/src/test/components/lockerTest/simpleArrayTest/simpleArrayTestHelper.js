({
    verifyArrayElements: function(testUtils, expected, actual) {
        testUtils.assertNotUndefinedOrNull(actual);
        testUtils.assertEquals(expected.length, actual.length, "Array length should be " + expected.length);
        for (var i = 0; i < expected.length; i++) {
            testUtils.assertEquals(expected[i], actual[i], "Expected " + expected[i] + " at position " + i + " but found " + actual[i]);
        }
    }
})