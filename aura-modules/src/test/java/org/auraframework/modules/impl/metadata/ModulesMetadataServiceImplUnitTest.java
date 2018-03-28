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
package org.auraframework.modules.impl.metadata;

import org.auraframework.def.PlatformDef.SupportLevel;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.modules.impl.metadata.xml.ApiVersionElementHandler;
import org.auraframework.modules.impl.metadata.xml.ExposeElementHandler;
import org.auraframework.modules.impl.metadata.xml.MinApiVersionElementHandler;
import org.auraframework.modules.impl.metadata.xml.ModuleMetadataXMLHandler;
import org.auraframework.modules.impl.metadata.xml.RequireLockerElementHandler;
import org.auraframework.modules.impl.metadata.xml.SupportElementHandler;
import org.auraframework.modules.impl.metadata.xml.TagsElementHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ModulesMetadataServiceImplUnitTest {
    @Test
    public void processXML() throws Exception {
        String xml =
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "  <LightningComponentBundle>\n" +
                    "  <isExposed>   true</isExposed>" +
                    "  <apiVersion>  42.0</apiVersion>" +
                    "  <minApiVersion>  41.0</minApiVersion>" +
                    "  <requireLocker>true</requireLocker>  \n" +
                    "  <support>gA</support>  \n" +
                    "  <tags>" +
                    "      <tag>random__tag  </tag>" +
                    "      <tag>  bob__tag  </tag> " +
                    "      <tag>  home__tag</tag>\n" +
                    "  </tags>" +
                "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        modulesMetadataService.processMetadata(xmlSource, builder);

        ModuleDef moduleDef = builder.build();

        assertTrue("should have global access", moduleDef.getAccess().isGlobal());
        assertEquals("apiVersion should be 42.0", "42.0", moduleDef.getAPIVersion());
        assertEquals("minVersion should be 41.0", new Double(41.0), moduleDef.getMinVersion());
        assertTrue("should require locker", moduleDef.getRequireLocker());
        assertEquals("should have 3 tags", 3, moduleDef.getTags().size());
        assertTrue("should contain home__tag", moduleDef.getTags().contains("home__tag"));
        assertEquals("should be SupportLevel GA", SupportLevel.GA, moduleDef.getSupport());
    }

    @Test
    public void processBadXML() throws Exception {
        String xml =
                "<LightningComponentBundle>\n" +
                    "<isExposed>   true</isExposed>" +
                    "<minApiVersion>41.0</minApiVersion>\n" +
                    "<requireLocker>true</requireLocker>\n" +
                    "<tags>\n" +
                    "   <tag>random__tag</tag>\n" +
                    "   <tag>bob__tag<tag>\n" +
                    "   <tag>home__tag</tag>\n" +
                    "</tags>\n" +
                "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();
        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        try {
            modulesMetadataService.processMetadata(xmlSource, builder);
            fail("bad xml should have thrown exception");
        } catch (QuickFixException qfe) {
            assertTrue("should be InvalidDefinitionException", qfe instanceof InvalidDefinitionException);
            assertTrue("should be XML parse error", qfe.getMessage().contains("Unexpected element"));
        }
    }

    @Test
    public void processMoreBadXML() throws Exception {
        String xml =
                "<LightningComponentBundle> " +
                        "  <isExposed> <abc>true</abc> <tags> <tag> availableForRecordHome</tag> </tags> </isExposed>\n" +
                        "  <minApiVersion>41.0  </minApiVersion>\n" +
                        "    <requireLocker>true  </requireLocker>\n" +
                        "<tags>\n" +
                        "   <tag>random__tag</tag>\n" +
                        "   <tag>bob__tag</tag>" +
                        "   <tag>home__tag</tag>\n" +
                        "</tags>" +
                "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();
        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        try {
            modulesMetadataService.processMetadata(xmlSource, builder);
            fail("bad xml should have thrown exception");
        } catch (QuickFixException qfe) {
            assertTrue("should be InvalidDefinitionException", qfe instanceof InvalidDefinitionException);
            assertTrue("should be XML parse error", qfe.getMessage().contains("Unexpected element: abc"));
        }
    }

    @Test
    public void processBadTagsXML() throws Exception {
        String xml =
                "<LightningComponentBundle> " +
                        "  <isExposed>true</isExposed>\n" +
                        "  <minApiVersion>41.0  </minApiVersion>\n" +
                        "    <requireLocker>true  </requireLocker>\n" +
                        "<tags>\n" +
                        "   <nottag>random__tag</nottag>\n" +
                        "   <tag>random__tag</tag>\n" +
                        "   <tag>bob__tag</tag>" +
                        "   <tag>home__tag</tag>\n" +
                        "</tags>" +
                        "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();
        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        try {
            modulesMetadataService.processMetadata(xmlSource, builder);
            fail("bad xml should have thrown exception");
        } catch (QuickFixException qfe) {
            assertTrue("should be InvalidDefinitionException", qfe instanceof InvalidDefinitionException);
            assertTrue("should be XML parse error", qfe.getMessage().contains("Unexpected element: nottag"));
        }
    }

    @Test
    public void processRandomTextInTagsXML() throws Exception {
        String xml =
                "<LightningComponentBundle> " +
                        "  <isExposed>true</isExposed>\n" +
                        "  <minApiVersion>41.0  </minApiVersion>\n" +
                        "    <requireLocker>true  </requireLocker>\n" +
                        "<tags>\n" +
                        "   <tag>random__tag</tag>\n" +
                        "   <tag>bob__tag</tag>" +
                        "  \n blah \n random \n" +
                        "   <tag>home__tag</tag>\n" +
                        "</tags>" +
                        "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();
        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        try {
            modulesMetadataService.processMetadata(xmlSource, builder);
            fail("bad xml should have thrown exception");
        } catch (QuickFixException qfe) {
            assertTrue("should be InvalidDefinitionException", qfe instanceof InvalidDefinitionException);
            assertTrue("should be XML parse error", qfe.getMessage().contains("Unexpected xml"));
        }
    }

    @Test
    public void processRandomTextXML() throws Exception {
        String xml =
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<LightningComponentBundle> \n\n" +
                        "  <isExposed>true</isExposed>\n" +
                        "  <minApiVersion>41.0  </minApiVersion>\n" +
                        "    <requireLocker>true  </requireLocker>\n" +
                        "<tags>\n" +
                        "   <tag>random__tag</tag>\n" +
                        "   <tag>bob__tag</tag>" +
                        "   <tag>home__tag</tag>\n" +
                        "</tags> \n  \n something random here \n\n\n" +
                        "</LightningComponentBundle>";

        FileSource xmlSource = mock(FileSource.class);
        when(xmlSource.getContents()).thenReturn(xml);
        when(xmlSource.getLastModified()).thenReturn(1L);
        when(xmlSource.getSystemId()).thenReturn("/fake/xml/file.xml");

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();
        List<ModuleMetadataXMLHandler> xmlHandlers = getXmlHandlers();

        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);

        try {
            modulesMetadataService.processMetadata(xmlSource, builder);
            fail("bad xml should have thrown exception");
        } catch (QuickFixException qfe) {
            assertTrue("should be InvalidDefinitionException", qfe instanceof InvalidDefinitionException);
            assertTrue("should be XML parse error", qfe.getMessage().contains("Unexpected xml"));
        }
    }

	private List<ModuleMetadataXMLHandler> getXmlHandlers() {
		List<ModuleMetadataXMLHandler> xmlHandlers = new ArrayList<>();
        xmlHandlers.add(new TagsElementHandler());
        xmlHandlers.add(new ExposeElementHandler());
        xmlHandlers.add(new ApiVersionElementHandler());
        xmlHandlers.add(new MinApiVersionElementHandler());
        xmlHandlers.add(new RequireLockerElementHandler());
        xmlHandlers.add(new SupportElementHandler());
		return xmlHandlers;
	}

}