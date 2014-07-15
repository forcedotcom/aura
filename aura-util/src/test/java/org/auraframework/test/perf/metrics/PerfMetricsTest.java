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

import org.auraframework.test.UnitTestCase;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public final class PerfMetricsTest extends UnitTestCase {

    public void testCombine() {
        PerfMetrics m1 = new PerfMetrics();
        m1.setMetric(new PerfMetric("paints", 3));
        PerfMetrics m2 = new PerfMetrics();
        m2.setMetric(new PerfMetric("data", 100, "bytes"));

        List<JSONObject> devToolsLog = Lists.newArrayList(new JSONObject());
        m1.setDevToolsLog(devToolsLog);
        Map<String, ?> jsProfilerData = Maps.newHashMap();
        m1.setJSProfilerData(jsProfilerData);
        Map<String, ?> heapSnapshot = Maps.newHashMap();
        m1.setHeapSnapshot(heapSnapshot);

        PerfMetrics combined = PerfMetrics.combine(m1, m2);
        assertEquals(2, combined.size());
        assertEquals(3, combined.getMetric("paints").getIntValue());
        assertEquals("bytes", combined.getMetric("data").getUnits());
        assertTrue(devToolsLog == combined.getDevToolsLog());
        assertTrue(jsProfilerData == combined.getJSProfilerData());
        assertTrue(heapSnapshot == combined.getHeapSnapshot());
    }

    public void testToJSON() {
        PerfMetrics m = new PerfMetrics();
        m.setMetric(new PerfMetric("paints", 3));
        m.setMetric(new PerfMetric("data", 100, "bytes"));

        assertEquals("[{\"name\":\"data\",\"value\":100,\"units\":\"bytes\"},{\"name\":\"paints\",\"value\":3}]", m
                .toJSONArrayWithoutDetails().toString());
    }
}
