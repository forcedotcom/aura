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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.InterfaceXMLParser;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

public class InterfaceDefHandlerTest extends AuraImplTestCase {

    public InterfaceDefHandlerTest(String name) {
        super(name);
    }
    
    /**
     * sanity test. 
     * check we can pass support/description to aura:interface (support only works for privilege namespace)
     * also in the markup, we can have aura:attribute
     * @throws Exception
     */
    public void testInterfaceDefHandler() throws Exception {
        InterfaceXMLParser parser = new InterfaceXMLParser();
        String namespace = "auratest";
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance(namespace+":fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<>(
                descriptor,
                "<aura:interface support='PROTO' description='some description'><aura:attribute name='mystring' type='String'/><aura:registerevent name='click' type='aura:click' description='The Description'/></aura:interface>",
                "myID", Format.XML);
        InterfaceDef def = parser.parse(descriptor, source);
        assertEquals(1, def.getAttributeDefs().size());
        assertTrue(def.getAttributeDefs().containsKey(DefDescriptorImpl.getInstance("mystring", AttributeDef.class)));
        assertEquals(1, def.getRegisterEventDefs().size());
        assertNotNull(def.getRegisterEventDefs().get("click"));
    }
    
    /**
     * verify interface can extend from another interface
     * @throws Exception
     */
    public void testInterfaceDefHandlerWithExtension() throws Exception {
        InterfaceXMLParser parser = new InterfaceXMLParser();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<>(descriptor,
                "<aura:interface extends='aura:testinterfaceparent'></aura:interface>", "myID", Format.XML);
        InterfaceDef def = parser.parse(descriptor, source);
        assertEquals(1, def.getExtendsDescriptors().size());
        assertEquals("testinterfaceparent", def.getExtendsDescriptors().iterator().next().getName());
    }

    /**
     * verify invalid child tag error out
     * @throws Exception
     */
    public void testInterfaceDefHandlerWithInvalidChildTag() throws Exception {
        InterfaceXMLParser parser = new InterfaceXMLParser();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<>(descriptor,
                "<aura:interface><aura:foo/></aura:interface>", "myID", Format.XML);
        InterfaceDef id = parser.parse(descriptor, source);
        try {
            id.validateDefinition();
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:interface");
        } catch (InvalidDefinitionException e) {
        	checkExceptionContains(e, InvalidDefinitionException.class, 
                    "Found unexpected tag <aura:foo>");
        }
    }

    /**
     * verify we cannot have text in the markup of aura:interface
     * @throws Exception
     */
    public void testInterfaceDefHandlerWithTextBetweenTag() throws Exception {
        InterfaceXMLParser parser = new InterfaceXMLParser();
        DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<>(descriptor,
                "<aura:interface>Invalid text</aura:interface>", "myID", Format.XML);
        InterfaceDef id = parser.parse(descriptor, source);
        try {
            id.validateDefinition();
            fail("Should have thrown AuraException because text is between aura:interface tags");
        } catch (InvalidDefinitionException e) {
        	checkExceptionContains(e, InvalidDefinitionException.class, 
                    "No literal text allowed in interface definition");
        }
    }
    
    /**
     * verify support is not allowed with non-privileged namespace
     * @throws QuickFixException
     */
    public void testSupportNotAllowedWithNonPrivilegeNamespace() throws QuickFixException {
    	String namespace = "fakeNamespace";
    	DefDescriptor<InterfaceDef> descriptor = DefDescriptorImpl.getInstance(namespace+":fakeparser", InterfaceDef.class);
        StringSource<InterfaceDef> source = new StringSource<>(
                descriptor,
                "<aura:interface support='PROTO'></aura:interface>",
                "myID", Format.XML);
    	InterfaceXMLParser parser = new InterfaceXMLParser();
    	InterfaceDef def = parser.parse(descriptor, source);
    	try {
    		def.validateDefinition(); 
    		fail("we don't allow 'support' with non-privileged namespace");
    	} catch (InvalidDefinitionException e) {
            	checkExceptionContains(e, InvalidDefinitionException.class, 
                        "Invalid attribute \"support\"");
        }
    }
}
