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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;

public class DesignTemplateRegionDefHandlerTest extends AuraImplTestCase {
    public DesignTemplateRegionDefHandlerTest(String name) {
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
        DesignTemplateRegionDef element = getElement(
                "regionone",
                "<design:region name=\"regionone\"/>");

        assertEquals("regionone", element.getName());
        assertTrue(element.getAllowedInterfaces().isEmpty());
    }

    public void testAllowedInterfaces() throws Exception {
        DesignTemplateRegionDef element = getElement(
                "regionone",
                "<design:region name=\"regionone\" allowedInterfaces=\"test:fakeInterface\"/>");

        assertEquals("regionone", element.getName());
        assertTrue(element.getAllowedInterfaces().size() == 1);

        for (DefDescriptor<InterfaceDef> intf : element.getAllowedInterfaces()) {
            assertEquals("markup://test:fakeInterface", intf.getQualifiedName());
            assertTrue(intf.exists());
        }
    }

    public void testInvalidSystemAttributeName() throws Exception {
        try {
            getElement("regionone", "<design:region name=\"regionone\" foo=\"bar\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"foo\"");
        }
    }

    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
            getElement("regionone", "<design:region name=\"regionone\" other:name=\"asdf\" />");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class,
                    "Invalid attribute \"other:name\"");
        }
    }

    private XMLStreamReader getXmlReader(StringSource<?> templateSource) throws FactoryConfigurationError,
            XMLStreamException {
        XMLStreamReader xmlReader = XMLParser.getInstance().createXMLStreamReader(templateSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private DesignTemplateRegionDefHandler getHandler(String qname, String regionMarkup) throws Exception {
        DefDescriptor<DesignTemplateRegionDef> regionDesc = Aura.getDefinitionService().getDefDescriptor(qname,
                DesignTemplateRegionDef.class);
        StringSource<DesignTemplateRegionDef> regionSource = new StringSource<>(regionDesc, regionMarkup, "myID",
                Format.XML);
        XMLStreamReader templateXmlReader = getXmlReader(regionSource);
        return new DesignTemplateRegionDefHandler(ddh, templateXmlReader,
                regionSource);
    }

    private DesignTemplateRegionDef getElement(String qname, String templateMarkup) throws Exception {
        return getHandler(qname, templateMarkup).getElement();
    }
}
