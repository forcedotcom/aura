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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyMap;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.same;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.MetaDef;
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
import org.auraframework.service.CompilerService;
import org.auraframework.service.ContextService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.lwc.CompilerReport;
import org.lwc.bundle.BundleType;
import org.lwc.classmember.ClassMember;
import org.lwc.classmember.MemberType;
import org.lwc.diagnostic.Diagnostic;
import org.lwc.diagnostic.DiagnosticLevel;
import org.lwc.documentation.BundleDocumentation;
import org.lwc.metadata.ReportMetadata;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;


/**
 * Unit tests for {@link BundleModuleDefFactory}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({BundleModuleDefFactory.class, Aura.class})
@SuppressWarnings({"unchecked"})
public class BundleModuleDefFactoryUnitTest {
    private FileSource<?> mockFile(String name) {
        return mockFile(name, "");
    }

    private FileSource<?> mockFile(String name, String contents) {
        String basePath = String.join(File.separator, "User", "me", "project", "src", "main", "modules", "namespace", "cmp");
        return mockFile(basePath, name, contents);
    }

    private FileSource<?> mockFile(String basePath, String name, String contents) {
        FileSource<?> mock = mock(FileSource.class);
        when(mock.getSystemId()).thenReturn(String.join(File.separator, basePath, name));
        when(mock.getContents()).thenReturn(contents);
        return mock;
    }

    private BundleSource<ModuleDef> mockBundleSource(Map<DefDescriptor<?>, Source<?>> bundledFiles) {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);
        when(mockBundleSource.getBundledParts()).thenReturn(bundledFiles);
        return mockBundleSource;
    }

    private Map<CodeType, String> mockCodeMap() {
        Map<CodeType, String> mockCodeMap = mock(EnumMap.class);
        when(mockCodeMap.get(any(CodeType.class))).thenReturn("define()");
        return mockCodeMap;
    }

    private ModulesCompilerService mockModulesCompilerService() throws Exception {
        CompilerReport compilerReport = new CompilerReport(true, "version", new ArrayList<>(), new ArrayList<>(),
                new ReportMetadata(null, null, null), null);
        return mockModulesCompilerService(compilerReport);
    }

    private ModulesCompilerService mockModulesCompilerService(BundleDocumentation bundleDocumentation) throws Exception {
        CompilerReport compilerReport = new CompilerReport(true, "version", new ArrayList<>(), new ArrayList<>(),
                new ReportMetadata(null, null, null), bundleDocumentation);
        return mockModulesCompilerService(compilerReport);
    }

    private ModulesCompilerService mockModulesCompilerService(CompilerReport compilerReport) throws Exception {
        ModulesCompilerData compilerData = new ModulesCompilerData(mockCodeMap(), new HashSet<>(), new HashSet<>(),
                new HashSet<>(), new HashSet<>(), compilerReport);

        ModulesCompilerService modulesCompilerService = mock(ModulesCompilerService.class);
        when(modulesCompilerService.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

        return modulesCompilerService;
    }

    @Test
    public void testGetDefinition() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        String basePath = String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "module-cmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "module-cmp.html", "template code here");
        FileSource<?> jsonFileSource = mockFile(basePath, "lightning.json", "{ description: 'hello there', expose: 'true', minVersion: '12.3' }");

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
        FileSource<?> xmlMetadataFileSource = mockFile(basePath, "module-cmp.js-meta.xml", xml);

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

        Map<CodeType, String> mockCodeMap = mockCodeMap();

        CompilerReport mockReport = new CompilerReport(mock(Boolean.class), mock(String.class), mock(List.class), mock(List.class), mock(ReportMetadata.class), null);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);

        ModulesCompilerData compilerData = new ModulesCompilerData(mockCodeMap,
                Sets.newHashSet(),
                Sets.newHashSet(),
                Sets.newHashSet(
                        new ClassMember("prop1", MemberType.PROPERTY, null, null),
                        new ClassMember("prop2", MemberType.PROPERTY, null, null),
                        new ClassMember("prop3", MemberType.PROPERTY, null, null)),
                Sets.newHashSet(),
                mockReport);
        when(mockCompiler.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

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
        String basePath = String.join(File.separator,"User","me","project","src","main","modules","name-space","module-cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "moduleCmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "moduleCmp.html", "template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "name-space", "modulecmp-moduleCmp", ModuleDef.class, module);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                module, jsFileSource,
                template, htmlFileSource));

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

        String basePath = String.join(File.separator,"User","me","project","src","main","modules","nameSpace","module-cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "moduleCmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "moduleCmp.html", "template code here");
        FileSource<?> jsonFileSource = mockFile(basePath, "lightning.json", "{ description: 'hello there', expose: 'true', minVersion: '12.3' }");

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
        FileSource<?> xmlMetadataFileSource = mockFile(basePath, "module-cmp.js-meta.xml", xml);

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

        Map<CodeType, String> mockCodeMap = mockCodeMap();
        CompilerReport mockReport = new CompilerReport(mock(Boolean.class), mock(String.class), mock(List.class), mock(List.class), mock(ReportMetadata.class), null);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        ModulesCompilerData compilerData = new ModulesCompilerData(mockCodeMap,
                Sets.newHashSet(),
                Sets.newHashSet(),
                Sets.newHashSet(
                        new ClassMember("prop1", MemberType.PROPERTY, null, null),
                        new ClassMember("prop2", MemberType.PROPERTY, null, null),
                        new ClassMember("prop3", MemberType.PROPERTY, null, null)),
                Sets.newHashSet(),
                mockReport);
        when(mockCompiler.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

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
        String basePath = String.join(File.separator,"User","me","project","src","main","modules","namespace","module-Cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "module-Cmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "module-Cmp.html", "template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "modulecmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "namespace", "modulecmp-moduleCmp", ModuleDef.class, module);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                module, jsFileSource,
                template, htmlFileSource));

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
        String basePath = String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "module-cmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "module-cmp.html", "template code here");

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
        when(mockCompiler.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

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

        String basePath = String.join(File.separator,"User","me","project","src","main","modules","namespace","module-cmp");

        FileSource<?> jsFileSource = mockFile(basePath, "module-cmp.js", "javascript code here");
        FileSource<?> htmlFileSource = mockFile(basePath, "module-cmp.html", "template code here");

        DefDescriptor<ModuleDef> module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor<ModuleDef> template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        Map<CodeType, String> codeMap = mockCodeMap();

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);

        CompilerReport mockReport = new CompilerReport(mock(Boolean.class), mock(String.class), mock(List.class), mock(List.class), mock(ReportMetadata.class), null);
        ModulesCompilerData compilerData = new ModulesCompilerData(codeMap, Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet(), mockReport);
        when(mockCompiler.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

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

    @Test
    public void testCreatesMarkdownDocDef() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js"),
                markdownDesc, mockFile("__docs__/cmp.markdown")));

        BundleDocumentation bundleDocumentation = new BundleDocumentation(null, "<p>hello world!</p>", null);
        ModulesCompilerService modulesCompilerService = mockModulesCompilerService(bundleDocumentation);

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);
        DocumentationDef documentationDef = moduleDef.getDocumentationDef();

        assertNotNull("documentation def should be set", documentationDef);

        DefDescriptor<DocumentationDef> expectedDesc = markdownDesc;
        DefDescriptor<DocumentationDef> actualDesc = moduleDef.getDocumentationDef().getDescriptor();
        assertEquals("documentation def did not have expected descriptor", expectedDesc, actualDesc);

        assertTrue("did not expect any meta values", documentationDef.getMetaDefsAsMap().isEmpty());
        assertNull("did not expect to find auradoc documentation def", moduleDef.getAuraDocumentationDef());
    }

    @Test
    public void testMarkdownDefContent() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js"),
                markdownDesc, mockFile("__docs__/cmp.markdown")));

        BundleDocumentation bundleDocumentation = new BundleDocumentation(null, "<p>hello world!</p>", null);
        ModulesCompilerService modulesCompilerService = mockModulesCompilerService(bundleDocumentation);

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);
        DocumentationDef documentationDef = moduleDef.getDocumentationDef();

        assertNotNull("documentation def should be set", documentationDef);

        int expectedCount = 1;
        int actualCount = documentationDef.getDescriptions().size();
        assertEquals("documentation def should only have one description", expectedCount, actualCount);

        String expectedDescription = "<p>hello world!</p>";
        String actualDescription = documentationDef.getDescriptions().get(0);
        assertEquals("did not get expected documentation content", expectedDescription, actualDescription);
    }

    @Test
    public void testCreatesMarkdownDocumentationWithMeta() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js"),
                markdownDesc, mockFile("__docs__/cmp.markdown")));

        Map<String, Object> meta = Maps.newHashMap();
        meta.put("string", "string");
        meta.put("number", new Integer(1));
        meta.put("boolean", new Boolean(false));
        meta.put("list", Lists.newArrayList("one", "two", "three"));
        BundleDocumentation bundleDocumentation = new BundleDocumentation(null, "<p>hello world!</p>", meta);

        ModulesCompilerService modulesCompilerService = mockModulesCompilerService(bundleDocumentation);

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);
        DocumentationDef documentationDef = moduleDef.getDocumentationDef();

        assertNotNull("documentation def should be set", documentationDef);

        Map<String, MetaDef> metaDefsMap = documentationDef.getMetaDefsAsMap();

        String expected = "string";
        String actual = metaDefsMap.get("string").getEscapedValue();
        assertEquals("did not get expected value for 'string'", expected, actual);

        expected = "1";
        actual = metaDefsMap.get("number").getEscapedValue();
        assertEquals("did not get expected value for 'number'", expected, actual);

        expected = "false";
        actual = metaDefsMap.get("boolean").getEscapedValue();
        assertEquals("did not get expected value for 'boolean'", expected, actual);

        expected = "one,two,three";
        actual = metaDefsMap.get("list").getEscapedValue();
        assertEquals("did not get expected value for 'list'", expected, actual);
    }

    @Test
    public void testCreatesAuradocDocumentation() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        DefDescriptor<DocumentationDef> auradocDesc = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js"),
                markdownDesc, mockFile("__docs__/cmp.markdown"),
                auradocDesc, mockFile("__docs__/cmp.auradoc")));

        ModulesCompilerService modulesCompilerService = mockModulesCompilerService();

        CompilerService compilerService = mock(CompilerService.class);
        DocumentationDef mockAuradocDef = mock(DocumentationDef.class);

        when(compilerService.compile(same(auradocDesc), any(Source.class))).thenReturn(mockAuradocDef);

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);
        factory.setCompilerService(compilerService);

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);
        DocumentationDef documentationDef = moduleDef.getAuraDocumentationDef();

        assertNotNull("auradoc documentation def should be set", documentationDef);
        assertSame("auradoc documentation def did not match", mockAuradocDef, documentationDef);
    }

    @Test
    public void testHandlesMarkdownNotPresent() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(descriptor, mockFile("cmp.js")));

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(mockModulesCompilerService((BundleDocumentation)null));

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);

        assertNull("documentation def should NOT be set", moduleDef.getDocumentationDef());
        assertNull("auradoc documentation def should NOT be set", moduleDef.getAuraDocumentationDef());
    }

    @Test
    public void testMarkdownCompileError() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        DefDescriptor<DocumentationDef> markdownDesc = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX,
                "namespace", "cmp-__docs__-cmp", DocumentationDef.class, descriptor);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js"),
                markdownDesc, mockFile("__docs__/cmp.markdown")));

        Map<CodeType, String> mockCodeMap = mock(EnumMap.class);
        when(mockCodeMap.get(any(CodeType.class))).thenReturn("define()");

        Diagnostic diagnostic = new Diagnostic(DiagnosticLevel.FATAL, "Unable to parse front matter", Optional.empty(), Optional.empty());
        CompilerReport compilerReport = new CompilerReport(false, "version", Lists.newArrayList(diagnostic),
                new ArrayList<>(), new ReportMetadata(null, null, null), null);
        ModulesCompilerService modulesCompilerService = mockModulesCompilerService(compilerReport);

        // current compiler behavior throws runtime exception when there is a compiler error
        when(modulesCompilerService.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenThrow(new RuntimeException("Unable to parse front matter"));

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);

        try {
            factory.getDefinition(descriptor, mockBundleSource);
            fail("expected to get an exception");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains("Unable to parse front matter"));
        }
    }

    @Test
    public void testModuleDescriptionPresent() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js")));

        BundleDocumentation bundleDocumentation = new BundleDocumentation("the description", null, null);
        ModulesCompilerService modulesCompilerService = mockModulesCompilerService(bundleDocumentation);

        BundleModuleDefFactory factory = new BundleModuleDefFactory();
        factory.setModulesCompilerService(modulesCompilerService);

        ModuleDef moduleDef = factory.getDefinition(descriptor, mockBundleSource);

        String expected = "the description";
        String actual = moduleDef.getDescription();

        assertEquals("did not set description on moduledef", expected, actual);
    }

    @Test
    public void testAttributes() throws Exception {
        DefDescriptor<ModuleDef> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                "namespace", "cmp", ModuleDef.class);

        BundleSource<ModuleDef> mockBundleSource = mockBundleSource(ImmutableMap.of(
                descriptor, mockFile("cmp.js")));

        CompilerReport mockReport = new CompilerReport(true,
                "version",
                new ArrayList<>(),
                new ArrayList<>(),
                new ReportMetadata(null, null, null),
                null);

        ModulesCompilerData compilerData = new ModulesCompilerData(mockCodeMap(),
                new HashSet<>(),
                new HashSet<>(),
                Sets.newHashSet(
                        new ClassMember("prop1", MemberType.PROPERTY, "api", "prop1 description"),
                        new ClassMember("prop2", MemberType.PROPERTY, "api", "prop2 description")),
                new HashSet<>(),
                mockReport);

        ModulesCompilerService mockCompiler = mock(ModulesCompilerService.class);
        when(mockCompiler.compile(anyString(), anyMap(), any(BundleType.class), anyMap())).thenReturn(compilerData);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setModulesCompilerService(mockCompiler);

        ModuleDef moduleDef = moduleDefFactory.getDefinition(descriptor, mockBundleSource);

        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = moduleDef.getAttributeDefs();
        assertEquals("expected to find three attributes on module def", 2, attributes.size());

        DefDescriptor<AttributeDef> desc = new DefDescriptorImpl<>(null, null, "prop1", AttributeDef.class);
        AttributeDef attr = attributes.get(desc);
        assertNotNull("could not find attribute with name 'prop1'", attr);
        assertTrue("attribute 'prop1' should have access global", attr.getAccess().isGlobal());
        assertEquals("attribute 'prop1' did not have expected description", "prop1 description", attr.getDescription());

        desc = new DefDescriptorImpl<>(null, null, "prop2", AttributeDef.class);
        attr = attributes.get(desc);
        assertNotNull("could not find attribute with name 'prop2'", attr);
        assertTrue("attribute 'prop2' should have access global", attr.getAccess().isGlobal());
        assertEquals("attribute 'prop2' did not have expected description", "prop2 description", attr.getDescription());
    }
}
