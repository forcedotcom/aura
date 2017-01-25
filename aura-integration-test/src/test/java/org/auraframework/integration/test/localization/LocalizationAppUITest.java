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
package org.auraframework.integration.test.localization;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.CheckAccessibility;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

@CheckAccessibility(false)
public class LocalizationAppUITest extends WebDriverTestCase {

    public String URL = "/uitest/localization_Test.app";

    // Excluded on mobile browsers for lack of tab support
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // Checking functionality of the inputDate/outputDate components
    @Test
    public void testDateComponents() throws Exception {
        open(URL);

        // initial load
        WebElement elementInput = findDomElement(By.cssSelector(".uiInputDate .input"));
        WebElement elementoutput = findDomElement(By.cssSelector(".uiOutputDate"));
        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2004",
                elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2004", elementoutput.getText());

        // Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Sep 23, 2005");
        getAuraUITestingUtil().pressTab(elementInput);

        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2005",
                elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2005", elementoutput.getText());

        // Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Sep 23, 2006");
        // Hide the datepicker
        WebElement yearSelector = findDomElement(By.cssSelector(".visible select"));
        yearSelector.sendKeys(Keys.ESCAPE);

        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Date']"));
        elementButton.click();

        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2006",
                elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2006", elementoutput.getText());
    }

    // Excluded on mobile browsers for lack of tab support
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // Checking functionality of the inputDateTime/outputDateTime components
    @Test
    public void testDateTimeComponents() throws Exception {
        open(URL);

        // initial load
        WebElement elementInputDate = findDomElement(By.cssSelector(".uiInputDateTime .dateTime-inputDate input"));
        WebElement elementInputTime = findDomElement(By.cssSelector(".uiInputDateTime .dateTime-inputTime input"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputDateTime']"));
        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2004",
                elementInputDate.getAttribute("value"));
        assertEquals("InputDateTime component rendered with wrong value", "4:30 PM",
                elementInputTime.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2004 4:30:00 PM",
                elementoutput.getText());

        // Tab out
        elementInputDate.click();
        elementInputDate.clear();
        elementInputTime.clear();
        elementInputDate.sendKeys("Oct 23, 2005");
        getAuraUITestingUtil().pressTab(elementInputDate);
        elementInputTime.click();
        elementInputTime.clear();
        elementInputTime.sendKeys("9:30 AM");
        getAuraUITestingUtil().pressTab(elementInputTime);

        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2005",
                elementInputDate.getAttribute("value"));
        assertEquals("InputDateTime component rendered with wrong value", "9:30 AM",
                elementInputTime.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2005 9:30:00 AM",
                elementoutput.getText());

        // Submit click
        elementInputDate.click();
        elementInputDate.clear();
        elementInputTime.clear();
        elementInputDate.sendKeys("Oct 23, 2006");
        getAuraUITestingUtil().pressTab(elementInputDate);
        elementInputTime.click();
        elementInputTime.clear();
        elementInputTime.sendKeys("9:30 AM");
        getAuraUITestingUtil().pressTab(elementInputTime);
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='DateTime']"));
        elementButton.click();

        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2006",
                elementInputDate.getAttribute("value"));
        assertEquals("InputDateTime component rendered with wrong value", "9:30 AM",
                elementInputTime.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2006 9:30:00 AM",
                elementoutput.getText());
    }

    // Excluded on mobile browsers for lack of tab support
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // Checking functionality of the inputNumber/outputNumber components
    @Ignore
    @Test
    public void testNumberComponents() throws Exception {
        open(URL);

        // initial load
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputNumber']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputNumber']"));
        assertEquals("InputNumber component rendered with wrong value", "411", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "411", elementoutput.getText());

        // Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("511");
        getAuraUITestingUtil().pressTab(elementInput);

        assertEquals("InputNumber component rendered with wrong value", "511", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "511", elementoutput.getText());

        // Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("611");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Number']"));
        elementButton.click();

        assertEquals("InputNumber component rendered with wrong value", "611", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "611", elementoutput.getText());
    }

    // Excluded on mobile browsers for lack of tab support
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // Checking functionality of the inputPercent/outputPercent components
    @Test
    public void testPercentComponents() throws Exception {
        open(URL);

        // initial load
        By outputSelector=By.cssSelector("span[class~='uiOutputPercent']");
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputPercent']"));
        WebElement elementoutput = findDomElement(outputSelector);
        assertEquals("InputPercent component rendered with wrong value", "1,235%", elementInput.getAttribute("value"));
        assertEquals("outputPercent component rendered with wrong value", "1,235%", elementoutput.getText());

        // Tab out
        elementInput.click();
        elementInput.sendKeys(Keys.HOME, Keys.chord(Keys.SHIFT, Keys.END));
        elementInput.sendKeys("22.35");
        getAuraUITestingUtil().pressTab(elementInput);

        getAuraUITestingUtil().waitForElementText(outputSelector, "22%", true, "outputPercent component rendered with wrong value");
        assertEquals("InputPercent component rendered with wrong value", "22%", elementInput.getAttribute("value"));

        // Submit click
        elementInput.click();
        elementInput.sendKeys(Keys.HOME, Keys.chord(Keys.SHIFT, Keys.END));
        elementInput.sendKeys("1.2235");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Percent']"));
        elementButton.click();

        getAuraUITestingUtil().waitForElementText(outputSelector,"1%",true,"outputPercent component rendered with wrong value");
        assertEquals("InputPercent component rendered with wrong value", "1%", elementInput.getAttribute("value"));
    }

    // Excluded on mobile browsers for lack of tab support
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // Checking functionality of the inputCurrency/outputCurrency components
    @Test
    public void testCurrencyComponents() throws Exception {
        open(URL);

        // initial load
        By outputSelector=By.cssSelector("span[class~='uiOutputCurrency']");
        WebElement elementInput = findDomElement(By.cssSelector("span[id='MyCurrency'] > input[class~='uiInput']"));
        WebElement elementOutput = findDomElement(outputSelector);
        assertEquals("InputCurrency component rendered with wrong value", "$123,456.79",
                elementInput.getAttribute("value"));
        assertEquals("outputCurrency component rendered with wrong value", "$123,456.79", elementOutput.getText());

        // Tab out
        elementInput.click();
        elementInput.sendKeys(Keys.HOME, Keys.chord(Keys.SHIFT, Keys.END));
        elementInput.sendKeys("123456");
        getAuraUITestingUtil().pressTab(elementInput);

        getAuraUITestingUtil().waitForElementText(outputSelector, "$123,456.00", true, "OutputCurrency component rendered with wrong value");
        assertEquals("InputCurrency component rendered with wrong value", "$123,456.00", elementInput.getAttribute("value"));

        // Submit click
        elementInput.click();
        elementInput.sendKeys(Keys.HOME, Keys.chord(Keys.SHIFT, Keys.END));
        elementInput.sendKeys("123.45");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Currency']"));
        elementButton.click();

        getAuraUITestingUtil().waitForElementText(outputSelector, "$123.45", true, "OutputCurrency component rendered with wrong value");
        assertEquals("InputCurrency component rendered with wrong value", "$123.45", elementInput.getAttribute("value"));
    }
}
