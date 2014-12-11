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
package org.auraframework.components.ui.inputTextArea;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

/**
 * UI tests for inputTextArea Component
 */
// Exluding the test as sendKeys and click not working with ios
@UnAdaptableTest
public class InputTextAreaUITest extends WebDriverTestCase {

    public static final String TEST_CMP = "/uitest/inputTextArea_UpdateOnTest.cmp";
    public static final String TEST_CMP2 = "/uitest/inputTextArea_UpdateOnValueChange.cmp";

    public InputTextAreaUITest(String name) {
        super(name);
    }

    /**
     * Test Case for W-1731003 ui:inputTextArea throws error when value is changed
     */
    public void testInputTextAreaWithLabel() throws Exception {
        open(TEST_CMP);
        WebElement div = findDomElement(By.id("textAreaWithLabel"));
        WebElement input = div.findElement(By.tagName("textarea"));
        WebElement outputDiv = findDomElement(By.id("output"));

        String inputAuraId = "textAreaWithLabel";
        String valueExpression = auraUITestingUtil.getValueFromCmpRootExpression(inputAuraId, "v.value");
        String defExpectedValue = (String) auraUITestingUtil.getEval(valueExpression);
        assertEquals("Default value for inputTextArea should be the same", inputAuraId, defExpectedValue);

        // AndroidDriver likes to type things in all caps so modify input to accommodate.

        String inputText = "UPDATEDTEXT";
        input.clear();
        input.click();
        input.sendKeys(inputText);
        outputDiv.click(); // to simulate tab behavior for touch browsers
        String actualText = (String) auraUITestingUtil.getEval(valueExpression);
        assertEquals("Value of Input text Area shoud be updated", inputText, actualText);
    }

    /*
     * Ensuring \r\n for line breaks in textarea to match aloha form-encode Test Case for W-2326901
     */
    public void testEncodedTextAreaBehavior() throws Exception {
        open(TEST_CMP);
        WebElement div = findDomElement(By.id("textAreaWithLabel"));
        WebElement input = div.findElement(By.tagName("textarea"));
        WebElement outputDiv = findDomElement(By.id("output"));

        String inputAuraId = "textAreaWithLabel";
        String valueExpression = auraUITestingUtil.getValueFromCmpRootExpression(inputAuraId, "v.value");

        String inputText = String.format("%s%n%s%n%s%n%s", "LINE1", "LINE2", "LINE3", "LINE4");
        input.clear();
        input.click();
        input.sendKeys(inputText);
        outputDiv.click(); // to simulate tab behavior for touch browsers
        String actualText = (String) auraUITestingUtil.getEval(valueExpression);
        assertEquals("Total number of bytes with \r\n does not match", inputText.getBytes().length + 3,
                actualText.getBytes().length);
        assertEquals("Value of Input text Area shoud be updated after removing carriage return", inputText,
                actualText.replaceAll("(\\r)", ""));
    }
    
    /*
     * Test case for Stopping cursor from jumping to end of input field
     * Bug: W-2356548
     * Issue is on firefox and IE
     */
    public void testTextAreaWithMultipleLinesOfText() throws Exception {
        open(TEST_CMP2);
        WebElement div = findDomElement(By.id("textAreaWithLabel"));
        WebElement input = div.findElement(By.tagName("textarea"));
        WebElement outputDiv = findDomElement(By.id("output"));

        String inputAuraId = "textAreaWithLabel";
        String valueExpression = auraUITestingUtil.getValueFromCmpRootExpression(inputAuraId, "v.value");

        String inputText = String.format("%s%n%s%n%s%n%s", "LINE1", "LINE2", "LINE3", "L4");
        input.clear();
        input.click();
        input.sendKeys(inputText);
        input.sendKeys(Keys.ARROW_LEFT, Keys.ARROW_LEFT);
        String inputNewString = "L5";
        input.sendKeys(inputNewString);
        inputText = String.format("%s%n%s%n%s%n%s", "LINE1", "LINE2", "LINE3", "L5L4");
        outputDiv.click(); // to simulate tab behavior for touch browsers
        String actualText = (String) auraUITestingUtil.getEval(valueExpression);
        assertEquals("Total number of bytes with \r\n does not match", inputText.getBytes().length + 3,
                actualText.getBytes().length);
        assertEquals("Value of Input text Area shoud be updated after removing carriage return", inputText,
                actualText.replaceAll("(\\r)", ""));
    }

    // W-1551077: Issue with Webdriver API ignores maxlength HTML5 attribute (iOS/Safari)
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.SAFARI })
    public void testMaxLengthInTextArea() throws Exception {
        open("/uitest/inputTextArea_MaxLength.cmp?maxlength=5");
        WebElement input = findDomElement(By.className("textArea"));
        input.click();
        input.sendKeys("1234567890");
        assertEquals("Text not truncated to 5 chars correctly", "12345", input.getAttribute("value"));
    }

    public void testNoMaxLengthInTextArea() throws Exception {
        open("/uitest/inputTextArea_MaxLength.cmp");
        WebElement input = findDomElement(By.className("textArea"));
        input.click();
        String inputText = "1234567890";
        input.sendKeys(inputText);
        assertEquals("Expected untruncated text", inputText, input.getAttribute("value"));
    }
}
