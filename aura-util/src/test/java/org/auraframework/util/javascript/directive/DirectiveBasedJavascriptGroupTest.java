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

import java.io.*;
import java.util.EnumSet;

import org.auraframework.test.UnitTestCase;

import com.google.common.collect.ImmutableList;

/**
 * Automation for verifying the implementation in DirectiveBasedJavascriptGroupTest
 * {@link DirectiveBasedJavascriptGroup}. Javascript files can be grouped in modules.
 * This helps in keeping the javascript modularized.
 */
public class DirectiveBasedJavascriptGroupTest extends UnitTestCase {
    public DirectiveBasedJavascriptGroupTest(String name) {
        super(name);
    }

    /**
     * Should not be able to specify a Directory as start file for a Javascript group
     */
    public void testPassingDirForStartFile() throws Exception {
        try {
            DirectiveBasedJavascriptGroup test = new DirectiveBasedJavascriptGroup("test",
                    getResourceFile("/testdata/"), "javascript", ImmutableList.<DirectiveType<?>>of(DirectiveFactory
                            .getDummyDirectiveType()), EnumSet.of(JavascriptGeneratorMode.TESTING));
            fail("Creating a Directive Based javascript Group by specifying a directory as start file should have failed."
                    + test.getName());
        } catch (IOException e) {
            assertTrue(e.getMessage().startsWith("File did not exist or was not a .js file: "));
        }
    }

    /**
     * Check the workings of isStale(). isStale() only checks the last modified time stamp of EXISTING files in the
     * group. If new files are added, then isStale() will not reflect the real state of the group. However, if you were
     * to INCLUDE a new js file using a include directive in on of the files in the group , then isStale() would still
     * work.
     */
    public void testisStale() throws Exception {
        File newFile = getResourceFile("/testdata/javascript/testisStale.js");
        newFile.getParentFile().mkdirs();
        Writer writer = new FileWriter(newFile, false);
        try {
            writer.append(new Long(System.currentTimeMillis()).toString());
            writer.flush();
        } finally {
            writer.close();
        }

        try {
            DirectiveBasedJavascriptGroup test = new DirectiveBasedJavascriptGroup("test", newFile.getParentFile(),
                    newFile.getName(), ImmutableList.<DirectiveType<?>>of(DirectiveFactory.getDummyDirectiveType()),
                    EnumSet.of(JavascriptGeneratorMode.TESTING));
            // Immediately after the javascript group is instantiated, the group is not stale yet
            assertFalse(test.isStale());
            // Need this sleep so the last modified time changes, otherwise the test runs too fast and the test fails
            // because the last modified time was not updated by the OS
            Thread.sleep(2000);
            // Update a js file which is part of the group
            writer = new FileWriter(newFile, false);
            writer.append(new Long(System.currentTimeMillis()).toString());
            writer.close();
            assertTrue("An existing file in the group was modified and isStale() could not recognize the modification",
                    test.isStale());
        } finally {
            newFile.delete();
        }
    }

    /**
     * Use the javascript processor to generate javascript files in 5 modes. Gold file the five modes and also verify
     * that the file was not created in the 6th mode.
     */
    public void testJavascriptGeneration() throws Exception {
        File file = getResourceFile("/testdata/javascript/testAllKindsOfDirectiveGenerate.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>>of(DirectiveFactory.getMultiLineMockDirectiveType(),
                        DirectiveFactory.getMockDirective(), DirectiveFactory.getDummyDirectiveType()), EnumSet.of(
                        JavascriptGeneratorMode.DEVELOPMENT, JavascriptGeneratorMode.AUTOTESTING,
                        JavascriptGeneratorMode.PRODUCTION,
                        JavascriptGeneratorMode.MOCK1, JavascriptGeneratorMode.MOCK2));
        String expectedGenFiles[] = { "testDummy_auto", "testDummy_dev", "testDummy_mock1",
                "testDummy_mock2", "testDummy_prod" };
        File dir = getResourceFile("/testdata/javascript/generated/");
        try {
            jg.parse();
            jg.generate(dir, false);
            for (String genFileName : expectedGenFiles) {
                File genFile = new File(dir, genFileName + ".js");
                if (!genFile.exists()) {
                    fail("Javascript processor failed to create " + genFile.getAbsolutePath());
                } else {
                    StringBuilder fileContents = new StringBuilder();
                    BufferedReader reader = new BufferedReader(new FileReader(genFile));
                    try {
                        String line = reader.readLine();
                        while (line != null) {
                            fileContents.append(line);
                            fileContents.append("\n");
                            line = reader.readLine();
                        }
                    } finally {
                        reader.close();
                    }
                    goldFileText(fileContents.toString(), "/" + genFileName + ".js");
                }
            }
        } finally {
            // Regardless of the javascript processor generating the files, clean up the expected files
            for (String genFileName : expectedGenFiles) {
                File genFile = new File(dir, genFileName + ".js");
                if (genFile.exists()) genFile.delete();
            }
        }
        File unExpectedGenFile = new File(dir, "testDummy_test.js");
        assertFalse(
                "javascript processor generated a file for test mode even though the group was not specified to do so.",
                unExpectedGenFile.exists());
    }

    /**
     * Make sure the processor regeneration stops when there are errors in the source file
     */
    public void _testJavascriptReGenerationFails() throws Exception {
        File file = getResourceFile("/testdata/javascript/testJavascriptReGenerationFails.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("regenerationFail", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>>of(DirectiveFactory.getMockDirective()),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        try {
            jg.regenerate(getResourceFile("/testdata/javascript/generated/"));
            fail("The test should fail because this source file has a multilinemock directive but the javascript was created with just a mock directive");
        } catch (RuntimeException expected) {
            // This is just an extra check
            String notExpectedGenFile = "regenerationFail_test.js";
            File genFile = new File(getResourceFile("/testdata/javascript/generated/"), notExpectedGenFile);
            assertFalse("The javascript processor should not have created this file.", genFile.exists());
        }

    }
}
