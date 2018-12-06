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
package org.auraframework.modules.impl;

import static org.hamcrest.CoreMatchers.allOf;
import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.NotSerializableException;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import javax.inject.Inject;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.io.Files;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.junit.Assert;
import org.junit.Test;
import org.lwc.OutputConfig;
import org.lwc.bundle.BundleType;
import org.lwc.decorator.DecoratorParameterValue;
import org.lwc.metadata.ModuleExport;
import org.lwc.reference.Reference;
import org.lwc.template.TemplateModuleDependencies;
import org.lwc.template.TemplateModuleDependency;

public final class ModulesCompilerServiceImplTest extends AuraImplTestCase {
    
    private static final Logger logger = Logger.getLogger(ModulesCompilerServiceImplTest.class.getName());

    @Inject
    private ModulesCompilerService modulesCompilerService;

    @Test
    public void showTimings() throws Exception {
        List<Long> timings = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            long startNanos = System.nanoTime();
            testCompile();
            long elapsedMillis = (System.nanoTime() - startNanos) / 1000000;
            timings.add(elapsedMillis);
        }
        logger.info("moduletest exec elapsed millis: " + timings);
    }

    @Test
    public void testCompile() throws Exception {
        String entry = "modules/moduletest/moduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", sourceClass);
        sources.put("modules/moduletest/moduletest.html", sourceTemplate);

        ModulesCompilerData compilerData = modulesCompilerService.compile(entry, sources);
        String expected = Files.toString(getResourceFile("/testdata/modules/moduletest/expected.js"), Charsets.UTF_8);

        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
    }

    @Test
    public void testCompileNamespaceMapping() throws Exception {
        String entry = "modules/nsmoduletest/nsmoduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/nsmoduletest/nsmoduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/nsmoduletest/nsmoduletest.js"),
                Charsets.UTF_8);
        String sourceCSS = Files.toString(getResourceFile("/testdata/modules/nsmoduletest/nsmoduletest.css"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/nsmoduletest/nsmoduletest.js", sourceClass);
        sources.put("modules/nsmoduletest/nsmoduletest.html", sourceTemplate);
        sources.put("modules/nsmoduletest/nsmoduletest.css", sourceCSS);

        Map<String, String> namespaceMapping = new HashMap<>();
        namespaceMapping.put("c", "ns");
        ModulesCompilerData compilerData = modulesCompilerService.compile(entry, sources, BundleType.internal, namespaceMapping);
        String expected = Files.toString(getResourceFile("/testdata/modules/nsmoduletest/nsexpected.js"), Charsets.UTF_8);

        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
        assertEquals("[some-module, lwc, ns/bar, x/foo, ns/utils]", compilerData.bundleDependencies.toString());
    }

    @Test
    public void test() throws Exception {
        String expected = Files.toString(getResourceFile("/testdata/modules/moduletest/expected.js"), Charsets.UTF_8);

        ModulesCompilerData compilerData = compileModule("modules/moduletest/moduletest");

        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
        assertEquals("[lwc, x/test]", compilerData.bundleDependencies.toString());
    }

    @Test
    public void testSalesforceBundleDependencies() throws Exception {
        String entry = "modules/bundledependencies/bundledependencies.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/bundledependencies/bundledependencies.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/bundledependencies/bundledependencies.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/bundledependencies/bundledependencies.js", sourceClass);
        sources.put("modules/bundledependencies/bundledependencies.html", sourceTemplate);

        Map<String, String> namespaceMapping = new HashMap<>();
        namespaceMapping.put("c", "ns");
        ModulesCompilerData compilerData = modulesCompilerService.compile(entry, sources, BundleType.internal, namespaceMapping);

        List<Reference> references = compilerData.compilerReport.metadata.references;
        assertEquals(17, references.size());

        List<String> bundleDeps = new ArrayList(compilerData.bundleDependencies);

        // ensure only component and module dependencies are added to the bundleDependencies list
        assertEquals(2, bundleDeps.size());
        assertEquals("external/cmp", bundleDeps.get(0));
        assertEquals("lwc", bundleDeps.get(1));
    }

    @Test
    public void testWireMetadata() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/wireDecoratorTest/wireDecoratorTest");
        Set<ModulesCompilerData.WireDecoration> wireDecorations = compilerData.wireDecorations;
        assertEquals(1, wireDecorations.size());
        ModulesCompilerData.WireDecoration wireDecorator = wireDecorations.iterator().next();
        assertEquals("getRecord", wireDecorator.adapter.name);
        assertEquals("x-record-api", wireDecorator.adapter.reference);
        assertEquals(ImmutableMap.of("id", "recordId"), wireDecorator.params);
        Map<String, DecoratorParameterValue> staticFields = wireDecorator.staticFields;
        assertEquals(true, staticFields.get("bool").value);
        assertEquals("Hello", staticFields.get("text").value);
        assertEquals(123, staticFields.get("number").value);
        assertEquals(ImmutableList.of("One", "Two"), staticFields.get("array").value);
    }

    @Test
    public void testTemplateDependenciesMetadata() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/templateDependenciesTest/templateDependenciesTest");

        List<TemplateModuleDependencies> templateModuleDependencies =
                compilerData.compilerReport.metadata.experimentalTemplateModuleDependencies;

        // There's only one template
        assertEquals(1, templateModuleDependencies.size());
        // There are three modules used
        List<TemplateModuleDependency> moduleDependencies = templateModuleDependencies.get(0).moduleDependencies;
        assertEquals(3, moduleDependencies.size());

        assertEquals("x/innerContact", moduleDependencies.get(0).moduleName);
        assertEquals(ImmutableSet.of("contactId", "actionable"), moduleDependencies.get(0).properties.keySet());

        assertEquals("x/contact", moduleDependencies.get(1).moduleName);
        assertEquals(ImmutableSet.of("mode", "contactId"), moduleDependencies.get(1).properties.keySet());

        assertEquals("x/footer", moduleDependencies.get(2).moduleName);
        assertEquals(Collections.emptySet(), moduleDependencies.get(2).properties.keySet());
    }

    @Test
    public void testTemplateDependenciesMetadataSerializable() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/templateDependenciesTest/templateDependenciesTest");

        List<TemplateModuleDependencies> templateModuleDependencies =
                compilerData.compilerReport.metadata.experimentalTemplateModuleDependencies;

        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
            objectOutputStream.writeObject(templateModuleDependencies);
        } catch (NotSerializableException e) {
            Assert.fail("Template Module Dependencies should be serializable");
        }

    }

    @Test
    public void testModuleExportsMetadata() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/moduleExportTest/moduleExportTest");

        List<ModuleExport> exports = compilerData.compilerReport.metadata.exports;

        // There are two exports, one a constant, the other the default class
        assertEquals(2, exports.size());
        ModuleExport namedModuleExport = exports.get(0);
        assertEquals("", namedModuleExport.source);
        assertEquals(ModuleExport.ExportType.ExportNamedDeclaration, namedModuleExport.type);
        assertEquals("EXPORTED_CONSTANT", namedModuleExport.value);
        ModuleExport defaultModuleExport = exports.get(1);
        assertEquals("", defaultModuleExport.source);
        assertEquals(ModuleExport.ExportType.ExportDefaultDeclaration, defaultModuleExport.type);
        assertEquals("", defaultModuleExport.value);
    }

    @Test
    public void testModuleExportsMetadataSerializable() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/moduleExportTest/moduleExportTest");

        List<ModuleExport> exports = compilerData.compilerReport.metadata.exports;

        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
            objectOutputStream.writeObject(exports);
        } catch (NotSerializableException e) {
            Assert.fail("Module Exports should be serializable");
        }

    }

    @Test
    public void testErrorInJs() throws Exception {
        try {
            compileModule("modules/errorInJs/errorInJs");
            fail("should report a syntax error");
        } catch (Exception e) {
            String fullMessage = Throwables.getRootCause(e).toString();
            // since linting is disabled for inernal bundle types, the compiler will throw instead of producing diagnostic
            assertThat(fullMessage, containsString("Unexpected token, expected \"{\" (2:4)"));
        }
    }

    @Test
    public void testInternalLintingInJs() throws Exception {
        String entry = "modules/errorInJs/errorInJs.js";
        String sourceClass = "console.log('error');";

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInJs/errorInJs.js", sourceClass);

        ModulesCompilerData result = modulesCompilerService.compile(entry, sources, BundleType.internal);
        assertEquals(result.compilerReport.diagnostics.size(), 0);
        assertTrue(result.compilerReport.success);
    }

    @Test
    public void testPlatformLintingInJs() throws Exception {
        String entry = "modules/errorInJs/errorInJs.js";
        String sourceClass = "$A.createComponent('');";

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInJs/errorInJs.js", sourceClass);

        try {
            modulesCompilerService.compile(entry, sources, BundleType.platform);
            fail("should report a syntax error");
        } catch (Exception e) {
            String fullMessage = Throwables.getRootCause(e).toString();
            assertThat(
                fullMessage,
                allOf(
                    containsString("Invalid syntax encountered in the 'errorInJs.js' file of the 'modules:errorInJs' component: \n"),
                    containsString("Do not use $A in LWC code")
                )
            );
        }
    }

    @Test
    public void testCompileWithoutConfigs() throws Exception {
        String entry = "modules/moduletest/moduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", sourceClass);
        sources.put("modules/moduletest/moduletest.html", sourceTemplate);

        ModulesCompilerData compilerData = modulesCompilerService.compile(entry, sources, BundleType.platform);

        //All configs should be generated when no configs are passed to the compiler
        assertEquals(4, compilerData.compilerReport.results.size());
        assertNotNull(compilerData.codes.get(CodeType.PROD));
        assertNotNull(compilerData.codes.get(CodeType.PROD_COMPAT));
        assertNotNull(compilerData.codes.get(CodeType.COMPAT));
        assertNotNull(compilerData.codes.get(CodeType.DEV));
    }

    @Test
    public void testCompileWithEmptyConfigs() throws Exception {
        ModulesCompilerData compilerData = compileModule("modules/moduletest/moduletest");

        //All configs should be generated when no configs are passed to the compiler
        assertEquals(4, compilerData.compilerReport.results.size());
        assertNotNull(compilerData.codes.get(CodeType.PROD));
        assertNotNull(compilerData.codes.get(CodeType.PROD_COMPAT));
        assertNotNull(compilerData.codes.get(CodeType.COMPAT));
        assertNotNull(compilerData.codes.get(CodeType.DEV));
    }

    @Test
    public void testCompileWithOnlyDevConfig() throws Exception {
        OutputConfig devConfig = ModulesCompilerUtil.createDevOutputConfig(BundleType.internal);
        ModulesCompilerData compilerData = compileModule("modules/moduletest/moduletest", Lists.newArrayList(devConfig));
        String expected = Files.toString(getResourceFile("/testdata/modules/moduletest/expected.js"), Charsets.UTF_8);

        assertEquals(1, compilerData.compilerReport.results.size());
        assertNull(compilerData.codes.get(CodeType.PROD));
        assertNull(compilerData.codes.get(CodeType.PROD_COMPAT));
        assertNull(compilerData.codes.get(CodeType.COMPAT));
        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
    }

    @Test
    public void testCompileInternalShouldReplaceNodeEnv() throws Exception {
        OutputConfig devConfig = ModulesCompilerUtil.createDevOutputConfig(BundleType.internal);
        OutputConfig prodConfig = ModulesCompilerUtil.createProdOutputConfig(BundleType.internal);
        ModulesCompilerData compilerData = compileModule("modules/nodeEnv/nodeEnv", Lists.newArrayList(devConfig, prodConfig));

        String devCode = compilerData.codes.get(CodeType.DEV);
        System.out.println(devCode);
        assertTrue(
                "Prod console should be stripped",
                devCode.contains("I am in dev") && !devCode.contains("I am in prod")
        );

        String prodCode = compilerData.codes.get(CodeType.PROD);
        System.out.println(prodCode);
        assertTrue(
                "Dev console should be stripped",
                !prodCode.contains("I am in dev") && prodCode.contains("I am in prod")
        );
    }

    @Test
    public void testCompilePlatformShouldIgnoreNodeEnv() throws Exception {
        OutputConfig devConfig = ModulesCompilerUtil.createDevOutputConfig(BundleType.platform);
        OutputConfig prodConfig = ModulesCompilerUtil.createProdOutputConfig(BundleType.platform);
        ModulesCompilerData compilerData = compileModule("modules/nodeEnv/nodeEnv", Lists.newArrayList(devConfig, prodConfig));

        String devCode = compilerData.codes.get(CodeType.DEV);
        System.out.println(devCode);
        assertTrue(
                "Console should not be stripped in dev",
                devCode.contains("I am in dev") && devCode.contains("I am in prod")
        );

        String prodCode = compilerData.codes.get(CodeType.PROD);
        assertTrue(
                "Console should not be stripped in prod",
                prodCode.contains("I am in dev") && prodCode.contains("I am in prod")
        );
    }

    @Test
    public void testGeneratedLog() {
        String entry = "modules/moduletest/moduletest.js";

        long elapsedMs = 100;

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", "import { log } from './utils.js';\nlog('moduletest');");
        sources.put("modules/moduletest/utils.js", "export const log = msg => console.log(msg);");

        List<OutputConfig> configs = Arrays.asList(
                ModulesCompilerUtil.createDevOutputConfig(BundleType.internal),
                ModulesCompilerUtil.createProdOutputConfig(BundleType.internal)
        );

        String logLine = ModulesCompilerServiceImpl.getCompilationLogLine(
                entry,
                sources,
                BundleType.internal,
                configs,
                elapsedMs,
                NodeLambdaFactorySidecar.DEFAULT
        );

        assertTrue(logLine.contains("entry=modules/moduletest/moduletest.js"));
        assertTrue(logLine.contains("elapsedMs=100"));
        assertTrue(logLine.contains("nodeServiceType=NodeLambdaFactorySidecar[]"));
        assertTrue(logLine.contains("bundleType=internal"));
        assertTrue(logLine.contains("sizeByte=95"));
        assertTrue(logLine.contains("configs=[{\"minify\":false,\"env\":{\"NODE_ENV\":\"development\"},\"compat\":false},{\"minify\":true,\"env\":{\"NODE_ENV\":\"production\"},\"compat\":false}]"));
    }

    private ModulesCompilerData compileModule(String modulePath) throws Exception {
        return compileModule(modulePath, null);
    }

    private ModulesCompilerData compileModule(String modulePath, List<OutputConfig> configs) throws Exception {
        Map<String, String> sources = new HashMap<>();

        String htmlModule = modulePath + ".html";
        String htmlSource = Files.toString(getResourceFile("/testdata/" + htmlModule), Charsets.UTF_8);
        sources.put(htmlModule, htmlSource);

        String jsModule = modulePath + ".js";
        String jsSource = Files.toString(getResourceFile("/testdata/" + jsModule), Charsets.UTF_8);
        sources.put(jsModule, jsSource);

        return modulesCompilerService.compile(jsModule, sources, BundleType.internal, null, configs);
    }
}
