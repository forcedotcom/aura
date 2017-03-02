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
package org.auraframework.util.test.util;

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

import javax.inject.Inject;

import org.auraframework.util.IOUtil;
import org.auraframework.util.adapter.SourceControlAdapter;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.auraframework.util.test.annotation.UnitTest;
import org.auraframework.util.test.diff.GoldFileUtils;
import org.auraframework.util.test.perf.metrics.PerfMetrics;
import org.auraframework.util.test.perf.metrics.PerfMetricsComparator;
import org.auraframework.util.test.runner.AuraUnitTestRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;

import com.google.common.collect.Sets;

import junit.framework.TestCase;

/**
 * Base class for all aura tests.
 */
@RunWith(AuraUnitTestRunner.class)
@ContextConfiguration(locations = {"/applicationContext.xml"})
@TestExecutionListeners(listeners = {DependencyInjectionTestExecutionListener.class})
@ActiveProfiles("auraTest")
public abstract class UnitTestCase extends TestCase {
    @Inject
    private ApplicationContext applicationContext;

    @Inject
    protected SourceControlAdapter sourceControlAdapter;

    private static final Logger logger = Logger.getLogger("UnitTestCase");
    private static final GoldFileUtils goldFileUtils = new GoldFileUtils();

    private Collection<File> tempFiles = null;
    private Stack<Runnable> tearDownSteps = null;
    private PerfMetricsComparator perfMetricsComparator = PerfMetricsComparator.DEFAULT_INSTANCE;

    @Rule
    public TestName testName = new TestName();

    @Override
    public String getName() {
        if (super.getName() == null) {
            setName(testName.getMethodName());
        }
        return super.getName();
    }

    /**
     * Support setUp for legacy tests in JUnit4 runners.
     */
    @Before
    public void legacySetUp() throws Exception {
    	injectBeans(); // for JUnit4 runners
        setUp();
    }

    // The new teardown needs to call any legacy teardown methods.
    @After
    public void legacyTearDown() throws Exception {
        tearDown();
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    	injectBeans(); // for custom legacy runners
        MockitoAnnotations.initMocks(this);
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
        Mockito.validateMockitoUsage();
        super.tearDown();
    }

    @Override
    public void runBare() throws Throwable {
    	injectBeans(); // for standard legacy runners
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
            tearDownSteps = new Stack<>();
        }
        tearDownSteps.push(toRun);
    }

    public SourceControlAdapter getSourceControlAdapter() {
        return this.sourceControlAdapter;
    }

    /**
     * @return to get metric details stored in gold file (i.e. for perf metrics)
     */
    public boolean storeDetailsInGoldFile() {
        return true;
    }

    /**
     * @return a non null value to specify a results folder for the gold files and to avoid the automatic results folder
     *         location logic
     */
    public final String getExplicitGoldResultsFolder() {
        return explicitGoldResultsFolder;
    }

    /**
     * Overrides the default gold results folder location
     */
    public final void setExplicitGoldResultsFolder(String folder) {
        explicitGoldResultsFolder = folder;
    }

    private String explicitGoldResultsFolder;

    /**
     * @return a non null value to specify a results folder for the gold files and to avoid the automatic results folder
     *         location logic
     */
    public final String getExplicitPerfResultsFolder() {
        return explicitPerfResultsFolder;
    }

    /**
     * Overrides the default gold results folder location
     */
    public final void setExplicitPerfResultsFolder(String folder) {
        explicitPerfResultsFolder = folder;
    }

    private String explicitPerfResultsFolder;

    public String getGoldFileName() {
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

        goldFileUtils.assertTextDiff(this, getGoldFileName() + suffix, actual);
    }

    protected void goldFileJson(String actual, String suffix) throws Exception {
        if (suffix == null) {
            suffix = ".json";
        } else if (suffix.indexOf('.') < 0) {
            suffix = suffix + ".json";
        }

        goldFileUtils.assertJsonDiff(this, getGoldFileName() + suffix, actual);
    }

    protected void goldFileJson(String actual) throws Exception {
        goldFileJson(actual, null);
    }

    protected void serializeAndGoldFile(Object actual, String suffix) throws Exception {
        goldFileJson(toJson(actual), suffix);
    }

    protected final void assertGoldMetrics(PerfMetrics actual) throws Exception {
        goldFileUtils.assertPerfDiff(this, getGoldFileName() + ".json", actual);
    }

    public PerfMetricsComparator getPerfMetricsComparator() {
        return perfMetricsComparator;
    }

    public void setPerfMetricsComparator(PerfMetricsComparator perfMetricsComparator) {
        this.perfMetricsComparator = perfMetricsComparator;
    }

    protected void serializeAndGoldFile(Object actual) throws Exception {
        serializeAndGoldFile(actual, null);
    }

    protected String toJson(Object o) {
        StringBuilder sb = new StringBuilder(100);
        JsonEncoder.serialize(o, sb, getJsonSerializationContext());
        return sb.toString();
    }

    protected JsonSerializationContext getJsonSerializationContext() {
        throw new UnsupportedOperationException("your test needs a json serialization context");
    }

    protected void deleteFileOnTeardown(File file) {
        if (tempFiles == null) {
            tempFiles = new LinkedList<>();
        }
        tempFiles.add(file);
    }

    /**
     * Get a resource file for use in tests. If resource is not loaded from the filesystem, write it to a temp file and
     * use that.
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
        String fileName = IOUtil.getDefaultTempDir() + File.separator + resourceName;
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

    protected void assertExceptionType(Throwable t, Class<? extends Throwable> clazz) {
        assertEquals("Unexpected exception type", clazz, t.getClass());
    }

    protected void assertExceptionMessage(Throwable t, Class<? extends Throwable> clazz, String message) {
        assertExceptionType(t, clazz);
        assertEquals("Unexpected message", message, t.getMessage());
    }

    protected void assertExceptionMessageStartsWith(Throwable t, Class<? extends Throwable> clazz,
            String messageStartsWith) {
        assertExceptionType(t, clazz);
        assertEquals("Unexpected start of message", messageStartsWith,
                t.getMessage().substring(0, messageStartsWith.length()));
    }

    protected void assertExceptionMessageEndsWith(Throwable t, Class<? extends Throwable> clazz,
            String messageEndsWith) {
        assertExceptionType(t, clazz);
        String message = t.getMessage();
        if (message == null || !message.endsWith(messageEndsWith)) {
            fail(String.format("Unexpected end of message.  Expected message ending with: [%s], but got message: [%s]",
                    messageEndsWith, message));
        }
    }

    protected void assertExceptionMessageContains(Throwable t, Class<? extends Throwable> clazz,
            String messageContains) {
        assertExceptionType(t, clazz);
        String message = t.getMessage();
        if (message == null || !message.contains(messageContains)) {
            fail(String.format("Unexpected content of message.  Expected message contains: [%s], but got message: [%s]",
                    messageContains, message));
        }
    }

    // add annotation's value to current Set
    private void addLabels(Set<String> labels, AuraTestLabels anno) {
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
        AuraTestLabels anno = c.getAnnotation(AuraTestLabels.class);
        addLabels(labels, anno);
        return labels;
    }

    /**
     * Get a Set of Strings parsed from whitespace delimited TestLabels annotation values from the current test method
     * and test class hierarchy. This will include only the current method's annotation and not those of any methods it
     * happens to override.
     */
    public Set<String> getTestLabels() {
        Class<?> clazz = getClass();
        Set<String> labels = getTestLabels(clazz);
        try {
            Method method = clazz.getMethod(getName());
            AuraTestLabels anno = method.getAnnotation(AuraTestLabels.class);
            addLabels(labels, anno);
        } catch (NoSuchMethodException e) {
            // dynamic tests should override this function
        }
        return labels;
    }
    
    protected void injectBeans() throws Exception {
        if (applicationContext == null) {
            TestContextManager testContextManager = new TestContextManager(getClass());
            testContextManager.prepareTestInstance(this);
        }
    }
}
