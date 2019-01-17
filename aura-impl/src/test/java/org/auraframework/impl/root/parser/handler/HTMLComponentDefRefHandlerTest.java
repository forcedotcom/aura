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

import java.io.Reader;
import java.util.ArrayList;
import java.util.Map;

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.adapter.ExpressionBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.XMLParserBase;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.context.annotation.Lazy;

/**
 * Tests for the {@link HTMLComponentDefRefHandler} class.
 */
public class HTMLComponentDefRefHandlerTest extends AuraImplTestCase {
    @Inject
    private DefinitionParserAdapter definitionParserAdapter;

    @Inject
    private ExpressionBuilder expressionBuilderBean;
    
    private ExpressionBuilder expressionBuilderSpy;
    
    private Reader internalXmlReader;
    private XMLStreamReader xmlReader;
    private HTMLComponentDefRefHandler<?> htmlHandler;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        expressionBuilderSpy = Mockito.spy(expressionBuilderBean);
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                desc, "<div class='MyClass'>Child Text<br/></div>", "myID", Format.XML);
        internalXmlReader = source.getReader();
        xmlReader = XMLParserBase.createXMLStreamReader(internalXmlReader);
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(xmlReader, source, definitionService, true,
                configAdapter, definitionParserAdapter, expressionBuilderSpy, null);
        htmlHandler = new HTMLComponentDefRefHandler<>(xmlReader, source, definitionService, true, configAdapter, definitionParserAdapter, cdh, expressionBuilderSpy, "div");
        htmlHandler.readAttributes();
    }
    
    @Override
    public void tearDown() throws Exception {
        super.tearDown();
        if (xmlReader != null) {
            xmlReader.close();
        }
        if (internalXmlReader != null) {
            internalXmlReader.close();
        }
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testHandleChildText() throws Exception {
        xmlReader.next();
        htmlHandler.handleChildText();
        htmlHandler.finishDefinition();
        ArrayList<ComponentDefRefImpl> compDefs = (ArrayList<ComponentDefRefImpl>) htmlHandler.createDefinition()
                .getAttributeDefRef("body").getValue();
        AttributeDefRef attDef = compDefs.get(0).getAttributeDefRef("value");
        assertEquals("Child Text", attDef.getValue());
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testHandleChildTag() throws Exception {
        xmlReader.next();
        xmlReader.next();
        htmlHandler.handleChildTag();
        htmlHandler.finishDefinition();
        ArrayList<DefinitionReference> cd = (ArrayList<DefinitionReference>) htmlHandler.createDefinition()
                .getAttributeDefRef("body").getValue();
        assertEquals(1, cd.size());
        assertEquals("br", cd.get(0).getAttributeDefRef("tag").getValue());
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @Test
    public void testHandleChildSetTag() throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component",
                ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(
                desc, "<div><aura:set attribute='header' value='false'/></div>", "myID", Format.XML);
        xmlReader = XMLParserBase.createXMLStreamReader(source.getReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(xmlReader, source, definitionService, true,
                configAdapter, definitionParserAdapter, expressionBuilderSpy, null);
        htmlHandler = new HTMLComponentDefRefHandler<>(xmlReader, source, definitionService, true, configAdapter,
                definitionParserAdapter, cdh, expressionBuilderSpy, "div");
        htmlHandler.readAttributes();
        xmlReader.next();
        htmlHandler.handleChildTag();
        @SuppressWarnings({ "unchecked", "unlikely-arg-type" })
        String value = (String) ((Map<String, Object>) htmlHandler.createDefinition()
                .getAttributeDefRef("HTMLAttributes").getValue()).get(definitionService.getDefDescriptor(
                "header", AttributeDef.class));
        assertEquals("false", value);
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testReadAttributes() throws Exception {
        htmlHandler.readAttributes();
        ComponentDefRef cd = htmlHandler.createDefinition();
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = (Map<DefDescriptor<AttributeDef>, AttributeDefRef>) cd
                .getAttributeDefRef("HTMLAttributes").getValue();
        assertEquals("MyClass", attributes.get(definitionService.getDefDescriptor("class", AttributeDef.class)));
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @Test
    public void testGetHandledTag() {
        assertEquals("HTML Component Reference", htmlHandler.getHandledTag());
    }

    @Test
    public void testHandlesTag() {
        assertTrue("HTMLComponentDefRefHandler should handle the div tag", htmlHandler.handlesTag("div"));
        assertFalse("HTMLComponentDefRefHandler should not handle a fakeHTMLTag", htmlHandler.handlesTag("fakeHTMLTag"));
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @Test
    public void testCreateDefinition() throws Exception {
        ComponentDefRef cd = htmlHandler.createDefinition();
        assertEquals("html", cd.getDescriptor().getName());
        assertEquals(2, cd. getAttributeValues().size());
        assertEquals("div", cd.getAttributeDefRef("tag").getValue());
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }

    @Test
    public void testReadFlavorable() throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("fake:component", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(desc, "<div aura:flavorable='true'></div>", "myID", Format.XML);
        xmlReader = XMLParserBase.createXMLStreamReader(source.getReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(xmlReader, source, definitionService, true,
                configAdapter, definitionParserAdapter, expressionBuilderSpy, null);
        HTMLComponentDefRefHandler<?> h = new HTMLComponentDefRefHandler<>(xmlReader, source, definitionService, true,
                configAdapter, definitionParserAdapter, cdh, expressionBuilderSpy, "div");
        h.readAttributes();
        h.readSystemAttributes();
        ComponentDefRef cd = h.createDefinition();
        assertTrue(cd.isFlavorable());
        Mockito.verifyZeroInteractions(expressionBuilderSpy);
    }
}
