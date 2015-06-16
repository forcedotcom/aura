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
package org.auraframework.test.perf.util;

import org.auraframework.util.test.perf.metrics.PerfMetricsComparator;
import org.json.JSONArray;

public class PerfMetricsUtil {

    private PerfMetricsComparator perfMetricsComparator;

    private void collectMetrics(JSONArray metrics) {
        perfMetricsComparator = getPerfMetricsComparator();
    }

    private void prepareResults() {
        // TODO collect results from client app and compare
    }

    public PerfMetricsComparator getPerfMetricsComparator() {
        return CUSTOM_COMPARATOR;
    }

    private static final PerfMetricsComparator CUSTOM_COMPARATOR = new PerfMetricsComparator() {
        @Override
        protected int getAllowedVariability(String metricName) {
            // TODO Get variability mappings per component
            return super.getAllowedVariability(metricName);
        }
    };
}
