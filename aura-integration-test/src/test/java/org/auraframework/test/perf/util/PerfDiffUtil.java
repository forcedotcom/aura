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

import org.auraframework.util.adapter.SourceControlAdapter;
import org.auraframework.util.test.perf.metrics.PerfMetrics;
import org.junit.Assert;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.net.URL;

public class PerfDiffUtil implements DiffUtil<PerfMetrics>{

    private final PerfExecutorTestCase test;
    private URL srcUrl;
    private URL destUrl;

    public PerfDiffUtil(PerfExecutorTestCase test, String goldName) throws Exception {
        this.test = test;
        String explicitResultsFolder = test.getExplicitGoldResultsFolder();
        if (explicitResultsFolder != null) {
            srcUrl = destUrl = new URL("file://" + explicitResultsFolder + '/' + goldName);
            return;
        }
    }

    @Override
    public void assertDiff(PerfMetrics actual) throws Exception {
        StringBuilder message = new StringBuilder();
        PerfMetrics expected = readGoldFile();

        String differentMessage = test.getPerfMetricsComparator().compare(expected, actual);
        if (differentMessage != null) {
            message.append(differentMessage);
            Assert.fail(message.toString());
        }
    }

    @Override
    public PerfMetrics readGoldFile() throws IOException {
        return PerfFilesUtil.fromGoldFileText(readGoldFileContent());
    }

    @Override
    public void writeGoldFile(PerfMetrics testResults) throws IOException {
        writeGoldFileContent(PerfFilesUtil.toGoldFileText(testResults, getTest().storeDetailsInGoldFile()));
    }

    protected final void writeGoldFileContent(String content) {
        URL url = getDestUrl();
        SourceControlAdapter sca = this.test.getSourceControlAdapter();
        try {
            File f = new File(url.getFile());
            boolean existed = f.exists();
            if (existed && !f.canWrite() && sca.canCheckout()) {
                sca.checkout(f);
            }
            if (!f.getParentFile().exists()) {
                f.getParentFile().mkdirs();
            }
            OutputStreamWriter fw = new OutputStreamWriter(new FileOutputStream(f), "UTF-8");
            fw.write(content);
            fw.close();

            if (!existed && sca.canCheckout()) {
                sca.add(f);
            }
        } catch (Throwable t) {
            throw new RuntimeException("Failed to write gold file: " + url.toString(), t);
        }
    }

    protected final String readGoldFileContent() throws IOException {
        final int READ_BUFFER = 4096;

        Reader br = new BufferedReader(new InputStreamReader(getUrl().openStream(), "UTF-8"));
        char[] buff = new char[READ_BUFFER];
        int read = -1;
        StringBuffer sb = new StringBuffer(READ_BUFFER);
        while ((read = br.read(buff, 0, READ_BUFFER)) != -1) {
            sb.append(buff, 0, read);
        }
        br.close();
        return sb.toString();
    }

    protected String getResultsFolder() {
        return "/results/perf/";
    }

    @Override
    public URL getUrl() {
        return srcUrl;
    }

    public URL getDestUrl() {
        return destUrl;
    }

    @Override
    public PerfExecutorTestCase getTest() {
        return test;
    }

}
