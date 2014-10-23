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
package org.auraframework.components.ui.inputSelect;

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.PerfTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class InputSelectUITest extends WebDriverTestCase {

    private final String URL = "/uitest/inputSelect_DynamicOptions.cmp";
    private final By selectLocator = By.xpath("//select[1]");
    private final String optionLocatorString = "//select[1]/option[text()='%s']";

    public InputSelectUITest(String name) {
        super(name);
    }

    /**
     * Selecting any option should work
     * 
     * @throws Exception
     */
    @PerfTest
    public void testSelectingOption() throws Exception {

        open(URL);
        focusSelectElement();

        // There should be 4 options with Option2 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option2");

        // Select Option1
        selectOption("Option3");

        // There should be 4 options with Option3 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option3");
        verifyOptionDeselected("Option2");
    }

    /**
     * Selecting first option should work
     * 
     * @throws Exception
     */
    public void testSelectingFirstOption() throws Exception {

        open(URL);
        focusSelectElement();

        // There should be 4 options with Option2 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option2");

        // Select Option1
        selectOption("Option1");

        // There should be 4 options with Option1 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option1");
        verifyOptionDeselected("Option2");
    }

    /**
     * Selecting last option should work
     * 
     * @throws Exception
     */
    public void testSelectingLastOption() throws Exception {

        open(URL);
        focusSelectElement();

        // There should be 4 options with Option2 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option2");

        // Select Option1
        selectOption("Option4");

        // There should be 4 options with Option4 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected("Option4");
        verifyOptionDeselected("Option2");
    }

    private Select getInputSelect() {
        return new Select(findDomElement(selectLocator));
    }

    private int selectOptionsSize() {
        return getInputSelect().getOptions().size();
    }

    private void selectOption(String optionLabel) {
        getInputSelect().selectByVisibleText(optionLabel);
        verifyOptionSelected(optionLabel);
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
