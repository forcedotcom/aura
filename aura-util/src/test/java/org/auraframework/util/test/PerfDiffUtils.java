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
package org.auraframework.util.test;

import java.io.IOException;

import org.junit.Assert;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.perf.metrics.PerfMetrics;

/**
 * Diff utils for perf gold files
 */
public final class PerfDiffUtils extends BaseDiffUtils<PerfMetrics> {

    public PerfDiffUtils(UnitTestCase test, String goldName) throws Exception {
        super(test, goldName);
    }

    @Override
    protected String getResultsFolder() {
        return super.getResultsFolder() + "perf/";
    }

    @Override
    public void assertDiff(PerfMetrics actual, StringBuilder message) throws Exception {
        if (message == null) {
            message = new StringBuilder();
        }
        PerfMetrics expected = readGoldFile();

        String differentMessage = test.getPerfMetricsComparator().compare(expected, actual);
        if (differentMessage != null) {
            message.append(differentMessage);
            Assert.fail(message.toString());
        }
    }

    @Override
    public void writeGoldFile(PerfMetrics testResults) throws IOException {
        writeGoldFileContent(PerfGoldFilesUtil.toGoldFileText(testResults, getTest().storeDetailsInGoldFile()));
    }

    @Override
    public PerfMetrics readGoldFile() throws IOException {
        return PerfGoldFilesUtil.fromGoldFileText(readGoldFileContent());
    }
}
