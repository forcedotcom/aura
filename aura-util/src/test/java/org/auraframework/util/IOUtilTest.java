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

import org.auraframework.util.IOUtil.DeleteFailedException;
import org.auraframework.util.test.util.UnitTestCase;

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

    public void testCreateTempDirTwiceReturnsDifferentPaths() throws Exception {
        String prefix = "testPrefix";
        String path1 = IOUtil.newTempDir(prefix);
        String path2 = IOUtil.newTempDir(prefix);
        File file1 = new File(path1);
        File file2 = new File(path2);
        assertTrue("Failed to create directory on first call to IOUtil.newTempDir",
                file1.exists() && file1.isDirectory());
        assertTrue("Failed to create directory on second call to IOUtil.newTempDir",
                file2.exists() && file2.isDirectory());
        assertFalse("IOUtil.newTempDir should not return the same path on subsequent calls", path1.equals(path2));
    }

    public void testCreateTempDirWithNullParamSucceeds() throws Exception {
        String path = IOUtil.newTempDir(null);
        File file = new File(path);
        assertTrue("Failed to create directory with null parameter", file.exists() && file.isDirectory());
    }

    public void testGetDefaultTempDirReturnsSamePathOnSubsequentCalls() throws Exception {
        String path1 = IOUtil.getDefaultTempDir();
        String path2 = IOUtil.getDefaultTempDir();
        File file1 = new File(path1);
        File file2 = new File(path2);
        assertTrue("Failed to create directory on first call to IOUtil.getDefaultTempDir",
                file1.exists() && file1.isDirectory());
        assertTrue("Failed to create directory on second call to IOUtil.getDefaultTempDir",
                file2.exists() && file2.isDirectory());
        assertTrue("IOUtil.getDefaultTempDir should return the same path on subsequent calls", path1.equals(path2));
    }
}
