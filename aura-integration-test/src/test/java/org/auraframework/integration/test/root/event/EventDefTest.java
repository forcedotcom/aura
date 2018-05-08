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
package org.auraframework.integration.test.root.event;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Ignore;
import org.junit.Test;

public class EventDefTest extends AuraImplTestCase {
    @Test
    public void testEventDef() throws Exception {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<>();
        vendor.insertAttributeDef(atts, desc, "testString", "String", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        vendor.insertAttributeDef(atts, desc, "testInt", "Integer", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, atts, null, null, AuraContext.Access.INTERNAL);
        def.validateDefinition();
        assertEquals(EventType.COMPONENT, def.getEventType());
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = def.getDeclaredAttributeDefs();
        assertEquals(2, map.size());
        AttributeDef testString = map.get(definitionService.getDefDescriptor("testString", AttributeDef.class));
        assertNotNull(testString);
        AttributeDef testInt = map.get(definitionService.getDefDescriptor("testInt", AttributeDef.class));
        assertNotNull(testInt);
    }

    @Test
    public void testGetEventType() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        assertEquals(EventType.COMPONENT, def.getEventType());
    }

    @Test
    public void testGetExtendsDescriptor() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = definitionService.getDefDescriptor("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext, AuraContext.Access.INTERNAL);
        assertEquals(ext, def.getExtendsDescriptor());
    }

    @Test
    public void testValidateDefinitionNullDescriptor() throws Exception {
        EventDefImpl def = vendor.makeEventDefWithNulls(null, null, null, null, null);
        try {
            def.validateDefinition();
            fail("validate should have caught nulls");
        } catch (InvalidDefinitionException expected) {
        }
    }

    @Test
    public void testValidateDefinitionNullEventType() throws Exception {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, null, null, null, null);
        try {
            def.validateDefinition();
            fail("validate should have caught null type");
        } catch (InvalidDefinitionException expected) {
        }
    }

    @Test
    @Ignore("FIXME: goliver - need to figure out how to test")
    public void testValidateReferences() throws Exception {
        //FakeRegistry fake = createFakeRegistry();
        //EventDefImpl ed = vendor.makeEventDef();
        //EventDefImpl extendsED = vendor.makeEventDef(vendor.getParentEventDefDescriptor(), null);
        //fake.putDefinition(extendsED);
        //ed.validateReferences();
    }

    @Test
    public void testGetExtends() throws Exception {
        DefDescriptor<EventDef> eventDefDescriptor = vendor.makeEventDefDescriptor("test:fakeEvent");
        DefDescriptor<EventDef> eventDefDescriptorParent = vendor.makeEventDefDescriptor("test:parentEvent");
        EventDef ed = vendor.makeEventDef(eventDefDescriptor, eventDefDescriptorParent);
        assertEquals("parentEvent", ed.getExtendsDescriptor().getName());
    }

    @Test
    public void testDependencies() throws Exception {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = definitionService.getDefDescriptor("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext, AuraContext.Access.INTERNAL);
        Set<DefDescriptor<?>> dependencies = def.getDependencySet();
        assertTrue("dependencies don't contain the superclass: "+dependencies, dependencies.contains(ext));
    }

    @Test
    public void testSerialize() throws Exception {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<>();
        vendor.insertAttributeDef(atts, desc, "testString", "String", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        vendor.insertAttributeDef(atts, desc, "testInt", "Integer", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, atts, null, null);
        serializeAndGoldFile(def);
    }

    @Test
    public void testGetAttributeDefs() throws Exception {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<>();
        vendor.insertAttributeDef(atts, desc, "testString", "String", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        vendor.insertAttributeDef(atts, desc, "testInt", "Integer", true,
                AttributeDef.SerializeToType.BOTH, null, AuraContext.Access.PUBLIC);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, atts, null, null);

        Map<DefDescriptor<AttributeDef>, AttributeDef> returnedAttributes = def.getAttributeDefs();
        assertEquals(atts, returnedAttributes);
    }

    @Test
    public void testGetAttributeDefsWithParent() throws Exception {
        DefDescriptor<EventDef> edd = vendor.makeEventDefDescriptor("test:parentEvent");
        EventDefImpl ed = vendor.makeEventDef(null, edd);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = ed.getAttributeDefs();
        assertEquals(3, atts.size());
        assertTrue(atts.containsKey(vendor.getAttributeDescriptor()));
        assertTrue(atts.containsKey(definitionService.getDefDescriptor("att1", AttributeDef.class)));
        assertTrue(atts.containsKey(definitionService.getDefDescriptor("att2", AttributeDef.class)));
    }

    @Test
    public void testEquals() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = definitionService.getDefDescriptor("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor
                .makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0), ext, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                ext, AuraContext.Access.INTERNAL);
        assertEquals(def, def2);
    }

    @Test
    public void testEqualsWithDifferentTypes() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.APPLICATION, null, null, null, AuraContext.Access.INTERNAL);
        assertFalse("Equals should have been false due to different event types", def.equals(def2));
    }

    @Test
    public void testEqualsWithDifferentDescriptors() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> desc2 = definitionService.getDefDescriptor("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc2, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        assertFalse("Equals should have been false due to different descriptors", def.equals(def2));
    }

    @Test
    public void testEqualsWithDifferentExtendsDescriptors() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = definitionService.getDefDescriptor("fake:extendevent", EventDef.class);
        DefDescriptor<EventDef> ext2 = definitionService.getDefDescriptor("fake:extendevent2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext2, AuraContext.Access.INTERNAL);
        assertFalse("Equals should have been false due to different extends descriptors", def.equals(def2));
    }

    @Test
    public void testEqualsWithNullExtendsDescriptors() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null, AuraContext.Access.INTERNAL);
        assertEquals(def, def2);
    }

    @Test
    public void testHashCode() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, null, new Location("filename1", 5,
                5, 0), null);
        EventDefImpl def2 = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, null, new Location("filename1", 5,
                5, 0), null);
        assertEquals(def.hashCode(), def2.hashCode());
    }

    @Test
    public void testHashCodeWithDifferentDescriptors() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> desc2 = definitionService.getDefDescriptor("fake:event2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc2, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        assertFalse("Hash code should have been different due to different descriptors",
                def.hashCode() == def2.hashCode());
    }

    @Test
    public void testHashCodeWithDifferentEventTypes() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.APPLICATION, null, null, null, AuraContext.Access.INTERNAL);
        assertFalse("Hash code should have been different due to different event types",
                def.hashCode() == def2.hashCode());
    }

    @Test
    public void testHashCodeWithDifferentAttributeDefs() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attDefs = new HashMap<>();
        attDefs.put(definitionService.getDefDescriptor(vendor.getAttributeName(), AttributeDef.class),
                vendor.makeAttributeDef());
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, attDefs, null, null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null, AuraContext.Access.INTERNAL);
        assertFalse("Hash code should have been different due to different attribute defs",
                def.hashCode() == def2.hashCode());
    }

    @Test
    public void testHashCodeWithDifferentLocations() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 6, 6, 0),
                null, AuraContext.Access.INTERNAL);
        assertFalse("Hash code should have been different due to different locations",
                def.hashCode() == def2.hashCode());
    }

    @Test
    public void testHashCodeWithDifferentExtendsDescriptors() {
        DefDescriptor<EventDef> desc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = definitionService.getDefDescriptor("fake:extendevent1", EventDef.class);
        DefDescriptor<EventDef> ext2 = definitionService.getDefDescriptor("fake:extendevent2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext, AuraContext.Access.INTERNAL);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext2, AuraContext.Access.INTERNAL);
        assertFalse("Hash code should have been different due to different extends descriptors",
                def.hashCode() == def2.hashCode());
    }

    @Test
    public void testExtendsWrongEventType() {
        DefDescriptor<?> dd = addSourceAutoCleanup(EventDef.class,
                "<aura:event type=\"component\" extends=\"test:applicationEvent\"></aura:event>");

        try {
            definitionService.getDefinition(dd);
            fail("Should not be able to create event with null type");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Event " + dd.getQualifiedName()
                    + " cannot extend markup://test:applicationEvent", dd.getQualifiedName());
        }
    }
}
