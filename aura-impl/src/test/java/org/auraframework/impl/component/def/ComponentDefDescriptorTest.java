/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.component.def;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;

public class ComponentDefDescriptorTest extends AuraImplTestCase {

    public ComponentDefDescriptorTest(String name) {
        super(name);
    }

    public void testGetDefType() throws Exception {
        DefDescriptor<ComponentDef> testDescriptor = DefDescriptorImpl.getInstance("aura:text", ComponentDef.class);
        assertEquals(testDescriptor.getDefType(), DefType.COMPONENT);
    }

    public void testGetInstance() throws Exception {
        DefDescriptor<ComponentDef> testDescriptor = DefDescriptorImpl.getInstance("aura:text", ComponentDef.class);

        // getInstance should never return null
        assertNotNull(testDescriptor);

        // even if the component doesn't exist
        assertNotNull(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class));

        // subsequent calls to getInstance should return the same object
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("aura:text", ComponentDef.class)));

        DefDescriptor<ComponentDef> testDescriptorNullTag = null;

        try {
            testDescriptorNullTag = DefDescriptorImpl.getInstance(null, ComponentDef.class);
            fail("Should have thrown AuraException for null tag in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
        }

        try {
            testDescriptorNullTag = DefDescriptorImpl.getInstance("aura:text", null);
            fail("Should have thrown AuraException for null defClass in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
        }

        assertNull(testDescriptorNullTag);
    }

    public void testGetNamespace() throws Exception {
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace());
        assertEquals("fake", vendor.makeComponentDefDescriptor("fake:component").getNamespace());
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:text").getNamespace());

        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace()));
        assertFalse("aura".equals(vendor.makeComponentDefDescriptor("fake:component").getNamespace()));
        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:text").getNamespace()));
    }

    public void testGetName() throws Exception {
        assertEquals("fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent").getName());
        assertEquals("component", vendor.makeComponentDefDescriptor("fake:component").getName());
        assertEquals("text", vendor.makeComponentDefDescriptor("aura:text").getName());

        assertFalse("fakeComponent".equals(vendor.makeComponentDefDescriptor("fake:component").getName()));
        assertFalse("fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:text").getName()));
        assertFalse("component".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getName()));
        assertFalse("component".equals(vendor.makeComponentDefDescriptor("aura:text").getName()));
        assertFalse("test".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getName()));
        assertFalse("test".equals(vendor.makeComponentDefDescriptor("fake:component").getName()));
    }

    public void testGetTag() throws Exception {
        assertEquals("markup://aura:fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent")
                .getQualifiedName());
        assertEquals("markup://fake:component", vendor.makeComponentDefDescriptor("fake:component").getQualifiedName());
        assertEquals("markup://aura:text", vendor.makeComponentDefDescriptor("aura:text").getQualifiedName());

        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("fake:component")
                .getQualifiedName()));
        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:text")
                .getQualifiedName()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")
                .getQualifiedName()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:text").getQualifiedName()));
        assertFalse("markup://aura:text".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")
                .getQualifiedName()));
        assertFalse("markup://aura:text".equals(vendor.makeComponentDefDescriptor("fake:component").getQualifiedName()));
    }

    public void testSerialize() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:fakeComponent"), "fakeAura");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("fake:component"), "fake");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:text"), "auraText");
    }

    public void testToString() throws Exception {
        assertEquals("markup://aura:fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent").toString());
        assertEquals("markup://fake:component", vendor.makeComponentDefDescriptor("fake:component").toString());
        assertEquals("markup://aura:text", vendor.makeComponentDefDescriptor("aura:text").toString());

        assertFalse("markup://aura:fakeComponent"
                .equals(vendor.makeComponentDefDescriptor("fake:component").toString()));
        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:text").toString()));
        assertFalse("markup://fake:component"
                .equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").toString()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:text").toString()));
        assertFalse("markup://aura:text".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").toString()));
        assertFalse("markup://aura:text".equals(vendor.makeComponentDefDescriptor("fake:component").toString()));
    }

    public void testEquals() throws Exception {
        assertTrue(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:fakeComponent")));
        assertTrue(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("fake:component")));
        assertTrue(DefDescriptorImpl.getInstance("aura:text", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:text")));

        assertFalse(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("fake:component")));
        assertFalse(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:text")));
        assertFalse(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:fakeComponent")));
        assertFalse(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:text")));
        assertFalse(DefDescriptorImpl.getInstance("aura:text", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("fake:component")));
        assertFalse(DefDescriptorImpl.getInstance("aura:text", ComponentDef.class).equals(
                vendor.makeComponentDefDescriptor("aura:fakeComponent")));
    }

}
