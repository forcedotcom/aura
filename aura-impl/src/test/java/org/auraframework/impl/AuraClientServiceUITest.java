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
package org.auraframework.impl;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;

public class AuraClientServiceUITest extends WebDriverTestCase {

    public AuraClientServiceUITest(String name) {
        super(name);
    }

    /**
     * Verify that a refresh during a location change does not display an alert.
     * The component under test uses DelayedController.java to ensure that the
     * refresh occurs while the location change is still taking place.
     * 
     * Excluded on ipad/iphone due to known WebDriver issue:
     * http://code.google.com/p/selenium/issues/detail?id=4348
     */
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    public void testRefreshDuringLocationChange() throws Exception {
        open("/clientServiceTest/refreshDuringLocationChange.app");

        WebDriver d = getDriver();
        d.findElement(By.cssSelector(".uiOutputURL")).click();
        d.navigate().refresh();

        assertFalse("Alert should not be shown on refresh", isAlertPresent());
    }

    private boolean isAlertPresent() {
        try {
            getDriver().switchTo().alert();
            return true;
        } catch (NoAlertPresentException e) {
            return false;
        }
    }
}
