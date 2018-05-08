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

import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Ignore;
import org.junit.Test;

/**
*/
public class RegisterEventDefTest extends AuraImplTestCase {
    @Test
    public void testGetEventDescriptor() {
        assertEquals(
                vendor.makeEventDefDescriptor("aura:testevent"),
                vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getReference());
    }

    @Test
    public void testIsGlobal() {
        assertTrue(vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("aura:testevent"), true,
                vendor.makeLocation("filename1", 5, 5, 0)).isGlobal());
        assertFalse(vendor.makeRegisterEventDefWithNulls(vendor.makeComponentDefDescriptor("a:b"),
                vendor.makeEventDefDescriptor("aura:testevent"), false,
                vendor.makeLocation("filename1", 5, 5, 0)).isGlobal());
    }

    @Test
    public void testGetLocation() {
        assertEquals(
                vendor.makeLocation("filename1", 5, 5, 0),
                vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getLocation());
    }

    @Test
    public void testSerialize() throws Exception {
        serializeAndGoldFile(vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("auratest:testEvent"), true,
                vendor.makeLocation("filename1", 5, 5, 0)));
    }

    @Test
    public void testValidateDefinition() throws Exception {
        Throwable thrown = null;
        try {
            RegisterEventDefImpl def = vendor.makeRegisterEventDefWithNulls(null, null, true, null);
            def.validateDefinition();
        } catch (AssertionError assertion) {
            // this can occur is assertions are enabled.
            thrown = assertion;
        } catch (InvalidDefinitionException expected) {
            thrown = expected;
        }
        assertNotNull("Should have thrown InvalidDefinitionException for null EventDefDescriptor", thrown);
    }

    @Test
    @Ignore("FIXME: goliver - need to figure out how to test")
    public void testValidateReferences() throws Exception {
        //FakeRegistry fake = createFakeRegistry();
        //fake.putDefinition(vendor.makeEventDef());
        //RegisterEventDefImpl red = vendor.makeRegisterEventDef();
        //red.validateReferences();
    }

    @Test
    public void testAppendDependencies() {
        Set<DefDescriptor<?>> descriptors = 
            vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("aura:testevent"), true,
                    vendor.makeLocation("filename1", 5, 5, 0)).getDependencySet();
        assertTrue(descriptors.contains(vendor.makeEventDefDescriptor("aura:testevent")));
    }

    @Test
    public void testGetName() {
        assertEquals(
                "fakey",
                vendor.makeRegisterEventDef(null, vendor.makeEventDefDescriptor("aura:testevent"), true,
                        vendor.makeLocation("filename1", 5, 5, 0)).getName());
    }

    @Test
    public void testEqualsWithDifferentObjects() {
        assertFalse("Equals should have been false due to different object types", vendor.makeRegisterEventDef()
                .equals(vendor.makeEventDef()));
    }

    @Test
    public void testGetDescription() throws Exception {
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String.format(cmpMarkup,
                "<aura:registerevent name='eventName' type='aura:componentEvent' description='Describe the event'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        assertEquals("Description of registerevent not processed", "Describe the event",
                definitionService.getDefinition(cmpDesc).getRegisterEventDefs().get("eventName").getDescription());
    }

    @Test
    public void testValueEventException() throws Exception {
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String.format(cmpMarkup,
                "<aura:registerevent name='eventName' type='aura:valueEvent'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        try {
        	definitionService.getDefinition(cmpDesc);
            fail("Should have thrown exception when registering for an event of type Value");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Cannot fire event of type: markup://aura:valueEvent", cmpDesc.getQualifiedName());
        }
    }
}
