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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;

/**
 * Unit tests for resolving theme function values in CSS files.
 */
public class ThemeResolutionTest extends AuraImplTestCase {

    public ThemeResolutionTest(String name) {
        super(name);
    }

    /** fully qualified references */
    public void testQualifiedSimple() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.simple");
        gold(style);
    }

    /** fully qualified where the variable value is inherited */
    public void testQualifiedInherited() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.inherited");
        gold(style);
    }

    /** fully qualified where the variable value is overridden */
    public void testQualifiedOverridden() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.overridden");
        gold(style);
    }

    /** fully qualified where the variable value is unquoted */
    public void testQualifiedDoubleQuoted() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.doubleQuoted");
        gold(style);
    }

    /** using the 't' alternative function name */
    public void testShorthand() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.shorthand");
        gold(style);
    }

    /** using multiple themes functions in one declaration value */
    public void testMultipleThemeFunctions() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.multiple");
        gold(style);
    }

    /** errors when the theme does not exist */
    public void testQualifiedNonexistentTheme() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.badTheme");
        System.out.println(style.getDef().getCode());
    }

    /** errors when the variable does not exist */
    public void testQualifiedNonexistentVariable() throws Exception {
        DefDescriptor<StyleDef> style = get("themeTest.badVariable");
    }

    private DefDescriptor<StyleDef> get(String locator) {
        return DefDescriptorImpl.getInstance(locator, StyleDef.class);
    }

    private final void gold(DefDescriptor<StyleDef> descriptor) throws Exception {
        goldFileText(descriptor.getDef().getCode(), ".css");
    }
}
