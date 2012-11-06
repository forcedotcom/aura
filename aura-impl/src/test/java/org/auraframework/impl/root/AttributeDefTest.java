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
package org.auraframework.impl.root;

import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class AttributeDefTest extends AuraImplTestCase {

    private static final String testAttributeDescriptorName = "testAttribute";
    private static final String testFakeAttributeDescriptorName = "fakeAttribute";

    public AttributeDefTest(String name) {
        super(name);
    }

    public void testAttributeDefAndValidate() throws Exception {
        // validate() is called by the constructor
        AttributeDefImpl testAttributeDef = null;
        try {
            testAttributeDef = vendor.makeAttributeDefWithNulls(null, null, vendor.getTypeDef().getDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0));
            testAttributeDef.validateDefinition();
            fail("Should have thrown AuraException for null name in AttributeDef's AttributeDefDescriptor");
        } catch (AuraRuntimeException expected) {}

        testAttributeDef = vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDef().getDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0));
        assertNotNull(testAttributeDef);

        testAttributeDef = vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDef().getDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0));
        assertNotNull(testAttributeDef);
    }

    public void testGetDescriptor() {
        assertEquals(testAttributeDescriptorName, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getName());
        assertEquals(testFakeAttributeDescriptorName, vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getName());
    }

    public void testGetValueDef() throws Exception {
        assertEquals(vendor.getTypeDef(), vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getTypeDef());
        assertEquals(vendor.getTypeDef(), vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getTypeDef());

        assertTrue(vendor.getTypeDef().equals(vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getTypeDef()));
        assertTrue(vendor.getTypeDef().equals(vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getTypeDef()));
    }

    public void testGetDefaultValueDefRef() {
        assertEquals(vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getDefaultValue());
        assertEquals(vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getDefaultValue());

        assertFalse(vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)).equals(vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getDefaultValue()));
        assertFalse(vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getDefaultValue().equals(vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0))));
    }

    public void testGetLocation() {
        assertEquals(vendor.makeLocation("filename1", 5, 5, 0), vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getLocation());
        assertEquals(vendor.makeLocation("filename2", 10, 10, 0), vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getLocation());

        assertFalse(vendor.makeLocation("filename1", 5, 5, 0).equals(vendor.makeAttributeDefWithNulls(testFakeAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,-1, vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename2", 10, 10, 0)).getLocation()));
        assertFalse(vendor.makeLocation("filename2", 10, 10, 0).equals(vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName,"testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getLocation()));
    }

    public void testIsRequired() {
        assertFalse("The attribute isn't required",vendor.makeAttributeDef().isRequired());
        assertTrue("The attribute is required",vendor.makeAttributeDef(null,null,null,true,null, null).isRequired());
    }

    public void testGetName() {
        assertEquals(vendor.getAttributeName(),vendor.makeAttributeDef().toString());
    }

    public void testGetDescription()throws Exception{
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String.format(cmpMarkup, "<aura:attribute type='String' name='attr' description='Describe the attribute'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSource(markup, ComponentDef.class);
        assertEquals("Description of attribute not processed",
                "Describe the attribute",cmpDesc.getDef().getAttributeDef("attr").getDescription());
    }

    public void testSerializeTo() throws Exception {
        assertEquals(AttributeDef.SerializeToType.BOTH, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, null, vendor.makeLocation("filename1", 5, 5, 0)).getSerializeTo());
        assertEquals(AttributeDef.SerializeToType.BOTH, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, AttributeDef.SerializeToType.BOTH, vendor.makeLocation("filename1", 5, 5, 0)).getSerializeTo());
        assertEquals(AttributeDef.SerializeToType.SERVER, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, AttributeDef.SerializeToType.SERVER, vendor.makeLocation("filename1", 5, 5, 0)).getSerializeTo());
        assertEquals(AttributeDef.SerializeToType.NONE, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, AttributeDef.SerializeToType.NONE, vendor.makeLocation("filename1", 5, 5, 0)).getSerializeTo());
        assertEquals(AttributeDef.SerializeToType.INVALID, vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", vendor.makeLocation("filename1", 5, 5, 0)), false, AttributeDef.SerializeToType.INVALID, vendor.makeLocation("filename1", 5, 5, 0)).getSerializeTo());
    }

    public void testValidateDefinition() throws Exception {
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        try{
            vendor.makeAttributeDefWithNulls(testAttributeDescriptorName, null, vendor.getTypeDefDescriptor(), vendor.makeAttributeDefRef(testAttributeDescriptorName, "testValue", location), false, AttributeDef.SerializeToType.INVALID, location).validateDefinition();
            fail("Did not get InvalidDefinitionException for Serialize to type INVALID");
        }
        catch (InvalidDefinitionException e){
            assertEquals("Invalid serializeTo value", e.getMessage());
            assertEquals(location,e.getLocation());
        }
    }

}
