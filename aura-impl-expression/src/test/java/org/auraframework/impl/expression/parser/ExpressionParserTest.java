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
package org.auraframework.impl.expression.parser;

import org.auraframework.expression.*;
import org.auraframework.impl.expression.*;
import org.auraframework.test.annotation.UnAdaptableTest;

/**
 * Tests for the expression parser
 * @hierarchy Aura.Runtime.Expression.Server.Parser
 * @userStory a07B0000000Ed9n
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
        assertEquals(result, e.evaluate(null));

        result = (536 + .346) * 1.56 / 634 + 11 % 5;
        e = buildExpression("(536 + .346) * 1.56 / 634 + 11 % 5");
        assertEquals(result, e.evaluate(null));

        result = 1 - -5;
        e = buildExpression("1 - -5");
        assertEquals(result, e.evaluate(null));

        e = buildExpression("true ? true : false ? 16 : 21");
        assertEquals(true, e.evaluate(null));
    }

    /**
     * Boolean precedence respects Java conventions.
     */
    public void testBoolPrecedence() throws Exception {
        boolean compare = 324.4326 < 259 / 134.6 + 2356;
        Expression e = buildExpression("324.4326 < 259 / 134.6 + 2356");
        assertEquals(compare, e.evaluate(null));

        compare = 324.4326 < 259 / (134.6 + 2356);
        e = buildExpression("324.4326 < 259 / (134.6 + 2356)");
        assertEquals(compare, e.evaluate(null));

        e = buildExpression("324.4326 == 259 / (134.6 + 2356) && (false || true)");
        assertFalse(e.evaluate(null));

        e = buildExpression("346 > 346 ? 6541 / 21 - 77 : 235.66");
        assertEquals(235.66, e.evaluate(null));

        e = buildExpression("false == false ? 16 : 21");
        assertEquals(16., e.evaluate(null));

        e = buildExpression("false && false ? 16 : 21");
        assertEquals(21., e.evaluate(null));

        e = buildExpression("true ? 16 : 21 < 20");
        assertEquals(16., e.evaluate(null));

        e = buildExpression("! true && false");
        assertEquals(false, e.evaluate(null));
    }

    /**
     * Consecutive boolean operations are parsed correctly.
     */
    // currently throws MismatchedTokenException
    // W-930737 http://gus.soma.salesforce.com/a07B0000000EsUH
//    @TestLabels(IgnoreFailureReason.IN_DEV)
//    public void testBoolChain() throws Exception {
//        Expression e = buildExpression("true == true == true");
//        assertEquals(true, e.evaluate(null));
//
//        e = buildExpression("1 > 2 == true");
//        assertEquals(false, e.evaluate(null));
//
//        e = buildExpression("true == 4 < 5");
//        assertEquals(true, e.evaluate(null));
//    }

    /**
     * Alternate relational operators can be parsed.
     */
    public void testAlternateNames() throws Exception {
        Expression e = buildExpression("55 eq 55");
        assertTrue(e.evaluate(null));
        e = buildExpression("55 ne 55");
        assertFalse(e.evaluate(null));
        e = buildExpression("55 ge 55");
        assertTrue(e.evaluate(null));
        e = buildExpression("55 le 55");
        assertTrue(e.evaluate(null));
        e = buildExpression("55 lt 55");
        assertFalse(e.evaluate(null));
        e = buildExpression("55 gt 55");
        assertFalse(e.evaluate(null));
    }

    /**
     * Number literals include integers, decimals, and exponents.
     */
    public void testLiteralNumbers() throws Exception {
        Expression e = buildExpression("5");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl)e;
        assertEquals(5.0, l.getValue());

        e = buildExpression("5.345");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(5.345, l.getValue());

        e = buildExpression("911.");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(911., l.getValue());

        e = buildExpression(".119");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(.119, l.getValue());

        e = buildExpression("1e10");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(1e10, l.getValue());

        e = buildExpression("2.e20");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(2.e20, l.getValue());

        e = buildExpression("0e0");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(0e0, l.getValue());

        e = buildExpression("1e01");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(1e01, l.getValue());

        e = buildExpression(".3e3");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals(.3e3, l.getValue());
    }

    /**
     * String literals require single quotes and may be empty.
     */
    public void testLiteralStrings() throws Exception {
        Expression e = buildExpression("'ahfdh'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl)e;
        assertEquals("ahfdh", l.getValue());

        e = buildExpression("''");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals("", l.getValue());
    }

    /**
     * Boolean literals are case insensitive.
     */
    public void testLiteralBools() throws Exception {
        Expression e = buildExpression("true");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl)e;
        assertTrue(l.getValue());

        e = buildExpression("TRUE");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertTrue(l.getValue());

        e = buildExpression("false");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertFalse(l.getValue());

        e = buildExpression("FALSE");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertFalse(l.getValue());
    }

    /**
     * Property references can have multiple parts.
     */
    public void testPropertyReference() throws Exception {
        Expression e = buildExpression("im");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference)e;
        assertEquals("im", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("im.parsing");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl)e;
        assertEquals("im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("parsing", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("im.not.nullish");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl)e;
        assertEquals("im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("not", pr.getRoot());
        pr = pr.getStem();
        assertEquals("nullish", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("_i.am_very._.readable_");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl)e;
        assertEquals("_i", pr.getRoot());
        pr = pr.getStem();
        assertEquals("am_very", pr.getRoot());
        pr = pr.getStem();
        assertEquals("_", pr.getRoot());
        pr = pr.getStem();
        assertEquals("readable_", pr.getRoot());
        assertNull(pr.getStem());
    }

    /**
     * Property references can access array members
     */
    public void testArrayAccessors() throws Exception {
        Expression e = buildExpression("im[0]");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference)e;
        assertEquals("im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("0", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("im.an[3151345]");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference)e;
        assertEquals("im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("an", pr.getRoot());
        pr = pr.getStem();
        assertEquals("3151345", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("im.an[3151345].array");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference)e;
        assertEquals("im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("an", pr.getRoot());
        pr = pr.getStem();
        assertEquals("3151345", pr.getRoot());
        pr = pr.getStem();
        assertEquals("array", pr.getRoot());
        assertNull(pr.getStem());

        e = buildExpression("multi[1][364]");
        assertEquals(ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference)e;
        assertEquals("multi", pr.getRoot());
        pr = pr.getStem();
        assertEquals("1", pr.getRoot());
        pr = pr.getStem();
        assertEquals("364", pr.getRoot());
        assertNull(pr.getStem());
    }

    /**
     * array access negative test
     */
    public void testInvalidArrayAccessor() throws Exception {
        verifyParseException("[21]", "unexpected token: a left square bracket");
        verifyParseException("blah[letters]", "expecting a positive integer, found 'letters'");
        verifyParseException("postfix[5$]", "expecting a right square bracket, found '$'");
        verifyParseException("prefix[$2]", "expecting a positive integer, found '$2'");
        verifyParseException("negative[-5]", "expecting a positive integer, found '-'");
        verifyParseException("positive[+5]", "expecting a positive integer, found '+'");
        verifyParseException("decimal[5.5]", "expecting a positive integer, found '5.5'");
        verifyParseException("unclosed[5", "unexpected end of expression");
        verifyParseException("unopened5]", "unexpected token: an identifier");
        verifyParseException("noindex[]", "expecting a positive integer, found ']'");
        verifyParseException("paren[(33)]", "expecting a positive integer, found '('");
    }

    /**
     * Escape sequences in strings are parsed correctly.
     */
    public void testEscapedString() throws Exception {
        Expression e = buildExpression("\t'over there! '\r\n\n");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl)e;
        assertEquals("over there! ", l.getValue());

        e = buildExpression(" '\\'stuff me,\\' the unfilled teddy bear said to the child.'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals("'stuff me,' the unfilled teddy bear said to the child.", l.getValue());

        e = buildExpression("'the child blinked and replied,\n \t\\'I\\'d be delighted.\\''");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl)e;
        assertEquals("the child blinked and replied,\n \t'I'd be delighted.'", l.getValue());

//        currently fails for escape characters
//        W-929859 http://gus.soma.salesforce.com/a07B0000000Erv2
//        e = buildExpression("'top\\\\\\\"2\\\"\\b\\f\\r\\n\\tbottom'");
//        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
//        l = (LiteralImpl)e;
//        assertEquals("top\2\b\f\r\n\tbottom", l.getValue());
    }

    /**
     * Unescaped backslash in string should throw a parse exception.
     */
    // currently fails when slash up front
    public void testNonEscapeBackslashInString() throws Exception {
        verifyParseException("'not\\u32unicode'", "mismatched character 'u' expecting set null");
        verifyParseException("'\\'", "expecting ''', found '<EOF>'");
//        verifyParseException("'back \\ slash'", "!!!currently returns slash");
//        verifyParseException("'\\escaped'", "!!!currently returns escaped");
//        verifyParseException("'not\\'", "NoViableAltException");
    }

    /**
     * Unicode escapes in strings are parsed correctly.
     */
    // currently fails
//    public void testUnicodeEscapesInString() throws Exception {
//        Expression e = buildExpression("'\\u0032'");
//        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
//        LiteralImpl l = (LiteralImpl)e;
//        assertEquals("2", l.getValue());
//
//        e = buildExpression("'good\\u0032go'");
//        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
//        l = (LiteralImpl)e;
//        assertEquals("good2go", l.getValue());
//
//        e = buildExpression("'Ocean\\'s \\u0031\\u0031'");
//        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
//        l = (LiteralImpl)e;
//        assertEquals("Ocean's 11", l.getValue());
//
//        e = buildExpression("'\\u0031\\u0032\\u0020Monkeys\\u0020\\u0099'");
//        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
//        l = (LiteralImpl)e;
//        assertEquals("12 Monkeys \u0099", l.getValue());
//    }

    /**
     * Operators may be accessed as function calls and may be nested.
     */
    public void testFunctionCalls() throws Exception {
        Expression e = buildExpression("or(true, false)");
        assertTrue(e.evaluate(null));
        e = buildExpression("and(false, true)");
        assertFalse(e.evaluate(null));
        e = buildExpression("add(24, 23525)");
        assertEquals(24 + 23525.0, e.evaluate(null));

        e = buildExpression("sub(24, add(63, 23525))");
        assertEquals(24 - (63 + 23525.0), e.evaluate(null));

        e = buildExpression("add('The child', ' picked up the teddy bear in one hand')");
        assertEquals("The child picked up the teddy bear in one hand", e.evaluate(null));

        e = buildExpression("notequals(add(' and grasped a', ' pick axe in the other.'), '\"Wait!\" screamed the bear.')");
        assertTrue(e.evaluate(null));

        e = buildExpression("if(equals(true, greaterthan(-2, -52)), add('The child hesitated, ', '\"I cannot stuff you without making a hole to stuff into.\"'), ' The bear squinted and noodled on this for a minute.')");
        assertEquals("The child hesitated, \"I cannot stuff you without making a hole to stuff into.\"",
                e.evaluate(null));
    }

    /**
     * Non-english string literals are parsed correctly.
     */
    public void testNonEnglishString() throws Exception {
        Expression e = buildExpression("'天ぷらが食べたいです'");
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        assertEquals("天ぷらが食べたいです", e.evaluate(null));
    }

    /**
     * Missing operands throw a parse exception.
     */
    public void testMissingOperands() throws Exception {
        verifyParseException("1+", "unexpected end of expression");
        verifyParseException("2-", "unexpected end of expression");
        verifyParseException("*3", "unexpected token: a multiplication");
        verifyParseException("/4", "unexpected token: a division");
        verifyParseException("5%", "unexpected end of expression");
        verifyParseException("?", "unexpected token: a question mark");
    }

    /**
     * Mismatched parentheses throw a parse exception.
     */
    public void testIncompleteParentheses() throws Exception {
        verifyParseException("(1", "unexpected end of expression");
        verifyParseException("2)", "unexpected token: ')'");
    }

    /**
     * Unclosed string throws a parse exception.
     */
    @UnAdaptableTest
    public void testIncompleteString() throws Exception {
        verifyParseException("'unclosed string", "expecting ''', found '<EOF>'");
        verifyParseException("unclosed string'", "unexpected token: an identifier");
    }

    /**
     * Unclosed braces throws a parse exception.
     */
    public void testIncompleteBraces() throws Exception {
        verifyParseException("{!v.noend", "unclosed brace");
        verifyParseException("v.dangled}", "unexpected token: '}'");
        verifyParseException("v.x + {!v.inner}", "unexpected token: '{'");
    }

    /**
     * Invalid characters in property names throw a parse exception.
     */
    public void testPropertyNameInvalid() throws Exception {
        verifyParseException("\\upfront", "unexpected token: '\\'");
        verifyParseException("followup\\", "unexpected token: '\\'");
        verifyParseException("in\\side", "unexpected token: '\\'");
        verifyParseException("5horsemen", "unexpected token: 'horsemen'");
        verifyParseException("9.1.1", "unexpected token: '.1'");
        verifyParseException("in.2.u", "unexpected token: an identifier");
        verifyParseException(".hidden", "unexpected token: a period");
        verifyParseException("ends.with.", "unexpected end of expression");
        verifyParseException("man...middle", "expecting an identifier, found '.'");
    }

    /**
     * Undefined function should throw a parse exception.
     */
    public void testUndefinedFunction() throws Exception {
        verifyParseException("undefined(4)", "No function found for key: undefined");
    }

    /**
     * Multiple statemts, separated by a semicolon, should throw a parse exception.
     */
    public void testMultipleStatements() throws Exception {
        verifyParseException("5==1;5==1;", "unexpected token: ';' at column 5");
    }

    /**
     * Invalid syntax - consecutive property names - throws a parse exception.
     */
    public void testMultipleProperties() throws Exception {
        verifyParseException("test invalid", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals - throws a parse exception.
     */
    public void testMultipleLiterals() throws Exception {
        verifyParseException("5 'invalid'", "unexpected token: ''invalid''");
    }

    /**
     *  Invalid syntax - consecutive functions - throws a parse exception.
     */
    public void testMultipleFunctions() throws Exception {
        verifyParseException("add() subtract()", "unexpected token: 'subtract'");
    }

    /**
     * Invalid syntax - consecutive property names separated by newline - throws a parse exception.
     */
    public void testMultilineProperty() throws Exception {
        verifyParseException("invalid\r\ntest", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals separated by newline - throws a parse exception.
     */
    public void testMultilineLiteral() throws Exception {
        verifyParseException("5\r\n1", "unexpected token: '1' at line 2, column 1");
    }

    private void verifyParseException(String expression, String messageStartsWith) {
        try {
            Expression e = buildExpression(expression);
            fail("No execption thrown for <" + expression + ">. Instead, got: " + e);
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().startsWith(messageStartsWith)) return;
            failNotEquals("Unexpected exception for <" + expression + ">. ", messageStartsWith, ex);
        }
    }
}
