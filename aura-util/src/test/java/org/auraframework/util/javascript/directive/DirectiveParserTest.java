/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.util.javascript.directive;

import java.io.File;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedList;
import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.impl.IncludeDirectiveType;

import com.google.common.collect.ImmutableList;

/**
 * This class is to test the DirectiveParser class {@link DirectiveParser}. DirectiveParser class parses specified files
 * for directives. Directives are specified with //# as prefix. The list of directives, root node of the file system and
 * javascript generation modes are specified in an DirectiveBasedJavascriptGroup object.
 */
public class DirectiveParserTest extends UnitTestCase {
    public DirectiveParserTest(String name) {
        super(name);
    }

    /**
     * Try to pass an empty set of directive. Ideally the test should return just the contents of the file after
     * stripping of all the lines with directives (lines starting with //#)
     */
    public void testZeroDirectiveTypes() throws Exception {
        File file = getResourceFile("/testdata/javascript/head.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), new ArrayList<DirectiveType<?>>(), EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.PRODUCTION), ".js");
    }

    /**
     * "end" is a reserved DirectiveType label. This must not be used by other directives.
     */
    public void testEndDirectiveTypes() throws Exception {
        File file = getResourceFile("/testdata/javascript/head.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getEndDirective()), EnumSet.of(
                        JavascriptGeneratorMode.DEVELOPMENT, JavascriptGeneratorMode.TESTING,
                        JavascriptGeneratorMode.PRODUCTION));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        try {
            dp.parseFile();
            fail("Passing an END directive should have thrown an exception");
        } catch (RuntimeException e) {
            assertTrue("The Javascript Processor failed for some unkown reason",
                    e.getMessage().equals("cannot create a directive with the reserved label \"end\""));
        }
    }

    /**
     * Duplicate directive labels must not be accepted
     */
    public void testDupDirectiveTypes() throws Exception {
        File file = getResourceFile("/testdata/javascript/head.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMockDirective(),
                        DirectiveFactory.getDummyDirectiveType(), DirectiveFactory.getMockDirective()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        try {
            dp.parseFile();
            fail("Passing an directives with duplicate labels should have failed");
        } catch (RuntimeException e) {
            assertTrue("The Javascript Processor failed for some unkown reason",
                    e.getMessage().startsWith("Mutliple directives registered for label"));
        }
    }

    /*
     * Tests for the parse() method in DirectiveParser
     */
    /**
     * What if the javascript that is being processed has a standard DirectiveType but the Javascript Group does not
     * have a reference to that type.
     */
    public void testMissingDirectiveSpecification() throws Exception {
        File file = getResourceFile("/testdata/javascript/testMissingDirectiveSpecification.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMockDirective()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        List<JavascriptProcessingError> error = dp.validate(new JavascriptValidator());
        assertTrue("Should have thrown one error for unrecognized directive", error.size() == 1);
    }

    /**
     * Negative test: Multi line directive without an END
     * directive
     */
    public void testMultilineWithoutEndDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/testMultilineWithoutEndDirective.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        List<JavascriptProcessingError> error = dp.validate(new JavascriptValidator());
        assertTrue("Should have thrown an error for not closing a multiline directive", error.size() == 1);
        assertTrue("The only error should have been for an missing end directive.", error.listIterator().next()
                .getMessage().equals("no end found for directive"));
    }

    /**
     * Negative test: Multi line directive with no opening directive statement
     */
    public void testJustEndDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/testJustEndDirective.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        List<JavascriptProcessingError> error = dp.validate(new JavascriptValidator());
        assertTrue(
                "Should have thrown an error for having just an end directive without a matching opening multiline directive",
                error.size() == 1);
        assertTrue("The only error should have been for an unmatched end directive.", error.listIterator().next()
                .getMessage().equals("unmatched end directive"));
    }

    /**
     * Negative test: A nested directive is not supported yet. So an error should be flagged when such directives are
     * encountered.
     */
    public void testNestedDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/testNestedDirective.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType(),
                        new IncludeDirectiveType()), EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        List<JavascriptProcessingError> error = dp.validate(new JavascriptValidator());
        assertTrue("Should have thrown an error for encoutering a multi-line directive", error.size() == 1);
        assertTrue("The only error should have been for an unmatched end directive.", error.listIterator().next()
                .getMessage().equals("nested directive found, ignored"));

    }

    /**
     * Positive test: Test a multiline directive by gold filing the contents passed to the directive object
     */
    public void testMultilineDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/testMultilineDirective.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        LinkedList<Directive> directives = dp.directives;
        Directive multiLine = directives.getFirst();
        assertTrue("Should have created a MultiLineMockDirective after parsing the file", multiLine.getClass()
                .getName().contains("MultiLineMockDirective"));
        // This dummy MultiLineMockDirective is written to throw content when asked to generateOutput
        goldFileText(multiLine.generateOutput(JavascriptGeneratorMode.TESTING), ".js");
    }

    /*
     * Tests for the generate() method in DirectiveParser
     */
    public void testCallGenerateBeforeParse() throws Exception {
        File file = getResourceFile("/testdata/javascript/testMultilineDirective.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        try {
            dp.generate(JavascriptGeneratorMode.TESTING);
            fail("Parser should generate output only after parsing the files");
        } catch (Exception expected) {
            // Should say generate cannot be called before parsing the group
        }
    }

    /**
     * Gold filing the output generated by different kinds of generation modes
     */
    public void testAllKindsOfDirectiveGenerate() throws Exception {
        File file = getResourceFile("/testdata/javascript/testAllKindsOfDirectiveGenerate.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveFactory.getMultiLineMockDirectiveType(),
                        DirectiveFactory.getMockDirective(), DirectiveFactory.getDummyDirectiveType()), null);
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.TESTING), "_test.js");
        goldFileText(dp.generate(JavascriptGeneratorMode.AUTOTESTING), "_auto.js");
        // The content generated in PRODUCTION mode still has comments because the DirectiveParser doesn't really
        // compress the JS files.
        // Compression is handled in DirectivebasedJavascriptGroup
        goldFileText(dp.generate(JavascriptGeneratorMode.PRODUCTION), "_prod.js");
        goldFileText(dp.generate(JavascriptGeneratorMode.DEVELOPMENT), "_dev.js");
        // There should be just one error for the Nested Multiline Directive
        assertTrue("Should not have found any error while processing this file", dp.validate(new JavascriptValidator())
                .size() == 1);
    }

    public void testParser() throws Exception {
        TestGroup g = new TestGroup(getResourceFile("/testdata/directive/testParser.js"));
        DirectiveParser parser = new DirectiveParser(g, g.getStartFile());
        parser.parseFile();
        LinkedList<Directive> directives = parser.directives;
        assertEquals("didn't found the right number of directives", 2, directives.size());
        // directives are in reverse order
        Directive last = directives.get(0);
        Directive first = directives.get(1);
        assertEquals(last.getLine(), "{\"modes\": [\"MOCK2\"]}");
        assertTrue(last.hasOutput(JavascriptGeneratorMode.MOCK2));
        assertFalse(last.hasOutput(JavascriptGeneratorMode.MOCK1));
        assertFalse(last.hasOutput(JavascriptGeneratorMode.PRODUCTION));
        assertEquals(first.getLine(), "{\"modes\": [\"MOCK1\"]}");
        assertTrue(first.hasOutput(JavascriptGeneratorMode.MOCK1));
        assertFalse(first.hasOutput(JavascriptGeneratorMode.MOCK2));
        assertFalse(first.hasOutput(JavascriptGeneratorMode.PRODUCTION));
        List<JavascriptProcessingError> errors = parser.validate(new JavascriptValidator());
        assertTrue("should not have been any validation errors", errors.isEmpty());
    }

    /**
     * tests that a directive can begin with // #
     */
    public void testSpaceInDirective() throws Exception {
        TestGroup g = new TestGroup(getResourceFile("/testdata/javascript/testSpaces.js"));
        DirectiveParser parser = new DirectiveParser(g, g.getStartFile());
        parser.parseFile();
        LinkedList<Directive> directives = parser.directives;
        assertEquals("didn't found the right number of directives", 3, directives.size());
        // directives are in reverse order
        Directive third = directives.get(0);
        Directive second = directives.get(1);
        Directive first = directives.get(2);
        assertTrue(first.hasOutput(JavascriptGeneratorMode.MOCK2));
        assertFalse(first.hasOutput(JavascriptGeneratorMode.MOCK1));
        assertEquals(first.getLine(), "{\"modes\": [\"MOCK2\"], \"blah\": \"my\"}");
        assertTrue(second.hasOutput(JavascriptGeneratorMode.MOCK1));
        assertFalse(second.hasOutput(JavascriptGeneratorMode.MOCK2));
        assertEquals(second.getLine(), "{\"modes\": [\"MOCK1\"], \"blah\": \"spatula\"}");
        assertTrue(third.isMultiline());
        List<JavascriptProcessingError> errors = parser.validate(new JavascriptValidator());
        assertTrue("should not have been any validation errors", errors.isEmpty());
    }
}
