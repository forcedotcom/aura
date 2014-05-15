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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.Set;

import org.auraframework.test.perf.metrics.PerfMetric;
import org.auraframework.test.perf.metrics.PerfMetrics;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public final class PerfGoldFilesUtil {

    /**
     * @param addDetails if true adds the metric details to the gold file
     * @return text describing the metrics in a format convenient for the gold file
     */
    public static String toGoldFileText(PerfMetrics metrics, boolean addDetails) {
        // write in a format that is both parseable as json and easy to see diffs
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        Set<String> names = metrics.getAllMetricNames();
        for (String name : names) {
            if (sb.length() > 1) {
                sb.append("\n,");
            }
            PerfMetric metric = metrics.getMetric(name);
            JSONArray details = metric.getDetails();
            if (details != null) {
                metric.remove(PerfMetric.DETAILS);
            }
            sb.append(metrics.getMetric(name));
            if (details != null) {
                if (addDetails) {
                    sb.append("\n,");
                    // puts details in a separate line
                    JSONObject json = new JSONObject();
                    try {
                        json.put(name + ".details", details);
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    sb.append(json);
                }
                metric.setDetails(details);
            }
        }
        sb.append(']');
        return sb.toString();
    }

    /**
     * @return PerfMetrics from gold file contents
     */
    public static PerfMetrics fromGoldFileText(String text) throws IOException {
        PerfMetrics metrics = new PerfMetrics();
        BufferedReader reader = new BufferedReader(new StringReader(text));
        String line;
        PerfMetric lastMetric = null;
        while ((line = reader.readLine()) != null) {
            try {
                line = line.substring(1);
                if (line.endsWith("]")) {
                    line = line.substring(0, line.length() - 1);
                }
                if (lastMetric != null && line.startsWith("{\"" + lastMetric.getName() + ".details\":")) {
                    JSONObject details = new JSONObject(line);
                    lastMetric.setDetails(details.getJSONArray(lastMetric.getName() + ".details"));
                } else {
                    lastMetric = new PerfMetric(line);
                    metrics.setMetric(lastMetric);
                }
            } catch (JSONException e) {
                throw new RuntimeException(line, e);
            }
        }
        return metrics;
    }
}
