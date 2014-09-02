/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.impl.expression.functions;

import static org.auraframework.impl.expression.functions.BooleanFunctions.AND;
import static org.auraframework.impl.expression.functions.BooleanFunctions.NOT;
import static org.auraframework.impl.expression.functions.BooleanFunctions.OR;
import static org.auraframework.impl.expression.functions.MathFunctions.ABSOLUTE;
import static org.auraframework.impl.expression.functions.MathFunctions.DIVIDE;
import static org.auraframework.impl.expression.functions.MathFunctions.GREATER_THAN;
import static org.auraframework.impl.expression.functions.MathFunctions.GREATER_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.MathFunctions.LESS_THAN;
import static org.auraframework.impl.expression.functions.MathFunctions.LESS_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.MathFunctions.MODULUS;
import static org.auraframework.impl.expression.functions.MathFunctions.MULTIPLY;
import static org.auraframework.impl.expression.functions.MathFunctions.NEGATE;
import static org.auraframework.impl.expression.functions.MathFunctions.SUBTRACT;
import static org.auraframework.impl.expression.functions.MultiFunctions.ADD;
import static org.auraframework.impl.expression.functions.MultiFunctions.EQUALS;
import static org.auraframework.impl.expression.functions.MultiFunctions.NOTEQUALS;
import static org.auraframework.impl.expression.functions.MultiFunctions.TERNARY;

import org.auraframework.impl.expression.AuraImplExpressionTestCase;

import com.google.common.collect.Lists;

/**
 * Basic tests of functions
 * 
 */
public class FunctionsTest extends AuraImplExpressionTestCase {
    public FunctionsTest(String name) {
        super(name);
    }

    private Object evaluate(Function f, Object... args) {
        return f.evaluate(Lists.newArrayList(args));
    }

    public void testAddTwoDoubles() throws Exception {
        assertEquals(3146431.43266 + 937.1652, evaluate(ADD, 3146431.43266, 937.1652));
    }

    public void testAddTwoStrings() throws Exception {
        assertEquals("12", evaluate(ADD, "1", "2"));
    }

    public void testAddIntAndDouble() throws Exception {
        assertEquals(314 + 3146431.43266, evaluate(ADD, 314, 3146431.43266));
    }

    /**
     * add() always returns a Double.
     */
    public void testAddTwoInts() throws Exception {
        assertEquals(235639.0, evaluate(ADD, 314, 235325));
    }

    public void testAddInfinityAndInt() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ADD, Double.POSITIVE_INFINITY, 235325));
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ADD, Float.POSITIVE_INFINITY, 235325));
    }

    public void testAddInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(ADD, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Double.NaN, evaluate(ADD, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    public void testAddIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(ADD, 314, Double.NaN));
    }

    public void testAddOverflow() throws Exception {
        assertEquals(Double.MAX_VALUE, evaluate(ADD, Double.MAX_VALUE, 2.0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddStringAndDouble() throws Exception {
        assertEquals("0937.1652", evaluate(ADD, "0", 937.1652));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddZeroAndString() throws Exception {
        assertEquals("01", evaluate(ADD, 0, "1"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddIntAndEmptyString() throws Exception {
        assertEquals("314", evaluate(ADD, 314, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddEmptyStringAndInt() throws Exception {
        assertEquals("314", evaluate(ADD, "", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddInfinityAndString() throws Exception {
        assertEquals("InfinityAndBeyond", evaluate(ADD, Double.POSITIVE_INFINITY, "AndBeyond"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddStringAndNegativeInfinity() throws Exception {
        assertEquals("Random-Infinity", evaluate(ADD, "Random", Double.NEGATIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddStringAndNaN() throws Exception {
        assertEquals("1NaN", evaluate(ADD, "1", Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddNullAndInt() throws Exception {
        assertEquals(1, evaluate(ADD, null, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddNullAndString() throws Exception {
        assertEquals("b", evaluate(ADD, null, "b"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddNullAndDouble() throws Exception {
        assertEquals(2.5, evaluate(ADD, null, 2.5));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddStringAndNull() throws Exception {
        assertEquals("c", evaluate(ADD, "c", null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAddTwoNulls() throws Exception {
        assertEquals("", evaluate(ADD, null, null));
    }

    public void testEqualsSameIntAndDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, 2, 2.0));
    }

    public void testEqualsSameString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, "bum", "bum"));
    }

    public void testEqualsStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "Bum", "bum"));
    }

    public void testEqualsDifferentInts() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, 1, 3));
    }

    public void testEqualsDifferentBooleans() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Boolean.TRUE, Boolean.FALSE));
    }

    public void testEqualsSameBooleans() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Boolean.FALSE, Boolean.FALSE));
    }

    public void testEqualsEmptyStringAndFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "", Boolean.FALSE));
    }

    public void testEqualsPositiveInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testEqualsNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    public void testEqualsPositiveAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    public void testEqualsDoubleInfinityAndFloatInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testEqualsNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Double.NaN, Double.NaN));
    }

    public void testEqualsStringNullAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "null", null));
    }

    public void testEqualsNullAndBooleanTrue() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, Boolean.TRUE));
    }

    public void testEqualsNullAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, Boolean.FALSE));
    }

    public void testEqualsNullAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, ""));
    }

    public void testEqualsNullAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, 0));
    }

    public void testEqualsNullAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, null, null));
    }

    public void testEqualsNullAndStringNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, "null"));
    }

    public void testNotEqualsDifferentBooleans() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, Boolean.FALSE, Boolean.TRUE));
    }

    public void testNotEqualsSameBoolean() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOTEQUALS, Boolean.FALSE, Boolean.FALSE));
    }

    public void testNotEqualsZeroAndStringZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, 0, "0"));
    }

    public void testNotEqualsZeroAndBoolean() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, 0, Boolean.FALSE));
    }

    public void testNotEqualsTwoNaNs() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, Double.NaN, Double.NaN));
    }

    public void testNotEqualsTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOTEQUALS, null, null));
    }

    public void testTernaryTrueReturnString() throws Exception {
        assertEquals("1", evaluate(TERNARY, Boolean.TRUE, "1", "2"));
    }

    public void testTernaryFalseReturnString() throws Exception {
        assertEquals("2", evaluate(TERNARY, Boolean.FALSE, "1", "2"));
    }

    public void testTernaryTrueReturnNull() throws Exception {
        assertEquals(null, evaluate(TERNARY, Boolean.TRUE, null, "2"));
    }

    public void testTernaryFalseReturnNull() throws Exception {
        assertEquals(null, evaluate(TERNARY, Boolean.FALSE, "1", null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryNull() throws Exception {
        assertEquals("2", evaluate(TERNARY, null, "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryStringTrue() throws Exception {
        assertEquals("1", evaluate(TERNARY, "true", "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryZero() throws Exception {
        assertEquals("2", evaluate(TERNARY, 0, "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryDouble() throws Exception {
        assertEquals("1", evaluate(TERNARY, 3146431.43266, "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryStringZero() throws Exception {
        assertEquals("1", evaluate(TERNARY, "0", "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryStringFalse() throws Exception {
        assertEquals("1", evaluate(TERNARY, "false", "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryEmptyString() throws Exception {
        assertEquals("2", evaluate(TERNARY, "", "1", "2"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testTernaryNaN() throws Exception {
        assertEquals("2", evaluate(TERNARY, Double.NaN, "1", "2"));
    }

    public void testSubtractDoubleAndNegativeDouble() throws Exception {
        assertEquals(937.1652 - -8426.6, evaluate(SUBTRACT, 937.1652, -8426.6));
    }

    public void testSubtractPositiveInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
        assertEquals(Double.NaN, evaluate(SUBTRACT, Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testSubtractIntAndStringInt() throws Exception {
        assertEquals(null, evaluate(SUBTRACT, 1, "1"));
    }

    public void testSubtractIntAndDouble() throws Exception {
        assertEquals(0.0, evaluate(SUBTRACT, 2, 2.0));
    }

    public void testSubtractInfinityAndInt() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(SUBTRACT, Double.POSITIVE_INFINITY, 2));
    }

    public void testSubtractIntAndInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(SUBTRACT, 3, Double.POSITIVE_INFINITY));
    }

    public void testSubtractIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, 3, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, 3, "5c"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractIntAndEmptyString() throws Exception {
        assertEquals(3, evaluate(SUBTRACT, 3, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, "5c", 3));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractEmptyStringAndInt() throws Exception {
        assertEquals(-3, evaluate(SUBTRACT, "", 3));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractTwoEmptyStrings() throws Exception {
        assertEquals(0, evaluate(SUBTRACT, "", ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractIntAndStringInt() throws Exception {
        assertEquals(2, evaluate(SUBTRACT, 3, "1"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractStringIntAndInt() throws Exception {
        assertEquals(3, evaluate(SUBTRACT, "4", 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractTwoStringInts() throws Exception {
        assertEquals(-2, evaluate(SUBTRACT, "3", "5"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractIntAndNull() throws Exception {
        assertEquals(2, evaluate(SUBTRACT, 2, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractNullAndDouble() throws Exception {
        assertEquals(-3.1, evaluate(SUBTRACT, null, 3.1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testSubtractTwoNulls() throws Exception {
        assertEquals(0, evaluate(SUBTRACT, null, null));
    }

    public void testMultiplyIntAndDouble() throws Exception {
        assertEquals(1.1, evaluate(MULTIPLY, 1, 1.1));
    }

    public void testMultiplyZeroAndInt() throws Exception {
        assertEquals(0.0, evaluate(MULTIPLY, 0, 3));
    }

    public void testMultiplyNegativeIntAndNegativeDouble() throws Exception {
        assertEquals(0.2, evaluate(MULTIPLY, -2, -0.1));
    }

    public void testMultiplyToGetToInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(MULTIPLY, 1e200, 1e200));
    }

    public void testMultiplyToGetToNegativeInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(MULTIPLY, -1e200, 1e200));
    }

    public void testMultiplyPositiveInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(MULTIPLY, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testMultiplyZeroAndInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 0, Double.POSITIVE_INFINITY));
    }

    public void testMultiplyIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 1, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 5, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, "5o", 9));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyTwoStrings() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, "5o", "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyIntAndStringDouble() throws Exception {
        assertEquals(2.2, evaluate(MULTIPLY, 2, "1.1"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyStringIntAndStringDouble() throws Exception {
        assertEquals("21.7", evaluate(MULTIPLY, "7", "3.1"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyIntAndNull() throws Exception {
        assertEquals(0, evaluate(MULTIPLY, 3, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyNullAndNegativeDouble() throws Exception {
        assertEquals(0, evaluate(MULTIPLY, null, -0.1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testMultiplyTwoNulls() throws Exception {
        assertEquals(0, evaluate(MULTIPLY, null, null));
    }

    public void testDivideDoubleAndNegativeDouble() throws Exception {
        assertEquals(3146431.43266 / -8426.6, evaluate(DIVIDE, 3146431.43266, -8426.6));
    }

    public void testDivideTwoInts() throws Exception {
        assertEquals(1.5, evaluate(DIVIDE, 3, 2));
    }

    public void testDivideTwoZeros() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 0, 0));
    }

    public void testDivideIntAndZero() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(DIVIDE, 5, 0));
    }

    public void testDivideNegativeIntAndZero() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(DIVIDE, -5, 0));
    }

    public void testDivideTwoInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testDivideIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 1, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, "5o", 3));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 3, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideTwoStrings() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, "5.5", "1.1"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideIntAndInfinity() throws Exception {
        assertEquals(0, evaluate(DIVIDE, 5, Double.NEGATIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideIntAndNull() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(DIVIDE, 3, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideNullAndInt() throws Exception {
        assertEquals(0, evaluate(DIVIDE, null, 3));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testDivideTwoNulls() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, null, null));
    }

    public void testModulusDoubleAndNegativeDouble() throws Exception {
        assertEquals(3146431.43266 % -8426.6, evaluate(MODULUS, 3146431.43266, -8426.6));
    }

    public void testModulusIntAndZero() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, 0));
    }

    public void testModulusZeroAndInt() throws Exception {
        assertEquals(0.0, evaluate(MODULUS, 0, 3));
    }

    public void testModulusTwoZeros() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 0, 0));
    }

    public void testModulusIntAndInfinity() throws Exception {
        assertEquals(3.0, evaluate(MODULUS, 3, Double.POSITIVE_INFINITY));
    }

    public void testModulusInfinityAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, Double.POSITIVE_INFINITY, 3));
    }

    public void testModulusIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 1, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testModulusIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testModulusTwoStrings() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, "23", "4"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testModulusIntAndNull() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testModulusNullAndInt() throws Exception {
        assertEquals(0, evaluate(MODULUS, null, 3));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testModulusTwoNulls() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, null, null));
    }

    public void testAbsoluteValueDouble() throws Exception {
        assertEquals(Math.abs(3146431.43266), evaluate(ABSOLUTE, 3146431.43266));
    }

    public void testAbsoluteValueNegativeDouble() throws Exception {
        assertEquals(Math.abs(-8426.6), evaluate(ABSOLUTE, -8426.6));
    }

    public void testAbsoluteValueNegativeInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ABSOLUTE, Double.NEGATIVE_INFINITY));
    }

    public void testAbsoluteValueNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(ABSOLUTE, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAbsoluteValueNegativeIntString() throws Exception {
        assertEquals(5, evaluate(ABSOLUTE, "-5"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAbsoluteValueString() throws Exception {
        assertEquals(Double.NaN, evaluate(ABSOLUTE, "-5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAbsoluteValueEmptyString() throws Exception {
        assertEquals(0, evaluate(ABSOLUTE, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAbsoluteValueNull() throws Exception {
        assertEquals(0, evaluate(ABSOLUTE, (Object) null));
    }

    public void testNegatePositiveDouble() throws Exception {
        assertEquals(-3146431.43266, evaluate(NEGATE, 3146431.43266));
    }

    public void testNegateNegativeDouble() throws Exception {
        assertEquals(8426.6, evaluate(NEGATE, -8426.6));
    }

    public void testNegateInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(NEGATE, Double.POSITIVE_INFINITY));
    }

    public void testNegateNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(NEGATE, Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testNegateString() throws Exception {
        assertEquals(Double.NaN, evaluate(NEGATE, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testNegateStringInt() throws Exception {
        assertEquals(-5, evaluate(NEGATE, "5"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testNegateStringEmptyString() throws Exception {
        assertEquals(0, evaluate(NEGATE, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testNegateStringNull() throws Exception {
        assertEquals(0, evaluate(NEGATE, (Object) null));
    }

    public void testGreaterThanTwoDoubles() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, 3146431.43266, 937.1652));
    }

    public void testGreaterThanSameDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 3146431.43266, 3146431.43266));
    }

    public void testGreaterThanNegativeDoubleAndDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, -8426.6, 937.1652));
    }

    public void testGreaterThanInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testGreaterThanZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 0, Double.NaN));
    }

    public void testGreaterThanInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testGreaterThanNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, 0));
    }

    public void testGreaterThanNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, Double.POSITIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 9000, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "5o", 4));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanTwoStrings() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, "5o", "4o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanTwoStringInts() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, "5", "3.9"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "5A", "5a"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 0, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "zz", Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Boolean.TRUE, Boolean.FALSE));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Boolean.TRUE, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Boolean.TRUE, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanIntAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, 1, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanNullAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, null, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, null, null));
    }

    public void testGreaterThanOrEqualTwoDoubles() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 3146431.43266, 937.1652));
    }

    public void testGreaterThanOrEqualSameDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 937.1652, 937.1652));
    }

    public void testGreaterThanOrEqualNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, -8426.6, 937.1652));
    }

    public void testGreaterThanOrEqualInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanOrEqualPositiveInfintyAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testGreaterThanOrEqualZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, 0, Double.NaN));
    }

    public void testGreaterThanOrEqualInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testGreaterThanOrEqualNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, 0));
    }

    public void testGreaterThanOrEqualNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, Double.POSITIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, 9000, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "5o", 4));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualTwoStrings() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, "5o", "4o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, "5", "3.9"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "5A", "5a"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 0, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "zz", Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, Boolean.FALSE));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualIntAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 1, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualNullAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, null, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testGreaterThanOrEqualNullAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, null, null));
    }

    public void testLessThanTwoDoubles() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 3146431.43266, 937.1652));
    }

    public void testLessThanSameDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, -8426.6, -8426.6));
    }

    public void testLessThanNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, -8426.6, 937.1652));
    }

    public void testLessThanInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testLessThanPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testLessThanZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, Double.NaN));
    }

    public void testLessThanInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testLessThanNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, 0));
    }

    public void testLessThanNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, Double.POSITIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 9000, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5o", 4));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanTwoStrings() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5o", "4o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5", "3.9"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, "5A", "5a"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "zz", Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, Boolean.FALSE));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanZeroAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanNullAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, null, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, null, null));
    }

    public void testLessThanOrEqualTwoDoubles() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 3146431.43266, 937.1652));
    }

    public void testLessThanOrEqualSameDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, -8426.6, -8426.6));
    }

    public void testLessThanOrEqualNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, -8426.6, 937.1652));
    }

    public void testLessThanOrEqualInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testLessThanOrEqualPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testLessThanOrEqualZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 0, Double.NaN));
    }

    public void testLessThanOrEqualInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testLessThanOrEqualNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, 0));
    }

    public void testLessThanOrEqualNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, Double.POSITIVE_INFINITY));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 9000, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5o", 4));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualTwoStrings() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5o", "4o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5", "3.9"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, "5A", "5a"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 0, ""));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "zz", Double.NaN));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, "5o"));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, Boolean.FALSE));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, 1));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualIntAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 1, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualNullAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, null, 0));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testLessThanOrEqualTwoNulls() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, null, null));
    }

    public void testAndBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(AND, Boolean.TRUE, Boolean.FALSE));
    }

    public void testAndTwoBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(AND, Boolean.TRUE, Boolean.TRUE));
    }

    public void testAndBooleanTrueAndNull() throws Exception {
        assertEquals(null, evaluate(AND, Boolean.TRUE, null));
    }

    public void testAndNullAndBooleanTrue() throws Exception {
        assertEquals(null, evaluate(AND, null, Boolean.TRUE));
    }

    public void testAndTwoNulls() throws Exception {
        assertEquals(null, evaluate(AND, null, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndTwoInts() throws Exception {
        assertEquals(235325, evaluate(AND, 314, 235325));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndZeroAndInt() throws Exception {
        assertEquals(0, evaluate(AND, 0, 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndStringZeroAndInt() throws Exception {
        assertEquals(314, evaluate(AND, "0", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndStringFalseAndInt() throws Exception {
        assertEquals(314, evaluate(AND, "false", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndEmptyStringAndInt() throws Exception {
        assertEquals("", evaluate(AND, "", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndNaNAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(AND, Double.NaN, 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testAndIntAndEmptyString() throws Exception {
        assertEquals("", evaluate(AND, 314, ""));
    }

    public void testOrBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, Boolean.TRUE, Boolean.FALSE));
    }

    public void testOrTwoBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(OR, Boolean.FALSE, Boolean.FALSE));
    }

    public void testOrBooleanFalseAndBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, Boolean.FALSE, Boolean.TRUE));
    }

    public void testOrBooleanFalseAndNull() throws Exception {
        assertEquals(null, evaluate(OR, Boolean.FALSE, null));
    }

    public void testOrTwoNulls() throws Exception {
        assertEquals(null, evaluate(OR, null, null));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrNullAndBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, null, Boolean.TRUE));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrZeroAndInt() throws Exception {
        assertEquals(314, evaluate(OR, 0, 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrTwoInts() throws Exception {
        assertEquals(235325, evaluate(OR, 314, 235325));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrStringZeroAndInt() throws Exception {
        assertEquals("0", evaluate(OR, "0", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrStringFalseAndInt() throws Exception {
        assertEquals("false", evaluate(OR, "false", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrEmptyStringAndInt() throws Exception {
        assertEquals(314, evaluate(OR, "", 314));
    }

    // W-2361099: Java Expressions should mimic JavaScript functionality
    public void _testOrNaNAndString() throws Exception {
        assertEquals("Random", evaluate(OR, Double.NaN, "Random"));
    }

    public void testNotBooleanTrue() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, Boolean.TRUE));
    }

    public void testNotBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, Boolean.FALSE));
    }

    public void testNotEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, ""));
    }

    public void testNotString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "Random"));
    }

    public void testNotStringFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "false"));
    }

    public void testNotStringZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "0"));
    }

    public void testNotNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, (Object) null));
    }

    public void testNotObject() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, new Object()));
    }

    public void testNotDoubleZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, 0.0));
    }

    public void testNotDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, 1.0));
    }

    public void testNotNaN() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, Double.NaN));
        assertEquals(Boolean.TRUE, evaluate(NOT, Float.NaN));
    }
}
