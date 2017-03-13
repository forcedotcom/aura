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
package org.auraframework.integration.test.util;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import junit.framework.AssertionFailedError;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.NameValuePair;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.perf.PerfResultsUtil;
import org.auraframework.test.perf.PerfWebDriverUtil;
import org.auraframework.test.perf.metrics.PerfMetricsCollector;
import org.auraframework.test.perf.util.PerfExecutorTestCase;
import org.auraframework.test.util.AuraUITestingUtil;
import org.auraframework.test.util.SauceUtil;
import org.auraframework.test.util.WebDriverProvider;
import org.auraframework.test.util.WebDriverUtil;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.util.AuraUtil;
import org.auraframework.util.test.annotation.FreshBrowserInstance;
import org.auraframework.util.test.annotation.WebDriverTest;
import org.auraframework.util.test.perf.PerfUtil;
import org.auraframework.util.test.perf.metrics.PerfMetrics;
import org.auraframework.util.test.perf.metrics.PerfRunsCollector;
import org.auraframework.util.test.perf.rdp.RDPNotification;
import org.eclipse.jetty.util.log.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.touch.FlickAction;
import org.openqa.selenium.interactions.touch.TouchActions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.uiautomation.ios.client.uiamodels.impl.RemoteIOSDriver;
import org.uiautomation.ios.client.uiamodels.impl.augmenter.IOSDriverAugmenter;

import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.concurrent.Semaphore;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Base class for Aura WebDriver tests.
 */
@WebDriverTest
public abstract class WebDriverTestCase extends IntegrationTestCase {
    // Rerun test marked with the flapper annotation a certain number of times before failing the build
    private static int FLAPPER_NUM_RETRIES = 1;

    private static final Logger logger = Logger.getLogger("WebDriverTestCase");

    /** Checks whether {@code oneClass} is mentioned as a class on {@code elem}. */
    public boolean hasCssClass(WebElement elem, String oneClass) {
        String allClasses = elem.getAttribute("class");
        return allClasses.contains(" " + oneClass + " ") || allClasses.equals(oneClass)
                || allClasses.startsWith(oneClass + " ") || allClasses.endsWith(" " + oneClass);
    }

    private WebDriver currentDriver = null;
    private BrowserType currentBrowserType = null;
    private AuraUITestingUtil auraUITestingUtil;

    protected PerfWebDriverUtil perfWebDriverUtil;

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    public @interface TargetBrowsers {
        BrowserType[] value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    public @interface ExcludeBrowsers {
        BrowserType[] value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    @Inherited
    public @interface CheckAccessibility {
        boolean value() default true;

        // Default browser to run accessibility test is Google Chrome
        BrowserType browserType() default BrowserType.GOOGLECHROME;
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    @Inherited
    public @interface Flapper {
    }

    public String getBrowserTypeString() {
        if (this.currentBrowserType != null) {
            return "?browser=" + this.currentBrowserType.name();
        }
        return "";
    }

    protected void superRunTest() throws Throwable {
        super.runTest();
    }

    public void runTestWithBrowser(BrowserType browserType) throws Throwable {
        Throwable failure = null;
        if (currentBrowserType != browserType) {
            currentDriver = null;
            currentBrowserType = browserType;
        }

        if (isPerfTest()) {
            runPerfTests();
            return;
        }

        for (int i = 0; i <= FLAPPER_NUM_RETRIES; i++) {
            try {
                // re-initialize driver pointer here because test analysis might need it after perBrowserTearDown
                getDriver();
                setUp();
                superRunTest();
                return;
            } catch (Throwable th) {
                failure = th;
                if (!isFlapper()) {
                    break;
                }

                logger.info(getClass().getName() + "." + getName() + " failed at iteration " + (i + 1) + " of "
                        + (FLAPPER_NUM_RETRIES + 1) + " with error: " + AuraExceptionUtil.getStackTrace(th));

                quitDriver();
            } finally {
                tearDown();
            }
        }

        if (failure != null) {
            throw failure;
        }
    }

    /**
     * Checks if the current test is marked with the flapper annotation.
     */
    private boolean isFlapper() {
        Class<?> testClass = getClass();
        if (testClass.isAnnotationPresent(Flapper.class)) {
            return true;
        }
        if (getTestLabels().contains("flapper")) {
            return true;
        }
        try {
            return testClass.getMethod(getName()).isAnnotationPresent(Flapper.class);
        } catch (Throwable t) {
            return false;
        }
    }

    /**
     * Checks if the current test is marked with the flapper annotation.
     */
    private boolean needsFreshBrowser() {
        Class<?> testClass = getClass();

        if (testClass.getAnnotation(FreshBrowserInstance.class) != null) {
            return true;
        }
        try {
            if (testClass.getMethod(getName()).getAnnotation(FreshBrowserInstance.class) != null) {
                return true;
            }
        } catch (NoSuchMethodException e) {
            // ignore
        }
        if (getTestLabels().contains("freshBrowserInstance")) {
            return true;
        }
        if (isPerfTest()) {
            return true;
        }
        return false;
    }

    @SuppressWarnings("serial")
    private static class AggregateFailure extends AssertionFailedError {
        private final Collection<Throwable> failures;

        private AggregateFailure(Collection<Throwable> failures) {
            super(String.format("There were errors across %s browsers:", failures == null ? 0 : failures.size()));
            this.failures = failures;
        }

        @Override
        public void printStackTrace(PrintWriter printer) {
            printer.append(getMessage()).append('\n');
            for (Throwable e : failures) {
                e.printStackTrace(printer);
            }
        }
    }

    @Override
    public void runTest() throws Throwable {
        // sometimes the first set of parallel WebDriver tests that run have problems,
        // this may be due to the extra steps that happen when everything is initialized
        // here we force the first test to execute single threaded and also initialize
        // aura before invoking that first test
        HttpGet get = null;
        try {
            LOCK_FIRST_TEST_SEMAPHORE.acquire();
            if (numWebDriverTestsExecuted == 0) {
                get = obtainGetMethod("/uitest/testApp.app", true, null);
                getResponseBody(perform(get)); // need to drain response for HttpClient
            }
            runTestImpl();
        } finally {
            if (get != null) {
                get.releaseConnection();
            }
            numWebDriverTestsExecuted++;
            // release enough permits to run in parallel after first
            LOCK_FIRST_TEST_SEMAPHORE.release(TestExecutor.NUM_THREADS);
        }
    }

    private static int numWebDriverTestsExecuted;
    private static final Semaphore LOCK_FIRST_TEST_SEMAPHORE = new Semaphore(1);

    private void runTestImpl() throws Throwable {
        List<Throwable> failures = Lists.newArrayList();
        for (BrowserType browser : WebDriverUtil.getBrowserListForTestRun(this.getTargetBrowsers(),
                this.getExcludedBrowsers())) {
            try {
                runTestWithBrowser(browser);
            } catch (Throwable t) {
                Throwable th = addAuraInfoToTestFailure(t);
                logger.warning(AuraExceptionUtil.getStackTrace(th));
                failures.add(th);
            } finally {
                quitDriver();
            }
        }
        // Aggregate results across browser runs, if more than one failure was encountered
        if (!failures.isEmpty()) {
            if (failures.size() == 1) {
                throw failures.get(0);
            }
            throw new AggregateFailure(failures);
        }
    }

    // Perf: START

    protected static final boolean RUN_PERF_TESTS = System.getProperty("runPerfTests") != null;

    public enum PerfRunMode {
        WARMUP, TIMELINE, PROFILE, AURASTATS
    };

    protected PerfRunMode perfRunMode;

    public boolean isPerfTest() {
        return RUN_PERF_TESTS && PerfUtil.hasPerfTestAnnotation(this);
    }

    /**
     * Override to change
     */
    protected boolean runPerfWarmupRun() {
        return true;
    }

    /**
     * Override to change
     */
    protected int numPerfTimelineRuns() {
        return 5;
    }

    /**
     * Override to change
     */
    protected int numPerfProfileRuns() {
        return PerfUtil.MEASURE_JSCPU_METRICTS ? 3 : 0;
    }

    /**
     * Override to change
     */
    protected int numPerfAuraRuns() {
        return 1; // metrics don't change from run to run
    }

    /**
     * Adds capabilities that request WebDriver performance logs<br/>
     * See https://sites.google.com/a/chromium.org/chromedriver/logging/performance-log
     */
    private void addPerfCapabilities(DesiredCapabilities capabilities) {
        if (PerfUtil.hasPerfCmpTestAnnotation(this)) {
        	// Do not reuse browser
        	capabilities.setCapability(WebDriverProvider.REUSE_BROWSER_PROPERTY, false);
            LoggingPreferences performance_prefs = new LoggingPreferences();
            performance_prefs.enable(LogType.PERFORMANCE, Level.ALL);
            capabilities.setCapability(CapabilityType.LOGGING_PREFS, performance_prefs);
            Map<String, Object> prefs = new HashMap<>();
            prefs.put("traceCategories", "disabled-by-default-devtools.timeline");
            ChromeOptions options = new ChromeOptions();
            options.setExperimentalOption("perfLoggingPrefs", prefs);
            capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        }
    }

    private void runPerfTests() throws Throwable {
        int numPerfTimelineRuns = numPerfTimelineRuns();
        int numPerfProfileRuns = numPerfProfileRuns();
        int numPerfAuraRuns = numPerfAuraRuns();
        PerfMetrics timelineMetrics = null;
        PerfMetrics profileMetrics = null;
        PerfMetrics auraMetrics = null;
        int runNumber = 1;
        List<File> runFiles = Lists.newArrayList();

        if (runPerfWarmupRun()) {
            perfRunMode = PerfRunMode.WARMUP;
            // TODO: any metrics that should/could be measured for the first run
            try {
                setUp();
                superRunTest();
            } finally {
                tearDown();
            }
        }

        // runs to collect Dev Tools performance metrics
        if (numPerfTimelineRuns > 0) {
            perfRunMode = PerfRunMode.TIMELINE;
            PerfRunsCollector runsCollector = new PerfRunsCollector();
            for (int i = 0; i < numPerfTimelineRuns; i++) {
                try {
                    setUp();

                    PerfMetricsCollector metricsCollector = new PerfMetricsCollector(this, perfRunMode);
                    metricsCollector.startCollecting();

                    superRunTest();

                    PerfMetrics metrics = metricsCollector.stopCollecting();
                    runsCollector.addRun(metrics);

                    if (logger.isLoggable(Level.INFO)) {
                        runFiles.add(PerfResultsUtil.writeDevToolsLog(metrics.getDevToolsLog(), getGoldFileName() + '_'
                                + (i + 1),
                                getAuraUITestingUtil().getUserAgent()));
                        runFiles.add(PerfResultsUtil
                                .writeGoldFile(metrics, getGoldFileName() + '_' + runNumber++, true));
                    }
                } finally {
                    tearDown();
                }
            }
            // use the median run for timeline metrics so individual metrics and dev tools logs match
            timelineMetrics = runsCollector.getMedianRun();
        }

        // runs to collect JavaScript profiling metrics, run separately because affect overall metrics
        if (numPerfProfileRuns > 0) {
            perfRunMode = PerfRunMode.PROFILE;
            PerfRunsCollector runsCollector = new PerfRunsCollector();
            for (int i = 0; i < numPerfProfileRuns; i++) {
                try {
                    setUp();

                    PerfMetricsCollector metricsCollector = new PerfMetricsCollector(this, perfRunMode);
                    metricsCollector.startCollecting();

                    superRunTest();

                    PerfMetrics metrics = metricsCollector.stopCollecting();
                    runsCollector.addRun(metrics);

                    if (logger.isLoggable(Level.INFO)) {
                        Map<String, ?> jsProfilerData = metrics.getJSProfilerData();
                        if (jsProfilerData != null) {
                            runFiles.add(PerfResultsUtil.writeJSProfilerData(jsProfilerData, getGoldFileName() + '_'
                                    + (i + 1)));
                        }
                        Map<String, ?> heapSnapshot = metrics.getHeapSnapshot();
                        if (heapSnapshot != null) {
                            runFiles.add(PerfResultsUtil.writeHeapSnapshot(heapSnapshot, getGoldFileName() + '_'
                                    + (i + 1)));
                        }
                        runFiles.add(PerfResultsUtil
                                .writeGoldFile(metrics, getGoldFileName() + '_' + runNumber++, true));
                    }
                } finally {
                    tearDown();
                }
            }
            // use the median run for profile metrics so individual metrics and .cpuprofile match
            profileMetrics = runsCollector.getMedianRun();
        }

        // runs to collect Aura stats metrics
        if (numPerfAuraRuns > 0) {
            perfRunMode = PerfRunMode.AURASTATS;
            // collecting them in separate runs as they need STATS mode
            PerfRunsCollector runsCollector = new PerfRunsCollector();
            for (int i = 0; i < numPerfAuraRuns; i++) {
                try {
                    // TODO: set stats mode for framework tests
                    setUp();

                    PerfMetricsCollector metricsCollector = new PerfMetricsCollector(this, perfRunMode);
                    metricsCollector.startCollecting();

                    superRunTest();

                    PerfMetrics metrics = metricsCollector.stopCollecting();
                    runsCollector.addRun(metrics);
                } finally {
                    tearDown();
                }
            }
            auraMetrics = runsCollector.getMedianMetrics();
        }

        perfRunMode = null;

        // combine all metrics, log/write results, perform tests
        PerfMetrics allMetrics = PerfMetrics.combine(timelineMetrics, profileMetrics, auraMetrics);
        if (allMetrics != null) {
            if (logger.isLoggable(Level.INFO)) {
                logger.info("perf metrics for " + this + '\n' + allMetrics.toLongString());
            }
            List<JSONObject> devToolsLog = allMetrics.getDevToolsLog();
            if (devToolsLog != null) {
                PerfResultsUtil.writeDevToolsLog(devToolsLog, getGoldFileName(), getAuraUITestingUtil().getUserAgent());
            }
            Map<String, ?> jsProfilerData = allMetrics.getJSProfilerData();
            if (jsProfilerData != null) {
                PerfResultsUtil.writeJSProfilerData(jsProfilerData, getGoldFileName());
            }
            Map<String, ?> heapSnapshot = allMetrics.getHeapSnapshot();
            if (heapSnapshot != null) {
                PerfResultsUtil.writeHeapSnapshot(heapSnapshot, getGoldFileName());
            }
            PerfResultsUtil.writeGoldFile(allMetrics, getGoldFileName(), storeDetailsInGoldFile());

            perfTearDown(allMetrics);
            // delete individual run recordings of passing tests to save disk space
            for (File file : runFiles) {
                file.delete();
                PerfResultsUtil.RESULTS_JSON.removeResultsFile(file);
            }
        }
    }

    /**
     * Invoked after all perf metrics have been collected. Default behavior is to compare the measured metrics with the
     * gold file ones.
     */
    protected void perfTearDown(PerfMetrics actual) throws Exception {
        assertGoldMetrics(actual);
    }

    public final PerfWebDriverUtil getPerfWebDriverUtil() {
        return perfWebDriverUtil;
    }

    public final List<RDPNotification> getRDPNotifications() {
        return perfWebDriverUtil.getRDPNotifications();
    }

    public final Map<String, ?> takeHeapSnapshot() {
        return perfWebDriverUtil.takeHeapSnapshot();
    }

    @SuppressWarnings("unchecked")
    public final Map<String, Map<String, Map<String, List<Object>>>> getAuraStats() {
        return (Map<String, Map<String, Map<String, List<Object>>>>) getAuraUITestingUtil()
                .getRawEval("return $A.PERFCORE.stats.get();");
    }

    /**
     * Start JavaScript CPU profiler
     */
    public final void startProfile() {
        perfWebDriverUtil.startProfile();
    }

    /**
     * Stop JavaScript CPU profiler and return profile info
     *
     * See https://src.chromium.org/viewvc/chrome?revision=271803&view=revision
     */
    public final Map<String, ?> endProfile() {
        return perfWebDriverUtil.endProfile();
    }

    /**
     * Metrics/timeline is only captured between the perf start and end markers, override this method to specify
     * different markers.
     */
    public String getPerfStartMarker() {
        return "PERF:start";
    }

    /**
     * Metrics/timeline is only captured between the perf start and end markers, override this method to specify
     * different markers.
     */
    public String getPerfEndMarker() {
        return "PERF:end";
    }

    public JSONArray getLastCollectedMetrics() {
        return null;
    }

    /**
     * Wrapper for non-asserted failures
     */
    public static class UnexpectedError extends Error {
        private static final long serialVersionUID = 1L;

        UnexpectedError(String description, Throwable cause) {
            super(description, cause);
        }
    }

    private static String WRAPPER_APP = "<aura:application access=\"GLOBAL\" render=\"%s\"><%s/></aura:application>";

    /**
     * Load a string as a component in an app.
     *
     * @param namePrefix the name of the component
     * @param componentText The actual text of the component.
     * @param isClient Should we use client or server rendering.
     */
    protected void loadComponent(String namePrefix, String componentText, boolean isClient)
            throws MalformedURLException, URISyntaxException {
        String appText;
        String render;

        if (isClient) {
            render = "client";
        } else {
            render = "server";
        }

        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, componentText, namePrefix);
        appText = String.format(WRAPPER_APP, render, cmpDesc.getDescriptorName());
        loadApplication(namePrefix + "App", appText, isClient);
    }

    /**
     * A convenience routine to load a application string.
     *
     * @param namePrefix the application name.
     * @param appText the actual text of the application
     */
    protected void loadApplication(String namePrefix, String appText, boolean isClient) throws MalformedURLException,
            URISyntaxException {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appText, namePrefix);
        String openPath = String.format("/%s/%s.app", appDesc.getNamespace(), appDesc.getName());
        if (isClient) {
            open(openPath);
        } else {
            // when using server side rendering, we need to not wait for aura
            openNoAura(openPath);
        }
    }

    /**
     * Gather up useful info to add to a test failure. try to get
     * <ul>
     * <li>any client js errors</li>
     * <li>last known js test function</li>
     * <li>running/waiting</li>
     * <li>a screenshot</li>
     * </ul>
     *
     * @param originalErr the test failure
     * @throws Throwable a new AssertionFailedError or UnexpectedError with the original and additional info
     */
    private Throwable addAuraInfoToTestFailure(Throwable originalErr) {
        StringBuffer description = new StringBuffer();
        if (originalErr != null) {
            String msg = originalErr.getMessage();
            if (msg != null) {
                description.append(msg);
            }
        }

        description.append(String.format("\nBrowser: %s", currentBrowserType));
        if (getAuraUITestingUtil() != null) {
            description.append("\nUser-Agent: " + getAuraUITestingUtil().getUserAgent());
        }
        if (currentDriver == null) {
            description.append("\nTest failed before WebDriver was initialized");
        } else {

            if (this instanceof PerfExecutorTestCase) {
                JSONArray json = this.getLastCollectedMetrics();
                description.append("\nPerfMetrics: " + json + ';');
            }

            description
                    .append("\nWebDriver: " + currentDriver);
            description.append("\nJS state: ");
            try {
                String dump = (String) getAuraUITestingUtil()
                        .getRawEval("return (window.$A && $A.test && $A.test.getDump())||'';");
                if (dump.isEmpty()) {
                    description.append("no errors detected");
                } else {
                    description.append(dump);
                }
            } catch (Throwable t) {
                description.append(t.getMessage());
            }

            String screenshotsDirectory = System.getProperty("screenshots.directory");
            if (screenshotsDirectory != null) {
                String screenshot = null;
                TakesScreenshot ts = (TakesScreenshot) currentDriver;
                try {
                    screenshot = ts.getScreenshotAs(OutputType.BASE64);
                } catch (WebDriverException e) {
                    description.append(String.format("%nScreenshot: {capture error: %s}", e.getMessage()));
                }

                if (screenshot != null) {
                    String fileName = getClass().getName() + "." + getName() + "_" + currentBrowserType + ".png";
                    try {
                        File path = new File(screenshotsDirectory + "/" + fileName);
                        path.getParentFile().mkdirs();
                        byte[] bytes = Base64.decodeBase64(screenshot.getBytes());
                        FileOutputStream fos = new FileOutputStream(path);
                        fos.write(bytes);
                        fos.close();
                        String baseUrl = System.getProperty("screenshots.baseurl");
                        description.append(String.format("%nScreenshot: %s/%s", baseUrl, fileName));
                    } catch (Throwable t) {
                        description.append(String.format("%nScreenshot: {save error: %s}", t.getMessage()));
                    }
                }
            }

            try {
                description.append("\nApplication cache status: ");
                description
                        .append(getAuraUITestingUtil()
                                .getRawEval(
                                        "var cache=window.applicationCache;return (cache===undefined || cache===null)?'undefined':cache.status;")
                                .toString());
            } catch (Exception ex) {
                description.append("error calculating status: " + ex);
            }
            description.append("\n");
            if (SauceUtil.areTestsRunningOnSauce()) {
                String linkToJob = SauceUtil.getLinkToPublicJobInSauce(currentDriver);
                description.append("\nSauceLabs-recording: ");
                description.append((linkToJob != null) ? linkToJob : "{not available}");
            }
        }

        // replace original exception with new exception with additional info
        Throwable newFailure;
        if (originalErr instanceof AssertionFailedError) {
            newFailure = new AssertionFailedError(description.toString());
        } else {
            description.insert(0, originalErr.getClass() + ": ");
            newFailure = new UnexpectedError(description.toString(), originalErr.getCause());
        }
        newFailure.setStackTrace(originalErr.getStackTrace());
        return newFailure;
    }

    protected BrowserType getBrowserType() {
        return currentBrowserType;
    }

    /**
     * Find all the browsers the current test case should be executed in. Test cases can be annotated with multiple
     * target browsers. If the testcase does not have an annotation, the class level annotation is used.
     *
     * @return
     * @throws NoSuchMethodException
     */
    public Set<BrowserType> getTargetBrowsers() {
        TargetBrowsers targetBrowsers = null;
        try {
            Method method = getClass().getMethod(getName());
            targetBrowsers = method.getAnnotation(TargetBrowsers.class);
            if (targetBrowsers == null) {
                // Inherit defaults from the test class
                targetBrowsers = getClass().getAnnotation(TargetBrowsers.class);
            }
        } catch (NoSuchMethodException e) {
            // Do nothing
        }
        if (targetBrowsers == null) {
            // If no target browsers are specified, default to ALL
            return EnumSet.allOf(BrowserType.class);
        }
        return Sets.newEnumSet(Arrays.asList(targetBrowsers.value()), BrowserType.class);
    }

    /**
     * Browser types to be excluded for this testcase or test class.
     *
     * @return
     * @throws NoSuchMethodException
     */
    public Set<BrowserType> getExcludedBrowsers() {
        ExcludeBrowsers excludeBrowsers = null;
        try {
            Method method = getClass().getMethod(getName());
            excludeBrowsers = method.getAnnotation(ExcludeBrowsers.class);
            if (excludeBrowsers == null) {
                // Inherit defaults from the test class
                excludeBrowsers = getClass().getAnnotation(ExcludeBrowsers.class);
            }
        } catch (NoSuchMethodException e) {
            // Do nothing
        }
        if (excludeBrowsers == null) {
            return EnumSet.noneOf(BrowserType.class);
        }
        return Sets.newEnumSet(Arrays.asList(excludeBrowsers.value()), BrowserType.class);
    }

    public boolean isAccessibilityTestDisabled() {
        CheckAccessibility checkAccessibility = null;
        try {
            Method method = getClass().getMethod(getName());
            checkAccessibility = method.getAnnotation(CheckAccessibility.class);
            if (checkAccessibility == null) {
                // Inherit defaults from the test class
                checkAccessibility = getClass().getAnnotation(CheckAccessibility.class);
            }
        } catch (NoSuchMethodException e) {
            // Do nothing
        }
        return checkAccessibility != null ? !checkAccessibility.value() : false;
    }

    public WebDriver getDriver() {
        if (currentDriver == null) {
            WebDriverProvider provider = AuraUtil.get(WebDriverProvider.class);
            DesiredCapabilities capabilities;
            if (SauceUtil.areTestsRunningOnSauce()) {
                capabilities = SauceUtil.getCapabilities(currentBrowserType, this);
            } else {
                capabilities = currentBrowserType.getCapability();
            }

            boolean reuseBrowser = !needsFreshBrowser();
            capabilities.setCapability(WebDriverProvider.REUSE_BROWSER_PROPERTY, reuseBrowser);
            addPerfCapabilities(capabilities);

            /*
             * Dimension windowSize = getWindowSize(); if (currentBrowserType == BrowserType.GOOGLECHROME) {
             * WebDriverUtil.addChromeOptions(capabilities, windowSize); }
             */

	    logger.info(String.format("Requesting: %s", capabilities));
            if(currentBrowserType == BrowserType.GOOGLECHROME) {
		WebDriverUtil.addChromeOptions(capabilities, null);
	    }

            currentDriver = provider.get(capabilities);

            if (currentDriver == null) {
                fail("Failed to get webdriver for " + currentBrowserType);
            }

            /*
             * if (windowSize != null) { currentDriver.manage().window().setSize(windowSize); }
             */

            String driverInfo = "Received: " + currentDriver;
            if (SauceUtil.areTestsRunningOnSauce()) {
                driverInfo += "\n      running in SauceLabs at " + SauceUtil.getLinkToPublicJobInSauce(currentDriver);
            }
            logger.info(driverInfo);

            auraUITestingUtil = new AuraUITestingUtil(currentDriver);
            auraUITestingUtil.setTimeoutInSecs(Integer.parseInt(System.getProperty("webdriver.timeout", "30")));
            perfWebDriverUtil = new PerfWebDriverUtil(currentDriver, auraUITestingUtil);
        }
        return currentDriver;
    }

    public AuraUITestingUtil getAuraUITestingUtil() {
        if(auraUITestingUtil == null){
            auraUITestingUtil = new AuraUITestingUtil(getDriver());
            auraUITestingUtil.setTimeoutInSecs(Integer.parseInt(System.getProperty("webdriver.timeout", "30")));
        }
        return auraUITestingUtil;
    }

    /**
     * @return non-null to specify a desired window size to be set when a new driver is created
     */
    protected Dimension getWindowSize() {
        return null;
    }

    public final void quitDriver() {
        if (currentDriver != null) {
            try {
                currentDriver.quit();
            } catch (Exception e) {
                Log.getLogger(getClass()).warn(currentDriver.toString(), e);
            }
            currentDriver = null;
            auraUITestingUtil = null;
        }
    }

    protected URI getAbsoluteURI(String url) throws MalformedURLException, URISyntaxException {
        return getTestServletConfig().getBaseUrl().toURI().resolve(url);
    }

    /**
     * Append a query param to avoid possible browser caching of pages
     */
    public String addBrowserNonce(String url) {
        if (!url.startsWith("about:blank")) {
            Map<String, String> params = new HashMap<>();
            params.put("browser.nonce", String.valueOf(System.currentTimeMillis()));
            url = addUrlParams(url, params);
        }
        return url;
    }

    /**
     * Add additional parameters to the URL. These paremeters will be added after the query string, and before a hash
     * (if present).
     */
    public String addUrlParams(String url, Map<String, String> params) {
        // save any fragment
        int hashLoc = url.indexOf('#');
        String hash = "";
        if (hashLoc >= 0) {
            hash = url.substring(hashLoc);
            url = url.substring(0, hashLoc);
        }

        // strip query string
        int qLoc = url.indexOf('?');
        String qs = "";
        if (qLoc >= 0) {
            qs = url.substring(qLoc + 1);
            url = url.substring(0, qLoc);
        }

        // add any additional params
        List<NameValuePair> newParams = Lists.newArrayList();
        URLEncodedUtils.parse(newParams, new Scanner(qs), "UTF-8");
        for (String key : params.keySet()) {
            newParams.add(new BasicNameValuePair(key, params.get(key)));
        }

        return url + "?" + URLEncodedUtils.format(newParams, "UTF-8") + hash;
    }

    /**
     * Open a URI without any additional handling. This will, however, add a nonce to the URL to prevent caching of the
     * page.
     */
    protected void openRaw(URI uri) {
        String url = addBrowserNonce(uri.toString());
        getDriver().get(url);
    }

    /**
     * Open a URI without any additional handling. This will, however, add a nonce to the URL to prevent caching of the
     * page.
     */
    protected void openRaw(String url) throws MalformedURLException, URISyntaxException {
        openRaw(getAbsoluteURI(url));
    }

    /**
     * Open a url without any additional handling, not even a browser.nonce
     */
    protected void openTotallyRaw(String url) throws MalformedURLException, URISyntaxException {
        getDriver().get(getAbsoluteURI(url).toString());
    }

    /**
     * Open a URL without the usual waitForAuraInit().
     */
    protected void openNoAura(String url) throws MalformedURLException, URISyntaxException {
        open(url, getAuraModeForCurrentBrowser(), false);
    }

    /**
     * Open a Aura URL with the default mode provided by {@link WebDriverTestCase#getAuraModeForCurrentBrowser()} and
     * wait for intialization as defined by {@link AuraUITestingUtil#waitForAuraInit()}.
     *
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    protected void open(String url) throws MalformedURLException, URISyntaxException {
        open(url, getAuraModeForCurrentBrowser(), true);
    }

    /**
     * Return the Mode for web-driver test.
     */
    public Mode getAuraModeForCurrentBrowser() {
        return Mode.SELENIUM;
    }

    public void open(DefDescriptor<? extends BaseComponentDef> dd) throws MalformedURLException, URISyntaxException {
        open(getUrl(dd));
    }

    /**
     * Open a Aura URL in given aura.mode and wait for initialization.
     *
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    protected void open(String url, Mode mode) throws MalformedURLException, URISyntaxException {
        open(url, mode, true);
    }

    protected void open(String url, Mode mode, boolean waitForInit) throws MalformedURLException, URISyntaxException {
        Map<String, String> params = new HashMap<>();
        params.put("aura.mode", mode.name());
        params.put("aura.test", getQualifiedName());
        url = addUrlParams(url, params);
        getAuraUITestingUtil().getRawEval("document._waitingForReload = true;");
        try {
            openAndWait(url, waitForInit);
        } catch (TimeoutException e) {
            // Hack to avoid timeout issue for IE7 and IE8. Appears that tests fail for the first time when we run the
            // test in new vm session on Sauce.
            if (currentBrowserType == BrowserType.IE7 || currentBrowserType == BrowserType.IE8) {
                openAndWait(url, waitForInit);
            } else {
                throw e;
            }
        }
    }

    private void openAndWait(String url, boolean waitForInit) throws MalformedURLException, URISyntaxException {
        getAuraUITestingUtil().getRawEval("document._waitingForReload = true;");
        openRaw(url);
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Object ret = getAuraUITestingUtil().getRawEval("return !document._waitingForReload");
                if (ret != null && ((Boolean) ret).booleanValue()) {
                    return true;
                }
                return false;
            }
        }, getAuraUITestingUtil().getTimeout(), "fail on loading url:" + url);

        if (waitForInit) {
            getAuraUITestingUtil().waitForAuraInit(getAuraErrorsExpectedDuringInit());
        }
    }

    protected Set<String> getAuraErrorsExpectedDuringInit() {
        return Collections.emptySet();
    }

    /**
     * Wait the specified number of seconds for the provided javascript to evaluate to true.
     *
     * @throws AssertionFailedError if the provided javascript does not return a boolean.
     */
    public void waitForCondition(final String javascript, int timeoutInSecs) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return getAuraUITestingUtil().getBooleanEval(javascript);
            }
        }, timeoutInSecs, "fail on waiting for condition:" + javascript);
    }

    /**
     * Wait for the provided javascript to evaluate to true. Make sure script has return statement.
     */
    public void waitForCondition(final String javascript) {
        waitForCondition(javascript, getAuraUITestingUtil().getTimeout());
    }

    /**
     * Wait for a specified amount of time.
     */
    public void waitFor(long timeoutInSeconds) {
        WebDriverWait wait = new WebDriverWait(getDriver(), timeoutInSeconds);
        try {
            wait.until(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    return false;
                }
            });
        } catch (TimeoutException expected) {
            return;
        }
    }

    /**
     * Find first matching element in the DOM.
     */
    protected WebElement findDomElement(By locator) {
        return getAuraUITestingUtil().findDomElement(locator);
    }

    /**
     * Find list of matching element in the DOM.
     */
    protected List<WebElement> findDomElements(By locator) {
        return getAuraUITestingUtil().findDomElements(locator);
    }

    /**
     * Return true if there is at least one element matching the locator.
     */
    public boolean isElementPresent(By locator) {
        return getDriver().findElements(locator).size() > 0;
    }

    /**
     * Gets the visible text for the first element matching the locator.
     */
    protected String getText(By locator) {
        return findDomElement(locator).getText();
    }

    public Action shiftTab() {
        Actions builder = new Actions(getDriver());
        builder.keyDown(Keys.SHIFT)
                .sendKeys(Keys.TAB)
                .keyUp(Keys.SHIFT);
        return builder.build();
    }

    /**
     * Flick starting at on_element, and moving by the xoffset and yoffset with normal speed
     *
     * @param locator
     * @param xOffset
     * @param yOffset
     */
    public void flick(By locator, int xOffset, int yOffset) {
        getAuraUITestingUtil().waitForElement("Cannot locate element to flick: " + locator, locator);
        WebElement element = getAuraUITestingUtil().findDomElement(locator);
        flick(element, xOffset, yOffset, FlickAction.SPEED_NORMAL);
    }

    public void flick(WebElement element, int xOffset, int yOffset) {
        // FlickAction.SPEED_FAST is too slow for the tests so changing it to 200
        flick(element, xOffset, yOffset, 200);
    }

    public void flick(WebElement element, int xOffset, int yOffset, int speed) {
        WebDriver driver = getDriver();
        // check for wrapped driver
        if (driver instanceof EventFiringWebDriver) {
            driver = ((EventFiringWebDriver) driver).getWrappedDriver();
        }
        driver = augmentDriver();
        // for iPhone
        int yOffsetByDevice = yOffset;

        if (this.getBrowserType() == BrowserType.IPAD) {
            yOffsetByDevice = yOffset * 2;
        }
        if (driver instanceof HasTouchScreen) {
            Action flick = (new TouchActions(driver)).flick(element, xOffset, yOffsetByDevice, speed).build();
            flick.perform();
        } else {
            Action flick = (new Actions(driver)).dragAndDropBy(element, xOffset, yOffsetByDevice).build();
            flick.perform();
        }
    }

    public void flick(int xOffset, int yOffset) {
        WebDriver driver = getDriver();
        driver = augmentDriver();
        // for iPhone
        int yOffsetByDevice = yOffset;

        if (this.getBrowserType() == BrowserType.IPAD) {
            yOffsetByDevice = yOffset * 2;
        }

        Action flick = (new TouchActions(driver)).flick(xOffset, yOffsetByDevice).build();
        flick.perform();
    }

    private RemoteIOSDriver augmentDriver() {
        RemoteIOSDriver driver = IOSDriverAugmenter.getIOSDriver((RemoteWebDriver) getDriver());
        return driver;
    }

    protected void assertClassesSame(String message, String expected, String actual) {
        getAuraUITestingUtil().assertClassesSame(message, expected, actual);
    }

    @Override
    public void runBare() throws Throwable {
    	injectBeans();
        logger.info(String.format("Running: %s.%s", getClass().getName(), getName()));
        runTest();
    }
}
