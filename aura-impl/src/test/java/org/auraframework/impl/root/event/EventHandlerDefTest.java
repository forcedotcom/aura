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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;

/**
 * @hierarchy Aura.Unit Tests.Components.EventHandlerDef.Validation
 */
public class EventHandlerDefTest extends AuraImplTestCase {
    public EventHandlerDefTest(String name) {
        super(name);
    }

    public void testSerialize() throws Exception{
        EventHandlerDefImpl eventHandlerDef2 = vendor.makeEventHandlerDefWithNulls(
                vendor.makeEventDefDescriptor("auratest:testevent"), new PropertyReferenceImpl("c.foo", null),
                vendor.makeLocation("filename", 5, 5, 0));
        serializeAndGoldFile(eventHandlerDef2);
    }

    public void testHandlerWithNameAndEventAttribute() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithNameAndEvent", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals("Incorrect exception message",
                    "aura:handler must specify one and only one of name=\"…\" or event=\"…\"", e.getMessage());
        }
    }

    public void testHandlerWithoutNameOrEventAttribute() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithoutNameOrEvent", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals("Incorrect exception message",
                    "aura:handler must specify one and only one of name=\"…\" or event=\"…\"", e.getMessage());
        }
    }

    /**
     * A aura:handler for a component event with event attribute specified is invalid. Should be name attribute that is
     * specified.
     */
    public void testHandlerWithEventAttributeForComponentEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithEventForComponentEvent", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidReferenceException");
        } catch (InvalidReferenceException e) {
            assertEquals(
                    "Incorrect exception message",
                    "A aura:handler that specifies an event=\"\" attribute must handle an application event. Either change the aura:event to have type=\"APPLICATION\" or alternately change the aura:handler to specify a name=\"\" attribute.",
                    e.getMessage());
        }
    }

    /**
     * A aura:handler for an application event with name attribute specified is invalid. Should be event attribute that
     * is specified.
     */
    public void testHandlerWithNameAttributeForApplicationEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithNameForApplicationEvent", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidReferenceException");
        } catch (InvalidReferenceException e) {
            assertEquals(
                    "Incorrect exception message",
                    "A aura:handler that specifies a name=\"\" attribute must handle a component event. Either change the aura:event to have type=\"COMPONENT\" or alternately change the aura:handler to specify an event=\"\" attribute.",
                    e.getMessage());
        }
    }

    public void testHandlerWithInvalidNameAttributeForComponentEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithUnregisteredName", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidReferenceException");
        } catch (InvalidReferenceException e) {
            assertEquals("Incorrect exception message",
                         "aura:handler has invalid name attribute value: ThisIsNotARegisteredEventName", e.getMessage());
        }
    }

    public void testHandlerWithInvalidEventAttributeForApplicationEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = DefDescriptorImpl.getInstance(
                "handleEventTest:handlerWithInvalidEvent", ComponentDef.class);
        try {
            componentDefDescriptor.getDef();
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            assertEquals("Incorrect exception message",
                         String.format("No EVENT named markup://ThisIsNotAValidEventName found : %s",
                                       componentDefDescriptor.getQualifiedName()), 
                         e.getMessage());
        }
    }

    public void testHandlerWithEmptyNameAttributeForComponentEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component><aura:handler name='' action='{!c.handleIt}'/></aura:component>");
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidReferenceException");
        } catch (InvalidReferenceException e) {
            assertEquals("Incorrect exception message", "aura:handler has invalid name attribute value: ",
                    e.getMessage());
        }
    }

    public void testHandlerWithEmptyEventAttributeForApplicationEvent() throws Exception {
        DefDescriptor<ComponentDef> componentDefDescriptor = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component><aura:handler event='' action='{!c.handleIt}'/></aura:component>");
        try {
            componentDefDescriptor.getDef();
            fail("Expected InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals("Incorrect exception message",
                    "aura:handler must specify one and only one of name=\"…\" or event=\"…\"", e.getMessage());
        }
    }

    public void testGetDescription()throws Exception{
        String cmpMarkup = "<aura:component >%s</aura:component>";
        String markup = String
                .format(cmpMarkup,
                        "<aura:handler event='aura:applicationEvent' description='Describe the event handler' action='{!c.dummy}'/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        assertEquals("Description of registerevent not processed", "Describe the event handler", cmpDesc.getDef()
                .getHandlerDefs().iterator().next().getDescription());
    }
}
