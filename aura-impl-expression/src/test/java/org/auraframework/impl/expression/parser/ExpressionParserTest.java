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
import org.auraframework.impl.expression.AuraExpressionBuilder;
import org.auraframework.impl.expression.ExpressionFunctions;
import org.auraframework.impl.expression.LiteralImpl;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

/**
 * Tests for the expression parser
 */
public class ExpressionParserTest extends UnitTestCase {
    
    @Mock
    ContextService contextService;
    
    @Mock
    DefinitionService definitionService;
    
    private AuraExpressionBuilder auraExpressionBuilder;
    
    @Override
    public void setUp() throws Exception {
        super.setUp();
        
        auraExpressionBuilder = new AuraExpressionBuilder(new ExpressionFunctions(contextService, definitionService));
    }
    
    /**
     * Function precedence respects Java conventions.
     */
    @Test
    public void testPrecedence() throws Exception {
        double result = 3.5 * 280 + 53145.3145 / -2.61;
        Expression e = auraExpressionBuilder.buildExpression("3.5 * 280 + 53145.3145 / -2.61", null);
        assertEquals("Unexpected expression evaluation", result, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        result = (536 + .346) * 1.56 / 634 + 11 % 5;
        e = auraExpressionBuilder.buildExpression("(536 + .346) * 1.56 / 634 + 11 % 5", null);
        assertEquals("Unexpected expression evaluation", result, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("1 - -5", null);
        // this is an integer
        assertEquals("Unexpected expression evaluation", 6.0, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("true ? true : false ? 16 : 21", null);
        assertEquals("Unexpected expression evaluation", true, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Boolean precedence respects Java conventions.
     */
    @Test
    public void testBoolPrecedence() throws Exception {
        boolean compare = 324.4326 < 259 / 134.6 + 2356;
        Expression e = auraExpressionBuilder.buildExpression("324.4326 < 259 / 134.6 + 2356", null);
        assertEquals("Boolean precedence not evaluated correctly", compare, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        compare = 324.4326 < 259 / (134.6 + 2356);
        e = auraExpressionBuilder.buildExpression("324.4326 < 259 / (134.6 + 2356)", null);
        assertEquals("Boolean precedence not evaluated correctly", compare, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("324.4326 == 259 / (134.6 + 2356) && (false || true)", null);
        assertEquals("Boolean precedence not evaluated correctly", Boolean.FALSE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("346 > 346 ? 6541 / 21 - 77 : 235.66", null);
        assertEquals("Boolean precedence not evaluated correctly", 235.66, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("false == false ? 16 : 21", null);
        assertEquals("Boolean precedence not evaluated correctly", 16L, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("false && false ? 16 : 21", null);
        assertEquals("Boolean precedence not evaluated correctly", 21L, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("true ? 16 : 21 < 20", null);
        assertEquals("Boolean precedence not evaluated correctly", 16L, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("! true && false", null);
        assertEquals("Boolean precedence not evaluated correctly", false, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Alternate relational operators can be parsed.
     */
    @Test
    public void testAlternateNames() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("55 eq 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.TRUE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("55 ne 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.FALSE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("55 ge 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.TRUE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("55 le 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.TRUE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("55 lt 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.FALSE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("55 gt 55", null);
        assertEquals("Unexpected expression evaluation using alternate relational operators", Boolean.FALSE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Number literals include integers, decimals, and exponents.
     */
    @Test
    public void testLiteralNumbers() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("5", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 5L, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("5.345", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 5.345, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("911.", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 911., l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression(".119", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", .119, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("1e10", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 1e10, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("2.e20", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 2.e20, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("0e0", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 0e0, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("1e01", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", 1e01, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression(".3e3", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Unexpected number literal value", .3e3, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * String literals require single quotes and may be empty.
     */
    @Test
    public void testLiteralStrings() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("'ahfdh'", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("ahfdh", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        verifyInvalidExpressionException("\"ahfdh\"", "unexpected token: '\"' at column 1 of expression: \"ahfdh\"");

        e = auraExpressionBuilder.buildExpression("''", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Boolean literals are case insensitive.
     */
    @Test
    public void testLiteralBools() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("true", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("Case sensitivity of Boolean literlas failed", Boolean.TRUE, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("TRUE", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Case sensitivity of Boolean literlas failed", Boolean.TRUE, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("false", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Case sensitivity of Boolean literlas failed", Boolean.FALSE, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("FALSE", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Case sensitivity of Boolean literlas failed", Boolean.FALSE, l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Property references can have multiple parts.
     */
    @Test
    public void testPropertyReference() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("im", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("im.parsing", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "parsing", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("im.not.nullish", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReferenceImpl) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "not", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming twice", "nullish", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("_i.am_very._.readable_", null);
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
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Property references can access array members
     */
    @Test
    public void testArrayAccessors() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("im[0]", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        PropertyReference pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference", "0", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("im.an[3151345]", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "im", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unexpected root of PropertyReference after stemming", "an", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference after stemming", "3151345", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("im.an[3151345].array", null);
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
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("multi[1][364]", null);
        assertEquals("Unexpected expression type", ExpressionType.PROPERTY, e.getExpressionType());
        pr = (PropertyReference) e;
        assertEquals("Unexpected root of PropertyReference", "multi", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access array member via PropertyReference", "1", pr.getRoot());
        pr = pr.getStem();
        assertEquals("Unable to access second array member via PropertyReference", "364", pr.getRoot());
        assertNull("Stemming end of PropertyReference should return null", pr.getStem());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Array access negative test cases
     */
    @Test
    public void testInvalidArrayAccessor() throws Exception {
        verifyInvalidExpressionException("[21]", "unexpected token: a left square bracket");
        verifyInvalidExpressionException("blah[letters]", "expecting a positive integer, found 'letters'");
        verifyInvalidExpressionException("postfix[5$]", "expecting a right square bracket, found '$'");
        verifyInvalidExpressionException("prefix[$2]", "expecting a positive integer, found '$2'");
        verifyInvalidExpressionException("negative[-5]", "expecting a positive integer, found '-'");
        verifyInvalidExpressionException("positive[+5]", "expecting a positive integer, found '+'");
        verifyInvalidExpressionException("decimal[5.5]", "expecting a positive integer, found '5.5'");
        verifyInvalidExpressionException("unclosed[5", "unexpected end of expression");
        verifyInvalidExpressionException("unopened5]", "unexpected token: a right square bracket at column 10 of expression: unopened5");
        verifyInvalidExpressionException("noindex[]", "expecting a positive integer, found ']'");
        verifyInvalidExpressionException("paren[(33)]", "expecting a positive integer, found '('");
    }

    /**
     * Consecutive boolean operations are parsed correctly.
     */
    @Test
    public void testBoolChain() throws Exception {
        verifyInvalidExpressionException("true == true == true", "unexpected token: '=='");
        verifyInvalidExpressionException("1 > 2 == true", "unexpected token: '=='");
        verifyInvalidExpressionException("true == 4 < 5", "unexpected token: '<'");
    }

    /**
     * Escape sequences in strings are parsed correctly.
     */
    @Test
    public void testEscapedString() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("\t'over there! '\r\n\n", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "over there! ", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression(" '\\'stuff me,\\' the unfilled teddy bear said to the child.'", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "'stuff me,' the unfilled teddy bear said to the child.",
                l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("'the child blinked and replied,\\n \\t\\'I\\'d be delighted.\\''", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "the child blinked and replied,\n \t'I'd be delighted.'",
                l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("'top\\\\\\\"2\\\"\\b\\f\\r\\n\\tbottom'", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Escape sequences not parsed correctly", "top\\\"2\"\b\f\r\n\tbottom", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Unescaped backslash in string should throw a parse exception.
     */
    // currently fails when slash up front
    @Test
    public void testNonEscapeBackslashInString() throws Exception {
        verifyInvalidExpressionException("'not\\u32unicode'", "mismatched character 'u' expecting set null");
        verifyInvalidExpressionException("'\\'", "expecting ''', found '<EOF>'");
        verifyInvalidExpressionException("'back \\ slash'", "unexpected token: ' '");
        verifyInvalidExpressionException("'\\escaped'", "unexpected token: 'e'");
        verifyInvalidExpressionException("'not\\'", "expecting ''', found '<EOF>'");
    }

    /**
     * Unicode escapes in strings are parsed correctly.
     */
    @Test
    public void testUnicodeEscapesInString() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("'\\u0032'", null);
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        LiteralImpl l = (LiteralImpl) e;
        assertEquals("2", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("'good\\u0032go'", null);
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("good2go", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("'Ocean\\'s \\u0031\\u0031'", null);
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("Ocean's 11", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("'\\u0031\\u0032\\u0020Monkeys\\u0020\\u0099'", null);
        assertEquals(ExpressionType.LITERAL, e.getExpressionType());
        l = (LiteralImpl) e;
        assertEquals("12 Monkeys \u0099", l.getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Operators may be accessed as function calls and may be nested.
     */
    @Test
    public void testFunctionCalls() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("or(true, false)", null);
        assertEquals("Operator could not be accessed as function call", Boolean.TRUE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("and(false, true)", null);
        assertEquals("Operator could not be accessed as function call", Boolean.FALSE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
        e = auraExpressionBuilder.buildExpression("add(24, 23525)", null);
        assertEquals("Operator could not be accessed as function call", 24 + 23525, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("sub(24, add(63, 23525))", null);
        assertEquals("Error evaluating nested operators as function calls", 24.0 - (63 + 23525), e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("add('The child', ' picked up the teddy bear in one hand')", null);
        assertEquals("Error adding strings with add operator as function call",
                "The child picked up the teddy bear in one hand", e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("notequals(add(' and grasped a', ' pick axe in the other.'), '\"Wait!\" screamed the bear.')", null);
        assertEquals("Error in evaluating nested operators as function calls", Boolean.TRUE, e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);

        e = auraExpressionBuilder.buildExpression("if(equals(true, greaterthan(-2, -52)), add('The child hesitated, ', '\"I cannot stuff you without making a hole to stuff into.\"'), ' The bear squinted and noodled on this for a minute.')", null);
        assertEquals("Error in evaluating nested operators as function calls",
                "The child hesitated, \"I cannot stuff you without making a hole to stuff into.\"", e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Non-english string literals are parsed correctly.
     */
    @Test
    public void testNonEnglishString() throws Exception {
        Expression e = auraExpressionBuilder.buildExpression("'天ぷらが食べたいです'", null);
        assertEquals("Unexpected expression type", ExpressionType.LITERAL, e.getExpressionType());
        assertEquals("Unexpected evaluation of non-english string", "天ぷらが食べたいです", e.evaluate(null));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Missing operands throw a parse exception.
     */
    @Test
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
    @Test
    public void testIncompleteParentheses() throws Exception {
        verifyInvalidExpressionException("(1", "unexpected end of expression");
        verifyInvalidExpressionException("2)", "unexpected token: ')'");
    }

    /**
     * Unclosed string throws a parse exception.
     */
    @UnAdaptableTest
    @Test
    public void testIncompleteString() throws Exception {
        verifyInvalidExpressionException("'unclosed string", "expecting ''', found '<EOF>'");
        verifyInvalidExpressionException("unclosed string'", "unexpected token: an identifier");
    }

    /**
     * Unclosed braces throws a parse exception.
     */
    @Test
    public void testIncompleteBraces() throws Exception {
        verifyInvalidExpressionException("{!v.noend", "unclosed brace");
        verifyInvalidExpressionException("v.dangled}", "unexpected token: '}'");
        verifyInvalidExpressionException("v.x + {!v.inner}", "unexpected token: '{'");
    }

    /**
     * Invalid characters in property names throw a parse exception.
     */
    @Test
    public void testPropertyNameInvalid() throws Exception {
        verifyInvalidExpressionException("\\upfront", "unexpected token: '\\'");
        verifyInvalidExpressionException("followup\\", "unexpected token: '\\'");
        verifyInvalidExpressionException("in\\side", "unexpected token: '\\'");
        verifyInvalidExpressionException("5horsemen", "unexpected token: 'horsemen'");
        verifyInvalidExpressionException("9.1.1", "unexpected token: '.1'");
        verifyInvalidExpressionException("in.2.u", "unexpected token: a floating point number at column 3 of expression: in.2.u");
        verifyInvalidExpressionException(".hidden", "unexpected token: a period");
        verifyInvalidExpressionException("ends.with.", "unexpected end of expression");
        verifyInvalidExpressionException("man...middle", "expecting an identifier, found '.'");
    }

    /**
     * Undefined function
     */
    @Test
    public void testUndefinedFunction() throws Exception {
        try {
            auraExpressionBuilder.buildExpression("undefined(4)", null);
            fail("Expecting AuraRuntimeException for undefined function");
        } catch (AuraRuntimeException e) {
            assertTrue("Unexpected error message trying to parse <undefined(4)>. Expected to start with: "
                    + "No function found for key: undefined" + ". But got: " + e.getMessage(), e.getMessage()
                    .startsWith("No function found for key: undefined"));
        }
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Multiple statements, separated by a semicolon
     */
    @Test
    public void testMultipleStatements() throws Exception {
        verifyInvalidExpressionException("5==1;5==1;", "unexpected token: ';' at column 5");
    }

    /**
     * Invalid syntax - consecutive property names
     */
    @Test
    public void testMultipleProperties() throws Exception {
        verifyInvalidExpressionException("test invalid", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals
     */
    @Test
    public void testMultipleLiterals() throws Exception {
        verifyInvalidExpressionException("5 'invalid'", "unexpected token: ''invalid''");
    }

    /**
     * Invalid syntax - consecutive functions
     */
    @Test
    public void testMultipleFunctions() throws Exception {
        verifyInvalidExpressionException("add() subtract()", "unexpected token: 'subtract'");
    }

    /**
     * Invalid syntax - consecutive property names separated by newline
     */
    @Test
    public void testMultilineProperty() throws Exception {
        verifyInvalidExpressionException("invalid\r\ntest", "unexpected token: an identifier");
    }

    /**
     * Invalid syntax - consecutive literals separated by newline
     */
    @Test
    public void testMultilineLiteral() throws Exception {
        verifyInvalidExpressionException("5\r\n1", "unexpected token: '1'");
    }

    /**
     * Invalid syntax - consecutive literals separated by newline
     */
    @Test
    public void testLocationInErrorMessage() throws Exception {
        verifyInvalidExpressionException("5\r\n  1", "unexpected token: '1' at line 2, column 3");
    }

    /**
     * Verify the correct exception type is thrown and contains the correct error message.
     */
    private void verifyInvalidExpressionException(String expression, String msgStartsWith) throws Exception {
        try {
            auraExpressionBuilder.buildExpression(expression, null);
            fail("No exception thrown for <" + expression + ">. Expected InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertTrue("Unexpected error message trying to parse <" + expression + ">. Expected to start with: "
                    + msgStartsWith + ". But got: " + e.getMessage(), e.getMessage().startsWith(msgStartsWith));
        }
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }
}
