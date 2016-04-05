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

import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.InvalidElementStateException;

public class InputSmartNumberUITest extends BaseInputSmartNumber {

    private final String INPUT_SEL = ".input";
    private final String OUTPUT_SEL = ".vvalue";
    
    public InputSmartNumberUITest() {
        super("/uitest/inputSmartNumber_Test.cmp");
    }

    /**
     * Test shortcut K/k as in thousand
     */
    public void testShortcutK() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1K", "1000", "1,000");
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1k", "1000", "1,000");
    }

    /**
     * Test shortcut M/m as in million
     */
    public void testShortcutM() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1M", "1000000", "1,000,000");
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1m", "1000000", "1,000,000");
    }

    /**
     * Test shortcut B/b as in billion
     */
    public void testShortcutB() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1B", "1000000000", "1,000,000,000");
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1b", "1000000000", "1,000,000,000");
    }

    /**
     * Test shortcut T/t as in trillion
     */
    public void testShortcutT() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1T", "1000000000000", "1,000,000,000,000");
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1t", "1000000000000", "1,000,000,000,000");
    }

    /**
     * Test decimal number
     */
    public void testDecimal() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1.23", "1.23", "1.23");
    }

    /**
     * Test invalid character. Invalid character should be ignored and cannot be entered.
     */
    public void testInvalidAlphabet() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "12j3", "123", "123");
    }

    /**
     * Test random thousand marker within value should get formatted properly
     */
    public void testThousandMarkBeforeDecimalMark() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1,2,3,4.56", "1234.56", "1,234.56");
    }

    /**
     * Test thoudsand marker should not be inserted after decimal marker.
     */
    public void testThousandMarkAfterDecimalMark() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1.2,3", "1.23", "1.23");
    }

    /**
     * Test shortcut should still work after decimal marker.
     */
    public void testShortcutAfterDecimalMark() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "0.1m", "100000", "100,000");
    }

    /**
     * Test shortcut should still work after a space is appended.
     */
    public void testSpaceAfterShortcut() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1k ", "1000", "1,000");
    }

    /***
     * Test for W-2973052.
     * TODO: enable this when the bug is resolved
     */
    public void testMinAttribute() throws Exception {
        open(this.URL + "?min=10");
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "9", "9", "9");
    }

    /**
     * Test well-formatted value should also work
     */
    public void testWellFormattedInput() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1,234.56", "1234.56", "1,234.56");
    }

    /**
     * Test invalid inputs are not allowed
     */
    public void testInvalidInputs() throws Exception {
        open(this.URL);
        inputAndVerifyElmValueWithoutFormat(INPUT_SEL, "acde!@#$%^&*()%/", "");
    }

    /**
     * Test invalid inputs in between numbers are not allowed
     */
    public void testInvalidInputsBetweenNumbers() throws Exception {
        open(this.URL);
        inputAndVerifyElmValueWithoutFormat(INPUT_SEL, "12acde!@#$%^&*()%/345", "12345");
    }

    /**
     * Test disabled input element should not be modifiable.
     */
    public void testDisabledInput() throws Exception {
        open(this.URL + "?disabled=true");
        WebElement inputEl = findDomElement(By.cssSelector(INPUT_SEL));

        try {
            inputEl.sendKeys("123");
            fail("Input should be disabled and not editable");
        } catch(InvalidElementStateException e) {
            waitForInputBoxTextPresent(inputEl, "");
        }
    }

    /**
     * Test format trigger by tabbing out of input box.
     * Other tests click body to blur
     */
    @ExcludeBrowsers({BrowserType.IPHONE, BrowserType.IPAD})
    public void testTabToBlurToFormatValue() throws Exception {
        open(this.URL);
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));
        // input value
        inputElm.clear();
        inputElm.sendKeys("1.2m");
        // tab to blur
        getAuraUITestingUtil().pressTab(inputElm);
        // check input box value is formatted
        waitForInputBoxTextPresent(inputElm, "1,200,000");
    }
}
