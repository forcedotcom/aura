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

import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Unit tests for {@link ThemeDef}.
 */
public class ThemeDefTest extends AuraImplTestCase {
    private static final String sample = "<aura:theme>" + "<aura:attribute name='one' default='1'/>"
            + "<aura:attribute name='two' default='2'/>" + "</aura:theme>";

    private static final String sampleChild = "<aura:theme extends='%s'>" + "<aura:attribute name='one' default='1'/>"
            + "<aura:attribute name='two' default='2'/>" + "</aura:theme>";

    private static final String sampleOverridden = "<aura:theme extends='%s'>"
            + "<aura:attribute name='one' default='1'/>" + "<aura:attribute name='two' default='2'/>"
            + "<aura:set attribute='color' value='newcolor'/>" + "</aura:theme>";

    private static final String sampleRedefined = "<aura:theme extends='%s'>"
            + "<aura:attribute name='color' default='newcolor'/>" + "</aura:theme>";

    public ThemeDefTest(String name) {
        super(name);
    }

    public void testGetSource() {
        MasterDefRegistry reg = Aura.getContextService().getCurrentContext().getDefRegistry();
        Source<ThemeDef> src = reg.getSource(vendor.getThemeDefDescriptor());
        assertNotNull(src);
    }

    public void testEmptyTheme() throws QuickFixException {
        String emptyTheme = "<aura:theme />";
        ThemeDef emptyThemeDef = source(emptyTheme); // should parse without error
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = emptyThemeDef.getAttributeDefs();
        assertTrue(attributes.isEmpty());
        String description = emptyThemeDef.getDescription();
        assertNull("Description should be null", description);
        String name = emptyThemeDef.getName();
        assertNotNull("Name must be initialized", name);
    }

    /** 2 themes with same markup should not be equal **/
    public void testThemeEquivalence() throws QuickFixException {
        ThemeDef theme1 = source(sample);
        ThemeDef theme2 = source(sample);
        assertFalse(theme1.equals(theme2));
    }

    /** Theme with bad markup should fail gracefully **/
    public void testThemeWithBadMarkup() {
        try {
            String badMarkup = "<aura:theme>" + "<aura:attribute name='one' default='1' />";
            source(badMarkup);
            fail("Bad markup should be caught");
        } catch (Exception e) {
            assertTrue("Exception must be " + AuraUnhandledException.class.getSimpleName(),
                    e instanceof AuraUnhandledException);
            expectMessage(e, "XML document structures must start and end within the same entity");
        }
    }

    public void testThemeBadMarkupAttributeNesting() {
        try {
            String badMarkup = "<aura:theme>" + "<aura:attribute name='one' default='1'>"
                    + "	<aura:attribute name='two' default='2' />" + "</aura:attribute>" + "</aura:theme>";
            source(badMarkup);
            fail("Invalid nesting of attributes should be caught");
        } catch (Exception e) {
            assertTrue("Exception must be " + InvalidSystemAttributeException.class.getSimpleName(),
                    e instanceof InvalidSystemAttributeException);
            expectMessage(e, "Invalid attribute \"name\"");
        }
    }

    /**
     * Aura:theme only supports the extends attribute.
     * 
     * @throws QuickFixException
     */
    public void testUnsupportedAttributes() {
        try {
            String badTheme = "<aura:theme fakeattrib='fakeattribvalue' />";
            source(badTheme);
            fail("Unsupported attributes should not be allowed");
        } catch (Exception e) {
            assertTrue("Exception must be " + InvalidSystemAttributeException.class.getSimpleName(),
                    e instanceof InvalidSystemAttributeException);
            expectMessage(e, "Invalid attribute \"fakeattrib\"");

        }
    }

    /** attributes are correctly parsed */
    public void testAttributes() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = source(sample).getAttributeDefs();

        assertEquals(attributes.size(), 2);

        DefDescriptor<AttributeDef> color = DefDescriptorImpl.getInstance("one", AttributeDef.class);
        DefDescriptor<AttributeDef> margin = DefDescriptorImpl.getInstance("two", AttributeDef.class);

        assertNotNull(attributes.get(color));
        assertNotNull(attributes.get(margin));
    }

    /** default value must be specified on every inner attribute */
    public void testValidatesDefaultsArePresent() throws Exception {
        try {
            String src = "<aura:theme><aura:attribute name='test' type='String'/></aura:theme>";
            source(src).validateDefinition();
            fail("expected the 'default' attribute to be mandatory");
        } catch (InvalidDefinitionException e) {
            expectMessage(e, "must specify a default value");
        }
    }

    /** no errors when extends refers to existent theme */
    public void testValidatesGoodExtendsRef() throws Exception {
        sourceWithParent("<aura:theme extends=\"%s\"></aura:theme>").validateReferences();
    }

    /** errors when extends refers to nonexistent theme */
    public void testValidatesBadExtendsRef() throws Exception {
        try {
            String src = "<aura:theme extends=\"test:idontexisttheme\"></aura:theme>";
            source(src).validateReferences();
            fail("Expected validation to fail.");
        } catch (DefinitionNotFoundException e) {
            expectMessage(e, "No THEME");
        }
    }

    /** adds parent theme to list of dependencies */
    public void testDependenciesForExtends() throws Exception {
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        String src = "<aura:theme extends=\"%s\"></aura:theme>";
        sourceWithParent(src).appendDependencies(dependencies);

        assertTrue(dependencies.contains(vendor.getThemeDefDescriptor()));
    }

    /** adds cross referenced themes as dependencies */
    public void testDependenciesForCrossReferences() throws Exception {
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        String src1 = "<aura:theme><aura:attribute name=\"abc\" default=\"1\"/></aura:theme>";
        ThemeDef def1 = source(src1);
        DefDescriptor<ThemeDef> descriptor = def1.getDescriptor();

        String src2 = "<aura:theme><aura:attribute name=\"xyz\" default=\"{!%s.%s.abc}\"/></aura:theme>";
        ThemeDef def2 = source(String.format(src2, descriptor.getNamespace(), descriptor.getName()));

        def2.appendDependencies(dependencies);
        assertTrue(dependencies.contains(descriptor));
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
        } catch (InvalidDefinitionException e) {
            expectMessage(e, "cannot extend itself");
        }
    }

    /** circular hierarchies are prevented */
    public void testCircularHierarchy() throws Exception {
        DefDescriptor<ThemeDef> circular1 = addSourceAutoCleanup(ThemeDef.class, "");
        DefDescriptor<ThemeDef> circular2 = addSourceAutoCleanup(ThemeDef.class, "");

        StringSource<?> source = (StringSource<?>) getAuraTestingUtil().getSource(circular1);
        String contents = "<aura:theme extends='%s'><aura:attribute name='attr' default='1'/></aura:theme>";
        source.addOrUpdate(String.format(contents, circular2.getDescriptorName()));

        source = (StringSource<?>) getAuraTestingUtil().getSource(circular2);
        contents = "<aura:theme extends='%s'> </aura:theme>";
        source.addOrUpdate(String.format(contents, circular1.getDescriptorName()));

        try {
            ThemeDef def = circular2.getDef();
            def.variable("attr");
            def.getAttributeDefs(); // recursive
            fail("expected to throw InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            expectMessage(e, "refer back to itself");
        }
    }

    /** can't use an override/aura:set without a parent */
    public void testInvalidOverrideNoParent() throws QuickFixException {
        try {
            source("<aura:theme><aura:set attribute='test' value='abc'/></aura:theme>").validateReferences();
            fail("Expected the override to be invalid.");
        } catch (InvalidDefinitionException e) {
            expectMessage(e, "not inherited");
        }
    }

    /** errors when aura:set refers to attribute not on any parents */
    public void testInvalidOverride() throws QuickFixException {
        try {
            String src = "<aura:theme extends='%s'><aura:set attribute='nothing' value='abc'/></aura:theme>";
            sourceWithParent(src).validateReferences();
            fail("Expected the override to be invalid.");
        } catch (InvalidDefinitionException e) {
            expectMessage(e, "not inherited");
        }
    }

    /** ensure variable function works */
    public void testVariablePresent() throws Exception {
        assertEquals(source(sample).variable("one").get().toString(), "1");
    }

    /** ensure variable function works */
    public void testVariableAbsent() throws Exception {
        assertFalse(source(sample).variable("notthere").isPresent());
    }

    /** correctly gets variable defined on a parent */
    public void testVariableFromParent() throws QuickFixException {
        assertEquals(sourceWithParent(sampleChild).variable("color").get().toString(), "#ffcc00");
    }

    /** correctly uses overridden variable value */
    public void testVariableIsOverridden() throws Exception {
        assertEquals(sourceWithParent(sampleOverridden).variable("color").get().toString(), "newcolor");
    }

    /** redefine an attribute on the child that exists already on a parent */
    public void testRedefinedAttributed() throws Exception {
        // redefining a variable is highly unrecommended. aura:set should be used instead.
        // however, there isn't a good place to test for this so it's still expected to work.
        assertEquals(sourceWithParent(sampleRedefined).variable("color").get().toString(), "newcolor");
    }

    /** utility */
    private ThemeDef source(String contents) throws QuickFixException {
        return addSourceAutoCleanup(ThemeDef.class, contents).getDef();
    }

    /** utility */
    private ThemeDef sourceWithParent(String contents) throws QuickFixException {
        contents = String.format(contents, vendor.getThemeDefDescriptor().getDescriptorName());
        return source(contents);
    }

    /** utility */
    private void expectMessage(Exception e, String string) {
        assertTrue(e.getMessage().contains(string));
    }
}
