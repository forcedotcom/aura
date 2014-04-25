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

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.test.perf.PerfTest;
import org.auraframework.util.test.perf.data.PerfMetrics;
import org.auraframework.util.test.perf.data.PerfRunsCollector;

/**
 * Miscellaneous tests for the perf framework.
 */
@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.IPHONE })
@PerfTest
public final class PerfFrameworkTest extends WebDriverTestCase {

    public PerfFrameworkTest(String name) {
        super(name);
    }

    @Override
    protected int numPerfTimelineRuns() {
        return 0; // so it only runs once in functional mod
    }

    public void testResourceTimingAPI() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }

        open("/ui/label.cmp?label=foo");

        // check the data is returned and has expected fields
        List<Map<String, Object>> data = perfWebDriverUtil.getResourceTimingData();
        assertEquals(6, data.size());
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

    public void testMultipleRunsReuseWebDriver() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }

        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 5; i++) {
            PerfMetricsCollector perfData = new PerfMetricsCollector(this);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
        }
        runs.show(System.out);
    }

    public void testMultipleRunsNewWebDriver() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }

        PerfRunsCollector runs = new PerfRunsCollector();
        for (int i = 0; i < 5; i++) {
            getDriver();
            PerfMetricsCollector perfData = new PerfMetricsCollector(this);
            perfData.startCollecting();
            open("/ui/label.cmp?label=foo");
            PerfMetrics metrics = perfData.stopCollecting();
            runs.addRun(metrics);
            quitDriver();
        }
        runs.show(System.out);
    }
}
