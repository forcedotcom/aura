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
package org.auraframework.impl.system;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TypeDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;

public class DefDescriptorImplTest extends AuraImplTestCase {
    @Test
    public void testControllerDescriptorString() {
        DefDescriptor<ControllerDef> descriptor = definitionService.getDefDescriptor("java://foo.Bar", ControllerDef.class);
        assertEquals("java", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("java://foo.Bar", descriptor.getQualifiedName());
    }

    @Test
    public void testControllerDescriptorStringLocation() {
        DefDescriptor<ControllerDef> descriptor = definitionService.getDefDescriptor("java://foo.Bar", ControllerDef.class);
        assertEquals("java", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("java://foo.Bar", descriptor.getQualifiedName());
    }

    @Test
    public void testBadNameChars() {
        try {
            definitionService.getDefDescriptor("markup://foo.1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ+/", ComponentDef.class);
            fail("did not fail on invalid characters");
        } catch (AuraRuntimeException expected) {
            // ignore, I suppose we could check the string, but we should
            // probably change the exception as well.
        }
    }

    @Test
    public void testSerialize2() throws Exception {
        DefDescriptor<ControllerDef> descriptor = definitionService.getDefDescriptor("java://foo.Bar", ControllerDef.class);
        serializeAndGoldFile(descriptor);
    }

    @Test
    public void testApexDescriptors() {
        DefDescriptor<ControllerDef> descriptor = definitionService.getDefDescriptor("apex://foo.Bar", ControllerDef.class);
        assertEquals("apex", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("apex://foo.Bar", descriptor.getQualifiedName());
    }

    @Test
    public void testGetDefType() throws Exception {
        DefDescriptor<ComponentDef> testDescriptor = definitionService.getDefDescriptor("aura:text", ComponentDef.class);
        assertEquals(testDescriptor.getDefType(), DefType.COMPONENT);
    }

    @ThreadHostileTest("cache dependent")
    @Test
    public void testGetInstance() throws Exception {
        // test getInstance(tag, defClass)
        DefDescriptor<?> testDescriptor = definitionService.getDefDescriptor("aura:text", ComponentDef.class);

        // getInstance should never return null
        assertNotNull(testDescriptor);

        // even if the component doesn't exist
        assertNotNull(definitionService.getDefDescriptor("fake:component", ComponentDef.class));

        // subsequent calls to getInstance should return objects that are the same.
        assertSame(testDescriptor, (definitionService.getDefDescriptor("aura:text", ComponentDef.class)));

        // test getInstance(null, defClass)
        DefDescriptor<ComponentDef> testDescriptorNullTag = null;

        try {
            testDescriptorNullTag = definitionService.getDefDescriptor(null, ComponentDef.class);
            fail("Should have thrown AuraException for null tag in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
        	assertEquals("descriptor is null", expected.getMessage());
        }

        // test getInstance(name, null)
        try {
            testDescriptorNullTag = definitionService.getDefDescriptor("aura:text", null);
            fail("Should have thrown AuraException for null defClass in ComponentDefDescriptor");
        } catch (AuraRuntimeException expected) {
            assertEquals("descriptor is null", expected.getMessage());
        }

        assertNull(testDescriptorNullTag);

        // test getting type instances.
        // Why did qualified name EVER match?? --fka3
        
        // It is unncetain why this fails. Here is a bug for investigation: W-2051904. 
        // testDescriptor = DefDescriptorImpl.getInstance("Aura.Component", TypeDef.class);
        // assertEquals(testDescriptor, (DefDescriptorImpl.getInstance("aura://Aura.Component", TypeDef.class)));

        testDescriptor = definitionService.getDefDescriptor("aura://Aura.Component[]", TypeDef.class);
        assertEquals(testDescriptor, (definitionService.getDefDescriptor("Aura.Component[]", TypeDef.class)));

        testDescriptor = definitionService.getDefDescriptor("aura://List<String>", TypeDef.class);
        assertEquals(testDescriptor, (definitionService.getDefDescriptor("List<String>", TypeDef.class)));

        testDescriptor = definitionService.getDefDescriptor("aura://List", TypeDef.class);
        assertEquals(testDescriptor, (definitionService.getDefDescriptor("List", TypeDef.class)));

        // no type validation for map sub-types
        testDescriptor = definitionService.getDefDescriptor("Map<Aura.Component>", TypeDef.class);
        assertEquals(testDescriptor, (definitionService.getDefDescriptor("Map<String>", TypeDef.class)));
    }

    @Test
    public void testGetNamespace() throws Exception {
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace());
        assertEquals("fake", vendor.makeComponentDefDescriptor("fake:component").getNamespace());
        assertEquals("aura", vendor.makeComponentDefDescriptor("aura:text").getNamespace());

        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:fakeComponent").getNamespace()));
        assertFalse("aura".equals(vendor.makeComponentDefDescriptor("fake:component").getNamespace()));
        assertFalse("fake".equals(vendor.makeComponentDefDescriptor("aura:text").getNamespace()));
    }

    @Test
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

    @Test
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

    @Test
    public void testSerialize() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:fakeComponent"), "fakeAura");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("fake:component"), "fake");
        serializeAndGoldFile(vendor.makeComponentDefDescriptor("aura:text"), "auraText");
    }

    @Test
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

    @Test
    public void testComparison() throws Exception {
        DefDescriptor<?> fakeComponent = definitionService.getDefDescriptor("aura:fakeComponent", ComponentDef.class);
        DefDescriptor<?> fakeComponent2 = definitionService.getDefDescriptor("Aura:FakeComponent", ComponentDef.class);
        DefDescriptor<?> fooComponent = definitionService.getDefDescriptor("aura:foo", ComponentDef.class);

        assertTrue(fakeComponent.compareTo(fakeComponent2) == 0);
        assertTrue(fooComponent.compareTo(fakeComponent) > 0);
        assertTrue(fakeComponent.compareTo(fooComponent) < 0);
        assertTrue(fakeComponent.compareTo(null) > 0);
    }

    private void testEquals(DefDescriptor<?> x, DefDescriptor<?> y, int compareTo) throws Exception {
        if (compareTo == 0) {
            assertTrue(x + " equals " + y, x.equals(y));
            assertEquals(x + " compareTo[" + compareTo + "] " + y, x.compareTo(y), compareTo);
            assertEquals(x.hashCode(), y.hashCode());
        } else {
            assertFalse(x + " NOT equals " + y, x.equals(y));
            assertTrue(x + " compareTo[" + compareTo + "] " + y, x.compareTo(y) * compareTo > 0);
            assertFalse(x.hashCode() == y.hashCode());
        }
    }

    @Test
    public void testEquals() throws Exception {
        testEquals(definitionService.getDefDescriptor("aura:fakeComponent", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:fakeComponent"), 0);
        testEquals(definitionService.getDefDescriptor("aurA:Fakecomponent", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:fakeComponent"), 0);
        testEquals(definitionService.getDefDescriptor("fake:component", ComponentDef.class),
                vendor.makeComponentDefDescriptor("fake:component"), 0);
        testEquals(definitionService.getDefDescriptor("aura:text", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:text"), 0);
        testEquals(definitionService.getDefDescriptor("some:component", ComponentDef.class),
                definitionService.getDefDescriptor("markup://some:component", ComponentDef.class), 0);
        /* this class of descriptors does not default a prefix, which makes sense in some cases like for renderer, provider, etc.
        testEquals(DefDescriptorImpl.getInstance("js://some.component", HelperDef.class),
				DefDescriptorImpl.getInstance("some.component", HelperDef.class), 0);
		 */

        testEquals(definitionService.getDefDescriptor("aura:fakeComponent", ComponentDef.class),
                vendor.makeComponentDefDescriptor("fake:component"), -1);
        testEquals(definitionService.getDefDescriptor("aura:fakeComponent", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:text"), -1);
        testEquals(definitionService.getDefDescriptor("fake:component", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:fakeComponent"), 1);
        testEquals(definitionService.getDefDescriptor("fake:component", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:text"), 1);
        testEquals(definitionService.getDefDescriptor("aura:text", ComponentDef.class),
                vendor.makeComponentDefDescriptor("fake:component"), -1);
        testEquals(definitionService.getDefDescriptor("aura:text", ComponentDef.class),
                vendor.makeComponentDefDescriptor("aura:fakeComponent"), 1);
        testEquals(definitionService.getDefDescriptor("aura:text", ApplicationDef.class),
                vendor.makeComponentDefDescriptor("aura:text"), -1);
    }

    @Test
    public void testEqualsWithSameBundle() throws Exception {
        DefDescriptor<ComponentDef> bundle = definitionService.getDefDescriptor("aura:bundle", ComponentDef.class, null);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle), 0);
    }

    @Test
    public void testEqualsWithEquivalentBundle() throws Exception {
        DefDescriptor<ComponentDef> bundle1 = definitionService.getDefDescriptor("aura:bundle", ComponentDef.class, null);
        DefDescriptor<ComponentDef> bundle2 = definitionService.getDefDescriptor("aura:BUNDLE", ComponentDef.class, null);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle1),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle2), 0);
    }

    @Test
    public void testEqualsWithDifferentBundle() throws Exception {
        DefDescriptor<ComponentDef> bundle1 = definitionService.getDefDescriptor("aura:bundle1", ComponentDef.class, null);
        DefDescriptor<ComponentDef> bundle2 = definitionService.getDefDescriptor("aura:bundle2", ComponentDef.class, null);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle1),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle2), -1);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle2),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle1), 1);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle1),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, null), 1);
        testEquals(definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, null),
                definitionService.getDefDescriptor("aura:bundled", ComponentDef.class, bundle2), -1);
    }

    @Test
    public void testFunkyDescriptor() {
        definitionService.getDefDescriptor("layout://rl-Case-EDIT-FULL-----_1-0-6c5936744658364d59726d6c6a4d7a31654d697872673d3d.c", ComponentDef.class);
    }

    @Test
    public void testHyphenUnderscoreInName() throws Exception {
        definitionService.getDefDescriptor("markup://test:hyphened-underscored_name-component", ModuleDef.class);
    }

}
