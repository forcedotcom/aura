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
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.token.TokenOptimizerImpl;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.java.provider.TestTokenMapProvider;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * Unit tests for {@link TokenOptimizerImpl}.
 */
public class TokenOptimizerImplTest extends StyleTestCase {
    private TokenOptimizerImpl tokens;
    private DefDescriptor<TokensDef> desc1;
    private DefDescriptor<TokensDef> desc2;
    private DefDescriptor<TokensDef> desc3;

    public TokenOptimizerImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        tokens = new TokenOptimizerImpl();
        desc1 = addSeparateTokens(tokens().token("num", "1"));
        desc2 = addSeparateTokens(tokens().token("num", "2"));
        desc3 = addSeparateTokens(tokens().token("num", "3"));
    }

    public void testIsEmptyTrue() throws Exception {
        assertTrue(tokens.isEmpty());
    }

    public void testIsEmptyFalse() throws Exception {
        tokens.append(desc1);
        assertFalse(tokens.isEmpty());
    }

    public void testAppendTokensDef() throws Exception {
        tokens.append(desc1);
        assertEquals(1, tokens.size());
        assertEquals(desc1, tokens.get(0));
    }

    public void testAppendAllTokensDefs() throws Exception {
        tokens.append(desc1).append(desc2).append(desc3);
        assertEquals(3, tokens.size());
        assertEquals(desc1, tokens.get(0));
        assertEquals(desc2, tokens.get(1));
        assertEquals(desc3, tokens.get(2));
    }

    public void testPrependTokensDef() throws Exception {
        tokens.append(desc1);
        tokens.prepend(desc3);
        assertEquals(2, tokens.size());
        assertEquals(desc3, tokens.get(0));
    }

    public void testPrependAllTokensDefsWhenEmpty() throws Exception {
        List<DefDescriptor<TokensDef>> tokenMaps = ImmutableList.of(desc2, desc3, desc1);
        tokens.prependAll(tokenMaps);

        assertEquals(3, tokens.size());
        assertEquals(desc2, tokens.get(0));
        assertEquals(desc3, tokens.get(1));
        assertEquals(desc1, tokens.get(2));
    }

    public void testPrependAllTokensDefWhenNotEmpty() throws Exception {
        tokens.append(desc1).append(desc2).append(desc3);
        DefDescriptor<TokensDef> tokensA = addSeparateTokens(tokens());
        DefDescriptor<TokensDef> tokensB = addSeparateTokens(tokens());
        DefDescriptor<TokensDef> tokensC = addSeparateTokens(tokens());
        List<DefDescriptor<TokensDef>> allTokens = ImmutableList.of(tokensA, tokensB, tokensC);
        tokens.prependAll(allTokens);

        assertEquals(6, tokens.size());
        assertEquals(tokensA, tokens.get(0));
        assertEquals(tokensB, tokens.get(1));
        assertEquals(tokensC, tokens.get(2));
        assertEquals(desc1, tokens.get(3));
        assertEquals(desc2, tokens.get(4));
        assertEquals(desc3, tokens.get(5));
    }

    public void testAppendUsesConcrete() throws Exception {
        tokens.append(addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF)));
        assertEquals(1, tokens.size());
        assertEquals(TestTokenDescriptorProvider.DESC, tokens.get(0).getDescriptorName());
    }

    public void testAppendAddsDynamicTokens() throws Exception {
        tokens.append(addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF)));
        Map<String, String> activeDynamicTokens = tokens.activeDynamicTokens();

        Map<String, String> expected = TestTokenMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testAppendAllUsesConcrete() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        tokens.appendAll(ImmutableList.of(desc));
        assertEquals(1, tokens.size());
        assertEquals(TestTokenDescriptorProvider.DESC, tokens.get(0).getDescriptorName());
    }

    public void testAppendAllAddsDynamicTokens() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        tokens.appendAll(ImmutableList.of(desc));
        Map<String, String> activeDynamicTokens = tokens.activeDynamicTokens();

        Map<String, String> expected = TestTokenMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testPrependUsesConcrete() throws Exception {
        tokens.prepend(addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF)));
        assertEquals(1, tokens.size());
        assertEquals(TestTokenDescriptorProvider.DESC, tokens.get(0).getDescriptorName());
    }

    public void testPrependAddsDynamicTokens() throws Exception {
        tokens.prepend(addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF)));
        Map<String, String> activeDynamicTokens = tokens.activeDynamicTokens();

        Map<String, String> expected = TestTokenMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testPrependAllUsesConcrete() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        tokens.prependAll(ImmutableList.of(desc));
        assertEquals(1, tokens.size());
        assertEquals(TestTokenDescriptorProvider.DESC, tokens.get(0).getDescriptorName());
    }

    public void testPrependAllAddsDynamicTokens() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        tokens.prependAll(ImmutableList.of(desc));
        Map<String, String> activeDynamicTokens = tokens.activeDynamicTokens();

        Map<String, String> expected = TestTokenMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testOrderedForEvaluation() throws Exception {
        tokens.append(desc1).append(desc2).append(desc3);
        List<DefDescriptor<TokensDef>> ordered = tokens.orderedForEvaluation();
        assertEquals(3, ordered.size());
        assertEquals(desc3, ordered.get(0));
        assertEquals(desc2, ordered.get(1));
        assertEquals(desc1, ordered.get(2));
    }

    public void testHasDynamicTokensTrue() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        tokens.append(desc);
        assertTrue(tokens.hasDynamicTokens());
    }

    public void testHasDynamicTokensFalse() throws Exception {
        tokens.append(desc1);
        assertFalse(tokens.hasDynamicTokens());
    }

    /** test that when two map provided defs specify the same token, the correct one is returned */
    @Provider
    public static final class P1 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("key", "P1");
        }
    }

    @Provider
    public static final class P2 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("key", "P2");
        }
    }

    public void testClashingDynamicTokens() throws Exception {
        DefDescriptor<TokensDef> tokensA = addSeparateTokens(tokens().mapProvider("java://" + P1.class.getName()));
        DefDescriptor<TokensDef> tokensB = addSeparateTokens(tokens().mapProvider("java://" + P2.class.getName()));
        tokens.append(tokensA).append(tokensB);
        Map<String, String> dynamicTokens = tokens.activeDynamicTokens();
        assertEquals("P2", dynamicTokens.get("key"));
    }

    public void testGetValueAbsent() throws Exception {
        assertFalse(tokens.getValue("absent").isPresent());
    }

    public void testGetValuePresent() throws Exception {
        tokens.append(desc1);
        assertEquals("1", tokens.getValue("num").get());
    }

    @Provider
    public static final class P3 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("color", "red");
        }
    }

    public void testGetValueFromMapProviderTokens() throws Exception {
        DefDescriptor<TokensDef> tokensA = addSeparateTokens(tokens().token("color", "blue"));
        DefDescriptor<TokensDef> tokensB = addSeparateTokens(tokens().mapProvider("java://" + P3.class.getName()));
        DefDescriptor<TokensDef> tokensC = addSeparateTokens(tokens().token("font", "arial"));
        DefDescriptor<TokensDef> tokensD = addSeparateTokens(tokens().token("margin", "10px"));

        tokens.appendAll(ImmutableList.of(tokensA, tokensB, tokensC, tokensD));
        assertEquals("red", tokens.getValue("color").get());
    }

    @Provider
    public static final class P4 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("bbb", "b");
        }
    }

    public void testGetTokenNames() throws Exception {
        DefDescriptor<TokensDef> t1 = addSeparateTokens(tokens().token("aaa", "1"));
        DefDescriptor<TokensDef> t2 = addSeparateTokens(tokens().token("aaa", "2"));
        DefDescriptor<TokensDef> t3 = addSeparateTokens(tokens().mapProvider("java://" + P4.class.getName()));
        DefDescriptor<TokensDef> t4 = addSeparateTokens(tokens().token("ccc", "3"));
        DefDescriptor<TokensDef> t5 = addSeparateTokens(tokens().token("ddd", "4"));

        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("eee", "5"));
        DefDescriptor<TokensDef> t6 = addSeparateTokens(tokens().parent(parent).token("fff", "6"));

        tokens.append(t1).append(t2).append(t3).append(t4).append(t5).append(t6);
        Set<String> names = tokens.getNames();
        assertEquals(6, names.size());
        assertTrue(names.contains("aaa"));
        assertTrue("missing name from map provided def", names.contains("bbb"));
        assertTrue(names.contains("ccc"));
        assertTrue(names.contains("ddd"));
        assertTrue("missing name from parent def", names.contains("eee"));
        assertTrue(names.contains("fff"));
    }
}
