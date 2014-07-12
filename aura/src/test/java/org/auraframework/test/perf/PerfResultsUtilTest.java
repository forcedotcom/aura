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
package org.auraframework.test.perf;

import java.io.File;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.perf.PerfResultsUtil.ResultsJSON;
import org.json.JSONObject;

public final class PerfResultsUtilTest extends UnitTestCase {

    public void testResultsJSON() throws Exception {
        ResultsJSON resultsJSON = new ResultsJSON(false);
        JSONObject json = resultsJSON.getJSON();

        // has build info
        JSONObject build = json.getJSONObject("build");
        assertNotNull(build);

        // results files
        resultsJSON.addResultsFile(new File(PerfResultsUtil.RESULTS_DIR + "/goldfiles/ui/label.json"));
        resultsJSON.addResultsFile(new File(PerfResultsUtil.RESULTS_DIR + "/goldfiles/ui/console.json"));
        resultsJSON.addResultsFile(new File(PerfResultsUtil.RESULTS_DIR + "/goldfiles/ui/button.json"));
        resultsJSON.addResultsFile(new File(PerfResultsUtil.RESULTS_DIR + "/timelines/iteration.json"));
        JSONObject results = json.getJSONObject("results");
        assertEquals(
                "{\"timelines\":{\"list\":[\"iteration.json\"]},\"goldfiles\":{\"ui\":{\"list\":[\"button.json\",\"console.json\",\"label.json\"]}}}",
                results.toString());

        // removing results files
        resultsJSON.removeResultsFile(new File(PerfResultsUtil.RESULTS_DIR + "/goldfiles/ui/console.json"));
        assertEquals(
                "{\"timelines\":{\"list\":[\"iteration.json\"]},\"goldfiles\":{\"ui\":{\"list\":[\"button.json\",\"label.json\"]}}}",
                results.toString());
    }
}
