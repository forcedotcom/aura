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
package org.auraframework.util.test.perf.data;

import java.io.PrintStream;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.json.JSONException;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Collects, analyzes and displays metrics data from multiple runs.
 */
public final class PerfRunsCollector {

    private final List<PerfMetrics> allMetricsRuns = Lists.newArrayList();

    public void addRun(PerfMetrics metrics) {
        allMetricsRuns.add(metrics);
    }

    /**
     * @return the median metric from the runs
     */
    public PerfMetrics getMedianMetrics() {
        PerfMetrics medianMetrics = new PerfMetrics();
        for (String metricName : getAllMetricNamesSeen()) {
            List<PerfMetric> metricRuns = Lists.newArrayList();
            for (PerfMetrics run : allMetricsRuns) {
                PerfMetric metric = run.getMetric(metricName);
                if (metric != null) {
                    metricRuns.add(metric);
                }
            }
            medianMetrics.setMetric(getMedian(metricRuns));
        }
        return medianMetrics;
    }

    private PerfMetric getMedian(List<PerfMetric> runs) {
        List<PerfMetric> sortedRuns = Lists.newArrayList(runs);
        Collections.sort(sortedRuns);
        PerfMetric medianMetric = sortedRuns.get((runs.size() - 1) / 2);
        try {
            return new MedianPerfMetric(medianMetric, runs);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private Set<String> getAllMetricNamesSeen() {
        Set<String> metricNames = Sets.newHashSet();
        for (PerfMetrics run : allMetricsRuns) {
            metricNames.addAll(run.getAllMetricNames());
        }
        return ImmutableSortedSet.copyOf(metricNames);
    }

    // show:

    public void show(PrintStream out) {
        out.println("\nMetrics for " + allMetricsRuns.size() + " runs:");
        for (String metricName : getAllMetricNamesSeen()) {
            show(out, metricName);
        }
    }

    private void show(PrintStream out, String metricName) {
        StringBuilder sb = new StringBuilder(metricName);
        sb.append(':');
        for (PerfMetrics run : allMetricsRuns) {
            sb.append(' ');
            PerfMetric metric = run.getMetric(metricName);
            sb.append((metric != null) ? metric.getValue() : '-');
        }
        out.println(sb);
    }
}
