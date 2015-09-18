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

import java.util.List;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.java.provider.TestTokenMapProvider;
import org.auraframework.impl.root.parser.handler.TokensDefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Unit tests for {@link TokensDefHandler}.
 */
public class TokensDefHandlerTest extends StyleTestCase {
    public TokensDefHandlerTest(String name) {
        super(name);
    }

    public void testTokens() throws Exception {
        TokensDef def = addSeparateTokens(tokens().token("test1", "1").token("test2", "2")).getDef();

        Map<String, TokenDef> tokens = def.getDeclaredTokenDefs();
        assertEquals("didn't get expected number of tokens", 2, tokens.size());

        assertTrue("didn't find expected token", tokens.containsKey("test1"));
        assertEquals("incorrect value for token", "2", tokens.get("test2").getValue());
    }

    public void testImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        DefDescriptor<TokensDef> import2 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        DefDescriptor<TokensDef> import3 = addSeparateTokens(tokens()
                .token("token1", "1").token("token2", "2").token("token3", "3"));

        TokensDef def = addSeparateTokens(tokens()
                .imported(import1)
                .imported(import2)
                .imported(import3))
                .getDef();

        List<DefDescriptor<TokensDef>> imports = def.getDeclaredImports();
        assertEquals(3, imports.size());
    }

    public void testImportAfterDeclared() throws Exception {
        DefDescriptor<TokensDef> imp = addSeparateTokens(tokens().token("token1", "1"));

        try {
            addSeparateTokens(tokens().token("token2", "2").imported(imp)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must come before");
        }
    }

    public void testInvalidChild() throws Exception {
        try {
            addSeparateTokens("<aura:tokens><aura:foo/></aura:tokens>").getDef();
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:tokens");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Found unexpected tag");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            addSeparateTokens("<aura:tokens>Test</aura:tokens>").getDef();
            fail("Should have thrown AuraException because text is between aura:tokens tags");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    public void testDuplicateTokens() throws Exception {
        try {
            addSeparateTokens(tokens().token("test", "1").token("test", "1")).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate token");
        }
    }

    public void testDuplicateImports() throws Exception {
        DefDescriptor<TokensDef> import1 = addSeparateTokens(tokens().token("token1", "1"));

        try {
            addSeparateTokens(tokens().imported(import1).imported(import1)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate import");
        }
    }

    public void testExtends() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        DefDescriptor<TokensDef> child = addSeparateTokens(tokens().parent(parent));
        assertEquals(child.getDef().getExtendsDescriptor(), parent);
    }

    public void testEmptyExtends() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens("<aura:tokens extends=' '/>");
        assertNull(desc.getDef().getExtendsDescriptor());
    }

    public void testProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        assertEquals(TestTokenDescriptorProvider.REF, desc.getDef().getDescriptorProvider().getQualifiedName());
    }

    public void testEmptyProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(""));
        assertNull(desc.getDef().getDescriptorProvider());
    }

    public void testMapProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        assertEquals(TestTokenMapProvider.REF, desc.getDef().getMapProvider().getQualifiedName());
    }

    public void testEmptyMapProvider() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(""));
        assertNull(desc.getDef().getMapProvider());
    }
}
