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
package org.auraframework.impl.test.util;

import org.auraframework.impl.util.TypeParser;
import org.auraframework.impl.util.TypeParser.Type;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;

/**
 * Util to handle parsing of tags and classes
 */
public class TypeParserTest {
    //****************** Strict *********************
    @Test
    public void testStrictFull() {
        String input = "prefixValue://namespaceValue:nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespaceValue")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testStrictFullDashInNamespace() {
        String input = "prefixValue://namespace-Value:nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespace-Value")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testStrictInvalidSep_Negative() {
        String input = "prefixValue://namespaceValue.nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    @Test
    public void testStrictWithTriple_Negative() {
        String input = "namespaceValue:nameValue:extra";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    @Test
    public void testStrictWithInvalidChar() {
        String input = "namespaceValue:name-Value";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    @Test
    public void testStrictNoPrefix() {
        String input = "namespaceValue:nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespaceValue")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testStrictNoNamespace() {
        String input = "prefixValue://nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testStrictNoPrefixNoNamespace() {
        String input = "nameValue";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testStrictNoPrefixNoNamespaceWithDash_Negative() {
        String input = "name-Value";
        Type actual = TypeParser.parseTagStrict(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    //****************** Standard (Relaxed) *********************
    @Test
    public void testFull() {
        String input = "prefixValue://namespaceValue:nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespaceValue")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testFullDashInNamespace() {
        String input = "prefixValue://namespace-Value:nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespace-Value")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }


    @Test
    public void testInvalidSep() {
        String input = "prefixValue://namespaceValue.nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespaceValue")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testWithTriple() {
        String input = "namespaceValue:nameValue:extra";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    @Test
    public void testNoPrefix() {
        String input = "namespaceValue:nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("namespaceValue")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testNoNamespace() {
        String input = "prefixValue://nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testNoPrefixNoNamespace() {
        String input = "nameValue";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("nameValue"))));
    }

    @Test
    public void testNoPrefixNoNamespaceWithDash() {
        String input = "name-Value";
        Type actual = TypeParser.parseTag(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    //****************** Types *********************
    @Test
    public void testClassFull() {
        String input = "prefixValue://a.b.c<d,e>";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("a.b")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("c<d,e>")),
                                                 /* Matchers.hasProperty("subName", Matchers.nullValue()), */
                                                 Matchers.hasProperty("nameParameters", Matchers.equalTo("<d,e>"))));
    }

    @Test
    public void testClassFullNoNameParams() {
        String input = "prefixValue://a.b.c";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("a.b")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("c")),
                                                 /* Matchers.hasProperty("subName", Matchers.nullValue()), */
                                                 Matchers.hasProperty("nameParameters", Matchers.nullValue())));
    }

    // We don't support nested name parameters (ugh).
    public void testClassFullBadNameParams_Negative() {
        String input = "prefixValue://a.b.c<d<e>>";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }

    public void testClassNoNamespace() {
        String input = "prefixValue://c";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.equalTo("prefixValue")),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("c")),
                                                 /* Matchers.hasProperty("subName", Matchers.nullValue()), */
                                                 Matchers.hasProperty("nameParameters", Matchers.nullValue())));
    }

    public void testClassNoNamespaceNoPrefix() {
        String input = "c";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.nullValue()),
                                                 Matchers.hasProperty("name", Matchers.equalTo("c")),
                                                 /* Matchers.hasProperty("subName", Matchers.nullValue()), */
                                                 Matchers.hasProperty("nameParameters", Matchers.nullValue())));
    }

    public void testClassNoPrefix() {
        String input = "a.c";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.allOf(Matchers.hasProperty("prefix", Matchers.nullValue()),
                                                 Matchers.hasProperty("namespace", Matchers.equalTo("a")),
                                                 Matchers.hasProperty("name", Matchers.equalTo("c")),
                                                 /* Matchers.hasProperty("subName", Matchers.nullValue()), */
                                                 Matchers.hasProperty("nameParameters", Matchers.nullValue())));
    }

    public void testClassInvalidSep_Negative() {
        String input = "a:c";
        Type actual = TypeParser.parseClass(input);
        Assert.assertThat(actual, Matchers.nullValue());
    }
}
