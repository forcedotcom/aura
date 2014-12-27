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
package org.auraframework.test.root.parser.handler;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;

import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class RegisterEventHandlerTest extends AuraImplTestCase {

    public RegisterEventHandlerTest(String name) {
        super(name);
    }

    public void testSanity() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,
                "<aura:component><aura:registerevent name='click' type='aura:click' description='The Description' access='global'/></aura:component>",
                "myID", Format.XML);
        ComponentDef def2 = parser.parse(descriptor, source);
        RegisterEventDef red = def2.getRegisterEventDefs().get("click");
        assertNotNull(red);
        assertEquals("click", red.getName());
        assertTrue(red.isGlobal());
    }

    public void testInvalidAccess() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,
                "<aura:component><aura:registerevent name='aura:click' description='The Description' access='fakeAccessLevel'/></aura:component>",
                "myID", Format.XML);
        ComponentDef cd = parser.parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Should have thrown AuraException because access level isn't public or global");
        } catch (InvalidDefinitionException e) {

        }
    }

    public void testTextContent() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,
                "<aura:component><aura:registerevent name='aura:click' description='The Description' access='global'>invalidtext</aura:registerevent></aura:component>",
                "myID", Format.XML);
        ComponentDef cd = parser.parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Should have thrown AuraException because text is between aura:registerevent tags");
        } catch (InvalidDefinitionException e) {

        }
    }

    public void testMissingType() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,"<aura:component><aura:registerevent name='wheresthetype'/></aura:component>",
                "myID", Format.XML);
    	ComponentDef def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Missing type for event should be flagged");
        } catch (Exception e) {
        	assertExceptionMessageEndsWith(e, InvalidDefinitionException.class, "type attribute is required on registerevent");
        }
    }

    public void testMissingNameForComponentEvent() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class, "<aura:event type='COMPONENT'/>");
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,
                String.format("<aura:component><aura:registerevent type='%s'/></aura:component>",eventDesc.getDescriptorName()),
                "myID", Format.XML);
    	ComponentDef def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Missing name for component event should be flagged");
        } catch (Exception e) {
        	assertExceptionMessageEndsWith(e, InvalidDefinitionException.class, "name is a required attribute on tag registerevent");
        }
    }

    public void testMissingNameForApplicationEvent() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class, "<aura:event type='APPLICATION'/>");
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                descriptor,
                String.format("<aura:component><aura:registerevent type='%s'/></aura:component>",eventDesc.getDescriptorName()),
                "myID", Format.XML);
    	ComponentDef def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Missing name for application event should be flagged");
        } catch (Exception e) {
        	assertExceptionMessageEndsWith(e, InvalidDefinitionException.class, "name is a required attribute on tag registerevent");
        }
    }
}
