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
import org.openqa.selenium.WebElement;

/**
 * UI tests for inputTextArea Component
 */
public class InputTextAreaUITest extends WebDriverTestCase {

    public static final String TEST_CMP = "/uitest/inputTextAreaUpdateOnTest.cmp";

    public InputTextAreaUITest(String name) {
        super(name);
    }

    /**
     * Test Case for W-1731003
     * ui:inputTextArea throws error when value is changed
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
}
