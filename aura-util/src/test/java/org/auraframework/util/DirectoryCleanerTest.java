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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;

import org.junit.Assert;
import org.junit.Test;

import com.google.common.collect.Sets;

public class DirectoryCleanerTest {
    private Path createTempDirectory(String prefix) {
        try {
            Path path = Files.createTempDirectory(prefix);
            return path;
        } catch (Exception e) {
            Path tmpDir = Paths.get(System.getProperty("java.io.tmpdir"));
            if (!Files.exists(tmpDir)) {
                Path parent = tmpDir.getParent();
                while (parent != null && !Files.exists(parent)) {
                    parent = parent.getParent();
                }
                throw new RuntimeException("Temp directory "+tmpDir.toString()
                        +" does not exist first existing parent = "+parent, e);
            }
            throw new RuntimeException("Temp directory "+tmpDir.toString()+" Exists!!!!", e);
        }
    }

    @Test
    public void testDirectoryCleanerOnEmptyDirectory() throws Exception {
        Path path = createTempDirectory("test");
        DirectoryCleaner target = new DirectoryCleaner(path);
        Assert.assertTrue("Our directory must exist prior to run", Files.isDirectory(path));
        target.run();
        Assert.assertFalse("Empty directory should have been deleted", Files.exists(path));
    }

    @Test
    public void testDirectoryCleanerOnNonExistentDirectory() throws Exception {
        Path path = createTempDirectory("test");
        DirectoryCleaner target = new DirectoryCleaner(path);
        Files.delete(path);
        Assert.assertFalse("Path must not exist", Files.exists(path));
        target.run();
        Assert.assertFalse("Path must not exist after the run", Files.exists(path));
    }

    @Test
    public void testDirectoryCleanerWithProtectedDirectory() throws Exception {
        Path path = createTempDirectory("test");
        Path innerDir = path.resolve("protected");
        Path innerFile = innerDir.resolve("foo");
        Files.createDirectory(innerDir);
        Files.createFile(innerFile);
        Files.setPosixFilePermissions(innerDir, Sets.newHashSet(PosixFilePermission.OWNER_READ));

        DirectoryCleaner target = new DirectoryCleaner(path);

        target.run();
        Assert.assertFalse("Path must not exist after the run", Files.exists(path));
    }
}
