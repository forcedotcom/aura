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
package org.auraframework.test.perf.rdp;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.perf.rdp.CPUProfilerAnalyzer.MaxDepthCollector;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.CharStreams;

public final class CPUProfilerAnalyzerTest extends UnitTestCase {

    @SuppressWarnings("unchecked")
    public void testAnalyze() throws Exception {
        InputStream input = CPUProfilerAnalyzerTest.class
                .getResourceAsStream("/testdata/perf/JSON_stringify.cpuprofile");
        String source = CharStreams.toString(new InputStreamReader(input));
        JSONObject jsonData = new JSONObject(source);
        Map<String, ?> profileData = (Map<String, ?>) toCollection(jsonData);
        JSONObject metrics = new CPUProfilerAnalyzer(profileData).analyze();

        assertEquals(3078, metrics.getLong("elapsedMillis"));
        assertEquals(3043, metrics.getLong("numSamples"));
        assertEquals(3074, metrics.getLong("timeIdleMillis"));
        assertEquals(1, metrics.getLong("timeProgramMillis"));
        assertEquals(3076, metrics.getLong("timeRootMillis"));

        assertEquals(2, metrics.getLong("numIslands"));
        assertEquals(1, metrics.getLong("maxDepth"));
    }

    public void testMaxDepthCollector() {
        // 1 6 2 5 3 4 ==> 5
        MaxDepthCollector collector = new MaxDepthCollector(3);
        collector.add(1);
        collector.add(6);
        collector.add(2);
        collector.add(5);
        collector.add(3);
        collector.add(4);
        assertEquals(5, collector.getAverage());

        // 6 7 6 7 6 6 ==> 7
        collector = new MaxDepthCollector(3);
        collector.add(6);
        collector.add(7);
        collector.add(6);
        collector.add(7);
        collector.add(6);
        collector.add(6);
        assertEquals(7, collector.getAverage());
    }

    //

    /**
     * Recursivelly converts a JSONObject/JSONArray into a java Collection
     */
    @SuppressWarnings("unchecked")
    private static Object toCollection(Object obj) throws JSONException {
        if (obj instanceof JSONArray) {
            JSONArray array = (JSONArray) obj;
            List<Object> list = Lists.newArrayList();
            for (int i = 0; i < array.length(); i++) {
                list.add(toCollection(array.get(i)));
            }
            return list;
        }
        if (obj instanceof JSONObject) {
            JSONObject object = (JSONObject) obj;
            Map<String, Object> map = Maps.newHashMap();
            Iterator<String> keys = object.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                map.put(key, toCollection(object.get(key)));
            }
            return map;
        }
        return obj;
    }
}
