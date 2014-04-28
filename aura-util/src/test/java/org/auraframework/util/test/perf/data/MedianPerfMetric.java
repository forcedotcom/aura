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

import java.util.List;

import org.json.JSONException;

/**
 * Represents the median PerfMetric for a set of perf runs
 */
public final class MedianPerfMetric extends PerfMetric {

    private final List<PerfMetric> runsMetric;

    /**
     * @param median the median PerfMetric calculated
     * @param runsMetric the list of PerfMetrics the median was calculated from
     */
    public MedianPerfMetric(PerfMetric median, List<PerfMetric> runsMetric) throws JSONException {
        super(median.toString());
        this.runsMetric = runsMetric;
    }

    /**
     * @return runs PerfMetrics this median metric came from
     */
    public List<PerfMetric> getRunsMetric() {
        return runsMetric;
    }

    /**
     * @return "name 5 [3 5 5 6 7]"
     */
    @Override
    public String toShortText() {
        return super.toShortText() + ' ' + toSequenceString();
    }

    public String toSequenceString() {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (PerfMetric metric : runsMetric) {
            if (sb.length() > 1) {
                sb.append(' ');
            }
            sb.append(metric.getValue());
        }
        sb.append(']');
        return sb.toString();
    }
}
