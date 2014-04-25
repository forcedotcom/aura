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

import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.util.test.perf.rdp.TimelineEvent;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * Compares actual and expected PerfMetrics values
 */
public final class PerfMetricsComparator {

    private static final Log LOG = LogFactory.getLog(PerfMetricsComparator.class);

    private static final float ALLOWED_VARIABILITY = .2f;

    private static final Set<String> UNITS_TO_EXCLUDE = ImmutableSet.of("milliseconds");

    private static final Set<String> METRICS_TO_EXCLUDE;

    static {
        Set<String> metricsToExclude = Sets.newHashSet();

        // add loading events as those are summarized in the Network. metrics
        metricsToExclude.addAll(TimelineEvent.getCategoryMetricNames(TimelineEvent.Category.Loading));

        metricsToExclude.add("Timeline.Scripting.GCEvent"); // kind of random now
        metricsToExclude.add("Timeline.Other.Program"); // fluctuates
        metricsToExclude.add("Timeline.Scripting.FunctionCall"); // fluctuates
        metricsToExclude.add("Timeline.Scripting.XHRReadyStateChange"); // fluctuates
        metricsToExclude.add("Timeline.Scripting.TimerFire"); // fluctuates
        metricsToExclude.add("Timeline.Scripting.TimerRemove"); // fluctuates

        METRICS_TO_EXCLUDE = ImmutableSet.copyOf(metricsToExclude);
    }

    // TODO: find out why metrics are different mvn vs testSetRunner.app

    /**
     * Compares expected and actual metrics
     * 
     * @return null if actual metrics are within allowed bounds, else a message describing why they are considered
     *         different
     */
    public String compare(PerfMetrics expectedMetrics, PerfMetrics actualMetrics) {
        StringBuilder em = new StringBuilder();
        StringBuilder log = new StringBuilder();
        int numMetricsCompared = 0;

        for (String name : expectedMetrics.getAllMetricNames()) {
            PerfMetric expected = expectedMetrics.getMetric(name);
            PerfMetric actual = actualMetrics.getMetric(name);

            boolean excludeFromComparison = METRICS_TO_EXCLUDE.contains(name)
                    || UNITS_TO_EXCLUDE.contains(expected.getUnits());

            int expectedValue = expected.getIntValue();
            int actualValue = (actual != null) ? actual.getIntValue() : -1;
            int allowed_variability = Math.round(expectedValue * ALLOWED_VARIABILITY);
            if (ALLOWED_VARIABILITY > 0 && allowed_variability == 0)
                allowed_variability = 1; // allow at least 1 if non-zero %

            numMetricsCompared++;
            log.append("\n    " + name + '[' + expectedValue);
            if (actual == null || expectedValue != actualValue) {
                log.append("->");
            }
            if (actual != null && expectedValue != actualValue) {
                log.append(actualValue);
            }

            if (excludeFromComparison) {
                log.append(" excluded");
            } else if (actual == null) {
                em.append("actual perf metric missing: " + name + '\n');
                log.append("{missing}");
            } else if (Math.abs(expectedValue - actualValue) > allowed_variability) {
                em.append("perf metric out of range: " + name);
                String units = expected.getUnits();
                if (units != null) {
                    em.append(' ' + units);
                }
                em.append(" - expected " + expectedValue + ", actual "
                        + actualValue);
                if (actual instanceof MedianPerfMetric) {
                    em.append(' ');
                    em.append(((MedianPerfMetric) actual).toSequenceString());
                }
                em.append('\n');
                String expectedDetails = expected.toDetailsText("expected");
                if (expectedDetails != null) {
                    em.append(expectedDetails);
                    em.append('\n');
                }
                String actualDetails = actual.toDetailsText("actual");
                if (actualDetails != null) {
                    em.append(actualDetails);
                    em.append('\n');
                }

                log.append('*'); // to mark is out of bounds
            }
            log.append(']');

            // TODO: fail if there are new metrics or some metrics have now details?
            // (this way the gold files will be updated with the extra info)

            // TODO: non-int perf value types?
        }

        String differences = (em.length() > 0) ? em.toString().trim() : null;

        // log a message showing what was really compared, i.e.:
        // "3 metrics compared allowing 20% variability: Paint[8->9*]
        String percent = String.valueOf(Math.round(ALLOWED_VARIABILITY * 100)) + "% variability";
        String logMessage = String.valueOf(numMetricsCompared) + " metrics compared allowing " + percent + ": " + log;
        LOG.info(logMessage);

        return differences;
    }
}
