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
package org.auraframework.impl.expression.parser;

import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.AuraImplExpressionTestCase;
import org.auraframework.impl.expression.LiteralImpl;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

/**
 * Tests for the expression parser
 */
public class ExpressionParserTest extends AuraImplExpressionTestCase {

    public ExpressionParserTest(String name) {
        super(name);
    }

    /**
     * Function precedence respects Java conventions.
     */
    public void testPrecedence() throws Exception {
        double result = 3.5 * 280 + 53145.3145 / -2.61;
        Expression e = buildExpression("3.5 * 280 + 53145.3145 / -2.61");
        assertEquals("Unexpected expression evaluation", result, e.evaluate(null));

        result = (536 + .346) * 1.56 / 634 + 11 % 5;
        e = buildExpression("(536 + .346) * 1.56 / 634 + 11 % 5");
        assertEquals("Unexpected expression evaluation", result, e.evaluate(null));

        result = 1 - -5;
        e = buildExpression("1 - -5");
        assertEquals("Unexpected expression evaluation", result, e.evaluate(null));

        e = buildExpression("true ? true : false ? 16 : 21");
        assertEquals("Unexpected expression evaluation", true, e.evaluate(null));
    }

    /**
     * Boolean precedence respects Java conventions.
     */
    public void testBoolPrecedence() throws Exception {
        boolean compare = 324.4326 < 259 / 134.6 + 2356;
        Expression e = buildExpression("324.4326 < 259 / 134.6 + 2356");
        assertEquals("Boolean precedence not evaluated correctly", compare, e.evaluate(null));

        compare = 324.4326 < 259 / (134.6 + 2356);
        e = buildExpression("324.4326 < 259 / (134.6 + 2356)");
        assertEquals("Boolean precedence not evaluated correctly", compare, e.evaluate(null));

        e = buildExpression("324.4326 == 259 / (134.6 + 2356) && (false || true)");
        assertFalse("Boolean precedence not evaluated correctly", e.evaluate(null));

        e = buildExpression("346 > 346 ? 6541 / 21 - 77 : 235.66");
        assertEquals("Boolean precedence not evaluated correctly", 235.66, e.evaluate(null));

        e = buildExpression("false == false ? 16 : 21");
        assertEquals("Boolean precedence not evaluated correctly", 16., e.evaluate(null));

        e = buildExpression("false && false ? 16 : 21");
        assertEquals("Boolean precedence not evaluated correctly", 21., e.evaluate(null));

        e = buildExpression("true ? 16 : 21 < 20");
        assertEquals("Boolean precedence not evaluated correctly", 16., e.evaluate(null));

        e = buildExpression("! true && false");
        assertEquals("Boolean precedence not evaluated correctly", false, e.evaluate(null));
    }

    /**
     * Alternate relational operators can be parsed.
     */
    public void testAlternateNames() throws Exception {
        Expression e = buildExpression("55 eq 55");
        assertTrue("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
        e = buildExpression("55 ne 55");
        assertFalse("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
        e = buildExpression("55 ge 55");
        assertTrue("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
        e = buildExpression("55 le 55");
        assertTrue("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
        e = buildExpression("55 lt 55");
        assertFalse("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
        e = buildExpression("55 gt 55");
        assertFalse("Unexpected expression evaluation using alternate relational operators", e.evaluate(null));
    }

    /**
     * Number literals include integers, decimals, and exponents.
     */
    public void testLiteralNumbers() throws Exception {
        Expression e = buildExpression("5");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 5.0, l.getValue());

        e = buildExpression("5.345");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 5.345, l.getValue());

        e = buildExpression("911.");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 911., l.getValue());

        e = buildExpression(".119");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", .119, l.getValue());

        e = buildExpression("1e10");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 1e10, l.getValue());

        e = buildExpression("2.e20");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 2.e20, l.getValue());

        e = buildExpression("0e0");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 0e0, l.getValue());

        e = buildExpression("1e01");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 1e01, l.getValue());

        e = buildExpression(".3e3");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", .3e3, l.getValue());
    }

    /**
     * String literals require single quotes and may be empty.
     */
    public void testLiteralStrings() throws Exception {
        Expression e = buildExpression("'ahfdh'");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("ahfdh", l.getValue());

        verifyInvalidExpressionException("\"ahfdh\"", "unexpected token: '\"' at column 1 of expression: \"ahfdh\"");

        e = buildExpression("''");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("", l.getValue());
    }

    /**
     * Boolean literals are case insensitive.
     */
    public void testLiteralBools() throws Exception {
        Expression e = buildExpression("true");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertTrue("Case sensitivity of Boolean literlas failed", l.getValue());

        e = buildExpression("TRUE");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertTrue("Case sensitivity of Boolean literlas failed", l.getValue());

        e = buildExpression("false");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertFalse("Case sensitivity of Boolean literlas failed", l.getValue());

        e = buildExpression("FALSE");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertFalse("Case sensitivity of Boolean literlas failed", l.getValue());
    }

    /**
     * Property references can have multiple parts.
     */
    public void testPropertyReference() throws Exception {
        Expression e = buildExpression("im");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("im.parsing");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "parsing", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("im.not.nullish");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "not", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming twice", "nullish", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("_i.am_very._.readable_");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl) e;
        assertEquals("Unexpected root of PropertyReference", "_i", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "am_very", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming twice", "_", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming thrice", "readable_", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
    }

    /**
     * Property references can access array members
     */
    public void testArrayAccessors() throws Exception {
        Expression e = buildExpression("im[0]");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference", "0", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("im.an[3151345]");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "an", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference after stemming", "3151345", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("im.an[3151345].array");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "an", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference after stemming", "3151345", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming and accessing array", "array", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());

        e = buildExpression("multi[1][364]");
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "multi", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference", "1", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access second array member via PropertyReference", "364", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
    }

    /**
     * Array access negative test cases
     */
    public void testInvalidArrayAccessor() throws Exception {
        verifyInvalidExpressionException("[21]", "unexpected token: a left square bracket");
        verifyInvalidExpressionException("blah[letters]", "expecting a positive integer, found 'letters'");
        verifyInvalidExpressionException("postfix[5$]", "expecting a right square bracket, found '$'");
        verifyInvalidExpressionException("prefix[$2]", "expecting a positive integer, found '$2'");
        verifyInvalidExpressionException("negative[-5]", "expecting a positive integer, found '-'");
        verifyInvalidExpressionException("positive[+5]", "expecting a positive integer, found '+'");
        verifyInvalidExpressionException("decimal[5.5]", "expecting a positive integer, found '5.5'");
        verifyInvalidExpressionException("unclosed[5", "unexpected end of expression");
        verifyInvalidExpressionException("unopened5]", "unexpected token: an identifier");
        verifyInvalidExpressionException("noindex[]", "expecting a positive integer, found ']'");
        verifyInvalidExpressionException("paren[(33)]", "expecting a positive integer, found '('");
    }

    /**
     * Consecutive boolean operations are parsed correctly.
     */
    public void testBoolChain() throws Exception {
        verifyInvalidExpressionException("true == true == true", "unexpected token: '=='");
        verifyInvalidExpressionException("1 > 2 == true", "unexpected token: '=='");
        verifyInvalidExpressionException("true == 4 < 5", "unexpected token: '<'");
    }

    /**
     * Escape sequences in strings are parsed correctly.
     */
    public void testEscapedString() throws Exception {
        Expression e = buildExpression("\t'over there! '\r\n\n");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "over there! ", l.getValue());

        e = buildExpression(" '\\'stuff me,\\' the unfilled teddy bear said to the child.'");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "'stuff me,' the unfilled teddy bear said to the child.",
                l.getValue());

        e = buildExpression("'the child blinked and replied,\n \t\\'I\\'d be delighted.\\''");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "the child blinked and replied,\n \t'I'd be delighted.'",
                l.getValue());

        /*
         * TODO(W-1530127): Characters not escaped properly. e =
         * buildExpression("'top\\\\\\\"2\\\"\\b\\f\\r\\n\\tbottom'"); assertEquals("Unexpected expression type",
         * ExpressionType.LITERAL, e.getExpressionType()); l = (LiteralImpl) e;
         * assertEquals("Escape sequences not parsed correctly", "top\"2\"\b\f\r\n\tbottom", l.getValue());
         */
    }

    /**
     * Unescaped backslash in string should throw a parse exception.
     */
    // currently fails when slash up front
    public void testNonEscapeBackslashInString() throws Exception {
        verifyInvalidExpressionException("'not\\u32unicode'", "mismatched character 'u' expecting set null");
        verifyInvalidExpressionException("'\\'", "expecting ''', found '<EOF>'");
        verifyInvalidExpressionException("'back \\ slash'", "unexpected token: '\\'");
        verifyInvalidExpressionException("'\\escaped'", "unexpected token: '\\'");
        verifyInvalidExpressionException("'not\\'", "expecting ''', found '<EOF>'");
    }

    /**
     * Unicode escapes in strings are parsed correctly.
     */
    // currently fails
    public void _testUnicodeEscapesInString() throws Exception {
        Expression e = buildExpression("'\\u0032'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("2", l.getValue());

        e = buildExpression("'good\\u0032go'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("good2go", l.getValue());

        e = buildExpression("'Ocean\\'s \\u0031\\u0031'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Ocean's 11", l.getValue());

        e = buildExpression("'\\u0031\\u0032\\u0020Monkeys\\u0020\\u0099'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("12 Monkeys \u0099", l.getValue());
    }

    /**
     * Operators may be accessed as function calls and may be nested.
     */
    public void testFunctionCalls() throws Exception {
        Expression e = buildExpression("or(true, false)");
        assertTrue("Operator could not be accessed as function call", e.evaluate(null));
        e = buildExpression("and(false, true)");
        assertFalse("Operator could not be accessed as function call", e.evaluate(null));
        e = buildExpression("add(24, 23525)");
        assertEquals("Operator could not be accessed as function call", 24 + 23525.0, e.evaluate(null));

        e = buildExpression("sub(24, add(63, 23525))");
        assertEquals("Error evaluating nested operators as function calls", 24 - (63 + 23525.0), e.evaluate(null));

        e = buildExpression("add('The child', ' picked up the teddy bear in one hand')");
        assertEquals("Error adding strings with add operator as function call",
                "The child picked up the teddy bear in one hand", e.evaluate(null));

        e = buildExpression("notequals(add(' and grasped a', ' pick axe in the other.'), '\"Wait!\" screamed the bear.')");
        assertTrue("Error in evaluating nested operators as funtion calls", e.evaluate(null));

        e = buildExpression("if(equals(true, greaterthan(-2, -52)), add('The child hesitated, ', '\"I cannot stuff you without making a hole to stuff into.\"'), ' The bear squinted and noodled on this for a minute.')");
        assertEquals("Error in evaluating nested operators as funtion calls",
                "The child hesitated, \"I cannot stuff you without making a hole to stuff into.\"", e.evaluate(null));
    }

    /**
     * Non-english string literals are parsed correctly.
     */
    public void testNonEnglishString() throws Exception {
        Expression e = buildExpression("'天ぷらが食べたいです'");
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        assertEquals("Unexpected evaluation of non-english string", "天ぷらが食べたいです", e.evaluate(null));
    }

    /**
     * Missing operands throw a parse exception.
     */
    public void testMissingOperands() throws Exception {
        verifyInvalidExpressionException("1+", "unexpected end of expression");
        verifyInvalidExpressionException("2-", "unexpected end of expression");
        verifyInvalidExpressionException("*3", "unexpected token: a multiplication");
        verifyInvalidExpressionException("/4", "unexpected token: a division");
        verifyInvalidExpressionException("5%", "unexpected end of expression");
        verifyInvalidExpressionException("?", "unexpected token: a question mark");
    }

    /**
     * Mismatched parentheses throw a parse exception.
     */
    public void testIncompleteParentheses() throws Exception {
        verifyInvalidExpressionException("(1", "unexpected end of expression");
        verifyInvalidExpressionException("2)", "unexpected token: ')'");
    }

    /**
     * Unclosed string throws a parse exception.
     */
    @UnAdaptableTest
    public void testIncompleteString() throws Exception {
        verifyInvalidExpressionException("'unclosed string", "expecting ''', found '<EOF>'");
        verifyInvalidExpressionException("unclosed string'", "unexpected token: an identifier");
    }

    /**
     * Unclosed braces throws a parse exception.
     */
    public void testIncompleteBraces() throws Exception {
        verifyInvalidExpressionException("{!v.noend", "unclosed brace");
        verifyInvalidExpressionException("v.dangled}", "unexpected token: '}'");
        verifyInvalidExpressionException("v.x + {!v.inner}", "unexpected token: '{'");
    }

    /**
     * Invalid characters in property names throw a parse exception.
     */
    public void testPropertyNameInvalid() throws Exception {
        verifyInvalidExpressionException("\\upfront", "unexpected token: '\\'");
        verifyInvalidExpressionException("followup\\", "unexpected token: '\\'");
        verifyInvalidExpressionException("in\\side", "unexpected token: '\\'");
        verifyInvalidExpressionException("5horsemen", "unexpected token: 'horsemen'");
        verifyInvalidExpressionException("9.1.1", "unexpected token: '.1'");
        verifyInvalidExpressionException("in.2.u", "unexpected token: an identifier");
        verifyInvalidExpressionException(".hidden", "unexpected token: a period");
        verifyInvalidExpressionException("ends.with.", "unexpected end of expression");
        verifyInvalidExpressionException("man...middle", "expecting an identifier, found '.'");
    }

    /**
     * Undefined function
     */
    public void testUndefinedFunction() throws Exception {
        try {
            buildExpression("undefined(4)");
            fail("Expecting AuraRuntimeException for undefined function");
        } catch (AuraRuntimeException e) {
            assertTrue("Unexpected error message trying to parse <undefined(4)>. Expected to start with: "
                    + "No function found for key: undefined" + ". But got: " + e.getMessage(), e.getMessage()
                    .startsWith("No function found for key: undefined"));
        }
    }

    /**
     * Multiple statemts, separated by a semicolon
     */
    public void testMultipleStatements() throws Exception {
        verifyInvalidExpressionException("5==1;5==1;", "unexpected token: ';' at column 5");
    }

    /**
     * Invalid syntax - consecutive property names
     */
    public void testMultipleProperties() throws Exception {
        verifyInvalidExpressionException("test invalid", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals
     */
    public void testMultipleLiterals() throws Exception {
        verifyInvalidExpressionException("5 'invalid'", "unexpected token: ''invalid''");
    }

    /**
     * Invalid syntax - consecutive functions
     */
    public void testMultipleFunctions() throws Exception {
        verifyInvalidExpressionException("add() subtract()", "unexpected token: 'subtract'");
    }

    /**
     * Invalid syntax - consecutive property names separated by newline
     */
    public void testMultilineProperty() throws Exception {
        verifyInvalidExpressionException("invalid\r\ntest", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals separated by newline
     */
    public void testMultilineLiteral() throws Exception {
        verifyInvalidExpressionException("5\r\n1", "unexpected token: '1'");
    }

    /**
     * Invalid syntax - consecutive literals separated by newline
     */
    public void testLocationInErrorMessage() throws Exception {
        verifyInvalidExpressionException("5\r\n  1", "unexpected token: '1' at line 2, column 3");
    }

    /**
     * Verify the correct exception type is thrown and contains the correct error message.
     */
    private void verifyInvalidExpressionException(String expression, String msgStartsWith) throws Exception {
        try {
            buildExpression(expression);
            fail("No execption thrown for <" + expression + ">. Expected InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertTrue("Unexpected error message trying to parse <" + expression + ">. Expected to start with: "
                    + msgStartsWith + ". But got: " + e.getMessage(), e.getMessage().startsWith(msgStartsWith));
        }
    }
}
