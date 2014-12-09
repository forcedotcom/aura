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

    private final String DYNAMIC_SELECT_URL = "/uitest/inputSelect_DynamicOptions.cmp";
    private final String NESTED_SELECT_URL = "/uitest/inputSelect_OptionsInBodySetValue.cmp";

    private final String selectLocator = "select[class*='%s']";
    private final String optionLocator = "option[text()='%1$s'] | optgroup/option[text()='%1$s']";

    private String selectId;

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
        selectId = "dynamicSelect";
        open(DYNAMIC_SELECT_URL);
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
        selectId = "dynamicSelect";
        open(DYNAMIC_SELECT_URL);
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
        selectId = "dynamicSelect";
        open(DYNAMIC_SELECT_URL);
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

    public void testSelectOptionInIteration() throws Exception {
        selectId = "InputSelectIteration";
        open(NESTED_SELECT_URL);
        focusSelectElement();

        selectOption("Montreal");
        verifyOptionSelected("Montreal");
        verifyOptionDeselected("Quebec");

        selectOption("Toronto");
        verifyOptionSelected("Toronto");
        verifyOptionDeselected("Montreal");

        selectOption("Quebec");
        verifyOptionSelected("Quebec");
        verifyOptionDeselected("Toronto");
    }

    public void testSelectOptionInCondition() throws Exception {
        selectId = "InputSelectRenderIf";
        open(NESTED_SELECT_URL + "?condition=true");
        focusSelectElement();

        selectOption("Toronto");
        verifyOptionSelected("Toronto");
        verifyOptionDeselected("Quebec");

        boolean montrealNotInList = false;
        try {
            getOption("Montreal");
        } catch (Exception e) {
            montrealNotInList = true;
        }
        assertTrue("Montreal should not be in the list", montrealNotInList);

        selectOption("Quebec");
        verifyOptionSelected("Quebec");
        verifyOptionDeselected("Toronto");
    }

    public void testSelectOptionInGroup() throws Exception {
        selectId = "InputSelectOptionGroup";
        open(NESTED_SELECT_URL);
        focusSelectElement();

        selectOption("Ottawa");
        verifyOptionSelected("Ottawa");
        verifyOptionDeselected("Quebec");

        selectOption("Quebec");
        verifyOptionSelected("Quebec");
        verifyOptionDeselected("Ottawa");
    }

    private Select getInputSelect() {
        WebElement element = findDomElement(By.cssSelector(String.format(selectLocator, selectId)));
        return new Select(element);
    }

    private int selectOptionsSize() {
        return getInputSelect().getOptions().size();
    }

    private void selectOption(String optionLabel) {
        getInputSelect().selectByVisibleText(optionLabel);
    }

    private WebElement getOption(String optionLabel) {
        WebElement selectElement = findDomElement(By.cssSelector(String.format(selectLocator, selectId)));
        return selectElement.findElement(By.xpath(String.format(optionLocator, optionLabel)));
    }

    private void verifyOptionSelected(String optionLabel) {
        verifyOptionSelectDeselect(optionLabel, true);
    }

    private void verifyOptionDeselected(String optionLabel) {
        verifyOptionSelectDeselect(optionLabel, false);
    }

    private void verifyOptionSelectDeselect(String optionLabel, boolean isSelected) {
        WebElement option = getOption(optionLabel);
        String cmpValue = getComponentValue(selectId);
        if (isSelected) {
            assertTrue("Option '" + optionLabel + "' should be selected", option.isSelected());
            assertEquals("input select should have the correct v.value", optionLabel, cmpValue);
        } else {
            assertFalse("Option '" + optionLabel + "' should be deselected", option.isSelected());
            assertFalse("v.value should be different from the selected option", optionLabel.equals(cmpValue));
        }
    }

    private String getComponentValue(String componentId) {
        String valueExpression = auraUITestingUtil.getValueFromCmpRootExpression(componentId, "v.value");
        return (String) auraUITestingUtil.getEval(valueExpression);
    }

    /**
     * Only for IE10 we need to explicitly bring focus on to select input. selectBy() does not do it. But clicking on
     * select element corrupts selected/unselected options so we need to preserve the state
     */
    private void focusSelectElement() {
        if (BrowserType.IE10.equals(getBrowserType())) {
            List<WebElement> selectedOptions = getInputSelect().getAllSelectedOptions();
            findDomElement(By.cssSelector(String.format(selectLocator, selectId))).click();

            getInputSelect().deselectAll();
            for (int i = 0; i < selectedOptions.size(); i++) {
                getInputSelect().selectByVisibleText(selectedOptions.get(i).getText());
            }
        }
    }

}
