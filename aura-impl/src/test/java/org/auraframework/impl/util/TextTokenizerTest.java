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
package org.auraframework.impl.util;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.auraframework.adapter.ExpressionBuilder;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.AuraExpressionBuilder;
import org.auraframework.impl.expression.ExpressionFunctions;
import org.auraframework.impl.expression.LiteralImpl;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.parser.handler.ExpressionContainerHandler;
import org.auraframework.impl.util.TextTokenizer.Token;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

/**
 * Unit tests for the {@link TextTokenizer} class.
 */
@RunWith(MockitoJUnitRunner.class)
public class TextTokenizerTest {

    @Mock
    ContextService contextService;
    
    @Mock
    DefinitionService definitionService;
    
    private ExpressionBuilder expressionBuilder;
    
    @Before
    public void setup() {
        expressionBuilder = new AuraExpressionBuilder(new ExpressionFunctions(contextService, definitionService));
    }
    
    @Test
    public void testUnwrap() {
        assertEquals("ab.cab", TextTokenizer.unwrap("{!ab.cab}"));
        assertEquals("ab.cab", TextTokenizer.unwrap("ab.cab"));
        assertEquals("{!ab.cab", TextTokenizer.unwrap("{!ab.cab"));
        assertEquals("{ab.cab}", TextTokenizer.unwrap("{ab.cab}"));
    }

    /**
     * Test method for {@link TextTokenizer#tokenize(String, Location)}.
     */
    @Test
    public void testTextTokenizerString() throws AuraValidationException {
        String theText = "some text";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, theText, null);
        assertEquals("Wrong number of TextTokenizer tokens returned", 1, tokenizer.size());
        Token token = tokenizer.iterator().next();
        assertEquals(TextTokenizer.TokenType.PLAINTEXT, token.getType());
        assertEquals(theText, token.getRawValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    /**
     * Test method for {@link TextTokenizer#tokenize(String, Location)}.
     */
    @Test
    public void testTextTokenizerExpr() throws AuraValidationException {
        String theText = "{!an.expression}";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, theText, null);
        assertEquals("Wrong number of TextTokenizer tokens returned", 1, tokenizer.size());
        Token token = tokenizer.iterator().next();
        assertEquals(TextTokenizer.TokenType.EXPRESSION, token.getType());
        assertEquals(theText, token.getRawValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testTextTokenizerStringExpr() throws AuraValidationException {
        String text1 = "some text";
        String text2 = "{!an.expression}";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, text1+text2, null);
        assertEquals("Wrong number of TextTokenizer tokens returned", 2, tokenizer.size());
        Iterator<Token> iter = tokenizer.iterator();
        Token token1 = iter.next();
        Token token2 = iter.next();
        assertEquals(TextTokenizer.TokenType.PLAINTEXT, token1.getType());
        assertEquals(text1, token1.getRawValue());
        assertEquals(TextTokenizer.TokenType.EXPRESSION, token2.getType());
        assertEquals(text2, token2.getRawValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testAsValueFailsWithTwo() throws Exception {
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, "text{!an.expression}", null);
        InvalidExpressionException expected = null;

        try {
            tokenizer.asValue(null);
        } catch (InvalidExpressionException e) {
            expected = e;
        }
        assertNotNull(expected);
        assertTrue(expected.getMessage().startsWith("Cannot mix expression and literal string in attribute value"));
    }

    @Test
    public void testTextAsValue() throws Exception {
        ExpressionContainerHandler valueHolder = Mockito.mock(ExpressionContainerHandler.class);
        String input = "some text";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, input, null);
        Object o = tokenizer.asValue(valueHolder);
        assertTrue("Token value is of wrong type", o instanceof String);
        assertEquals("Incorrect value returned from asValue()", input, o.toString());
        Mockito.verifyZeroInteractions(contextService, definitionService, valueHolder);
    }

    @Test
    @SuppressWarnings({"rawtypes","unchecked"})
    public void testRefExprAsValue() throws Exception {
        ExpressionContainerHandler valueHolder = Mockito.mock(ExpressionContainerHandler.class);
        String reference = "an.expr";
        String input = "{!"+reference+"}";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, input, null);
        Object o = tokenizer.asValue(valueHolder);
        assertTrue("Token value is of wrong type", o instanceof PropertyReference);
        assertEquals("Incorrect value returned from asValue()", reference, o.toString());
        PropertyReference pr = (PropertyReference)o;
        assertFalse(pr.isByValue());
        ArgumentCaptor<Set> captor = ArgumentCaptor.forClass(Set.class);
        Mockito.verify(valueHolder, Mockito.times(1)).addExpressionReferences(captor.capture());
        Set arg = captor.getValue();
        assertEquals(1, arg.size());
        assertTrue(arg.contains(pr));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    @SuppressWarnings({"rawtypes","unchecked"})
    public void testByValueExprAsValue() throws Exception {
        ExpressionContainerHandler valueHolder = Mockito.mock(ExpressionContainerHandler.class);
        String reference = "an.expr";
        String input = "{#"+reference+"}";
        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, input, null);
        Object o = tokenizer.asValue(valueHolder);
        assertTrue("Token value is of wrong type", o instanceof PropertyReference);
        assertEquals("Incorrect value returned from asValue()", reference, o.toString());
        PropertyReference pr = (PropertyReference)o;
        assertTrue(pr.isByValue());
        ArgumentCaptor<Set> captor = ArgumentCaptor.forClass(Set.class);
        Mockito.verify(valueHolder, Mockito.times(1)).addExpressionReferences(captor.capture());
        Set arg = captor.getValue();
        assertEquals(1, arg.size());
        assertTrue(arg.contains(pr));
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testAsComponentDefRefs() throws Exception {
        ExpressionContainerHandler valueHolder = Mockito.mock(ExpressionContainerHandler.class);
        String first = "stuff and nonsense ";
        String secondReference = "an.expression";
        String second = "{!"+secondReference+"}";
        String third = " more text";

        TextTokenizer tokenizer = TextTokenizer.tokenize(expressionBuilder, first+second+third, null);
        List<ComponentDefRef> l = tokenizer.asComponentDefRefs(valueHolder);

        assertEquals("Wrong number of ComponentDefRefs returned", 3, l.size());

        ComponentDefRef c = l.get(0);
        assertEquals("Incorrect ComponentDefRef type", "text", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef value", first, c.getAttributeDefRef("value").getValue());

        c = l.get(1);
        assertEquals("Incorrect ComponentDefRef type", "expression", c.getDescriptor().getName());
        Object o = c.getAttributeDefRef("value").getValue();
        assertTrue("ComponentDefRef value is of wrong type", o instanceof PropertyReferenceImpl);
        assertEquals("Incorrect ComponentDefRef value", secondReference, o.toString());

        c = l.get(2);
        assertEquals("Incorrect ComponentDefRef type", "text", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef value", third, c.getAttributeDefRef("value").getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testWhitespaceOptimize() throws Exception {
        ExpressionContainerHandler valueHolder = Mockito.mock(ExpressionContainerHandler.class);
        String testWhitespace = "     {!true}     {!false}     five spaces";

        List<ComponentDefRef> compList = TextTokenizer.tokenize(expressionBuilder, testWhitespace, null).asComponentDefRefs(valueHolder);
        assertEquals("Wrong number of ComponentDefRefs returned", 3, compList.size());

        ComponentDefRef c = compList.get(0);
        assertEquals("Incorrect ComponentDefRef type", "expression", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef class", LiteralImpl.class,
                    c.getAttributeDefRef("value").getValue().getClass());

        c = compList.get(1);
        assertEquals("Incorrect ComponentDefRef type", "expression", c.getDescriptor().getName());
        assertEquals("Incorrect ComponentDefRef class", LiteralImpl.class,
                    c.getAttributeDefRef("value").getValue().getClass());

        c = compList.get(2);
        assertEquals("Incorrect ComponentDefRef type", "text", c.getName());
        assertEquals("Incorrect ComponentDefRef value",
                "     five spaces",
                c.getAttributeDefRef("value").getValue());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testIncompleteExpressionQuickFix() throws Exception {
        InvalidExpressionException expected = null;

        try {
            TextTokenizer.tokenize(expressionBuilder, "{!incompleteExpression", null);
        } catch (InvalidExpressionException e) {
            expected = e;
        }
        assertNotNull("Expected InvalidExpressionException", expected);
        assertEquals("Unexpected message", "Unterminated expression", expected.getMessage());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }

    @Test
    public void testCurlyBangInversionQuickFix() throws Exception {
        InvalidExpressionException expected = null;

        try {
            TextTokenizer.tokenize(expressionBuilder, "!{malformed}", null);
        } catch (InvalidExpressionException e) {
            expected = e;
        }
        assertNotNull("Expected InvalidExpressionException", expected);
        assertEquals("Unexpected message",
                "Found an expression starting with '!{' but it should be '{!'", expected.getMessage());
        Mockito.verifyZeroInteractions(contextService, definitionService);
    }
}
