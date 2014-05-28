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
package org.auraframework.util.test;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.perf.metrics.PerfMetric;
import org.auraframework.test.perf.metrics.PerfMetrics;
import org.json.JSONArray;

public final class PerfGoldFilesUtilTest extends UnitTestCase {

    public void testPerfMetricsSerialization() throws Exception {
        // generate metrics gold file
        PerfMetrics metrics = new PerfMetrics();
        PerfMetric metric1 = new PerfMetric("metric1", 1);
        metric1.setDetails(new JSONArray("[{\"bytes\":\"3\"}]"));
        metrics.setMetric(metric1);
        metrics.setMetric(new PerfMetric("metric2", 2));
        String text = PerfGoldFilesUtil.toGoldFileText(metrics, true);

        // check the gold file is json-parseable
        JSONArray json = new JSONArray(text);
        assertEquals(3, json.length());

        // read metrics back
        PerfMetrics readMetrics = PerfGoldFilesUtil.fromGoldFileText(text);
        assertEquals(2, readMetrics.size());
        metric1 = readMetrics.getMetric("metric1");
        assertEquals(1, metric1.getIntValue());
        assertEquals(2, readMetrics.getMetric("metric2").getIntValue());

        JSONArray details = metric1.getDetails();
        assertEquals(3, details.getJSONObject(0).getInt("bytes"));
    }
}
