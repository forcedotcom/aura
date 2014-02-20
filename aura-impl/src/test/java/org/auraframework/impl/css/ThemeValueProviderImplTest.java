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
package org.auraframework.impl.css;

import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

/**
 * Unit tests for {@link ThemeValueProviderImpl}.
 */
public class ThemeValueProviderImplTest extends StyleTestCase {
    private DefDescriptor<StyleDef> def;

    public ThemeValueProviderImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        this.def = addStyleDef(".THIS{}");
    }

    /** check that a simple resolves */
    public void testSimple() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        assertEquals("red", tvp().getValue("color", null));
    }

    /** check that a value from the cmp theme resolves */
    public void testCmpTheme() throws QuickFixException {
        DefDescriptor<StyleDef> style = addStyleDef(".THIS{}");
        addCmpTheme(theme().var("color", "red"), style);
        assertEquals("red", tvp(style).getValue("color", null));
    }

    /** check that a value from the cmp theme preempts namespace default */
    public void testCmpThemePreemptsNsDefaultTheme() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        DefDescriptor<StyleDef> style = addStyleDef(".THIS{}");
        addCmpTheme(theme().var("color", "green"), style);
        assertEquals("green", tvp(style).getValue("color", null));
    }

    /** confirm that we get the right inherited var value */
    public void testInherited() throws QuickFixException {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        addNsTheme(theme().parent(parent).var("margin", "10px"));
        assertEquals("red", tvp().getValue("color", null));
    }

    /** confirm that we get the value from an override theme instead of the original */
    public void testOverriddenDirectly() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> override = addSeparateTheme(theme().var("color", "blue"));
        assertEquals("blue", overridden(override).getValue("color", null));
    }

    /** confirm that we get the value from an override theme through inheritance instead of the original */
    public void testOverriddenThroughInheritance() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "blue"));
        DefDescriptor<ThemeDef> override = addSeparateTheme(theme().parent(parent));
        assertEquals("blue", overridden(override).getValue("color", null));
    }

    /** confirm even if a cmp theme exists, the override wins */
    public void testOverridePremptsLocalAndNsDefaultThemes() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));

        DefDescriptor<StyleDef> style = addStyleDef(".THIS{}");
        addCmpTheme(theme().var("color", "green"), style);

        DefDescriptor<ThemeDef> override = addSeparateTheme(theme().var("color", "blue"));
        assertEquals("blue", overridden(override, style).getValue("color", null));
    }

    @Provider
    public static final class TmpProvider implements ThemeDescriptorProvider {
        @Override
        public DefDescriptor<ThemeDef> provide() throws QuickFixException {
            return DefDescriptorImpl.getInstance("themeProviderTest:tvp", ThemeDef.class);
        }
    }

    /** the override theme may utilize a provider, in which case we should find and use the concrete theme */
    public void testOverrideUsesProvider() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));

        DefDescriptor<StyleDef> style = addStyleDef(".THIS{}");

        String prov = "java://" + TmpProvider.class.getName();
        DefDescriptor<ThemeDef> override = addSeparateTheme(theme().provider(prov));

        assertEquals("blue", overridden(override, style).getValue("color", null));
    }

    /** check that we get an error if the namespace default theme doesn't exist */
    public void testNamespaceThemeDoesntExist() throws QuickFixException {
        try {
            tvp().getValue("color", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }

    /** check that we get an error if the variable doesn't exist */
    public void testVariableDoesntExist() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        try {
            tvp().getValue("roloc", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, ThemeValueNotFoundException.class, "was not found");
        }
    }

    /** confirm that we get an error if the override theme is specified but non existent */
    public void testAppThemeDefDoesntExist() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> override = DefDescriptorImpl.getInstance("idont:exist", ThemeDef.class);

        try {
            overridden(override).getValue("color", null);
            fail("expected an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }

    /**
     * if the namespace default theme doesn't have the var, but the override theme does, it should still resolve.
     * However note that this is overall an error and would be caught by StyleDef#validateReferences.
     */
    public void testSpecifiedInOverrideButMissingFromNamespaceDefault() throws QuickFixException {
        addNsTheme(theme().var("font", "arial"));
        DefDescriptor<ThemeDef> override = addSeparateTheme(theme().var("color", "blue"));
        assertEquals("blue", overridden(override).getValue("color", null));
    }

    /** check that we get an error if the number of parts in the argument are too many */
    public void testMalformedLong() throws QuickFixException {
        addNsTheme(theme().var("color", "red"));
        try {
            tvp().getValue("blah.blah.blah", null);
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Invalid number of parts");
        }
    }

    /** confirm that cross referencing a var defined in the same theme def resolves */
    public void testCrossReferenceSelf() throws QuickFixException {
        addNsTheme(theme().var("color", "red").var("myColor", "{!color}"));
        assertEquals("red", tvp().getValue("myColor", null));
    }

    /** confirm that cross referencing a var defined in a parent theme def resolves */
    public void testCrossReferenceInherited() throws QuickFixException {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        addNsTheme(theme().parent(parent).var("myColor", "{!color}"));
        assertEquals("red", tvp().getValue("color", null));
    }

    /** confirm that an error is thrown if the cross referenced var doesn't exist */
    public void testCrossReferenceDoesntExist() throws QuickFixException {
        addNsTheme(theme().var("myColor", "{!color}"));

        try {
            tvp().getValue("myColor", null);
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, ThemeValueNotFoundException.class, "was not found");
        }
    }

    /** tvp = theme value provider */
    private ThemeValueProvider tvp() throws QuickFixException {
        return tvp(def);
    }

    /** tvp = theme value provider */
    private ThemeValueProvider tvp(DefDescriptor<StyleDef> def) throws QuickFixException {
        return new ThemeValueProviderImpl(def, null);
    }

    private ThemeValueProvider overridden(DefDescriptor<ThemeDef> override) throws QuickFixException {
        return overridden(override, def);
    }

    private ThemeValueProvider overridden(DefDescriptor<ThemeDef> override, DefDescriptor<StyleDef> def)
            throws QuickFixException {
        return new ThemeValueProviderImpl(def, override);
    }
}