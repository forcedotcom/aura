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
        assertEquals(provider().getValue("test.fakeTheme.color", null).toString(), COLOR);
    }

    /** should get an error when reference a nonexistent theme */
    public void testQualifiedAbsent() throws QuickFixException {
        try {
            provider().getValue("does.not.exist", null);
            fail("Did not expect to find the theme definition.");
        } catch (DefinitionNotFoundException e) {
            assertTrue(e.getMessage().contains("No THEME"));
        }
    }

    /** check that aliased references work */
    public void testAliased() throws QuickFixException {
        assertEquals(aliased().getValue("var.color", null).toString(), COLOR);
    }

    /** check that you get an error when the alias is not defined */
    public void testAliasDoesntExist() throws QuickFixException {
        try {
            aliased().getValue("abc.color", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().contains("No alias"));
        }
    }

    /** confirm that we get the value from an overridden theme instead of the original */
    public void testOverridden() throws QuickFixException {
        assertEquals(overridden().getValue("themeTest.baseTheme.color", null).toString(), "yellow");
    }

    /** check that we get an error if the variable doesn't exist */
    public void testVariableDoesntExist() throws QuickFixException {
        try {
            provider().getValue("test.fakeTheme.idontexist", null);
            fail("expected to get exception");
        } catch (ThemeValueNotFoundException e) {
            assertTrue(e.getMessage().contains("idontexist"));
        }

    }

    /** check that we get an error if the number of parts in the argument are too many */
    public void testMalformedLong() throws QuickFixException {
        try {
            provider().getValue("one.two.three.four", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().contains("Expected exactly 2 or 3"));
        }
    }

    /** check that we get an error if the number of parts in the argument are too few */
    public void testMalformedShort() throws QuickFixException {
        try {
            provider().getValue("one", null);
            fail("expected to get exception");
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().contains("Expected exactly 2 or 3"));
        }
    }

    /** check that we get the correct descriptor */
    public void testGetDescriptorSingle() throws QuickFixException {
        Set<DefDescriptor<ThemeDef>> dds = provider().getDescriptors("test.fakeTheme.color", null);
        DefDescriptor<ThemeDef> expected = ThemeDefImpl.descriptor("test:fakeTheme");
        assertEquals(Iterables.getOnlyElement(dds), expected);
    }

    /** check that we get the correct descriptors when there are multiple */
    public void testGetDescriptorMultiple() throws QuickFixException {
        String nonsensical = "test.fakeTheme.color + themeTest.baseTheme.color";
        Set<DefDescriptor<ThemeDef>> dds = provider().getDescriptors(nonsensical, null);
        assertEquals(dds.size(), 2);

        DefDescriptor<ThemeDef> expected = ThemeDefImpl.descriptor("test:fakeTheme");
        DefDescriptor<ThemeDef> expected2 = ThemeDefImpl.descriptor("themeTest:baseTheme");
        assertEquals(Iterables.get(dds, 0, null), expected);
        assertEquals(Iterables.get(dds, 1, null), expected2);
    }

    /** check that get qualified descriptors only will not throw an exception on aliases */
    public void testGetDescriptorsIgnoreAliases() throws QuickFixException {
        String nonsensical = "var.color";
        Set<DefDescriptor<ThemeDef>> dds = provider().getDescriptors(nonsensical, null, true);
        assertTrue(dds.isEmpty());
        // and also no exceptions
    }

    public void testCrossReferenceSelf() throws QuickFixException {
        String val = provider().getValue("themeTest.crossReferencingTheme.errorColor", null).toString();
        assertEquals(val, "#ff0000");
    }

    public void testCrossReferenceOther() throws QuickFixException {
        String val = provider().getValue("themeTest.crossReferencingTheme.spacing", null).toString();
        assertEquals(val, "10px");
    }

    public void testCrossReferenceInAuraSet() throws QuickFixException {
        String val = provider().getValue("themeTest.crossReferencingTheme.position", null).toString();
        assertEquals(val, "absolute");
    }

    /** utility */
    private static ThemeValueProvider provider() {
        return new ThemeValueProviderImpl();
    }

    /** utility */
    public static ThemeValueProvider aliased() {
        return new ThemeValueProviderImpl(null, ImmutableMap.of("var", ThemeDefImpl.descriptor("test:fakeTheme")));
    }

    /** utility */
    public static ThemeValueProvider overridden() {
        DefDescriptor<ThemeDef> base = ThemeDefImpl.descriptor("themeTest:baseTheme");
        DefDescriptor<ThemeDef> child = ThemeDefImpl.descriptor("themeTest:childTheme");
        ThemeOverrideMap map = new ThemeOverrideMapImpl(ImmutableMap.of(base, child));
        return new ThemeValueProviderImpl(map, null);
    }
}