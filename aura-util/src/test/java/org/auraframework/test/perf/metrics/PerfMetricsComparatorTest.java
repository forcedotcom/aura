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

import org.auraframework.test.UnitTestCase;

public final class PerfMetricsComparatorTest extends UnitTestCase {

    public void testCompare() throws Exception {
        PerfMetrics expected = new PerfMetrics(new PerfMetric("Timeline.metric", 10), new PerfMetric("Aura.metric", 10));

        PerfMetricsComparator comparator = new PerfMetricsComparator();
        PerfMetrics actual;
        String message;

        // UC: no message if exactly the same
        actual = new PerfMetrics();
        actual.setMetric("Timeline.metric", 10);
        actual.setMetric("Aura.metric", 10);
        message = comparator.compare(expected, actual);
        assertNull(message, message);

        // UC: no message if within bounds
        actual = new PerfMetrics();
        actual.setMetric("Timeline.metric", 9);
        actual.setMetric("Aura.metric", 10);
        message = comparator.compare(expected, actual);
        assertNull(message, message);

        // UC: message if not within bounds
        actual = new PerfMetrics();
        actual.setMetric("Timeline.metric", 5);
        actual.setMetric("Aura.metric", 10);
        message = comparator.compare(expected, actual);
        assertEquals("--> perf metric out of range: Timeline.metric - expected 10, actual 5 (allowed variability 20%)",
                message);
        actual = new PerfMetrics();
        actual.setMetric("Timeline.metric", 9);
        actual.setMetric("Aura.metric", 8);
        message = comparator.compare(expected, actual);
        assertEquals("--> perf metric out of range: Aura.metric - expected 10, actual 8 (allowed variability 5%)",
                message);

        // UC: message if metric missing
        actual = new PerfMetrics();
        actual.setMetric("Timeline.metric", 10);
        message = comparator.compare(expected, actual);
        assertEquals("--> perf metric out of range: Aura.metric - expected 10, actual 0 (allowed variability 5%)",
                message);
        // UC: allow at least 1 for small ints
        expected = new PerfMetrics(new PerfMetric("Timeline.metric", 3));
        actual = new PerfMetrics(new PerfMetric("Timeline.metric", 2));
        message = comparator.compare(expected, actual);
        assertNull(message, message);

        // UC: show non-sorted sequence for MedianPerfMetrics
        expected = new PerfMetrics(new PerfMetric("Network.bytes", 0));
        PerfMetrics run1 = new PerfMetrics(new PerfMetric("Network.bytes", 3));
        PerfMetrics run2 = new PerfMetrics(new PerfMetric("Network.bytes", 4));
        PerfMetrics run3 = new PerfMetrics(new PerfMetric("Network.bytes", 2));
        PerfRunsCollector collector = new PerfRunsCollector();
        collector.addRun(run1);
        collector.addRun(run2);
        collector.addRun(run3);
        actual = collector.getMedianMetrics();
        message = comparator.compare(expected, actual);
        assertEquals(
                "--> perf metric out of range: Network.bytes - expected 0, actual 3 [3 4 2 |*:median-run average:3] (allowed variability 20%)",
                message);
        actual = collector.getMedianRun();
        message = comparator.compare(expected, actual);
        assertEquals(
                "--> perf metric out of range: Network.bytes - expected 0, actual 3 [*3 4 2 |*:median-run average:3] (allowed variability 20%)",
                message);

        // UC: round allowed variability to closest int
        // expected 19, actual 23 [30 20 25 23 *23 |*:median-run average:24] (allowed variability 20%)
        expected = new PerfMetrics(new PerfMetric("Timeline.paint", 18));
        collector = new PerfRunsCollector();
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 30)));
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 20)));
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 25)));
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 23)));
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 23)));
        actual = collector.getMedianMetrics();
        message = comparator.compare(expected, actual);
        assertEquals(
                "--> perf metric out of range: Timeline.paint - expected 18, actual 23 [30 20 25 23 23 |*:median-run average:24] (allowed variability 20%)",
                message);
        // UC: round allowed variability to closest int
        expected = new PerfMetrics(new PerfMetric("Timeline.paint", 19));
        message = comparator.compare(expected, actual);
        assertNull(message, message);

        // UC: don't show median/average if just one run
        expected = new PerfMetrics(new PerfMetric("Timeline.paint", 18));
        collector = new PerfRunsCollector();
        collector.addRun(new PerfMetrics(new PerfMetric("Timeline.paint", 30)));
        actual = collector.getMedianMetrics();
        message = comparator.compare(expected, actual);
        assertEquals(
                "--> perf metric out of range: Timeline.paint - expected 18, actual 30 [30] (allowed variability 20%)",
                message);
    }
}
