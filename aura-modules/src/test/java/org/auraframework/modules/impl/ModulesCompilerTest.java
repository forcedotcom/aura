package org.auraframework.modules.impl;

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

import java.io.File;

import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;

/**
 * Tests for the ModulesCompiler implementations
 */
public class ModulesCompilerTest extends UnitTestCase {

    @Test
    public void testModulesCompilerJ2V8() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerJ2V8();

        String componentPath = "modules/classAndTemplate/classAndTemplate.js";
        String sourceTemplate = Files
                .toString(getResourceFile("/testdata/modules/classAndTemplate/classAndTemplate.html"), Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/classAndTemplate/classAndTemplate.js"),
                Charsets.UTF_8);

        ModulesCompilerData compilerData = compiler.compile(componentPath, sourceTemplate, sourceClass);
        String expected = Files.toString(getResourceFile("/testdata/modules/classAndTemplate/expected.js"),
                Charsets.UTF_8);

        assertEquals(expected, compilerData.code);
        assertEquals("[a:b]", compilerData.bundleDependencies.toString());
        assertEquals("[myList, items, last]", compilerData.templateUsedIds.toString());
    }

    @Test
    public void testModulesCompilerJ2V8ErrorInHtml() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerJ2V8();

        String componentPath = "modules/errorInHtml/errorInHtml.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/errorInHtml/errorInHtml.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/errorInHtml/errorInHtml.js"),
                Charsets.UTF_8);

        try {
            compiler.compile(componentPath, sourceTemplate, sourceClass);
            fail("should report a syntax error");
        } catch (Exception e) {
            String message = Throwables.getRootCause(e).getMessage();
            assertEquals("Error: ./errorInHtml.html: Unexpected token (2:5)", message);
        }
    }

    @Test
    public void testModulesCompilerJ2V8ErrorInJs() throws Exception {
        ModulesCompiler compiler = new ModulesCompilerJ2V8();

        String componentPath = "modules/errorInJs/errorInJs.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/errorInJs/errorInJs.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/errorInJs/errorInJs.js"),
                Charsets.UTF_8);

        try {
            compiler.compile(componentPath, sourceTemplate, sourceClass);
            fail("should report a syntax error");
        } catch (Exception e) {
            Throwable cause = Throwables.getRootCause(e);
            assertEquals("Error: modules/errorInJs/errorInJs.js: Unexpected token (1:11)", cause.getMessage());
        }
    }

    // tests for ModulesCompilerNode:

    @Test
    public void testModulesCompilerNode() throws Exception {
        ModulesCompilerNode compiler = new ModulesCompilerNode();
        File file = getResourceFile("/testdata/modules/classAndTemplate/classAndTemplate.js");
        assertTrue(file.getAbsolutePath(), file.exists());
        String result = compiler.compile(file).code;
        String expected = Files.toString(getResourceFile("/testdata/modules/classAndTemplate/expected.js"),
                Charsets.UTF_8);
        assertEquals(expected, result);
    }
}
