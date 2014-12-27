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
package org.auraframework.test.css;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeMapProvider;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.ThemeListImpl;
import org.auraframework.impl.java.provider.TestThemeDescriptorProvider;
import org.auraframework.impl.java.provider.TestThemeMapProvider;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * Unit tests for {@link ThemeListImpl}.
 */
public class ThemeListImplTest extends StyleTestCase {
    private ThemeListImpl tl;
    private DefDescriptor<ThemeDef> theme1;
    private DefDescriptor<ThemeDef> theme2;
    private DefDescriptor<ThemeDef> theme3;

    public ThemeListImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        tl = new ThemeListImpl();
        theme1 = addSeparateTheme(theme().var("num", "1"));
        theme2 = addSeparateTheme(theme().var("num", "2"));
        theme3 = addSeparateTheme(theme().var("num", "3"));
    }

    public void testIsEmptyTrue() throws Exception {
        assertTrue(tl.isEmpty());
    }

    public void testIsEmptyFalse() throws Exception {
        tl.append(theme1);
        assertFalse(tl.isEmpty());
    }

    public void testAppendTheme() throws Exception {
        tl.append(theme1);
        assertEquals(1, tl.size());
        assertEquals(theme1, tl.get(0));
    }

    public void testAppendAllThemes() throws Exception {
        tl.append(theme1).append(theme2).append(theme3);
        assertEquals(3, tl.size());
        assertEquals(theme1, tl.get(0));
        assertEquals(theme2, tl.get(1));
        assertEquals(theme3, tl.get(2));
    }

    public void testPrependTheme() throws Exception {
        tl.append(theme1);
        tl.prepend(theme3);
        assertEquals(2, tl.size());
        assertEquals(theme3, tl.get(0));
    }

    public void testPrependAllThemesWhenEmpty() throws Exception {
        List<DefDescriptor<ThemeDef>> themes = ImmutableList.of(theme2, theme3, theme1);
        tl.prependAll(themes);

        assertEquals(3, tl.size());
        assertEquals(theme2, tl.get(0));
        assertEquals(theme3, tl.get(1));
        assertEquals(theme1, tl.get(2));
    }

    public void testPrependAllThemesWhenNotEmpty() throws Exception {
        tl.append(theme1).append(theme2).append(theme3);
        DefDescriptor<ThemeDef> themeA = addSeparateTheme(theme());
        DefDescriptor<ThemeDef> themeB = addSeparateTheme(theme());
        DefDescriptor<ThemeDef> themeC = addSeparateTheme(theme());
        List<DefDescriptor<ThemeDef>> themes = ImmutableList.of(themeA, themeB, themeC);
        tl.prependAll(themes);

        assertEquals(6, tl.size());
        assertEquals(themeA, tl.get(0));
        assertEquals(themeB, tl.get(1));
        assertEquals(themeC, tl.get(2));
        assertEquals(theme1, tl.get(3));
        assertEquals(theme2, tl.get(4));
        assertEquals(theme3, tl.get(5));
    }

    public void testAppendUsesConcrete() throws Exception {
        tl.append(addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF)));
        assertEquals(1, tl.size());
        assertEquals(TestThemeDescriptorProvider.DESC, tl.get(0).getDescriptorName());
    }

    public void testAppendAddsDynamicVars() throws Exception {
        tl.append(addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF)));
        Map<String, String> activeDynamicVars = tl.activeDynamicVars();

        Map<String, String> expected = TestThemeMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicVars.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testAppendAllUsesConcrete() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        tl.appendAll(ImmutableList.of(theme));
        assertEquals(1, tl.size());
        assertEquals(TestThemeDescriptorProvider.DESC, tl.get(0).getDescriptorName());
    }

    public void testAppendAllAddsDynamicVars() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));
        tl.appendAll(ImmutableList.of(theme));
        Map<String, String> activeDynamicVars = tl.activeDynamicVars();

        Map<String, String> expected = TestThemeMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicVars.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testPrependUsesConcrete() throws Exception {
        tl.prepend(addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF)));
        assertEquals(1, tl.size());
        assertEquals(TestThemeDescriptorProvider.DESC, tl.get(0).getDescriptorName());
    }

    public void testPrependAddsDynamicVars() throws Exception {
        tl.prepend(addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF)));
        Map<String, String> activeDynamicVars = tl.activeDynamicVars();

        Map<String, String> expected = TestThemeMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicVars.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testPrependAllUsesConcrete() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        tl.prependAll(ImmutableList.of(theme));
        assertEquals(1, tl.size());
        assertEquals(TestThemeDescriptorProvider.DESC, tl.get(0).getDescriptorName());
    }

    public void testPrependAllAddsDynamicVars() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));
        tl.prependAll(ImmutableList.of(theme));
        Map<String, String> activeDynamicVars = tl.activeDynamicVars();

        Map<String, String> expected = TestThemeMapProvider.MAP;
        for (Entry<String, String> entry : activeDynamicVars.entrySet()) {
            assertEquals(entry.getValue(), expected.get(entry.getKey()));
        }
    }

    public void testOrderedForEvaluation() throws Exception {
        tl.append(theme1).append(theme2).append(theme3);
        List<DefDescriptor<ThemeDef>> ordered = tl.orderedForEvaluation();
        assertEquals(3, ordered.size());
        assertEquals(theme3, ordered.get(0));
        assertEquals(theme2, ordered.get(1));
        assertEquals(theme1, ordered.get(2));
    }

    public void testHasDynamicVarsTrue() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));
        tl.append(theme);
        assertTrue(tl.hasDynamicVars());
    }

    public void testHasDynamicVarsFalse() throws Exception {
        tl.append(theme1);
        assertFalse(tl.hasDynamicVars());
    }

    /** test that when two map provided themes specify the same var, the correct one is returned */
    @Provider
    public static final class P1 implements ThemeMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("key", "P1");
        }
    }

    @Provider
    public static final class P2 implements ThemeMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("key", "P2");
        }
    }

    public void testClashingDynamicVars() throws Exception {
        DefDescriptor<ThemeDef> themeA = addSeparateTheme(theme().mapProvider("java://" + P1.class.getName()));
        DefDescriptor<ThemeDef> themeB = addSeparateTheme(theme().mapProvider("java://" + P2.class.getName()));
        tl.append(themeA).append(themeB);
        Map<String, String> activeDynamicVars = tl.activeDynamicVars();
        assertEquals("P2", activeDynamicVars.get("key"));
    }

    public void testGetValueAbsent() throws Exception {
        assertFalse(tl.getValue("absent").isPresent());
    }

    public void testGetValuePresent() throws Exception {
        tl.append(theme1);
        assertEquals("1", tl.getValue("num").get());
    }

    @Provider
    public static final class P3 implements ThemeMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("color", "red");
        }
    }

    public void testGetValueFromMapProviderTheme() throws Exception {
        DefDescriptor<ThemeDef> themeA = addSeparateTheme(theme().var("color", "blue"));
        DefDescriptor<ThemeDef> themeB = addSeparateTheme(theme().mapProvider("java://" + P3.class.getName()));
        DefDescriptor<ThemeDef> themeC = addSeparateTheme(theme().var("font", "arial"));
        DefDescriptor<ThemeDef> themeD = addSeparateTheme(theme().var("margin", "10px"));

        tl.appendAll(ImmutableList.of(themeA, themeB, themeC, themeD));
        assertEquals("red", tl.getValue("color").get());
    }
}
