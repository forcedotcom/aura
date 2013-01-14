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

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class InterfaceDefHandlerTest extends AuraImplTestCase {

    public InterfaceDefHandlerTest(String name) {
        super(name);
    }

    public void testInterfaceDefHandler() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<InterfaceDef>(
                descriptor,
                "<aura:interface><aura:attribute name='mystring' type='String'/><aura:registerevent name='click' type='aura:click' description='The Description'/></aura:interface>",
                "myID", Format.XML);
        InterfaceDef def = parser.parse(descriptor, source);
        assertEquals(1, def.getAttributeDefs().size());
        assertTrue(def.getAttributeDefs().containsKey(DefDescriptorImpl.getInstance("mystring", AttributeDef.class)));
        assertEquals(1, def.getRegisterEventDefs().size());
        assertNotNull(def.getRegisterEventDefs().get("click"));
    }

    public void testInterfaceDefHandlerWithExtension() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<InterfaceDef>(descriptor,
                "<aura:interface extends='aura:testinterfaceparent'></aura:interface>", "myID", Format.XML);
        InterfaceDef def = parser.parse(descriptor, source);
        assertEquals(1, def.getExtendsDescriptors().size());
        assertEquals("testinterfaceparent", def.getExtendsDescriptors().iterator().next().getName());
    }

    public void testInterfaceDefHandlerWithInvalidChildTag() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<InterfaceDef>(descriptor,
                "<aura:interface><aura:foo/></aura:interface>", "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:interface");
        } catch (AuraRuntimeException e) {

        }
    }

    public void testInterfaceDefHandlerWithTextBetweenTag() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<InterfaceDef>(descriptor,
                "<aura:interface>Invalid text</aura:interface>", "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown AuraException because text is between aura:interface tags");
        } catch (AuraRuntimeException e) {

        }
    }
}
