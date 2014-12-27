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
package org.auraframework.test.root.theme;

import java.util.List;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.VarDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestThemeDescriptorProvider;
import org.auraframework.impl.java.provider.TestThemeMapProvider;
import org.auraframework.impl.root.parser.handler.ThemeDefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Unit tests for {@link ThemeDefHandler}.
 */
public class ThemeDefHandlerTest extends StyleTestCase {
    public ThemeDefHandlerTest(String name) {
        super(name);
    }

    public void testVars() throws Exception {
        ThemeDef def = addSeparateTheme(theme().var("test1", "1").var("test2", "2")).getDef();

        Map<String, VarDef> vars = def.getDeclaredVarDefs();
        assertEquals("didn't get expected number of vars", 2, vars.size());

        assertTrue("didn't find expected var", vars.containsKey("test1"));
        assertEquals("incorrect value for var", "2", vars.get("test2").getValue());
    }

    public void testImports() throws Exception {
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme()
                .var("var1", "1").var("var2", "2").var("var3", "3"));

        DefDescriptor<ThemeDef> import2 = addSeparateTheme(theme()
                .var("var1", "1").var("var2", "2").var("var3", "3"));

        DefDescriptor<ThemeDef> import3 = addSeparateTheme(theme()
                .var("var1", "1").var("var2", "2").var("var3", "3"));

        ThemeDef def = addSeparateTheme(theme()
                .imported(import1)
                .imported(import2)
                .imported(import3))
                .getDef();

        List<DefDescriptor<ThemeDef>> imports = def.getDeclaredImports();
        assertEquals(3, imports.size());
    }

    public void testImportAfterDeclared() throws Exception {
        DefDescriptor<ThemeDef> imp = addSeparateTheme(theme().var("var1", "1"));

        try {
            addSeparateTheme(theme().var("var2", "2").imported(imp)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must come before");
        }
    }

    public void testInvalidChild() throws Exception {
        try {
            addSeparateTheme("<aura:theme><aura:foo/></aura:theme>").getDef();
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:theme");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Found unexpected tag");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            addSeparateTheme("<aura:theme>Test</aura:theme>").getDef();
            fail("Should have thrown AuraException because text is between aura:theme tags");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    public void testDuplicateVars() throws Exception {
        try {
            addSeparateTheme(theme().var("test", "1").var("test", "1")).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate var");
        }
    }

    public void testDuplicateImports() throws Exception {
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme().var("var1", "1"));

        try {
            addSeparateTheme(theme().imported(import1).imported(import1)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Duplicate theme import");
        }
    }

    public void testExtends() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> child = addSeparateTheme(theme().parent(parent));
        assertEquals(child.getDef().getExtendsDescriptor(), parent);
    }

    public void testEmptyExtends() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme("<aura:theme extends=' '/>");
        assertNull(theme.getDef().getExtendsDescriptor());
    }

    public void testIsCmpThemeFalse() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("color", "red"));
        assertFalse(theme.getDef().isCmpTheme());
    }

    public void testIsCmpThemeTrue() throws Exception {
        DefDescriptor<ThemeDef> theme = addThemeAndStyle(theme().var("color", "red"), ".THIS{}");
        assertTrue(theme.getDef().isCmpTheme());
    }

    public void testProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        assertEquals(TestThemeDescriptorProvider.REF, theme.getDef().getDescriptorProvider().getQualifiedName());
    }

    public void testEmptyProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(""));
        assertNull(theme.getDef().getDescriptorProvider());
    }

    public void testMapProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));
        assertEquals(TestThemeMapProvider.REF, theme.getDef().getMapProvider().getQualifiedName());
    }

    public void testEmptyMapProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(""));
        assertNull(theme.getDef().getMapProvider());
    }
}
