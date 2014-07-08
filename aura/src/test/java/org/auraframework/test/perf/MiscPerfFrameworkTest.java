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

import java.util.List;
import java.util.Map;

import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.perf.core.AbstractPerfTestCase;
import org.auraframework.test.perf.metrics.PerfMetrics;
import org.auraframework.test.perf.metrics.PerfMetricsCollector;
import org.auraframework.test.perf.metrics.PerfRunsCollector;
import org.json.JSONObject;

/**
 * Miscellaneous tests for the perf framework.
 */
@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.IPHONE })
public final class MiscPerfFrameworkTest extends AbstractPerfTestCase {

    public MiscPerfFrameworkTest(String name) {
        super(name);
    }

    @Override
    protected int numPerfTimelineRuns() {
        return 0; // run only the first warmup run
    }

    @Override
    protected int numPerfAuraRuns() {
        return 0; // run only the first warmup run
    }

    // public void testTakeHeapSnapshot() throws Exception {
    // if (true) {
    // // TODO: test needs chromedriver 2.10
    // logger.warning("skipping test requiring chromedriver 2.10: " + getName());
    // return;
    // }
    // openTotallyRaw("/ui/label.cmp?label=foo");
    //
    // Map data = perfWebDriverUtil.takeHeapSnapshot();
    // PerfWebDriverUtil.showHeapSnapshot(data);
    // PerfWebDriverUtil.writeHeapSnapshot(data, new File(System.getProperty("java.io.tmpdir")
    // + "/perf/heap/wd.heapsnapshot"));
    //
    // JSONObject summary = PerfWebDriverUtil.analyzeHeapSnapshot(data);
    // int nodeCount = summary.getInt("node_count");
    // int totalSize = summary.getInt("total_size");
    // assertTrue("node_count: " + nodeCount, nodeCount > 10000);
    // assertTrue("total_size: " + totalSize, totalSize > 1000000);
    // }
    //
    // public void testJSMemoryUsage() throws Exception {
    // if (true) {
    // // TODO: test needs chromedriver 2.10
    // logger.warning("skipping test requiring chromedriver 2.10: " + getName());
    // return;
    // }
    //
    // int startSize = getBrowserJSHeapSize();
    //
    // openTotallyRaw("/ui/label.cmp?label=foo");
    //
    // int delta = getBrowserJSHeapSize() - startSize;
    // assertTrue("delta js heap size: " + delta, delta > 1000000);
    // }

    public void testProfile() throws Exception {
        startProfile();
        openTotallyRaw("/ui/label.cmp?label=foo");
        Map<String, ?> profileData = endProfile();
        if (profileData != null) {
            // profileData is null if chromedriver doesn't support profiling
            JSONObject metrics = PerfWebDriverUtil.analyzeCPUProfile(profileData);
            PerfResultsUtil.writeJSProfilerData(profileData, "testProfile");
            System.out.println(metrics.toString(2));
        }
    }

    public void testUsedJSHeapSize() throws Exception {
        openTotallyRaw("/ui/label.cmp?label=foo");

        long size = perfWebDriverUtil.getUsedJSHeapSize();
        assertTrue("JS Heap Size: " + size, size > 1000);
    }

    public void testResourceTimingAPI() throws Exception {
        openTotallyRaw("/ui/label.cmp?label=foo");

        // check the data is returned and has expected fields
        List<Map<String, ?>> data = perfWebDriverUtil.getResourceTimingData();
        assertTrue("num requests: " + data.size(), data.size() >= 5);
        Map<String, ?> entry = data.get(0);
        assertTrue(entry.containsKey("startTime"));
        assertTrue(entry.containsKey("connectStart"));
        assertTrue(entry.containsKey("connectEnd"));
        assertTrue(entry.containsKey("domainLookupStart"));
        assertTrue(entry.containsKey("duration"));
        assertTrue(entry.containsKey("fetchStart"));
        assertTrue(entry.containsKey("requestStart"));
        assertTrue(entry.containsKey("responseStart"));

        // PerfWebDriverUtil.showResourceTimingData(data);
    }

    public void testMultipleRunsReuseWebDriver() throws Exception {
        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 2; i++) {
            PerfMetricsCollector perfData = new PerfMetricsCollector(this, PerfRunMode.TIMELINE);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
        }
        runs.show(System.out);
    }

    public void testMultipleRunsNewWebDriver() throws Exception {
        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 2; i++) {
            getDriver();
            PerfMetricsCollector perfData = new PerfMetricsCollector(this, PerfRunMode.TIMELINE);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
            quitDriver();
        }
        runs.show(System.out);
    }
}
