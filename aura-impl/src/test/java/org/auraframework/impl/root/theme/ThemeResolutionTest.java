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
package org.auraframework.impl.root.theme;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

/**
 * Unit tests for resolving theme function values in CSS files.
 */
public class ThemeResolutionTest extends AuraImplTestCase {

    public ThemeResolutionTest(String name) {
        super(name);
    }

    /** fully qualified references */
    public void testQualifiedSimple() throws Exception {
        gold(get("themeTest.simple"));
    }

    /** fully qualified where the variable value is inherited */
    public void testQualifiedInherited() throws Exception {
        gold(get("themeTest.inherited"));
    }

    /** fully qualified where the variable value is overridden */
    public void testQualifiedOverridden() throws Exception {
        gold(get("themeTest.overridden"));
    }

    /** fully qualified where the variable value is unquoted */
    public void testQualifiedDoubleQuoted() throws Exception {
        gold(get("themeTest.doubleQuoted"));
    }

    /** using the 't' alternative function name */
    public void testShorthand() throws Exception {
        gold(get("themeTest.shorthand"));
    }

    /** using multiple themes functions in one declaration value */
    public void testMultipleThemeFunctions() throws Exception {
        gold(get("themeTest.multiple"));
    }

    /** errors when the theme does not exist */
    public void testQualifiedNonexistentTheme() throws Exception {
        try {
            get("themeTest.badTheme").getDef().getCode();
            fail("expected to get exception");
        } catch (DefinitionNotFoundException e) {
            assertThat(e.getMessage().contains("No THEME"), is(true));
        }
    }

    /** errors when the variable does not exist */
    public void testQualifiedNonexistentVariable() throws Exception {
        try {
            get("themeTest.badVariable").getDef().getCode();
            fail("expected to get exception");
        } catch (ThemeValueNotFoundException e) {
            assertThat(e.getMessage().contains("was not found on the THEME"), is(true));
        }
    }

    /** errors with mixing of raw text with theme function */
    public void testMixingRawTextWithThemeFunction() throws Exception {
        try {
            get("themeTest.invalidMixing").getDef().getCode();
            fail("expected to get exception");
        } catch (StyleParserException e) {
            assertThat(e.getMessage().contains("Cannot mix"), is(true));
        }
    }

    /** application-level theme overrides work as expected */
    public void testThemeOverrides() throws Exception {
        String appLoc = "themeTest:overrideApp";
        DefDescriptor<ApplicationDef> app = DefDescriptorImpl.getInstance(appLoc, ApplicationDef.class);
        Aura.getContextService().getCurrentContext().setApplicationDescriptor(app);
        gold(get("themeTest.overrideApp"));
    }

    /** aliases work as expected */
    public void testAliases() throws Exception {
        gold(get("themeTest.componentWithAliases"));
    }

    private DefDescriptor<StyleDef> get(String locator) {
        return DefDescriptorImpl.getInstance(locator, StyleDef.class);
    }

    private final void gold(DefDescriptor<StyleDef> descriptor) throws Exception {
        goldFileText(descriptor.getDef().getCode(), ".css");
    }
}
