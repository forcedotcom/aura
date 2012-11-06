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

import java.util.ArrayList;
import java.util.Map;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;

public class HTMLComponentDefRefHandlerTest extends AuraImplTestCase {

    private XMLStreamReader xmlReader;
    private XMLInputFactory xmlInputFactory;
    private HTMLComponentDefRefHandler<?> htmlHandler;

    public HTMLComponentDefRefHandlerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("fake:component", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(desc,"<div class='MyClass'>Child Text<br/></div>", "myID",Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader);
        htmlHandler = new HTMLComponentDefRefHandler<ComponentDef>(cdh, "div",xmlReader,source);
        htmlHandler.readAttributes();
    }

    @SuppressWarnings("unchecked")
    public void testHandleChildText() throws Exception{
        xmlReader.next();
        htmlHandler.handleChildText();
        ArrayList<ComponentDefRefImpl> compDefs = (ArrayList<ComponentDefRefImpl>)htmlHandler.createDefinition().getAttributeDefRef("body").getValue();
        AttributeDefRef attDef = compDefs.get(0).getAttributeDefRef("value");
        assertEquals("Child Text",attDef.getValue());
    }

    @SuppressWarnings("unchecked")
    public void testHandleChildTag() throws Exception {
        xmlReader.next();
        xmlReader.next();
        htmlHandler.handleChildTag();
        ArrayList<ComponentDefRefImpl> cd = (ArrayList<ComponentDefRefImpl>)htmlHandler.createDefinition().getAttributeDefRef("body").getValue();
        assertEquals(1,cd.size());
        assertEquals("br",cd.get(0).getAttributeDefRef("tag").getValue());
    }

    public void testHandleChildSetTag() throws Exception {
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("fake:component", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<ComponentDef>(desc,"<div><aura:set attribute='header' value='false'/></div>", "myID",Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getReader());
        xmlReader.next();
        ComponentDefHandler cdh = new ComponentDefHandler(null, source, xmlReader);
        htmlHandler = new HTMLComponentDefRefHandler<ComponentDef>(cdh, "div",xmlReader,source);
        htmlHandler.readAttributes();
        xmlReader.next();
        htmlHandler.handleChildTag();
        @SuppressWarnings("unchecked")
        String value = (String)((Map<String, Object>)htmlHandler.createDefinition().getAttributeDefRef("HTMLAttributes").getValue()).get(Aura.getDefinitionService().getDefDescriptor("header", AttributeDef.class));
        assertEquals("false", value);
    }

    @SuppressWarnings("unchecked")
    public void testReadAttributes() throws Exception {
        htmlHandler.readAttributes();
        ComponentDefRef cd = htmlHandler.createDefinition();
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = (Map<DefDescriptor<AttributeDef>, AttributeDefRef>)cd.getAttributeDefRef("HTMLAttributes").getValue();
        assertEquals("MyClass",attributes.get(DefDescriptorImpl.getInstance("class", AttributeDef.class)));
    }

    public void testGetHandledTag() {
        assertEquals("HTML Component Reference",htmlHandler.getHandledTag());
    }

    public void testHandlesTag() {
        assertTrue("HTMLComponentDefRefHandler should handle the div tag",htmlHandler.handlesTag("div"));
        assertFalse("HTMLComponentDefRefHandler should not handle a fakeHTMLTag",htmlHandler.handlesTag("fakeHTMLTag"));
    }

    public void testCreateDefinition() throws Exception{
        ComponentDefRef cd = htmlHandler.createDefinition();
        assertEquals("html",cd.getDescriptor().getName());
        assertEquals(2, cd.getAttributeValues().size());
        assertEquals("div", cd.getAttributeDefRef("tag").getValue());
    }

}
