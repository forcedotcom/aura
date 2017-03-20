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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
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

import com.google.common.collect.Lists;

public class IncludeDefRefHandlerTest extends AuraImplTestCase {
    @Mock
    DefDescriptor<IncludeDefRef> descriptor;

    @Mock
    DefDescriptor<?> parentDescriptor;

    @Mock
    RootTagHandler<?> parentHandler;

    private XMLStreamReader getReader(TextSource<?> source) throws XMLStreamException {
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        XMLStreamReader xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(),
                source.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    @Test
    public void testGetElementInLibraryContainer() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedParentNamespace = getAuraTestingUtil().getNonce("parentSpace");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s'/>", IncludeDefRefHandler.TAG, expectedName), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(expectedParentNamespace).when(parentDescriptor).getNamespace();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        assertEquals(expectedName, actualDef.getName());
        assertNull(actualDef.getDescription());
        assertNull(actualDef.getImports());
        assertNull(actualDef.getExport());

        DefDescriptor<? extends Definition> actualDesc = actualDef.getDescriptor();
        assertEquals(parentDescriptor.getNamespace(), actualDesc.getNamespace());
        assertEquals(expectedName, actualDesc.getName());
        assertEquals(parentDescriptor, actualDesc.getBundle());
    }

    @Test
    public void testGetElementInUnsupportedContainers() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("irrelevant");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s'/>", IncludeDefRefHandler.TAG, expectedName), "myID", Format.XML);
        EnumSet<DefType> unsupportedContainerTypes = EnumSet.complementOf(EnumSet.of(DefType.LIBRARY));

        for (DefType containerType : unsupportedContainerTypes) {
            Mockito.doReturn(containerType).when(parentDescriptor).getDefType();
            Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
            IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

            try {
                handler.getElement();
                fail("Include should be allowed only in a Library");
            } catch (InvalidDefinitionException t) {
                assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                        String.format("%s may only be set in a library.", IncludeDefRefHandler.TAG));
            }
        }
    }

    @Test
    public void testGetElementWithInvalidName() throws Exception {
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='this is invalid'/>", IncludeDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Name should be required for Include");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("Invalid Descriptor Format: js://null.this is invalid[%s]", DefType.INCLUDE));
        }
    }

    @Test
    public void testGetElementWithInvalidImportFormat() throws Exception {
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='name' imports='invalid:library'/>", IncludeDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Invalid import name format not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "Invalid name in aura:include imports property: invalid:library");
        }
    }

    @Test
    public void testGetElementWithInvalidImportName() throws Exception {
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='name' imports='not a descriptor name'/>", IncludeDefRefHandler.TAG), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Invalid descriptor name for imports not validated");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("Invalid Descriptor Format: null.not a descriptor name[%s]", DefType.INCLUDE));
        }
    }

    @Test
    public void testGetElementWithEmptyTag() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s'></%s>", IncludeDefRefHandler.TAG, expectedName, IncludeDefRefHandler.TAG),
                "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        assertEquals(expectedName, actualDef.getName());
    }

    @Test
    public void testGetElementWithNonEmptyTag() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("irrelevant");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s'>text</%s>", IncludeDefRefHandler.TAG, expectedName, IncludeDefRefHandler.TAG),
                "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag may not contain any children");
        } catch (AuraRuntimeException t) {
            assertExceptionMessageEndsWith(t, AuraRuntimeException.class,
                    String.format("expected end of %s tag", IncludeDefRefHandler.TAG));
        }
    }

    @Test
    public void testGetElementWithDescription() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedDescription = "needs to be included";
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor,
                String.format(
                "<%s name='%s' description='%s'/>", IncludeDefRefHandler.TAG, expectedName, expectedDescription),
                "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        assertEquals(expectedDescription, actualDef.getDescription());
    }

    @Test
    public void testGetElementWithImports() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedImports = "importable";
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s' imports='%s'/>", IncludeDefRefHandler.TAG, expectedName, expectedImports),
                "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        List<DefDescriptor<IncludeDef>> actualImports = actualDef.getImports();
        assertEquals(1, actualImports.size());
        assertEquals(expectedImports, actualImports.get(0).getName());
        assertSame(parentDescriptor, actualImports.get(0).getBundle());
    }

    @Test
    public void testGetElementWithFullyQualifiedImport() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedBundleNamespace = getAuraTestingUtil().getNonce("bundleNamespace");
        String expectedBundleName = getAuraTestingUtil().getNonce("bundleName");
        String expectedImports = "importable";
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s' imports='%s:%s:%s'/>", IncludeDefRefHandler.TAG, expectedName, expectedBundleNamespace,
                expectedBundleName, expectedImports), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        List<DefDescriptor<IncludeDef>> actualImports = actualDef.getImports();
        assertEquals(1, actualImports.size());
        assertEquals(expectedImports, actualImports.get(0).getName());
        assertEquals(expectedBundleNamespace, actualImports.get(0).getBundle().getNamespace());
        assertEquals(expectedBundleName, actualImports.get(0).getBundle().getName());
    }

    @Test
    public void testGetElementWithMultipleImports() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        List<String> expectedImports = Lists.newArrayList("import1", "import2", "import3");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s' imports='%s'/>", IncludeDefRefHandler.TAG, expectedName,
                " \t\r\n" + String.join(" \t\r\n, \t\r\n", expectedImports)) + " \t\r\n", "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        List<DefDescriptor<IncludeDef>> actualImports = actualDef.getImports();
        assertEquals(expectedImports.size(), actualImports.size());
        for (DefDescriptor<IncludeDef> actual : actualImports) {
            assertSame(parentDescriptor, actual.getBundle());
            if (!expectedImports.remove(actual.getName())) {
                fail("unexpected import found: " + actual.getQualifiedName());
            }
        }
        if (!expectedImports.isEmpty()) {
            fail("missing expected imports: " + expectedImports);
        }
    }

    @Test
    public void testGetElementWithExport() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        String expectedExports = "exportable";
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s' export='%s'/>", IncludeDefRefHandler.TAG, expectedName, expectedExports),
                "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        IncludeDefRef actualDef = handler.getElement();
        String actualExports = actualDef.getExport();
        assertEquals(expectedExports, actualExports);
    }

    @Test
    public void testGetElementWithUnexpectedAttribute() throws Exception {
        String expectedName = getAuraTestingUtil().getNonce("somethingIncluded");
        StringSource<IncludeDefRef> source = new StringSource<>(descriptor, String.format(
                "<%s name='%s' unexpected='me'/>", IncludeDefRefHandler.TAG, expectedName), "myID", Format.XML);
        Mockito.doReturn(DefType.LIBRARY).when(parentDescriptor).getDefType();
        Mockito.doReturn(parentDescriptor).when(parentHandler).getDefDescriptor();
        IncludeDefRefHandler handler = new IncludeDefRefHandler(parentHandler, getReader(source), source, definitionService);

        try {
            handler.getElement();
            fail("Include tag attributes are not validated");
        } catch (InvalidSystemAttributeException t) {
            assertExceptionMessageEndsWith(t, InvalidSystemAttributeException.class, "Invalid attribute \"unexpected\"");
        }
    }

}
