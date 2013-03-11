/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.net.URL;

import javax.xml.parsers.ParserConfigurationException;

import junit.framework.Assert;

import org.auraframework.util.AuraUtil;
import org.auraframework.util.adapter.SourceControlAdapter;
import org.xml.sax.SAXException;

public class TextDiffUtils extends BaseDiffUtils<String> {

    public static class NewGoldFileException extends RuntimeException {
        private static final long serialVersionUID = -5288394880186418728L;

        private NewGoldFileException(URL url) {
            super(String.format("Differences were found. Review new gold file before committing: %s", url));
        }
    }

    public TextDiffUtils(Class<?> testClass, String goldName) throws Exception {
        super(testClass, goldName);
    }

    @Override
    public void assertDiff(String results, StringBuilder sb) throws SAXException, IOException,
            ParserConfigurationException {
        if (sb == null) {
            sb = new StringBuilder();
        }
        String gold = "";
        try {
            gold = readGoldFile();
        } catch (FileNotFoundException e) {
            sb.append(String.format("Gold file not found: %s\n", getUrl().toString()));
        }
        final boolean result = gold.equals(results);
        if (!result) {
            sb.append("\ndiff:\n");
            appendDiffs(results, sb);
            Assert.fail(sb.toString());
        }
    }

    @Override
    public void writeGoldFile(String results) {
        URL url = getDestUrl();
        SourceControlAdapter sca = AuraUtil.getSourceControlAdapter();
        if (!sca.canCheckout() || !url.getProtocol().equals("file")) {
            throw new RuntimeException("Unable to write to gold file: " + url.toString());
        }
        try {
            File f = new File(url.getFile());
            boolean existed = f.exists();
            if (existed && !f.canWrite()) {
                sca.checkout(f);
            }
            if (!f.getParentFile().exists()) {
                f.getParentFile().mkdirs();
            }
            OutputStreamWriter fw = new OutputStreamWriter(new FileOutputStream(f), "UTF-8");
            fw.write(results);
            fw.close();

            if (!existed) {
                sca.add(f);
            }
        } catch (Throwable t) {
            throw new RuntimeException("Failed to write gold file: " + url.toString(), t);
        }
        throw new NewGoldFileException(url);
    }

    @Override
    public String readGoldFile() throws IOException {
        int READ_BUFFER = 4096;

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
}
