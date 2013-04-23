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
package org.auraframework.impl.expression;

import static org.auraframework.impl.expression.functions.BooleanFunctions.AND;
import static org.auraframework.impl.expression.functions.BooleanFunctions.NOT;
import static org.auraframework.impl.expression.functions.BooleanFunctions.OR;
import static org.auraframework.impl.expression.functions.MathFunctions.SUBTRACT;
import static org.auraframework.impl.expression.functions.MultiFunctions.ADD;

import java.math.BigDecimal;

import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;

import com.google.common.collect.ImmutableList;

/**
 * Tests of expression evaluation
 * 
 * @hierarchy Aura.Runtime.Expression.Server.Evaluation
 * @userStory a07B0000000EdAC
 */
public class ExpressionTest extends AuraImplExpressionTestCase {

    private static final Location l = new Location("test", -1);
    private static final PropertyReference blah = new PropertyReferenceImpl("blah", l);
    private static final PropertyReference meh = new PropertyReferenceImpl("meh", l);

    private static ValueProvider numbers = new ValueProvider() {
        @Override
        public Object getValue(PropertyReference key) {
            if (key == blah) {
                return 314;
            } else if (key == meh) {
                return 235325;
            }
            return null;
        }

    };

    private static ValueProvider bools = new ValueProvider() {
        @Override
        public Object getValue(PropertyReference key) {
            if (key == blah) {
                return true;
            } else if (key == meh) {
                return false;
            }
            return null;
        }

    };

    public ExpressionTest(String name) {
        super(name);
    }

    public void testNumberExpression() throws Exception {
        Expression e = new FunctionCallImpl(ADD, ImmutableList.<Expression> of(blah, meh), l);
        Object o = e.evaluate(numbers);
        assertEquals(314 + 235325.0, o);

        // (blah + meh) - (blah + blah)
        e = new FunctionCallImpl(SUBTRACT, ImmutableList.<Expression> of(e,
                new FunctionCallImpl(ADD, ImmutableList.<Expression> of(blah, blah), l)), l);
        o = e.evaluate(numbers);
        assertEquals((314 + 235325.0) - (314 + 314), o);

        e = new FunctionCallImpl(SUBTRACT, ImmutableList.<Expression> of(e, new LiteralImpl(new BigDecimal(17), l)), l);
        o = e.evaluate(numbers);
        assertEquals(((314 + 235325.0) - (314 + 314)) - 17, o);
    }

    public void testBooleanExpression() throws Exception {
        Expression e = new FunctionCallImpl(AND, ImmutableList.<Expression> of(blah, meh), l);
        Object o = e.evaluate(bools);
        assertEquals(false, o);

        e = new FunctionCallImpl(OR, ImmutableList.<Expression> of(blah, meh), l);
        o = e.evaluate(bools);
        assertTrue("Expected boolean expression to be true", o);

        e = new FunctionCallImpl(NOT, ImmutableList.<Expression> of(blah), l);
        o = e.evaluate(bools);
        assertFalse("Expected boolean expression to be false", o);

        // true && (false || !true)
        e = new FunctionCallImpl(AND, ImmutableList.<Expression> of(
                blah,
                new FunctionCallImpl(OR, ImmutableList.<Expression> of(new LiteralImpl(false, l), new FunctionCallImpl(
                        NOT, ImmutableList.<Expression> of(new LiteralImpl(true, l)), l)), l)), l);
        o = e.evaluate(bools);
        assertFalse("Expected boolean expression to be false", o);
    }

    public void testLiteralNull() throws Exception {
        verifyEvaluateResult("null", ExpressionType.LITERAL, null, null);
    }

    public void testPropertyEvaluatesToNull() throws Exception {
        ValueProvider vp = new ValueProvider() {
            @Override
            public Object getValue(PropertyReference key) {
                return null;
            }
        };
        verifyEvaluateResult("nullprop", ExpressionType.PROPERTY, vp, null);
        verifyEvaluateResult("nullarray[0]", ExpressionType.PROPERTY, vp, null);
        verifyEvaluateResult("nothing.here == null", ExpressionType.FUNCTION, vp, true);
        verifyEvaluateResult("nothing.here != null", ExpressionType.FUNCTION, vp, false);
    }

    public void testPropertyIsNotNull() throws Exception {
        ValueProvider vp = new ValueProvider() {
            @Override
            public Object getValue(PropertyReference key) {
                return "null? no!";
            }
        };
        verifyEvaluateResult("array[66]", ExpressionType.PROPERTY, vp, "null? no!");
        verifyEvaluateResult("something.here == null", ExpressionType.FUNCTION, vp, false);
        verifyEvaluateResult("something.here != null", ExpressionType.FUNCTION, vp, true);
    }

    public void testFunctionWithNullOperands() throws Exception {
        verifyEvaluateResult("true && null", ExpressionType.FUNCTION, null, null);
        verifyEvaluateResult("null + 1", ExpressionType.FUNCTION, null, null);
        verifyEvaluateResult("'null' == null", ExpressionType.FUNCTION, null, false);
    }

    // currently throws NullPointerException
    // @TestLabels(IgnoreFailureReason.IN_DEV)
    // public void testPropertyWithNoValueProvider() throws Exception {
    // verifyEvaluateException("undefined", "??????????");
    // }

    // currently throws IndexOutOfBoundsException, catch during parse?
    // @TestLabels(IgnoreFailureReason.IN_DEV)
    // public void testFunctionMissingOperands() throws Exception {
    // verifyEvaluateException("add()", "??????????");
    // }

    public void testFunctionMismatchedOperands() throws Exception {
        verifyEvaluateResult("3 + ' little piggies'", ExpressionType.FUNCTION, null, null);
        verifyEvaluateResult("'5' + 5", ExpressionType.FUNCTION, null, null);
        verifyEvaluateResult("'2' == 2", ExpressionType.FUNCTION, null, false);
    }

    public void testFunctionEvaluatesToNaN() throws Exception {
        verifyEvaluateResult("0 / 0", ExpressionType.FUNCTION, null, Double.NaN);
    }

    public void testFunctionEvaluatesToInfinity() throws Exception {
        verifyEvaluateResult("-2 / -0.0", ExpressionType.FUNCTION, null, Double.POSITIVE_INFINITY);
        verifyEvaluateResult("-5 / 0", ExpressionType.FUNCTION, null, Double.NEGATIVE_INFINITY);
    }

    public void testMultilineFunction() throws Exception {
        verifyEvaluateResult("5 +\r\n1\r\n!=\r\n'null'", ExpressionType.FUNCTION, null, true);
    }

    private void verifyEvaluateResult(String expression, ExpressionType type, ValueProvider vp, Object result)
            throws Exception {
        Expression e = buildExpression(expression);
        assertEquals("Unexpected expression type when parsing <" + expression + ">", type, e.getExpressionType());
        assertEquals("Unexpected evaluation of <" + expression + ">", result, e.evaluate(vp));
    }

    // private void verifyEvaluateException(String expression, String
    // messageStartsWith) throws Exception {
    // Expression e = buildExpression(expression);
    // try {
    // Object result = e.evaluate(null);
    // fail("No Exception thrown for <" + expression + ">. Instead, got: " +
    // result);
    // } catch (Exception ex) {
    // if (ex.getMessage() != null &&
    // ex.getMessage().startsWith(messageStartsWith)) return;
    // failNotEquals("Unexpected exception for <" + expression + "> ",
    // messageStartsWith, ex);
    // }
    // }
}
