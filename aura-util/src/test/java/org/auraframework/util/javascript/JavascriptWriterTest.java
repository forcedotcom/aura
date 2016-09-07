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
package org.auraframework.util.javascript;

import java.io.StringWriter;
import java.util.List;

import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

public class JavascriptWriterTest extends UnitTestCase{

    @Test
    public void testLibraryCompressConvertsWildCardForRegExpLiteral() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "var a = /abc*/;";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected = "var a = /abc{0,}/;\n";
        assertEquals(expected, writer.toString());
    }

    /**
     * Verify that CLOSURE_LIBRARY.compress replaces the * in RegExp constructor when * is in the last string node.
     */
    @Test
    public void testLibraryCompressConvertsWildCardForRegExpConstructor() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "var a = new RegExp(\"^\" + b + \"*,\" + b + \"*\");";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = new RegExp(\"^\" + b + \"*,\" + b + \"{0,}\");\n";
        assertEquals(expected, writer.toString());
    }

    @Test
    public void testLibraryCompressConvertsWildCardForRegExpConstructorWithFlag() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "var a = new RegExp(\"^\" + b + \"*,\" + b + \"*\", \"g\");";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = new RegExp(\"^\" + b + \"*,\" + b + \"{0,}\", \"g\");\n";
        assertEquals(expected, writer.toString());
    }

    @Test
    public void testLibraryCompressConvertsEscapedWildCardToUnicodeForRegExpLiteral() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "str.replace(/[abc\\*]+/g, '')";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "str.replace(/[abc\\u002A]+/g, \"\");\n";
        assertEquals(expected, writer.toString());
    }

    @Test
    public void testLibraryCompressConvertsEscapedWildCardToUnicodeForRegExpConstructor() throws Exception {
        StringWriter writer = new StringWriter();
        // In JS, string "\*" is converted into "*", so to escape a char in RegExp, it has to be "\\*"
        String script = "var a = new RegExp('abc\\\\*')";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = new RegExp(\"abc\\\\u002A\");\n";
        assertEquals(expected, writer.toString());
    }

    @Test
    public void testLibraryCompressConvertsCloseCommentString() throws Exception {
        StringWriter writer = new StringWriter();
        // In JS, string "\*" is converted into "*", so to escape a char in RegExp, it has to be "\\*"
        String script = "var a = '*/'";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = \"*#_#/\".replace(/\\*#_#/g, \"*\");\n";
        assertEquals(expected, writer.toString());
    }

    @Test
    public void testLibraryCompressConvertsMultipleCloseCommentsInString() throws Exception {
        StringWriter writer = new StringWriter();
        // In JS, string "\*" is converted into "*", so to escape a char in RegExp, it has to be "\\*"
        String script = "var a = '*/abc*/'";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = \"*#_#/abc*#_#/\".replace(/\\*#_#/g, \"*\");\n";
        assertEquals(expected, writer.toString());
    }

    /**
     * Verify that CLOSURE_LIBRARY.compress converts the wildcard when the pattern string contains close comments.
     *
     * This is a corner case for RegExp constructor because we have logic to take care of close comment in string node.
     */
    @Test
    public void testLibraryCompressConvertsCloseCommentStringInRegExpConstructor() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "var a = new RegExp('*/')";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = new RegExp(\"{0,}/\");\n";
        assertEquals(expected, writer.toString());
    }

    /**
     * Verify that CLOSURE_LIBRARY.compress converts the wildcard when the pattern string contains close comments and the
     * wildcard symbol is escaped.
     *
     * This is a corner case for RegExp constructor because we have logic to take care of close comment in string node.
     */
    @Test
    public void testLibraryCompressConvertsCloseCommentStringWithEscapedWildCardInRegExpConstructor() throws Exception {
        StringWriter writer = new StringWriter();
        String script = "var a = new RegExp('\\\\*/')";

        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_LIBRARY.compress(script, writer, "filename");

        assertTrue("Found compilation erros: " + errors, errors.isEmpty());
        String expected =  "var a = new RegExp(\"\\\\u002A/\");\n";
        assertEquals(expected, writer.toString());
    }
}
