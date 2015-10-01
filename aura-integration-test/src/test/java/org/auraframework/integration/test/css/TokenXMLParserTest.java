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
package org.auraframework.integration.test.css;

import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.handler.TokenDefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Iterables;

/**
 * Unit tests for {@link TokenDefHandler}.
 */
public class TokenXMLParserTest extends StyleTestCase {
    public TokenXMLParserTest(String name) {
        super(name);
    }

    public void testName() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red'/>");
        assertEquals("didn't get expected aura:token name", "color", def.getName());
    }

    public void testValue() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red'/>");
        assertEquals("didn't get expected aura:token value", "red", def.getValue().toString());
    }

    public void testProperty() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red' property='color'/>");
        assertEquals(1, def.getAllowedProperties().size());
        assertTrue(def.getAllowedProperties().contains("color"));
    }

    public void testMultipleProperties() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red' property='color, background-color'/>");
        assertEquals(2, def.getAllowedProperties().size());
        assertTrue(def.getAllowedProperties().contains("color"));
        assertTrue(def.getAllowedProperties().contains("background-color"));
    }

    public void testPropertyAbsent() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red'/>");
        assertTrue(def.getAllowedProperties().isEmpty());
    }

    public void testDescription() throws Exception {
        TokenDef def = source("<aura:token name='color' value='red' description='test'/>");
        assertEquals("didn't get expected aura:token description", "test", def.getDescription());
    }

    public void testValueIsExpression() throws Exception {
        TokenDef def = source("<aura:token name='myColor' value='{!color}'/><aura:token name='color' value='red'/>");
        assertTrue(def.getValue() instanceof PropertyReference);
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:token name='f' value='f'><ui:button/></aura:token>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No children");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:token name='f' value='f'>text</aura:token>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    public void testMissingName() throws Exception {
        try {
            source("<aura:token  value='f'/>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'name'");
        }
    }

    /** utility */
    private TokenDef source(CharSequence contents) throws QuickFixException {
        TokensDef def = addSeparateTokens(String.format("<aura:tokens>%s</aura:tokens>", contents)).getDef();
        return Iterables.getFirst(def.getDeclaredTokenDefs().values(), null);
    }
}
