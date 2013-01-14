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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class RegisterEventHandlerTest extends AuraImplTestCase {

    public RegisterEventHandlerTest(String name) {
        super(name);
    }

    public void testRegisterEventHandler() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(
                descriptor,
                "<aura:component><aura:registerevent name='click' type='aura:click' description='The Description' access='global'/></aura:component>",
                "myID", Format.XML);
        ComponentDef def2 = parser.parse(descriptor, source);
        RegisterEventDef red = def2.getRegisterEventDefs().get("click");
        assertNotNull(red);
        assertEquals("click", red.getName());
        assertTrue(red.isGlobal());
    }

    public void testRegisterEventHandlerPublicAccess() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(
                descriptor,
                "<aura:component><aura:registerevent name='aura:click' description='The Description' access='fakeAccessLevel'/></aura:component>",
                "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown AuraException because access level isn't public or global");
        } catch (AuraRuntimeException e) {

        }
    }

    public void testRegisterEventHandlerWithTextBetweenTags() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(
                descriptor,
                "<aura:component><aura:registerevent name='aura:click' description='The Description' access='global'>invalidtext</aura:registerevent></aura:component>",
                "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown AuraException because text is between aura:registerevent tags");
        } catch (AuraRuntimeException e) {

        }
    }

}
