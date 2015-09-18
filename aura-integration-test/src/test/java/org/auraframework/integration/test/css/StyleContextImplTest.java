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

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.auraframework.css.StyleContext;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.token.StyleContextImpl;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Unit tests for StyleContextImpl.
 */
public class StyleContextImplTest extends AuraImplTestCase {
    public StyleContextImplTest(String name) {
        super(name);
    }

    public void testFromMap() {
        Map<String, Object> map = new HashMap<>();

        map.put("c", "webkit");
        map.put("x", Lists.newArrayList("communities", "desktop"));

        DefDescriptor<TokensDef> tokenDescriptor = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        map.put("tokens", Lists.newArrayList(tokenDescriptor.getQualifiedName()));

        StyleContext sc = StyleContextImpl.build(map);

        // test client type
        assertEquals("webkit", sc.getClientType());

        // test extra true conditions
        Set<String> extra = sc.getExtraTrueConditionsOnly();
        assertEquals(2, extra.size());
        assertTrue(extra.contains("communities"));
        assertTrue(extra.contains("desktop"));

        // test all true conditions
        Set<String> all = sc.getAllTrueConditions();
        assertEquals(3, all.size());
        assertTrue(all.contains("communities"));
        assertTrue(all.contains("desktop"));
        assertTrue(all.contains("webkit"));

        // test tokens
        Set<DefDescriptor<TokensDef>> set = Sets.newHashSet(sc.getTokens());
        assertEquals(1, set.size());
        assertTrue(set.contains(tokenDescriptor));
    }
}
