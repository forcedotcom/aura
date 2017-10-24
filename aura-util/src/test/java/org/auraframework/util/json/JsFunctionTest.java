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
package org.auraframework.util.json;

import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

/**
 */
public class JsFunctionTest extends UnitTestCase {

    @Test
    public void testSerialize() throws Exception {
        String contents = "var thin = \"brown fox\";\njumps('over the moon');";
        String expected = "function() {var thin = \"brown fox\";\njumps('over the moon');}";
        JsFunction f = new JsFunction(ImmutableList.<String> of(), contents);
        assertEquals(expected, JsonEncoder.serialize(f, true));

        JsFunction f2 = new JsFunction(ImmutableList.of("arg1"), "nothing");
        assertEquals("function(arg1) {nothing}", JsonEncoder.serialize(f2, true));
        JsFunction f3 = new JsFunction(ImmutableList.of("arg1", "arg2"), "something");
        assertEquals("function(arg1, arg2) {something}", JsonEncoder.serialize(f3, true));
    }

    @Test
    public void testEquals() throws Exception {
        JsFunction f1 = new JsFunction(ImmutableList.of("arg1"), "these are the contents");
        JsFunction f2 = new JsFunction(ImmutableList.of("arg1"), "these are the contents");
        assertEquals(f1, f2);

        JsFunction f3 = new JsFunction(ImmutableList.of("arg2"), "these are the contents");
        assertFalse(f1.equals(f3));

        JsFunction f4 = new JsFunction(ImmutableList.of("arg1"), "these are not the garden");
        assertFalse(f1.equals(f4));

        JsFunction f5 = new JsFunction(ImmutableList.of("arg1", "arg2"), "these are the contents");
        assertFalse(f1.equals(f5));
    }

    @Test
    public void testSanitizeForFunctionContentContainsRegExp() {
        String content = "var a = new RegExp('a{0,}');";
        JsFunction jsFunction = new JsFunction(ImmutableList.<String> of(), content);

        String sanitizedJs = jsFunction.toString();

        String expected = String.format("function() {%s}", content);
        assertEquals(expected, sanitizedJs);
    }
}
