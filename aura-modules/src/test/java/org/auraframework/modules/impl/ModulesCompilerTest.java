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

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;

/**
 * Tests for the ModulesCompiler implementations
 */
public class ModulesCompilerTest extends UnitTestCase {

    @Test
    public void testModulesCompilerNode() throws Exception {
        testModulesCompiler(new ModulesCompilerNode());
    }

    @Test
    @Ignore("deprecated and J2V8 tests sometimes flap")
    public void testModulesCompilerJ2V8() throws Exception {
        testModulesCompiler(new ModulesCompilerJ2V8());
    }

    private void testModulesCompiler(ModulesCompiler compiler) throws Exception {
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
        assertEquals("[x-test]", compilerData.bundleDependencies.toString());
    }

    @Test
    public void testModulesCompilerNodeErrorInHtml() throws Exception {
        testModulesCompilerErrorInHtml(new ModulesCompilerNode());
    }

    @Test
    @Ignore("deprecated and J2V8 tests sometimes flap")
    public void testModulesCompilerJ2V8ErrorInHtml() throws Exception {
        testModulesCompilerErrorInHtml(new ModulesCompilerJ2V8());
    }

    private void testModulesCompilerErrorInHtml(ModulesCompiler compiler) throws Exception {
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
            assertTrue(message,
                    message.contains("Error: modules/errorInHtml/errorInHtml.html: Unexpected token (2:5)"));
        }
    }

    @Test
    public void testModulesCompilerNodeErrorInJs() throws Exception {
        testModulesCompilerErrorInJs(new ModulesCompilerNode());
    }

    @Test
    @Ignore("deprecated and J2V8 tests sometimes flap")
    public void testModulesCompilerJ2V8ErrorInJs() throws Exception {
        testModulesCompilerErrorInJs(new ModulesCompilerJ2V8());
    }

    private void testModulesCompilerErrorInJs(ModulesCompiler compiler) throws Exception {
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
            assertTrue(message, message.contains("Error: modules/errorInJs/errorInJs.js: Unexpected token (1:11)"));
        }
    }
}
