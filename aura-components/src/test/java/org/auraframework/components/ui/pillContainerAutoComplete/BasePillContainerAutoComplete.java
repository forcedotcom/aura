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
package org.auraframework.components.ui.pillContainerAutoComplete;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class BasePillContainerAutoComplete extends WebDriverTestCase {

	private final String CMP_URL;
	public static final String INPUT = "div[class*='uiInputTextForAutocomplete'] input";
    public static final String LISTCONTENT_LOCATOR = ".visible";
    
    public BasePillContainerAutoComplete(String urlPath) {
    	super(urlPath);
        this.CMP_URL = urlPath;
    }
    
    /*
     * ui:pillContainer dropdown continues to focus after clicking on any of the pill
     * Bug: W-2628705
     */
    public void testAutoCompleteListContentVisible() throws MalformedURLException, URISyntaxException, InterruptedException {
        open(CMP_URL);
        WebElement input = findDomElement(By.cssSelector(INPUT));
        input.sendKeys("khDmXpDDmALzDqhYeCvJgqEmjUPJqV");
        auraUITestingUtil.pressEnter(input);
        assertFalse("Auto complete List Content should not be visible", isListContentVisible());
        input.sendKeys("test");
        assertNotNull("Auto complete List Content should be visible", isListContentVisible());
        WebElement pill = findDomElement(By.cssSelector(".pill"));
        pill.click();
        assertTrue("Auto complete List Content should be still visible after clicking on pill", isListContentVisible());
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
        auraUITestingUtil.pressEnter(input);
        assertFalse("Auto complete List Content should not be visible", isListContentVisible());
        input.sendKeys("test");
        assertNotNull("Auto complete List Content should be visible", isListContentVisible());
        int listItem = 2;
        WebElement listItem2 = getAutoCompleteListOptions(listItem);
        listItem2.click();
        assertFalse("Auto complete List Content should not be visible after click on pill 3", isListContentVisible());
    }

	private WebElement getAutoCompleteListOptions(int optionNumber) {
		List<WebElement> listOfOptions = findDomElements(By.cssSelector("ul[class*='visible'] li"));
		return listOfOptions.get(optionNumber);
	}

	private boolean isListContentVisible() throws InterruptedException {
		waitFor(3);
        return isElementPresent(By.cssSelector(LISTCONTENT_LOCATOR));
	}
}