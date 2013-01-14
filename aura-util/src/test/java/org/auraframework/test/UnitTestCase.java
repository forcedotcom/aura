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
package org.auraframework.test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.Collection;
import java.util.LinkedList;
import java.util.Set;
import java.util.Stack;
import java.util.logging.Logger;

import junit.framework.TestCase;

import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.UnitTest;
import org.auraframework.util.IOUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.test.GoldFileUtils;

import com.google.common.collect.Sets;

/**
 * Base class for all aura tests.
 */
@UnitTest
public abstract class UnitTestCase extends TestCase {
    private static final Logger logger = Logger.getLogger("UnitTestCase");
    private static final GoldFileUtils goldFileUtils = new GoldFileUtils();
    Collection<File> tempFiles = null;
    Stack<Runnable> tearDownSteps = null;

    public UnitTestCase() {
        super();
    }

    public UnitTestCase(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    public void tearDown() throws Exception {
        if (tearDownSteps != null) {
            while (!tearDownSteps.isEmpty()) {
                tearDownSteps.pop().run();
            }
        }
        if (tempFiles != null) {
            for (File file : tempFiles) {
                try {
                    file.delete();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        super.tearDown();
    }

    @Override
    public void runBare() throws Throwable {
        logger.info(String.format("Running: %s.%s", getClass().getName(), getName()));
        super.runBare();
    }

    @Override
    public void runTest() throws Throwable {
        try {
            super.runTest();
        } catch (Throwable t) {
            System.out.println("ERROR: " + t.getMessage());
            throw t;
        }
    }

    protected void addTearDownStep(Runnable toRun) {
        if (toRun == null) {
            return;
        }
        if (tearDownSteps == null) {
            tearDownSteps = new Stack<Runnable>();
        }
        tearDownSteps.push(toRun);
    }

    protected String getGoldFileName() {
        return getName();
    }

    protected GoldFileUtils getGoldFileUtils() {
        return goldFileUtils;
    }

    protected void goldFileText(String actual) throws Exception {
        goldFileText(actual, null);
    }

    protected void goldFileText(String actual, String suffix) throws Exception {
        if (suffix == null) {
            suffix = ".txt";
        } else if (suffix.indexOf('.') < 0) {
            suffix = suffix + ".txt";
        }

        goldFileUtils.assertTextDiff(this.getClass(), getGoldFileName() + suffix, actual);
    }

    protected void goldFileJson(String actual, String suffix) throws Exception {
        if (suffix == null) {
            suffix = ".json";
        } else if (suffix.indexOf('.') < 0) {
            suffix = suffix + ".json";
        }

        goldFileUtils.assertJsonDiff(this.getClass(), getGoldFileName() + suffix, actual);
    }

    protected void goldFileJson(String actual) throws Exception {
        goldFileJson(actual, null);
    }

    protected void serializeAndGoldFile(Object actual, String suffix) throws Exception {
        goldFileJson(toJson(actual), suffix);
    }

    protected void serializeAndGoldFile(Object actual) throws Exception {
        serializeAndGoldFile(actual, null);
    }

    protected String toJson(Object o) {
        StringBuilder sb = new StringBuilder(100);
        Json.serialize(o, sb, getJsonSerializationContext());
        return sb.toString();
    }

    protected JsonSerializationContext getJsonSerializationContext() {
        throw new UnsupportedOperationException("your test needs a json serialization context");
    }

    protected void deleteFileOnTeardown(File file) {
        if (tempFiles == null) {
            tempFiles = new LinkedList<File>();
        }
        tempFiles.add(file);
    }

    /**
     * Get a resource file for use in tests. If resource is not loaded from the
     * filesystem, write it to a temp file and use that.
     * 
     * @param resourceName
     * @return File containing the resource content
     * @throws IOException
     */
    protected File getResourceFile(String resourceName) throws IOException {
        URL url = getClass().getResource(resourceName);
        // if it's local and exists, just return it
        if (url != null && url.getProtocol().equals("file")) {
            return new File(url.getFile());
        }

        // otherwise, we'll map it to tmp filesystem
        if (!File.separator.equals("/")) {
            resourceName = resourceName.replace('/', File.separatorChar);
        }
        String fileName = System.getProperty("java.io.tmpdir") + resourceName;
        File tempFile = new File(fileName);

        // if it didn't exist on classpath, then return ref to non-existant file
        if (url == null) {
            return tempFile;
        }

        // if it's a dir, just create it
        if (resourceName.endsWith(File.separator)) {
            tempFile.mkdirs();
            return tempFile;
        }

        // otherwise, create the tempfile and copy content from resource
        tempFile.getParentFile().mkdirs();
        tempFile.createNewFile();
        deleteFileOnTeardown(tempFile);
        InputStream in = url.openStream();
        OutputStream out = new FileOutputStream(tempFile);
        IOUtil.copyStream(in, out);
        out.close();
        return tempFile;
    }

    // add annotation's value to current Set
    private void addLabels(Set<String> labels, TestLabels anno) {
        if (anno != null) {
            String value = anno.value();
            if (value != null && !value.isEmpty()) {
                for (String each : value.split("\\s+")) {
                    labels.add(each);
                }
            }
        }
    }

    // get the TestLabels for this and its superclass
    private Set<String> getTestLabels(Class<?> c) {
        Set<String> labels;
        // get parent labels before adding own
        Class<?> supa = c.getSuperclass();
        // could probably stop at UnitTestCase, but don't want to mess with
        // tests not derived from, and there's only 3
        // more hops to Object (for now)
        if (supa == null) {
            labels = Sets.newHashSet();
        } else {
            labels = getTestLabels(supa);
        }
        TestLabels anno = c.getAnnotation(TestLabels.class);
        addLabels(labels, anno);
        return labels;
    }

    /**
     * Get a Set of Strings parsed from whitespace delimited TestLabels
     * annotation values from the current test method and test class hierarchy.
     * This will include only the current method's annotation and not those of
     * any methods it happens to override.
     */
    public Set<String> getTestLabels() {
        Class<?> clazz = getClass();
        Set<String> labels = getTestLabels(clazz);
        try {
            Method method = clazz.getMethod(getName());
            TestLabels anno = method.getAnnotation(TestLabels.class);
            addLabels(labels, anno);
        } catch (NoSuchMethodException e) {
            // dynamic tests should override this function
        }
        return labels;
    }
}
