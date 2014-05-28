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

import java.util.Map;
import java.util.Set;

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
        for (PerfMetrics metrics : metricsList) {
            if (metrics != null) {
                if (combined == null) {
                    // so we return null of all metrics in metricsList are null
                    combined = new PerfMetrics();
                }
                for (String name : metrics.getAllMetricNames()) {
                    if (!combined.hasMetric(name)) {
                        combined.setMetric(metrics.getMetric(name));
                    }
                }
            }
        }
        return combined;
    }

    // instance:

    private final Map<String, PerfMetric> metrics = Maps.newHashMap();

    public PerfMetrics() {
    }

    /**
     * @return the PerfMetric for the given metric name
     */
    public PerfMetric getMetric(String name) {
        return metrics.get(name);
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
}
