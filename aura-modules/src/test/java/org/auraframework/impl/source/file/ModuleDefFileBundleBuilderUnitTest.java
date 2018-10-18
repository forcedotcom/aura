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

import static org.auraframework.def.DefDescriptor.CSS_PREFIX;
import static org.auraframework.def.DefDescriptor.JAVASCRIPT_PREFIX;
import static org.auraframework.def.DefDescriptor.MARKUP_PREFIX;
import static org.auraframework.def.module.ModuleDef.MARKDOWN_PREFIX;
import static org.auraframework.def.module.ModuleDef.META_FILE_BASENAME;
import static org.auraframework.def.module.ModuleDef.META_PREFIX;
import static org.auraframework.def.module.ModuleDef.META_XML_NAME;
import static org.auraframework.def.module.ModuleDef.TEMPLATE_PREFIX;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.when;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.rules.TemporaryFolder;

import com.google.common.base.Joiner;
import com.google.common.collect.Maps;

/**
 * Unit tests for {@link ModuleDefFileBundleBuilder}
 */
public class ModuleDefFileBundleBuilderUnitTest {    
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();
    
    @Rule
    public ExpectedException exception = ExpectedException.none();

    private File createFile(File bundleDir, String... nameParts) throws IOException {
        bundleDir.mkdirs();
        File file = new File(bundleDir, Joiner.on("").join(nameParts));
        file.createNewFile();
        return file;
    }

    @Test
    public void testBasicBundle() throws Exception {
        String namespace = "namespace";
        String bundleName = "moduleCmp";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        
        File jsFile = createFile(bundleDir, bundleName, ".js");
        File htmlFile = createFile(bundleDir, bundleName, ".html");
        File cssFile = createFile(bundleDir, bundleName, ".css");
        File utilsJsFile = createFile(bundleDir, "utils.js");
        File dataJsFile = createFile(bundleDir, "data.js");
        File lightningFile = createFile(bundleDir, "lightning.json");
        File metaFile = createFile(bundleDir, bundleName, ".js-meta.xml");
        
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX,
                "nameSpace", bundleName, ModuleDef.class);
        DefDescriptor<ModuleDef> cssDesc = new DefDescriptorImpl<>(CSS_PREFIX,
                "nameSpace", "moduleCmp-moduleCmp", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> templateDesc = new DefDescriptorImpl<>(TEMPLATE_PREFIX,
                "nameSpace", "moduleCmp-moduleCmp", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> utilJsDesc = new DefDescriptorImpl<>(JAVASCRIPT_PREFIX,
                "nameSpace", "moduleCmp-utils", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> dataJsDesc = new DefDescriptorImpl<>(JAVASCRIPT_PREFIX,
                "nameSpace", "moduleCmp-data", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> jsonDesc = new DefDescriptorImpl<>(META_PREFIX,
                "nameSpace", "moduleCmp-" + META_FILE_BASENAME, ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> metaDesc = new DefDescriptorImpl<>(META_PREFIX,
                "nameSpace", "moduleCmp-" + META_XML_NAME, ModuleDef.class, moduleDesc);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", 7, sourceMap.size());       
        assertEquals("incorrect base js entry", jsFile.getCanonicalPath(), sourceMap.get(moduleDesc).getSystemId());
        assertEquals("incorrect base css entry", cssFile.getCanonicalPath(), sourceMap.get(cssDesc).getSystemId());
        assertEquals("incorrect base template entry", htmlFile.getCanonicalPath(), sourceMap.get(templateDesc).getSystemId());
        assertEquals("incorrect base utils js entry", utilsJsFile.getCanonicalPath(),  sourceMap.get(utilJsDesc).getSystemId());
        assertEquals("incorrect base data js entry", dataJsFile.getCanonicalPath(), sourceMap.get(dataJsDesc).getSystemId());
        assertEquals("incorrect base json entry", lightningFile.getCanonicalPath(), sourceMap.get(jsonDesc).getSystemId());
        assertEquals("incorrect base meta xml entry", metaFile.getCanonicalPath(), sourceMap.get(metaDesc).getSystemId());
    }

    @Test
    public void testNestedBundle() throws Exception {
        String namespace = "namespace";
        String bundleName = "moduleCmp";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        
        File jsFile = createFile(bundleDir, bundleName, ".js");
        File htmlFile = createFile(bundleDir, bundleName, ".html");
        File cssFile = createFile(bundleDir, bundleName, ".css");
        File utilsJsFile = createFile(bundleDir, "utils.js");
        File dataJsFile = createFile(bundleDir, "data.js");
        
        // first nested
        File nestedDir = new File(bundleDir, "nest");
        File nestedUtilsJsFile = createFile(nestedDir, "utils.js");
        File nestedDataJsFile = createFile(nestedDir, "data.js");

        // __tests__ (ignored)
        File testsDir = new File(bundleDir, "__tests__");
        createFile(testsDir, "test.test.js");
        
        // second nested
        File secondNestedDir = new File(nestedDir, "egg");
        File secondNestedUtilsJsFile = createFile(secondNestedDir, "utils.js");
        File secondNestedDataJsFile = createFile(secondNestedDir, "data.js");
        
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(
                MARKUP_PREFIX, "nameSpace", bundleName, ModuleDef.class);
        DefDescriptor<ModuleDef> cssDesc = new DefDescriptorImpl<>(
                CSS_PREFIX, "nameSpace", "moduleCmp-moduleCmp", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> templateDesc = new DefDescriptorImpl<>(
                TEMPLATE_PREFIX, "nameSpace", "moduleCmp-moduleCmp", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> utilJsDesc = new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-utils", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> dataJsDesc = new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-data", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> nestedUtilJsDesc =  new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-utils", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> nestedDataJsDesc = new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-data", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> secondNestedUtilJsDesc = new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-utils", ModuleDef.class, moduleDesc);
        DefDescriptor<ModuleDef> secondNestedDataJsDesc = new DefDescriptorImpl<>(
                JAVASCRIPT_PREFIX, "nameSpace", "moduleCmp-nest-egg-data", ModuleDef.class, moduleDesc);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefDescriptor<ComponentDef> cmpDesc = new DefDescriptorImpl<>(
                MARKUP_PREFIX, "nameSpace", "moduleCmp", ComponentDef.class);
        DefinitionService mockDefService = mock(DefinitionService.class);        
        when(mockDefService.getDefDescriptor("nameSpace:moduleCmp", ComponentDef.class)).thenReturn(cmpDesc);
        when(mockDefService.getDefDescriptor("nameSpace:moduleCmp", ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", 9, sourceMap.size());
        assertEquals("incorrect base js entry", jsFile.getCanonicalPath(), sourceMap.get(moduleDesc).getSystemId());
        assertEquals("incorrect base css entry", cssFile.getCanonicalPath(), sourceMap.get(cssDesc).getSystemId());
        assertEquals("incorrect base template entry", htmlFile.getCanonicalPath(), sourceMap.get(templateDesc).getSystemId());
        assertEquals("incorrect base utils js entry", utilsJsFile.getCanonicalPath(),  sourceMap.get(utilJsDesc).getSystemId());
        assertEquals("incorrect base data js entry", dataJsFile.getCanonicalPath(), sourceMap.get(dataJsDesc).getSystemId());
        assertEquals("incorrect nested utils js entry", nestedUtilsJsFile.getCanonicalPath(),  sourceMap.get(nestedUtilJsDesc).getSystemId());
        assertEquals("incorrect nested data js entry", nestedDataJsFile.getCanonicalPath(), sourceMap.get(nestedDataJsDesc).getSystemId());
        assertEquals("incorrect second nested utils js entry", secondNestedUtilsJsFile.getCanonicalPath(),  sourceMap.get(secondNestedUtilJsDesc).getSystemId());
        assertEquals("incorrect second nested data js entry", secondNestedDataJsFile.getCanonicalPath(), sourceMap.get(secondNestedDataJsDesc).getSystemId());
    }

    @Test
    public void testBundleWithHtmlOnly() throws Exception {
        String namespace = "namespace";
        String bundleName = "moduleCmp";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);        
        File htmlFile = createFile(bundleDir, bundleName, ".html");
        
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX,
                "nameSpace", bundleName, ModuleDef.class);
        
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        assertEquals("number of entries for module bundle source differs", 1, sourceMap.size());       
        assertEquals("incorrect base html entry", htmlFile.getCanonicalPath(), sourceMap.get(moduleDesc).getSystemId());
    }

    @Test
    public void testBundleNotMatchLibFile() throws Exception {
        String namespace = "namespace";
        String bundleName = "module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".lib");
        
        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = new ModuleDefFileBundleBuilder();

        assertFalse("bundle containing .lib file should not match", moduleDefFileBundleBuilder.isBundleMatch(bundleDir));
    }

    @Test
    public void testBundleNotMatchCmp() throws Exception {
        String namespace = "namespace";
        String bundleName = "module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".cmp");
               
        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = new ModuleDefFileBundleBuilder();

        assertFalse("bundle containing .cmp file should not match", moduleDefFileBundleBuilder.isBundleMatch(bundleDir));
    }

    @Test
    public void testBundleNotMatchApp() throws Exception {
        String namespace = "namespace";
        String bundleName = "module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".app");
               
        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = new ModuleDefFileBundleBuilder();

        assertFalse("bundle containing .app file should not match", moduleDefFileBundleBuilder.isBundleMatch(bundleDir));
    }

    @Test
    public void testBundleMatch() throws Exception {
        String namespace = "namespace";
        String bundleName = "module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".html");
        
        ModuleDefFileBundleBuilder moduleDefFileBundleBuilder = new ModuleDefFileBundleBuilder();

        assertTrue("bundle should match", moduleDefFileBundleBuilder.isBundleMatch(bundleDir));
    }

    @Test
    public void testMarkdownFile() throws Exception {
        String namespace = "namespace";
        String bundleName = "moduleCmp";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".html");
        
        File nestedDir = new File(bundleDir, "__docs__");
        File markdownFile = createFile(nestedDir, bundleName, ".md");
        createFile(nestedDir, bundleName, ".auradoc");
        
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, 
                "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(MARKDOWN_PREFIX, 
                "nameSpace", "moduleCmp-__docs__-moduleCmp", DocumentationDef.class, moduleDesc);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        Source<?> markdownSource = sourceMap.get(markdownDesc);
        assertNotNull("did not find markdown source", markdownSource);
        
        String expectedSystemId = markdownFile.getCanonicalPath();
        String actualSystemId = markdownSource.getSystemId();
        assertEquals("incorrect systemId for markdown source", expectedSystemId, actualSystemId);

        Format expectedFormat = Format.MD;
        Format actualFormat = markdownSource.getFormat();              
        assertEquals("incorrect format for markdown source", expectedFormat, actualFormat);
    }
    
    @Test
    public void testAuradocFile() throws Exception {
        String namespace = "namespace";
        String bundleName = "moduleCmp";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".html");
        
        File nestedDir = new File(bundleDir, "__docs__");
        createFile(nestedDir, bundleName, ".md");
        File auradocFile = createFile(nestedDir, bundleName, ".auradoc");
        
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, 
                "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<DocumentationDef> auradocDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, 
                "nameSpace", "moduleCmp-__docs__-moduleCmp", DocumentationDef.class, moduleDesc);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        Map<String, String> mockInternalNamespaces = Maps.newHashMap();
        mockInternalNamespaces.put("namespace", "nameSpace");
        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(mockInternalNamespaces);

        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();

        Source<?> auradocSource = sourceMap.get(auradocDesc);
        assertNotNull("did not find auradoc source", auradocSource);
        
        String expectedSystemId = auradocFile.getCanonicalPath();
        String actualSystemId = auradocSource.getSystemId();
        assertEquals("incorrect systemId for auradoc source", expectedSystemId, actualSystemId);

        Format expectedFormat = Format.XML;
        Format actualFormat = auradocSource.getFormat();              
        assertEquals("incorrect format for auradoc source", expectedFormat, actualFormat);
    }

    @Test
    public void testSvg() throws Exception {
        String namespace = "namespace";
        String bundleName = "hasSvg";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        File svgFile = createFile(bundleDir, bundleName, ".svg");
       
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, ModuleDef.class);
        DefDescriptor<SVGDef> svgDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, SVGDef.class);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        BundleSource<?> moduleBundleSource = bundleBuilder.buildBundle(bundleDir);
        Map<DefDescriptor<?>, Source<?>> sourceMap = moduleBundleSource.getBundledParts();
        
        Source<?> svgSource = sourceMap.get(svgDesc);
        assertNotNull("did not find svg source", svgSource);
        
        String expectedSystemId = svgFile.getCanonicalPath();
        String actualSystemId = svgSource.getSystemId();
        assertEquals("incorrect systemId for svg source", expectedSystemId, actualSystemId);

        Format expectedFormat = Format.SVG;
        Format actualFormat = svgSource.getFormat();              
        assertEquals("incorrect format for svg source", expectedFormat, actualFormat);
    }
    
    @Test
    public void testErrorsIfMisnamedSvg() throws Exception {
        String namespace = "namespace";
        String bundleName = "foo";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        File svgFile = createFile(bundleDir, bundleName + "o", ".svg");
       
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, ModuleDef.class);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        exception.expect(AuraRuntimeException.class);
        exception.expectMessage("Unexpected file");
        exception.expectMessage(svgFile.getPath());
        bundleBuilder.buildBundle(bundleDir);
    }
    
    @Test
    public void testErrorsIfExtraSvg() throws Exception {
        String namespace = "foo";
        String bundleName = "myModule";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        createFile(bundleDir, bundleName, ".svg");
        File extraSvg = createFile(bundleDir, "foo", ".svg");
       
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, ModuleDef.class);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        exception.expect(AuraRuntimeException.class);
        exception.expectMessage("Unexpected file");
        exception.expectMessage(extraSvg.getPath());
        bundleBuilder.buildBundle(bundleDir);
    }
    
    @Test
    public void testErrorsIfMisplacedSvg() throws Exception {
        String namespace = "my_namespace";
        String bundleName = "my_module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        
        File nestedDir = new File(bundleDir, "lib");        
        File svgFile = createFile(nestedDir, bundleName, ".svg");
       
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, ModuleDef.class);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        exception.expect(AuraRuntimeException.class);
        exception.expectMessage("Unexpected file");
        exception.expectMessage(svgFile.getPath());
        bundleBuilder.buildBundle(bundleDir);
    } 
    
    @Test
    public void testErrorsIfDisallowedSvg() throws Exception {
        String namespace = "namespace";
        String bundleName = "module";
               
        File namespaceDir = folder.newFolder(namespace);
        File bundleDir = new File(namespaceDir, bundleName);
        createFile(bundleDir, bundleName, ".js");
        
        File nestedDir = new File(bundleDir, "lib");        
        File svgFile = createFile(nestedDir, "foo", ".svg");
       
        DefDescriptor<ModuleDef> moduleDesc = new DefDescriptorImpl<>(MARKUP_PREFIX, namespace, bundleName, ModuleDef.class);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        DefinitionService mockDefService = mock(DefinitionService.class);
        when(mockDefService.getDefDescriptor(moduleDesc.getDescriptorName(), ModuleDef.class)).thenReturn(moduleDesc);

        ModuleDefFileBundleBuilder bundleBuilder = new ModuleDefFileBundleBuilder();
        bundleBuilder.setConfigAdapter(mockConfigAdapter);
        bundleBuilder.setDefinitionService(mockDefService);

        exception.expect(AuraRuntimeException.class);
        exception.expectMessage("Unexpected file");
        exception.expectMessage(svgFile.getPath());
        bundleBuilder.buildBundle(bundleDir);
    }  
}
