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
package org.auraframework.integration.test.root.component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;

public class ComponentDefRefImplTest extends AuraImplTestCase {
    private ComponentDefRef testComponentDefRef;

    @Override
    public void setUp() throws Exception {
        super.setUp();

        List<ComponentDefRef> children = new ArrayList<>();
        children.add(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)));

        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<>();
        attributes.put(definitionService.getDefDescriptor(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, AttributeDef.class),
                vendor.makeAttributeDefRefWithNulls(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, children, null));

        testComponentDefRef = vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"), attributes,
                vendor.makeLocation("filename", 5, 5, 0));
    }

    @Test
    public void testComponentDefRef() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<>();

        ComponentDefRef testComponentDefRef = vendor.makeComponentDefRef(
                vendor.makeComponentDefDescriptor("aura:test"), attributes, vendor.makeLocation("filename", 5, 5, 0));
        assertNotNull(testComponentDefRef);
        testComponentDefRef = vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("fake:component"),
                attributes, vendor.makeLocation("fakefilename", 10, 10, 0));
        assertNotNull(testComponentDefRef);
    }

    @Test
    public void testAppendDependencies() throws Exception {
        Set<DefDescriptor<?>> dependencies;

        dependencies = testComponentDefRef.getDependencySet();
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("test:text")));

        dependencies = vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)).getDependencySet();
        assertEquals(1, dependencies.size());

        List<ComponentDefRef> children = new ArrayList<>();
        // children.add(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("aura:text"),
        // null, vendor.makeLocation("fakefilename2", 20, 20, 0)));
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<>();
        attributes.put(definitionService.getDefDescriptor(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, AttributeDef.class),
                vendor.makeAttributeDefRef(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, children, null));

        testComponentDefRef = vendor.makeComponentDefRefWithNulls(vendor.makeComponentDefDescriptor("test:text"), null,
                vendor.makeLocation("filename", 5, 5, 0));

        children.add(testComponentDefRef);
        testComponentDefRef = vendor.makeComponentDefRef(
                definitionService.getDefDescriptor("test:text", ComponentDef.class), attributes,
                vendor.makeLocation("filename", 5, 5, 0));
        dependencies = testComponentDefRef.getDependencySet();
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(definitionService.getDefDescriptor("test:text", ComponentDef.class)));
        // assertTrue(dependencies.contains(vendor.makeComponentDefDescriptor("aura:text")));
    }

    @Test
    public void testValidateDefinition() throws Exception {
        ComponentDefRef cdr = vendor.makeComponentDefRefWithNulls(null, null, null);
        try {
            cdr.validateDefinition();
            fail("Should have thrown InvalidDefinitionException because descriptor is null.");
        } catch (InvalidDefinitionException e) {

        }
    }

    @Test
    public void testEquals() {
        assertEquals(vendor.makeComponentDefRef(), vendor.makeComponentDefRef());
    }

    @Test
    public void testNullSetAttribute() {
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        ComponentDefRef built;

        builder.setDescriptor("aura:text");
        builder.setAttribute("truncate", new Integer(5));
        builder.setAttribute("value", "some text");
        builder.setAttribute("value", null);
        built = builder.build();
        assertEquals("{truncate=5}", built.getAttributeValues().toString());
    }

    @Test
    public void testEqualsWithDifferentDescriptor() {
        ComponentDefRef cdr1 = vendor.makeComponentDefRef();
        ComponentDefRef cdr2 = vendor.makeComponentDefRef(vendor.getParentComponentDefDescriptor(), null, null);
        assertFalse("Equals should have returned false because descriptors are different", cdr1.equals(cdr2));
    }

    @Test
    public void testRequiredAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");

        Map<String, Object> atts = ImmutableMap.of("req", (Object) "hi");

        assertNotNull(instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class, atts));
        assertNotNull(instanceService.getInstance(cmpDesc, atts));
        assertNotNull(instanceService.getInstance(definitionService.getDefinition(cmpDesc), atts));
    }

    @Test
    public void testRequiredAttribute_ComponentDef() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");

        try {
            instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
    }

    @Test
    public void testRequiredAttribute_COMPONENT() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");

        try {
            instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
    }


    @Test
    public void testRequiredAttribute_CmpDesc() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");
        try {
            instanceService.getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
    }

    @Test
    public void testRequiredAttribute_CmpDesc_getDef() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");
        try {
            instanceService.getInstance(definitionService.getDefinition(cmpDesc));
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", cmpDesc.getQualifiedName());
        }
    }

    @Test
    public void testRequiredInheritedAttribute() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><aura:attribute name='req' type='String' required='true'/></aura:component>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s'/>", parent.getDescriptorName()));

        Map<String, Object> atts = ImmutableMap.of("req", (Object) "hi");

        instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class, atts);
        instanceService.getInstance(cmpDesc, atts);
        instanceService.getInstance(definitionService.getDefinition(cmpDesc), atts);
        try {
            instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
        try {
            instanceService.getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
        try {
            instanceService.getInstance(definitionService.getDefinition(cmpDesc));
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", parent.getQualifiedName());
        }
    }

    @Test
    public void testRequiredInnerAttribute() throws Exception {
        DefDescriptor<ComponentDef> inner = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component><%s/></aura:component>", inner.getDescriptorName()));
        try {
            instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            instanceService.getInstance(cmpDesc.getDescriptorName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            instanceService.getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
        try {
            instanceService.getInstance(definitionService.getDefinition(cmpDesc));
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class, "COMPONENT " + cmpDesc.getQualifiedName()
                    + " is missing required attribute 'req'", inner.getQualifiedName());
        }
    }

    @Test
    public void testEqualsWithDifferentLocations() {
        ComponentDefRef cdr1 = vendor.makeComponentDefRef();
        ComponentDefRef cdr2 = vendor.makeComponentDefRef(null, null, vendor.makeLocation("fakefile", 0, 0, 0));
        assertFalse("Equals should have returned false because locations are different", cdr1.equals(cdr2));
    }

    @Test
    public void testEqualsWithDifferentObjects() {
        assertFalse("Equals should have been false due to different object types",
                vendor.makeComponentDefRef().equals(vendor.makeEventDef()));
    }

    @Test
    public void testSerialize() throws Exception {
        serializeAndGoldFile(testComponentDefRef);
    }

    @Test
    public void testSerialize2() throws Exception {
        serializeAndGoldFile(vendor.makeComponentDefRef(vendor.makeComponentDefDescriptor("test:text"),
                new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>(),
                vendor.makeLocation("fakefilename", 10, 10, 0)));
    }

//    public void testValidatesFlavorName() throws Exception {
//        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component><div aura:flavorable='true'></div></aura:component>");
//        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(cmp);
//        flavor = addSourceAutoCleanup(flavor, "@flavor test; .test{}");
//
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setDescriptor(cmp);
//        builder.setLocation(vendor.getLocation());
//        builder.setFlavor(new FlavorRefImpl(flavor, "wallmaria"));
//
//        try {
//            builder.build().validateReferences();
//            fail("expected to get an exception");
//        } catch (Exception e) {
//            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
//        }
//    }
//
//    public void testValidatesComponentIsFlavorable() throws Exception {
//        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
//        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(cmp);
//        flavor = addSourceAutoCleanup(flavor, "@flavor test; .test{}");
//
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setDescriptor(cmp);
//        builder.setLocation(vendor.getLocation());
//        builder.setFlavor(new FlavorRefImpl(flavor, "test"));
//
//        try {
//            builder.build().validateReferences();
//            fail("expected to get an exception");
//        } catch (Exception e) {
//            checkExceptionContains(e, InvalidDefinitionException.class, "does not have any flavorable");
//        }
//    }
//
//    public void testValidatesComponentToFlavorIsNotIntf() throws Exception {
//        DefDescriptor<InterfaceDef> intf = addSourceAutoCleanup(InterfaceDef.class, "<aura:interface></aura:interface>");
//        String fmt = String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, intf.getNamespace(),
//                intf.getName());
//        DefDescriptor<FlavoredStyleDef> flavor =  DefDescriptorImpl.getInstance(fmt, FlavoredStyleDef.class);
//        flavor = addSourceAutoCleanup(flavor, "@flavor test; .test{}");
//
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setIntfDescriptor(intf);
//        builder.setLocation(vendor.getLocation());
//        builder.setFlavor(new FlavorRefImpl(flavor, "test"));
//
//        try {
//            builder.build().validateReferences();
//            fail("expected to get an exception");
//        } catch (Exception e) {
//            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be specified on an interface");
//        }
//    }
//
//    public void testAppendsFlavoredStyleDefToDependencies() throws Exception {
//        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component><div aura:flavorable='true'></div></aura:component>");
//        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(cmp);
//        flavor = addSourceAutoCleanup(flavor, "@flavor test; .test{}");
//
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setDescriptor(cmp);
//        builder.setLocation(vendor.getLocation());
//        builder.setFlavor(new FlavorRefImpl(flavor, "test"));
//
//        Set<DefDescriptor<?>> dependencies = new HashSet<>();
//        builder.build().appendDependencies(dependencies);
//        assertTrue("expected flavor def to be in dependencies", dependencies.contains(flavor));
//    }

//    public void testSerializeIsFlavorable() throws Exception {
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setDescriptor(vendor.getChildComponentDefDescriptor());
//        builder.setLocation(vendor.getLocation());
//        builder.setIsFlavorable(true); // what we care about
//        serializeAndGoldFile(builder.build());
//    }
//
//    public void testSerializeSpecifiesFlavor() throws Exception {
//        DefDescriptor<ComponentDef> cmp = vendor.getFlavorableComponentDescriptor();
//        DefDescriptor<FlavoredStyleDef> flavor = vendor.getFlavoredStyleDescriptor();
//
//        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
//        builder.setDescriptor(cmp);
//        builder.setLocation(vendor.getLocation());
//        builder.setFlavor(new FlavorRefImpl(flavor, "test")); // what we care about
//        serializeAndGoldFile(builder.build());
//    }
}
