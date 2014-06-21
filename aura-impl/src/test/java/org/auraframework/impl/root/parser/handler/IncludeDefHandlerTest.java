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

import java.util.EnumSet;
import java.util.List;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableList;

public class IncludeDefHandlerTest extends AuraImplTestCase {

    public IncludeDefHandlerTest(String name) {
        super(name);
    }

    @Mock
    DefDescriptor<IncludeDef> includeDescriptor;

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

    public void testGetElementInLibraryContainer() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedParentNamespace = getAuraTestingUtil().getNonce("parentSpace");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s'/>", IncludeDefHandler.TAG, expectedName), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(expectedParentNamespace).when(parentDescriptor).getNamespace();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        assertEquals(expectedName, actualDef.getName());
        assertNull(actualDef.getDescription());
        assertNull(actualDef.getImports());
        assertNull(actualDef.getExport());

        DefDescriptor<IncludeDef> actualDesc = actualDef.getDescriptor();
        assertEquals(parentDescriptor.getNamespace(), actualDesc.getNamespace());
        assertEquals(expectedName, actualDesc.getName());
        assertEquals(parentDescriptor, actualDesc.getBundle());
    }

    public void testGetElementInUnsupportedContainers() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("irrelevant");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s'/>", IncludeDefHandler.TAG, expectedName), "myID", Format.XML);
        EnumSet<DefType> unsupportedContainerTypes = EnumSet.complementOf(EnumSet.of(DefType.LIBRARY));

        for (DefType containerType : unsupportedContainerTypes) {
            Mockito.doReturn(containerType).when(parentDescriptor).getDefType();
            Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
            IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

            try {
                handler.getElement();
                fail("Include should be allowed only in a Library");
            } catch (AuraRuntimeException t) {
                assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                        String.format("%s may only be set in a library.", IncludeDefHandler.TAG));
            }
        }
    }

    public void testGetElementWithoutName() throws Exception {
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s/>", IncludeDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Name should be required for Include");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("%s must specify a valid library name.", IncludeDefHandler.TAG));
        }
    }

    public void testGetElementWithNameJsSuffixStripped() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedParentNamespace = getAuraTestingUtil().getNonce("parentSpace");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s.js'/>", IncludeDefHandler.TAG, expectedName), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(expectedParentNamespace).when(parentDescriptor).getNamespace();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        assertEquals(expectedName, actualDef.getName());

        DefDescriptor<IncludeDef> actualDesc = actualDef.getDescriptor();
        assertEquals(parentDescriptor.getNamespace(), actualDesc.getNamespace());
        assertEquals(expectedName, actualDesc.getName());
        assertEquals(parentDescriptor, actualDesc.getBundle());
    }

    public void testGetElementWithEmptyTag() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s'></%s>", IncludeDefHandler.TAG, expectedName, IncludeDefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        assertEquals(expectedName, actualDef.getName());
    }

    public void testGetElementWithNonEmptyTag() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("irrelevant");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s'>text</%s>", IncludeDefHandler.TAG, expectedName, IncludeDefHandler.TAG), "myID",
                Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Include tag may not contain any children");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("expected end of %s tag", IncludeDefHandler.TAG));
        }
    }

    public void testGetElementWithDescription() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedDescription = "needs to be included";
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s' description='%s'/>", IncludeDefHandler.TAG, expectedName, expectedDescription), "myID",
                Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        assertEquals(expectedDescription, actualDef.getDescription());
    }

    public void testGetElementWithImports() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedImports = "importable";
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s' imports='%s'/>", IncludeDefHandler.TAG, expectedName, expectedImports), "myID",
                Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        List<String> actualImports = actualDef.getImports();
        assertEquals(1, actualImports.size());
        assertEquals(expectedImports, actualImports.get(0));
    }

    public void testGetElementWithMultipleImports() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        List<String> expectedImports = ImmutableList.of("import1", "import2", "import3");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s' imports='%s'/>", IncludeDefHandler.TAG, expectedName,
                " \t\r\n" + StringUtils.join(expectedImports, " \t\r\n, \t\r\n")) + " \t\r\n", "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        List<String> actualImports = actualDef.getImports();
        assertEquals(expectedImports.size(), actualImports.size());
        assertTrue(actualImports.containsAll(expectedImports));
    }

    public void testGetElementWithExport() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedExports = "exportable";
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s' export='%s'/>", IncludeDefHandler.TAG, expectedName, expectedExports), "myID",
                Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        IncludeDef actualDef = handler.getElement();
        String actualExports = actualDef.getExport();
        assertEquals(expectedExports, actualExports);
    }

    public void testGetElementWithUnexpectedAttribute() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        StringSource<IncludeDef> source = new StringSource<>(includeDescriptor, String.format(
                "<%s name='%s' unexpected='me'/>", IncludeDefHandler.TAG, expectedName), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefHandler handler = new IncludeDefHandler(parentHandler, getReader(source), source);

        try {
            handler.getElement();
            fail("Include tag attributes are not validated");
        } catch (InvalidSystemAttributeException t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"unexpected\"");
        }
    }

}
