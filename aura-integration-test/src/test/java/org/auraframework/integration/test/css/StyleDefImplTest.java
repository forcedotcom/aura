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

import java.util.Map;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.validation.ReferenceValidationContextImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.TokenValueNotFoundException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Tests for StyleDefImpl.
 *
 * @since 0.0.240
 */
public class StyleDefImplTest extends StyleTestCase {

    @Inject
    ContextService contextService;

    @Inject
    DefinitionService definitionService;

    @Test
    public void testDependenciesIncludesNsDefault() throws QuickFixException {
        DefDescriptor<TokensDef> nsDefault = addNsTokens(tokens().token("color", "red"));
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: token(color) }");

        Set<DefDescriptor<?>> dependencies = definitionService.getDefinition(style).getDependencySet();
        assertTrue(dependencies.contains(nsDefault));
    }

    @Test
    public void testInvalidRef() throws QuickFixException {
        addNsTokens("<aura:tokens><aura:token name='color' value='red'/></aura:tokens>");
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: token(bam) }");
        ReferenceValidationContext validationContext = new ReferenceValidationContextImpl(Maps.newHashMap());

        try {
            definitionService.getDefinition(style).validateReferences(validationContext);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, TokenValueNotFoundException.class, "was not found");
        }
    }

    @Test
    public void testGetClassName() throws QuickFixException {
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: red }");
        String expected = style.getNamespace() + AuraTextUtil.initCap(style.getName());
        assertEquals(expected, definitionService.getDefinition(style).getClassName());
    }

    /**
     * Verify that if already preloaded, StyleDef doesn't include code when serialized.
     *
     * @throws Exception
     */
    @Test
    public void testDefSerializationWhenPreloaded() throws Exception {
        DefDescriptor<StyleDef> styleDesc = addStyleDef(".THIS {color: red }");
        contextService.getCurrentContext().setPreloading(false);
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        preloaded.add(styleDesc);
        contextService.getCurrentContext().setPreloadedDefinitions(preloaded);
        verifyStyleDefSerialization(styleDesc, false);
    }

    /**
     * Verify that if not preloaded, StyleDef includes code when serialized.
     *
     * @throws Exception
     */
    @Test
    public void testDefSerializationWhenNotPreloaded() throws Exception {
        DefDescriptor<StyleDef> styleDesc = addStyleDef(".THIS {color: green }");
        contextService.getCurrentContext().setPreloading(false);
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        contextService.getCurrentContext().setPreloadedDefinitions(preloaded);
        verifyStyleDefSerialization(styleDesc, true);
    }

    @Test
    public void testGetTokenNames() throws Exception {
        addNsTokens(tokens()
                .token("color", "red")
                .token("margin1", "10px")
                .token("margin2", "5px")
                .token("margin3", "15px"));

        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: token(color); font-weight: bold; margin: t(margin1 + ' 5px ' + margin2); }");

        Set<String> tokenNames = definitionService.getDefinition(style).getTokenNames();
        assertEquals("didn't have expected size", 3, tokenNames.size());
        assertTrue(tokenNames.contains("color"));
        assertTrue(tokenNames.contains("margin1"));
        assertTrue(tokenNames.contains("margin2"));
    }

    @SuppressWarnings("unchecked")
    private void verifyStyleDefSerialization(DefDescriptor<StyleDef> styleDesc, Boolean expectCode) throws Exception {
        String serialized = JsonEncoder.serialize(definitionService.getDefinition(styleDesc));
        Object o = new JsonReader().read(serialized);
        assertTrue(o instanceof Map);
        Map<String, Object> outerMap = (Map<String, Object>) o;
        assertEquals(styleDesc.toString(), outerMap.get("descriptor"));
        assertEquals(styleDesc.getNamespace() + AuraTextUtil.initCap(styleDesc.getName()), outerMap.get(Json.ApplicationKey.CLASSNAME.toString()));
        if (expectCode) {
            assertEquals("StyleDef content not included.", definitionService.getDefinition(styleDesc).getCode(), outerMap.get(Json.ApplicationKey.CODE.toString()));
        } else {
            assertNull("StyleDef content should not be included.", outerMap.get(Json.ApplicationKey.CODE.toString()));
        }
    }
}
