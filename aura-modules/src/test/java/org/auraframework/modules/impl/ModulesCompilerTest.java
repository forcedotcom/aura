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

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
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
            assertTrue(message, message.contains("Error: modules/errorInJs/errorInJs.js: Unexpected token, expected \"{\" (2:4)"));
        }
    }
}
