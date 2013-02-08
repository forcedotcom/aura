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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;

import com.google.common.collect.ImmutableMap;

public class ComponentDefRefImplTest extends AuraImplTestCase {
    private ComponentDefRef testComponentDefRef;

    public ComponentDefRefImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();

        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)));

        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();
        attributes.put(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, AttributeDef.class),
                vendor.makeAttributeDefRefWithNulls(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, children, null));

        testComponentDefRef = vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"), attributes,
                vendor.makeLocation("filename", 5, 5, 0));
    }

    public void testComponentDefRef() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();

        ComponentDefRef testComponentDefRef = vendor.makeComponentDefRef(
                vendor.makeComponentDefDescriptor("aura:test"), attributes, vendor.makeLocation("filename", 5, 5, 0));
        assertNotNull(testComponentDefRef);
        testComponentDefRef = vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component"),
                attributes, vendor.makeLocation("fakefilename", 10, 10, 0));
        assertNotNull(testComponentDefRef);
    }

    public void testGetDescriptor() throws Exception {
        assertEquals(vendor.makeComponentDefDescriptor("test:text"), testComponentDefRef.getDescriptor());
        assertEquals(
                vendor.makeComponentDefDescriptor("fake:component"),
                vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component"),
                        new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                        vendor.makeLocation("fakefilename", 10, 10, 0)).getDescriptor());
        assertFalse(vendor.makeComponentDefDescriptor("aura:test").equals(
                vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component2"),
                        new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                        vendor.makeLocation("fakefilename", 10, 10, 0)).getDescriptor()));
        assertFalse(vendor.makeComponentDefDescriptor("fake:component").equals(testComponentDefRef.getDescriptor()));
    }

    public void testGetLocation() throws Exception {
        assertEquals(vendor.makeLocation("filename", 5, 5, 0), testComponentDefRef.getLocation());
        assertEquals(
                vendor.makeLocation("fakefilename", 10, 10, 0),
                vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component2"),
                        new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                        vendor.makeLocation("fakefilename", 10, 10, 0)).getLocation());
        assertFalse(vendor.makeLocation("filename", 5, 5, 0).equals(
                vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component2"),
                        new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                        vendor.makeLocation("fakefilename", 10, 10, 0)).getLocation()));
        assertFalse(vendor.makeLocation("fakefilename", 10, 10, 0).equals(testComponentDefRef.getLocation()));
    }

    public void testAppendDependencies() throws Exception {
        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        testComponentDefRef.appendDependencies(dependencies);
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("test:text")));

        dependencies = new HashSet<DefDescriptor<?>>();
        vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)).appendDependencies(dependencies);
        assertEquals(1, dependencies.size());

        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        // children.add(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("aura:text"),
        // null, vendor.makeLocation("fakefilename2", 20, 20, 0)));
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();
        attributes.put(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, AttributeDef.class),
                vendor.makeAttributeDefRef(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, children, null));

        testComponentDefRef = vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("test:text"), null,
                vendor.makeLocation("filename", 5, 5, 0));

        children.add(testComponentDefRef);
        testComponentDefRef = vendor.makeComponentDefRef(
                DefDescriptorImpl.getInstance("test:text", ComponentDef.class), attributes,
                vendor.makeLocation("filename", 5, 5, 0));
        dependencies = new HashSet<DefDescriptor<?>>();
        testComponentDefRef.appendDependencies(dependencies);
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(DefDescriptorImpl.getInstance("test:text", ComponentDef.class)));
        // assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("aura:text")));
    }

    public void testValidateDefinition() throws Exception {
        ComponentDefRef cdr = vendor.makeComponentDefRefWithNulls(null, null, null);
        try {
            cdr.validateDefinition();
            fail("Should have thrown AuraException because descriptor is null.");
        } catch (AuraRuntimeException e) {

        }
    }

    public void testEquals() {
        assertEquals(vendor.makeComponentDefRef(), vendor.makeComponentDefRef());
    }

    public void testEqualsWithDifferentDescriptor() {
        ComponentDefRef cdr1 = vendor.makeComponentDefRef();
        ComponentDefRef cdr2 = vendor.makeComponentDefRef(vendor.getParentComponentDefDescriptor(), null, null);
        assertFalse("Equals should have returned false because descriptors are different", cdr1.equals(cdr2));
    }

    public void testRequiredAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");

        Map<String, Object> atts = ImmutableMap.of("req", (Object) "hi");

        assertNotNull(Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), ComponentDef.class, atts));
        assertNotNull(Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), atts, DefType.COMPONENT));
        assertNotNull(Aura.getInstanceService().getInstance(cmpDesc, atts));
        assertNotNull(Aura.getInstanceService().getInstance(cmpDesc.getDef(), atts));
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
    }

    public void testRequiredInheritedAttribute() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><aura:attribute name='req' type='String' required='true'/></aura:component>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s'/>", parent.getDescriptorName()));

        Map<String, Object> atts = ImmutableMap.of("req", (Object) "hi");

        Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), ComponentDef.class, atts);
        Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), atts, DefType.COMPONENT);
        Aura.getInstanceService().getInstance(cmpDesc, atts);
        Aura.getInstanceService().getInstance(cmpDesc.getDef(), atts);
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
    }

    public void testRequiredInnerAttribute() throws Exception {
        DefDescriptor<ComponentDef> inner = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component><%s/></aura:component>", inner.getDescriptorName()));
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDescriptorName(), DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
    }

    public void testEqualsWithDifferentLocations() {
        ComponentDefRef cdr1 = vendor.makeComponentDefRef();
        ComponentDefRef cdr2 = vendor.makeComponentDefRef(null, null, vendor.makeLocation("fakefile", 0, 0, 0));
        assertFalse("Equals should have returned false because locations are different", cdr1.equals(cdr2));
    }

    public void testEqualsWithDifferentObjects() {
        assertFalse("Equals should have been false due to different object types",
                vendor.makeComponentDefRef().equals(vendor.makeEventDef()));
    }

    public void testSerialize() throws Exception {
        serializeAndGoldFile(testComponentDefRef);
    }

    public void testSerialize2() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)));
    }
}
