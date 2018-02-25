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

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.auraframework.modules.ModulesCompilerData.WireDecoration;
import org.auraframework.tools.node.api.NodeBundle;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.auraframework.util.test.util.UnitTestCase;
import org.json.JSONArray;
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
        String expected = "{\"mode\":\"all\",\"sources\":{\"modules/moduletest/moduletest.js\":\"import { Element, api } from \\\"engine\\\";\\n\\nexport default class Test extends Element {\\n    @api stringQuote = 'str\\\"ing';\\n    @api stringDoubleQuote = \\\"str'ing\\\";\\n    @api stringBacktick = `key=${value}`;\\n    \\n    @api VALID_NAME_RE = /^([a-zA-Z]\\\\w*):([a-zA-Z]\\\\w*)$/;\\n}\",\"modules/moduletest/moduletest.html\":\"<template>\\n    <x-test>{test}<\\/x-test>\\n<\\/template>\"},\"mapNamespaceFromPath\":true,\"format\":\"amd\"}";
        assertEquals(expected, compilerInput);
    }

    @Test
    public void testConvertJsonArrayToStringArrayWithNullReturnsNull() {
        assertNull(ModulesCompilerUtil.convertJsonArrayToStringArray(null));
    }

    @Test
    public void testConvertJsonArrayToStringArrayWithEmptyArrayReturnsEmptyArray() {
        String[] actual = ModulesCompilerUtil.convertJsonArrayToStringArray(new JSONArray());
        assertNotNull(actual);
        assertEquals(0, actual.length);
    }

    @Test
    public void testConvertJsonArrayToStringArrayWithValidInput() {
        JSONArray target = new JSONArray("['a', 'b', 'c']");
        String[] actual = ModulesCompilerUtil.convertJsonArrayToStringArray(target);
        String[] expected = {"a", "b", "c"};
        for (int i = 0; i < expected.length; i++) {
            assertEquals(expected[i], actual[i]);
        }
    }

    @Test
    public void testConvertJsonArrayToStringArrayWithInvalidInput() {
        JSONArray target = new JSONArray("[{a:1, b:2, c:3}]");
        assertNull(ModulesCompilerUtil.convertJsonArrayToStringArray(target));
    }

    @Test
    public void testParsePublicPropertiesWithNullReturnsEmpty() {
        assertNotNull(ModulesCompilerUtil.parsePublicProperties(null));
    }

    @Test
    public void testParsePublicPropertiesWithEmptyArrayReturnsEmptySet() {
        Set<String> actual = ModulesCompilerUtil.parsePublicProperties(new JSONArray());
        assertNotNull(actual);
        assertEquals(0, actual.size());
    }

    @Test
    public void testParsePublicPropertiesWithValidInput() {
        JSONArray target = new JSONArray("[{type: 'property', name: 'foo'}]");
        Set<String> actual = ModulesCompilerUtil.parsePublicProperties(target);
        assertTrue(actual.contains("foo"));
    }

    @Test
    public void testParsePublicPropertiesWithInvalidInput() {
        JSONArray target = new JSONArray("[{foo: 'bar'}]");
        Set<String> actual = ModulesCompilerUtil.parsePublicProperties(target);
        assertEquals(0, actual.size());
    }

    @Test
    public void testParseWireDecorationsWithNullReturnsEmpty() {
        assertNotNull(ModulesCompilerUtil.parseWireDecorations(null));
    }

    @Test
    public void testParseWireDecorationsWithEmptyArrayReturnsEmptySet() {
        Set<WireDecoration> actual = ModulesCompilerUtil.parseWireDecorations(new JSONArray());
        assertNotNull(actual);
        assertEquals(0, actual.size());
    }

    @Test
    public void testParseWireDecorationsWithValidInput() {
        JSONArray target = new JSONArray("[{type: 'property', name: 'wiredTodo', adapter: {name: 'getTodo', reference: 'todo'}, params: {todoId: 'todoId'}, static: { fields: ['subject', 'due'] } }]");
        Set<WireDecoration> actual = ModulesCompilerUtil.parseWireDecorations(target);
        Iterator<WireDecoration> iter = actual.iterator();
        while(iter.hasNext()) {
            WireDecoration actualDecoration = iter.next();
            assertEquals("property", actualDecoration.type);
            assertEquals("wiredTodo", actualDecoration.name);
            assertEquals("getTodo", actualDecoration.adapter.name);
            assertEquals("todo", actualDecoration.adapter.reference);
            assertEquals("todoId", actualDecoration.params.get("todoId"));
            assertEquals("[subject, due]", Arrays.toString(actualDecoration.staticFields.get("fields")));
        }
    }

    @Test
    public void testParseWireDecorationsWithInvalidInput() {
        JSONArray target = new JSONArray("[{foo: 'bar'}]");
        Set<WireDecoration> actual = ModulesCompilerUtil.parseWireDecorations(target);
        assertEquals(0, actual.size());
    }
}
