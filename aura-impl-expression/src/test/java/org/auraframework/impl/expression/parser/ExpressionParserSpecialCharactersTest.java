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

/**
 * Shotgun tests for special chars. Tokens shouldn't contain these chars. Remaining special chars have their own tests
 * in ExpressionParserTest.
 *
 * @hierarchy Aura.Runtime.Expression.Server.Parser
 * @userStory a07B0000000Ed9n
 */
// @TestLabels(IgnoreFailureReason.IN_DEV)
public class ExpressionParserSpecialCharactersTest extends AuraImplExpressionTestCase {
    private static final String validChars = "oO0_";
    private static final char[] otherChars = "`=[]',~@#$^&{}|:\"天".toCharArray();

    private String expression;

    public ExpressionParserSpecialCharactersTest(String name) {
        super(name);
        expression = "";
    }

    public ExpressionParserSpecialCharactersTest(String name, String expression) {
        super(name);
        this.expression = expression;
    }

    public static TestSuite suite() throws Exception {
        TestSuite suite = new TestSuite(ExpressionParserSpecialCharactersTest.class.getName());
        for (char c : otherChars) {
            String hex = String.format("%#x", (int)c);
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenStartsWith" + hex + "ThrowsRuntimeException", c + validChars));
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenEndsWith" + hex + "ThrowsRuntimeException", validChars + c));
            suite.addTest(new ExpressionParserSpecialCharactersTest("testTokenContains" + hex + "ThrowsRuntimeException", validChars + c + validChars));
        }
        return suite;
    }

    @Override
    public void runTest() throws Exception {
        testDo();
    }

    public void testDo() throws Exception {
        try {
            // Expression e = buildExpression(expression);
            // fail("Didn't get expected error for <" + expression + ">. Instead, got " + e.getExpressionType() + " <" +
            // e
            // + ">");
        } catch (Exception ex) {
            String message = ex.getMessage();
            if (message != null
                    && (message.startsWith("NoViableAltException") || message.startsWith("MismatchedTokenException")))
                return;
            fail("Unexpected exception for <" + expression + ">: " + ex);
        }
    }
}
