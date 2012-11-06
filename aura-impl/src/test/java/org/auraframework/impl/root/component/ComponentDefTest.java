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
package org.auraframework.impl.root.component;

import java.util.*;

import org.auraframework.def.*;
import org.auraframework.impl.FakeRegistry;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;

import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class ComponentDefTest extends AuraImplTestCase {

    private final Map<DefDescriptor<AttributeDef>, AttributeDef> testAttributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();

    public ComponentDefTest(String name) {
        super(name);
    }

    public void testComponentDefAndValidate() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        attributeDefs.put(DefDescriptorImpl.getInstance(vendor.makeAttributeDefWithNulls("testFakeAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName",-1, vendor.makeLocation("filename", 10, 10, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getName(), AttributeDef.class), vendor.makeAttributeDefWithNulls("testFakeAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName",-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)));

        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, vendor.makeLocation("filename2", 10, 10, 0)));

        ComponentDef testComponentDef = null;

        // try to build invalid infinitely recursive component
        /*FIXMEDLP
*/
        attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        attributeDefs.put(DefDescriptorImpl.getInstance(vendor.makeAttributeDefWithNulls("testAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName","testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getName(), AttributeDef.class), vendor.makeAttributeDefWithNulls("testAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName","testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)));

        // try to build an otherwise valid component with null descriptor
        try {
            testComponentDef = vendor.makeComponentDefWithNulls(null, attributeDefs,null,  children, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,  null, null, false, false);
            testComponentDef.validateDefinition();
            fail("Should have thrown AuraException for null AuraDescriptor");
        } catch (AuraRuntimeException expected) {}

        // try to build valid testComponent
        testComponentDef = vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), attributeDefs,null,  children, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false);
        assertNotNull(testComponentDef);

        // try to build valid testFakeComponent
        attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        attributeDefs.put(DefDescriptorImpl.getInstance(vendor.makeAttributeDefWithNulls("testFakeAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName",-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getName(), AttributeDef.class), vendor.makeAttributeDefWithNulls("testFakeAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName",-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)));

        children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), null, vendor.makeLocation("filename1", 5, 5, 0)));
        testComponentDef = vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), attributeDefs, null,  children, vendor.makeLocation("filename2", 10, 10, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false);
        assertNotNull(testComponentDef);
    }

    public void testValidateDefinitionNonExtensibleAbstract() throws Exception {
        ComponentDef cd = vendor.makeComponentDef(null, null, null, null, null, null, null, null, null, null, true, false);
        try {
            cd.validateDefinition();
            fail("Should have thrown AuraException because an abstract component isn't extensible");
        }
        catch (InvalidDefinitionException e) {
        }
    }

    public void testValidateValidDefinition() throws Exception {
        ComponentDef cd = vendor.makeComponentDef();
        cd.validateDefinition();
    }

    /**
     * These tests don't work now that testValidateRefernces doesn't use a tempReg.  I don't know how to change them to work.
    public void testValidateReferences() {
        FakeRegistry fake = createFakeRegistry();
        ComponentDefImpl child = vendor.makeComponentDef(vendor.getChildComponentDefDescriptor(), vendor.getComponentDefDescriptor());
        ComponentDefImpl parent = vendor.makeComponentDef(vendor.getParentComponentDefDescriptor(), null, null, null, null, null, null, null, null, null, false, true);
        fake.putDefinition(child);
        fake.putDefinition(parent);
        fake.putDefinition(vendor.makeInterfaceDef());
        fake.putDefinition(vendor.makeEventDef());
        vendor.makeComponentDef().validateReferences();
    }
    */

    public void testValidateReferencesWithFakeParent() throws Exception {
        try {
            vendor.makeComponentDef(null, DefDescriptorImpl.getInstance("test:nonExistentComponentParent",
                                                                        ComponentDef.class)).validateReferences();
            fail("Should have thrown AuraException because the parent doesn't exist.");
        } catch (DefinitionNotFoundException e) {
            assertEquals("unexpected message: "+e.getMessage(),
                         "No COMPONENT named markup://test:nonExistentComponentParent found", e.getMessage());
        }
    }

    public void testValidateReferencesWithNonExtensibleParent() throws Exception {
        FakeRegistry fake = createFakeRegistry();
        ComponentDef parent = vendor.makeComponentDef(vendor.getParentComponentDefDescriptor(), null, null, null, null, null, null, null, null, null, false, false);
        fake.putDefinition(parent);
        try {
            vendor.makeComponentDef().validateReferences();
            fail("Should have thrown AuraException because the parent isn't extensible.");
        } catch (InvalidDefinitionException e) {
        }
    }

    /**
     * This doesn't work anymore because validateRefernces doesn't use a tempReg.  I don't know how to fix.

    public void testValidateReferencesWithFakeInterface() {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.getInterfaceDefDescriptor());
        ComponentDefImpl component = vendor.makeComponentDefWithNulls(vendor.getComponentDefDescriptor(), null, null, null, null, null, null, null, interfaces, null, false, false);
        try {
            component.validateReferences();
            fail("Should have thrown AuraException because the parent isn't extensible.");
        } catch (AuraRuntimeException e) {

        }
    }
    */

    public void testGetDescriptor() throws Exception {
        List<ComponentDefRef> testChildren = new ArrayList<ComponentDefRef>();

        testAttributeDefs.put(DefDescriptorImpl.getInstance("testAttributeDescriptorName", AttributeDef.class),
                              vendor.makeAttributeDefWithNulls("testAttributeDescriptorName",
                                                               null,
                                                               vendor.getTypeDefDescriptor(),
                                                               vendor.makeAttributeDefRef("testAttributeDescriptorName",
                                                                                          "testValue",
                                                                                          vendor.makeLocation("filename1", 5, 5, 0)),
                                                               false,
                                                               null, vendor.makeLocation("filename1", 5, 5, 0)));
        testChildren.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:component"),
                                                             null,
                                                             vendor.makeLocation("filename2", 10, 10, 0)));
        assertEquals(vendor.makeComponentDefDescriptor("aura:test"),
                     vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"),
                                                      testAttributeDefs, null, testChildren,
                                                      vendor.makeLocation("filename1", 5, 5, 0),
                                                      null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,
                                                      null, null, false, false).getDescriptor());
        assertEquals(vendor.makeComponentDefDescriptor("fake:component"),
                     vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"),
                                                      null, null, null,
                                                      vendor.makeLocation("filename2", 10, 10, 0),
                                                      null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,
                                                      null, null, false, false).getDescriptor());
        assertFalse(vendor.makeComponentDefDescriptor("aura:test")
                          .equals(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"),
                                                                   null, null, null,
                                                                   vendor.makeLocation("filename2", 10, 10, 0),
                                                                   null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,
                                                                   null, null, false, false).getDescriptor()));
        assertFalse(vendor.makeComponentDefDescriptor("fake:component")
                          .equals(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"),
                                                                   testAttributeDefs, null, testChildren,
                                                                   vendor.makeLocation("filename1", 5, 5, 0),
                                                                   null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,
                                                                   null, null,  false, false).getDescriptor()));
    }

  //FIXME - there are no longer children.
    /*
    }*/

    public void testAppendDependencies() throws Exception {
        // try a component with no dependencies
        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,  null, null, false, false).appendDependencies(dependencies);
        assertFalse(dependencies.isEmpty());
        assertTrue(dependencies.contains(ComponentDefImpl.PROTOTYPE_COMPONENT));

        List<ComponentDefRef> testChildren = new ArrayList<ComponentDefRef>();
        {
            testAttributeDefs.put(DefDescriptorImpl.getInstance("testAttributeDescriptorName", AttributeDef.class), vendor.makeAttributeDefWithNulls("testAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName","testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)));
            testChildren.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, vendor.makeLocation("filename2", 10, 10, 0)));
        }

        // try a component with only one dependency
        dependencies = new HashSet<DefDescriptor<?>>();
        vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null,  false, false).appendDependencies(dependencies);
        assertEquals(1, dependencies.size());
        /*FIXMEDLP
        */
        assertTrue(dependencies.contains(ComponentDefImpl.PROTOTYPE_COMPONENT));


        // add an extra dependency in the child component
        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:componentChild"), null, vendor.makeLocation("filename3", 15, 15, 0)));
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();
        attributes.put(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, AttributeDef.class), vendor.makeAttributeDefRef(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, children, null));

        testChildren = new ArrayList<ComponentDefRef>();
        testChildren.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), attributes, vendor.makeLocation("filename2", 10, 10, 0)));

        dependencies = new HashSet<DefDescriptor<?>>();
        vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null,  false, false).appendDependencies(dependencies);
        //FIXMEDLP assertEquals(3, dependencies.size());
        //FIXMEDLP assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("fake:component")));
        //FIXMEDLP assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("fake:componentChild")));

    }

    public void testAppendDependenciesWithAllReferences() throws Exception {
        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        vendor.makeComponentDef().appendDependencies(dependencies);
        //FIXMEDLP assertEquals(7,dependencies.size());
        //FIXMEDLP assertTrue(dependencies.contains(vendor.getChildComponentDefDescriptor()));
        //FIXMEDLP assertTrue(dependencies.contains(vendor.getParentComponentDefDescriptor()));
        //FIXMEDLP assertTrue(dependencies.contains(vendor.getParentComponentDefDescriptor()));
    }

    public void testGetLocation() throws Exception {
        List<ComponentDefRef> testChildren = new ArrayList<ComponentDefRef>();
        {
            testAttributeDefs.put(DefDescriptorImpl.getInstance("testAttributeDescriptorName", AttributeDef.class), vendor.makeAttributeDefWithNulls("testAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName","testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)));
            testChildren.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, vendor.makeLocation("filename2", 10, 10, 0)));
        }

        assertEquals(vendor.makeLocation("filename1", 5, 5, 0), vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null,  false, false).getLocation());
        assertEquals(vendor.makeLocation("filename2", 10, 10, 0), vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false).getLocation());
        assertFalse(vendor.makeLocation("filename1", 5, 5, 0).equals(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false).getLocation()));
        assertFalse(vendor.makeLocation("filename2", 10, 10, 0).equals(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null,  false, false).getLocation()));
    }

    public void testGetClientControllerDescriptor() throws Exception {
        assertEquals(vendor.getRendererDescriptor(),vendor.makeComponentDef().getRendererDescriptor());
    }

    public void testGetHandledDefs() throws Exception {
        ComponentDef cd = vendor.makeComponentDef(null, vendor.makeComponentDefDescriptor("test:parentComponent"));
        Collection<EventHandlerDef> handledEvents = cd.getHandlerDefs();
        assertEquals(0,handledEvents.size());
    }

    public void testGetAttributeDefs() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<ComponentDef> extendsDescriptor = vendor.makeComponentDefDescriptor("test:parentComponent");
        ComponentDef cd = vendor.makeComponentDef(null, null, null, null, null, null, null,extendsDescriptor, interfaces, null, false, false);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = cd.getAttributeDefs();
        assertEquals(4,attributes.size());
        assertTrue("mystring should be an attribute", attributes.containsKey(DefDescriptorImpl.getInstance("mystring", AttributeDef.class)));
        assertTrue("defaultAttribute should be an attribute", attributes.containsKey(vendor.getAttributeDescriptor()));
        assertTrue("parentAttribute should be an attribute", attributes.containsKey(DefDescriptorImpl.getInstance("parentAttribute", AttributeDef.class)));
    }

    public void testGetRegisteredEventDefs() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<ComponentDef> extendsDescriptor = vendor.makeComponentDefDescriptor("test:parentComponent");
        ComponentDef cd = vendor.makeComponentDef(null, null, null, null, null, null, null, extendsDescriptor, interfaces, null, false, false);
        Map<String, RegisterEventDef> registeredED = cd.getRegisterEventDefs();

        assertEquals(2,registeredED.size());
        assertNotNull(registeredED.get("parentEvent"));
    }

    public void testHashCode() {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = new HashMap<DefDescriptor<AttributeDef>,AttributeDef>();
        attributeDefs.put(DefDescriptorImpl.getInstance(vendor.getAttributeName(), AttributeDef.class), vendor.makeAttributeDef());

        Map<String, RegisterEventDef> eventDefs = new HashMap<String, RegisterEventDef>();
        eventDefs.put("fakey", vendor.makeRegisterEventDef());

        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRef());

        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.getInterfaceDefDescriptor());

        List<EventHandlerDef> eventHandlers = new ArrayList<EventHandlerDef>();
        eventHandlers.add(vendor.makeEventHandlerDef());

        //The attributeDefs are the same object for both ComponentDefs because there isn't a hash code for AttributeDefs and so the default hash code
        //will go by memory address causing a diff
        ComponentDef cd1 = vendor.makeComponentDef(null,attributeDefs,null,null,null,null,null,null,null,null,false,false);
        ComponentDef cd2 = vendor.makeComponentDef(vendor.getComponentDefDescriptor(),attributeDefs,eventDefs,children,vendor.getLocation(),
                vendor.getControllerDescriptor(), null, vendor.getParentComponentDefDescriptor(),interfaces,eventHandlers,false,false);
        assertEquals(cd1.hashCode(),cd2.hashCode());
    }

    public void testEquals() {
        assertTrue("The componentDefs should have been equal",vendor.makeComponentDef().equals(vendor.makeComponentDef()));
    }

    public void testEqualsWithDifferentObjects() {
        assertFalse("A ComponentDef shouldn't equal a ComponentDefRef",vendor.makeComponentDef().equals(vendor.makeComponentDefRef()));
    }

    public void testEqualsWithDifferentController() {
        DefDescriptor<ControllerDef> controllerDescriptor = DefDescriptorImpl.getInstance("java://foo.bar2", ControllerDef.class);
        ComponentDef cd1 = vendor.makeComponentDef(null, null, null, null, null, null,null,null);
        ComponentDef cd2 = vendor.makeComponentDef(null, null, null, null, null, controllerDescriptor,null,null);
        assertFalse("A ComponentDef shouldn't be equal with different controllers",cd1.equals(cd2));
    }

    public void testEqualsWithDifferentParents() {
        DefDescriptor<ComponentDef> parentAuraDescriptor = DefDescriptorImpl.getInstance("fake:componentParent2", ComponentDef.class);
        ComponentDef cd1 = vendor.makeComponentDef(null, null, null, null, null, null, null, null);
        ComponentDef cd2 = vendor.makeComponentDef(null, null, null, null, null, null, null, parentAuraDescriptor);
        assertFalse("A ComponentDef shouldn't be equal with different parents",cd1.equals(cd2));
    }

    public void testEqualsWithDifferentEvents() {
        DefDescriptor<EventDef> eventDefDescriptor = DefDescriptorImpl.getInstance("fake:event2", EventDef.class);
        Map<String, RegisterEventDef> eventDefs = new HashMap<String, RegisterEventDef>();
        eventDefs.put("fakey2", vendor.makeRegisterEventDef(eventDefDescriptor,false,null));

        ComponentDef cd1 = vendor.makeComponentDef(null, null, null, null, null, null, null, null);
        ComponentDef cd2 = vendor.makeComponentDef(null, null, eventDefs, null, null, null, null, null);
        assertFalse("A ComponentDef shouldn't be equal with different registered events",cd1.equals(cd2));
    }

    public void testEqualsWithNullValues() {
        ComponentDef cd1 = vendor.makeComponentDefWithNulls(vendor.getChildComponentDefDescriptor(), null, null, null, vendor.getLocation(), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false);
        ComponentDef cd2 = vendor.makeComponentDefWithNulls(vendor.getChildComponentDefDescriptor(), null, null, null, vendor.getLocation(), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null, false, false);
        assertTrue("The componentDefs should have been equal",cd1.equals(cd2));
    }

    public void testSerialize() throws Exception {
        List<ComponentDefRef> testChildren = new ArrayList<ComponentDefRef>();
        {
            testAttributeDefs.put(DefDescriptorImpl.getInstance("testAttributeDescriptorName", AttributeDef.class), vendor.makeAttributeDefWithNulls("testAttributeDescriptorName", null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef("testAttributeDescriptorName","testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)));
            testChildren.add(vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("test:text"), null, vendor.makeLocation("filename2", 10, 10, 0)));
        }
        serializeAndGoldFile(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("aura:test"), testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT, null, null,  false, false));
    }

    public void testSerialize2() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefWithNulls(vendor.makeComponentDefDescriptor("fake:component"), null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null, null, ComponentDefImpl.PROTOTYPE_COMPONENT,  null, null, false, false));
    }

}
