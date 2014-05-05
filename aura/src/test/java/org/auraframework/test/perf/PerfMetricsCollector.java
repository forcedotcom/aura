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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.test.perf.data.PerfMetric;
import org.auraframework.util.test.perf.data.PerfMetrics;
import org.auraframework.util.test.perf.rdp.RDPAnalyzer;
import org.auraframework.util.test.perf.rdp.RDPNotification;
import org.auraframework.util.test.perf.rdp.RDPUtil;
import org.auraframework.util.test.perf.rdp.TimelineEventStats;
import org.auraframework.util.test.perf.rdp.TimelineEventUtil;
import org.json.JSONArray;
import org.json.JSONObject;

import com.google.common.collect.Lists;

/**
 * Collects and holds raw perf metrics data for a test case
 */
public final class PerfMetricsCollector {

    private static final Logger LOG = Logger.getLogger(PerfMetricsCollector.class.getSimpleName());

    private final WebDriverTestCase test;
    private long startMillis;

    // the perf metrics collected:
    private long elapsedMillis;
    private Map<String, String> uiPerfStats;
    private List<RDPNotification> notifications;

    public PerfMetricsCollector(WebDriverTestCase test) {
        this.test = test;
    }

    // events

    public void startCollecting() {
        startMillis = System.currentTimeMillis();
        test.getRDPNotifications(); // to reset logs
    }

    public PerfMetrics stopCollecting() {
        elapsedMillis = System.currentTimeMillis() - startMillis;
        collectUIPerfMetrics();
        return analyze();
    }

    // private:

    /**
     * Analyzes the raw perf data and returns relevant metrics
     */
    private PerfMetrics analyze() {
        RDPAnalyzer analyzer = new RDPAnalyzer(notifications);
        PerfMetrics metrics = new PerfMetrics();
        try {
            metrics.setMetric(new PerfMetric("WallTime", elapsedMillis, "milliseconds"));

            // add "Network..." metrics:
            for (PerfMetric metric : analyzer.analyzeNetworkDomain()) {
                metrics.setMetric(metric);
            }

            // add "Timeline..." metrics:
            Map<String, TimelineEventStats> timelineEventsStats = analyzer.analyzeTimelineDomain();
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
        } catch (Exception e) {
            LOG.log(Level.WARNING, test.getName(), e);
        }
        return metrics;
    }

    public List<JSONObject> getDevToolsLog() {
        List<JSONObject> devToolsLog = Lists.newArrayList();
        for (RDPNotification notification : notifications) {
            if (notification.isTimelineEvent()) {
                JSONObject devToolsMessage = notification.getTimelineEvent();
                devToolsLog.add(devToolsMessage);
            }
        }
        return devToolsLog;
    }

    /**
     * @return the log between our timeline marks only
     */
    public List<JSONObject> getDevToolsLogBetweenMarks() {
        List<JSONObject> all = getDevToolsLog();

        // return full timeline if there are no marks
        if (!RDPUtil.containsTimelineStamp(all, RDPAnalyzer.MARK_TIMELINE_START)) {
            return all;
        }

        List<JSONObject> trimmed = Lists.newArrayList();
        boolean between = false;
        for (JSONObject event : all) {
            if (!between) {
                between = TimelineEventUtil.hasTimelineTimeStamp(event, RDPAnalyzer.MARK_TIMELINE_START);
            }
            if (between) {
                trimmed.add(event);
                if (TimelineEventUtil.hasTimelineTimeStamp(event, RDPAnalyzer.MARK_TIMELINE_END)) {
                    break;
                }
            }
        }
        return trimmed;
    }

    private Map<String, String> getAllUIPerfStats() {
        return test.getUIPerfStats(new ArrayList<String>());
    }

    private void collectUIPerfMetrics() {
        // get timeline before anything else so only events from the test appear
        notifications = test.getRDPNotifications();
        Mode mode = test.getCurrentAuraMode();
        if (mode == Mode.PTEST || mode == Mode.CADENCE) {
            uiPerfStats = getAllUIPerfStats();
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("PerfMetricsCollector[");
        sb.append(test.getName());
        sb.append(",elapsed=" + elapsedMillis);
        sb.append(",RDP=" + ((notifications != null) ? notifications : 0));
        sb.append(",#statsEntries=" + ((uiPerfStats != null) ? uiPerfStats.size() : 0));
        sb.append(']');
        return sb.toString();
    }
}
