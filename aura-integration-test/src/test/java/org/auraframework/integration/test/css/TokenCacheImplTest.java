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

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import org.auraframework.css.TokenCache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.token.TokenCacheImpl;
import org.auraframework.impl.java.provider.TestTokenDescriptorProvider;
import org.auraframework.impl.java.provider.TestTokenMapProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

/**
 * Unit tests for {@link TokenCacheImpl}.
 */
public class TokenCacheImplTest extends StyleTestCase {
    private TokenCache tokens;
    private DefDescriptor<TokensDef> desc1;
    private DefDescriptor<TokensDef> desc2;
    private DefDescriptor<TokensDef> desc3;

    @Inject
    DefinitionService definitionService;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        desc1 = addSeparateTokens(tokens().token("num", "1"));
        desc2 = addSeparateTokens(tokens().token("num", "2"));
        desc3 = addSeparateTokens(tokens().token("num", "3"));
    }

    @SafeVarargs
    private final TokenCache build(DefDescriptor<TokensDef>... defs) throws QuickFixException {
        return new TokenCacheImpl(definitionService, Lists.newArrayList(defs));
    }

    @Test
    public void testIsEmptyTrue() throws Exception {
        tokens = build();
        assertTrue(tokens.isEmpty());
    }

    @Test
    public void testIsEmptyFalse() throws Exception {
        tokens = build(desc1);
        assertFalse(tokens.isEmpty());
    }

    @Test
    public void testSizeAndEquals() throws Exception {
        tokens = build(desc1);
        assertEquals(1, tokens.size());
        assertEquals(desc1, Iterables.get(tokens, 0));
    }

    @Test
    public void testMultipleTokenDefs() throws Exception {
        tokens = build(desc1, desc2, desc3);
        assertEquals(3, tokens.size());
        assertEquals(desc1, Iterables.get(tokens, 0));
        assertEquals(desc2, Iterables.get(tokens, 1));
        assertEquals(desc3, Iterables.get(tokens, 2));
    }

    @Test
    public void testUsesConcrete() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        tokens = build(desc);
        assertEquals(1, tokens.size());
        assertEquals(TestTokenDescriptorProvider.DESC, Iterables.get(tokens, 0).getDescriptorName());
    }

    @Test
    public void testAddsDynamicTokens() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        tokens = build(desc);
        Map<String, String> activeDynamicTokens = tokens.activeDynamicTokens();

        Map<String, String> expected = TestTokenMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    @Test
    public void testOrderedForEvaluation() throws Exception {
        tokens = build(desc1, desc2, desc3);
        List<DefDescriptor<TokensDef>> ordered = tokens.orderedForEvaluation();
        assertEquals(3, ordered.size());
        assertEquals(desc3, ordered.get(0));
        assertEquals(desc2, ordered.get(1));
        assertEquals(desc1, ordered.get(2));
    }

    @Test
    public void testHasDynamicTokensTrue() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        tokens = build(desc);
        assertTrue(tokens.hasDynamicTokens());
    }

    @Test
    public void testHasDynamicTokensFalse() throws Exception {
        tokens = build(desc1);
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

    @Test
    public void testClashingDynamicTokens() throws Exception {
        DefDescriptor<TokensDef> tokensA = addSeparateTokens(tokens().mapProvider("java://" + P1.class.getName()));
        DefDescriptor<TokensDef> tokensB = addSeparateTokens(tokens().mapProvider("java://" + P2.class.getName()));
        tokens = build(tokensA, tokensB);
        Map<String, String> dynamicTokens = tokens.activeDynamicTokens();
        assertEquals("P2", dynamicTokens.get("key"));
    }

    @Test
    public void testGetTokenAbsent() throws Exception {
        tokens = build();
        assertFalse(tokens.getToken("absent").isPresent());
    }

    @Test
    public void testGetTokenPresent() throws Exception {
        tokens = build(desc1);
        assertEquals("1", tokens.getToken("num").get());
    }

    @Provider
    public static final class P3 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("color", "red");
        }
    }

    @Test
    public void testGetTokenFromMapProvider() throws Exception {
        DefDescriptor<TokensDef> tokensA = addSeparateTokens(tokens().token("color", "blue"));
        DefDescriptor<TokensDef> tokensB = addSeparateTokens(tokens().mapProvider("java://" + P3.class.getName()));
        DefDescriptor<TokensDef> tokensC = addSeparateTokens(tokens().token("font", "arial"));
        DefDescriptor<TokensDef> tokensD = addSeparateTokens(tokens().token("margin", "10px"));

        tokens = build(tokensA, tokensB, tokensC, tokensD);
        assertEquals("red", tokens.getToken("color").get());
    }

    @Provider
    public static final class P4 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("bbb", "b");
        }
    }

    @Test
    public void testGetTokenNamesNoFilter() throws Exception {
        DefDescriptor<TokensDef> t1 = addSeparateTokens(tokens().token("aaa", "1"));
        DefDescriptor<TokensDef> t2 = addSeparateTokens(tokens().token("aaa", "2"));
        DefDescriptor<TokensDef> t3 = addSeparateTokens(tokens().mapProvider("java://" + P4.class.getName()));
        DefDescriptor<TokensDef> t4 = addSeparateTokens(tokens().token("ccc", "4"));
        DefDescriptor<TokensDef> t5 = addSeparateTokens(tokens().token("ddd", "5"));

        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("eee", "x"));
        DefDescriptor<TokensDef> t6 = addSeparateTokens(tokens().parent(parent).token("fff", "6"));

        tokens = build(t1, t2, t3, t4, t5, t6);
        Set<String> names = tokens.getNames(null);
        assertEquals(6, names.size());
        assertTrue(names.contains("aaa"));
        assertTrue("missing name from map provided def", names.contains("bbb"));
        assertTrue(names.contains("ccc"));
        assertTrue(names.contains("ddd"));
        assertTrue("missing name from parent def", names.contains("eee"));
        assertTrue(names.contains("fff"));
    }

    @Test
    public void testGetTokenNamesWithFilter() throws Exception {
        DefDescriptor<TokensDef> t1 = addSeparateTokens(tokens().token("aaa", "1"));
        DefDescriptor<TokensDef> t2 = addSeparateTokens(tokens().token("aaa", "2"));
        DefDescriptor<TokensDef> t3 = addSeparateTokens(tokens().mapProvider("java://" + P4.class.getName()));
        DefDescriptor<TokensDef> t4 = addSeparateTokens(tokens().token("ccc", "4"));

        DefDescriptor<TokensDef> t5 = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        DefDescriptor<TokensDef> t6 = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));

        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("eee", "5"));
        DefDescriptor<TokensDef> t7 = addSeparateTokens(tokens().parent(parent).token("fff", "6"));

        tokens = build(t1, t2, t3, t4, t5, t6, t7);
        Set<String> names = tokens.getNames(ImmutableList.of(t2, t3, t4, t5));

        assertEquals(5, names.size());
        assertTrue(names.contains("aaa"));
        assertTrue("missing name from map provided def", names.contains("bbb"));
        assertTrue(names.contains("ccc"));
        assertTrue(names.contains("color"));
        assertTrue(names.contains("margin"));
    }

    @Test
    public void testMultipleDescriptorProvidersResolveToSame() throws QuickFixException {
        // multiple providers resolve to the same, and since there's no reason to have them duplicated in this list only
        // the latter ones should be included.
        DefDescriptor<TokensDef> resolved = definitionService.getDefDescriptor(TestTokenDescriptorProvider.DESC, TokensDef.class);

        DefDescriptor<TokensDef> a = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        DefDescriptor<TokensDef> b = addSeparateTokens(tokens().token("bbb", "b"));
        DefDescriptor<TokensDef> c = addSeparateTokens(tokens().descriptorProvider(TestTokenDescriptorProvider.REF));
        DefDescriptor<TokensDef> d = addSeparateTokens(tokens().token("ddd", "d"));
        tokens = build(a, b, c, d);

        List<DefDescriptor<TokensDef>> ordered = tokens.orderedForEvaluation();
        assertEquals(3, ordered.size());
        assertEquals(ordered.get(0), d);
        assertEquals(ordered.get(1), resolved);
        assertEquals(ordered.get(2), b);
        // a, which resolves to the same thing as c, should not be included as d comes first and is already included
    }

    @Provider
    public static final class P5 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("xxx", "x");
        }
    }

    @Test
    public void testDuplicateDescriptors() throws Exception {
        DefDescriptor<TokensDef> mapDesc = addSeparateTokens(tokens().mapProvider("java://" + P5.class.getName()));

        tokens = build(mapDesc, desc1, mapDesc);

        // since last declared wins, the first one should not be included in the list
        List<DefDescriptor<TokensDef>> ordered = tokens.orderedForEvaluation();
        assertEquals(2, ordered.size());
        assertEquals(ordered.get(0), mapDesc);
        assertEquals(ordered.get(1), desc1);
    }
    
    @Test
    public void testGetTokensUidNoTokens() throws Exception {
        tokens = build();
        assertFalse(tokens.getTokensUid().isPresent());
    }
    
    @Test
    public void testGetTokensUid() throws Exception {
        TokenCache tokens1 = build(desc1);
        TokenCache tokens2 = build(desc2);
        
        Optional<String> uid1 = tokens1.getTokensUid();
        Optional<String> uid2 = tokens2.getTokensUid();
        
        assertTrue("expected tokens uid1 to be present", uid1.isPresent());
        assertTrue("expected tokens uid2 to be present", uid2.isPresent());
        assertFalse("expected tokens uid to differ", uid1.get().equals(uid2.get()));
    }
    
    @Test
    public void testGetTokensUidSameContent() throws Exception {
        TokenCache tokens1 = build(desc1);
        TokenCache tokens2 = build(desc1);
        
        Optional<String> uid1 = tokens1.getTokensUid();
        Optional<String> uid2 = tokens2.getTokensUid();
        
        assertTrue("expected tokens uid1 to be present", uid1.isPresent());
        assertTrue("expected tokens uid2 to be present", uid2.isPresent());
        assertEquals("expected tokens uid to be equal", uid1.get(), uid2.get());
    }
    
    // @Test TODO, I don't think aura is updating uid for the string source 
    public void testGetTokensUidFileContentUpdated() throws Exception {
        DefDescriptor<TokensDef> desc = addSeparateTokens(tokens().token("num", "1"));
        tokens = build(desc);
        
        String uid1 = tokens.getTokensUid().get();       
        updateStringSource(desc, tokens().token("num", "2").toString());        
        String uid2 = tokens.getTokensUid().get();
        
        assertFalse("expected updated content to result in new tokens uid", uid1.equals(uid2));      
    }
    
    @Test
    public void testGetTokensUidDynamicTokens() throws Exception {
        TokenCache tokens1 = build(desc1);
        String uid1 = tokens1.getTokensUid().get();
        
        DefDescriptor<TokensDef> mapDesc = addSeparateTokens(tokens().mapProvider(TestTokenMapProvider.REF));
        TokenCache tokens2 = build(desc1, mapDesc);
        String uid2 = tokens2.getTokensUid().get();
        
        assertFalse("dynamic tokens should be factored in uid", uid1.equals(uid2));
    }
    
    @Provider
    public static final class P6 implements TokenMapProvider {
        private static int counter = 0;
        
        @Override
        public Map<String, String> provide() throws QuickFixException {
            counter = counter + 1;
            return ImmutableMap.of("count", Integer.toString(counter));
        }
    }
    
    @Test
    public void testGetTokensUidDynamicTokensContentUpdated() throws Exception {
        DefDescriptor<TokensDef> mapDesc = addSeparateTokens(tokens().mapProvider("java://" + P6.class.getName()));
        
        TokenCache token1 = build(mapDesc);               
        String uid1 = token1.getTokensUid().get();
        
        TokenCache token2 = build(mapDesc);
        String uid2 = token2.getTokensUid().get();
        
        assertFalse("expected updated map value to result in new tokens uid", uid1.equals(uid2));      
    }
}
