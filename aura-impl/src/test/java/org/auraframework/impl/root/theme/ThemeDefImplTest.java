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

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProviderDef;
import org.auraframework.def.ThemeMapProviderDef;
import org.auraframework.def.VarDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.java.provider.TestThemeDescriptorProvider;
import org.auraframework.impl.java.provider.TestThemeMapProvider;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;

/**
 * Unit tests for {@link ThemeDefImpl}.
 */
public class ThemeDefImplTest extends StyleTestCase {
    public ThemeDefImplTest(String name) {
        super(name);
    }

    public void testEmptyTheme() throws QuickFixException {
        ThemeDef emptyThemeDef = addSeparateTheme("<aura:theme />").getDef(); // should parse without error
        Map<String, VarDef> vars = emptyThemeDef.getDeclaredVarDefs();
        assertTrue(vars.isEmpty());
        assertNull("Description should be null", emptyThemeDef.getDescription());
        assertNotNull("Name must be initialized", emptyThemeDef.getName());
    }

    public void testThemeEquivalence() throws QuickFixException {
        ThemeDef theme1 = addSeparateTheme(theme().var("color", "red")).getDef();
        ThemeDef theme2 = addSeparateTheme(theme().var("color", "red")).getDef();
        assertTrue("expected theme1 to equal theme1", theme1.equals(theme1));
        assertFalse("expected theme1 unequal to theme2", theme1.equals(theme2));
        assertFalse("expected theme2 unequal to theme1", theme2.equals(theme1));
        assertFalse("expected theme1 not to equal null", theme1.equals(null));
    }

    public void testIsCmpTheme() throws Exception {
        DefDescriptor<ThemeDef> theme = addThemeAndStyle(theme(), ".THIS{}");
        assertTrue(theme.getDef().isCmpTheme());
    }

    public void testThemeWithBadMarkup() {
        try {
            addSeparateTheme("<aura:theme><aura:var name='one' value='1' />").getDef();
            fail("Bad markup should be caught");
        } catch (Exception e) {
            // sjsxp: XML document structures must start and end within the same entity
            // woodstox: was expecting a close tag for element <aura:theme>
            // no common message so asserting correct exception for now
            checkExceptionContains(e, InvalidDefinitionException.class, " ");
        }
    }

    public void testThemeBadMarkupVarNesting() {
        try {
            addSeparateTheme("<aura:theme><aura:var name='one' value='1'>"
                    + "	<aura:var name='two' value='2' />" + "</aura:var></aura:theme>").getDef();
            fail("Invalid nesting of vars should be caught");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No children allowed");
        }
    }

    public void testUnsupportedAttributes() {
        try {
            addSeparateTheme("<aura:theme fakeattrib='fakeattribvalue' />").getDef();
            fail("Unsupported attributes should not be allowed");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Invalid attribute \"fakeattrib\"");
        }
    }

    public void testHasVarDeclared() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("var1", "var1"));
        assertTrue(theme.getDef().hasVar("var1"));
    }

    public void testHasVarImported() throws Exception {
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("imported", "imported"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(imported));
        assertTrue(theme.getDef().hasVar("imported"));
    }

    public void testHasVarInherited() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("inherited", "inherited"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(parent));
        assertTrue(theme.getDef().hasVar("inherited"));
    }

    public void testHasVarFalse() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("var1", "var1"));
        assertFalse(theme.getDef().hasVar("var2"));
    }

    public void testGetVarPresent() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("var1", "var1").var("var2", "var2"));
        assertEquals(theme.getDef().getVar("var1").get().toString(), "var1");
    }

    public void testGetVarAbsent() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("var1", "var1").var("var2", "var2"));
        assertFalse(theme.getDef().getVar("notthere").isPresent());
    }

    /** var is only imported from a theme */
    public void testGetVarImported() throws Exception {
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("imported", "imported"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(imported));
        assertEquals("imported", theme.getDef().getVar("imported").get());
    }

    /** var is only inherited on the theme */
    public void testGetVarInherited() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("inherited", "inherited"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(parent));
        assertEquals("inherited", theme.getDef().getVar("inherited").get());
    }

    /** var is overridden by declared var */
    public void testGetVarDirectlyOverridden() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("inherited", "v1"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(parent).var("inherited", "v2"));
        assertEquals("v2", theme.getDef().getVar("inherited").get());
    }

    /** var is overridden through an import */
    public void testGetVarImportOverridden() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("inherited", "v1"));
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("inherited", "v2"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(parent).imported(imported));
        assertEquals("v2", theme.getDef().getVar("inherited").get());
    }

    /** var is overridden through an import and directly */
    public void testGetVarDirectlyAndImportOverridden() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("inherited", "v1"));
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("inherited", "v2"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme()
                .parent(parent)
                .imported(imported)
                .var("inherited", "v3"));
        assertEquals("v3", theme.getDef().getVar("inherited").get());
    }

    /** last import should win */
    public void testGetVarValueMultipleImports() throws Exception {
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("inherited", "v1"));
        DefDescriptor<ThemeDef> imported2 = addSeparateTheme(theme().var("blah", "blah"));
        DefDescriptor<ThemeDef> imported3 = addSeparateTheme(theme().var("inherited", "v2"));
        DefDescriptor<ThemeDef> imported4 = addSeparateTheme(theme().var("inherited", "v3"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme()
                .imported(imported)
                .imported(imported2)
                .imported(imported3)
                .imported(imported4));
        assertEquals("v3", theme.getDef().getVar("inherited").get());

    }

    public void testGetDeclaredVarDefs() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme()
                .var("test1", "test1")
                .var("test2", "test2")
                .var("test3", "test3"));
        Map<String, VarDef> map = theme.getDef().getDeclaredVarDefs();

        assertEquals("didn't get expected map size", 3, map.size());
        assertTrue(map.get("test1") != null);
    }

    public void testGetDeclaredImports() throws Exception {
        DefDescriptor<ThemeDef> imported1 = addSeparateTheme(theme());
        DefDescriptor<ThemeDef> imported2 = addSeparateTheme(theme());
        DefDescriptor<ThemeDef> imported3 = addSeparateTheme(theme());
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme()
                .imported(imported1)
                .imported(imported2)
                .imported(imported3));
        List<DefDescriptor<ThemeDef>> map = theme.getDef().getDeclaredImports();
        assertEquals("didn't get expected map size", 3, map.size());
    }

    public void testGetVarDefDeclared() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("test1", "test1"));
        assertNotNull(theme.getDef().getVarDef("test1"));
    }

    public void testGetVarDefImported() throws Exception {
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("imported", "imported"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(imported));
        assertNotNull(theme.getDef().getVarDef("imported"));
    }

    public void testGetVarDefInherited() throws Exception {
        DefDescriptor<ThemeDef> inherited = addSeparateTheme(theme().var("inherited", "inherited"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(inherited));
        assertNotNull(theme.getDef().getVarDef("inherited"));
    }

    private DefDescriptor<ThemeDef> complexSetup() {
        DefDescriptor<ThemeDef> importp2 = addSeparateTheme(theme()
                .var("shared3", "shared3"));

        DefDescriptor<ThemeDef> parent2 = addSeparateTheme(theme()
                .imported(importp2)
                .var("p2a", "p2a")
                .var("p2b", "p2b")
                .var("shared1", "shared1")
                .var("shared2", "shared2"));

        DefDescriptor<ThemeDef> parent1 = addSeparateTheme(theme()
                .parent(parent2)
                .var("p1a", "p1a")
                .var("p1b", "p1b"));

        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme()
                .var("i1a", "i1a")
                .var("i1b", "i1b"));

        DefDescriptor<ThemeDef> import2a = addSeparateTheme(theme()
                .var("shared2", "shared2")
                .var("i2a-1", "i2a-1"));

        DefDescriptor<ThemeDef> import2 = addSeparateTheme(theme()
                .imported(import2a)
                .var("i2a", "i2a")
                .var("i2b", "i2b"));

        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme()
                .parent(parent1)
                .imported(import1)
                .imported(import2)
                .var("shared1", "shared1")
                .var("d1", "d1")
                .var("d2", "d2"));

        // remember, imports are reversed, declared ordered before imported
        return theme;
    }

    public void testGetDeclaredVarNames() throws Exception {
        Set<String> names = complexSetup().getDef().getDeclaredNames();
        assertEquals("didn't get expected size", 3, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));
    }

    public void testGetImportedVarNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getImportedNames());
        assertEquals("didn't get expected size", 6, names.size());
        assertEquals("i2a", Iterables.get(names, 0));
        assertEquals("i2b", Iterables.get(names, 1));
        assertEquals("shared2", Iterables.get(names, 2));
        assertEquals("i2a-1", Iterables.get(names, 3));
        assertEquals("i1a", Iterables.get(names, 4));
        assertEquals("i1b", Iterables.get(names, 5));
    }

    public void testGetInheritedVarNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getInheritedNames());
        assertEquals("didn't get expected size", 7, names.size());
        assertEquals("p1a", Iterables.get(names, 0));
        assertEquals("p1b", Iterables.get(names, 1));
        assertEquals("p2a", Iterables.get(names, 2));
        assertEquals("p2b", Iterables.get(names, 3));
        assertEquals("shared1", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("shared3", Iterables.get(names, 6));
    }

    /** imported + declared */
    public void testGetOwnVarNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getOwnNames());
        assertEquals("didn't get expected size", 9, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));

        assertEquals("i2a", Iterables.get(names, 3));
        assertEquals("i2b", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("i2a-1", Iterables.get(names, 6));
        assertEquals("i1a", Iterables.get(names, 7));
        assertEquals("i1b", Iterables.get(names, 8));
    }

    /** imported + declared + inherited */
    public void testGetAllVarNames() throws Exception {
        Set<String> names = ImmutableSet.copyOf(complexSetup().getDef().getAllNames());
        assertEquals("didn't get expected size", 14, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("d1", Iterables.get(names, 1));
        assertEquals("d2", Iterables.get(names, 2));

        assertEquals("i2a", Iterables.get(names, 3));
        assertEquals("i2b", Iterables.get(names, 4));
        assertEquals("shared2", Iterables.get(names, 5));
        assertEquals("i2a-1", Iterables.get(names, 6));
        assertEquals("i1a", Iterables.get(names, 7));
        assertEquals("i1b", Iterables.get(names, 8));

        assertEquals("p1a", Iterables.get(names, 9));
        assertEquals("p1b", Iterables.get(names, 10));
        assertEquals("p2a", Iterables.get(names, 11));
        assertEquals("p2b", Iterables.get(names, 12));
        assertEquals("shared3", Iterables.get(names, 13));
    }

    /** intersection of own var names (declared or imported) with inherited var names */
    public void testGetOverriddenVarNames() throws Exception {
        Set<String> names = complexSetup().getDef().getOverriddenNames();
        assertEquals("didn't get expected size", 2, names.size());
        assertEquals("shared1", Iterables.get(names, 0));
        assertEquals("shared2", Iterables.get(names, 1));
    }

    /** no errors when extends refers to existent theme */
    public void testValidatesGoodExtendsRef() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> child = addSeparateTheme(theme().parent(parent));
        child.getDef().validateReferences();
    }

    /** errors when extends refers to nonexistent theme */
    public void testValidatesBadExtendsRef() throws Exception {
        try {
            String src = "<aura:theme extends=\"test:idontexisttheme\"></aura:theme>";
            addSeparateTheme(src).getDef().validateReferences();
            fail("Expected validation to fail.");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }

    /** cannot extend itself */
    public void testCantExtendItself() throws Exception {
        DefDescriptor<ThemeDef> extendsSelf = addSourceAutoCleanup(ThemeDef.class, "");
        StringSource<?> source = (StringSource<?>) getAuraTestingUtil().getSource(extendsSelf);
        String contents = "<aura:theme extends='%s'> </aura:theme>";
        source.addOrUpdate(String.format(contents, extendsSelf.getDescriptorName()));
        try {
            ThemeDef def = extendsSelf.getDef();
            def.validateReferences();
            fail("A theme should not be able to extend itself.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot extend itself");
        }
    }

    /** circular hierarchies are prevented */
    public void testCircularHierarchy() throws Exception {
        DefDescriptor<ThemeDef> circular1 = addSourceAutoCleanup(ThemeDef.class, "");
        DefDescriptor<ThemeDef> circular2 = addSourceAutoCleanup(ThemeDef.class, "");

        StringSource<?> source = (StringSource<?>) getAuraTestingUtil().getSource(circular1);
        String contents = "<aura:theme extends='%s'><aura:var name='attr' value='1'/></aura:theme>";
        source.addOrUpdate(String.format(contents, circular2.getDescriptorName()));

        source = (StringSource<?>) getAuraTestingUtil().getSource(circular2);
        contents = "<aura:theme extends='%s'> </aura:theme>";
        source.addOrUpdate(String.format(contents, circular1.getDescriptorName()));

        try {
            ThemeDef def = circular2.getDef();
            def.getVar("attr");
            def.getAllNames(); // recursive
            fail("expected to throw InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "eventually extend itself");
        }
    }

    /** error thrown if extending and importing the same theme */
    public void testExtendAndImportSameTheme() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme());
        try {
            addSeparateTheme(theme().parent(parent).imported(parent)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "extend and import");
        }
    }

    /** cmp themes can't extend other themes */
    public void testCmpThemesCantExtend() throws Exception {
        try {
            DefDescriptor<ThemeDef> parent = addSeparateTheme("<aura:theme/>");
            addThemeAndStyle(theme().parent(parent), ".THIS{}").getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not extend");
        }
    }

    /** cmp themes can't import other themes */
    public void testCmpThemeCantImport() throws Exception {
        try {
            DefDescriptor<ThemeDef> import1 = addSeparateTheme("<aura:theme/>");
            addThemeAndStyle(theme().imported(import1), ".THIS{}").getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot import another theme");
        }
    }

    /** can't extend from a cmp theme */
    public void testCantExtendFromCmpTheme() throws Exception {
        try {
            DefDescriptor<ThemeDef> parent = addThemeAndStyle("<aura:theme/>", ".THIS{}");
            addNsTheme(theme().parent(parent).var("color", "red")).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not extend");
        }
    }

    public void testCantImportCmpTheme() throws Exception {
        DefDescriptor<ThemeDef> local = addThemeAndStyle(theme(), ".THIS{}");

        try {
            addSeparateTheme(theme().imported(local)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be imported");
        }
    }

    public void testCantImportThemeWithExtends() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme("<aura:theme/>");
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().parent(parent));

        try {
            addSeparateTheme(theme().imported(theme)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be imported");
        }
    }

    public void testCantImportThemeWithProvider() throws Exception {
        DefDescriptor<ThemeDef> withProvider = addSeparateTheme(theme().descriptorProvider(
                TestThemeDescriptorProvider.REF));

        try {
            addSeparateTheme(theme().imported(withProvider)).getDef();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be imported");
        }
    }

    /** the cross reference must be inherited or declared */
    public void testInvalidCrossRef() throws Exception {
        try {
            addSeparateTheme("<aura:theme><aura:var name='one' value='{!notthere}'/></aura:theme>").getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, ThemeValueNotFoundException.class, "was not found");
        }
    }

    /** cross references to declared vars should not throw an error */
    public void testValidCrossRefDeclared() throws Exception {
        addSeparateTheme(theme().var("one", "one").var("two", "{!one}")).getDef().validateReferences();
    }

    /** cross references to inherited vars should not throw an error */
    public void testValidCrossRefInherited() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> child = addSeparateTheme(theme().parent(parent).var("myColor", "{!color}"));
        child.getDef().validateReferences(); // no error
    }

    /** cross references to imported vars should not throw an error */
    public void testValidCrossRefImported() throws Exception {
        DefDescriptor<ThemeDef> imported = addSeparateTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(imported).var("myColor", "{!color}"));
        theme.getDef().validateReferences(); // no error
    }

    /** cmp themes can also cross ref something from the namespace-default theme */
    public void testValidCrossRefLocalToNamespaceDefault() throws Exception {
        addNsTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> theme = addThemeAndStyle(theme().var("myColor", "{!color}"), ".THIS{}");
        theme.getDef().validateReferences(); // no error
    }

    /** test import theme cross refs namespace-default theme */
    public void testImportThemeCrossRefNamespaceDefault() throws Exception {
        addNsTheme(theme().var("color", "red"));

        // this can't work, because the imported theme might get imported into a different namespace, and that
        // different namespace's default theme might not define a value.
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme().var("myColor", "{!color}"));
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(import1));

        try {
            theme.getDef().validateReferences();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, ThemeValueNotFoundException.class, "was not found");
        }
    }

    public void testAppendsExtendsToDeps() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("color", "red"));
        DefDescriptor<ThemeDef> child = addSeparateTheme(theme().parent(parent));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        child.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(parent));
    }

    public void testAddsImportsToDependencies() throws Exception {
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme().var("imported", "imported"));
        DefDescriptor<ThemeDef> import2 = addSeparateTheme(theme().var("imported", "imported"));

        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().imported(import1).imported(import2));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        theme.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(import1));
        assertTrue(dependencies.contains(import2));
    }

    /** if a cmp theme cross-refs a global var value, a dependency on the namespace default theme should be added */
    public void testAppendsGlobalCrossRefInCmpThemeToDeps() throws Exception {
        DefDescriptor<ThemeDef> nsTheme = addNsTheme(theme().var("globalColor", "red"));
        DefDescriptor<ThemeDef> localTheme = addThemeAndStyle(theme().var("color", "{!globalColor}"), ".THIS{}");

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        localTheme.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(nsTheme));
    }

    public void testGetDescriptorProviderAbsent() throws Exception {
        assertNull(addSeparateTheme(theme()).getDef().getDescriptorProvider());
    }

    public void testGetDescriptorProviderPresent() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        assertEquals(TestThemeDescriptorProvider.REF, theme.getDef().getDescriptorProvider().getQualifiedName());
    }

    public void testAddsProviderToDeps() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        theme.getDef().appendDependencies(dependencies);

        DefDescriptor<ThemeDescriptorProviderDef> def = DefDescriptorImpl.getInstance(TestThemeDescriptorProvider.REF,
                ThemeDescriptorProviderDef.class);
        assertTrue(dependencies.contains(def));
    }

    public void testGetConcreteDescriptorWithProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF));
        assertEquals(TestThemeDescriptorProvider.DESC, theme.getDef().getConcreteDescriptor().getDescriptorName());
    }

    public void testGetConcreteDescriptorWithoutProvider() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().var("color", "red"));
        assertEquals(theme.getDescriptorName(), theme.getDef().getConcreteDescriptor().getDescriptorName());
    }

    public void testErrorsIfProviderThemeHasVars() throws Exception {
        try {
            addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF).var("color", "red")).getDef()
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify vars");
        }
    }

    public void testErrorsIfProviderThemeHasImports() throws Exception {
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme().var("imported", "imported"));
        try {
            addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF).imported(import1)).getDef()
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify imports");
        }
    }

    public void testErrorsIfProviderThemeHasExtends() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("parent", "parent"));
        try {
            addSeparateTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF).parent(parent)).getDef()
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not use 'extends'");
        }
    }

    public void testErrorsIfProviderThemeIsCmpTheme() throws Exception {
        try {
            addThemeAndStyle(theme().descriptorProvider(TestThemeDescriptorProvider.REF), ".THIS{}").getDef()
                    .getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }

    public void testErrorsIfProviderThemeIsNsDefaultTheme() throws Exception {
        try {
            addNsTheme(theme().descriptorProvider(TestThemeDescriptorProvider.REF)).getDef().getConcreteDescriptor();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }

    public void testGetMapProviderAbsent() throws Exception {
        assertNull(addSeparateTheme(theme()).getDef().getMapProvider());
    }

    public void testGetMapProviderPresent() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));
        assertEquals(TestThemeMapProvider.REF, theme.getDef().getMapProvider().getQualifiedName());
    }

    public void testAddsMapProviderToDeps() throws Exception {
        DefDescriptor<ThemeDef> theme = addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF));

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        theme.getDef().appendDependencies(dependencies);

        DefDescriptor<ThemeMapProviderDef> def = DefDescriptorImpl.getInstance(TestThemeMapProvider.REF,
                ThemeMapProviderDef.class);
        assertTrue(dependencies.contains(def));
    }

    public void testErrorsIfMapProviderThemeHasVars() throws Exception {
        try {
            addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF).var("color", "red")).getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify vars");
        }
    }

    public void testErrorsIfMapProviderThemeHasImports() throws Exception {
        DefDescriptor<ThemeDef> import1 = addSeparateTheme(theme().var("imported", "imported"));
        try {
            addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF).imported(import1)).getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify imports");
        }
    }

    public void testErrorsIfMapProviderThemeHasExtends() throws Exception {
        DefDescriptor<ThemeDef> parent = addSeparateTheme(theme().var("parent", "parent"));
        try {
            addSeparateTheme(theme().mapProvider(TestThemeMapProvider.REF).parent(parent)).getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not use 'extends'");
        }
    }

    public void testErrorsIfMapProviderThemeIsCmpTheme() throws Exception {
        try {
            addThemeAndStyle(theme().mapProvider(TestThemeMapProvider.REF), ".THIS{}").getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }

    public void testErrorsIfMapProviderThemeIsNsDefaultTheme() throws Exception {
        try {
            addNsTheme(theme().mapProvider(TestThemeMapProvider.REF)).getDef();
            fail("Expected to catch an exception.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify a provider");
        }
    }
}
