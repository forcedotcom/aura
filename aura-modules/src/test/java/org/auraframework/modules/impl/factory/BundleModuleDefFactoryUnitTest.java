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
package org.auraframework.modules.impl.factory;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.anyMap;
import static org.mockito.Matchers.anyString;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.validation.ReferenceValidationContextImpl;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.metadata.ModulesMetadataServiceImpl;
import org.auraframework.modules.impl.metadata.xml.ExposeElementHandler;
import org.auraframework.modules.impl.metadata.xml.MinApiVersionElementHandler;
import org.auraframework.modules.impl.metadata.xml.ModuleMetadataXMLHandler;
import org.auraframework.modules.impl.metadata.xml.RequireLockerElementHandler;
import org.auraframework.modules.impl.metadata.xml.TagsElementHandler;
import org.auraframework.service.ContextService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;


/**
 * Unit tests for {@link BundleModuleDefFactory}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({BundleModuleDefFactory.class, Aura.class})
@SuppressWarnings({"unchecked"})
public class BundleModuleDefFactoryUnitTest {

    @Test
    public void testGetDefinition() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        FileSource<ModuleDef> jsonFileSource = mock(FileSource.class);
        when(jsonFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","lightning.json"));
        when(jsonFileSource.getContents()).thenReturn("{ description: 'hello there', expose: 'true', minVersion: '12.3' }");

        String xml =
                "<LightningComponentBundle>\n" +
                    "<isExposed>true</isExposed>\n" +
                    "<minApiVersion>12.3</minApiVersion>\n" +
                    "<requireLocker>true</requireLocker>\n" +
                    "<tags>\n" +
                    "   <tag>random__tag</tag>\n" +
                    "   <tag>bob__tag</tag>\n" +
                    "   <tag>home__tag</tag>\n" +
                    "</tags>\n" +
                "</LightningComponentBundle>";
        FileSource<ModuleDef> xmlMetadataFileSource = mock(FileSource.class);
        when(xmlMetadataFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.js-meta.xml"));
        when(xmlMetadataFileSource.getContents()).thenReturn(xml);

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);
        DefDescriptor<ModuleDef> json = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_FILE_BASENAME, ModuleDef.class, module);
        DefDescriptor<ModuleDef> xmlMetadata = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_XML_NAME, ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);
        // TODO: remove json metadata
        mockBundledParts.put(json, jsonFileSource);
        mockBundledParts.put(xmlMetadata, xmlMetadataFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        String mockCompiled = "define()";
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, mockCompiled);
        codeMap.put(CodeType.PROD, mockCompiled);
        codeMap.put(CodeType.COMPAT, mockCompiled);
        codeMap.put(CodeType.PROD_COMPAT, mockCompiled);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        ModulesCompilerData compilerData = new ModulesCompilerData(codeMap, Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet("prop1", "prop2", "prop3"), Sets.newHashSet());
        when(mockCompiler.compile(anyString(), anyMap())).thenReturn(compilerData);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesCompilerService(mockCompiler);

        List<ModuleMetadataXMLHandler> xmlHandlers = new ArrayList<>();
        xmlHandlers.add(new TagsElementHandler());
        xmlHandlers.add(new ExposeElementHandler());
        xmlHandlers.add(new MinApiVersionElementHandler());
        xmlHandlers.add(new RequireLockerElementHandler());
        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);
        moduleDefFactory.setModulesMetadataService(modulesMetadataService);

        ModuleDef moduleDef = moduleDefFactory.getDefinition(module, mockBundleSource);
        String devCode = moduleDef.getCode(CodeType.DEV);
        String prodCode = moduleDef.getCode(CodeType.PROD);
        String compatCode = moduleDef.getCode(CodeType.COMPAT);
        assertTrue("dev code should be wrapped in function and calls $A.componentService.addModule",
                devCode.startsWith("function() { $A.componentService.addModule("));
        assertTrue("dev code should end with closing bracket and not semicolon for locker perf",
                devCode.endsWith("}"));
        assertTrue("prod code should be wrapped in function and calls $A.componentService.addModule",
                prodCode.startsWith("function() { $A.componentService.addModule("));
        assertTrue("compat code should be wrapped in function",
                compatCode.startsWith("function() { "));
        assertNotNull("ownHash should not be null", moduleDef.getOwnHash());

        assertEquals("minVersion from json file is different", new Double(12.3), moduleDef.getMinVersion());
        assertTrue("access should be global with json file", moduleDef.getAccess().isGlobal());

        Collection<AttributeDef> attributes = moduleDef.getAttributeDefs().values();
        assertEquals("Module should have 3 attributes", 3, attributes.size());
    }

    @Test
    public void testNamespaceFolderWithHyphen() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","name-space","module-cmp","moduleCmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","name-space","module-cmp","moduleCmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "name-space", "modulecmp-moduleCmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesMetadataService(new ModulesMetadataServiceImpl());

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to bad naming convention for modules");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("Namespace cannot have a hyphen."));
        }
    }

    @Test
    public void testNamespaceFolderUpperCase() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","nameSpace","module-cmp","moduleCmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","nameSpace","module-cmp","moduleCmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        FileSource<ModuleDef> jsonFileSource = mock(FileSource.class);
        when(jsonFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","nameSpace","module-cmp","lightning.json"));
        when(jsonFileSource.getContents()).thenReturn("{ description: 'hello there', expose: 'true', minVersion: '12.3' }");

        String xml =
                "<LightningComponentBundle>\n" +
                    "<isExposed>true</isExposed>\n" +
                    "<minApiVersion>12.3</minApiVersion>\n" +
                    "<requireLocker>true</requireLocker>\n" +
                    "<tags>\n" +
                    "   <tag>random__tag</tag>\n" +
                    "   <tag>bob__tag</tag>\n" +
                    "   <tag>home__tag</tag>\n" +
                    "</tags>\n" +
                "</LightningComponentBundle>";
        FileSource<ModuleDef> xmlMetadataFileSource = mock(FileSource.class);
        when(xmlMetadataFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","nameSpace","module-cmp","module-cmp.js-meta.xml"));
        when(xmlMetadataFileSource.getContents()).thenReturn(xml);

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "modulecmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "modulecmp-moduleCmp", ModuleDef.class, module);
        DefDescriptor<ModuleDef> json = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_FILE_BASENAME, ModuleDef.class, module);
        DefDescriptor<ModuleDef> xmlMetadata = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, "nameSpace", "moduleCmp-" + ModuleDef.META_XML_NAME, ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);
        // TODO: remove json metadata
        mockBundledParts.put(json, jsonFileSource);
        mockBundledParts.put(xmlMetadata, xmlMetadataFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        String mockCompiled = "define()";
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, mockCompiled);
        codeMap.put(CodeType.PROD, mockCompiled);
        codeMap.put(CodeType.COMPAT, mockCompiled);
        codeMap.put(CodeType.PROD_COMPAT, mockCompiled);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        ModulesCompilerData compilerData = new ModulesCompilerData(codeMap, Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet("prop1", "prop2", "prop3"), Sets.newHashSet());
        when(mockCompiler.compile(anyString(), anyMap())).thenReturn(compilerData);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesCompilerService(mockCompiler);

        List<ModuleMetadataXMLHandler> xmlHandlers = new ArrayList<>();
        xmlHandlers.add(new TagsElementHandler());
        xmlHandlers.add(new ExposeElementHandler());
        xmlHandlers.add(new MinApiVersionElementHandler());
        xmlHandlers.add(new RequireLockerElementHandler());
        ModulesMetadataServiceImpl modulesMetadataService = new ModulesMetadataServiceImpl();
        modulesMetadataService.setModuleXMLHandlers(xmlHandlers);
        moduleDefFactory.setModulesMetadataService(modulesMetadataService);

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
        } catch (InvalidDefinitionException ide) {
            fail("Should not have thrown InvalidDefinitionException due to usage of uppercase in module folder name");
        }
    }

    @Test
    public void testNameFolderUpperCase() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-Cmp","module-Cmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-Cmp","module-Cmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "modulecmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "namespace", "modulecmp-moduleCmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesMetadataService(new ModulesMetadataServiceImpl());

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to bad naming convention for modules");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("Use lowercase and hyphens for module file names."));
        }
    }

    @Test
    public void testMissingModeCode() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        String mockCompiled = "define()";
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, mockCompiled);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        ModulesCompilerData compilerData = new ModulesCompilerData(codeMap, Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet());
        when(mockCompiler.compile(anyString(), anyMap())).thenReturn(compilerData);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesCompilerService(mockCompiler);
        moduleDefFactory.setModulesMetadataService(new ModulesMetadataServiceImpl());

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to missing code for PROD");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("PROD compiled code not found"));
        }
    }

    @Test
    public void testValidateLabels() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource<ModuleDef> jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.js"));
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource<ModuleDef> htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn(String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp","module-cmp.html"));
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        String mockCompiled = "define()";
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, mockCompiled);
        codeMap.put(CodeType.PROD, mockCompiled);
        codeMap.put(CodeType.COMPAT, mockCompiled);
        codeMap.put(CodeType.PROD_COMPAT, mockCompiled);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        ModulesCompilerData compilerData = new ModulesCompilerData(codeMap, Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet());
        when(mockCompiler.compile(anyString(), anyMap())).thenReturn(compilerData);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesCompilerService(mockCompiler);
        moduleDefFactory.setModulesMetadataService(new ModulesMetadataServiceImpl());

        ContextService mockContextService = mock(ContextService.class);
        AuraContext mockAuraContext = mock(AuraContext.class);
        GlobalValueProvider mockLabelProvider = mock(GlobalValueProvider.class);
        when(mockLabelProvider.getValueProviderKey()).thenReturn(AuraValueProviderType.LABEL);

        Map<String, GlobalValueProvider> mockGVPs = Maps.newHashMap();
        mockGVPs.put(AuraValueProviderType.LABEL.getPrefix(), mockLabelProvider);

        mockStatic(Aura.class);
        when(Aura.getContextService()).thenReturn(mockContextService);
        when(mockContextService.getCurrentContext()).thenReturn(mockAuraContext);
        when(mockAuraContext.getGlobalProviders()).thenReturn(mockGVPs);

        ReferenceValidationContext validationContext = new ReferenceValidationContextImpl(Maps.newHashMap());
        ModuleDef moduleDef = moduleDefFactory.getDefinition(module, mockBundleSource);
        moduleDef.validateReferences(validationContext);

        assertTrue("access should be public without json file", moduleDef.getAccess().isPublic());
    }
}
