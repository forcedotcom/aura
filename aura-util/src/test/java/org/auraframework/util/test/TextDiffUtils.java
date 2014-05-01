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

import java.io.FileNotFoundException;
import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;

import junit.framework.Assert;

import org.auraframework.test.UnitTestCase;
import org.xml.sax.SAXException;

public class TextDiffUtils extends BaseDiffUtils<String> {

    public TextDiffUtils(UnitTestCase test, String goldName) throws Exception {
        super(test, goldName);
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
        writeGoldFileContent(results);
    }

    @Override
    public String readGoldFile() throws IOException {
        return readGoldFileContent();
    }
}
