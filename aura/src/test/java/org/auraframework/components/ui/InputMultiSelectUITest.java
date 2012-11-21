/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class InputMultiSelectUITest extends WebDriverTestCase {
    private final String URL = "/uitest/inputMultiSelectTest.cmp";
    private Select inputSelect;
    private WebElement selectElement;
    private WebElement submit;
    private WebElement output;
    private WebDriver d;

    public InputMultiSelectUITest(String name) {
        super(name);
    }

    private void openTestPage() throws Exception {
        d = getDriver();
        open(URL);

        selectElement = d.findElement(By.xpath("//select[1]"));
        inputSelect = new Select(selectElement);
        submit = d.findElement(By.xpath("//button"));
        output = d.findElement(By.xpath("//span[@class='uiOutputText']"));
    }

    private void selectOption(String optionLabel) {
        selectDeselectOption(optionLabel, true);
    }

    private void deselectOption(String optionLabel) {
        selectDeselectOption(optionLabel, false);
    }

    private void selectDeselectOption(String optionLabel, boolean isSelect) {
    	if (isSelect) {
            inputSelect.selectByVisibleText(optionLabel);
            verifyOptionSelected(optionLabel);
        } else {
            inputSelect.deselectByVisibleText(optionLabel);
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
        List<WebElement> options = inputSelect.getOptions();
        Boolean found = false;
        for (WebElement option : options) {
            if (optionLabel.equals(option.getText())) {
                found = true;
                if (isSelected) {
                    assertTrue("Option '" + optionLabel + "' should be selected", option.isSelected());
                } else {
                    assertFalse("Option '" + optionLabel + "' should be deselected", option.isSelected());
                }
            }
        }
        if (!found && isSelected) {
            fail("Option '" + optionLabel + "' is not found in list");
        }
    }

    /**
     * Select one. Choose one option.
     * Deselect one. Deselect one option.
     */
    public void testInputSelectSingle() throws Exception {
        openTestPage();

        // select
        focusSelectElement();
        selectOption("Option1"); 
        verifyOptionDeselected("Option2");
        verifyOptionDeselected("Option3");

        submit.click();
        waitForElementTextPresent(output, "option1");
        verifyOptionSelected("Option1");
        verifyOptionDeselected("Option2");
        verifyOptionDeselected("Option3");

        // deselect
        focusSelectElement();
        deselectOption("Option1");
        selectOption("Option3");
        verifyOptionDeselected("Option2");

        submit.click();
        waitForElementTextPresent(output, "option3");
        verifyOptionSelected("Option3");
        verifyOptionDeselected("Option1");
        verifyOptionDeselected("Option2");
    }

    /**
     * Select multiple. Choose multiple options.
     * Deselect multiple. Deselect multiple options.
     */
    public void testInputSelectDeselectMultiple() throws Exception {
        openTestPage();

        // select multiple
        focusSelectElement();
        selectOption("Option1");
        selectOption("Option2");
        verifyOptionDeselected("Option3");

        submit.click();
        waitForElementTextPresent(output, "option1;option2");
        verifyOptionSelected("Option1");
        verifyOptionSelected("Option2");
        verifyOptionDeselected("Option3");

        // deselect
        focusSelectElement();
        deselectOption("Option2");
        verifyOptionSelected("Option1");

        submit.click();
        waitForElementTextPresent(output, "option1");
        verifyOptionSelected("Option1");
        verifyOptionDeselected("Option2");
    }

    /**
     * Select all. Select all options.
     * Deselect all. Deselect all options.
     */
    public void testInputSelectDeselectAll() throws Exception {
        openTestPage();

        // select all
        focusSelectElement();
        selectOption("Option1");
        selectOption("Option2");
        selectOption("Option3");

        submit.click();
        waitForElementTextPresent(output, "option1;option2;option3");
        verifyOptionSelected("Option1");
        verifyOptionSelected("Option2");
        verifyOptionSelected("Option3");

        // deselect all
        inputSelect.deselectAll();
        verifyOptionDeselected("Option1");
        verifyOptionDeselected("Option2");
        verifyOptionDeselected("Option3");

        submit.click();
        waitForElementTextPresent(output, "");
        verifyOptionDeselected("Option1");
        verifyOptionDeselected("Option2");
        verifyOptionDeselected("Option3");
    }

    private void focusSelectElement() {
        // Only for IE10 we need to explicitly bring focus on to select input
    	// selectBy() does not do it. But clicking on select element corrupts
    	// selected/unselected options so we need to preserve the state
    	List<WebElement> selectedOptions = inputSelect.getAllSelectedOptions();
    	selectElement.click();
    	int checkNum = inputSelect.getAllSelectedOptions().size();
    	
    	if (checkNum != selectedOptions.size()) {
	    	inputSelect.deselectAll();
	    	for (int i=0; i<selectedOptions.size(); i++) {
	    		inputSelect.selectByVisibleText(selectedOptions.get(i).getText());
	    	}
    	}
    }
}
