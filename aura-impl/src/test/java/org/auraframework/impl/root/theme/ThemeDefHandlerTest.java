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
import static org.junit.Assert.assertThat;

import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.ThemeDefHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Unit tests for {@link ThemeDefHandler}.
 */
public class ThemeDefHandlerTest extends AuraImplTestCase {
    public ThemeDefHandlerTest(String name) {
        super(name);
    }

    public void testAttributes() throws Exception {
        String src = "<aura:theme><aura:attribute name='test' type='String' default='abc'/></aura:theme>";
        ThemeDef def = source(src);

        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = def.getAttributeDefs();
        assertEquals("didn't get expected number of attributes", 1, attrs.size());

        DefDescriptor<AttributeDef> attr = DefDescriptorImpl.getInstance("test", AttributeDef.class);
        assertTrue("didn't find expected attribute", attrs.containsKey(attr));
        assertEquals("incorrect value for attribute", "abc", attrs.get(attr).getDefaultValue().getValue());
    }

    /** no type specified should be same as type=String" */
    public void testDefaultType() throws Exception {
        String src = "<aura:theme><aura:attribute name='test' default='abc'/></aura:theme>";
        ThemeDef def = source(src);

        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = def.getAttributeDefs();
        assertEquals("didn't get expected number of attributes", 1, attrs.size());

        DefDescriptor<AttributeDef> attr = DefDescriptorImpl.getInstance("test", AttributeDef.class);
        assertTrue("didn't find expected attribute", attrs.containsKey(attr));
        assertEquals("incorrect value for attribute", "abc", attrs.get(attr).getDefaultValue().getValue());
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:theme><aura:foo/></aura:theme>");
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:theme");
        } catch (AuraRuntimeException e) {
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:theme>Test</aura:theme>");
            fail("Should have thrown AuraException because text is between aura:theme tags");
        } catch (AuraRuntimeException e) {
        }
    }

    public void testExtends() throws Exception {
        ThemeDef def = source("<aura:theme extends=\"fake:theme\"></aura:theme>");
        DefDescriptor<ThemeDef> expected = ThemeDefImpl.descriptor("fake:theme");
        assertThat(def.getExtendsDescriptor(), equalTo(expected));
    }

    /** utility */
    private ThemeDef source(String contents) throws QuickFixException {
        return addSourceAutoCleanup(ThemeDef.class, contents).getDef();
    }
}
