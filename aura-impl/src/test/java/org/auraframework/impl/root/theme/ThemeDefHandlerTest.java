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

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.ThemeDefHandler;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * Unit tests for {@link ThemeDefHandler}.
 */
public class ThemeDefHandlerTest extends AuraImplTestCase {
    private static final DefDescriptor<ThemeDef> desc = DefDescriptorImpl.getInstance("fake:theme", ThemeDef.class);
    private static final XMLParser parser = XMLParser.getInstance();

    public ThemeDefHandlerTest(String name) {
        super(name);
    }

    public void testAttributes() throws Exception {
        String src = "<aura:theme><aura:attribute name='test' type='String' default='abc'/></aura:theme>";
        ThemeDef def = parser.parse(desc, source(src));

        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = def.getAttributeDefs();
        assertEquals("didn't get expected number of attributes", 1, attrs.size());

        DefDescriptor<AttributeDef> attr = DefDescriptorImpl.getInstance("test", AttributeDef.class);
        assertTrue("didn't find expected attribute", attrs.containsKey(attr));
        assertEquals("incorrect value for attribute", "abc", attrs.get(attr).getDefaultValue().getValue());
    }

    /** no type specified should be same as type=String" */
    public void testDefaultType() throws Exception {
        String src = "<aura:theme><aura:attribute name='test' default='abc'/></aura:theme>";
        ThemeDef def = parser.parse(desc, source(src));

        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = def.getAttributeDefs();
        assertEquals("didn't get expected number of attributes", 1, attrs.size());

        DefDescriptor<AttributeDef> attr = DefDescriptorImpl.getInstance("test", AttributeDef.class);
        assertTrue("didn't find expected attribute", attrs.containsKey(attr));
        assertEquals("incorrect value for attribute", "abc", attrs.get(attr).getDefaultValue().getValue());
    }

    public void testInvalidChild() throws Exception {
        try {
            parser.parse(desc, source("<aura:theme><aura:foo/></aura:theme>"));
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:theme");
        } catch (AuraRuntimeException e) {
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            parser.parse(desc, source("<aura:theme>Test</aura:theme>"));
            fail("Should have thrown AuraException because text is between aura:theme tags");
        } catch (AuraRuntimeException e) {
        }
    }

    /** utility */
    private StringSource<ThemeDef> source(String contents) {
        return new StringSource<ThemeDef>(desc, contents, "themeID", Format.XML);
    }
}
