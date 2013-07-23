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

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.ThemeOverrideMapImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;

/**
 * Unit tests for {@link ThemeOverrideMapImpl}.
 */
public class ThemeOverrideMapTest extends AuraImplTestCase {
    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    public ThemeOverrideMapTest(String name) {
        super(name);
    }

    public void testPutAndGet() throws QuickFixException {
        DefDescriptor<ThemeDef> child = child();
        ThemeOverrideMap map = map(child.getDef().getExtendsDescriptor(), child);
        assertEquals(map.getOverride(child.getDef().getExtendsDescriptor()).get(), child);
    }

    public void testValidateSuccess() throws QuickFixException {
        DefDescriptor<ThemeDef> child = child();
        map(child.getDef().getExtendsDescriptor(), child).validate();
    }

    public void testValidateFail() throws QuickFixException {
        try {
            map(root(), root()).validate();
            fail("expected of theme override validation to fail.");
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().contains("in order to override it"));
        }
    }

    public void testValidateIndirect() throws QuickFixException {
        DefDescriptor<ThemeDef> parent = root();
        DefDescriptor<ThemeDef> child = indirectChild(parent);
        map(parent, child).validate();
    }

    private ThemeOverrideMap map(DefDescriptor<ThemeDef> original, DefDescriptor<ThemeDef> override) {
        return new ThemeOverrideMapImpl(ImmutableMap.of(original, override));
    }

    private DefDescriptor<ThemeDef> source(String contents) throws QuickFixException {
        return addSourceAutoCleanup(ThemeDef.class, contents);
    }

    private DefDescriptor<ThemeDef> root() throws QuickFixException {
        return source("<aura:theme></aura:theme>");
    }

    private DefDescriptor<ThemeDef> child() throws QuickFixException {
        return child(root());
    }

    private DefDescriptor<ThemeDef> child(DefDescriptor<ThemeDef> parent) throws QuickFixException {
        return source(String.format("<aura:theme extends=\"%s\"></aura:theme>", parent.getDescriptorName()));
    }

    private DefDescriptor<ThemeDef> indirectChild(DefDescriptor<ThemeDef> parent) throws QuickFixException {
        DefDescriptor<ThemeDef> middle = child(parent);
        return child(middle);
    }
}
