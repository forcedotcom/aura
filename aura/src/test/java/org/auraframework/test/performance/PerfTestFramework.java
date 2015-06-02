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
package org.auraframework.test.performance;

import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.json.JSONArray;

/**
 * @author mvijayakumar
 * @param <T>
 *            Perf Test Framework that drives component level perf tests at pre checkin. 1. Discovers and configures
 *            perf tests to be run per component. 2. Generates a test runner URL to run these tests. 3. Collects metrics
 *            generated from this URL via a JSON payload. 4. Analyzes the metrics with expected values and publishes
 *            results.
 */
public interface PerfTestFramework {

    public List<DefDescriptor<ComponentDef>> discoverTests();

    public void runTests(List<DefDescriptor<ComponentDef>> defs) throws Exception;

    public JSONArray publishResults(JSONArray metrics);

}
