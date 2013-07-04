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

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class InputMultiSelectUITest extends WebDriverTestCase {
    private final String[] URL = new String[] { "/uitest/inputMultiSelectTest.cmp",
            "/uitest/inputMultiSelectNestedOptionsTest.cmp" };
    private By outputLocator = By.xpath("//span[@class='uiOutputText']");
    private By selectLocator = By.xpath("//select[1]");
    private By submitLocator = By.xpath("//button");
    private String optionLocatorString = "//select[1]/option[text()='%s']";

    public InputMultiSelectUITest(String name) {
        super(name);
    }

    private void openTestPage(int i) throws Exception {
        open(URL[i]);
    }

    private Select getInputSelect() {
        return new Select(findDomElement(selectLocator));
    }

    private void selectOption(String optionLabel) {
        selectDeselectOption(optionLabel, true);
    }

    private void deselectOption(String optionLabel) {
        selectDeselectOption(optionLabel, false);
    }

    private void selectDeselectOption(String optionLabel, boolean isSelect) {
        if (isSelect) {
            getInputSelect().selectByVisibleText(optionLabel);
            verifyOptionSelected(optionLabel);
        } else {
            getInputSelect().deselectByVisibleText(optionLabel);
            verifyOptionDeselected(optionLabel);
        }
    }

    private void verifyOptionSelected(String optionLabel) {
        verifyOptionSelectDeselct(optionLabel, true);
    }

    private void verifyOptionDeselected(String optionLabel) {
        verifyOptionSelectDeselct(optionLabel, false);
    }

    private void verifyOptionSelectDeselct(String optionLabel, boolean isSelected) {
        WebElement option = findDomElement(By.xpath(String.format(optionLocatorString, optionLabel)));
        if (isSelected) {
            assertTrue("Option '" + optionLabel + "' should be selected", option.isSelected());
        } else {
            assertFalse("Option '" + optionLabel + "' should be deselected", option.isSelected());
        }
    }

    /**
     * Select one. Choose one option. Deselect one. Deselect one option.
     */
    public void testInputSelectSingle() throws Exception {
        for (int i = 0; i < URL.length; i++) {
            openTestPage(i);

            // select
            focusSelectElement();
            selectOption("Option1");
            verifyOptionDeselected("Option2");
            verifyOptionDeselected("Option3");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "option1", true);
            verifyOptionSelected("Option1");
            verifyOptionDeselected("Option2");
            verifyOptionDeselected("Option3");

            // deselect
            focusSelectElement();
            deselectOption("Option1");
            selectOption("Option3");
            verifyOptionDeselected("Option2");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "option3", true);
            verifyOptionSelected("Option3");
            verifyOptionDeselected("Option1");
            verifyOptionDeselected("Option2");
        }
    }

    /**
     * Select multiple. Choose multiple options. Deselect multiple. Deselect multiple options.
     */
    public void testInputSelectDeselectMultiple() throws Exception {
        for (int i = 0; i < URL.length; i++) {
            openTestPage(i);

            // select multiple
            focusSelectElement();
            selectOption("Option1");
            selectOption("Option2");
            verifyOptionDeselected("Option3");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "option1;option2", true);
            verifyOptionSelected("Option1");
            verifyOptionSelected("Option2");
            verifyOptionDeselected("Option3");

            // deselect
            if (BrowserType.IE10.equals(getBrowserType())) {
                focusSelectElement();
            }
            deselectOption("Option2");
            verifyOptionSelected("Option1");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "option1", true);
            verifyOptionSelected("Option1");
            verifyOptionDeselected("Option2");
        }
    }

    /**
     * Select all. Select all options. Deselect all. Deselect all options.
     */
    public void testInputSelectDeselectAll() throws Exception {
        for (int i = 0; i < URL.length; i++) {
            openTestPage(i);

            // select all
            focusSelectElement();
            selectOption("Option1");
            selectOption("Option2");
            selectOption("Option3");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "option1;option2;option3", true);
            verifyOptionSelected("Option1");
            verifyOptionSelected("Option2");
            verifyOptionSelected("Option3");

            // deselect all
            deselectOption("Option1");
            deselectOption("Option2");
            deselectOption("Option3");
            verifyOptionDeselected("Option1");
            verifyOptionDeselected("Option2");
            verifyOptionDeselected("Option3");

            findDomElement(submitLocator).click();
            auraUITestingUtil.waitForElementText(outputLocator, "", true);
            verifyOptionDeselected("Option1");
            verifyOptionDeselected("Option2");
            verifyOptionDeselected("Option3");
        }
    }

    /**
     * Only for IE10 we need to explicitly bring focus on to select input. selectBy() does not do it. But clicking on
     * select element corrupts selected/unselected options so we need to preserve the state
     */
    private void focusSelectElement() {
        if (BrowserType.IE10.equals(getBrowserType())) {
            List<WebElement> selectedOptions = getInputSelect().getAllSelectedOptions();
            findDomElement(selectLocator).click();

            getInputSelect().deselectAll();
            for (int i = 0; i < selectedOptions.size(); i++) {
                getInputSelect().selectByVisibleText(selectedOptions.get(i).getText());
            }
        }
    }
}
