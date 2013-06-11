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

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

import java.util.Set;

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.ThemeOverrideMapImpl;
import org.auraframework.impl.css.parser.ThemeValueProviderImpl;
import org.auraframework.impl.root.theme.ThemeDefImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;

/**
 * Unit tests for {@link ThemeValueProvider}.
 */
public class ThemeValueProviderTest extends AuraImplTestCase {
    private static final String COLOR = "#ffcc00";

    public ThemeValueProviderTest(String name) {
        super(name);
    }

    /** check that qualified references resolve */
    public void testQualified() throws QuickFixException {
        assertThat(provider().getValue("test.fakeTheme.color", null).toString(), is(COLOR));
    }

    /** should get an error when reference a nonexistent theme */
    public void testQualifiedAbsent() throws QuickFixException {
        try {
            provider().getValue("does.not.exist", null);
            fail("Did not expect to find the theme definition.");
        } catch (DefinitionNotFoundException e) {
            assertThat(e.getMessage().contains("No THEME"), is(true));
        }
    }

    /** check that aliased references work */
    public void testAliased() throws QuickFixException {
        assertThat(aliased().getValue("var.color", null).toString(), is(COLOR));
    }

    /** check that you get an error when the alias is not defined */
    public void testAliasDoesntExist() throws QuickFixException {
        try {
            aliased().getValue("abc.color", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertThat(e.getMessage().contains("No alias"), is(true));
        }
    }

    /** confirm that we get the value from an overridden theme instead of the original */
    public void testOverridden() throws QuickFixException {
        assertThat(overridden().getValue("themeTest.baseTheme.color", null).toString(), is("yellow"));
    }

    /** check that we get an error if the variable doesn't exist */
    public void testVariableDoesntExist() throws QuickFixException {
        try {
            provider().getValue("test.fakeTheme.idontexist", null);
            fail("expected to get exception");
        } catch (ThemeValueNotFoundException e) {
            assertThat(e.getMessage().contains("idontexist"), is(true));
        }

    }

    /** check that we get an error if the number of parts in the argument are too many */
    public void testMalformedLong() throws QuickFixException {
        try {
            provider().getValue("one.two.three.four", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertThat(e.getMessage().contains("Expected exactly 2 or 3"), is(true));
        }
    }

    /** check that we get an error if the number of parts in the argument are too few */
    public void testMalformedShort() throws QuickFixException {
        try {
            provider().getValue("one", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertThat(e.getMessage().contains("Expected exactly 2 or 3"), is(true));
        }
    }

    /** check that we get the correct descriptor */
    public void testGetDescriptorSingle() throws QuickFixException {
        Set<DefDescriptor<ThemeDef>> dds = provider().getDescriptors("test.fakeTheme.color", null);
        DefDescriptor<ThemeDef> expected = ThemeDefImpl.descriptor("test:fakeTheme");
        assertThat(Iterables.getOnlyElement(dds), is(expected));
    }

    /** check that we get the correct descriptors when there are multiple */
    public void testGetDescriptorMultiple() throws QuickFixException {
        String nonsensical = "test.fakeTheme.color + themeTest.baseTheme.color";
        Set<DefDescriptor<ThemeDef>> dds = provider().getDescriptors(nonsensical, null);
        assertThat(dds.size(), is(2));

        DefDescriptor<ThemeDef> expected = ThemeDefImpl.descriptor("test:fakeTheme");
        DefDescriptor<ThemeDef> expected2 = ThemeDefImpl.descriptor("themeTest:baseTheme");
        assertThat(Iterables.get(dds, 0, null), is(expected));
        assertThat(Iterables.get(dds, 1, null), is(expected2));
    }

    /** utility */
    private static ThemeValueProvider provider() {
        return new ThemeValueProviderImpl();
    }

    /** utility */
    public static ThemeValueProvider aliased() {
        return new ThemeValueProviderImpl(null, ImmutableMap.of("var", "test:fakeTheme"));
    }

    /** utility */
    public static ThemeValueProvider overridden() {
        ThemeOverrideMap map = new ThemeOverrideMapImpl();
        map.addOverride(ThemeDefImpl.descriptor("themeTest:baseTheme"), ThemeDefImpl.descriptor("themeTest:childTheme"));
        return new ThemeValueProviderImpl(map, null);
    }

}