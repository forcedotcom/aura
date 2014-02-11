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
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Maps;

/**
 * Base class for testing UIPerf performance marks.
 * 
 * Note that UIPerf is only loaded in PTEST (and Cadence) modes.
 */
public class PerfMetricsTestCase extends WebDriverTestCase {
	public PerfMetricsTestCase(String name) {
		super(name);
	}

	protected void clearStats() {
		auraUITestingUtil.getEval("$A.Perf.removeStats()");
	}

	protected Map<String, String> getUIPerfStats(
			ArrayList<String> transactionsToGather) {
		return getUIPerfStats(null, transactionsToGather);
	}

    protected Map<String, String> getUIPerfStats(String stage, 
    		ArrayList<String> transactionsToGather) {
        Map<String, String> stats = Maps.newHashMap();
        String json = auraUITestingUtil.getEval(
        		"return $A.util.json.encode($A.Perf.toJson())").toString();
        getName();
        json = json.substring(1, json.length() - 1);
        json = json.replace("\\\"", "\"");
        StringReader in = new StringReader(json);
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
        @SuppressWarnings("unchecked")
        ArrayList<HashMap<?, ?>> measures = (ArrayList<HashMap<?, ?>>) message
        		.get("measures");
        for (HashMap<?, ?> marks : measures) {
            if (!transactionsToGather.isEmpty()) {
            	if (!transactionsToGather.contains(marks.get("measure")) &&
            			// IE10 list of measures was not in the same order
            			// as expected in transactionsToGather so need to 
            			// make sure measure and transactionsToGather are
            			// similar
            			!isSimilar(
            					(String) marks.get("measure"), 
            					transactionsToGather.get(0))) {
                    continue;
                }
            }
            String measureName = marks.get("measure").toString() 
            		+ (stage != null ? ("_" + stage) : "");
            stats.put(measureName, marks.get("et").toString());
        }
        return stats;
    }
    
    private boolean isSimilar(String str1, String str2) {
    	char[] str1Arr = str1.toCharArray();
    	char[] str2Arr = str1.toCharArray();
    	Arrays.sort(str1Arr);
    	Arrays.sort(str2Arr);
    	str1 = new String(str1Arr);
    	str2 = new String(str2Arr);
    	return str1.equals(str2);
    }
}