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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.*;

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
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        DefDescriptor module = setupMockFile(mockJsFile, mockBaseFile, "module", ".js",
                // root js will be THE default markup://namespace:module DefDescriptor
                DefDescriptor.MARKUP_PREFIX, null);

        File mockCssFile = mock(File.class);
        DefDescriptor css = setupMockFile(mockCssFile, mockBaseFile, "module", ".css",
                DefDescriptor.CSS_PREFIX, module);

        File mockTemplateFile = mock(File.class);
        DefDescriptor template = setupMockFile(mockTemplateFile, mockBaseFile, "module", ".html",
                ModuleDef.TEMPLATE_PREFIX, module);

        File mockUtilJsFile = mock(File.class);
        DefDescriptor utilJs = setupMockFile(mockUtilJsFile, mockBaseFile, "utils", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);

        File mockDataJsFile = mock(File.class);
        DefDescriptor dataJs = setupMockFile(mockDataJsFile, mockBaseFile, "data", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockTemplateFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", baseListFiles.length, sourceMap.size());
        assertEquals("incorrect base js entry", "/namespace/module/module.js", sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", "/namespace/module/module.css", sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", "/namespace/module/module.html", sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", "/namespace/module/utils.js",  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", "/namespace/module/data.js", sourceMap.get(dataJs).getSystemId());
    }

    @Test
    public void testNestedBundle() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        // ROOT LEVEL

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockJsFile = mock(File.class);
        DefDescriptor module = setupMockFile(mockJsFile, mockBaseFile, "module", ".js",
                // root js will be THE default markup://namespace:module DefDescriptor
                DefDescriptor.MARKUP_PREFIX, null);

        File mockCssFile = mock(File.class);
        DefDescriptor css = setupMockFile(mockCssFile, mockBaseFile, "module", ".css",
                DefDescriptor.CSS_PREFIX, module);

        File mockTemplateFile = mock(File.class);
        DefDescriptor template = setupMockFile(mockTemplateFile, mockBaseFile, "module", ".html",
                ModuleDef.TEMPLATE_PREFIX, module);

        File mockUtilJsFile = mock(File.class);
        DefDescriptor utilJs = setupMockFile(mockUtilJsFile, mockBaseFile, "utils", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);

        File mockDataJsFile = mock(File.class);
        DefDescriptor dataJs = setupMockFile(mockDataJsFile, mockBaseFile, "data", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);

        // NESTED

        File mockNestFolder = mock(File.class);
        when(mockNestFolder.isDirectory()).thenReturn(true);
        when(mockNestFolder.getName()).thenReturn("nest");
        when(mockNestFolder.getParentFile()).thenReturn(mockBaseFile);

        File[] baseListFiles = new File[] { mockJsFile, mockCssFile, mockTemplateFile, mockUtilJsFile, mockDataJsFile, mockNestFolder };

        File mockNestUtilJsFile = mock(File.class);
        DefDescriptor nestedUtilJs = setupMockFile(mockNestUtilJsFile, mockBaseFile, "nest/utils", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);
        when(mockNestUtilJsFile.getParent()).thenReturn("nest");
        when(mockNestUtilJsFile.getParentFile()).thenReturn(mockNestFolder);

        File mockNestDataJsFile = mock(File.class);
        DefDescriptor nestedDataJs = setupMockFile(mockNestDataJsFile, mockBaseFile, "nest/data", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);
        when(mockNestDataJsFile.getParent()).thenReturn("nest");
        when(mockNestDataJsFile.getParentFile()).thenReturn(mockNestFolder);

        // SECOND NESTED

        File mockSecondNestFolder = mock(File.class);
        when(mockSecondNestFolder.isDirectory()).thenReturn(true);
        when(mockSecondNestFolder.getName()).thenReturn("egg");
        when(mockSecondNestFolder.getParentFile()).thenReturn(mockNestFolder);

        File[] nestListFiles = new File[] { mockNestUtilJsFile, mockNestDataJsFile, mockSecondNestFolder };

        File mockSecondNestUtilJsFile = mock(File.class);
        DefDescriptor secondNestedUtilJs = setupMockFile(mockSecondNestUtilJsFile, mockBaseFile, "nest/egg/utils", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);
        when(mockSecondNestUtilJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestUtilJsFile.getParentFile()).thenReturn(mockSecondNestFolder);

        File mockSecondNestDataJsFile = mock(File.class);
        DefDescriptor secondNestedDataJs = setupMockFile(mockSecondNestDataJsFile, mockBaseFile, "nest/egg/data", ".js",
                DefDescriptor.JAVASCRIPT_PREFIX, module);
        when(mockSecondNestDataJsFile.getParent()).thenReturn("egg");
        when(mockSecondNestDataJsFile.getParentFile()).thenReturn(mockSecondNestFolder);

        File[] secondNestListFiles = new File[] { mockSecondNestUtilJsFile, mockSecondNestDataJsFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);
        when(mockNestFolder.listFiles()).thenReturn(nestListFiles);
        when(mockSecondNestFolder.listFiles()).thenReturn(secondNestListFiles);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockTemplateFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", 9, sourceMap.size());
        assertEquals("incorrect base js entry", "/namespace/module/module.js", sourceMap.get(module).getSystemId());
        assertEquals("incorrect base css entry", "/namespace/module/module.css", sourceMap.get(css).getSystemId());
        assertEquals("incorrect base template entry", "/namespace/module/module.html", sourceMap.get(template).getSystemId());
        assertEquals("incorrect base utils js entry", "/namespace/module/utils.js",  sourceMap.get(utilJs).getSystemId());
        assertEquals("incorrect base data js entry", "/namespace/module/data.js", sourceMap.get(dataJs).getSystemId());
        assertEquals("incorrect nested utils js entry", "/namespace/module/nest/utils.js",  sourceMap.get(nestedUtilJs).getSystemId());
        assertEquals("incorrect nested data js entry", "/namespace/module/nest/data.js", sourceMap.get(nestedDataJs).getSystemId());
        assertEquals("incorrect second nested utils js entry", "/namespace/module/nest/egg/utils.js",  sourceMap.get(secondNestedUtilJs).getSystemId());
        assertEquals("incorrect second nested data js entry", "/namespace/module/nest/egg/data.js", sourceMap.get(secondNestedDataJs).getSystemId());
    }

    @Test
    public void testBundleWithHtmlOnly() throws Exception {

        File mockParentBaseFile = mock(File.class);
        when(mockParentBaseFile.getName()).thenReturn("namespace");

        File mockBaseFile = mock(File.class);
        when(mockBaseFile.exists()).thenReturn(true);
        when(mockBaseFile.getName()).thenReturn("module");
        when(mockBaseFile.getParentFile()).thenReturn(mockParentBaseFile);

        File mockHtmlFile = mock(File.class);
        DefDescriptor module = setupMockFile(mockHtmlFile, mockBaseFile, "module", ".html",
                // root html will be THE markup://namespace:module DefDescriptor when .js of the same name is not present
                DefDescriptor.MARKUP_PREFIX, null);

        File mockJsFile = mock(File.class);
        when(mockJsFile.exists()).thenReturn(false);

        File[] baseListFiles = new File[] { mockHtmlFile };

        when(mockBaseFile.listFiles()).thenReturn(baseListFiles);

        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = spy(new ModuleDefFileBundleBuilder());

        doReturn(mockJsFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".js");
        doReturn(mockHtmlFile).when(moduleDefFileBundleBuilder, "getFileFromBase", mockBaseFile, ".html");

        BundleSource<?> moduleBundleSource = moduleDefFileBundleBuilder.buildBundle(mockBaseFile);

        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", baseListFiles.length, sourceMap.size());
        assertEquals("incorrect base html entry", "/namespace/module/module.html", sourceMap.get(module).getSystemId());
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

    private DefDescriptor setupMockFile(File mock, File base, String name, String extension, String prefix,
                                        DefDescriptor parent) throws IOException {
        String fileName = name + extension;
        String namespace = base.getParentFile().getName();
        String baseName = base.getName();
        String path = "/" + namespace + "/" + baseName + "/" + fileName;

        String descriptorName = parent == null ? baseName : baseName + "-" + String.join("-", name.split("/"));

        when(mock.exists()).thenReturn(true);
        when(mock.getCanonicalPath()).thenReturn(path);
        when(mock.lastModified()).thenReturn(1L);
        when(mock.getName()).thenReturn(fileName);
        when(mock.isDirectory()).thenReturn(false);

        return new DefDescriptorImpl<>(prefix, namespace, descriptorName, ModuleDef.class, parent);
    }
}