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
package org.auraframework.impl.root.event;

import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.FakeRegistry;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
*/
public class RegisterEventDefTest extends AuraImplTestCase {
    public RegisterEventDefTest(String name) {
        super(name);
    }

    public void testGetEventDescriptor() {
        assertEquals(
                vendor.makeEventDefDescriptor("aura:testevent"),
                vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getDescriptor());
    }

    public void testIsGlobal() {
        assertTrue(vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"), true,
                vendor.makeLocation("filename1", 5, 5, 0)).isGlobal());
        assertFalse(vendor.makeRegisterEventDefWithNulls(vendor.makeEventDefDescriptor("aura:testevent"), false,
                vendor.makeLocation("filename1", 5, 5, 0)).isGlobal());
    }

    public void testGetLocation() {
        assertEquals(
                vendor.makeLocation("filename1", 5, 5, 0),
                vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getLocation());
    }

    public void testSerialize() throws Exception {
        serializeAndGoldFile(vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("auratest:testEvent"), true,
                vendor.makeLocation("filename1", 5, 5, 0)));
    }

    public void testValidate() throws Exception {
        RegisterEventDefImpl def = vendor.makeRegisterEventDefWithNulls(null, true, null);
        try {
            def.validateDefinition();
            fail("Should have thrown AuraException for null EventDefDescriptor");
        } catch (AuraRuntimeException expected) {
            // expected
        }
    }

    public void testValidateReferences() throws Exception {
        FakeRegistry fake = createFakeRegistry();
        fake.putDefinition(vendor.makeEventDef());
        RegisterEventDefImpl red = vendor.makeRegisterEventDef();
        red.validateReferences();
    }

    public void testAppendDependencies() {
        Set<DefDescriptor<?>> descriptors = new HashSet<DefDescriptor<?>>();
        vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"), true,
                vendor.makeLocation("filename1", 5, 5, 0)).appendDependencies(descriptors);
        assertTrue(descriptors.contains(vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"),
                true, vendor.makeLocation("filename1", 5, 5, 0)).getDescriptor()));
    }

    public void testGetName() {
        assertEquals(
                "testevent",
                vendor.makeRegisterEventDef(vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getName());
    }

    public void testEqualsWithDifferentObjects() {
        assertFalse("Equals should have been false due to different object types", vendor.makeRegisterEventDef()
                .equals(vendor.makeEventDef()));
    }

    public void testGetDescription() throws Exception {
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String.format(cmpMarkup,
                "<aura:registerevent name='eventName' type='aura:componentEvent' description='Describe the event'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        assertEquals("Description of registerevent not processed", "Describe the event", cmpDesc.getDef()
                .getRegisterEventDefs().get("eventName").getDescription());
    }

    public void testValueEventException() throws Exception {
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String.format(cmpMarkup,
                "<aura:registerevent name='eventName' type='aura:valueEvent'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        try {
            cmpDesc.getDef();
            fail("Should have thrown exception when registering for an event of type Value");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Cannot fire event of type: markup://aura:valueEvent", cmpDesc.getQualifiedName());
        }
    }
}
