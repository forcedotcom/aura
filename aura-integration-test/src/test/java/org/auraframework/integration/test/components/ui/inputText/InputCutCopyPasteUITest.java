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
package org.auraframework.integration.test.components.ui.inputText;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * UI Tests for inputSearch Component
 */
public class InputCutCopyPasteUITest extends WebDriverTestCase {

    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE,
            BrowserType.SAFARI })
    @Test
    public void testCutCopyPasteEvents() throws Exception {
        if (System.getProperty("os.name").startsWith("Mac")) {
            // Selenium's key event injection are simulated for OSX, and not actually received by
            // the real browser (see https://code.google.com/p/selenium/issues/detail?id=3101),
            // which means that there's no way to generate cut/copy/paste events under Selenium.
            // So, on Mac, skip this whole test. No, changing Keys.CONTROL to Keys.COMMAND below
            // doesn't do it, they aren't "real keypresses" to the browser at all.
            return;
        }

        WebDriver d = getDriver();
        open("/uitest/inputText_CutCopyPasteEventTest.cmp");
        WebElement input = d.findElement(By.xpath("//input"));
        By outputLocator = By.xpath("//span[@class='uiOutputText']");
        input.click();
        input.sendKeys(Keys.CONTROL, "a");

        // Fire Copy Event
        String copyValueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.copyEventFired");
        copyValueExpression = getAuraUITestingUtil().prepareReturnStatement(copyValueExpression);
        assertFalse("Copy event should not have been triggered yet",
                getAuraUITestingUtil().getBooleanEval(copyValueExpression));
        input.sendKeys(Keys.CONTROL, "c");
        assertTrue("Copy event should have been triggered", getAuraUITestingUtil().getBooleanEval(copyValueExpression));
        getAuraUITestingUtil().waitForElementText(By.xpath("//span[@class='uiOutputText']"), "Copy Event Fired", true);

        // Fire Cut Event
        String cutValueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.cutEventFired");
        cutValueExpression = getAuraUITestingUtil().prepareReturnStatement(cutValueExpression);
        assertFalse("Cut event should not have been triggered yet",
                getAuraUITestingUtil().getBooleanEval(cutValueExpression));
        input.sendKeys(Keys.CONTROL, "a");
        input.sendKeys(Keys.CONTROL, "x");
        assertTrue("Cut event should have been triggered", getAuraUITestingUtil().getBooleanEval(cutValueExpression));
        getAuraUITestingUtil().waitForElementText(By.xpath("//span[@class='uiOutputText']"), "Cut Event Fired", true);

        // Fire Paste Event
        String pasteValueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.pasteEventFired");
        pasteValueExpression = getAuraUITestingUtil().prepareReturnStatement(pasteValueExpression);
        assertFalse("Paste event should not have been triggered yet",
                getAuraUITestingUtil().getBooleanEval(pasteValueExpression));
        input.click();
        input.sendKeys(Keys.CONTROL, "v");
        assertTrue("Paste event should have been triggered", getAuraUITestingUtil().getBooleanEval(pasteValueExpression));
        getAuraUITestingUtil().waitForElementText(outputLocator, "Paste Event Fired", true);
    }
}
