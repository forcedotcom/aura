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
package org.auraframework.java.controller;

import java.io.File;
import java.io.FileReader;
import java.util.logging.Logger;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.test.UnitTestCase;
import org.auraframework.test.perf.PerfResultsUtil;
import org.auraframework.test.testsetrunner.TestSetRunnerState;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.util.json.JsonReader;

@Controller
public class PerfController {
    private static final Logger logger = Logger.getLogger(PerfController.class.getName());

    /**
     * Get Performance metrics for a given test.
     * 
     * @param metricsType Eg. "goldfiles", "aurastats", "timelines"
     * @param testName Eg. "testChangeCount(org.auraframework.test.perf.custom.RenderIfComponentTest)"
     * @return
     * @throws Exception
     */
    @AuraEnabled
    public static Object getPerformanceMetrics(@Key("metricsType") String metricsType,
            @Key("testName") String testName) throws Exception {

        logger.info(String.format("Loading '%s' Performance metrics for test: %s", metricsType, testName));

        UnitTestCase test = (UnitTestCase) TestSetRunnerState.getInstance().getInventory().get(testName);
        String goldFileName = test.getGoldFileName();

        PerfResultsUtil.PerformanceMetrics type = PerfResultsUtil.PerformanceMetrics
                .getPerformanceMetricsFromType(metricsType);
        File file = type.getFile(goldFileName);

        if (file.exists()) {
            logger.info(String.format("Reading Performance metrics from file: %s", file.getAbsolutePath()));

            return new JsonReader().read(new FileReader(file));
        }
        throw new AuraHandledException(String.format("Performance metrics File: %s not found", file.getAbsolutePath()));
    }
}