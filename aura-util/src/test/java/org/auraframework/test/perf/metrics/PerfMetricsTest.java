package org.auraframework.test.perf.metrics;

import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.json.JSONObject;

import com.google.common.collect.Lists;

public final class PerfMetricsTest extends UnitTestCase {

    public void testCombine() {
        PerfMetrics m1 = new PerfMetrics();
        m1.setMetric(new PerfMetric("paints", 3));
        PerfMetrics m2 = new PerfMetrics();
        m2.setMetric(new PerfMetric("data", 100, "bytes"));

        List<JSONObject> devToolsLog = Lists.newArrayList(new JSONObject());
        m1.setDevToolsLog(devToolsLog);

        PerfMetrics combined = PerfMetrics.combine(m1, m2);
        assertEquals(2, combined.size());
        assertEquals(3, combined.getMetric("paints").getIntValue());
        assertEquals("bytes", combined.getMetric("data").getUnits());
        assertTrue(devToolsLog == combined.getDevToolsLog());
    }
}
