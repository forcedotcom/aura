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
package org.auraframework.components.ui;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class InputNumberUITest extends WebDriverTestCase {

    public InputNumberUITest(String name) {
        super(name);
    }

    public void testInputNumber() throws Exception {
        WebDriver d = getDriver();
        open("/uitest/inputNumber_Test.cmp");

        WebElement input = d.findElement(By.xpath("//input"));
        WebElement submit = d.findElement(By.xpath("//button"));
        WebElement output = d.findElement(By.xpath("//span[@class='uiOutputText']"));

        // integer
        input.clear();
        input.sendKeys("987654321");
        submit.click();
        waitForElementTextPresent(output, "987654321");

        // negative integer
        input.clear();
        input.sendKeys("-123");
        submit.click();
        waitForElementTextPresent(output, "-123");
    }

    // FIXME: bug W-1296985
    public void _testInputNumberDefaultValue() throws Exception {
        WebDriver d = getDriver();
        open("/uitest/inputNumber_Test.cmp");

        WebElement input = d.findElement(By.xpath("//input"));
        assertEquals("Default number from model is incorrect", "123456789123456789", input.getAttribute("value"));
    }

    // TODO: WebDriver doesn't support setting http headers for language. Need
    // to use proxy or preconfigured browser to spoof Locales other than US.
    public void testLocalizedInputNumber() throws Exception {
        WebDriver d = getDriver();
        open("/uitest/inputLocalizedNumber_Test.cmp");

        WebElement input = d.findElement(By.xpath("//input"));
        WebElement submit = d.findElement(By.xpath("//button"));
        WebElement output = d.findElement(By.xpath("//span[@class='uiOutputText']"));

        // integer
        input.clear();
        input.sendKeys("123456789");
        submit.click();
        waitForElementTextPresent(output, "123456789");

        // decimal
        input.clear();
        input.sendKeys("123456.789");
        submit.click();
        waitForElementTextPresent(output, "123456.789");

        // negative integer
        input.clear();
        input.sendKeys("-123456");
        submit.click();
        waitForElementTextPresent(output, "-123456");

        // negative decimal
        input.clear();
        input.sendKeys("-123.456");
        submit.click();
        waitForElementTextPresent(output, "-123.456");
    }

    public void testInputNumberWithError() throws Exception {
        WebDriver d = getDriver();
        open("/uitest/inputNumber_Test.cmp");

        WebElement input = d.findElement(By.xpath("//input"));
        WebElement submit = d.findElement(By.xpath("//button"));
        WebElement output = d.findElement(By.xpath("//span[@class='uiOutputText']"));

        // induce error
        input.clear();
        input.sendKeys("abcdef");
        submit.click();
        waitForElementTextPresent(output, "Got Error!");

        WebElement error = d.findElement(By.className("uiInputDefaultError"));
        assertEquals("Incorrect error message", "Invalid value for inVar: java://long", error.getText());

        // clear error
        input.clear();
        input.sendKeys("1234");
        submit.click();
        waitForElementTextPresent(output, "1234");
        error = d.findElement(By.className("uiInputDefaultError"));
        assertEquals("Error message should be gone", "", error.getText());
    }
}
