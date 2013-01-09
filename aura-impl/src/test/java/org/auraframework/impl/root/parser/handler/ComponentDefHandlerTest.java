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

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class ComponentDefHandlerTest extends AuraImplTestCase {
    XMLStreamReader xmlReader;
    XMLInputFactory xmlInputFactory;
    ComponentDefHandler cdHandler;
    XMLParser parser = XMLParser.getInstance();

    public ComponentDefHandlerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(vendor.getComponentDefDescriptor(),
                "<aura:component controller='" + vendor.getControllerDescriptor().getQualifiedName() + "' extends='"
                        + vendor.getParentComponentDefDescriptor() + "' implements='"
                        + vendor.getInterfaceDefDescriptor()
                        + "' abstract='true'>Child Text<aura:foo/></aura:component>", "myID", Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getReader());
        xmlReader.next();
        cdHandler = new ComponentDefHandler(vendor.getComponentDefDescriptor(), source, xmlReader);
    }

    public void testReadAttributes() throws Exception {
        cdHandler.readAttributes();
        ComponentDefImpl cd = (ComponentDefImpl) cdHandler.createDefinition();
        assertEquals(vendor.getParentComponentDefDescriptor(), cd.getExtendsDescriptor());
        assertEquals(vendor.getInterfaceDefDescriptor(), cd.getInterfaces().iterator().next());
        assertTrue(cd.isAbstract());
        assertTrue(cd.isExtensible());
    }

    public void testGetHandledTag() {
        assertEquals("aura:component", cdHandler.getHandledTag());
    }

    public void testDuplicateAttributeNames() throws Exception {
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(descriptor,
                "<aura:component><aura:attribute name=\"implNumber\" type=\"String\"/>"
                        + "<aura:attribute name=\"implNumber\" type=\"String\"/></aura:component>", "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown Exception. Two attributes with the same name cannot exist");
        } catch (AuraRuntimeException expected) {
        }
    }

    /**
     * An attribute cannot be assigned multiple times on a System tag.
     * 
     * @throws Exception
     */
    public void testDuplicateAttributeOnSystemTag() throws Exception {
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(descriptor,
                "<aura:component extends='test:fakeAbstract' extends='test:fakeAbstractParent'></aura:component>",
                "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown Exception. Same attribute specified twice on aura:component tag.");
        } catch (AuraRuntimeException expected) {
        }
    }

    /**
     * Verify that an attribute cannot be assigned a blank value.
     */
    public void testBlankValueForSystemTag() throws Exception {
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(descriptor,
                "<aura:component extends=''></aura:component>", "myID", Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown Exception. Attribute value cannot be blank.");
        } catch (AuraRuntimeException expected) {
        }

    }
}
