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

import java.util.ArrayList;
import java.util.List;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class ComponentDefRefHandlerTest extends AuraImplTestCase {

    XMLStreamReader xmlReader;
    XMLInputFactory xmlInputFactory;
    ComponentDefRefHandler<?> cdrHandler;

    public ComponentDefRefHandlerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(
                desc,
                "<fake:component attr='attr value'>Child Text<aura:foo/><aura:set attribute='header'>Header Value</aura:set></fake:component>",
                "myID", Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getHashingReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader);
        cdrHandler = new ComponentDefRefHandler<ComponentDef>(cdh, xmlReader, source);
        cdrHandler.readAttributes();
    }

    public void testCreateDefinition() {
        ComponentDefRef cdr = cdrHandler.createDefinition();
        assertEquals("attr value", cdr.getAttributeDefRef("attr").getValue());
    }

    @SuppressWarnings("unchecked")
    public void testHandleChildText() throws Exception {
        xmlReader.next();
        cdrHandler.handleChildText();
        ComponentDefRef cdr = cdrHandler.createDefinition();
        ArrayList<ComponentDefRef> compDefs = (ArrayList<ComponentDefRef>) cdr.getAttributeDefRef(
                AttributeDefRefImpl.BODY_ATTRIBUTE_NAME).getValue();
        AttributeDefRef attDef = compDefs.get(0).getAttributeDefRef("value");
        assertEquals("Child Text", attDef.getValue());
    }

    @SuppressWarnings("unchecked")
    public void testHandleChildTag() throws Exception {
        xmlReader.next();
        xmlReader.next();
        cdrHandler.handleChildTag();
        ComponentDefRef cdr = cdrHandler.createDefinition();
        ArrayList<ComponentDefRef> compDefs = (ArrayList<ComponentDefRef>) cdr.getAttributeDefRef(
                AttributeDefRefImpl.BODY_ATTRIBUTE_NAME).getValue();
        assertEquals("foo", compDefs.get(0).getDescriptor().getName());
    }

    public void testHandleChildSetTag() throws Exception {
        xmlReader.next();
        xmlReader.next();
        xmlReader.next();
        xmlReader.next();
        cdrHandler.handleChildTag();
        ComponentDefRef cdr = cdrHandler.createDefinition();
        ComponentDefRef value = (ComponentDefRef) ((List<?>) cdr.getAttributeDefRef("header").getValue()).get(0);
        assertEquals("Header Value", value.getAttributeDefRef("value").getValue());
    }

    public void testGetHandledTag() {
        assertEquals("Component Reference", cdrHandler.getHandledTag());
    }

    /**
     * Verify aura:load specification for componentdef refs.
     * 
     * @throws Exception
     */
    public void testReadSystemAttributes() throws Exception {
        // 1. Verify specifying a invalid load specification
        cdrHandler = createComponentDefHandler("<fake:component aura:load='foo'/>");
        try {
            cdrHandler.readSystemAttributes();
            fail("Should not be able to specify an invalid load value.");
        } catch (AuraRuntimeException expected) {
            assertTrue("unexpected message: " + expected.getMessage(),
                    expected.getMessage().contains("Invalid value 'foo' specified for 'aura:load' attribute"));
        }
        // 2. Verify specifying blank string as load specification
        cdrHandler = createComponentDefHandler("<fake:component aura:load=' '/>");
        cdrHandler.readSystemAttributes();
        assertEquals("Failed to read specified load level.", Load.DEFAULT, cdrHandler.createDefinition().getLoad());

        // 3. Verify default load specification
        cdrHandler = createComponentDefHandler("<fake:component/>");
        cdrHandler.readSystemAttributes();
        assertEquals("Failed to use DEFAULT load level", Load.DEFAULT, cdrHandler.createDefinition().getLoad());

        // 4. Verify LAZY load specification
        cdrHandler = createComponentDefHandler("<fake:component aura:load='LAZY'/>");
        cdrHandler.readSystemAttributes();
        assertEquals("Failed to read LAZY load level.", Load.LAZY, cdrHandler.createDefinition().getLoad());

        // 5. Verify load specification is not case sensitive
        cdrHandler = createComponentDefHandler("<fake:component aura:lOAd='ExcluSiVe'/>");
        cdrHandler.readSystemAttributes();
        assertEquals(Load.EXCLUSIVE, cdrHandler.createDefinition().getLoad());
    }

    private ComponentDefRefHandler<?> createComponentDefHandler(String markup) throws Exception {
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(desc, markup, "myID", Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getHashingReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader);
        return new ComponentDefRefHandler<ComponentDef>(cdh, xmlReader, source);

    }
}
