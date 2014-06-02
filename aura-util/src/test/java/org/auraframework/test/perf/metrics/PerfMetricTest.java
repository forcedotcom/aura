package org.auraframework.test.perf.metrics;

import org.auraframework.test.UnitTestCase;

public final class PerfMetricTest extends UnitTestCase {

    /**
     * Checks equals()/hashCode()/compareTo()
     */
    public void testEquality() {
        PerfMetric same1 = new PerfMetric("paints", 2);
        PerfMetric same2 = new PerfMetric("paints", 2);
        PerfMetric diff = new PerfMetric("paints", 3);

        assertTrue(same1.equals(same2));
        assertTrue(same1.hashCode() == same2.hashCode());
        assertFalse(same1.equals(diff));

        assertEquals(0, same1.compareTo(same2));
        assertEquals(-1, same1.compareTo(diff));
    }
}
