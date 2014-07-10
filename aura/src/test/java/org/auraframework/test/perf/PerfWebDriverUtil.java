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
package org.auraframework.test.perf;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.test.SauceUtil;
import org.auraframework.test.WebDriverTestCase.UnexpectedError;
import org.auraframework.test.perf.rdp.CPUProfilerAnalyzer;
import org.auraframework.test.perf.rdp.RDPNotification;
import org.auraframework.util.AuraUITestingUtil;
import org.auraframework.util.json.JsonReader;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Utility WebDriver methods related to performance
 */
public final class PerfWebDriverUtil {

    private static final Logger LOG = Logger.getLogger(PerfWebDriverUtil.class.getSimpleName());

    private static final LoggingPreferences PERFORMANCE_LOGGING_PREFS;

    static {
        // NOTE: need to create single LoggingPreferences object to be reused as LoggingPreferences
        // doesn't implement hashCode()/equals() correctly
        PERFORMANCE_LOGGING_PREFS = new LoggingPreferences();
        PERFORMANCE_LOGGING_PREFS.enable(LogType.PERFORMANCE, Level.INFO);
        // logPrefs.enable(LogType.BROWSER, Level.ALL);
        // Level.FINE for LogType.DRIVER shows all dev tools requests and responses
        // logPrefs.enable(LogType.DRIVER, Level.WARNING);
        // N/A in chromedriver: logPrefs.enable(LogType.PROFILER, Level.ALL);
        // N/A in chromedriver: logPrefs.enable(LogType.CLIENT, Level.ALL);
        // N/A in chromedriver: logPrefs.enable(LogType.SERVER, Level.ALL);
    }

    /**
     * Adds capabilites to request collecting WebDriver performance data
     */
    public static void addLoggingCapabilities(DesiredCapabilities capabilities) {
        capabilities.setCapability(CapabilityType.LOGGING_PREFS, PERFORMANCE_LOGGING_PREFS);
    }

    /**
     * Pretty-prints the data from the Resource Timing API
     */
    public static void showResourceTimingData(List<Map<String, Object>> data) {
        for (Map<String, Object> entry : data) {
            try {
                System.out.println("entry: " + new JSONObject(entry).toString(2));
            } catch (JSONException e) {
                throw new RuntimeException(String.valueOf(entry), e);
            }
        }
    }

    // instance:

    private final WebDriver driver;
    private final AuraUITestingUtil auraUITestingUtil;

    public PerfWebDriverUtil(WebDriver driver, AuraUITestingUtil auraUITestingUtil) {
        this.driver = driver;
        this.auraUITestingUtil = auraUITestingUtil;
    }

    /**
     * @return new RDPNotifications since the last call to this method
     */
    public List<RDPNotification> getRDPNotifications() {
        List<LogEntry> logEntries = getLogEntries(LogType.PERFORMANCE);
        List<RDPNotification> events = Lists.newArrayList();
        for (LogEntry logEntry : logEntries) {
            if (LOG.isLoggable(Level.FINE)) {
                LOG.fine("LOG_ENTRY: " + logEntry);
            }
            String message = logEntry.getMessage();
            // logMessage is: {"message":{"method":"Timeline.eventRecorded","params":{...
            try {
                JSONObject json = new JSONObject(message);
                JSONObject event = json.getJSONObject("message");
                String webview = json.getString("webview");
                events.add(new RDPNotification(event, webview));
            } catch (JSONException e) {
                LOG.log(Level.WARNING, message, e);
            }
        }
        return events;
    }

    public void addTimelineTimeStamp(String label) {
        ((JavascriptExecutor) driver).executeScript("console.timeStamp('" + label + "')");
    }

    //

    /**
     * @param type one of the LogTypes, i.e. LogType.PERFORMANCE
     * @return log entries accumulated since the last time this method was called
     */
    private List<LogEntry> getLogEntries(String type) {
        try {
            return driver.manage().logs().get(type).getAll();
        } catch (WebDriverException ignore) {
            // i.e. log type 'profiler' not found
        } catch (Exception e) {
            LOG.log(Level.WARNING, type, e);
        }
        return NO_ENTRIES;
    }

    private static final List<LogEntry> NO_ENTRIES = ImmutableList.of();

    // window.performance

    /**
     * @return the usedJSHeapSize from window.performance.memory
     */
    public long getUsedJSHeapSize() {
        return (long) ((JavascriptExecutor) driver).executeScript("return window.performance.memory.usedJSHeapSize");
    }

    /**
     * See https://developers.google.com/chrome-developer-tools/docs/network and http://www.w3.org/TR/resource-timing
     * 
     * @return Resource Timing API performance
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, ?>> getResourceTimingData() {
        List<Map<String, ?>> entries = (List<Map<String, ?>>) ((JavascriptExecutor) driver)
                .executeScript("return window.performance.getEntries()");
        return entries;
    }

    // UIPerfStats:

    public void clearUIPerfStats() {
        auraUITestingUtil.getEval("$A.Perf.removeStats()");
    }

    public Map<String, String> getUIPerfStats(String stage, List<String> transactionsToGather) {
        Map<String, String> stats = Maps.newHashMap();
        String json = auraUITestingUtil.getEval("return $A.util.json.encode($A.Perf.toJson())").toString();
        json = json.substring(1, json.length() - 1);
        json = json.replace("\\\"", "\"");
        StringReader in = new StringReader(json);
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
        @SuppressWarnings("unchecked")
        ArrayList<HashMap<?, ?>> measures = (ArrayList<HashMap<?, ?>>) message
                .get("measures");
        for (HashMap<?, ?> marks : measures) {
            if (!transactionsToGather.isEmpty()) {
                if (!transactionsToGather.contains(marks.get("measure")) &&
                        // IE10 list of measures was not in the same order
                        // as expected in transactionsToGather so need to
                        // make sure measure and transactionsToGather are
                        // similar
                        !isSimilar(
                                (String) marks.get("measure"),
                                transactionsToGather.get(0))) {
                    continue;
                }
            }
            String measureName = marks.get("measure").toString()
                    + (stage != null ? ("_" + stage) : "");
            stats.put(measureName, marks.get("et").toString());
        }
        return stats;
    }

    private static boolean isSimilar(String str1, String str2) {
        char[] str1Arr = str1.toCharArray();
        char[] str2Arr = str1.toCharArray();
        Arrays.sort(str1Arr);
        Arrays.sort(str2Arr);
        str1 = new String(str1Arr);
        str2 = new String(str2Arr);
        return str1.equals(str2);
    }

    // JS heap snapshot

    /**
     * See https://code.google.com/p/chromedriver/issues/detail?id=519<br/>
     * Note: slow, each call takes a couple of seconds
     * 
     * @return JS heap snapshot
     */
    @SuppressWarnings("unchecked")
    public Map<String, ?> takeHeapSnapshot() {
        if (SauceUtil.areTestsRunningOnSauce()) {
            throw new UnsupportedOperationException("required 2.10 chromedriver still not available in SauceLabs");
        }
        long startTime = System.currentTimeMillis();
        Map<String, ?> snapshot = (Map<String, ?>) ((JavascriptExecutor) driver).executeScript(":takeHeapSnapshot");
        LOG.info("took heap snapshot in " + (System.currentTimeMillis() - startTime) + " ms");
        return snapshot;
    }

    /**
     * Analyzes the data in the snapshot and returns summary data
     */
    @SuppressWarnings("unchecked")
    public static JSONObject analyzeHeapSnapshot(Map<String, ?> data) {
        Map<String, ?> metadata = (Map<String, ?>) data.get("snapshot");
        int nodeCount = ((Number) metadata.get("node_count")).intValue();

        // "node_fields": ["type","name","id","self_size","edge_count"]
        List<Number> nodes = (List<Number>) data.get("nodes");
        int totalSize = 0;
        for (int i = 0; i < nodeCount; i++) {
            totalSize += nodes.get(5 * i + 3).intValue();
        }

        JSONObject json = new JSONObject();
        try {
            json.put("node_count", nodeCount);
            json.put("total_size", totalSize);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        return json;
    }

    // JavaScript CPU Profiler

    /**
     * Start JavaScript CPU profiler
     */
    public void startProfile() {
        if (!PerfUtil.MEASURE_JSCPU_METRICTS) {
            return;
        }

        try {
            ((JavascriptExecutor) driver).executeScript(":startProfile");
        } catch (UnsupportedCommandException e) {
            // happens about .5% of the time
            LOG.log(Level.WARNING, ":startProfile failed, retrying", e);
            ((JavascriptExecutor) driver).executeScript(":startProfile");
        }
    }

    /**
     * Stop JavaScript CPU profiler and return profile info
     * 
     * See https://src.chromium.org/viewvc/chrome?revision=271803&view=revision
     */
    @SuppressWarnings("unchecked")
    public Map<String, ?> endProfile() {
        if (!PerfUtil.MEASURE_JSCPU_METRICTS) {
            return null;
        }
        // takes about 300ms for ui:button
        Map<String, ?> retval = null;

        try {
            retval = (Map<String, ?>) ((JavascriptExecutor) driver).executeScript(":endProfile");
        } catch (UnsupportedCommandException e) {
            // happens about .5% of the time
            LOG.log(Level.WARNING, ":endProfile failed, retrying", e);
            retval = (Map<String, ?>) ((JavascriptExecutor) driver).executeScript(":endProfile");
        }

        if (retval == null) {
            LOG.warning(":endProfile returned no results");
            return null;
        }
        return (Map<String, ?>) retval.get("profile");
    }

    public static JSONObject analyzeCPUProfile(Map<String, ?> profile) throws JSONException {
        return new CPUProfilerAnalyzer(profile).analyze();
    }

    /**
     * @return true if the test failure is most likely an infrastructure error (i.e. SauceLabs problem)
     */
    public static boolean isInfrastructureError(Throwable testFailure) {
        if (testFailure instanceof UnexpectedError) {
            testFailure = testFailure.getCause();
        }

        if (testFailure instanceof TimeoutException) {
            // i.e. aura did not even load
            return true;
        }

        if (testFailure instanceof UnsupportedCommandException) {
            // org.openqa.selenium.UnsupportedCommandException: ERROR Job 2cf6026df5514bd1a859b1a82ef1c25a is not in
            // progress. It may have recently finished, or experienced an error. You can learn more at
            // https://saucelabs.com/jobs/2cf6026df5514bd1a859b1a82ef1c25a Command duration or timeout: 122 milliseconds
            String m = testFailure.getMessage();
            if (m != null && m.contains("is not in progress")) {
                return true;
            }
        }

        return false;
    }
}
