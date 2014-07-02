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

import java.io.PrintStream;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import org.json.JSONException;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Collects, analyzes and displays metrics data from multiple runs.
 */
public final class PerfRunsCollector {

    private static final Logger LOG = Logger.getLogger(PerfRunsCollector.class.getSimpleName());

    private final List<PerfMetrics> allMetricsRuns = Lists.newArrayList();

    public void addRun(PerfMetrics metrics) {
        allMetricsRuns.add(metrics);
    }

    /**
     * @return metrics for the run that more closely represents the median metrics, it returns a new PerfMetrics object
     *         with extra info regarding the other runs in the set this run belongs to
     */
    public PerfMetrics getMedianRun() throws JSONException {
        PerfMetrics medianMetrics = getMedianMetrics();

        // find run with more metrics that match the median ones
        PerfMetrics bestMatch = null;
        int numSameBestMatch = -1;
        int medianRunNumber = -1;
        for (int i = 0; i < allMetricsRuns.size(); i++) {
            PerfMetrics metricsRun = allMetricsRuns.get(i);
            int numSame = metricsRun.numSame(medianMetrics);
            if (numSameBestMatch < numSame) {
                numSameBestMatch = numSame;
                bestMatch = metricsRun;
                medianRunNumber = i + 1;
            }
        }

        // store runs info by creating MedianPerfMetric for each metric
        PerfMetrics medianRunMetrics = new PerfMetrics();
        for (String metricName : getAllMetricNamesSeen()) {
            List<PerfMetric> metricRuns = Lists.newArrayList();
            for (PerfMetrics run : allMetricsRuns) {
                metricRuns.add(run.getNonnullMetric(metricName));
            }
            medianRunMetrics.setMetric(new MedianPerfMetric(bestMatch.getNonnullMetric(metricName), metricRuns,
                    medianRunNumber));
        }

        // transfer info to the new metrics object that represents the median run
        medianRunMetrics.setDevToolsLog(bestMatch.getDevToolsLog());
        medianRunMetrics.setJSProfilerData(bestMatch.getJSProfilerData());
        medianRunMetrics.setHeapSnapshot(bestMatch.getHeapSnapshot());

        LOG.info("median run was run " + medianRunNumber + '/' + allMetricsRuns.size());
        return medianRunMetrics;
    }

    /**
     * @return the median metric from the runs
     */
    public PerfMetrics getMedianMetrics() throws JSONException {
        PerfMetrics medianMetrics = new PerfMetrics();
        for (String metricName : getAllMetricNamesSeen()) {
            List<PerfMetric> metricRuns = Lists.newArrayList();
            for (PerfMetrics run : allMetricsRuns) {
                metricRuns.add(run.getNonnullMetric(metricName));
            }
            medianMetrics.setMetric(getMedian(metricRuns));
        }
        return medianMetrics;
    }

    private PerfMetric getMedian(List<PerfMetric> runs) throws JSONException {
        List<PerfMetric> sortedRuns = Lists.newArrayList(runs);
        Collections.sort(sortedRuns);
        PerfMetric medianMetric = sortedRuns.get((runs.size() - 1) / 2);
        return new MedianPerfMetric(medianMetric, runs, -1);
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
