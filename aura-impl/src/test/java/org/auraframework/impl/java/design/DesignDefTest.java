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
package org.auraframework.impl.java.design;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.AuraImplTestCase;

public class DesignDefTest extends AuraImplTestCase {

    public DesignDefTest(String name) {
        super(name);
    }

    public void testLoadFakeDesignDefinition() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeComponent", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
    }

    public void testVerifyDesignDefLabel() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeDesign", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
        assertEquals("DesignDef label is incorrect.", "some label", c.getLabel());
    }

    public void testLoadFakeDesignWithAttributes() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeDesign", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
        Map<String, AttributeDesignDef> attrs = c.getAttributeDesignDefs();
        assertFalse("Unable to parse AttributeDesignDefs on DesignDef!", attrs == null || attrs.size() == 0);
        AttributeDesignDef attr = attrs.get("something");
        assertNotNull("AttributeDesignDef something not found!", attr);
    }

    public void testAttributeDesignProperties() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeDesign", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
        Map<String, AttributeDesignDef> attrs = c.getAttributeDesignDefs();
        assertFalse("Unable to parse AttributeDesignDefs on DesignDef!", attrs == null || attrs.size() == 0);
        AttributeDesignDef attr = attrs.get("something");
        assertNotNull("AttributeDesignDef 'something' not found!", attr);
        assertEquals("AttributeDesignDef 'something' name is incorrect.", "something", attr.getName());
        assertEquals("AttributeDesignDef 'something' label is incorrect.", "some label", attr.getLabel());
        assertEquals("AttributeDesignDef 'something' min is incorrect.", "-100", attr.getMin());
        assertEquals("AttributeDesignDef 'something' max is incorrect.", "100", attr.getMax());

        AttributeDesignDef attr2 = attrs.get("entities");
        assertNotNull("AttributeDesignDef 'entities' not found!", attr2);
        assertEquals("AttributeDesignDef 'entities' type is incorrect.", "EntityName", attr2.getType());
        assertEquals("AttributeDesignDef 'entities' datasource is incorrect or has wrong format.", "Account,Contact",
                attr2.getDataSource());
        assertTrue("AttributeDesignDef 'entities' required is incorrect.", attr2.isRequired());
        assertFalse("AttributeDesignDef 'entities' readonly is incorrect.", attr2.isReadOnly());
    }

    public void testAttributeDesignDataSource() throws Exception {
        DesignDef c = Aura.getDefinitionService().getDefinition("test:fakeDesign", DesignDef.class);
        assertNotNull("DesignDef not found!", c);
        assertTrue("DesignDef not found!", c.getDescriptor().exists());
        Map<String, AttributeDesignDef> attrs = c.getAttributeDesignDefs();
        assertFalse("Unable to parse AttributeDesignDefs on DesignDef!", attrs == null || attrs.size() == 0);
        AttributeDesignDef attr = attrs.get("else");
        assertNotNull("AttributeDesignDef 'else' not found!", attr);
        assertEquals("AttributeDesignDef 'else' datasource is incorrect or has wrong format", "one,two,three",
                attr.getDataSource());
    }
}
