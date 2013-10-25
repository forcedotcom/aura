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
package org.auraframework.perfTest;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Maps;

/**
 * Base class for testing Jiffy performance marks.
 * 
 * Note that Jiffy is only loaded in PTEST (and Cadence) modes.
 */
public class PerfMetricsTestCase extends WebDriverTestCase {
    public PerfMetricsTestCase(String name) {
        super(name);
    }

    protected void clearStats() {
        auraUITestingUtil.getEval("Jiffy.removeStats()");
    }

    protected Map<String, String> getJiffyStats(ArrayList<String> transactionsToGather) {
        return getJiffyStats(null, transactionsToGather);
    }

    protected Map<String, String> getJiffyStats(String stage, ArrayList<String> transactionsToGather) {
        Map<String, String> stats = Maps.newHashMap();
        String json = auraUITestingUtil.getEval("return JSON.stringify(Jiffy.toJson())").toString();
        getName();
        json = json.substring(1, json.length() - 1);
        json = json.replace("\\\"", "\"");
        StringReader in = new StringReader(json);
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
        @SuppressWarnings("unchecked")
        ArrayList<HashMap<?, ?>> measures = (ArrayList<HashMap<?, ?>>) message.get("measures");
        for (HashMap<?, ?> marks : measures) {
            if (!transactionsToGather.isEmpty()) {
                if (!transactionsToGather.contains(marks.get("measure"))) {
                    continue;
                }
            }
            String measureName = marks.get("measure").toString() + (stage != null ? ("_" + stage) : "");
            stats.put(measureName, marks.get("et").toString());
        }
        return stats;
    }
}