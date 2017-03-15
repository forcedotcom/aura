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
package org.auraframework.integration.test.components.ui.pillContainerAutoComplete;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class BasePillContainerAutoComplete extends WebDriverTestCase {

	private final String CMP_URL;
	public static final String INPUT = "input[class*='uiInputTextForAutocomplete']";
    public static final String LISTCONTENT_LOCATOR = ".visible";
    
    public BasePillContainerAutoComplete(String urlPath) {
    	this.setName(urlPath);
        this.CMP_URL = urlPath;
    }
    
    /*
     * ui:pillContainer dropdown continues to focus after clicking on any of the pill
     * Bug: W-2628705
     */
    @Flapper
    public void testAutoCompleteListContentVisible() throws MalformedURLException, URISyntaxException, InterruptedException {
        open(CMP_URL);
        WebElement input = findDomElement(By.cssSelector(INPUT));
        input.sendKeys("khDmXpDDmALzDqhYeCvJgqEmjUPJqV");
        getAuraUITestingUtil().pressEnter(input);
        verifyAutoCompleteListPresent("Auto complete List Content should not be visible", false);
        input.sendKeys("test");
        verifyAutoCompleteListPresent("Auto complete List Content should be visible", true);
        WebElement pill = findDomElement(By.cssSelector(".pill"));
        pill.click();
        verifyAutoCompleteListPresent("Auto complete List Content should be still visible after clicking on pill", true);
    }
    
    /*
     * Test to prevent loss of focus from the auto complete input when clicking
     * on the option in autocomplete list
     * Bug: W-2641156
     */
    public void testLossOfFocusVerification() throws MalformedURLException, URISyntaxException, InterruptedException {
        open(CMP_URL);
        WebElement input = findDomElement(By.cssSelector(INPUT));
        input.sendKeys("khDmXpDDmALzDqhYeCvJgqEmjUPJqV");
        getAuraUITestingUtil().pressEnter(input);
        verifyAutoCompleteListPresent("Auto complete List Content should not be visible", false);
        input.sendKeys("test");
        verifyAutoCompleteListPresent("Auto complete List Content should be visible", true);
        int listItem = 2;
        WebElement listItem2 = getAutoCompleteListOptions(listItem);
        listItem2.click();
        verifyAutoCompleteListPresent("Auto complete List Content should not be visible after click on pill 3", false);
    }

	private WebElement getAutoCompleteListOptions(int optionNumber) {
		List<WebElement> listOfOptions = findDomElements(By.cssSelector("ul[class*='visible'] li"));
		return listOfOptions.get(optionNumber);
	}

	/**
	 * Verify autocomplete list is expanded(Visible) 
	 * @param failureMessage
	 * @param isElemPresent
	 */
	private void verifyAutoCompleteListPresent(String failureMessage, boolean isElemPresent) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return isElementPresent(By.cssSelector(LISTCONTENT_LOCATOR)) == isElemPresent;
            }
        }, failureMessage);
    }
}
