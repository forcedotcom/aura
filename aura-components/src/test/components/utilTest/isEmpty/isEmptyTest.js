({
    /**
     * Verify util.isEmpty works cross-browser.
     */

    testUndefinedValue: {
        test: function() {
            $A.test.assertTrue($A.util.isEmpty(undefined));
        }
    },

    testNullValue: {
        test: function() {
            $A.test.assertTrue($A.util.isEmpty(null));
        }
    },

    testNumberZero: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty(0));
        }
    },

    testNumberPositive: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty(123));
        }
    },

    testNumberNegative: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty(-123));
        }
    },

    testNotNumber: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty(NaN));
        }
    },

    testStringValue: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty("abc"));
        }
    },

    testZeroLengthString: {
        test: function() {
            $A.test.assertTrue($A.util.isEmpty(""));
        }
    },

    testEmptyArray: {
        test: function() {
            $A.test.assertTrue($A.util.isEmpty([]));
        }
    },

    testArrayOfUndefined: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty([undefined]));
        }
    },

    testArrayOfNull: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty([null]));
        }
    },

    testArrayOfZeroLengthString: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty([""]));
        }
    },

    testArrayOfNumbers: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty([1,2,3]));
        }
    },

    testEmptyObject: {
        test: function() {
            $A.test.assertTrue($A.util.isEmpty({}));
        }
    },

    testObjectWithStringKey: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty({"abc": "def"}));
        }
    },

    testObjectWithNullKey: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty({null: undefined}));
        }
    },

    testArrayOfEmptyObject: {
        test: function() {
            $A.test.assertFalse($A.util.isEmpty([{}]));
        }
    }
})
