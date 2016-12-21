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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.java.provider.TestTokenMapProvider;
import org.auraframework.impl.root.parser.handler.TokensDefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import java.util.List;
import java.util.Map;

/**
 * Unit tests for {@link TokensDefHandler}.
 */
public class TokensDefHandlerTest extends StyleTestCase {
    @Test
    public void testTokens() throws Exception {
        TokensDef def = definitionService.getDefinition(addSeparateTokens(tokens().token("test1", "1").token("test2", "2")));

        Map<String, TokenDef> tokens = def.getDeclaredTokenDefs();
        assertEquals("didn't get expected number of tokens", 2, tokens.size());

        assertTrue("didn't find expected token", tokens.containsKey("test1"));
        assertEquals("incorrect value for token", "2", tokens.get("test2").getValue());
    }

    @Test
    public void testImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        DefDescriptor<TokensDef> import2 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        DefDescriptor<TokensDef> import3 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        TokensDef def = definitionService.getDefinition(addSeparateTokens(tokens()
                .imported(import1)
                .imported(import2)
                .imported(import3)));

        List<DefDescriptor<TokensDef>> imports = def.getImportedDefs();
        assertEquals(3, imports.size());
    }

    @Test
    public void testImportAfterDeclared() throws Exception {
        DefDescriptor<TokensDef> imp = addSeparateTokens(tokens().token("token1", "1"));

        try {
        	definitionService.getDefinition(addSeparateTokens(tokens().token("token2", "2").imported(imp)));
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must come before");
        }
    }

    @Test
    public void testInvalidChild() throws Exception {
        try {
        	definitionService.getDefinition(addSeparateTokens("<aura:tokens><aura:foo/></aura:tokens>"));
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:tokens");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Found unexpected tag");
        }
    }

    @Test
    public void testWithTextBetweenTag() throws Exception {
        try {
        	definitionService.getDefinition(addSeparateTokens("<aura:tokens>Test</aura:tokens>"));
            fail("Should have thrown AuraException because text is between aura:tokens tags");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    @Test
    public void testDuplicateTokens() throws Exception {
        try {
        	definitionService.getDefinition(addSeparateTokens(tokens().token("test", "1").token("test", "1")));
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate token");
        }
    }

    @Test
    public void testDuplicateImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("token1", "1"));

        try {
        	definitionService.getDefinition(addSeparateTokens(tokens().imported(import1).imported(import1)));
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate import");
        }
    }

    @Test
    public void testExtends() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> child = addSeparateTokens(tokens().parent(parent));
        assertEquals(definitionService.getDefinition(child).getExtendsDescriptor(), parent);
    }

    @Test
    public void testEmptyExtends() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens("<aura:tokens extends=' '/>");
        assertNull(definitionService.getDefinition(desc).getExtendsDescriptor());
    }

    @Test
    public void testProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        assertEquals(TestTokenDescriptorProvider.REF, definitionService.getDefinition(desc).getDescriptorProvider().getQualifiedName());
    }

    @Test
    public void testEmptyProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(""));
        assertNull(definitionService.getDefinition(desc).getDescriptorProvider());
    }

    @Test
    public void testMapProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        assertEquals(TestTokenMapProvider.REF, definitionService.getDefinition(desc).getMapProvider().getQualifiedName());
    }

    @Test
    public void testEmptyMapProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(""));
        assertNull(definitionService.getDefinition(desc).getMapProvider());
    }
}
