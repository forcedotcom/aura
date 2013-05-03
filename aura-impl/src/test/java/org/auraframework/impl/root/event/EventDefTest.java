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
package org.auraframework.impl.root.event;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.FakeRegistry;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * TODO: test extends
 */
public class EventDefTest extends AuraImplTestCase {

    public EventDefTest(String name) {
        super(name);
    }

    public void testEventDef() throws Exception {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        DefDescriptor<TypeDef> type = DefDescriptorImpl.getInstance("apex://String", TypeDef.class);
        DefDescriptor<TypeDef> type2 = DefDescriptorImpl.getInstance("apex://Integer", TypeDef.class);
        atts.put(DefDescriptorImpl.getInstance("testString", AttributeDef.class), new AttributeDefImpl(
                DefDescriptorImpl.getInstance("testString", AttributeDef.class), null, type, null, true,
                AttributeDef.SerializeToType.BOTH, null,null));
        atts.put(DefDescriptorImpl.getInstance("testInt", AttributeDef.class),
                new AttributeDefImpl(DefDescriptorImpl.getInstance("testInt", AttributeDef.class), null, type2, null,
                        true, AttributeDef.SerializeToType.BOTH, null,null));
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, atts, null, null);
        def.validateDefinition();
        assertEquals(EventType.COMPONENT, def.getEventType());
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = def.getDeclaredAttributeDefs();
        assertEquals(2, map.size());
        AttributeDef testString = map.get(DefDescriptorImpl.getInstance("testString", AttributeDef.class));
        assertNotNull(testString);
        AttributeDef testInt = map.get(DefDescriptorImpl.getInstance("testInt", AttributeDef.class));
        assertNotNull(testInt);
    }

    public void testGetEventType() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        assertEquals(EventType.COMPONENT, def.getEventType());
    }

    public void testGetExtendsDescriptor() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = DefDescriptorImpl.getInstance("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext);
        assertEquals(ext, def.getExtendsDescriptor());
    }

    public void testValidate() throws Exception {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDefWithNulls(null, null, null, null, null);
        try {
            def.validateDefinition();
            fail("validate should have caught nulls");
        } catch (InvalidDefinitionException expected) {

        }
        def = vendor.makeEventDefWithNulls(desc, null, null, null, null);
        try {
            def.validateDefinition();
            fail("validate should have caught null type");
        } catch (InvalidDefinitionException expected) {

        }
    }

    public void testValidateReferences() throws Exception {
        FakeRegistry fake = createFakeRegistry();
        EventDefImpl ed = vendor.makeEventDef();
        EventDefImpl extendsED = vendor.makeEventDef(vendor.getParentEventDefDescriptor(), null);
        fake.putDefinition(extendsED);
        ed.validateReferences();
    }

    public void testGetSuperDefs() throws Exception {
        DefDescriptor<EventDef> eventDefDescriptor = vendor.makeEventDefDescriptor("test:fakeEvent");
        DefDescriptor<EventDef> eventDefDescriptorParent = vendor.makeEventDefDescriptor("test:parentEvent");
        EventDef ed = vendor.makeEventDef(eventDefDescriptor, eventDefDescriptorParent).getSuperDef();
        assertEquals("parentEvent", ed.getDescriptor().getName());
    }

    public void testDependencies() throws Exception {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = DefDescriptorImpl.getInstance("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext);
        Set<DefDescriptor<?>> expected = new HashSet<DefDescriptor<?>>();
        expected.add(ext);
        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        def.appendDependencies(dependencies);
        assertEquals("dependencies are incorrect", expected, dependencies);
    }

    public void testSerialize() throws Exception {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        DefDescriptor<TypeDef> type = DefDescriptorImpl.getInstance("String", TypeDef.class);
        DefDescriptor<TypeDef> type2 = DefDescriptorImpl.getInstance("Integer", TypeDef.class);
        atts.put(DefDescriptorImpl.getInstance("testString", AttributeDef.class), new AttributeDefImpl(
                DefDescriptorImpl.getInstance("testString", AttributeDef.class), null, type, null, true,
                AttributeDef.SerializeToType.BOTH, null,null));
        atts.put(DefDescriptorImpl.getInstance("testInt", AttributeDef.class),
                new AttributeDefImpl(DefDescriptorImpl.getInstance("testInt", AttributeDef.class), null, type2, null,
                        true, AttributeDef.SerializeToType.BOTH, null,null));
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, atts, null, null);
        serializeAndGoldFile(def);
    }

    public void testGetAttributeDefs() throws Exception {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        DefDescriptor<TypeDef> type = DefDescriptorImpl.getInstance("apex://String", TypeDef.class);
        DefDescriptor<TypeDef> type2 = DefDescriptorImpl.getInstance("apex://Integer", TypeDef.class);
        AttributeDefImpl att1 = new AttributeDefImpl(DefDescriptorImpl.getInstance("testString", AttributeDef.class),
                null, type, null, true, AttributeDef.SerializeToType.BOTH, null,null);
        AttributeDefImpl att2 = new AttributeDefImpl(DefDescriptorImpl.getInstance("testInt", AttributeDef.class),
                null, type2, null, true, AttributeDef.SerializeToType.BOTH, null,null);
        atts.put(att1.getDescriptor(), att1);
        atts.put(att2.getDescriptor(), att2);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, atts, null, null);

        Map<DefDescriptor<AttributeDef>, AttributeDef> returnedAttributes = def.getAttributeDefs();
        Map<DefDescriptor<AttributeDef>, AttributeDef> expectedAttributes = new Hashtable<DefDescriptor<AttributeDef>, AttributeDef>();
        expectedAttributes.put(att1.getDescriptor(), att1);
        expectedAttributes.put(att2.getDescriptor(), att2);
        assertEquals(expectedAttributes, returnedAttributes);
    }

    public void testGetAttributeDefsWithParent() throws Exception {
        DefDescriptor<EventDef> edd = vendor.makeEventDefDescriptor("test:parentEvent");
        EventDefImpl ed = vendor.makeEventDef(null, edd);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = ed.getAttributeDefs();
        assertEquals(3, atts.size());
        assertTrue(atts.containsKey(vendor.getAttributeDescriptor()));
        assertTrue(atts.containsKey(DefDescriptorImpl.getInstance("att1", AttributeDef.class)));
        assertTrue(atts.containsKey(DefDescriptorImpl.getInstance("att2", AttributeDef.class)));
    }

    public void testEquals() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = DefDescriptorImpl.getInstance("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor
                .makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0), ext);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                ext);
        assertEquals(def, def2);
    }

    public void testEqualsWithDifferentTypes() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.APPLICATION, null, null, null);
        assertFalse("Equals should have been false due to different event types", def.equals(def2));
    }

    public void testEqualsWithDifferentDescriptors() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> desc2 = DefDescriptorImpl.getInstance("fake:extendevent", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        EventDefImpl def2 = vendor.makeEventDef(desc2, EventType.COMPONENT, null, null, null);
        assertFalse("Equals should have been false due to different descriptors", def.equals(def2));
    }

    public void testEqualsWithDifferentExtendsDescriptors() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = DefDescriptorImpl.getInstance("fake:extendevent", EventDef.class);
        DefDescriptor<EventDef> ext2 = DefDescriptorImpl.getInstance("fake:extendevent2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext2);
        assertFalse("Equals should have been false due to different extends descriptors", def.equals(def2));
    }

    public void testEqualsWithNullExtendsDescriptors() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null);
        assertEquals(def, def2);
    }

    public void testHashCode() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, null, new Location("filename1", 5,
                5, 0), null);
        EventDefImpl def2 = vendor.makeEventDefWithNulls(desc, EventType.COMPONENT, null, new Location("filename1", 5,
                5, 0), null);
        assertEquals(def.hashCode(), def2.hashCode());
    }

    public void testHashCodeWithDifferentDescriptors() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> desc2 = DefDescriptorImpl.getInstance("fake:event2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        EventDefImpl def2 = vendor.makeEventDef(desc2, EventType.COMPONENT, null, null, null);
        assertFalse("Hash code should have been different due to different descriptors",
                def.hashCode() == def2.hashCode());
    }

    public void testHashCodeWithDifferentEventTypes() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.APPLICATION, null, null, null);
        assertFalse("Hash code should have been different due to different event types",
                def.hashCode() == def2.hashCode());
    }

    public void testHashCodeWithDifferentAttributeDefs() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        attDefs.put(DefDescriptorImpl.getInstance(vendor.getAttributeName(), AttributeDef.class),
                vendor.makeAttributeDef());
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, attDefs, null, null);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, null);
        assertFalse("Hash code should have been different due to different attribute defs",
                def.hashCode() == def2.hashCode());
    }

    public void testHashCodeWithDifferentLocations() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 5, 5, 0),
                null);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, new Location("filename1", 6, 6, 0),
                null);
        assertFalse("Hash code should have been different due to different locations",
                def.hashCode() == def2.hashCode());
    }

    public void testHashCodeWithDifferentExtendsDescriptors() {
        DefDescriptor<EventDef> desc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        DefDescriptor<EventDef> ext = DefDescriptorImpl.getInstance("fake:extendevent1", EventDef.class);
        DefDescriptor<EventDef> ext2 = DefDescriptorImpl.getInstance("fake:extendevent2", EventDef.class);
        EventDefImpl def = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext);
        EventDefImpl def2 = vendor.makeEventDef(desc, EventType.COMPONENT, null, null, ext2);
        assertFalse("Hash code should have been different due to different extends descriptors",
                def.hashCode() == def2.hashCode());
    }

    public void testExtendsWrongEventType() {
        DefDescriptor<?> dd = addSourceAutoCleanup(EventDef.class,
                "<aura:event type=\"component\" extends=\"test:applicationEvent\"></aura:event>");

        try {
            dd.getDef();
            fail("Should not be able to create event with null type");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Event " + dd.getQualifiedName()
                    + " cannot extend markup://test:applicationEvent", dd.getQualifiedName());
        }
    }
}