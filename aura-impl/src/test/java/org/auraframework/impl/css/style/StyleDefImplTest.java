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
package org.auraframework.impl.css.style;

import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Sets;

/**
 * Tests for StyleDefImpl.
 * 
 * @since 0.0.240
 */
public class StyleDefImplTest extends StyleTestCase {
    public StyleDefImplTest(String name) {
        super(name);
    }

    public void testThemeDependenciesNsThemeOnly() throws QuickFixException {
        DefDescriptor<ThemeDef> theme = addNsTheme(theme().var("color", "red"));
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: theme(color) }");

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        style.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(theme));
    }

    public void testThemeDependenciesCmpThemeOnly() throws QuickFixException {
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: theme(color) }");
        DefDescriptor<ThemeDef> theme = addCmpTheme(theme().var("color", "red"), style);

        assertTrue("expected theme to be a cmpTheme", theme.getDef().isCmpTheme());

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        style.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(theme));
    }

    public void testThemeDependenciesBothThemes() throws QuickFixException {
        DefDescriptor<ThemeDef> nsTheme = addNsTheme(theme().var("color", "red"));
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: theme(color) }");
        DefDescriptor<ThemeDef> cmpTheme = addCmpTheme(theme().var("color", "red"), style);

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        style.getDef().appendDependencies(dependencies);
        assertTrue("expected dependencies to contain namespace theme", dependencies.contains(nsTheme));
        assertTrue("expected dependencies to contain cmp theme", dependencies.contains(cmpTheme));
    }

    public void testThemeDependenciesDoesntHaveThemeDef() throws QuickFixException {
        DefDescriptor<ThemeDef> nsTheme = addNsTheme("<aura:theme><aura:var name='color' value='red'/></aura:theme>");
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: red }");
        DefDescriptor<ThemeDef> cmpTheme = addCmpTheme(theme().var("color", "red"), style);

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        style.getDef().appendDependencies(dependencies);
        assertFalse(dependencies.contains(nsTheme));
        assertFalse(dependencies.contains(cmpTheme));
    }

    public void testInvalidRef() throws QuickFixException {
        addNsTheme("<aura:theme><aura:var name='color' value='red'/></aura:theme>");
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: theme(bam) }");

        try {
            style.getDef().validateReferences();
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, ThemeValueNotFoundException.class, "was not found");
        }
    }

    public void testGetClassName() throws QuickFixException {
        DefDescriptor<StyleDef> style = addStyleDef(".THIS {color: red }");
        String expected = style.getNamespace() + AuraTextUtil.initCap(style.getName());
        assertEquals(expected, style.getDef().getClassName());
    }
    /**
     * Verify that if already preloaded, StyleDef doesn't include code when serialized.
     * @throws Exception
     */
    public void testDefSerializationWhenPreloaded()throws Exception{
        DefDescriptor<StyleDef> styleDesc = addStyleDef(".THIS {color: red }");
        Aura.getContextService().getCurrentContext().setPreloading(false);
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        preloaded.add(styleDesc);
        Aura.getContextService().getCurrentContext().setPreloadedDefinitions(preloaded);
        verifyStyleDefSerialization(styleDesc, false);
    }
    
    /**
     * Verify that if not preloaded, StyleDef includes code when serialized.
     * @throws Exception
     */
    public void testDefSerializationWhenNotPreloaded()throws Exception{
        DefDescriptor<StyleDef> styleDesc = addStyleDef(".THIS {color: green }");
        Aura.getContextService().getCurrentContext().setPreloading(false);
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        Aura.getContextService().getCurrentContext().setPreloadedDefinitions(preloaded);
        verifyStyleDefSerialization(styleDesc, true);
    }
    
    @SuppressWarnings("unchecked")
    private void verifyStyleDefSerialization(DefDescriptor<StyleDef> styleDesc, Boolean expectCode)throws Exception{
        String serialized = Json.serialize(styleDesc.getDef());
        Object o = new JsonReader().read(serialized);
        assertTrue(o instanceof Map);
        Map<String, Object> outerMap = (Map<String, Object>) o;
        assertEquals(styleDesc.toString(), outerMap.get("descriptor"));
        assertEquals(styleDesc.getNamespace() + AuraTextUtil.initCap(styleDesc.getName()), outerMap.get("className"));
        if(expectCode){
            assertEquals("StyleDef content not included.", styleDesc.getDef().getCode(),outerMap.get("code"));
        }else{
            assertNull("StyleDef content should not be included.", outerMap.get("code"));
        }
    }
}
