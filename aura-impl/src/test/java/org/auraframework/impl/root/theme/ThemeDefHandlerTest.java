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
import org.auraframework.throwable.AuraException;
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
        assertEquals("Didn't find correct name for String type", "String", attrs.get(attr).getTypeDef().getDescriptor()
                .getName());
        assertEquals("Didn't find correct qualified name for String type", "aura://String", attrs.get(attr)
                .getTypeDef().getDescriptor().getQualifiedName());
        assertEquals("Didn't find correct descriptor name for String type", "String", attrs.get(attr).getTypeDef()
                .getDescriptor().getDescriptorName());
    }

    /**
     * Non String type should be parsed without error Note this is different behavior from regular aura:attribute where
     * type is a required attribute.
     * **/
    public void testTypeNonString() throws QuickFixException {
        String src = "<aura:theme>" +
                "<aura:attribute name='test' default='1' type='Integer' />" +
                "</aura:theme>";
        try {
            ThemeDef def = source(src);
            AttributeDef aDef = def.getAttributeDef("test");
            assertEquals("Default value should be an Integer of value 1", 1,
                    Integer.parseInt(aDef.getDefaultValue().getValue().toString()));
        } catch (Exception e) {
            fail("Theme should be parsed but failed with exception " + e.getStackTrace());
        }
    }

    /**
     * Type is specified as "". "" is disallowed and the definition does not parse.
     * 
     * @throws QuickFixException
     */
    public void testEmptyType() throws QuickFixException {
        String src = "<aura:theme>" +
                "<aura:attribute name='test' default='1' type='' />" +
                "</aura:theme>";
        try {
            source(src);
            fail("Empty value for type is disallowed and the definition does not parse");
        } catch (AuraRuntimeException e) {
            // do nothing, expected flow
        }
    }

    /**
     * Tests type that is unsupported.
     * 
     * @throws QuickFixException
     */
    public void testInvalidType() throws QuickFixException {
        String src = "<aura:theme>" +
                "<aura:attribute name='test' default='1' type='An Unsupported Type' />" +
                "</aura:theme>";
        try {
            source(src);
            fail("Unsupported value for type should cause the definition to fail parsing.");
        } catch (AuraRuntimeException e) {
            // do nothing, expected flow
        }
    }

    /**
     * When there is a mismatch between value of default and expected type, parsing should fail. Eg. Type is Integer but
     * value for default is of type String.
     */
    public void testDefaultTypeMismatch() {
        String src = "<aura:theme>" +
                "<aura:attribute name='test' default='abc' type='Integer' />" +
                "</aura:theme>";
        try {
            source(src);
            fail("Theme shouldn't parse when there exists a mismatch between default value and default type");
        } catch (AuraException e) {
            // do nothing, expected flow
        }
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
        DefDescriptor<ThemeDef> desc = vendor.getThemeDefDescriptor();
        String src = "<aura:theme extends=\"%s\"></aura:theme>";
        ThemeDef def = source(String.format(src, desc.getDescriptorName()));
        assertThat(def.getExtendsDescriptor(), equalTo(desc));
    }

    /** utility */
    private ThemeDef source(String contents) throws QuickFixException {
        return addSourceAutoCleanup(ThemeDef.class, contents).getDef();
    }
}
