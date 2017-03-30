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
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
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
        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);

        File mockCssFile = mock(File.class);
        setupMockFile(mockCssFile, mockBaseFile, "module.css");
        DefDescriptor css = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, "nameSpace", "moduleCmp-module", ModuleDef.class, module);

        File mockTemplateFile = mock(File.class);
        setupMockFile(mockTemplateFile, mockBaseFile, "module-cmp.html");
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockUtilJsFile = mock(File.class);
        setupMockFile(mockUtilJsFile, mockBaseFile, "utils.js");
        DefDescriptor utilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-utils", ModuleDef.class, module);

        File mockDataJsFile = mock(File.class);
        setupMockFile(mockDataJsFile, mockBaseFile, "data.js");
        DefDescriptor dataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-data", ModuleDef.class, module);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile };

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
        assertEquals("incorrect base js entry", "/namespace/module-cmp/module-cmp.js", sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", "/namespace/module-cmp/module.css", sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", "/namespace/module-cmp/module-cmp.html", sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", "/namespace/module-cmp/utils.js",  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", "/namespace/module-cmp/data.js", sourceMap.get(dataJs).getSystemId());
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
        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);

        File mockCssFile = mock(File.class);
        setupMockFile(mockCssFile, mockBaseFile, "module.css");
        DefDescriptor css = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, "nameSpace", "moduleCmp-module", ModuleDef.class, module);

        File mockTemplateFile = mock(File.class);
        setupMockFile(mockTemplateFile, mockBaseFile, "module-cmp.html");
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        File mockUtilJsFile = mock(File.class);
        setupMockFile(mockUtilJsFile, mockBaseFile, "utils.js");
        DefDescriptor utilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-utils", ModuleDef.class, module);

        File mockDataJsFile = mock(File.class);
        setupMockFile(mockDataJsFile, mockBaseFile, "data.js");
        DefDescriptor dataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-data", ModuleDef.class, module);

        // NESTED

        File mockNestFolder = mock(File.class);
        when(mockNestFolder.isDirectory()).thenReturn(true);
        when(mockNestFolder.getName()).thenReturn("nest");
        when(mockNestFolder.getParentFile()).thenReturn(mockBaseFile);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile, mockNestFolder };

        File mockNestUtilJsFile = mock(File.class);
        setupMockFile(mockNestUtilJsFile, mockBaseFile, "nest/utils.js");
        when(mockNestUtilJsFile.getParent()).thenReturn("nest");
        when(mockNestUtilJsFile.getParentFile()).thenReturn(mockNestFolder);
        DefDescriptor nestedUtilJs =  new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-utils", ModuleDef.class, module);

        File mockNestDataJsFile = mock(File.class);
        setupMockFile(mockNestDataJsFile, mockBaseFile, "nest/data.js");
        when(mockNestDataJsFile.getParent()).thenReturn("nest");
        when(mockNestDataJsFile.getParentFile()).thenReturn(mockNestFolder);
        DefDescriptor nestedDataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-data", ModuleDef.class, module);

        // SECOND NESTED

        File mockSecondNestFolder = mock(File.class);
        when(mockSecondNestFolder.isDirectory()).thenReturn(true);
        when(mockSecondNestFolder.getName()).thenReturn("egg");
        when(mockSecondNestFolder.getParentFile()).thenReturn(mockNestFolder);

        File[] nestListFiles = new File[] { mockNestUtilJsFile, mockNestDataJsFile, mockSecondNestFolder };

        File mockSecondNestUtilJsFile = mock(File.class);
        setupMockFile(mockSecondNestUtilJsFile, mockBaseFile, "nest/egg/utils.js");
        when(mockSecondNestUtilJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestUtilJsFile.getParentFile()).thenReturn(mockSecondNestFolder);
        DefDescriptor secondNestedUtilJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-utils", ModuleDef.class, module);

        File mockSecondNestDataJsFile = mock(File.class);
        setupMockFile(mockSecondNestDataJsFile, mockBaseFile, "nest/egg/data.js");
        when(mockSecondNestDataJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestDataJsFile.getParentFile()).thenReturn(mockSecondNestFolder);
        DefDescriptor secondNestedDataJs = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-data", ModuleDef.class, module);

        File[] secondNestListFiles = new File[] { mockSecondNestUtilJsFile, mockSecondNestDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);
        when(mockNestFolder.listFiles()).thenReturn(nestListFiles);
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
        assertEquals("incorrect base js entry", "/namespace/module-cmp/module-cmp.js", sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", "/namespace/module-cmp/module.css", sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", "/namespace/module-cmp/module-cmp.html", sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", "/namespace/module-cmp/utils.js",  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", "/namespace/module-cmp/data.js", sourceMap.get(dataJs).getSystemId());
        assertEquals("incorrect nested utils js entry", "/namespace/module-cmp/nest/utils.js",  sourceMap.get(nestedUtilJs).getSystemId());
        assertEquals("incorrect nested data js entry", "/namespace/module-cmp/nest/data.js", sourceMap.get(nestedDataJs).getSystemId());
        assertEquals("incorrect second nested utils js entry", "/namespace/module-cmp/nest/egg/utils.js",  sourceMap.get(secondNestedUtilJs).getSystemId());
        assertEquals("incorrect second nested data js entry", "/namespace/module-cmp/nest/egg/data.js", sourceMap.get(secondNestedDataJs).getSystemId());
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
        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "moduleCmp", ModuleDef.class);

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
        assertEquals("incorrect base html entry", "/namespace/module-cmp/module-cmp.html", sourceMap.get(module).getSystemId());
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

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");

        assertFalse("bundle containing .lib file should not match", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
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

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");

        assertTrue("bundle should match without .lib file", moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile));
    }

    @Test
    public void testBundleNoUppercase() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("nameSpace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("moduleCmp");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(true);

        File mockHtmlFile = mock(File.class);
        when(mockHtmlFile.exists()).thenReturn(true);

        File mockLibFile = mock(File.class);
        when(mockLibFile.exists()).thenReturn(false);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");

        try {
            moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile);
            fail("Should have thrown AuraRuntimeException for camel case names");
        } catch(AuraRuntimeException are) {
            assertTrue("Error should indicate lower case names", are.getMessage().contains("Use lowercase"));
        }
    }

    @Test
    public void testBundleNamespaceNoHyphen() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("name-space");

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

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");
        doReturn(mockLibFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".lib");

        try {
            moduleDefFileBundleBuilder.isBundleMatch(mockBaseFile);
            fail("Should have thrown AuraRuntimeException for hyphen in namesapce");
        } catch(AuraRuntimeException are) {
            assertTrue("Error should indicate lower case names", are.getMessage().contains("Namespace cannot have a hyphen."));
        }
    }

    private void setupMockFile(File mock, File base, String fileName) throws IOException {
        String namespace = base.getParentFile().getName();
        String baseName = base.getName();
        String path = "/" + namespace + "/" + baseName + "/" + fileName;

        when(mock.exists()).thenReturn(true);
        when(mock.getCanonicalPath()).thenReturn(path);
        when(mock.lastModified()).thenReturn(1L);
        when(mock.getName()).thenReturn(fileName);
        when(mock.isDirectory()).thenReturn(false);
    }
}