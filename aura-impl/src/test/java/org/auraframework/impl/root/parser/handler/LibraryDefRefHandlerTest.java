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

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

public class LibraryDefRefHandlerTest extends AuraImplTestCase {
    @Mock
    DefDescriptor<LibraryDefRef> descriptor;

    @Mock
    DefDescriptor<ComponentDef> parentDescriptor;

    @Mock
    RootTagHandler<ComponentDef> parentHandler;

    private XMLStreamReader getReader(TextSource<?> source) throws XMLStreamException {
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        XMLStreamReader xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(),
                source.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    @Test
    public void testGetElement() throws Exception {
        String expectedLibrary = "my:Lib";
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, 
        		String.format("<%s library='%s' property='p'/>", LibraryDefRefHandler.TAG, expectedLibrary), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        LibraryDefRef def = handler.getElement();

        DefDescriptor<LibraryDef> expectedDescriptor = definitionService.getDefDescriptor(expectedLibrary, LibraryDef.class);
        assertEquals(expectedDescriptor, def.getDescriptor());
        assertEquals(expectedDescriptor, def.getReferenceDescriptor());
    }

    @Test
    public void testGetElementWithoutLibrary() throws Exception {
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s/>", LibraryDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag requires a library attribute.");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s missing library attribute", LibraryDefRefHandler.TAG));
        }
    }

    @Test
    public void testGetElementWithEmptyLibrary() throws Exception {
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s library=''/>", LibraryDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag requires a non empty library attribute.");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s missing library attribute", LibraryDefRefHandler.TAG));
        }
    }

    @Test
    public void testGetElementWithInvalidLibraryName() throws Exception {
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s library='this is invalid'/>", LibraryDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag requires a library attribute with a valid descriptor.");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("Invalid Descriptor Format: this is invalid[%s]", DefType.LIBRARY));
        }
    }

    @Test
    public void testGetElementWithNonEmptyTag() throws Exception {
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p'>text</%1$s>", LibraryDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag may not contain any children");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("expected end of %s tag", LibraryDefRefHandler.TAG));
        }
    }

    @Test
    public void testGetElementWithDescription() throws Exception {
        String expectedDescription = "needs to be included";
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p' description='%s'/>", LibraryDefRefHandler.TAG, expectedDescription), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        LibraryDefRef actualDef = handler.getElement();
        assertEquals(expectedDescription, actualDef.getDescription());
    }

    @Test
    public void testGetElementWithUnexpectedAttribute() throws Exception {
        StringSource<LibraryDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p' unexpected='me'/>", LibraryDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        Mockito.doReturn(DefType.COMPONENT).when(parentDescriptor).getDefType();
        LibraryDefRefHandler handler = new LibraryDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag attributes are not validated");
        } catch (InvalidSystemAttributeException t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"unexpected\"");
        }
    }
}
