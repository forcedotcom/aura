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
package org.auraframework.test.perf.metrics;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.PerfRunMode;
import org.auraframework.test.perf.PerfResultsUtil;
import org.auraframework.test.perf.PerfWebDriverUtil;
import org.auraframework.test.perf.rdp.CPUProfilerAnalyzer;
import org.auraframework.test.perf.rdp.RDPAnalyzer;
import org.auraframework.test.perf.rdp.RDPNotification;
import org.auraframework.test.perf.rdp.TimelineEventStats;
import org.auraframework.test.perf.rdp.TimelineEventUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.WebDriverException;

/**
 * Collects and holds raw perf metrics data for a test case
 */
public final class PerfMetricsCollector {

    private static final Logger LOG = Logger.getLogger(PerfMetricsCollector.class.getSimpleName());

    // NOTE: cannot do both JS profiler and heap in the same run, browser gets too slow or hangs
    private static final boolean CAPTURE_JS_HEAP_METRICS = false; // slow: 7 secs/call

    private final WebDriverTestCase test;
    private long startMillis;
    private int startBrowserJSHeapSizeBytes;

    // the perf metrics collected:
    private long elapsedMillis;
    private int deltaBrowserJSHeapSizeBytes;
    private List<RDPNotification> notifications;
    private Map<String, Map<String, Map<String, List<Object>>>> auraStats;
    private Map<String, ?> jsProfilerData;
    private Map<String, ?> heapSnapshot;

    private RDPAnalyzer rdpAnalyzer;
    private final PerfRunMode perfRunMode;

    public PerfMetricsCollector(WebDriverTestCase test, PerfRunMode perfRunMode) {
        this.test = test;
        this.perfRunMode = perfRunMode;
    }

    public RDPAnalyzer getRDPAnalyzer() {
        return rdpAnalyzer;
    }

    // events

    public void startCollecting() {
        switch (perfRunMode) {
        case TIMELINE:
            test.getRDPNotifications(); // to reset logs
            break;
        case PROFILE:
            test.startProfile();
            if (CAPTURE_JS_HEAP_METRICS) {
                startBrowserJSHeapSizeBytes = getBrowserJSHeapSize(test.takeHeapSnapshot());
            }
            break;
        }

        startMillis = System.currentTimeMillis();
    }

    public PerfMetrics stopCollecting() {
        elapsedMillis = System.currentTimeMillis() - startMillis;

        switch (perfRunMode) {
        case TIMELINE:
            // get timeline before anything else so only events from the test appear
            notifications = test.getRDPNotifications();
            break;
        case PROFILE:
            jsProfilerData = test.endProfile();
            if (CAPTURE_JS_HEAP_METRICS) {
                heapSnapshot = test.takeHeapSnapshot();
                deltaBrowserJSHeapSizeBytes = getBrowserJSHeapSize(heapSnapshot) - startBrowserJSHeapSizeBytes;
            }
            break;
        case AURASTATS:
            try {
                auraStats = test.getAuraStats();
            } catch (WebDriverException e) {
                // TODO: happens for framework tests
                LOG.log(Level.WARNING, "not running in STATS mode", e);
            }
            break;
        }

        return analyze();
    }

    // private:

    /**
     * Analyzes the raw perf data and returns relevant metrics
     */
    private PerfMetrics analyze() {
        PerfMetrics metrics = new PerfMetrics();

        try {
            switch (perfRunMode) {

            case TIMELINE:
                metrics.setMetric(new PerfMetric("WallTime", elapsedMillis, "milliseconds"));

                rdpAnalyzer = new RDPAnalyzer(notifications, test.getPerfStartMarker(), test.getPerfEndMarker());

                // add "Network..." metrics:
                for (PerfMetric metric : rdpAnalyzer.analyzeNetworkDomain()) {
                    metrics.setMetric(metric);
                }

                // add "Timeline..." metrics:
                Map<String, TimelineEventStats> timelineEventsStats = rdpAnalyzer.analyzeTimelineDomain();
                for (TimelineEventStats stats : timelineEventsStats.values()) {
                    PerfMetric metric = new PerfMetric();
                    metric.setName(TimelineEventUtil.toMetricName(stats.getType()));
                    metric.setValue(stats.getCount());
                    JSONArray details = stats.getDetails();
                    if (details != null) {
                        metric.setDetails(details);
                    }
                    metrics.setMetric(metric);
                }

                // keep the corresponding Dev Tools Log for the metrics
                metrics.setDevToolsLog(rdpAnalyzer.getFilteredDevToolsLog());
                break;

            case PROFILE:
                // TODO: filter jsProfilerData?
                metrics.setJSProfilerData(jsProfilerData);
                JSONObject jscpuMetrics = new CPUProfilerAnalyzer(jsProfilerData).analyze();
                metrics.setMetric("Profile.JSCPU.timeProgram", jscpuMetrics.get("timeProgramMillis"), "millis");
                metrics.setMetric("Profile.JSCPU.timeRoot", jscpuMetrics.get("timeRootMillis"), "millis");
                metrics.setMetric("Profile.JSCPU.timeIdle", jscpuMetrics.get("timeIdleMillis"), "millis");
                metrics.setMetric("Profile.JSCPU.timeGC", jscpuMetrics.get("timeGCMillis"), "millis");
                metrics.setMetric("Profile.JSCPU.numIslands", jscpuMetrics.get("numIslands"));
                metrics.setMetric("Profile.JSCPU.maxDepth", jscpuMetrics.get("maxDepth"));
                if (CAPTURE_JS_HEAP_METRICS) {
                    metrics.setHeapSnapshot(heapSnapshot);
                    metrics.setMetric("Profile.JSMEM.deltaHeap", deltaBrowserJSHeapSizeBytes, "bytes");
                }
                break;

            case AURASTATS:
                // "CreateComponent": {
                // "afterRender": {
                // "added": [],
                // "removed": []
                // }
                if (auraStats != null) {
                    String auraStatsContents = new JSONObject(auraStats).toString(2);
                    PerfResultsUtil.writeAuraStats(auraStatsContents, test.getGoldFileName());
                    for (String name : auraStats.keySet()) {
                        Map<String, Map<String, List<Object>>> nameValue = auraStats.get(name);
                        for (String method : nameValue.keySet()) {
                            Map<String, List<Object>> methodValue = nameValue.get(method);
                            for (String what : methodValue.keySet()) {
                                List<Object> value = methodValue.get(what);
                                metrics.setMetric("Aura." + name + '.' + method + '.' + what, value.size());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            LOG.log(Level.WARNING, test.getName(), e);
        }
        return metrics;
    }

    /**
     * @return the current browser JS heap size in bytes
     */
    private static int getBrowserJSHeapSize(Map<String, ?> snapshot) {
        JSONObject summary = PerfWebDriverUtil.analyzeHeapSnapshot(snapshot);
        try {
            return summary.getInt("total_size");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("PerfMetricsCollector[");
        sb.append(test.getName());
        sb.append(",elapsed=" + elapsedMillis);
        sb.append(",RDP=" + ((notifications != null) ? notifications : 0));
        sb.append(']');
        return sb.toString();
    }
}
