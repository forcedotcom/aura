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
package org.auraframework.util.resource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Scanner;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.IOUtil;

import com.google.common.io.Files;

/**
 * Tests for aura.util.resource.ResourceLoader
 */
public class ResourceLoaderTest extends UnitTestCase {
    /**
     * The test folder serves as the root for all temporary files that these
     * tests create so that each test can clean up after itself.
     */
    private File testFolder;

    /**
     * Tests should use this for creating any temporary files or folders for
     * populating the cache.
     */
    private File origFolder;

    /**
     * The cache folder used by the file loader.
     */
    private File cacheFolder;

    /**
     * The standard file-based loader.
     */
    private ResourceLoader fileLoader;

    /**
     * A JAR based loader. Note that refreshing contents in a JAR is currently
     * unsupported.
     */
    private ResourceLoader jarLoader;

    private File jar;

    private File tempFolder;

    private File jarTempFolder;

    private File jarCacheFolder;

    @Override
    public void setUp() throws IOException {
        /**
         * <pre>
         * The test folders are all rooted at /path/to/testRootFolder with the following defaults
         * 
         *  / : the test root
         *  /TestName-ORIG : the original source files that will be cached and read back
         *  /TestName-TEMP: the temp dir used to create the file-based loader
         *  /TestName-TEMP/resourceCache: the resource cache for the file-based loader (initially does not exist)
         *  /TestName-JARTEMP: the temp dir used to create the jar-based loader
         *  /TestName-JARTEMP/resourceCache: the resource cache for the jar-based loader  (initially does not exist)
         *  /TestName.jar: the jar file that packs up the source found in /TestName-ORIG for the jar-based loader.
         * </pre>
         */
        testFolder = Files.createTempDir();
        origFolder = new File(testFolder, getName() + "-ORIG");
        origFolder.mkdir();
        tempFolder = new File(testFolder, getName() + "-TEMP");
        tempFolder.mkdir();
        cacheFolder = new File(tempFolder, ResourceLoader.RESOURCE_CACHE_NAME);
        // Tests create the cacheFolder explicitly.

        jarTempFolder = new File(testFolder, getName() + "-JARTEMP");
        jarTempFolder.mkdir();
        jarCacheFolder = new File(jarTempFolder, ResourceLoader.RESOURCE_CACHE_NAME);
        jar = new File(testFolder, getName() + ".jar");
    }

    @Override
    public void tearDown() throws Exception {
        IOUtil.delete(testFolder);
    }

    private File makeTestFile() throws IOException {
        return File.createTempFile(getName(), null, origFolder);
    }

    private void writeStringToFile(File file, String string) throws IOException {
        FileWriter writer = new FileWriter(file);
        writer.write(string);
        writer.close();
    }

    private String readStreamAsString(InputStream is) {
        return new Scanner(is).useDelimiter("\\A").next();
    }

    private void createResourceLoader(boolean deleteCacheOnStart) throws IOException, URISyntaxException {
        URLClassLoader fileURLLoader = new URLClassLoader(new URL[] { origFolder.toURI().toURL() });
        fileLoader = new ResourceLoader(tempFolder.getPath(), fileURLLoader, deleteCacheOnStart);
    }

    private void createJarResourceLoader(boolean deleteCacheOnStart) throws IOException, URISyntaxException {
        IOUtil.createJarFromFolder(origFolder, jar);
        URLClassLoader jarURLLoader = new URLClassLoader(new URL[] { jar.toURI().toURL() });
        jarLoader = new ResourceLoader(jarTempFolder.getPath(), jarURLLoader, deleteCacheOnStart);
    }

    /**
     * Must specify a cache directory location.
     */
    public void testCacheDirNull() throws Exception {
        try {
            new ResourceLoader(null, null, false);
            fail("No error for null cache dir");
        } catch (RuntimeException e) {
            assertEquals("Unexpected exception message", "Cache dir name must be specified", e.getMessage());
        }
    }

    /**
     * Verify that null value for parent is handled.
     */
    // Automation for "W-1405114"
    public void testParentDirNull() throws Exception {
        try {
            ResourceLoader loader = new ResourceLoader(tempFolder.getPath(), null, false);
            loader.getResource("/foo/bar.txt");
            fail("No error for null Classloader.");
        } catch (RuntimeException e) {
            assertEquals("Unexpected exception message", "ClassLoader must be specified", e.getMessage());
        }
    }

    /**
     * Cache directory is created if it doesn't exist.
     */
    public void testCacheDirDoesntExist() throws Exception {
        // We should get the same results, regardless of the value of
        // deleteOnStart.
        for (int pass = 0; pass < 2; pass++) {
            IOUtil.delete(tempFolder);
            assertFalse(cacheFolder.exists());
            new ResourceLoader(tempFolder.getPath(), pass == 0);
            assertTrue("Cache not created", cacheFolder.exists());
            assertTrue("Cache isn't a directory", cacheFolder.isDirectory());
        }
    }

    /**
     * Existing cache contents are retained if deleteCacheOnStart is false.
     */
    public void testCacheDirDoesExist() throws Exception {
        File childDir = new File(cacheFolder, "child");
        childDir.mkdirs();
        File childFile = File.createTempFile(getName(), null, cacheFolder);
        new ResourceLoader(tempFolder.getPath(), false);
        assertTrue("Cache not created", cacheFolder.exists());
        assertTrue("Cache isn't a directory", cacheFolder.isDirectory());
        assertTrue("Child dir was deleted", childDir.exists());
        assertTrue("Child file was deleted", childFile.exists());

    }

    /**
     * Existing cache contents are deleted if deleteCacheOnStart is true.
     */

    public void testCacheDirDoesExistDeleteOnStart() throws Exception {
        cacheFolder.mkdirs();
        File childDir = new File(cacheFolder, "child");
        childDir.mkdirs();
        File childFile = File.createTempFile(getName(), null, cacheFolder);
        new ResourceLoader(tempFolder.getPath(), true);
        assertTrue("Cache not created", cacheFolder.exists());
        assertTrue("Cache isn't a directory", cacheFolder.isDirectory());
        assertFalse("Child dir not deleted", childDir.exists());
        assertFalse("Child file not deleted", childFile.exists());
    }

    /**
     * Cache directory parent is actually a file, not a directory.
     */

    public void testCacheDirParentIsAFile() throws Exception {
        File testFile = makeTestFile();
        // Create a temp folder that is actually a file.
        File fakeTempFolder = makeTestFile();

        URLClassLoader testLoader = new URLClassLoader(new URL[] { origFolder.toURI().toURL() });
        ResourceLoader loader = new ResourceLoader(fakeTempFolder.getPath(), testLoader, false);
        try {
            loader.getResourceAsStream(testFile.getName());
            fail("Should have failed to cache resource");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().endsWith("java.io.IOException: Not a directory"));
        }
    }

    /**
     * Cache directory parent not writable.
     */
    public void testCacheDirParentNotWritable() throws Exception {
        File testFile = makeTestFile();
        tempFolder.setWritable(false, false);
        try {
            createResourceLoader(false);
            try {
                fileLoader.getResourceAsStream(testFile.getName());
                fail("Should have failed to cache resource");
            } catch (RuntimeException e) {
                assertTrue(e.getMessage().endsWith("java.io.IOException: No such file or directory"));
            }
        } finally {
            tempFolder.setWritable(true);
        }
    }

    /**
     * Cache directory parent not readable. Cache still OK if writable at least.
     */
    public void testCacheDirParentNotReadable() throws Exception {
        tempFolder.setReadable(false, false);
        try {
            File testFile = makeTestFile();
            String expected = getName();
            writeStringToFile(testFile, expected);
            createResourceLoader(false);
            assertEquals(expected, readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));
        } finally {
            tempFolder.setReadable(true, false);
        }
    }

    /**
     * Resource not already in cache is cached.
     */
    public void testGetResourceNotCached() throws Exception {
        File testFile = makeTestFile();
        String expected = getName();
        writeStringToFile(testFile, expected);
        createResourceLoader(false);
        createJarResourceLoader(false);

        assertEquals("Unexpected content", expected,
                readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));
        assertEquals("Unexpected content", expected,
                readStreamAsString(jarLoader.getResourceAsStream(testFile.getName())));
        assertTrue("Resource not cached", new File(cacheFolder, testFile.getName()).exists());
        assertTrue("Resource not cached", new File(jarCacheFolder, testFile.getName()).exists());
        assertTrue("Hash not cached", new File(cacheFolder, String.format(".%s.version", testFile.getName())).exists());
        assertTrue("Hash not cached",
                new File(jarCacheFolder, String.format(".%s.version", testFile.getName())).exists());

    }

    /**
     * Cached resource is served, even if original is updated.
     */
    public void testGetResourceCached() throws Exception {
        File testFile = makeTestFile();
        String expected = getName();
        writeStringToFile(testFile, expected);
        createResourceLoader(false);

        assertEquals("Unexpected initial content", expected,
                readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));

        // Update the content
        writeStringToFile(testFile, "updated" + getName());

        assertEquals("Unexpected cached content", expected,
                readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));
    }

    /**
     * Updated cache content is served, but version is not updated. Original is
     * re-read and version updated if refreshCached called.
     */

    public void testGetResourceCachedUpdated() throws Exception {
        File testFile = makeTestFile();
        String expected = getName();
        writeStringToFile(testFile, expected);

        createResourceLoader(false);

        assertEquals("Unexpected initial content", expected,
                readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));

        writeStringToFile(testFile, "updated" + getName());
        expected = "realupdate" + getName();

        File folder;
        ResourceLoader loader;

        folder = this.cacheFolder;
        loader = this.fileLoader;

        File version = new File(folder, String.format(".%s.version", testFile.getName()));
        String versionValue = readStreamAsString(new FileInputStream(version));
        File cached = new File(folder, testFile.getName());

        writeStringToFile(cached, expected);
        assertEquals("Unexpected updated cached content", expected,
                readStreamAsString(loader.getResourceAsStream(testFile.getName())));
        assertTrue("Version not found", version.exists());
        assertTrue("Didn't expect cached copy to be re-versioned",
                versionValue.equals(readStreamAsString(new FileInputStream(version))));
        loader.refreshCache(testFile.getName());
        expected = "updated" + getName();
        assertEquals("Unexpected updated cached content", expected,
                readStreamAsString(loader.getResourceAsStream(testFile.getName())));
        assertTrue("Version not found", version.exists());
        assertFalse("Version not updated", versionValue.equals(readStreamAsString(new FileInputStream(version))));
    }

    public void testFileUpdates() throws Exception {
        File testFile = makeTestFile();
        writeStringToFile(testFile, "version 1");
        createResourceLoader(false);
        assertEquals("version 1", readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));
        writeStringToFile(testFile, "version 2");
        fileLoader.refreshCache(testFile.getName());
        assertEquals("version 2", readStreamAsString(fileLoader.getResourceAsStream(testFile.getName())));
    }

    /**
     * Original is re-read if cached content is deleted, but version is not
     * updated. Note, that this test is unable to exercise the JAR loader
     * because refreshing JAR contents is broken, but it is loosely specified
     * and is only required during development.
     */

    public void testGetResourceCachedMissing() throws Exception {
        File testFile = makeTestFile();
        writeStringToFile(testFile, "bogus");

        createResourceLoader(false);

        String expected = getName();
        writeStringToFile(testFile, expected);

        ResourceLoader loader;
        File folder;

        loader = fileLoader;
        folder = this.cacheFolder;

        assertEquals("Unexpected initial content", expected,
                readStreamAsString(loader.getResourceAsStream(testFile.getName())));
        File cached = new File(folder, testFile.getName());
        File version = new File(folder, String.format(".%s.version", testFile.getName()));
        String versionValue = readStreamAsString(new FileInputStream(version));
        assertTrue("Cached copy not found", cached.exists());
        expected = "updated" + getName();
        writeStringToFile(testFile, expected);

        cached.delete();

        assertFalse("Failed to delete cached copy", cached.exists());
        assertEquals("Unexpected updated content", expected,
                readStreamAsString(loader.getResourceAsStream(testFile.getName())));
        assertTrue("Failed to re-cache file", cached.exists());
        assertTrue("Version not found", version.exists());
        assertFalse("Version not updated", versionValue.equals(readStreamAsString(new FileInputStream(version))));

    }

    /**
     * Served resource is not affected if version is deleted. Version is
     * recomputed on refreshCache.
     */

    public void testGetResourceCachedMissingVersion() throws Exception {
        File testFile = makeTestFile();
        String expected = getName();
        writeStringToFile(testFile, expected);

        createResourceLoader(false);
        createJarResourceLoader(false);

        for (int pass = 0; pass < 2; pass++) {
            ResourceLoader loader;
            File folder;
            if (pass == 0) {
                loader = fileLoader;
                folder = this.cacheFolder;
            } else {
                loader = jarLoader;
                folder = jarCacheFolder;
            }
            assertEquals("Unexpected initial content", expected,
                    readStreamAsString(loader.getResourceAsStream(testFile.getName())));
            File version = new File(folder, String.format(".%s.version", testFile.getName()));
            String versionValue = readStreamAsString(new FileInputStream(version));
            assertTrue("Cached version not found", version.exists());
            version.delete();
            assertFalse("Failed to delete cached version", version.exists());
            assertEquals("Unexpected cached content", expected,
                    readStreamAsString(loader.getResourceAsStream(testFile.getName())));
            assertTrue("Cached copy not found", new File(folder, testFile.getName()).exists());
            assertFalse("Didn't expect cached copy to be re-versioned", version.exists());
            loader.refreshCache(testFile.getName());
            assertEquals("Unexpected updated cached content", expected,
                    readStreamAsString(loader.getResourceAsStream(testFile.getName())));
            assertTrue("Version not found", version.exists());
            assertTrue("Version not restored", versionValue.equals(readStreamAsString(new FileInputStream(version))));
        }
    }

    /**
     * Verify that a request for a directory, regardless of it return code, does
     * not cause subsequent requests for elements beneath that directory to
     * fail.
     * <p>
     * Regression test for W-1387862
     */
    public void testObstructedRecurisvely() throws Exception {
        // create a file tree consisting of <origFolder>/foo/bar
        File foo = new File(origFolder, "foo");
        foo.mkdir();
        File bar = new File(foo, "bar");
        bar.createNewFile();
        File mu = new File(origFolder, "mu");
        mu.createNewFile();
        writeStringToFile(mu, "moo");
        writeStringToFile(bar, "Hi, my name is bar.");

        createResourceLoader(false);
        createJarResourceLoader(false);
        ResourceLoader[] loaders = new ResourceLoader[] { fileLoader, jarLoader };
        for (ResourceLoader loader : loaders) {
            // Load foo using both forms 'foo' and 'foo/'
            try {
                loader.getResource("foo");
            } catch (Exception e) {
                // expected but not required
            }
            try {
                loader.getResource("foo/");
            } catch (Exception e) {
                // expected but not required
            }
            // Sanity check our setup: we should be able to read mu regardless.
            assertEquals("moo", readStreamAsString(loader.getResourceAsStream("mu")));

            // Now check the regression case.
            URL loadedBar = loader.getResource("foo/bar");
            assertNotNull("The loading of /foo should not block the subsequent load of /foo/bar", loadedBar);
            String barValue = readStreamAsString(loadedBar.openStream());
            assertEquals("Hi, my name is bar.", barValue);
        }
    }
}
