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
package org.auraframework.util;

import java.io.File;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.IOUtil.DeleteFailedException;

import com.google.common.io.Files;

public class IOUtilTest extends UnitTestCase {
    public IOUtilTest(String name) {
        super(name);
    }

    public void testDelete() throws Exception {
        File testFolder = null;
        File testFile = null;
        // Delete null
        try {
            IOUtil.delete(testFile);
        } catch (Exception e) {
            fail("IOUtil.delete() wasn't able to handle null");
        }

        // Delete non exisitng directory
        testFile = new File("/foo/bar");
        try {
            IOUtil.delete(testFile);
        } catch (Exception e) {
            fail("IOUtil.delete() wasn't able to handle non existing file");
        }

        // Delete File
        try {
            testFolder = Files.createTempDir();
            testFile = File.createTempFile("tmpFile", null, testFolder);
            assertTrue(testFile.exists());
            IOUtil.delete(testFile);
            assertFalse(testFile.exists());
        } finally {
            testFile.delete();
            assertTrue("test cleanup failed", testFolder.delete());
        }

        // Delete directory and all its children
        testFolder = Files.createTempDir();
        File testFile1 = File.createTempFile("tmpFile", null, testFolder);
        File testFile2 = File.createTempFile("tmpFile", null, testFolder);
        try {
            assertTrue(testFolder.exists());
            IOUtil.delete(testFolder);
            assertFalse(testFile1.exists());
            assertFalse(testFile2.exists());
            assertFalse(testFolder.exists());
        } finally {
            testFile1.delete();
            testFile2.delete();
            testFolder.delete();
        }
        // Delete Directory without write permissions
        testFolder = Files.createTempDir();
        testFolder.mkdir();
        testFolder.setReadable(false, false);
        try {
            IOUtil.delete(testFolder);
            fail("IOUtils did not flag an error when trying to delete a readonly directory.");
        } catch (DeleteFailedException e) {
            assertEquals(String.format("Please fix permissions for %s", testFolder.getAbsolutePath()), e.getMessage());
        } finally {
            testFolder.setReadable(true);
            assertTrue("test cleanup failed", testFolder.delete());
        }
    }
}
