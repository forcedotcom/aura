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

import java.util.List;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.Mockito;

public class LibraryDefHandlerTest extends AuraImplTestCase {

    public LibraryDefHandlerTest(String name) {
        super(name);
    }

    @Mock(answer = Answers.RETURNS_MOCKS)
    DefDescriptor<LibraryDef> descriptor;

    private XMLStreamReader getReader(Source<?> source) throws XMLStreamException {
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        XMLStreamReader xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(),
                source.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    public void testGetElement() throws Exception {
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format(
                "<%s><%s name='sanity'/></%1$s>",
                LibraryDefHandler.TAG, IncludeDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(descriptor).getDefType();
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        LibraryDef actualDef = handler.getElement();
        assertSame(descriptor, actualDef.getDescriptor());
        List<IncludeDefRef> includes = actualDef.getIncludes();
        assertEquals(1, includes.size());
        assertEquals("sanity", includes.get(0).getName());
    }

    public void testGetElementWithEmptyTag() throws Exception {
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format("<%s></%1$s>",
                LibraryDefHandler.TAG), "myID", Format.XML);
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        LibraryDef actualDef = handler.getElement();
        assertSame(descriptor, actualDef.getDescriptor());
        assertTrue(actualDef.getIncludes().isEmpty());
    }

    public void testGetElementWithBodyText() throws Exception {
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format("<%s>text</%1$s>",
                LibraryDefHandler.TAG), "myID", Format.XML);
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        try {
            handler.getElement();
            fail("Text should not be allowed within aura:library tag");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("No literal text allowed in %s", LibraryDefHandler.TAG));
        }
    }

    public void testGetElementWithUnsupportedBodyTag() throws Exception {
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format("<%s><br/></%1$s>",
                LibraryDefHandler.TAG), "myID", Format.XML);
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        try {
            handler.getElement();
            fail("only aura:include is allowed in a library body");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class, "Found unexpected tag br");
        }
    }

    public void testGetElementWithDescription() throws Exception {
        String expectedDescription = "needs to be included";
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format("<%s description='%s'></%1$s>",
                LibraryDefHandler.TAG, expectedDescription), "myID", Format.XML);
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        LibraryDef actualDef = handler.getElement();
        assertEquals(expectedDescription, actualDef.getDescription());
    }

    public void testGetElementWithUnexpectedAttribute() throws Exception {
        StringSource<LibraryDef> source = new StringSource<>(descriptor, String.format("<%s unexpected='me'></%1$s>",
                LibraryDefHandler.TAG), "myID", Format.XML);
        LibraryDefHandler handler = new LibraryDefHandler(descriptor, source, getReader(source));

        try {
            handler.getElement();
            fail("unexpected attribute was not validated");
        } catch (InvalidSystemAttributeException t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"unexpected\"");
        }
    }

}
