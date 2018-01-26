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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Immutable Java bean to serialize/deserialize json config
// This must exactly match the config param names
public class PerfConfig {
    private final List<String> browsers; // required
    private final int numberOfRuns; // optional, default = 1
    private final List<Map<String, Integer>> variability; // required
    private final Map<String, String> options; // optional
    private final List<Map<String, Map<String, Object>>> customOptions; // optional

    private PerfConfig(PerfConfigBuilder builder) {
        this.browsers = builder.browsers;
        this.numberOfRuns = builder.numberOfRuns;
        this.variability = builder.variability;
        this.options = builder.options;
        this.customOptions = builder.customOptions;
    }

    public List<String> getBrowsers() {
        return browsers;
    }

    public int getNumberOfRuns() {
        return numberOfRuns;
    }

    public List<Map<String, Integer>> getVariability() {
        return variability;
    }

    public Map<String, String> getOptions() {
        return options != null ? options : new HashMap<>();
    }

    public List<Map<String, Map<String, Object>>> getCustomOptions() {
        return customOptions;
    }

    public Integer getVariability(String metric) {
        List<Map<String, Integer>> list = getVariability();
        for (Map<String, Integer> map : list) {
            if (map.containsKey(metric)) return map.get(metric);
        }
        return null;
    }

    public static class PerfConfigBuilder {
        private List<String> browsers;
        private int numberOfRuns;
        private List<Map<String, Integer>> variability;
        private Map<String, String> options;
        private List<Map<String, Map<String, Object>>> customOptions;

        public PerfConfigBuilder browsers(List<String> browsers) {
            this.browsers = browsers;
            return this;
        }

        public PerfConfigBuilder numberOfRuns(int numberOfRuns) {
            this.numberOfRuns = numberOfRuns;
            return this;
        }

        public PerfConfigBuilder variability(List<Map<String, Integer>> variability) {
            this.variability = variability;
            return this;
        }

        public PerfConfigBuilder options(Map<String, String> options) {
            this.options = options;
            return this;
        }

        public PerfConfigBuilder customOptions(List<Map<String, Map<String, Object>>> customOptions) {
            this.customOptions = customOptions;
            return this;
        }

        public PerfConfig build() {
            return new PerfConfig(this);
        }

    }
}
