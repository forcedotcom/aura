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

import org.auraframework.test.UnitTestCase;

public final class PerfRunsCollectorTest extends UnitTestCase {

    public void testGetMedian() throws Exception {
        PerfMetrics run1 = new PerfMetrics();
        run1.setMetric("paints", 10);
        run1.setMetric("layouts", 8);
        run1.setMetric("bytes", 3);
        PerfMetrics run2 = new PerfMetrics();
        run2.setMetric("paints", 9);
        run2.setMetric("layouts", 7);
        run2.setMetric("bytes", 4);
        PerfMetrics run3 = new PerfMetrics();
        run3.setMetric("paints", 9);
        run3.setMetric("layouts", 6);
        run3.setMetric("bytes", 2);

        PerfRunsCollector collector = new PerfRunsCollector();
        collector.addRun(run1);
        collector.addRun(run2);
        collector.addRun(run3);

        // check median metrics
        PerfMetrics median = collector.getMedianMetrics();
        assertEquals(3, median.size());
        PerfMetric paints = median.getMetric("paints");
        PerfMetric layouts = median.getMetric("layouts");
        PerfMetric bytes = median.getMetric("bytes");
        assertEquals(9, paints.getIntValue());
        assertEquals(7, layouts.getIntValue());
        assertEquals(3, bytes.getIntValue());
        // has info on the individual runs
        List<PerfMetric> runsBytes = ((MedianPerfMetric) bytes).getRunsMetric();
        assertEquals(3, runsBytes.get(0).getIntValue());
        assertEquals(4, runsBytes.get(1).getIntValue());
        assertEquals(2, runsBytes.get(2).getIntValue());

        // check median run
        PerfMetrics medianRun = collector.getMedianRun();
        assertEquals(3, medianRun.size());
        paints = medianRun.getMetric("paints");
        layouts = medianRun.getMetric("layouts");
        bytes = medianRun.getMetric("bytes");
        assertEquals(9, paints.getIntValue());
        assertEquals(7, layouts.getIntValue());
        assertEquals(4, bytes.getIntValue());
        // median run also has info on the individual runs
        runsBytes = ((MedianPerfMetric) bytes).getRunsMetric();
        assertEquals(3, runsBytes.get(0).getIntValue());
        assertEquals(4, runsBytes.get(1).getIntValue());
        assertEquals(2, runsBytes.get(2).getIntValue());
    }
}
