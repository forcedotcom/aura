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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import org.auraframework.test.UnitTestCase;

/**
 * Tests for CommonJavascriptGroupImpl class {@link CommonJavascriptGroupImpl}.
 * This class has implementation of some common functionality required for
 * grouping javascript files in modules. The current class has some tests for
 * verifying the implementation of javascript grouping functionality.
 */
public class CommonJavascriptGroupImplTest extends UnitTestCase {
    public CommonJavascriptGroupImplTest(String name) {
        super(name);
    }

    /**
     * Test basic initialization and other exposed public methods of
     * CommonJavascriptGroupImpl.java.
     * 
     * @throws Exception
     */
    public void testBasicInitialization() throws Exception {
        getResourceFile("/testdata/javascript/head.js");
        getResourceFile("/testdata/javascript/JSfilterValidation.junk.js");
        File file = getResourceFile("/testdata/javascript/dummyDir/innerSibling.js");
        CommonJavascriptGroupImpl localCJG = new TestCommonJavascriptGroupImpl("test", file.getParentFile()
                .getParentFile());
        assertEquals("Javascript Group name not set on the group object", localCJG.getName(), "test");
        // Verify Initialization
        verifyCleanState(localCJG);
        localCJG.reset();
        verifyCleanState(localCJG);
        String validJSFile = "head.js";
        String validJSDirectory = "/dummyDir";
        String invalidJSFile = "JSfilterValidation.junk.js";
        String invalidJSDirectory = "/javascriptBoogaBoo";
        // Add a directory to the group
        localCJG.addDirectory(validJSDirectory);
        assertTrue("Directories should be accepted for Javascript Groups", localCJG.getFiles().size() == 1);
        // There should only be one js file and that should be innersibling.js
        assertTrue("", localCJG.getFiles().iterator().next().getName().equals(file.getName()));
        localCJG.reset();
        try {
            localCJG.addDirectory(validJSFile);
            fail("Add Directory should not be accepting files");
        } catch (FileNotFoundException e) {
            assertTrue("Add Directory function failed because of an unexpected error",
                    e.getMessage().equals("Directory did not exist: " + validJSFile));
        }
        try {
            localCJG.addDirectory(invalidJSDirectory);
            fail("Add Directory should not be accepting non existing directories");
        } catch (FileNotFoundException e) {
            assertTrue("Add Directory function failed because of an unexpected error",
                    e.getMessage().equals("Directory did not exist: " + invalidJSDirectory));
        }
        // Add an invalid file but one that ends in .js
        localCJG.addFile(invalidJSFile);
        assertFalse("Only valid Javascript files can be accepted", localCJG.getFiles().size() == 0);
        // Add a valid javascript file
        localCJG.addFile(validJSFile);
        File[] list = localCJG.getFiles().toArray(new File[localCJG.getFiles().size()]);
        assertFalse("Addition of a valid javascript file failed",
                list.length == 1 || list[0].getName().equals("head.js"));
        localCJG.reset();
        try {
            localCJG.addFile(validJSDirectory);
            fail("Add File should not be accepting files");
        } catch (FileNotFoundException e) {
            assertTrue("Add File function failed because of an unexpected error",
                    e.getMessage().startsWith("File did not exist or was not a .js file: "));
        }
        try {
            localCJG.addFile(invalidJSDirectory);
            fail("Add File should not be accepting non existing directories");
        } catch (FileNotFoundException e) {
            assertTrue("Add File function failed because of an unexpected error",
                    e.getMessage().startsWith("File did not exist or was not a .js file: "));
        }
        // Create a new file and add it to the Group and verify that the last
        // mod date has been changed.
        localCJG.reset();
        String newFileName = new Long(System.currentTimeMillis()).toString() + ".js";
        File newFile = new File(localCJG.root, newFileName);
        Writer writer = new FileWriter(newFile);
        writer.write("");
        writer.close();
        localCJG.addFile(newFileName);
        try {
            assertTrue("Last modified time of javascript group not set", localCJG.lastMod == newFile.lastModified());
        } finally {
            newFile.delete();
        }
    }

    /*
     * Helper Function, add more stuff as CommonJavascriptGroup gets Fleshed out
     */
    public void verifyCleanState(CommonJavascriptGroupImpl pCJG) throws IOException {
        assertTrue("Last modified date not initialized to -1", pCJG.lastMod == -1);
        assertTrue("javascript Group should not be initialized with a list of files", pCJG.getFiles().size() == 0);
        assertTrue("Hash should not be unset", pCJG.getGroupHash().isSet());
        assertTrue("Hash should not be empty", pCJG.getGroupHash().toString().length() > 0);
    }

    private static class TestCommonJavascriptGroupImpl extends CommonJavascriptGroupImpl {
        public TestCommonJavascriptGroupImpl(String s, File f) {
            super(s, f);
        }

        @Override
        public void generate(File destRoot, boolean doValidation) throws IOException {
        }

        @Override
        public boolean isStale() {
            return false;
        }

        @Override
        public void parse() throws IOException {
        }

        @Override
        public void postProcess() {
        }

        @Override
        public void regenerate(File destRoot) throws IOException {
        }
    }
}
