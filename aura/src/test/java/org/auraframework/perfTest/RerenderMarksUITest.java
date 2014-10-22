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
import org.auraframework.test.WebDriverTestCase.CheckAccessibility;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * Automation to verify UIPerf marks for rerender cycle.
 */
@CheckAccessibility(false)
public class RerenderMarksUITest extends PerfMetricsTestCase {
    public RerenderMarksUITest(String name) {
        super(name);
    }

    /**
     * Simple scenario where a top level attribute change initiates a rerender cycle. Subsequent rerender of the same
     * component should also be logged in UIPerf.
     * 
     * @throws Exception
     */
    public void testRerenderMarksHaveComponentName() throws Exception {
        Map<String, String> logStats = Maps.newHashMap();
        open("/performanceTest/ui_button.cmp", Mode.CADENCE);
        clearUIPerfStats();
        WebElement button = getDriver().findElement(By.cssSelector("button[class~='uiButton']"));
        button.click();
        waitForElementTextPresent(getDriver().findElement(By.cssSelector("div[class~='changeCount']")), "1");

        logStats.putAll(getUIPerfStats(Lists.newArrayList("Rerendering-2: ['markup://performanceTest:ui_button']")));
        assertTrue("Did not find UIPerf marks with component information for Rerender cycle.",
                logStats.isEmpty());
        logStats.clear();

        button.click();
        waitForElementTextPresent(getDriver().findElement(By.cssSelector("div[class~='changeCount']")), "2");
        logStats.putAll(getUIPerfStats(Lists.newArrayList("Rerendering-3: ['markup://performanceTest:ui_button']")));
        assertTrue("Did not mark multiple Rerender of same component.",
                logStats.isEmpty());
    }

    /**
     * Scenario where 1. Top level attribute change causes a rerender 2. Attribute value change causes multiple
     * component rerender 3. Server action where no component rerender is caused.
     * 
     * @throws Exception
     */
    public void testRerenderMarksHaveAllComponentNames() throws Exception {
        Map<String, String> logStats = Maps.newHashMap();
        open("/performanceTest/perfApp.app", Mode.CADENCE);
        clearUIPerfStats();

        // Mark an attribute as dirty at the root component
        WebElement button = getDriver().findElement(By.cssSelector("button[class~='bkgColor']"));
        button.click();
        waitForElementAppear(By.cssSelector("tr[class~='grey']"));

        logStats.putAll(getUIPerfStats(Lists.newArrayList("Rerendering-3: ['markup://performanceTest:perfApp']")));
        assertTrue("Rerender of root component not marked in UIPerf.",
                logStats.isEmpty());
        logStats.clear();

        // Make a value change to cause multiple component rerender, the UIPerf mark should have qualified names of the
        // components
        WebElement innerButton = getDriver().findElement(By.cssSelector("button[class~='changeIteratonIndex']"));
        innerButton.click();
        waitForElementDisappear("Iteration never rerendered after end index changed.",
                By.xpath("//div[@class='performanceTestIterateBasicData']/table/tr[11]"));
        // Changing iteration end index only rerenders iterations with number of items greater than new end index
        logStats.putAll(getUIPerfStats(Lists
                .newArrayList("Rerendering-4: ['markup://performanceTest:perfApp','markup://aura:iteration','markup://aura:iteration']")));
        assertTrue("Multiple component Rerender should be marked with all componentNames.",
                logStats.isEmpty());
        logStats.clear();

        // An action that does not result in a component rerender
        innerButton = getDriver().findElement(By.cssSelector("button[class~='simpleServerAction']"));
        innerButton.click();
        waitForCondition("return $A.getRoot()._simpleServerActionComplete");
        logStats.putAll(getUIPerfStats(Lists.newArrayList("Rerendering-5: []")));
        assertTrue(
                "Server action that causes no components to rerender should be logged but with no component names.",
                logStats.isEmpty());
//        // Server action should cause no rerender and hence rerender mark should be 0
//        assertEquals("", logStats.get("Rerendering-5: []"));
        logStats.clear();
    }
}
