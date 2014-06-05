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

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.perf.PerfResultsUtil;
import org.auraframework.test.perf.rdp.RDPAnalyzer;
import org.auraframework.test.perf.rdp.RDPNotification;
import org.auraframework.test.perf.rdp.TimelineEventStats;
import org.auraframework.test.perf.rdp.TimelineEventUtil;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Collects and holds raw perf metrics data for a test case
 */
public final class PerfMetricsCollector {

    private static final Logger LOG = Logger.getLogger(PerfMetricsCollector.class.getSimpleName());

    private final WebDriverTestCase test;
    private long startMillis;
    private int startBrowserJSHeapSizeBytes;

    // the perf metrics collected:
    private long elapsedMillis;
    private int deltaBrowserJSHeapSizeBytes;
    private List<RDPNotification> notifications;
    private Map<String, Map<String, Map<String, List<Object>>>> auraStats;

    private RDPAnalyzer rdpAnalyzer;
    private final boolean captureTimelineMetrics;
    private static final boolean captureJSHeapMetrics = false; // slow

    public PerfMetricsCollector(WebDriverTestCase test, boolean captureTimelineMetrics) {
        this.test = test;
        this.captureTimelineMetrics = captureTimelineMetrics;
    }

    public RDPAnalyzer getRDPAnalyzer() {
        return rdpAnalyzer;
    }

    // events

    public void startCollecting() {
        startMillis = System.currentTimeMillis();
        if (captureTimelineMetrics) {
            test.getRDPNotifications(); // to reset logs
        }
        if (captureJSHeapMetrics) {
            startBrowserJSHeapSizeBytes = test.getBrowserJSHeapSize();
        }
    }

    public PerfMetrics stopCollecting() {
        elapsedMillis = System.currentTimeMillis() - startMillis;

        if (captureJSHeapMetrics) {
            deltaBrowserJSHeapSizeBytes = test.getBrowserJSHeapSize() - startBrowserJSHeapSizeBytes;
        }

        if (captureTimelineMetrics) {
            // get timeline before anything else so only events from the test appear
            notifications = test.getRDPNotifications();
        }

        if (hasAuraStats()) {
            auraStats = test.getAuraStats();
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
            metrics.setMetric(new PerfMetric("WallTime", elapsedMillis, "milliseconds"));

            if (captureTimelineMetrics) {
                rdpAnalyzer = new RDPAnalyzer(notifications);

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
            }

            // memory metrics
            if (captureJSHeapMetrics) {
                metrics.setMetric(new PerfMetric("Browser.JavaScript.Heap", deltaBrowserJSHeapSizeBytes, "bytes"));
            }

            // aura stats
            if (hasAuraStats()) {
                // "CreateComponent": {
                // "afterRender": {
                // "added": [],
                // "removed": []
                // }
                String auraStatsContents = new JSONObject(auraStats).toString(2);
                if (LOG.isLoggable(Level.INFO)) {
                    LOG.info("collected aura stats: " + auraStatsContents);
                }
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
        } catch (Exception e) {
            LOG.log(Level.WARNING, test.getName(), e);
        }
        return metrics;
    }

    private boolean hasAuraStats() {
        Mode mode = test.getCurrentAuraMode();
        return mode == Mode.STATS;
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
