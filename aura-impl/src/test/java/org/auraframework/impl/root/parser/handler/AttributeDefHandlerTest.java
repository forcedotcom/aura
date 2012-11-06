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

import java.util.List;

import javax.xml.stream.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class AttributeDefHandlerTest extends AuraImplTestCase {

    public AttributeDefHandlerTest(String name) {
        super(name);
    }
    DefDescriptor<AttributeDef> desc = null;
    StringSource<AttributeDef> componentSource = null;
    XMLStreamReader componentXmlReader = null;
    ComponentDefHandler cdh = null;
    @Override
    public void setUp()throws Exception{
        super.setUp();
        desc = Aura.getDefinitionService().getDefDescriptor("mystring", AttributeDef.class);
        componentSource = new StringSource<AttributeDef>(desc,"<aura:component/>", "myID",Format.XML);
        componentXmlReader = getXmlReader(componentSource);
        cdh = new ComponentDefHandler(null, componentSource, componentXmlReader);
    }
    public void testGetElement() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc, "<aura:attribute name='mystring' type='java://String' default='testing'/>", "myID",Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        AttributeDefHandler<ComponentDef> adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        AttributeDefImpl ad = adHandler.getElement();
        assertEquals("mystring",ad.getName());
        assertEquals("String",ad.getTypeDef().getName());
        assertEquals("testing",ad.getDefaultValue().getValue());
    }

    public void testExpressionDefaultValue() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='mystring' type='java://String' default='{!blah.some.expression}'/>", "myID",Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        AttributeDefHandler<ComponentDef> adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        AttributeDefImpl ad = adHandler.getElement();
        assertEquals("mystring",ad.getName());
        assertEquals("String",ad.getTypeDef().getName());
        assertTrue(ad.getDefaultValue().getValue() instanceof PropertyReference);
        assertEquals("blah.some.expression", ((PropertyReference)ad.getDefaultValue().getValue()).toString());
    }

    public void testGetElementWithTextBetweenTags() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='mystring' type='Aura.Component[]'>valid Text which is really a defref</aura:attribute>", "myID",Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        AttributeDefHandler<ComponentDef> adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        AttributeDefImpl ad = adHandler.getElement();
        assertEquals("mystring",ad.getName());
        assertEquals("Component[]",ad.getTypeDef().getName());
        assertTrue(ad.getDefaultValue().getValue() instanceof List);
        List<?> l = (List<?>)ad.getDefaultValue().getValue();
        assertEquals(1, l.size());
        ComponentDefRef cdr = (ComponentDefRef)l.get(0);
        AttributeDefRef adr = cdr.getAttributeDefRef("value");
        assertNotNull(adr);
        assertEquals("valid Text which is really a defref", adr.getValue());
    }

    private XMLStreamReader getXmlReader(StringSource<AttributeDef> attributeSource) throws FactoryConfigurationError,
            XMLStreamException {
        XMLStreamReader xmlReader = null;
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(attributeSource.getSystemId(), attributeSource.getReader());
        xmlReader.next();
        return xmlReader;
    }

    public void testUnknownAttribute() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,
                "<aura:attribute foo='bar' name='mystring' type='java://String' default='{!blah.some.expression}'/>", "myID",
                Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);

        try {
            new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (InvalidSystemAttributeException e) {
        }
    }

    public void testKnownAttributeWithUnknownPrefix() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,
                "<aura:attribute name='mystring' type='java://String' other:default='{!blah.some.expression}'/>", "myID",
                Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);

        try {
            new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (InvalidSystemAttributeException e) {
        }
    }
    /**
     * Verify that spaces or empty string can be assigned as default value for Attributes(String type).
     * W-976078
     * @throws Exception
     */
    public void testEmptyStringAndSpacesAsDefaultValue() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='emptyString' type='java://String' default=''/>", "myID",Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        AttributeDefHandler<ComponentDef> adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        AttributeDefImpl ad = adHandler.getElement();
        assertEquals("emptyString",ad.getName());
        assertNotNull("Expected attribute to have a default value.",ad.getDefaultValue());
        assertEquals("Attribute does not reflect empty string as default value.", "" , ad.getDefaultValue().getValue());

        attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='spaces' type='java://String' default='    '/>", "myID",Format.XML);
        attributeXmlReader = getXmlReader(attributeSource);

        cdh = new ComponentDefHandler(null, componentSource, componentXmlReader);

        adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        ad = adHandler.getElement();
        assertEquals("spaces",ad.getName());
        assertNotNull("Expected attribute to have a default value.", ad.getDefaultValue());
        assertEquals("Attribute does not reflect spaces as default value."," " , ad.getDefaultValue().getValue());
    }

    public void testSerializeTo() throws Exception{
        StringSource<AttributeDef> attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='lower' type='String' serializeTo='server'/>", "myID",Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        AttributeDefHandler<ComponentDef> adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        AttributeDefImpl ad = adHandler.getElement();
        assertEquals("lower",ad.getName());
        assertEquals(AttributeDef.SerializeToType.SERVER, ad.getSerializeTo());

        attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='invalid' type='String' serializeTo='client'/>", "myID",Format.XML);
        attributeXmlReader = getXmlReader(attributeSource);
        adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        try {
            ad = adHandler.getElement();
            ad.validateDefinition();
            fail("Expected InvalidDefinitionException");
        } catch (InvalidDefinitionException ide){
            assertTrue("Excpected invalid serializeTo, but got <"+ide.getMessage()+">",
                       ide.getMessage().contains("Invalid serializeTo value"));
        }

        attributeSource = new StringSource<AttributeDef>(desc,"<aura:attribute name='invalid' type='String' serializeTo=''/>", "myID",Format.XML);
        attributeXmlReader = getXmlReader(attributeSource);
        adHandler = new AttributeDefHandler<ComponentDef>(cdh, attributeXmlReader, attributeSource);
        try {
            ad = adHandler.getElement();
            ad.validateDefinition();
            fail("Expected InvalidDefinitionException");
        } catch (InvalidDefinitionException ide){
            assertTrue("Excpected invalid serializeTo, but got <"+ide.getMessage()+">",
                       ide.getMessage().contains("Invalid serializeTo value"));
        }
    }
}
