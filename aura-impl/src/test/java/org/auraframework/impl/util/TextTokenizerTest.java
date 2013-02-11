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
package org.auraframework.impl.util;

import java.util.List;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.impl.util.TextTokenizer.Token;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

public class TextTokenizerTest extends AuraImplTestCase {
    private static final String[] testText = new String[] { "this is text", "{!this.is.an.expression}",
            "\n\nOther text\n\n" };

    private static final String wholeText = String.format("%s%s%s", testText[0], testText[1], testText[2]);

    private static final String testWhitespace = "     {!true}     {!false}     five spaces";

    public TextTokenizerTest(String name) {
        super(name);
    }

    public void testUnwrap() {
        assertEquals("ab.cab", TextTokenizer.unwrap("{!ab.cab}"));
        assertEquals("ab.cab", TextTokenizer.unwrap("ab.cab"));
        assertEquals("{!ab.cab", TextTokenizer.unwrap("{!ab.cab"));
        assertEquals("{ab.cab}", TextTokenizer.unwrap("{ab.cab}"));
    }

    /**
     * Test method for {@link TextTokenizer#TextTokenizer(String, Location)}.
     */
    public void testTextTokenizer() throws AuraValidationException {
        TextTokenizer.TokenType[] testTypes = new TextTokenizer.TokenType[] { TextTokenizer.TokenType.PLAINTEXT,
                TextTokenizer.TokenType.EXPRESSION, TextTokenizer.TokenType.PLAINTEXT };

        TextTokenizer tokenizer = TextTokenizer.tokenize(wholeText, null);
        assertEquals("Wrong number of TextTokenizer tokens returned", 3, tokenizer.size());
        int i = 0;
        for (Token token : tokenizer) {
            assertEquals("Wrong Type", testTypes[i], token.getType());
            assertEquals("Wrong Value", testText[i], token.getRawValue());
            i++;
        }
    }

    public void testAsValues() throws Exception {
        TextTokenizer tokenizer = TextTokenizer.tokenize(wholeText, null);
        ComponentDefHandler cdh = new ComponentDefHandler(null, null, null);
        try {
            tokenizer.asValue(cdh);
            fail("Should have failed because of mixed expression and text");
        } catch (Exception e) {
            checkExceptionStart(e, InvalidExpressionException.class,
                    "Cannot mix expression and literal string in attribute value");
        }
    }

    public void testSingleAsValue() throws Exception {
        TextTokenizer tokenizer = TextTokenizer.tokenize(testText[0], null);
        ComponentDefHandler cdh = new ComponentDefHandler(null, null, null);
        Object o = tokenizer.asValue(cdh);
        assertTrue("Token value is of wrong type", o instanceof String);
        assertEquals("Incorrect value returned from asValue()", testText[0], o.toString());

        tokenizer = TextTokenizer.tokenize(testText[1], null);
        o = tokenizer.asValue(cdh);
        assertTrue("Token value is of wrong type", o instanceof PropertyReferenceImpl);
        PropertyReferenceImpl e = (PropertyReferenceImpl) o;
        assertEquals("Incorrect value returned from asValue()", testText[1], e.toString(true));
    }

    public void testAsComponentDefRefs() throws Exception {
        TextTokenizer tokenizer = TextTokenizer.tokenize(wholeText, null);
        ComponentDefHandler cdh = new ComponentDefHandler(null, null, null);
        List<ComponentDefRef> l = tokenizer.asComponentDefRefs(cdh);
        assertEquals("Wrong number of ComponentDefRefs returned", 3, l.size());
        ComponentDefRef c = l.get(0);
        assertEquals("Incorrect ComponentDefRef type", "text", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef value", testText[0], c.getAttributeDefRef("value").getValue());

        c = l.get(1);
        assertEquals("Incorrect ComponentDefRef type", "expression", c.getDescriptor().getName());
        Object o = c.getAttributeDefRef("value").getValue();
        assertTrue("ComponentDefRef value is of wrong type", o instanceof PropertyReferenceImpl);
        assertEquals("Incorrect ComponentDefRef value", testText[1], ((PropertyReferenceImpl) o).toString(true));

        c = l.get(2);
        assertEquals("Incorrect ComponentDefRef type", "text", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef value", testText[2], c.getAttributeDefRef("value").getValue());
    }

    public void testWhitespacePreserve() throws Exception {
        String[] descNames = new String[] { //
        "text", //
                "expression", //
                "text", //
                "expression", //
                "text" };
        String[] testResults = new String[] { //
        "[value=     ]", //
                "[value=org.auraframework.impl.expression.LiteralImpl", //
                "[value=     ]", //
                "[value=org.auraframework.impl.expression.LiteralImpl", //
                "[value=     five spaces]" };

        ComponentDefHandler cdh = new ComponentDefHandler(null, null, null);
        List<ComponentDefRef> compList = TextTokenizer.tokenize(testWhitespace, null, WhitespaceBehavior.PRESERVE)
                .asComponentDefRefs(cdh);
        assertEquals("Wrong number of ComponentDefRefs returned", descNames.length, compList.size());
        int i = 0;
        for (ComponentDefRef cdf : compList) {
            assertEquals("Wrong Token Type", descNames[i], cdf.getName());
            Set<Entry<DefDescriptor<AttributeDef>, AttributeDefRef>> attributes = cdf.getAttributeValues().entrySet();
            // Truncate at expected result size
            String test = attributes.toString().substring(0, testResults[i].length());
            assertEquals("Did not preserve whitespace", testResults[i], test);
            i++;
        }
    }

    public void testWhitespaceOptimize() throws Exception {
        String[] descNames = new String[] { "expression", "expression", "text" };
        String[] testResults = new String[] { "[value=org.auraframework.impl.expression.LiteralImpl",
                "[value=org.auraframework.impl.expression.LiteralImpl", "[value=     five spaces]" };

        ComponentDefHandler cdh = new ComponentDefHandler(null, null, null);
        List<ComponentDefRef> compList = TextTokenizer.tokenize(testWhitespace, null, WhitespaceBehavior.OPTIMIZE)
                .asComponentDefRefs(cdh);
        assertEquals("Wrong number of ComponentDefRefs returned", descNames.length, compList.size());
        int i = 0;
        for (ComponentDefRef cdf : compList) {
            assertEquals("Wrong Token Type", descNames[i], cdf.getName());
            Set<Entry<DefDescriptor<AttributeDef>, AttributeDefRef>> attributes = cdf.getAttributeValues().entrySet();
            // Truncate at expected result size
            String test = attributes.toString().substring(0, testResults[i].length());
            assertEquals("Did not optimize whitespace", testResults[i], test);
            i++;
        }
    }

    public void testIncompleteExpressionQuickFix() throws Exception {
        try {
            TextTokenizer.tokenize("{!incompleteExpression", null);
            fail("Expected InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class, "Unterminated expression");
        }
    }

    public void testCurlyBangInversionQuickFix() throws Exception {
        try {
            TextTokenizer.tokenize("!{malformed}", null);
            fail("Expected InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class,
                    "Found an expression starting with '!{' but it should be '{!'");
        }
    }
}
