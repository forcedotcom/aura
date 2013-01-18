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

import junit.framework.TestSuite;

import org.auraframework.impl.expression.AuraImplExpressionTestCase;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

/**
 * Shotgun tests for special chars. Tokens shouldn't contain these chars. Remaining special chars have their own tests
 * in ExpressionParserTest.
 * 
 * @userStory a07B0000000Ed9n
 */
public class ExpressionParserSpecialCharactersTest extends AuraImplExpressionTestCase {
    private static final String validChars = "oO0_";
    private static final char[] otherChars = "`=[]',~@#^&{}|:\"天".toCharArray();
    private static final String[] errorMsgStartsWith = { "unexpected token: '`'",
            "expecting '=', found 'o'",
            "unexpected token: a left square bracket",
            "unexpected token: a right square bracket",
            "expecting ''', found '<EOF>'",
            "unexpected token: a comma",
            "unexpected token: '~'",
            "unexpected token: '@'",
            "unexpected token: '#'",
            "unexpected token: '^'",
            "expecting '&', found 'o'",
            "unclosed brace",
            "unexpected token: '}'",
            "expecting '|', found 'o'",
            "unexpected token: a colon",
            "unexpected token: '\"'",
            "unexpected token: '天'",
    };
    private static final String[] errorMsgEndsWith = { "unexpected token: '`'",
            "expecting '=', found '<EOF>'",
            "unexpected end of expression",
            "unexpected token: an identifier",
            "expecting ''', found '<EOF>'",
            "unexpected token: ','",
            "unexpected token: '~'",
            "unexpected token: '@'",
            "unexpected token: '#'",
            "unexpected token: '^'",
            "expecting '&', found '<EOF>'",
            "unexpected token: '{'",
            "unexpected token: '}'",
            "expecting '|', found '<EOF>'",
            "unexpected token: ':'",
            "unexpected token: '\"'",
            "unexpected token: '天'",
    };
    private static final String[] errorMsgContains = { "unexpected token: '`'",
            "expecting '=', found 'o'",
            "expecting a positive integer, found 'oO0_'",
            "unexpected token: an identifier",
            "expecting ''', found '<EOF>'",
            "unexpected token: ','",
            "unexpected token: '~'",
            "unexpected token: '@'",
            "unexpected token: '#'",
            "unexpected token: '^'",
            "expecting '&', found 'o'",
            "unexpected token: '{'",
            "unexpected token: '}'",
            "expecting '|', found 'o'",
            "unexpected token: ':' ",
            "unexpected token: '\"'",
            "unexpected token: '天'",
    };

    private final String expression;
    private final String msgStartsWith;

    public ExpressionParserSpecialCharactersTest(String name) {
        super(name);
        expression = "";
        msgStartsWith = "";
    }

    public ExpressionParserSpecialCharactersTest(String name, String expression, String errorMsg) {
        super(name);
        this.expression = expression;
        this.msgStartsWith = errorMsg;
    }

    public static TestSuite suite() throws Exception {
        TestSuite suite = new TestSuite(ExpressionParserSpecialCharactersTest.class.getName());
        for (int i = 0; i < otherChars.length; i++) {
            char c = otherChars[i];
            String hex = String.format("%#x", (int) c);
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenStartsWith" + hex
                    + "ThrowsQuickFixException", c + validChars, errorMsgStartsWith[i]));
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenEndsWith" + hex
                    + "ThrowsQuickFixException", validChars + c, errorMsgEndsWith[i]));
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenContains" + hex
                    + "ThrowsQuickFixException", validChars + c + validChars, errorMsgContains[i]));
        }
        return suite;
    }

    @Override
    public void runTest() throws Exception {
        testDo();
    }

    public void testDo() throws Exception {
        try {
            buildExpression(expression);
            fail("No execption thrown for <" + expression + ">. Expected InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertTrue("Unexpected error message trying to parse <" + expression + ">. Expected to start with: "
                    + msgStartsWith + ". But got: " + e.getMessage(), e.getMessage().startsWith(msgStartsWith));
        }
    }
}
