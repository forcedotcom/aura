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

import java.util.Arrays;
import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Select;

public class InputSelectUITest extends WebDriverTestCase {
    private WebDriver d;

    public InputSelectUITest(String name) {
        super(name);
    }

    @ExcludeBrowsers({ BrowserType.FIREFOX })
    public void testSingleSelect() throws Exception {
        d = getDriver();
        String selectLocator = "select[class~='single']";

        open("/uitest/inputSelect_OptionsInBody.cmp");
        WebElement inputSelectElement = d.findElement(By.cssSelector(selectLocator));
        final Select inputSelect = new Select(inputSelectElement);

        // Assert element visible
        assertTrue("InputSelect not visible", inputSelectElement.isDisplayed());

        // Initial selected option
        assertEquals("Initial select option incorrect", "Lion", inputSelect.getFirstSelectedOption().getText());

        // Option label
        assertEquals("The select option's label is wrong", "Ant", inputSelect.getOptions().get(5).getText());

        // Option Disabled
        assertFalse("label 'Cockroach' should be disabled", inputSelect.getOptions().get(6).isEnabled());

        // Change selection
        inputSelectElement.click();
        inputSelect.selectByValue("Bear");
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                return !inputSelect.getOptions().get(1).isSelected();
            }
        });
        assertTrue("Bear should be selected", inputSelect.getOptions().get(2).isSelected());
        assertEquals("InputSelect Component is not returning the selected value correctly", "Bear", inputSelect
                .getOptions().get(2).getText());

        inputSelectElement.click();
        inputSelect.selectByValue("Dragonfly");
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                return !inputSelect.getOptions().get(2).isSelected();
            }
        });
        assertTrue("Dragonfly should be selected", inputSelect.getOptions().get(4).isSelected());
        assertEquals("InputSelect Component is not returning the selected value correctly", "Dragonfly", inputSelect
                .getOptions().get(4).getText());
    }

    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE })
    public void testMultipleSelect() throws Exception {
        d = getDriver();
        String selectLocator = "select[class~='multiple']";
        String valueExpr = "return window.$A.getRoot().find('InputSelectMultiple').getAttributes().getValue('value').getValue();";

        open("/uitest/inputSelect_OptionsInBody.cmp");
        WebElement inputSelectElement = d.findElement(By.cssSelector(selectLocator));
        Select inputSelect = new Select(inputSelectElement);

        // Assert element visible
        assertTrue("InputSelect not visible", inputSelectElement.isDisplayed());

        // Initial selected aoption
        List<WebElement> selectedOptions = inputSelect.getAllSelectedOptions();
        assertTrue(selectedOptions.size() == 2);
        assertTrue("Lion not in expected otpions", isOptionSelected("Lion", selectedOptions));
        assertTrue("Bear not in expected otpions", isOptionSelected("Bear", selectedOptions));

        // Checking value via Aura framework
        String compValue = (String) ((JavascriptExecutor) d).executeScript(valueExpr);
        assertNotNull(compValue);
        String[] selectedValues = compValue.split(";");
        assertTrue("Lion not returned in component values", Arrays.asList(selectedValues).contains("Lion"));
        assertTrue("Bear not returned in component values", Arrays.asList(selectedValues).contains("Bear"));

        // Adding Click to focus Element before tabing out so that it works on
        // IE10.
        inputSelectElement.click();
        // change selection
        inputSelectElement.click();
        inputSelect.selectByValue("Butterfly");
        inputSelectElement.sendKeys(Keys.TAB);
        selectedOptions = inputSelect.getAllSelectedOptions();
        assertTrue("Butterfly not in expected otpions", isOptionSelected("Butterfly", selectedOptions));

        // Checking value via Aura framework
        compValue = (String) ((JavascriptExecutor) d).executeScript(valueExpr);
        assertNotNull(compValue);
        selectedValues = compValue.split(";");
        assertTrue("Butterfly not returned in component values", Arrays.asList(selectedValues).contains("Butterfly"));
    }

    private boolean isOptionSelected(String expectedOptionLabel, List<WebElement> selectedOptions) {
        for (WebElement we : selectedOptions) {
            if (we.getText().equals(expectedOptionLabel)) {
                return true;
            }
        }
        return false;
    }

    // W-1712531 - Excluded on Android because can't click an options of ui:inputSelect
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET })
    public void testOptionsAttribute() throws Exception {
        d = getDriver();
        String selectLocator = "select[class~='uiInputSelect']";

        open("/uitest/inputSelect_OptionsAttribute.cmp");
        WebElement inputSelectElement = d.findElement(By.cssSelector(selectLocator));
        Select inputSelect = new Select(inputSelectElement);

        // Assert element visible
        assertTrue("InputSelect not visible", inputSelectElement.isDisplayed());

        // Initial selected option
        List<WebElement> selectedLabels = inputSelect.getOptions();
        assertFalse("Option1 should not be selected", selectedLabels.get(0).isSelected());
        assertTrue("Option2 should be selected", selectedLabels.get(1).isSelected());

        // Change selection
        inputSelectElement.click();
        inputSelect.selectByValue("option1");
        selectedLabels = inputSelect.getOptions();
        assertTrue("Option1 should be selected", selectedLabels.get(0).isSelected());
        assertFalse("Option2 should not be selected", selectedLabels.get(1).isSelected());
        assertFalse("Option4 should be disabled", selectedLabels.get(3).isEnabled());
        assertEquals("InputSelect Component is not returning the selected value correctly", "option1", selectedLabels
                .get(0).getAttribute("value"));
    }

}
