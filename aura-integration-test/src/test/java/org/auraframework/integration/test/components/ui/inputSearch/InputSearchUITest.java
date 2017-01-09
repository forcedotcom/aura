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
package org.auraframework.integration.test.components.ui.inputSearch;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * UI Tests for inputSearch Component
 */
public class InputSearchUITest extends WebDriverTestCase {

    // W-1551076: Webdriver not firing search event in Safari, IPAD and IPHONE
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE,
            BrowserType.SAFARI })
    @Test
    public void testSearch() throws Exception {
        String valueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.searched");
        String cmpValueExpression = getAuraUITestingUtil().prepareReturnStatement(getAuraUITestingUtil()
                .getValueFromRootExpr("v.value"));
        valueExpression = getAuraUITestingUtil().prepareReturnStatement(valueExpression);
        open("/uitest/inputSearch_HandlingSearchEvent.cmp");

        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt("search");
        assertFalse("Search event should not have been triggered yet",
                getAuraUITestingUtil().getBooleanEval(valueExpression));
        getAuraUITestingUtil().pressEnter(input);
        waitForCondition(valueExpression);
        // test case for W-1545841
        assertEquals("Component value should be updated", "search", getAuraUITestingUtil().getEval(cmpValueExpression));
    }

    // W-1551076: Webdriver not firing search event in Safari
    // W-1410946: "x" not displayed on IE7/IE8
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE,
            BrowserType.SAFARI, BrowserType.IE7, BrowserType.IE8 })
    @Test
    public void testClearSelection() throws Exception {
        String valueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.searched");
        valueExpression = getAuraUITestingUtil().prepareReturnStatement(valueExpression);
        open("/uitest/inputSearch_HandlingSearchEvent.cmp?showClear=true");

        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt("search");
        assertEquals("The initial value in input Search is wrong", "search", input.getAttribute("value"));

        WebDriver d = getDriver();
        WebElement clearButton = d.findElement(By.cssSelector("button[class*='clear']"));
        assertTrue("input search clear button doesn't show up", clearButton.isDisplayed());

        getAuraUITestingUtil().pressEnter(clearButton);
        assertEquals("The input search term should be cleared", "", input.getAttribute("value"));
        assertTrue("input Search Search event should have been triggered",
                getAuraUITestingUtil().getBooleanEval(valueExpression));

    }
}
