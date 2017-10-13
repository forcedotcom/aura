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

import org.auraframework.tools.node.api.NodeBundle;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.base.Charsets;
import com.google.common.io.Files;

public class ModulesCompilerUtilTest extends UnitTestCase {

    @Test
    public void createCompilerBundle() throws Exception {
        NodeBundle bundle = ModulesCompilerUtil.createCompilerBundle(NodeLambdaFactorySidecar.INSTANCE);
        assertNotNull(bundle.id());
    }

    @Test
    public void testGenerateCompilerInput() throws Exception {
        String entry = "modules/moduletest/moduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", sourceClass);
        sources.put("modules/moduletest/moduletest.html", sourceTemplate);

        String compilerInput = ModulesCompilerUtil.generateCompilerInput(entry, sources).getJSONObject("options")
                .toString();
        String expected = "{\"mode\":\"all\",\"sources\":{\"modules/moduletest/moduletest.js\":\"import { Element } from \\\"engine\\\";\\nexport default class Test extends Element {\\n    @api stringQuote = 'str\\\"ing';\\n    @api stringDoubleQuote = \\\"str'ing\\\";\\n    @api stringBacktick = `key=${value}`;\\n    \\n    @api VALID_NAME_RE = /^([a-zA-Z]\\\\w*):([a-zA-Z]\\\\w*)$/;\\n}\",\"modules/moduletest/moduletest.html\":\"<template>\\n    <x-test>{test}<\\/x-test>\\n<\\/template>\"},\"mapNamespaceFromPath\":true,\"format\":\"amd\"}";
        assertEquals(expected, compilerInput);
    }
}
