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
