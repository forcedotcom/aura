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
package org.auraframework.impl.util;

import com.google.common.collect.Lists;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Collection;
import java.util.List;
import java.util.StringTokenizer;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

@UnAdaptableTest
@RunWith(Parameterized.class)
public class BrowserAgentTest extends UnitTestCase {

    @Parameters(name = "testBrowserAgent_{0}")
    public static Collection<Object> generateTestParameters() throws IOException {
        List<Object> parameters = Lists.newLinkedList();

        InputStreamReader fixtureStream = new InputStreamReader(getFixture("results/BrowserAgentTest/BrowserAgentTest.csv"));
        BufferedReader reader = new BufferedReader(fixtureStream);

        String line;
        boolean firstLine = true;

        while ((line = reader.readLine()) != null) {
            if (firstLine) {
                // Ignore first line as it contains the CSV header and not actual browser information
                firstLine = false;
                continue;
            }
            if (ignore(line)) {
                continue;
            }

            BrowserTestInfo expectedBrowserInfo = readExpectedBrowserInfo(line);
            parameters.add(new Object[]{expectedBrowserInfo});
        }
        return parameters;
    }

    private final BrowserTestInfo expected;

    public BrowserAgentTest(BrowserTestInfo expectedBrowserInfo) {
        super();
        expected = expectedBrowserInfo;
    }

    @Test
    public void test() throws Exception {
        BrowserInfo computed = new BrowserInfo(expected.userAgent);

        assertThat("Is a Tablet", computed.isTablet(), is(expected.tablet));
        assertThat("Is a Phone", computed.isPhone(), is(expected.phone));
        assertThat("Is an iPad", computed.isIPad(), is(expected.iPad));
        assertThat("Is an iPhone", computed.isIPhone(), is(expected.iPhone));
        assertThat("Is iOS", computed.isIOS(), is(expected.iOS));
        assertThat("Is Android", computed.isAndroid(), is(expected.android));
        assertThat("Is Windows Phone", computed.isWindowsPhone(), is(expected.windowsPhone));
        assertThat("Is Firefox", computed.isFirefox(), is(expected.firefox));
        assertThat("Is WebKit", computed.isWebkit(), is(expected.webkit));
        assertThat("Is IE6", computed.isIE6(), is(expected.ie6));
        assertThat("Is IE7", computed.isIE7(), is(expected.ie7));
        assertThat("Is IE8", computed.isIE8(), is(expected.ie8));
        assertThat("Is IE9", computed.isIE9(), is(expected.ie9));
        assertThat("Is IE10", computed.isIE10(), is(expected.ie10));
        assertThat("Is IE11", computed.isIE11(), is(expected.ie11));
        assertThat("Form factor", computed.getFormFactor(), is(expected.formFactor));
    }

    private static BrowserTestInfo readExpectedBrowserInfo(String line) {
        StringTokenizer tokenizer = new StringTokenizer(line, "|", false);
        BrowserTestInfo info = new BrowserTestInfo();

        info.client = tokenizer.nextToken();
        info.formFactor = tokenizer.nextToken();
        info.tablet = Boolean.valueOf(tokenizer.nextToken());
        info.phone = Boolean.valueOf(tokenizer.nextToken());
        info.iPad = Boolean.valueOf(tokenizer.nextToken());
        info.iPhone = Boolean.valueOf(tokenizer.nextToken());
        info.iOS = Boolean.valueOf(tokenizer.nextToken());
        info.android = Boolean.valueOf(tokenizer.nextToken());
        info.windowsPhone = Boolean.valueOf(tokenizer.nextToken());
        info.firefox = Boolean.valueOf(tokenizer.nextToken());
        info.webkit = Boolean.valueOf(tokenizer.nextToken());
        info.ie6 = Boolean.valueOf(tokenizer.nextToken());
        info.ie7 = Boolean.valueOf(tokenizer.nextToken());
        info.ie8 = Boolean.valueOf(tokenizer.nextToken());
        info.ie9 = Boolean.valueOf(tokenizer.nextToken());
        info.ie10 = Boolean.valueOf(tokenizer.nextToken());
        info.ie11 = Boolean.valueOf(tokenizer.nextToken());
        info.userAgent = tokenizer.nextToken("*");

        return info;
    }

    private static InputStream getFixture(String fixtureName) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        return classLoader.getResourceAsStream(fixtureName);
    }

    private static boolean ignore(String line) {
        return line.trim().startsWith("#");
    }

    private static class BrowserTestInfo {

        String client;
        String userAgent;
        String formFactor;

        boolean tablet;
        boolean phone;
        boolean iPad;
        boolean iPhone;
        boolean iOS;
        boolean android;
        boolean windowsPhone;
        boolean firefox;
        boolean webkit;
        boolean ie6;
        boolean ie7;
        boolean ie8;
        boolean ie9;
        boolean ie10;
        boolean ie11;

        @Override
        public String toString() {
            return client;
        }
    }
}