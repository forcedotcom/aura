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
package org.auraframework.integration.test.components.ui.inputSmartNumber;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class InputNumberUITest extends BaseInputSmartNumber {

    private final String LOCALIZATION_TEST_URL = "/uitest/inputLocalizedNumber_Test.cmp";
    private By OUTPUT_LOCATOR = By.cssSelector(".uiOutputText");

    public InputNumberUITest() {
        super("/uitest/inputSmartNumber_Test.app?testInputCmp=inputNumber");
    }

    @Test
    public void testInputNumber() throws Exception {
        open(LOCALIZATION_TEST_URL);

        WebElement input = findDomElement(By.cssSelector(".input"));
        WebElement submit = findDomElement(By.cssSelector(".uiButton"));

        // integer
        input.clear();
        input.sendKeys("987654321");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "987654321", true);

        // negative integer
        input.clear();
        input.sendKeys("-123");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "-123", true);
    }

    // FIXME: bug W-1296985 - Aura numbers only handle numbers as large as JavaScript
    public void _testInputNumberDefaultValue() throws Exception {
        open(LOCALIZATION_TEST_URL);

        WebElement input = findDomElement(By.cssSelector(".input"));
        assertEquals("Default number from model is incorrect",
                "123456789123456789", input.getAttribute("value"));
    }

    // TODO: WebDriver doesn't support setting http headers for language. Need
    // to use proxy or preconfigured browser to spoof Locales other than US.
    @Test
    public void testLocalizedInputNumber() throws Exception {
        open(LOCALIZATION_TEST_URL);

        WebElement input = findDomElement(By.cssSelector(".input"));
        WebElement submit = findDomElement(By.cssSelector(".uiButton"));

        // integer
        input.clear();
        input.sendKeys("123456789");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "123456789", true);

        // decimal
        input.clear();
        input.sendKeys("123456.789");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "123456.789", true);

        // negative integer
        input.clear();
        input.sendKeys("-123456");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "-123456", true);

        // negative decimal
        input.clear();
        input.sendKeys("-123.456");
        submit.click();
        getAuraUITestingUtil().waitForElementText(OUTPUT_LOCATOR, "-123.456", true);
    }
}
