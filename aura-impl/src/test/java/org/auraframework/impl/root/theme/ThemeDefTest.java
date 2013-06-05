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

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertThat;

import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Unit tests for {@link ThemeDef}.
 */
public class ThemeDefTest extends AuraImplTestCase {
    private static final String src = "<aura:theme>" +
            "<aura:attribute name=\"one\" default=\"#222\"/>" +
            "<aura:attribute name=\"two\" default=\"10px\"/>" +
            "</aura:theme>";

    public ThemeDefTest(String name) {
        super(name);
    }

    public void testGetSource() {
        MasterDefRegistry reg = Aura.getContextService().getCurrentContext().getDefRegistry();
        Source<ThemeDef> src = reg.getSource(vendor.getThemeDefDescriptor());
        assertNotNull(src);
    }

    public void testAttributes() throws Exception {
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = def.getAttributeDefs();

        assertThat(attributes.size(), is(2));

        DefDescriptor<AttributeDef> color = DefDescriptorImpl.getInstance("one", AttributeDef.class);
        DefDescriptor<AttributeDef> margin = DefDescriptorImpl.getInstance("two", AttributeDef.class);

        assertThat(attributes.get(color), notNullValue());
        assertThat(attributes.get(margin), notNullValue());
    }

    public void testVariablePresent() throws Exception {
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        assertThat(def.variable("one").get(), equalTo("#222"));
    }

    public void testVariableAbsent() throws Exception {
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        assertThat(def.variable("notthere").isPresent(), is(false));
    }

    public void testValidatesDefaultsArePresent() throws Exception {
        try {
            String src = "<aura:theme><aura:attribute name='test' type='String'/></aura:theme>";
            source(src).validateDefinition();
            fail("expected the 'default' attribute to be mandatory");
        } catch (InvalidDefinitionException e) {
            assertThat(e.getMessage().contains("must specify a default value"), is(true));
        }
    }

    public void testValidatesGoodExtendsRef() throws Exception {
        String contents = "<aura:theme extends=\"%s\"></aura:theme>";
    }

    public void testValidatesBadExtendsRef() throws Exception {
        try {
            String src = "<aura:theme extends=\"test:idontexisttheme\"></aura:theme>";
            ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
            def.validateReferences();
            fail("Expected validation to fail.");
        } catch (DefinitionNotFoundException e) {
            assertThat(e.getMessage().contains("No THEME"), is(true));
        }
    }

    public void testDependenciesForExtends() throws Exception {
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        String src = "<aura:theme extends=\"test:fakeTheme\"></aura:theme>";
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();

        def.appendDependencies(dependencies);

        DefDescriptor<ThemeDef> desc = ThemeDefImpl.descriptor("test:fakeTheme");
        assertThat(dependencies.contains(desc), is(true));
    }

    public void testCantExtendItself() throws Exception {
        DefDescriptor<ThemeDef> extendsSelf = addSourceAutoCleanup(ThemeDef.class, "");
        StringSource<?> source = (StringSource<?>) auraTestingUtil.getSource(extendsSelf);
        String contents = "<aura:theme extends='%s'> </aura:theme>";
        source.addOrUpdate(String.format(contents, extendsSelf.getDescriptorName()));
        try {
            ThemeDef def = extendsSelf.getDef();
            def.validateReferences();
            fail("A theme should not be able to extend itself.");
        } catch (InvalidDefinitionException expected) {
            assertThat(expected.getMessage().contains("cannot extend itself"), is(true));
        }
    }

    public void testInvalidOverrideNoParent() throws QuickFixException {
        try {
            source("<aura:theme><aura:set attribute='test' value='abc'/></aura:theme>").validateReferences();
            fail("Expected the override to be invalid.");
        } catch (InvalidDefinitionException e) {
            assertThat(e.getMessage().contains("not inherited"), is(true));
        }
    }

    public void testInvalidOverride() throws QuickFixException {
        String contents = "<aura:theme extends='%s'><aura:set attribute='nothing' value='abc'/></aura:theme>";
        String source = String.format(contents, vendor.getThemeDefDescriptor().getDescriptorName());
        try {
            source(source).validateReferences();
            fail("Expected the override to be invalid.");
        } catch (InvalidDefinitionException e) {
            assertThat(e.getMessage().contains("not inherited"), is(true));
        }
    }

    public void testCantRedefineAttribute() {
        fail("unimplemented");
    }

    // test variable from parent

    // test parent variable overridden

    // test variable has same name? error or treat same as overridden

    /** utility */
    private ThemeDef source(String contents) throws QuickFixException {
        return addSourceAutoCleanup(ThemeDef.class, contents).getDef();
    }

    /** utility */
    private ThemeDef sourceWithParent(String contents) throws QuickFixException {
        contents = String.format(contents, vendor.getThemeDefDescriptor().getDescriptorName());
        return source(contents);
    }
}
