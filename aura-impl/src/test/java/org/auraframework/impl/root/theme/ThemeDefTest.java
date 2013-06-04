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

import com.google.common.collect.Sets;

/**
 * Unit tests for {@link ThemeDef}.
 */
public class ThemeDefTest extends AuraImplTestCase {
    private static final String src = "<aura:theme>" +
            "<aura:attribute name=\"color\" default=\"#222\"/>" +
            "<aura:attribute name=\"margin\" default=\"10px\"/>" +
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

        DefDescriptor<AttributeDef> color = DefDescriptorImpl.getInstance("color", AttributeDef.class);
        DefDescriptor<AttributeDef> margin = DefDescriptorImpl.getInstance("margin", AttributeDef.class);

        assertThat(attributes.get(color), notNullValue());
        assertThat(attributes.get(margin), notNullValue());
    }

    public void testVariablePresent() throws Exception {
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        assertThat(def.variable("color").get(), equalTo("#222"));
    }

    public void testVariableAbsent() throws Exception {
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        assertThat(def.variable("font").isPresent(), is(false));
    }

    public void testValidateDefaultsPresent() throws Exception {
        try {
            String src = "<aura:theme><aura:attribute name='test' type='String'/></aura:theme>";
            DefDescriptor<ThemeDef> def = addSourceAutoCleanup(ThemeDef.class, src);
            def.getDef().validateDefinition();
            fail("expected the 'default' attribute to be mandatory");
        } catch (InvalidDefinitionException e) {
            assertThat(e.getMessage().contains("must specify a default value"), is(true));
        }
    }

    public void testValidatesGoodExtendsRef() throws Exception {
        String src = "<aura:theme extends=\"test:fakeTheme\"></aura:theme>";
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();
        def.validateReferences();
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

    public void testDependencies() throws Exception {
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();

        String src = "<aura:theme extends=\"test:fakeTheme\"></aura:theme>";
        ThemeDef def = addSourceAutoCleanup(ThemeDef.class, src).getDef();

        def.appendDependencies(dependencies);

        DefDescriptor<ThemeDef> desc = ThemeDefImpl.descriptor("test:fakeTheme");
        assertThat(dependencies.contains(desc), is(true));
    }

    public void testExtendsItself() throws Exception {
        DefDescriptor<ThemeDef> extendsSelf = addSourceAutoCleanup(ThemeDef.class, "");
        StringSource<?> source = (StringSource<?>) auraTestingUtil.getSource(extendsSelf);
        source.addOrUpdate(String.format("<aura:theme extends='%s'> </aura:theme>",
                extendsSelf.getDescriptorName()));
        try {
            ThemeDef def = extendsSelf.getDef();
            def.validateReferences();
            fail("A theme should not be able to extend itself.");
        } catch (InvalidDefinitionException expected) {
            assertThat(expected.getMessage().contains("cannot extend itself"), is(true));
        }
    }

    // test variable from parent

    // test parent variable overridden

    // test variable has same name? error or treat same as overridden
}
