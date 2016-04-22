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
package org.auraframework.integration.test.components.ui.inputPercent;

import org.auraframework.integration.test.components.ui.inputSmartNumber.BaseInputSmartNumber;
import org.auraframework.test.util.WebDriverUtil.BrowserType;

public class InputPercentUITest extends BaseInputSmartNumber {

    private final String INPUT_SEL = ".input";
    private final String OUTPUT_SEL = ".vvalue";
    
    public InputPercentUITest() {
        super("/uitest/inputPercent_Test.cmp");
    }

    /**
     * Test positive number with shortcut
     */
    public void testPositiveWithShortcut() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "123k", "1230", "123,000%");
    }

    /**
     * Test negative number with shortcut
     */
    public void testNegativeWithShortcut() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "-123k", "-1230", "-123,000%");
    }

    /**
     * Test default format decimal places not allowed
     */
    @ExcludeBrowsers({BrowserType.IPHONE, BrowserType.IPAD})
    public void testDefaultFormatDecimalPlacesNotSupported() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1.23", "0.01", "1%");
    }

    // This tests behaviour exhibited by HTML5 input type="number".
    // We are currently rendering ui:inputPercent using type="text" to get
    // around
    // browser implementation bugs. If these bugs are resolved, we should
    // switch back to using type="number" and re-enable this test.

    // public void testPercentSymbol() throws Exception{
    // String source = "<aura:component>" +
    // "<ui:inputPercent/>" +
    // "</aura:component>";
    // addSource("inputtextuipercentsymboltest", source, ComponentDef.class);
    // open("/string/inputtextuipercentsymboltest.cmp");
    //
    // WebDriver d = getDriver();
    // WebElement input = d.findElement(By.tagName("input"));
    // input.sendKeys("12.3%");
    // AuraUITestingUtil.pressTab(input);
    // input = d.findElement(By.tagName("input"));
    // assertEquals("Percent symbol was not trimed", "12.3",
    // input.getAttribute("value"));
    // }
}
