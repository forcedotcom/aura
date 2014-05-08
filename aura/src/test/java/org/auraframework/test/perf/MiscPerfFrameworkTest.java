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

import java.io.File;
import java.util.List;
import java.util.Map;

import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.perf.core.AbstractPerfTestCase;
import org.auraframework.test.perf.metrics.PerfMetric;
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
        return 0; // only run once (the first functional run)
    }

    public void testTakeHeapSnapshot() throws Exception {
        openRaw("/ui/label.cmp?label=foo");

        Map data = perfWebDriverUtil.takeHeapSnapshot();
        PerfWebDriverUtil.showHeapSnapshot(data);
        PerfWebDriverUtil.writeHeapSnapshot(data, new File(System.getProperty("java.io.tmpdir")
                + "/perf/heap/wd.heapsnapshot"));

        JSONObject summary = PerfWebDriverUtil.analyzeHeapSnapshot(data);
        int nodeCount = summary.getInt("node_count");
        int totalSize = summary.getInt("total_size");
        assertTrue("node_count: " + nodeCount, nodeCount > 10000);
        assertTrue("total_size: " + totalSize, totalSize > 1000000);
    }

    public void testJSMemoryUsage() throws Exception {
        int startSize = getBrowserJSHeapSize();

        openRaw("/ui/label.cmp?label=foo");

        int delta = getBrowserJSHeapSize() - startSize;
        assertTrue("delta js heap size: " + delta, delta > 1000000);
    }

    public void testResourceTimingAPI() throws Exception {
        openRaw("/ui/label.cmp?label=foo");

        // check the data is returned and has expected fields
        List<Map<String, Object>> data = perfWebDriverUtil.getResourceTimingData();
        assertTrue("num requests: " + data.size(), data.size() >= 5);
        Map<String, Object> entry = data.get(0);
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

    public void testPageRefresh() throws Exception {
        PerfMetricsCollector metricsCollector = new PerfMetricsCollector(this, true);
        metricsCollector.startCollecting();
        openRaw("/ui/label.cmp?label=foo");
        PerfMetrics metrics = metricsCollector.stopCollecting();
        logger.info("METRICS (first):\n" + metrics.toLongString());
        PerfMetric paint = metrics.getMetric("Timeline.Painting.Paint");
        int numPaintsInit = paint.getIntValue();
        assertTrue("init: " + numPaintsInit, numPaintsInit >= 4); // TODO: why is bigger the first time?
        int bytes = metrics.getMetric("Network.encodedDataLength").getIntValue();
        assertTrue("nothing cached: " + bytes, bytes > 100000);

        // do a page refresh
        metricsCollector = new PerfMetricsCollector(this, true);
        metricsCollector.startCollecting();
        currentDriver.navigate().refresh();
        metrics = metricsCollector.stopCollecting();
        logger.info("METRICS (refresh):\n" + metrics.toLongString());
        paint = metrics.getMetric("Timeline.Painting.Paint");
        int numPaintsRefresh = paint.getIntValue();
        assertTrue("refresh: " + numPaintsRefresh, numPaintsRefresh < numPaintsInit);
        bytes = metrics.getMetric("Network.encodedDataLength").getIntValue();
        assertTrue("most cached: " + bytes, bytes < 20000);

        // go to the same page instead of refreshing
        metricsCollector = new PerfMetricsCollector(this, true);
        metricsCollector.startCollecting();
        openRaw("/ui/label.cmp?label=foo");
        metrics = metricsCollector.stopCollecting();
        logger.info("METRICS (revisit):\n" + metrics.toLongString());
        paint = metrics.getMetric("Timeline.Painting.Paint");
        int numPaintsGet = paint.getIntValue();
        assertTrue("get: " + numPaintsGet, numPaintsGet < numPaintsInit);
        assertEquals(numPaintsRefresh, paint.getIntValue()); // refresh on browser gives 2 also
        bytes = metrics.getMetric("Network.encodedDataLength").getIntValue();
        assertTrue("most cached: " + bytes, bytes < 20000);
    }

    public void testMultipleRunsReuseWebDriver() throws Exception {
        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 5; i++) {
            PerfMetricsCollector perfData = new PerfMetricsCollector(this, true);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
        }
        runs.show(System.out);
    }

    public void testMultipleRunsNewWebDriver() throws Exception {
        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 5; i++) {
            getDriver();
            PerfMetricsCollector perfData = new PerfMetricsCollector(this, true);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
            quitDriver();
        }
        runs.show(System.out);
    }
}
