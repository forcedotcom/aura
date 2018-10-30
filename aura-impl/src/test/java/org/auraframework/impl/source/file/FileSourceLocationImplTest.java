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
package org.auraframework.impl.source.file;

import static org.junit.Assert.assertEquals;

import java.io.File;

import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.rules.TemporaryFolder;

public class FileSourceLocationImplTest {
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Test
    public void testDirectoryDoesntExist() {
        File dir = new File(folder.getRoot(), "i_dont_exist");

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage(String.format(
                "Source directory '%s' does not exist or is not a directory",
                dir.getAbsolutePath()));

        new FileSourceLocationImpl(dir, true, false);
    }

    @Test
    public void testFileNotDirectory() throws Exception {
        File dir = folder.newFile("im_not_a_folder");

        thrown.expect(AuraRuntimeException.class);
        thrown.expectMessage(String.format(
                "Source directory '%s' does not exist or is not a directory",
                dir.getAbsolutePath()));

        new FileSourceLocationImpl(dir, true, false);
    }

    @Test
    public void testUsesCanonicalPaths() throws Exception {
        File componentsDir = folder.newFolder("components");
        File dir = new File(componentsDir, "././");

        FileSourceLocationImpl location = new FileSourceLocationImpl(dir, true, false);

        String expectedPath = dir.getCanonicalPath();
        String actualPath = location.getSourceDirectory().getPath();

        assertEquals("expected path to match canonical path", expectedPath, actualPath);
    }
}
