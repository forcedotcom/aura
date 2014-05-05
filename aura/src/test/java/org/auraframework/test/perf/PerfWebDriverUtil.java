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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.AuraUITestingUtil;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.test.perf.rdp.RDPNotification;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.JavascriptExecutor;
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
     * See https://developers.google.com/chrome-developer-tools/docs/network and http://www.w3.org/TR/resource-timing
     * 
     * @return Resource Timing API performance
     */
    public List<Map<String, Object>> getResourceTimingData() {
        List<Map<String, Object>> entries = (List<Map<String, Object>>) ((JavascriptExecutor) driver)
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

    // dev tools log

    /**
     * Writes the dev tools log for a perf test run to
     * System.getProperty("java.io.tmpdir")/perf/devToolsLogs/testName_runNumber.json
     */
    public static void writeDevToolsLog(List<JSONObject> devToolsLog, WebDriverTestCase test, int runNumber,
            String userAgent) {
        String path = System.getProperty("java.io.tmpdir") + "/perf/devToolsLogs/" + test.getName() + '_' + runNumber
                + ".json";
        File file = new File(path);
        try {
            writeDevToolsLog(devToolsLog, file, userAgent);
            LOG.info("wrote " + file.getAbsolutePath());
        } catch (Exception e) {
            LOG.log(Level.WARNING, "error writing " + file.getAbsolutePath(), e);
        }
    }

    public static void writeDevToolsLog(List<JSONObject> devToolsLog, File file, String userAgent) throws Exception {
        BufferedWriter out = null;
        try {
            file.getParentFile().mkdirs();
            out = new BufferedWriter(new FileWriter(file));
            out.write('[');
            out.write(JSONObject.quote(userAgent));
            for (JSONObject entry : devToolsLog) {
                out.write(',');
                out.newLine();
                out.write(entry.toString());
            }
            out.write("]");
            out.newLine();
        } finally {
            if (out != null) {
                out.flush();
                out.close();
            }
        }
    }
}
