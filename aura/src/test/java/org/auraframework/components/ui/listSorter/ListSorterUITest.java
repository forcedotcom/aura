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
package org.auraframework.components.ui.listSorter;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.test.*;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;

/**
 * UI automation for ui:ListSorter.
 * @userStory a07B0000000USVf
 */
@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX})
public class ListSorterUITest extends WebDriverTestCase{

	public static final String APP = "/uitest/listSorter_Test.cmp";
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
	
	public ListSorterUITest(String name) {
		super(name);
	}
	
	/**
	 * Tab out should not close the sorter dialog
	 * The focus should remain in the Sorter Menu
	 * Test case for W-1985435
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * TODO: Uncomment the test after W-1985435 is fixed
	 */
	public void _testTabOutOfListSorter() throws MalformedURLException, URISyntaxException {
		verifyTabOutAndEscBehaviour(Keys.TAB, true);
	}
	
	/**
	 * Verify pressing ESC while listSorter is opened should close the list sorter
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 */
	public void testEscOfListSorter() throws MalformedURLException, URISyntaxException {
		verifyTabOutAndEscBehaviour(Keys.ESCAPE, false);
	}

	/**
	 * If isOpen: true then listSorter should be open after pressing tab,
	 * isopen: false, list sorter should be closed after pressing tab
	 * @param key 
	 * @param isOpen
	 * @throws URISyntaxException 
	 * @throws MalformedURLException 
	 */
	private void verifyTabOutAndEscBehaviour(Keys keysToSend, boolean isOpen) throws MalformedURLException, URISyntaxException {
		open(APP);
		String trigger = "defaultListSorterTrigger";
		String sorter = "defaultListSorter";
		WebDriver driver = this.getDriver();
		WebElement listTrigger = driver.findElement(By.className(trigger));
		WebElement listSorter = driver.findElement(By.className(sorter));
		//List Sorter dialog should be closed
		assertFalse("list Sorter Dialog should not be visible", listSorter.getAttribute("class").contains("open"));
	    //click on Trigger
		listTrigger.click();
		//check menu list is visible after the click
		assertTrue("list Sorter Dialog should be visible", listSorter.getAttribute("class").contains("open"));
		WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
		activeElement.sendKeys(keysToSend);
		if(isOpen){
			assertTrue("list Sorter Dialog should still be visible after pressing tab", listSorter.getAttribute("class").contains("open"));
		}
		else{
			assertFalse("list Sorter Dialog should not be visible after pressing ESC", listSorter.getAttribute("class").contains("open"));
		}
	}
}
