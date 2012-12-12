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
package org.auraframework.impl.system;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.AuraRuntimeException;

public class DefDescriptorImplTest extends AuraImplTestCase{

    public DefDescriptorImplTest(String name) {
        super(name);
    }

    public void testControllerDescriptorString() {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("java://foo.Bar", ControllerDef.class);
        assertEquals("java", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("java://foo.Bar", descriptor.getQualifiedName());
    }

    public void testControllerDescriptorStringLocation() {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("java://foo.Bar", ControllerDef.class);
        assertEquals("java", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("java://foo.Bar", descriptor.getQualifiedName());
    }

    public void testBadNameChars() {
        try {
            DefDescriptorImpl.getInstance("markup://foo.1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ+/", ComponentDef.class);
            fail("did not fail on invalid characters");
        } catch (AuraRuntimeException expected) {
            // ignore, I suppose we could check the string, but we should probably change the exception as well.
        }
    }

    public void testSerialize2() throws Exception {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("java://foo.Bar", ControllerDef.class);
        serializeAndGoldFile(descriptor);
    }

    public void testApexDescriptors() {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("apex://foo.Bar", ControllerDef.class);
        assertEquals("apex", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("apex://foo.Bar", descriptor.getQualifiedName());
    }

    public void testGetDefType() throws Exception {
        DefDescriptor<ComponentDef> testDescriptor = DefDescriptorImpl.getInstance("aura:test", ComponentDef.class);
        assertEquals(testDescriptor.getDefType(), DefType.COMPONENT);
    }

    public void testGetInstance() throws Exception  {
        // test getInstance(tag, defClass)
        DefDescriptor<?> testDescriptor = DefDescriptorImpl.getInstance("aura:test", ComponentDef.class);

        // getInstance should never return null
        assertNotNull(testDescriptor);

        // even if the component doesn't exist
        assertNotNull(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class));

        // subsequent calls to getInstance should return the same object
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("aura:test", ComponentDef.class)));

        // test getInstance(null, defClass)
        DefDescriptor<ComponentDef> testDescriptorNullTag = null;

        try {
            testDescriptorNullTag = DefDescriptorImpl.getInstance(null, ComponentDef.class);
            fail("Should have thrown AuraException for null tag in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
            assertEquals("descriptor is null", expected.getMessage());
        }

        // test getInstance(name, null)
        try {
            testDescriptorNullTag = DefDescriptorImpl.getInstance("aura:test", null);
            fail("Should have thrown AuraException for null defClass in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
            assertEquals("descriptor is null", expected.getMessage());
        }

        assertNull(testDescriptorNullTag);

        // test getting type instances.
        // Why did qualified name EVER match?? --fka3
        testDescriptor = DefDescriptorImpl.getInstance("Aura.Component", TypeDef.class);
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("aura://Aura.Component", TypeDef.class)));

        testDescriptor = DefDescriptorImpl.getInstance("aura://Aura.Component[]", TypeDef.class);
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("Aura.Component[]", TypeDef.class)));

        testDescriptor = DefDescriptorImpl.getInstance("aura://List<String>", TypeDef.class);
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("List<String>", TypeDef.class)));

        testDescriptor = DefDescriptorImpl.getInstance("aura://List", TypeDef.class);
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("List", TypeDef.class)));

        // no type validation for map sub-types
        testDescriptor = DefDescriptorImpl.getInstance("Map<Aura.Component>", TypeDef.class);
        assertSame(testDescriptor, (DefDescriptorImpl.getInstance("Map<String>", TypeDef.class)));
    }

    public void testGetNamespace() throws Exception  {
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace());
        assertEquals("fake", vendor.makeComponentDefDescriptor("fake:component").getNamespace());
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:test").getNamespace());

        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace()));
        assertFalse("aura".equals(vendor.makeComponentDefDescriptor("fake:component").getNamespace()));
        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:test").getNamespace()));
    }

    public void testGetName() throws Exception  {
        assertEquals("fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent").getName());
        assertEquals("component", vendor.makeComponentDefDescriptor("fake:component").getName());
        assertEquals("test", vendor.makeComponentDefDescriptor("aura:test").getName());

        assertFalse("fakeComponent".equals(vendor.makeComponentDefDescriptor("fake:component").getName()));
        assertFalse("fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:test").getName()));
        assertFalse("component".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getName()));
        assertFalse("component".equals(vendor.makeComponentDefDescriptor("aura:test").getName()));
        assertFalse("test".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getName()));
        assertFalse("test".equals(vendor.makeComponentDefDescriptor("fake:component").getName()));
    }

    public void testGetTag() throws Exception  {
        assertEquals("markup://aura:fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent").getQualifiedName());
        assertEquals("markup://fake:component", vendor.makeComponentDefDescriptor("fake:component").getQualifiedName());
        assertEquals("markup://aura:test", vendor.makeComponentDefDescriptor("aura:test").getQualifiedName());

        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("fake:component").getQualifiedName()));
        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:test").getQualifiedName()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getQualifiedName()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:test").getQualifiedName()));
        assertFalse("markup://aura:test".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getQualifiedName()));
        assertFalse("markup://aura:test".equals(vendor.makeComponentDefDescriptor("fake:component").getQualifiedName()));
    }

    public void testSerialize() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:fakeComponent"), "fakeAura");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("fake:component"), "fake");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:test"), "auraTest");
    }

    public void testToString() throws Exception  {
        assertEquals("markup://aura:fakeComponent", vendor.makeComponentDefDescriptor("aura:fakeComponent").toString());
        assertEquals("markup://fake:component", vendor.makeComponentDefDescriptor("fake:component").toString());
        assertEquals("markup://aura:test", vendor.makeComponentDefDescriptor("aura:test").toString());

        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("fake:component").toString()));
        assertFalse("markup://aura:fakeComponent".equals(vendor.makeComponentDefDescriptor("aura:test").toString()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").toString()));
        assertFalse("markup://fake:component".equals(vendor.makeComponentDefDescriptor("aura:test").toString()));
        assertFalse("markup://aura:test".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").toString()));
        assertFalse("markup://aura:test".equals(vendor.makeComponentDefDescriptor("fake:component").toString()));
    }

    public void testEquals() throws Exception  {
        assertTrue(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")));
        assertTrue(DefDescriptorImpl.getInstance("aurA:Fakecomponent", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")));
        assertTrue(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("fake:component")));
        assertTrue(DefDescriptorImpl.getInstance("aura:test", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:test")));

        assertFalse(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("fake:component")));
        assertFalse(DefDescriptorImpl.getInstance("aura:fakeComponent", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:test")));
        assertFalse(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")));
        assertFalse(DefDescriptorImpl.getInstance("fake:component", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:test")));
        assertFalse(DefDescriptorImpl.getInstance("aura:test", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("fake:component")));
        assertFalse(DefDescriptorImpl.getInstance("aura:test", ComponentDef.class).equals(vendor.makeComponentDefDescriptor("aura:fakeComponent")));
    }

}
