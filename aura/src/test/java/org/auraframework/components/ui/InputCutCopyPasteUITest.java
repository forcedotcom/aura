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
package org.auraframework.components.ui;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;

/**
* UI Tests for inputSearch Component
*/
public class InputCutCopyPasteUITest extends WebDriverTestCase {

    public InputCutCopyPasteUITest(String name) {
        super(name);

    }

    @ExcludeBrowsers({BrowserType.ANDROID_PHONE,BrowserType.ANDROID_TABLET,BrowserType.IPAD,BrowserType.IPHONE})
    public void testCutCopyPasteEvents() throws Exception{
        WebDriver d = getDriver();
        open("/uitest/inputCutCopyPasteEventTest.cmp");
        WebElement input = d.findElement(By.xpath("//input"));
        WebElement output = d.findElement(By.xpath("//span[@class='uiOutputText']"));
        input.click();
        input.sendKeys(Keys.CONTROL,"a");
        
        //Fire Copy Event
        String copyValueExpression = auraUITestingUtil.getValueFromRootExpr("v.copyEventFired");
        copyValueExpression = auraUITestingUtil.prepareReturnStatement(copyValueExpression);
        assertFalse("Copy event should not have been triggered yet", auraUITestingUtil.getBooleanEval(copyValueExpression));
        input.sendKeys(Keys.CONTROL,"c");
        assertTrue("Copy event should have been triggered", auraUITestingUtil.getBooleanEval(copyValueExpression));
        waitForElementTextPresent(output, "Copy Event Fired");
        
        //Fire Cut Event
        String cutValueExpression = auraUITestingUtil.getValueFromRootExpr("v.cutEventFired");
        cutValueExpression = auraUITestingUtil.prepareReturnStatement(cutValueExpression);
        assertFalse("Cut event should not have been triggered yet", auraUITestingUtil.getBooleanEval(cutValueExpression));
        input.sendKeys(Keys.CONTROL,"a");
        input.sendKeys(Keys.CONTROL,"x");
        assertTrue("Cut event should have been triggered", auraUITestingUtil.getBooleanEval(cutValueExpression));
        waitForElementTextPresent(output, "Cut Event Fired");
        
        //Fire Paste Event
        String pasteValueExpression = auraUITestingUtil.getValueFromRootExpr("v.pasteEventFired");
        pasteValueExpression = auraUITestingUtil.prepareReturnStatement(pasteValueExpression);
        assertFalse("Paste event should not have been triggered yet", auraUITestingUtil.getBooleanEval(pasteValueExpression));
        input.click();
        input.sendKeys(Keys.CONTROL,"v");
        assertTrue("Paste event should have been triggered", auraUITestingUtil.getBooleanEval(pasteValueExpression));
        waitForElementTextPresent(output, "Paste Event Fired");
    }
}
