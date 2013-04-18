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
package org.auraframework.util.javascript.directive.impl;

import java.io.IOException;
import java.util.EnumSet;
import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * Tests for DirectiveImpl {@link DirectiveImpl}. DirectiveImpl Expects to
 * receive the configuration for a directive as a JSON string. This class is to
 * test the basic implementation in DirectiveImpl abstract class.
 */
public class DirectiveImplTest extends UnitTestCase {
    public DirectiveImplTest(String name) {
        super(name);
    }

    /**
     * 1. Testing basic initialization stuff of DirectiveImpl 2. Tests that
     * content cannot be set for a MultiLine Directive
     * 
     * @throws Exception
     */
    public void testDirectiveImpl() throws Exception {
        String s = "{\"modes\": [\"DEVELOPMENT\"], \"thing\": \"stuff\"}";
        TestDirective d = new TestDirective(56, s);
        assertFalse("The base DirectImpl directive should not be multiline", d.isMultiline());
        assertEquals("Setting the right offset value for the Directive failed", 56, d.getOffset());
        assertEquals("Passing the right Configuration for the directive failed", s, d.getLine());
        assertEquals("Expected only 1 generator mode", 1, d.getModes().size());
        assertTrue("Didnt find the right mode", d.getModes().contains(JavascriptGeneratorMode.DEVELOPMENT));
        assertTrue("Didn't register the specified generation mode", d.hasOutput(JavascriptGeneratorMode.DEVELOPMENT));
        try {
            d.setContent("blah");
            fail("Shouldn't be here: Content cannot be set for non-multiline directives");
        } catch (UnsupportedOperationException e) {
            assertTrue("Not a multiline directive".equals(e.getMessage()));
        }
        try {
            d.getContent();
            fail("Shouldn't be here: Content cannot be got for non-multiline directives");
        } catch (UnsupportedOperationException e) {
            assertTrue("Not a multiline directive".equals(e.getMessage()));
        }
    }

    /**
     * Test various combinations of mode string that could be sent for
     * Constructing a Directive {@link DirectiveImpl#DirectiveImpl(int, String)}
     * .
     * 
     * @throws Exception
     */
    public void testCombinationsOfConfigs() throws Exception {
        String[] sample = { "literal", "{\"mode\": [\"MOCK2\"], \"blah\": \"howdy doody\"}",
                "{\"modes\":, \"blah\": \"howdy doody\"}", "{\"modes\": [], \"blah\": \"howdy doody\"}",
                "{\"modes\": [\"blah\"], \"blah\": \"howdy doody\"}",
                "{\"modes\": [\"MOCK1\", \"MOCK2\"], \"blah\": \"son of a diddly\"}",
                "{\"modes\": [\"MOCK2\"], \"blah\": \"howdy doody\"}",
                "{\"blah\": \"howdy doody\", \"modes\": [\"MOCK2\"], \"blah\": \"son of a diddly\" }",
                "{\"modes\" : [\"TESTING\",\"DEVELOPMENT]}",
                "{\"modes\" : [\"TESTING\",\"DEVELOPMENT\"],  \"blah\": \"howdy doody}" };
        TestDirective d;
        // Literal
        d = new TestDirective(4, sample[0]);
        assertTrue("Unstructured directives should not be processed", d.getConfig() == null);
        assertTrue("When no mode is specified, all modes should be used by default",
                d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
        // Incorrect key "mode" instead of "modes"
        d = new TestDirective(4, sample[1]);
        assertTrue("When no mode is specified, all modes should be used by default",
                d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
        /**
         * TODO: https://gus.soma.salesforce.com/a0790000000DOV9AAO //Blank mode
         * value d = new TestDirective(4,sample[2]); assertTrue(
         * "When no mode is specified, all modes should be used by default"
         * ,d.getModes ().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
         */
        // Blank key value for Mode
        /**
         * d = new TestDirective(4,sample[3]); assertTrue(
         * "When no mode is specified, all modes should be used by default"
         * ,d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
         */
        /**
         * TODO: Non existant mode should be checked Non existant mode
         * java.lang.IllegalArgumentException: No enum const class
         * lib.javascript.directive.JavascriptGeneratorMode.blah d = new
         * TestDirective(4,sample[4]); assertTrue(
         * "When no mode is specified, all modes should be used by default"
         * ,d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
         */

        // Two Modes
        d = new TestDirective(4, sample[5]);
        assertTrue(d.getConfig().toString().equals("{modes=[MOCK1, MOCK2], blah=son of a diddly}"));

        // One Mode
        d = new TestDirective(4, sample[6]);
        assertTrue(d.getConfig().toString().equals("{modes=[MOCK2], blah=howdy doody}"));

        // Tests 2 things
        // 1. that mode can be specified in the middle of a config line
        // 2. When two values are specified for the same key value, the right
        // most assignment will be used
        d = new TestDirective(4, sample[7]);
        assertTrue(d.getConfig().toString().equals("{modes=[MOCK2], blah=son of a diddly}"));

        d = new TestDirective(4, sample[8]);
        assertTrue(d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));

        d = new TestDirective(4, sample[9]);
        assertTrue(d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
        /**
         * TODO: Check these
         */
        String emptyString = "";
        d = new TestDirective(4, emptyString);
        assertTrue("When an empty string is provided for mode, all modes should be used by default", d.getModes()
                .equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
        String nullString = null;
        d = new TestDirective(4, nullString);
        assertTrue("When a null string is provided for mode, all modes should be used by default",
                d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));

    }

    /**
     * Test excluseModes specification in directive.
     */
    public void testExcludeModes() {
        String[] sample = {
                // 0: Positive case: Simple excludes mode
                "{\"excludeModes\": [\"MOCK2\"], \"blah\": \"howdy doody\"}",
                // 1: Negative case: Both excludes and includes
                "{\"modes\" : [\"TESTING\",\"DEVELOPMENT\"], \"excludeModes\" : [\"TESTING\",\"DEVELOPMENT\"]}",
                // 2:
                "{\"excludeModes\" : []}",
                // 3:
                "{\"excludeModes\" : [\"foobar\"]}", };
        TestDirective d;
        d = new TestDirective(4, sample[0]);
        EnumSet<JavascriptGeneratorMode> expectedModes = EnumSet.allOf(JavascriptGeneratorMode.class);
        expectedModes.remove(JavascriptGeneratorMode.MOCK2);
        assertTrue("Failed to Exclude specified mode", d.getModes().equals(expectedModes));

        try {
            d = new TestDirective(4, sample[1]);
            fail("Should not be allowed to use 'excludesModes' and 'modes' in a directive");
        } catch (UnsupportedOperationException expected) {
        }

        d = new TestDirective(4, sample[2]);
        assertTrue("All modes should be included when 'excludeModes' specifies a empty config.",
                d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));

        /**
         * TODO: W-749502 Non existant mode should be checked Non existant mode
         * java.lang.IllegalArgumentException: No enum const class
         * lib.javascript.directive.JavascriptGeneratorMode.blah d = new
         * TestDirective(4, sample[4]); assertTrue(
         * "All modes should be included when 'excludeModes' specifies garbage ."
         * , d.getModes().equals(EnumSet.allOf(JavascriptGeneratorMode.class)));
         */

    }

    private static class TestDirective extends DirectiveImpl {
        public TestDirective(int offset, String line) {
            super(offset, line);
        }

        @Override
        public String generateOutput(JavascriptGeneratorMode mode) {
            return null;
        }

        @Override
        public void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException {

        }

        @Override
        public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
            return null;
        }
    }
}
