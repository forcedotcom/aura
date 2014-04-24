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

import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Maps;

/**
 * Represents a set of metrics values (i.e. all metrics collected in a single test case run)
 */
public final class PerfMetrics {

    private final Map<String, PerfMetric> metrics = Maps.newHashMap();

    /**
     * @return the PerfMetric for the given metric name
     */
    public PerfMetric getMetric(String name) {
        return metrics.get(name);
    }

    /**
     * @return sorted names for all the metrics contained in this object
     */
    public Set<String> getAllMetricNames() {
        return ImmutableSortedSet.copyOf(metrics.keySet());
    }

    public int size() {
        return metrics.size();
    }

    public void setMetric(PerfMetric metric) {
        metrics.put(metric.getName(), metric);
    }

    public void logInfo(Logger logger) {
        for (String name : getAllMetricNames()) {
            PerfMetric metric = getMetric(name);
            logger.info("  " + metric.toShortText());
            String details = metric.toDetailsText(name);
            if (details != null) {
                logger.info(details);
            }
        }
    }
}
