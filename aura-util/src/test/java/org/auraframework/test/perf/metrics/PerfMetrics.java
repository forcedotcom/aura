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

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.util.test.PerfGoldFilesUtil;
import org.json.JSONArray;
import org.json.JSONObject;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Maps;

/**
 * Represents a set of metrics values (i.e. all metrics collected in a single test case run)
 */
public final class PerfMetrics {

    /**
     * Combines the metrics from multiple metrics objects into a single one. If a metric appears in more than one metric
     * object the first metric value found is used.
     */
    public static PerfMetrics combine(PerfMetrics... metricsList) {
        PerfMetrics combined = null;
        List<JSONObject> devToolsLog = null;
        Map<String, ?> jsProfilerData = null;
        Map<String, ?> heapSnapshot = null;
        for (PerfMetrics metrics : metricsList) {
            if (metrics != null) {
                if (devToolsLog == null) {
                    devToolsLog = metrics.getDevToolsLog();
                }
                if (jsProfilerData == null) {
                    jsProfilerData = metrics.getJSProfilerData();
                }
                if (heapSnapshot == null) {
                    heapSnapshot = metrics.getHeapSnapshot();
                }
                if (combined == null) {
                    // so we return null if all metrics in metricsList are null
                    combined = new PerfMetrics();
                }
                for (String name : metrics.getAllMetricNames()) {
                    if (!combined.hasMetric(name)) {
                        combined.setMetric(metrics.getMetric(name));
                    }
                }
            }
        }
        if (combined != null) {
            combined.setDevToolsLog(devToolsLog);
            combined.setJSProfilerData(jsProfilerData);
            combined.setHeapSnapshot(heapSnapshot);
        }
        return combined;
    }

    // instance:

    private final Map<String, PerfMetric> metrics = Maps.newHashMap();
    private List<JSONObject> devToolsLog;
    private Map<String, ?> jsProfilerData;
    private Map<String, ?> heapSnapshot;

    public PerfMetrics() {
    }

    public PerfMetrics(PerfMetric... metrics) {
        for (PerfMetric metric : metrics) {
            setMetric(metric);
        }
    }

    /**
     * @return the PerfMetric for the given metric name
     */
    public PerfMetric getMetric(String name) {
        return metrics.get(name);
    }

    /**
     * @return the Dev Tools log corresponding to the timeline metrics in this object
     */
    public List<JSONObject> getDevToolsLog() {
        return devToolsLog;
    }

    public void setDevToolsLog(List<JSONObject> devToolsLog) {
        this.devToolsLog = devToolsLog;
    }

    public Map<String, ?> getJSProfilerData() {
        return jsProfilerData;
    }

    public void setJSProfilerData(Map<String, ?> jsProfilerData) {
        this.jsProfilerData = jsProfilerData;
    }

    public Map<String, ?> getHeapSnapshot() {
        return heapSnapshot;
    }

    public void setHeapSnapshot(Map<String, ?> heapSnapshot) {
        this.heapSnapshot = heapSnapshot;
    }

    /**
     * @return the PerfMetric for a given metric name, if non existing it will return a metric object with a 0 value
     */
    public PerfMetric getNonnullMetric(String name) {
        PerfMetric metric = getMetric(name);
        if (metric == null) {
            metric = new PerfMetric(name, 0);
        }
        return metric;
    }

    /**
     * @return sorted names for all the metrics contained in this object
     */
    public Set<String> getAllMetricNames() {
        return ImmutableSortedSet.copyOf(metrics.keySet());
    }

    public int size() {
        return metrics.size();
    }

    public void setMetric(PerfMetric metric) {
        metrics.put(metric.getName(), metric);
    }

    public void setMetric(String name, Object value) {
        metrics.put(name, new PerfMetric(name, value));
    }

    public void setMetric(String name, Object value, String unit) {
        metrics.put(name, new PerfMetric(name, value, unit));
    }

    public boolean hasMetric(String name) {
        return metrics.containsKey(name);
    }

    public String toLongString() {
        StringBuilder sb = new StringBuilder();
        for (String name : getAllMetricNames()) {
            PerfMetric metric = getMetric(name);
            if (sb.length() > 0) {
                sb.append('\n');
            }
            sb.append("  " + metric.toShortText());
            String details = metric.toDetailsText(name);
            if (details != null) {
                sb.append('\n' + details);
            }
        }
        return sb.toString();
    }

    public JSONArray toJSONArrayWithoutDetails() {
        try {
            PerfMetrics metricsWithoutDetails = PerfGoldFilesUtil.fromGoldFileText(PerfGoldFilesUtil.toGoldFileText(
                    this, false));
            JSONArray array = new JSONArray();
            for (String name : metricsWithoutDetails.getAllMetricNames()) {
                array.put(metricsWithoutDetails.getMetric(name));
            }
            return array;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String toString() {
        return metrics.toString();
    }

    /**
     * @return number of metrics that are the same as the ones in the other PerfMetrics object
     */
    public int numSame(PerfMetrics other) {
        int numSame = 0;
        for (String name : metrics.keySet()) {
            if (getMetric(name).equals(other.getMetric(name))) {
                numSame++;
            }
        }
        return numSame;
    }
}
