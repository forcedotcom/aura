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
package org.auraframework.impl.root.component.attributes;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ComponentDefRefArray;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

/**
 * Unit tests for attributes of type Aura.Component, Aura.Component[] and
 * Aura.ComponentDefRef[](@link aura.impl.type.ComponentDefRefArrayTypeDef) Unit
 * tests for attributes of type {@link Component}, {@link ComponentDefRef}, and
 * {@link ComponentDefRefArrayTypeDef}
 * 
 * @userStory a07B0000000MniV
 */
public class AuraComponentAttributeTypeTest extends AuraImplTestCase {
    public AuraComponentAttributeTypeTest(String name) {
        super(name);
    }

    /**
     * Postive test case.
     * 
     * @throws Exception
     */
    public void testUsageOfComponentDefRefArray() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "",
                "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>" + "<test:text/>"
                        + "<aura:text value='aura'/>" + "</aura:attribute>"));
        Component cmp = (Component) Aura.getInstanceService().getInstance(desc);
        assertNotNull("Failed to create component with Aura.ComponentDefRef[] type attribute.", cmp);
        Object value = cmp.getAttributes().getValue("attr");
        assertNotNull(value);
        assertTrue(value instanceof ComponentDefRefArray);
        ComponentDefRefArray cdra = (ComponentDefRefArray) value;
        List<ComponentDefRef> cmpDefRefs = cdra.getList();
        assertEquals("Unexpected items in componentDefRef array attribute", 2, cmpDefRefs.size());
        // assertTrue(cmpDefRefs.get(0) instanceof ComponentDefRef);
        // assertTrue(cmpDefRefs.get(1) instanceof ComponentDefRef);
        // Also verifies the order of components
        assertEquals("markup://test:text", cmpDefRefs.get(0).getDescriptor().getQualifiedName());
        assertEquals("markup://aura:text", cmpDefRefs.get(1).getDescriptor().getQualifiedName());
        ComponentDefRef ref = cmpDefRefs.get(1);
        // Verify that the inner component def ref has the right value
        assertEquals("ComponentDefRef does not have the expected attribute value", "aura", ref.newInstance(cmp).get(0)
                .getAttributes().getValue("value"));
    }

    /**
     * Verify that not initializing attribute of type Aura.ComponentDefRef[]
     * works fine.
     * 
     * @throws Exception
     */
    public void testEmptyBodyForComponentDefRefArray() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "",
                "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>" + "</aura:attribute>"));
        // Verify that it works fine
        Component cmp = (Component) Aura.getInstanceService().getInstance(desc);
        assertNotNull("Was not able to use an attribute of Aura.ComponentDefRef[] with an empty body.", cmp);
        Object value = cmp.getAttributes().getValue("attr");
        assertNull("ComponentDefRef array attribute should have had no value.", value);
    }

    /**
     * Verify that Aura.ComponentDefRef is not a valid attribute type.
     * 
     * @throws Exception
     */
    public void testComponentDefRefIsNotValidType() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "",
                "<aura:attribute type='Aura.ComponentDefRef' name='attr' default=''/>"));
        try {
            Aura.getInstanceService().getInstance(desc);
            fail("Aura.ComponentDefRef is not a valid attribute type.");
        } catch (DefinitionNotFoundException e) { /* expected */
        }
    }

    public void testAttributesInComponentDefRefArray() throws Exception {
        // 1. Expression using outer attributes
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "",
                "<aura:attribute type='String' name='outerAttr' default='emulp'/>"
                        + "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>"
                        + "<aura:text value=\"{!'aura'+ v.outerAttr}\"/>" + "</aura:attribute>"));
        Component cmp = (Component) Aura.getInstanceService().getInstance(desc);
        assertNotNull(cmp);
        Object value = cmp.getAttributes().getValue("attr");
        assertNotNull(value);
        assertTrue(value instanceof ComponentDefRefArray);
        ComponentDefRefArray cdra = (ComponentDefRefArray) value;
        List<ComponentDefRef> cmpDefRefs = cdra.getList();
        ComponentDefRef ref = cmpDefRefs.get(0);
        assertEquals("Failed to use attribute value of outer component in ComponentDefRef array items.", "auraemulp",
                ref.newInstance(cmp).get(0).getAttributes().getValue("value"));
    }

    /**
     * Verify that invalid markup in body of Attribute of type
     * Aura.ComponentDefRef[] is handled.
     * 
     * @throws Exception
     */
    public void testMarkupValidationInComponentDefRefArray() throws Exception {
        // Incomplete formula
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "",
                "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>" +
                // Unclosed formula field
                        "<aura:text value='{!aura/>" + "</aura:attribute>"));
        try {
            Aura.getInstanceService().getInstance(desc);
            fail("Should have failed creation because of incomplete formula.");
        } catch (AuraRuntimeException e) {
        }

        // Non existing Component
        // TODO: W-1300409 Not caught until serialization and the stack trace
        // does not have any information about
        // location
        // desc = addSourceAutoCleanup(String.format(baseComponentTag,"",
        // "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>" +
        // "<nonexistant:cmp/>"+
        // "</aura:attribute>"), ComponentDef.class);
        // try{
        // Aura.getInstanceService().getInstance(desc);
        // fail("Should have failed creation because of non existing component.");
        // }catch(AuraRuntimeException e){}

        // Missing required attribute
        // TODO: W-1300410
        // desc = addSourceAutoCleanup(String.format(baseComponentTag,"",
        // "<aura:attribute type='Aura.ComponentDefRef[]' name='attr'>" +
        // "<loadLevelTest:serverComponentWReqAttr/>"+
        // "</aura:attribute>"), ComponentDef.class);
        // try{
        // Aura.getInstanceService().getInstance(desc);
        // fail("Should have failed creation because of lack of value for required attribute.");
        // }catch(AuraRuntimeException e){}
    }
}
