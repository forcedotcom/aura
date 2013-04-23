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
package org.auraframework.util.perfomance;

import java.io.File;
import java.util.List;

import junit.framework.Test;

import org.auraframework.util.perfomance.PTestGoogleChart.ChartPoint;

/**
 * This test util is based on JTroup's AbstractCadenceTest framework.
 * 
 * 
 * @since 0.0.178
 */
public class PerformanceTestUtil {
    Test test;
    PTestResultsHandler resultsHandler;

    public PerformanceTestUtil(Test test, File resultsDir) {
        this.test = test;
        this.resultsHandler = getResultsHandler(resultsDir);
    }

    /**
     * Get the handler which decides what to do with the test results. Currently
     * we save the results to a local file.
     */
    protected PTestResultsHandler getResultsHandler(File resultsDir) {
        return new LocalFilePTestResultsHandler(this.test, resultsDir);
    }

    /**
     * Write the results to a file.
     */
    public void handleResults(String testName, List<ChartPoint> dataPoints) throws Exception {
        resultsHandler.handleResults(testName, dataPoints);
    }
}
