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

import java.util.Map;

import org.auraframework.system.AuraContext.Mode;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Tests to verify contents of Action XHR marks.
 * 
 */
public class ActionXHRMarksUITest extends PerfMetricsTestCase {

    public ActionXHRMarksUITest(String name) {
        super(name);
    }

    /**
     * Verify "<BG>" is included in XHR mark when background action is sent.
     */
    public void testBackgroundActionMark() throws Exception {
        Map<String, String> logStats = Maps.newHashMap();
        open("/test/jiffyActionMarksTest.cmp", Mode.CADENCE);
        WebElement button = getDriver().findElement(By.cssSelector(".backgroundButton"));
        button.click();
        waitForElementTextPresent(getDriver().findElement(By.cssSelector(".outputText")), "Background action complete");

        logStats.putAll(getJiffyStats(Lists.newArrayList("Received Response - XHR 2: ['echoTextBackground<BG>']")));
        assertTrue("Did not receive background Action XHR mark with Action name and '<BG>' tag.",
                logStats.containsKey("Received Response - XHR 2: ['echoTextBackground<BG>']"));
    }

    /**
     * Verify action name is appended to end of XHR mark.
     */
    public void testForegroundActionMark() throws Exception {
        Map<String, String> logStats = Maps.newHashMap();
        open("/test/jiffyActionMarksTest.cmp", Mode.CADENCE);
        WebElement button = getDriver().findElement(By.cssSelector(".foregroundButton"));
        button.click();
        waitForElementTextPresent(getDriver().findElement(By.cssSelector(".outputText")), "Foreground action complete");

        logStats.putAll(getJiffyStats(Lists.newArrayList("Received Response - XHR 2: ['echoText']")));
        assertTrue("Did not receive foreground Action XHR mark with Action name.",
                logStats.containsKey("Received Response - XHR 2: ['echoText']"));
    }

    /**
     * Multiple actions sent in same XHR. Verify all action names present.
     */
    public void testMultipleForegroundActionsMark() throws Exception {
        Map<String, String> logStats = Maps.newHashMap();
        open("/test/jiffyActionMarksTest.cmp", Mode.CADENCE);
        WebElement button = getDriver().findElement(By.cssSelector(".multiForegroundButton"));
        button.click();
        waitForElementTextPresent(getDriver().findElement(By.cssSelector(".outputText")), "Fore1Fore2Fore3");

        logStats.putAll(getJiffyStats(Lists
                .newArrayList("Received Response - XHR 2: ['echoText','echoText','echoText']")));
        assertTrue("Did not receive foreground Action XHR with multiple Action names appended.",
                logStats.containsKey("Received Response - XHR 2: ['echoText','echoText','echoText']"));
    }
}
