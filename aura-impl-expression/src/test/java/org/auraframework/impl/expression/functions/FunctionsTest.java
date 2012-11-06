/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import static org.auraframework.impl.expression.functions.MathFunctions.*;
import static org.auraframework.impl.expression.functions.MultiFunctions.*;

import com.google.common.collect.Lists;

import org.auraframework.impl.expression.AuraImplExpressionTestCase;

/**
 * basic tests of functions
 *
 * @hierarchy Aura.Runtime.Expression.Server.Functions
 * @userStory a07B0000000Ed9n
 *
 *
 */
public class FunctionsTest extends AuraImplExpressionTestCase {
    private static final double d1 = 3146431.43266;
    private static final double d2 = 937.1652;
    private static final double d3 = -8426.6;
    private static final String s1 = "1";
    private static final String s2 = "2";

    public FunctionsTest(String name) {
        super(name);
    }

    private Object evaluate(Function f, Object... args) {
        return f.evaluate(Lists.newArrayList(args));
    }

    public void testAdd() throws Exception {
        assertEquals(d1 + d2, evaluate(ADD, d1, d2));
    }

    public void testAddOverflow() throws Exception {
        assertEquals(Double.MAX_VALUE, evaluate(ADD, Double.MAX_VALUE, 2.0));
    }

    public void testAddStrings() throws Exception {
        assertEquals(s1 + s2, evaluate(ADD, s1, s2));
    }

    public void testEquals() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, 2, 2.0));
    }

    public void testEqualsStrings() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, "bum", "bum"));
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "Bum", "bum"));
    }

    public void testEqualsIsNot() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, 1, 3));
    }

    // currently throws NullPointerException
//    @TestLabels(IgnoreFailureReason.IN_DEV)
//    public void testEqualsNulls() throws Exception {
//        assertEquals(Boolean.TRUE, evaluate(EQUALS, null, null));
//    }

    // currently throws NullPointerException
//    @TestLabels(IgnoreFailureReason.IN_DEV)
//    public void testEqualsNull1() throws Exception {
//        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, "null"));
//    }

    public void testEqualsNull2() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "null", null));
    }

    public void testSubtract() throws Exception {
        assertEquals(d2 - d3, evaluate(SUBTRACT, d2, d3));
    }

    public void testSubtractNaNResult() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testSubtractStrings() throws Exception {
        assertEquals(null, evaluate(SUBTRACT, 1, s1));
    }

    public void testMultiply() throws Exception {
        assertEquals(d1 * d2, evaluate(MULTIPLY, d1, d2));
    }

    public void testMultiplyNaNResult() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, Double.POSITIVE_INFINITY, 0));
    }

    public void testMultiplyStrings() throws Exception {
        assertEquals(null, evaluate(MULTIPLY, s1, 1));
    }

    public void testDivide() throws Exception {
        assertEquals(d1 / d3, evaluate(DIVIDE, d1, d3));
    }

    public void testDivideByZero() throws Exception {
        assertEquals(d1 / 0, evaluate(DIVIDE, d1, 0));
    }

    public void testDivideNaNResult() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 0, 0));
    }

    public void testDivideStrings() throws Exception {
        assertEquals(null, evaluate(DIVIDE, s1, s2));
    }

    public void testModulus() throws Exception {
        assertEquals(d1 % d3, evaluate(MODULUS, d1, d3));
    }

    public void testModulusByZero() throws Exception {
        assertEquals(d3 % 0, evaluate(MODULUS, d3, 0));
    }

    public void testModulusNaNResult() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 0, 0));
    }

    public void testModulusNull() throws Exception {
        assertEquals(null, evaluate(MODULUS, null, 1));
    }

    public void testAbsolutePositive() throws Exception {
        assertEquals(Math.abs(d1), evaluate(ABSOLUTE, d1));
    }

    public void testAbsoluteNegative() throws Exception {
        assertEquals(Math.abs(d3), evaluate(ABSOLUTE, d3));
    }

    public void testAbsoluteNegativeInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ABSOLUTE, Double.NEGATIVE_INFINITY));
    }

    public void testAbsoluteNull() throws Exception {
        assertEquals(null, evaluate(ABSOLUTE, new Object[] { null }));
    }

    public void testNegatePositive() throws Exception {
        assertEquals(-d1, evaluate(NEGATE, d1));
    }

    public void testNegateNegative() throws Exception {
        assertEquals(-d3, evaluate(NEGATE, d3));
    }

    public void testNegateInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(NEGATE, Double.POSITIVE_INFINITY));
    }

    public void testNegateString() throws Exception {
        assertEquals(null, evaluate(NEGATE, s1));
    }

    public void testGreaterThan() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, d1, d2));
    }

    public void testGreaterThanIsEqual() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, d1, d1));
    }

    public void testGreaterThanIsNot() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, d3, d2));
    }

    public void testGreaterThanStrings() throws Exception {
        assertEquals(null, evaluate(GREATER_THAN, s1, 2));
    }

    public void testGreaterThanOrEqual() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, d1, d2));
    }

    public void testGreaterThanOrEqualIsEqual() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, d2, d2));
    }

    public void testGreaterThanOrEqualIsNot() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, d3, d2));
    }

    public void testGreaterThanOrEqualStrings() throws Exception {
        assertEquals(null, evaluate(GREATER_THAN_OR_EQUAL, 1, s2));
    }

    public void testLessThanIsNot() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, d1, d2));
    }

    public void testLessThanIsEqual() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, d3, d3));
    }

    public void testLessThan() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, d3, d2));
    }

    public void testLessThanStrings() throws Exception {
        assertEquals(null, evaluate(LESS_THAN, s1, s2));
    }

    public void testLessThanOrEqualIsNot() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, d1, d2));
    }

    public void testLessThanOrEqualIsEqual() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, d1, d1));
    }

    public void testLessThanOrEqual() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, d3, d2));
    }

    public void testLessThanOrEqualStrings() throws Exception {
        assertEquals(null, evaluate(LESS_THAN_OR_EQUAL, s1, s2));
    }

    public void testTernaryTrue() throws Exception {
        assertEquals(s1, evaluate(TERNARY, true, s1, s2));
    }

    public void testTernaryFalse() throws Exception {
        assertEquals(s2, evaluate(TERNARY, false, s1, s2));
    }

    public void testTernaryNull() throws Exception {
        assertEquals(null, evaluate(TERNARY, null, s1, s2));
    }

    public void testTernaryString() throws Exception {
        assertEquals(null, evaluate(TERNARY, "true", s1, s2));
    }
}
