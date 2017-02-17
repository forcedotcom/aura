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
package org.auraframework.integration.test.root.parser.handler;

import java.util.List;

import javax.inject.Inject;
import javax.xml.stream.FactoryConfigurationError;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.factory.XMLParser;
import org.auraframework.impl.root.parser.handler.AttributeDefHandler;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.junit.Test;

public class AttributeDefHandlerTest extends AuraImplTestCase {
    @Inject
    private DefinitionParserAdapter definitionParserAdapter;
    
    DefDescriptor<AttributeDef> desc = null;
    StringSource<AttributeDef> componentSource = null;
    XMLStreamReader componentXmlReader = null;
    ComponentDefHandler cdh = null;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        desc = definitionService.getDefDescriptor("mystring", AttributeDef.class);
        componentSource = new StringSource<>(desc, "<aura:component/>", "myID", Format.XML);
        componentXmlReader = getXmlReader(componentSource);
        cdh = new ComponentDefHandler(null, componentSource, componentXmlReader, true, definitionService, contextService,
                configAdapter, definitionParserAdapter);
    }

    @Test
    public void testGetElement() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='mystring' type='java://String' default='testing'/>");
        assertEquals("mystring", ad.getName());
        assertEquals("String", ad.getTypeDef().getName());
        assertEquals("testing", ad.getDefaultValue().getValue());
    }

    @Test
    public void testDefaultValueExpression() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='mystring' type='java://String' default='{!blah.some.expression}'/>");
        assertEquals("mystring", ad.getName());
        assertEquals("String", ad.getTypeDef().getName());
        Object value = ad.getDefaultValue().getValue();
        assertTrue("Expected a PropertyReference for default", value instanceof PropertyReference);
        assertEquals("blah.some.expression", ((PropertyReference) value).toString());
    }

    @Test
    public void testDefaultValueEmptyString() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='emptyString' type='java://String' default=''/>");
        assertEquals("emptyString", ad.getName());
        assertNotNull("Expected attribute to have a default value.", ad.getDefaultValue());
        assertEquals("Attribute does not reflect empty string as default value.", "", ad.getDefaultValue().getValue());
    }

    @Test
    public void testDefaultValueWhitespace() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='spaces' type='java://String' default='    '/>");
        assertEquals("spaces", ad.getName());
        assertNotNull("Expected attribute to have a default value.", ad.getDefaultValue());
        assertEquals("Attribute does not reflect spaces as default value.", " ", ad.getDefaultValue().getValue());
    }

    @Test
    public void testGetElementWithTextBetweenTags() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='mystring' type='Aura.Component[]'>valid Text which is really a defref</aura:attribute>");
        assertEquals("mystring", ad.getName());
        assertEquals("Component[]", ad.getTypeDef().getName());
        assertTrue(ad.getDefaultValue().getValue() instanceof List);
        List<?> l = (List<?>) ad.getDefaultValue().getValue();
        assertEquals(1, l.size());
        ComponentDefRef cdr = (ComponentDefRef) l.get(0);
        AttributeDefRef adr = cdr.getAttributeDefRef("value");
        assertNotNull(adr);
        assertEquals("valid Text which is really a defref", adr.getValue());
    }

    @Test
    public void testInvalidSystemAttributeName() throws Exception {
        try {
            getElement("<aura:attribute foo='bar' name='mystring' type='java://String' default='{!blah.some.expression}'/>");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"foo\"");
        }
    }

    @Test
    public void testInvalidSystemAttributePrefix() throws Exception {
        try {
            getElement("<aura:attribute name='mystring' type='java://String' other:default='{!blah.some.expression}'/>");
            fail("Expected InvalidSystemAttributeException to be thrown");
        } catch (Exception t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class,
                    "Invalid attribute \"other:default\"");
        }
    }

    @Test
    public void testRequired() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='required' type='String' required='true'/>");
        assertEquals(true, ad.isRequired());
    }

    @Test
    public void testRequiredDefault() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='required' type='String'/>");
        assertEquals(false, ad.isRequired());
    }

    @Test
    public void testRequiredMixedCase() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='required' type='String' ReQuireD='true'/>");
        assertEquals(true, ad.isRequired());
    }

    @Test
    public void testSerializeTo() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='lower' type='String' serializeTo='server'/>");
        assertEquals(SerializeToType.SERVER, ad.getSerializeTo());
    }

    @Test
    public void testSerializeToMixedCase() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='mixed' type='String' serializeTo='nONe'/>");
        assertEquals(SerializeToType.NONE, ad.getSerializeTo());
    }

    @Test
    public void testSerializeToPadded() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='mixed' type='String' serializeTo=' server '/>");
        assertEquals(SerializeToType.SERVER, ad.getSerializeTo());
    }

    @Test
    public void testSerializeToDefault() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='lower' type='String'/>");
        assertEquals(SerializeToType.BOTH, ad.getSerializeTo());
    }

    @Test
    public void testSerializeToInvalid() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='invalid' type='String' serializeTo='client'/>");
        assertEquals(SerializeToType.INVALID, ad.getSerializeTo());
    }

    @Test
    public void testSerializeToEmptyString() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='invalid' type='String' serializeTo=''/>");
        assertEquals(SerializeToType.INVALID, ad.getSerializeTo());
    }

    @Test
    public void testTypeInvalidJavaType() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='type' type='java://invalid'/>");
        try {
            ad.getTypeDef();
            fail("Expected Exception to be thrown when attribute is a non-existent java type");
        } catch (Throwable t) {
            assertExceptionMessage(t, DefinitionNotFoundException.class, "No TYPE named java://invalid found");
        }
    }

    @Test
    public void testTypeInvalidAuraType() throws Exception {
        AttributeDefImpl ad = getElement("<aura:attribute name='type' type='aura://invalid'/>");
        try {
            ad.getTypeDef();
            fail("Expected Exception to be thrown when attribute is a non-existent Aura type");
        } catch (Throwable t) {
            assertExceptionMessage(t, DefinitionNotFoundException.class, "No TYPE named aura://invalid found");
        }
    }

    @Test
    public void testTypeMissing() throws Exception {
        AttributeDefHandler<ComponentDef> adHandler = getHandler("<aura:attribute name='type'/>");
        try {
            adHandler.getElement();
            fail("Expected Exception to be thrown when attribute is missing");
        } catch (Throwable t) {
            assertExceptionMessageContains(t, AuraRuntimeException.class, "Attribute 'type' is required on <aura:attribute>");
        }
    }

    @Test
    public void testTypeEmptyString() throws Exception {
        AttributeDefHandler<ComponentDef> adHandler = getHandler("<aura:attribute name='type' type=''/>");
        try {
            adHandler.getElement();
            fail("Expected Exception to be thrown when attribute is an empty string");
        } catch (Throwable t) {
            assertExceptionMessageContains(t, AuraRuntimeException.class, "Attribute 'type' is required on <aura:attribute>");
        }
    }

    private XMLStreamReader getXmlReader(StringSource<AttributeDef> attributeSource) throws FactoryConfigurationError,
    XMLStreamException {
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(attributeSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private AttributeDefHandler<ComponentDef> getHandler(String attrMarkup) throws Exception {
        StringSource<AttributeDef> attributeSource = new StringSource<>(desc, attrMarkup,
                "myID", Format.XML);
        XMLStreamReader attributeXmlReader = getXmlReader(attributeSource);
        return new AttributeDefHandler<>(cdh, attributeXmlReader, attributeSource, true, definitionService,
                configAdapter, definitionParserAdapter);
    }

    private AttributeDefImpl getElement(String attrMarkup) throws Exception {
        return getHandler(attrMarkup).getElement();
    }
}
