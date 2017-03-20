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
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.junit.Test;

import javax.inject.Inject;
import javax.xml.stream.XMLStreamReader;
import java.util.List;

public class AttributeDefRefHandlerTest extends AuraImplTestCase {
    @Inject
    private DefinitionParserAdapter definitionParserAdapter;

//    @Test
//    public void testAttributeDefRefParsing() throws Exception {
//        DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor("test:fakeparser", ComponentDef.class);
//        StringSource<ComponentDef> source = new StringSource<>(
//                descriptor,
//                "<aura:component><aura:set attribute='header' value='false'>Child Text</aura:set></aura:component>", "myID", Format.XML);
//        ComponentDef cd = componentXMLParser.getDefinition(descriptor, source);
//        assertNotNull(cd);
//    }
//
//    @Test
//    public void testAttributeDefRefParsingWithChildtag() throws Exception {
//        DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor("test:fakeparser", ComponentDef.class);
//        StringSource<ComponentDef> source = new StringSource<>(
//                descriptor, "<aura:component><aura:set attribute='header'><aura:foo/></aura:set></aura:component>",
//                "myID", Format.XML);
//        ComponentDef cd = componentXMLParser.getDefinition(descriptor, source);
//        assertNotNull(cd);
//    }

    @Test
    public void testGetElementWithValueAttribute() throws Exception {
        DefDescriptor<AttributeDef> desc = definitionService.getDefDescriptor("mystring", AttributeDef.class);
        StringSource<AttributeDef> source = new StringSource<>(
                desc, "<aura:set attribute='mystring' value='testing'/>", "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        AttributeDefRefHandler<ComponentDef> adrHandler = new AttributeDefRefHandler<>(null, xmlReader,
                source, true, definitionService, configAdapter, definitionParserAdapter);
        AttributeDefRefImpl adr = adrHandler.getElement();
        assertEquals("mystring", adr.getName());
        Object o = adr.getValue();
        assertEquals("testing", o);
    }

    @Test
    public void testGetElementWithValueAsChildTag() throws Exception {
        DefDescriptor<AttributeDef> desc = definitionService.getDefDescriptor("mystring", AttributeDef.class);
        StringSource<AttributeDef> source = new StringSource<>(
                desc, "<aura:set attribute='mystring'><aura:foo/></aura:set>", "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        AttributeDefRefHandler<ComponentDef> adrHandler = new AttributeDefRefHandler<>(null, xmlReader,
                source, true, definitionService, configAdapter, definitionParserAdapter);
        AttributeDefRefImpl adr = adrHandler.getElement();
        DefinitionReference value = (DefinitionReference) ((List<?>) adr.getValue()).get(0);
        assertEquals("foo", value.getName());
    }

    @Test
    public void testGetElementWithTextBetweenTags() throws Exception {
        DefDescriptor<AttributeDef> desc = definitionService.getDefDescriptor("mystring", AttributeDef.class);
        StringSource<AttributeDef> source = new StringSource<>(
                desc, "<aura:set attribute='mystring'>Child Text</aura:set>", "myID", Format.XML);
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(source.getHashingReader());
        xmlReader.next();
        AttributeDefRefHandler<ComponentDef> adrHandler = new AttributeDefRefHandler<>(null, xmlReader,
                source, true, definitionService, configAdapter, definitionParserAdapter);
        AttributeDefRefImpl adr = adrHandler.getElement();
        ComponentDefRef value = (ComponentDefRef) ((List<?>) adr.getValue()).get(0);
        assertEquals("Child Text", value.getAttributeDefRef("value").getValue());
    }
}
