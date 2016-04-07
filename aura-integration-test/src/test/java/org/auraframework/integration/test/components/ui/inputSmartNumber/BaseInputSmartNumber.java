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

import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class BaseInputSmartNumber extends WebDriverTestCase {

    protected final String URL;

    public BaseInputSmartNumber(String urlPath) {
        super(urlPath);
        this.URL = urlPath;
    }

    /****************************
     * Helper Functions
     ****************************/
    /**
     * Wait for input box text to be present
     */
    protected void waitForInputBoxTextPresent(WebElement inputBox, String expectedValue) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return expectedValue.equals(inputBox.getAttribute("value"));
            }
        });
    }

    /**
     * Test flow to check input box value without triggering format
     * @param inputSel - input box selector
     * @param input - input to input box
     * @param expectedElemVal - what's displayed in the input box
     */
    protected void inputAndVerifyElmValueWithoutFormat(String inputSel, String input, String expectedElemVal) {
        WebElement inputElm = findDomElement(By.cssSelector(inputSel));
        inputElm.clear();
        inputElm.sendKeys(input);
        waitForInputBoxTextPresent(inputElm, expectedElemVal);
    }

    /**
     * Test flow to check input box value and v.value after triggering format
     * @param inputSel - input box selector
     * @param outputSel - output text selector for the element that reflects v.value
     * @param input - input to input box
     * @param expectedCmpVal - component's v.value
     * @param expectedElemVal - what's displayed in the input box
     */
    protected void inputAndVerifyValuesAfterFormatted(String inputSel, String outputSel, String input,
                                                      String expectedCmpVal, String expectedElemVal) {
        WebElement inputElm = findDomElement(By.cssSelector(inputSel));
        WebElement outputElm = findDomElement(By.cssSelector(outputSel));

        // enter input
        inputElm.clear();
        inputElm.sendKeys(input);

        // click outside to blur
        WebElement body = findDomElement(By.tagName("body"));
        body.click();

        // check v.value
        waitForElementTextPresent(outputElm, expectedCmpVal);

        // check how the input box value is formatted
        if (expectedElemVal != null) {
            waitForInputBoxTextPresent(inputElm, expectedElemVal);
        }
    }

    /**
     * Test flow to check v.value after triggering format
     * @param inputSel - input box selector
     * @param outputSel - output text selector for the element that reflects v.value
     * @param input - input to input box
     * @param expectedCmpVal - component's v.value
     */
    protected void inputAndVerifyValuesAfterFormatted(String inputSel, String outputSel,
                                                      String input, String expectedCmpVal) {
        inputAndVerifyValuesAfterFormatted(inputSel, outputSel, input, expectedCmpVal, null);
    }
}
