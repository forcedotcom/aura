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

public class AttributeDesignDefHandlerTest extends AuraImplTestCase {

    public AttributeDesignDefHandlerTest(String name) {
        super(name);
    }

    DefDescriptor<DesignDef> designDesc = null;
    StringSource<DesignDef> designSource = null;
    XMLStreamReader designXmlReader = null;
    DesignDefHandler ddh = null;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        designDesc = Aura.getDefinitionService().getDefDescriptor("mydesign", DesignDef.class);
        designSource = new StringSource<>(designDesc, "<design:component/>", "myID", Format.XML);
        ddh = new DesignDefHandler(designDesc, designSource, getXmlReader(designSource));
    }

    public void testGetElement() throws Exception {
        AttributeDesignDef element = getElement(
                "mystring",
                "<design:attribute name=\"mystring\" required=\"true\" readonly=\"true\" type=\"String\" dependsOnAttribute=\"myparent\" datasource=\"one,two,three\" min=\"-100\" max=\"100\" label=\"some label\" placeholder=\"some placeholder\" />");

        assertTrue(element.isRequired());
        assertTrue(element.isReadOnly());
        assertEquals("String", element.getType());
        assertEquals("myparent", element.getDependsOnAttribute());
        assertEquals("one,two,three", element.getDataSource());
        assertEquals("-100", element.getMin());
        assertEquals("100", element.getMax());
        assertEquals("some label", element.getLabel());
        assertEquals("some placeholder", element.getPlaceholderText());
    }

    public void testRequiredAndReadOnlyAttributeParsingNull() throws Exception {
        AttributeDesignDef element = getElement("mystring", "<design:attribute name=\"mystring\" />");
        assertFalse(element.isRequired());
        assertFalse(element.isReadOnly());
    }

    public void testRequiredAndReadOnlyAttributeParsingNotNull() throws Exception {
        AttributeDesignDef element = getElement("mystring",
                "<design:attribute name=\"mystring\" required=\"nottrue\" readonly=\"nottrue\" />");
        assertFalse(element.isRequired());
        assertFalse(element.isReadOnly());
        element = getElement("mystring", "<design:attribute name=\"mystring\" required=\"\" readonly=\"\" />");
        assertFalse(element.isRequired());
        assertFalse(element.isReadOnly());
    }

    public void testInvalidSystemAttributeName() throws Exception {
        try {
            getElement("mystring", "<design:attribute name=\"mystring\" foo=\"bar\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"foo\"");
        }
    }

    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
            getElement("mystring", "<design:attribute name=\"mystring\" other:required=\"false\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class,
                    "Invalid attribute \"other:required\"");
        }
    }

    private XMLStreamReader getXmlReader(StringSource<?> attributeSource) throws FactoryConfigurationError,
            XMLStreamException {
        XMLStreamReader xmlReader = XMLParser.getInstance().createXMLStreamReader(attributeSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private AttributeDesignDefHandler getHandler(String qname, String attrDesignMarkup) throws Exception {
        DefDescriptor<AttributeDesignDef> attrDesc = Aura.getDefinitionService().getDefDescriptor(qname,
                AttributeDesignDef.class);
        StringSource<AttributeDesignDef> attributeSource = new StringSource<>(attrDesc, attrDesignMarkup, "myID",
                Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        return new AttributeDesignDefHandler(ddh, attributeXmlReader,
                attributeSource);
    }

    private AttributeDesignDef getElement(String qname, String attrDesignMarkup) throws Exception {
        return getHandler(qname, attrDesignMarkup).getElement();
    }
}
