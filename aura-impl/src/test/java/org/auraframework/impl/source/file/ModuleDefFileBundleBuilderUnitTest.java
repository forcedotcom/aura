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
package org.auraframework.impl.source.file;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import com.google.common.collect.Maps;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.doReturn;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.spy;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Unit tests for {@link ModuleDefFileBundleBuilder}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(ModuleDefFileBundleBuilder.class)
public class ModuleDefFileBundleBuilderUnitTest {

    @Test
    public void testBuildBundle() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module-cmp");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        setupMockFile(mockJsFile, mockBaseFile, "module-cmp.js");
        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);

        File mockCssFile = mock(File.class);
        setupMockFile(mockCssFile, mockBaseFile, "module-cmp.css");
        DefDescriptor<ModuleDef> css = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockTemplateFile = mock(File.class);
        setupMockFile(mockTemplateFile, mockBaseFile, "module-cmp.html");
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockUtilJsFile = mock(File.class);
        setupMockFile(mockUtilJsFile, mockBaseFile, "utils.js");
        DefDescriptor<ModuleDef> utilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-utils", ModuleDef.class, module);

        File mockDataJsFile = mock(File.class);
        setupMockFile(mockDataJsFile, mockBaseFile, "data.js");
        DefDescriptor<ModuleDef> dataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-data", ModuleDef.class, module);

        File mockJsonFile = mock(File.class);
        setupMockFile(mockJsonFile, mockBaseFile, "lightning.json");
        DefDescriptor<ModuleDef> json = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_FILE_BASENAME, ModuleDef.class, module);

        File mockMetaXMLFile = mock(File.class);
        setupMockFile(mockMetaXMLFile, mockBaseFile, "module-cmp.js-meta.xml");
        DefDescriptor<ModuleDef> meta = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_XML_NAME, ModuleDef.class, module);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockJsonFile, mockMetaXMLFile, mockUtilJsFile, mockDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefinitionService = mock(DefinitionService.class);
        DefDescriptor<ComponentDef> cmpDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ComponentDef.class);
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        when(mockDefinitionService.getDefDescriptor("nameSpace:moduleCmp", ComponentDef.class))
                .thenReturn(cmpDesc);
        when(mockDefinitionService.getDefDescriptor("nameSpace:moduleCmp", ModuleDef.class))
                .thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());
        moduleDefFileBundleBuilder.setConfigAdapter(mockConfigAdapter);
        moduleDefFileBundleBuilder.setDefinitionService(mockDefinitionService);

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockTemplateFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", baseListFiles.length, sourceMap.size());
        assertEquals("incorrect base js entry", String.join(File.separator,"namespace","module-cmp","module-cmp.js"), sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", String.join(File.separator,"namespace","module-cmp","module-cmp.css"), sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", String.join(File.separator,"namespace","module-cmp","module-cmp.html"), sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", String.join(File.separator,"namespace","module-cmp","utils.js"),  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", String.join(File.separator,"namespace","module-cmp","data.js"), sourceMap.get(dataJs).getSystemId());
        assertEquals("incorrect base json entry", String.join(File.separator,"namespace","module-cmp","lightning.json"), sourceMap.get(json).getSystemId());
        assertEquals("incorrect base xml entry", String.join(File.separator,"namespace","module-cmp","module-cmp.js-meta.xml"), sourceMap.get(meta).getSystemId());
    }

    /**
     * naming convention check occurs in module def factory so we still want to produce
     * the bundle source
     */
    @Test
    public void testStillBuildsWithBadNames() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("name-space");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("moduleCmp");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        setupMockFile(mockJsFile, mockBaseFile, "moduleCmp.js");
        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ModuleDef.class);

        File mockCssFile = mock(File.class);
        setupMockFile(mockCssFile, mockBaseFile, "moduleCmp.css");
        DefDescriptor<ModuleDef> css = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, "name-space", "modulecmp-moduleCmp", ModuleDef.class, module);

        File mockTemplateFile = mock(File.class);
        setupMockFile(mockTemplateFile, mockBaseFile, "moduleCmp.html");
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "name-space", "modulecmp-moduleCmp", ModuleDef.class, module);

        File mockUtilJsFile = mock(File.class);
        setupMockFile(mockUtilJsFile, mockBaseFile, "utils.js");
        DefDescriptor<ModuleDef> utilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "name-space", "modulecmp-utils", ModuleDef.class, module);

        File mockDataJsFile = mock(File.class);
        setupMockFile(mockDataJsFile, mockBaseFile, "data.js");
        DefDescriptor<ModuleDef> dataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "name-space", "modulecmp-data", ModuleDef.class, module);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefinitionService = mock(DefinitionService.class);
        DefDescriptor<ComponentDef> cmpDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ComponentDef.class);
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ModuleDef.class);
        when(mockDefinitionService.getDefDescriptor("name-space:modulecmp", ComponentDef.class))
                .thenReturn(cmpDesc);
        when(mockDefinitionService.getDefDescriptor("name-space:modulecmp", ModuleDef.class))
                .thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());
        moduleDefFileBundleBuilder.setConfigAdapter(mockConfigAdapter);
        moduleDefFileBundleBuilder.setDefinitionService(mockDefinitionService);

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockTemplateFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", baseListFiles.length, sourceMap.size());
        assertEquals("incorrect base js entry", String.join(File.separator,"name-space","moduleCmp","moduleCmp.js"), sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", String.join(File.separator,"name-space","moduleCmp","moduleCmp.css"), sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", String.join(File.separator,"name-space","moduleCmp","moduleCmp.html"), sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", String.join(File.separator,"name-space","moduleCmp","utils.js"),  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", String.join(File.separator,"name-space","moduleCmp","data.js"), sourceMap.get(dataJs).getSystemId());
    }

    @Test
    public void testNestedBundle() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        // ROOT LEVEL

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module-cmp");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        setupMockFile(mockJsFile, mockBaseFile, "module-cmp.js");
        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);

        File mockCssFile = mock(File.class);
        setupMockFile(mockCssFile, mockBaseFile, "module-cmp.css");
        DefDescriptor<ModuleDef> css = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockTemplateFile = mock(File.class);
        setupMockFile(mockTemplateFile, mockBaseFile, "module-cmp.html");
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockUtilJsFile = mock(File.class);
        setupMockFile(mockUtilJsFile, mockBaseFile, "utils.js");
        DefDescriptor<ModuleDef> utilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-utils", ModuleDef.class, module);

        File mockDataJsFile = mock(File.class);
        setupMockFile(mockDataJsFile, mockBaseFile, "data.js");
        DefDescriptor<ModuleDef> dataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-data", ModuleDef.class, module);

        // NESTED

        File mockNestFolder = mock(File.class);
        when(mockNestFolder.isDirectory()).thenReturn(true);
        when(mockNestFolder.getName()).thenReturn("nest");
        when(mockNestFolder.getParentFile()).thenReturn(mockBaseFile);

        File mockNestUtilJsFile = mock(File.class);
        setupMockFile(mockNestUtilJsFile, mockBaseFile, String.join(File.separator, "nest","utils.js"));
        when(mockNestUtilJsFile.getParent()).thenReturn("nest");
        when(mockNestUtilJsFile.getParentFile()).thenReturn(mockNestFolder);
        DefDescriptor<ModuleDef> nestedUtilJs =  new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-utils", ModuleDef.class, module);

        File mockNestDataJsFile = mock(File.class);
        setupMockFile(mockNestDataJsFile, mockBaseFile, String.join(File.separator, "nest","data.js"));
        when(mockNestDataJsFile.getParent()).thenReturn("nest");
        when(mockNestDataJsFile.getParentFile()).thenReturn(mockNestFolder);
        DefDescriptor<ModuleDef> nestedDataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-data", ModuleDef.class, module);

        // TESTS (IGNORED)

        File mockTestFolder = mock(File.class);
        when(mockTestFolder.isDirectory()).thenReturn(true);
        when(mockTestFolder.getName()).thenReturn("__tests__");
        when(mockTestFolder.getParentFile()).thenReturn(mockBaseFile);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile, mockNestFolder, mockTestFolder };

        File mockTestFile = mock(File.class);
        setupMockFile(mockTestFile, mockBaseFile, String.join(File.separator, "__tests__","test.test.js"));
        when(mockTestFile.getParent()).thenReturn("__tests__");
        when(mockTestFile.getParentFile()).thenReturn(mockNestFolder);

        File[] nestTestFiles = new File[] { mockTestFolder, mockTestFile };

        // SECOND NESTED

        File mockSecondNestFolder = mock(File.class);
        when(mockSecondNestFolder.isDirectory()).thenReturn(true);
        when(mockSecondNestFolder.getName()).thenReturn("egg");
        when(mockSecondNestFolder.getParentFile()).thenReturn(mockNestFolder);

        File[] nestListFiles = new File[] { mockSecondNestFolder, mockNestUtilJsFile, mockNestDataJsFile };

        File mockSecondNestUtilJsFile = mock(File.class);
        setupMockFile(mockSecondNestUtilJsFile, mockBaseFile, String.join(File.separator, "nest","egg","utils.js"));
        when(mockSecondNestUtilJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestUtilJsFile.getParentFile()).thenReturn(mockSecondNestFolder);
        DefDescriptor<ModuleDef> secondNestedUtilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-utils", ModuleDef.class, module);

        File mockSecondNestDataJsFile = mock(File.class);
        setupMockFile(mockSecondNestDataJsFile, mockBaseFile, String.join(File.separator, "nest","egg","data.js"));
        when(mockSecondNestDataJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestDataJsFile.getParentFile()).thenReturn(mockSecondNestFolder);
        DefDescriptor<ModuleDef> secondNestedDataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-data", ModuleDef.class, module);

        File[] secondNestListFiles = new File[] { mockSecondNestUtilJsFile, mockSecondNestDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);
        when(mockNestFolder.listFiles()).thenReturn(nestListFiles);
        when(mockTestFolder.listFiles()).thenReturn(nestTestFiles);
        when(mockSecondNestFolder.listFiles()).thenReturn(secondNestListFiles);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefinitionService = mock(DefinitionService.class);
        DefDescriptor<ComponentDef> cmpDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ComponentDef.class);
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        when(mockDefinitionService.getDefDescriptor("nameSpace:moduleCmp", ComponentDef.class))
                .thenReturn(cmpDesc);
        when(mockDefinitionService.getDefDescriptor("nameSpace:moduleCmp", ModuleDef.class))
                .thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());
        moduleDefFileBundleBuilder.setConfigAdapter(mockConfigAdapter);
        moduleDefFileBundleBuilder.setDefinitionService(mockDefinitionService);

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockTemplateFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", 9, sourceMap.size());
        assertEquals("incorrect base js entry", String.join(File.separator,"namespace","module-cmp","module-cmp.js"), sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", String.join(File.separator,"namespace","module-cmp","module-cmp.css"), sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", String.join(File.separator,"namespace","module-cmp","module-cmp.html"), sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", String.join(File.separator,"namespace","module-cmp","utils.js"),  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", String.join(File.separator,"namespace","module-cmp","data.js"), sourceMap.get(dataJs).getSystemId());
        assertEquals("incorrect nested utils js entry", String.join(File.separator,"namespace","module-cmp","nest","utils.js"),  sourceMap.get(nestedUtilJs).getSystemId());
        assertEquals("incorrect nested data js entry", String.join(File.separator,"namespace","module-cmp","nest","data.js"), sourceMap.get(nestedDataJs).getSystemId());
        assertEquals("incorrect second nested utils js entry", String.join(File.separator,"namespace","module-cmp","nest","egg","utils.js"),  sourceMap.get(secondNestedUtilJs).getSystemId());
        assertEquals("incorrect second nested data js entry", String.join(File.separator,"namespace","module-cmp","nest","egg","data.js"), sourceMap.get(secondNestedDataJs).getSystemId());
    }

    @Test
    public void testBundleWithHtmlOnly() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module-cmp");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockHtmlFile = mock(File.class);
        setupMockFile(mockHtmlFile, mockBaseFile, "module-cmp.html");
        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "moduleCmp", ModuleDef.class);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(false);

        File[] baseListFiles = new File[] { mockHtmlFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefinitionService = mock(DefinitionService.class);
        DefDescriptor<ComponentDef> cmpDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "namespace", "moduleCmp", ComponentDef.class);
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(
                DefDescriptor.MARKUP_PREFIX, "namespace", "moduleCmp", ModuleDef.class);
        when(mockDefinitionService.getDefDescriptor("namespace:moduleCmp", ComponentDef.class))
                .thenReturn(cmpDesc);
        when(mockDefinitionService.getDefDescriptor("namespace:moduleCmp", ModuleDef.class))
                .thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());
        moduleDefFileBundleBuilder.setConfigAdapter(mockConfigAdapter);
        moduleDefFileBundleBuilder.setDefinitionService(mockDefinitionService);

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", baseListFiles.length, sourceMap.size());
        assertEquals("incorrect base html entry", String.join(File.separator,"namespace","module-cmp","module-cmp.html"), sourceMap.get(module).getSystemId());
    }

    @Test
    public void testBundleNotMatchLibFile() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(true);

        File mockHtmlFile = mock(File.class);
        when(mockHtmlFile.exists()).thenReturn(false);

        File mockLibFile = mock(File.class);
        when(mockLibFile.exists()).thenReturn(true);

        File mockCmpFile = mock(File.class);
        when(mockCmpFile.exists()).thenReturn(false);

        File mockAppFile = mock(File.class);
        when(mockAppFile.exists()).thenReturn(false);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");
        doReturn(mockCmpFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".cmp");
        doReturn(mockAppFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".app");

        assertFalse("bundle containing .lib file should not match", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
    }

    @Test
    public void testBundleNotMatchCmp() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(true);

        File mockHtmlFile = mock(File.class);
        when(mockHtmlFile.exists()).thenReturn(false);

        File mockLibFile = mock(File.class);
        when(mockLibFile.exists()).thenReturn(false);

        File mockCmpFile = mock(File.class);
        when(mockCmpFile.exists()).thenReturn(true);

        File mockAppFile = mock(File.class);
        when(mockAppFile.exists()).thenReturn(false);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");
        doReturn(mockCmpFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".cmp");
        doReturn(mockAppFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".app");

        assertFalse("bundle containing .cmp file should not match", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
    }

    @Test
    public void testBundleNotMatchApp() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(true);

        File mockHtmlFile = mock(File.class);
        when(mockHtmlFile.exists()).thenReturn(false);

        File mockLibFile = mock(File.class);
        when(mockLibFile.exists()).thenReturn(false);

        File mockCmpFile = mock(File.class);
        when(mockCmpFile.exists()).thenReturn(false);

        File mockAppFile = mock(File.class);
        when(mockAppFile.exists()).thenReturn(true);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");
        doReturn(mockCmpFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".cmp");
        doReturn(mockAppFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".app");

        assertFalse("bundle containing .app file should not match", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
    }

    @Test
    public void testBundleMatch() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(true);

        File mockHtmlFile = mock(File.class);
        when(mockHtmlFile.exists()).thenReturn(true);

        File mockLibFile = mock(File.class);
        when(mockLibFile.exists()).thenReturn(false);

        File mockCmpFile = mock(File.class);
        when(mockCmpFile.exists()).thenReturn(false);

        File mockAppFile = mock(File.class);
        when(mockAppFile.exists()).thenReturn(false);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");
        doReturn(mockCmpFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".cmp");
        doReturn(mockAppFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".app");

        assertTrue("bundle should match", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
    }

    private void setupMockFile(File mock, File base, String fileName) throws IOException {
        String namespace = base.getParentFile().getName();
        String baseName = base.getName();
        String path = namespace + File.separator + baseName + File.separator + fileName;

        when(mock.exists()).thenReturn(true);
        when(mock.getCanonicalPath()).thenReturn(path);
        when(mock.lastModified()).thenReturn(1L);
        when(mock.getName()).thenReturn(fileName);
        when(mock.isDirectory()).thenReturn(false);
    }
}