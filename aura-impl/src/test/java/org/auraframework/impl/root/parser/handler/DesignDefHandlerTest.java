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

import javax.xml.stream.FactoryConfigurationError;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;

public class DesignDefHandlerTest extends AuraImplTestCase {

    public DesignDefHandlerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    public void testGetElement() throws Exception {
        DesignDef element = getElement("mydesign", "<design:component label=\"some label\" />");
        assertEquals("some label", element.getLabel());
        assertEquals("mydesign", element.getName());
    }

    public void testRetrieveSingleAttributeDesign() throws Exception {
        DesignDef element = getElement("mydesign",
                "<design:component><design:attribute name=\"mystring\" required=\"true\"/></design:component>");
        AttributeDesignDef child = element.getAttributeDesignDef("mystring");
        assertNotNull("Expected one AttributeDesignDef", child);
        assertTrue(child.isRequired());
    }

    public void testInvalidSystemAttributeName() throws Exception {
        try {
            getElement("mydesign", "<design:component foo=\"bar\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"foo\"");
        }
    }

    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
            getElement("mydesign", "<design:component other:label=\"some label\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class,
                    "Invalid attribute \"other:label\"");
        }
    }

    private XMLStreamReader getXmlReader(StringSource<?> attributeSource) throws FactoryConfigurationError,
            XMLStreamException {
        XMLStreamReader xmlReader = XMLParser.getInstance().createXMLStreamReader(attributeSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private DesignDefHandler getHandler(String qname, String designMarkup) throws Exception {
        DefDescriptor<DesignDef> designDesc = Aura.getDefinitionService().getDefDescriptor(qname,
                DesignDef.class);
        StringSource<DesignDef> designSource = new StringSource<>(designDesc, designMarkup, "myID",
                Format.XML);
        XMLStreamReader designXmlReader = getXmlReader(designSource);
        return new DesignDefHandler(designDesc, designSource, designXmlReader);
    }

    private DesignDef getElement(String qname, String designMarkup) throws Exception {
        return getHandler(qname, designMarkup).getElement();
    }
}
