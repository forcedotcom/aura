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

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DefinitionReference.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;
import java.util.ArrayList;
import java.util.List;

public class ComponentDefRefHandlerTest extends AuraImplTestCase {
    @Inject
    private DefinitionParserAdapter definitionParserAdapter;
    
    XMLStreamReader xmlReader;
    ComponentDefRefHandler<?> cdrHandler;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                desc,
                "<fake:component attr='attr value'>Child Text<aura:foo/><aura:set attribute='header'>Header Value</aura:set></fake:component>", "myID", Format.XML);
        xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader, true, definitionService, contextService,
                configAdapter, definitionParserAdapter);
        cdrHandler = new ComponentDefRefHandler<>(cdh, xmlReader, source, true, definitionService, configAdapter, definitionParserAdapter);
        cdrHandler.readAttributes();
    }

    @Test
    public void testCreateDefinition() throws Exception {
        ComponentDefRef cdr = cdrHandler.createDefinition();
        assertEquals("attr value", cdr.getAttributeDefRef("attr").getValue());
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testHandleChildText() throws Exception {
        xmlReader.next();
        cdrHandler.handleChildText();
        cdrHandler.finishDefinition();
        ComponentDefRef cdr = cdrHandler.createDefinition();
        ArrayList<ComponentDefRef> compDefs = (ArrayList<ComponentDefRef>) cdr.getAttributeDefRef(
                AttributeDefRefImpl.BODY_ATTRIBUTE_NAME).getValue();
        AttributeDefRef attDef = compDefs.get(0).getAttributeDefRef("value");
        assertEquals("Child Text", attDef.getValue());
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testHandleChildTag() throws Exception {
        xmlReader.next();
        xmlReader.next();
        cdrHandler.handleChildTag();
        cdrHandler.finishDefinition();
        ComponentDefRef cdr = cdrHandler.createDefinition();
        ArrayList<DefinitionReference> compDefs = (ArrayList<DefinitionReference>) cdr.getAttributeDefRef(
                AttributeDefRefImpl.BODY_ATTRIBUTE_NAME).getValue();
        assertEquals("foo", compDefs.get(0).getDescriptor().getName());
    }

    @Test
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

    @Test
    public void testGetHandledTag() {
        assertEquals("Component Reference", cdrHandler.getHandledTag());
    }

    /**
     * Verify aura:load specification for componentdef refs.
     *
     * @throws Exception
     */
    @Test
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
        assertEquals("Empty aura:load value should result in default load",
                Load.DEFAULT, cdrHandler.createDefinition().getLoad());

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
        assertEquals("Attribute aura:load value is case insensitive",
                Load.EXCLUSIVE, cdrHandler.createDefinition().getLoad());
    }

    @Test
    public void testReadFlavorAttribute() throws Exception {
        cdrHandler = createComponentDefHandler("<fake:component aura:flavor='fake'/>");
        cdrHandler.readSystemAttributes();
        cdrHandler.createDefinition();

        definitionService.getDefDescriptor("fake:component", ComponentDef.class);

        assertEquals("fake", cdrHandler.createDefinition().getFlavor());
    }

    private ComponentDefRefHandler<?> createComponentDefHandler(String markup) throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(desc, markup, "myID", Format.XML);
        xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader, true, definitionService, contextService,
                configAdapter, definitionParserAdapter);
        return new ComponentDefRefHandler<>(cdh, xmlReader, source, true, definitionService, configAdapter, definitionParserAdapter);
    }
}
