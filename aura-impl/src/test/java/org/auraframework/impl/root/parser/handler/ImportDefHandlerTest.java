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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ImportDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.library.ImportDefImpl;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.mockito.Mock;
import org.mockito.Mockito;

public class ImportDefHandlerTest extends AuraImplTestCase {

    public ImportDefHandlerTest(String name) {
        super(name);
    }

    @Mock
    DefDescriptor<ImportDef> descriptor;

    @Mock
    DefDescriptor<?> parentDescriptor;

    @Mock
    RootTagHandler<?> parentHandler;

    private XMLStreamReader getReader(Source<?> source) throws XMLStreamException {
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        XMLStreamReader xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(),
                source.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    public void testGetElement() throws Exception {
        String expectedLibrary = "my:Lib";
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library='%s' property='p'/>", ImportDefHandler.TAG, expectedLibrary), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        ImportDefImpl def = handler.getElement();

        DefDescriptor<LibraryDef> expectedDescriptor = DefDescriptorImpl.getInstance(expectedLibrary, LibraryDef.class);
        assertEquals(expectedDescriptor, def.getDescriptor());
        assertEquals(expectedDescriptor, def.getLibraryDescriptor());
    }

    public void testGetElementWithoutLibrary() throws Exception {
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s/>", ImportDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Name should be required for Include");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s missing library attribute", ImportDefHandler.TAG));
        }
    }

    public void testGetElementWithEmptyLibrary() throws Exception {
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library=''/>", ImportDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Name should be required for Include");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s missing library attribute", ImportDefHandler.TAG));
        }
    }

    public void testGetElementWithInvalidLibraryName() throws Exception {
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library='this is invalid'/>", ImportDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Name should be required for Include");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("Invalid Descriptor Format: this is invalid[%s]", DefType.LIBRARY));
        }
    }

    public void testGetElementWithNonEmptyTag() throws Exception {
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p'>text</%1$s>", ImportDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Include tag may not contain any children");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("expected end of %s tag", ImportDefHandler.TAG));
        }
    }

    public void testGetElementWithDescription() throws Exception {
        String expectedDescription = "needs to be included";
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p' description='%s'/>", ImportDefHandler.TAG, expectedDescription), "myID",
                Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        ImportDef actualDef = handler.getElement();
        assertEquals(expectedDescription, actualDef.getDescription());
    }

    public void testGetElementWithUnexpectedAttribute() throws Exception {
        StringSource<ImportDef> source = new StringSource<>(descriptor, String.format(
                "<%s library='l' property='p' unexpected='me'/>", ImportDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        ImportDefHandler handler = new ImportDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Include tag attributes are not validated");
        } catch (InvalidSystemAttributeException t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"unexpected\"");
        }
    }
}
