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

import org.json.JSONException;

/**
 * Represents the median PerfMetric for a set of perf runs
 */
public final class MedianPerfMetric extends PerfMetric {

    private final List<PerfMetric> runsMetric;
    private final int medianRunNumber;

    /**
     * @param median the median PerfMetric calculated
     * @param runsMetric the list of PerfMetrics the median was calculated from
     * @param medianRunNumber the run number used for the median, -1 if unknown or N/A
     */
    public MedianPerfMetric(PerfMetric median, List<PerfMetric> runsMetric, int medianRunNumber) throws JSONException {
        super(median.toString());
        this.runsMetric = runsMetric;
        this.medianRunNumber = medianRunNumber;
    }

    /**
     * @return the average metric for the individual runs
     */
    public int getAverage() {
        int total = 0;
        for (PerfMetric metric : runsMetric) {
            total += metric.getIntValue();
        }
        return Math.round(((float) total) / runsMetric.size());
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
        int runNumber = 1;
        for (PerfMetric metric : runsMetric) {
            if (sb.length() > 1) {
                sb.append(' ');
            }
            if (runNumber++ == medianRunNumber) {
                sb.append('*');
            }
            sb.append(metric.getValue());
        }
        if (runsMetric.size() > 1) {
            sb.append(" |*:median-run average:" + getAverage());
        }
        sb.append(']');
        return sb.toString();
    }
}
