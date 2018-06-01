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

import java.util.*;

import javax.inject.Inject;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.lwc.CompilerConfig;
import org.lwc.CompilerReport;
import org.lwc.LwcCompiler;
import org.lwc.OutputConfig;
import org.lwc.bundle.Bundle;
import org.lwc.bundle.BundleResult;
import org.lwc.bundle.BundleType;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;

/**
 * Tests for the ModulesCompiler implementations
 */
public class ModulesCompilerTest extends UnitTestCase {

    // NOTE: use to specify which service type to use when running tests
    private static final NodeLambdaFactory FACTORY = NodeLambdaFactorySidecar.INSTANCE;

    @Inject
    private LoggingService loggingService;

    @Test
    public void test() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerNode(FACTORY, loggingService);
        String entry = "modules/moduletest/moduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", sourceClass);
        sources.put("modules/moduletest/moduletest.html", sourceTemplate);

        ModulesCompilerData compilerData = compiler.compile(entry, sources);
        String expected = Files.toString(getResourceFile("/testdata/modules/moduletest/expected.js"), Charsets.UTF_8);

        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
        assertEquals("[x-test, engine]", compilerData.bundleDependencies.toString());
    }

    @Test
    public void testErrorInHtml() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerNode(FACTORY, loggingService);
        String entry = "modules/errorInHtml/errorInHtml.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/errorInHtml/errorInHtml.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/errorInHtml/errorInHtml.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInHtml/errorInHtml.js", sourceClass);
        sources.put("modules/errorInHtml/errorInHtml.html", sourceTemplate);

        try {
            compiler.compile(entry, sources);
            fail("should report a syntax error");
        } catch (Exception e) {
            e.printStackTrace();
            String message = Throwables.getRootCause(e).getMessage();
            assertTrue(message, message.contains(
                    "Invalid HTML syntax: non-void-html-element-start-tag-with-trailing-solidus. For more information, please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-non-void-html-element-start-tag-with-trailing-solidus"));
        }
    }

    @Test
    public void testErrorInJs() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerNode(FACTORY, loggingService);
        String entry = "modules/errorInJs/errorInJs.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/errorInJs/errorInJs.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/errorInJs/errorInJs.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInJs/errorInJs.js", sourceClass);
        sources.put("modules/errorInJs/errorInJs.html", sourceTemplate);

        try {
            compiler.compile(entry, sources);
            fail("should report a syntax error");
        } catch (Exception e) {
            String message = Throwables.getRootCause(e).getMessage();
            assertEquals(message, "Invalid syntax encountered during compilation of modules/errorInJs/errorInJs.js: \n" +
                    "Parsing error: Unexpected token, expected \"{\" (2:4)");
        }
    }

    @Test
    public void testInternalLintingInJs() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerNode(FACTORY, loggingService);
        String entry = "modules/errorInJs/errorInJs.js";
        String sourceClass = "console.log('error');";

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInJs/errorInJs.js", sourceClass);

        ModulesCompilerData result = compiler.compile(entry, sources, BundleType.internal);
        assertTrue(result.compilerReport.success);
    }

    @Test
    public void testPlatformLintingInJs() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerNode(FACTORY, loggingService);
        String entry = "modules/errorInJs/errorInJs.js";
        String sourceClass = "console.log('error');";

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/errorInJs/errorInJs.js", sourceClass);

        try {
            compiler.compile(entry, sources, BundleType.platform);
            fail("should report a syntax error");
        } catch (Exception e) {
            String message = Throwables.getRootCause(e).getMessage();
            assertEquals(message, "Invalid syntax encountered during compilation of modules/errorInJs/errorInJs.js: \n" +
                    "Unexpected console statement.");
        }
    }

    @Test
    public void testDefaultDevOutputConfig() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();
        files.put(
                "foo.js",
                "import { Element, api } from 'engine';\n" +
                        "export default class Foo extends Element {\n" +
                        "    @api greetings = 'Hello world!';\n" +
                        "}"
        );
        files.put(
                "foo.html",
                "<template>\n" +
                        "     <h1>{greetings}</h1>\n" +
                        "</template>"
        );

        Bundle bundle = new Bundle("x", "foo", files, BundleType.platform);

        ArrayList<OutputConfig> outputConfigs = new ArrayList<>();
        outputConfigs.add(ModulesCompilerUtil.createDevOutputConfig());

        CompilerConfig config = new CompilerConfig(bundle, outputConfigs);
        CompilerReport report = compiler.compile(config);
        List<BundleResult> results = report.results;

        assertEquals(report.results.size(), 1);

        OutputConfig devActual = results.get(0).outputConfig;

        assertFalse(devActual.compat);
        assertFalse(devActual.minify);
        assertEquals(devActual.env.get("NODE_ENV"), "development");
        assertFalse(devActual.resolveProxyCompat.isPresent());

    };

    @Test
    public void testDefaultProdOutputConfig() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();
        files.put(
                "foo.js",
                "import { Element, api } from 'engine';\n" +
                        "export default class Foo extends Element {\n" +
                        "    @api greetings = 'Hello world!';\n" +
                        "}"
        );
        files.put(
                "foo.html",
                "<template>\n" +
                        "     <h1>{greetings}</h1>\n" +
                        "</template>"
        );

        Bundle bundle = new Bundle("x", "foo", files, BundleType.platform);

        ArrayList<OutputConfig> outputConfigs = new ArrayList<>();
        outputConfigs.add(ModulesCompilerUtil.createProdOutputConfig());

        CompilerConfig config = new CompilerConfig(bundle, outputConfigs);
        CompilerReport report = compiler.compile(config);
        List<BundleResult> results = report.results;

        assertEquals(report.results.size(), 1);

        OutputConfig devActual = results.get(0).outputConfig;

        assertFalse(devActual.compat);
        assertTrue(devActual.minify);
        assertEquals(devActual.env.get("NODE_ENV"), "production");
        assertFalse(devActual.resolveProxyCompat.isPresent());

    };


    @Test
    public void testPlatformCompilerIntegration() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();
        files.put(
                "foo.js",
                "import { Element, api } from 'engine';\n" +
                        "export default class Foo extends Element {\n" +
                        "    @api greetings = 'Hello world!';\n" +
                        "}"
        );
        files.put(
                "foo.html",
                "<template>\n" +
                        "     <h1>{greetings}</h1>\n" +
                        "</template>"
        );

        Bundle bundle = new Bundle("x", "foo", files, BundleType.platform);
        CompilerConfig config = new CompilerConfig(bundle, null);
        CompilerReport report = compiler.compile(config);
        BundleResult result = report.results.get(0);

        assertTrue(report.success);
        assertNotNull(report.version);
        assertEquals(report.results.size(), 1);
        assertEquals(result.diagnostics.size(), 1);
        assertEquals(
                result.code,
                "define('x-foo', ['engine'], function (engine) {\n" +
                        "\n" +
                        "const style = undefined;\n" +
                        "\n" +
                        "function tmpl($api, $cmp, $slotset, $ctx) {\n" +
                        "  const {\n" +
                        "    d: api_dynamic,\n" +
                        "    h: api_element\n" +
                        "  } = $api;\n" +
                        "\n" +
                        "  return [api_element(\"h1\", {\n" +
                        "    key: 1\n" +
                        "  }, [api_dynamic($cmp.greetings)])];\n" +
                        "}\n" +
                        "\n" +
                        "if (style) {\n" +
                        "    tmpl.token = 'x-foo_foo';\n" + 
                        "\n" +
                        "    const style$$1 = document.createElement('style');\n" +
                        "    style$$1.type = 'text/css';\n" +
                        "    style$$1.dataset.token = 'x-foo_foo';\n" +
                        "    style$$1.textContent = style('x-foo', 'x-foo_foo');\n" +
                        "    document.head.appendChild(style$$1);\n" +
                        "}" +
                        "\n\n" +
                        "class Foo extends engine.Element {\n" +
                        "  constructor(...args) {\n" +
                        "    var _temp;\n" +
                        "\n" +
                        "    return _temp = super(...args), this.greetings = 'Hello world!', _temp;\n" +
                        "  }\n" +
                        "\n" +
                        "  render() {\n" +
                        "    return tmpl;\n" +
                        "  }\n" +
                        "\n" +
                        "}\n" +
                        "Foo.publicProps = {\n" +
                        "  greetings: {\n" +
                        "    config: 0\n" +
                        "  }\n" +
                        "};\n" +
                        "Foo.style = tmpl.style;\n" +
                        "\n" +
                        "return Foo;\n" +
                        "\n" +
                        "});\n"
        );
    }

    @Test
    public void testLockerizedCmp() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();

        files.put(
                "lockerized-cmp.js", "import { Element, api } from \"engine\";\n" +
                "\n" +
                "export default class LockerizedCmp extends Element {\n" +
                "    @api\n" +
                "    divide(a, b) {\n" +
                "        return a / b;\n" +
                "    }\n" +
                "}\n"
        );
        files.put("lockerized-cmp.html", "<template>\n" +
                "    <section class=\"lockerized-cmp-module-container\">\n" +
                "        <p>Lockerized module from secureOtherNamespace</p>\n" +
                "    </section>\n" +
                "</template>\n");

        Bundle bundle = new Bundle("x", "lockerized-cmp", files, BundleType.platform);
        CompilerConfig config = new CompilerConfig(bundle, null);
        CompilerReport report = compiler.compile(config);

        assertTrue(report.success);
    }

    @Test
    public void testPlatformCompilerCustomTemplate() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();
        files.put(
                "foo.js",
                "import { Element, api } from 'engine';\n import mytemplate from './nonmatch.html';\n" +
                        "export default class Foo extends Element {\n" +
                        "    @api greetings = 'Hello world!';\n" +
                        "    render() { return mytemplate; }\n" +
                        "}"
        );
        files.put(
                "nonmatch.html",
                "<template>\n" +
                        "     <h1>{greetings}</h1>\n" +
                        "</template>"
        );

        Bundle bundle = new Bundle("x", "foo", files, BundleType.platform);
        CompilerConfig config = new CompilerConfig(bundle, null);
        CompilerReport report = compiler.compile(config);
        assertTrue(report.success);

    }

    @Test
    public void testPlatformCompilerManualTemplateImport() throws Exception {
        LwcCompiler compiler = new LwcCompiler(FACTORY);

        Map<String, String> files = new HashMap<>();
        files.put(
                "foo.js",
                "import { Element, api } from 'engine';\n import mytemplate from './foo.html';\n" +
                        "export default class Foo extends Element {\n" +
                        "    @api greetings = 'Hello world!';\n" +
                        "    render() { return mytemplate; }\n" +
                        "}"
        );
        files.put(
                "foo.html",
                "<template>\n" +
                        "     <h1>{greetings}</h1>\n" +
                        "</template>"
        );

        Bundle bundle = new Bundle("x", "foo", files, BundleType.platform);
        CompilerConfig config = new CompilerConfig(bundle, null);
        CompilerReport report = compiler.compile(config);
        assertTrue(report.success);

        // ensure relative import is not included into the references
        assertTrue(report.metadata.references.size() == 1);
    }
}
