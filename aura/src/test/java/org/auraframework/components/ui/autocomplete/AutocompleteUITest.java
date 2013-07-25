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
package org.auraframework.components.ui.autocomplete;

import java.util.*;

import org.auraframework.test.*;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;

/** UI test to test autocomplete component. 
 * Excluding IE7 and IE8 because component uses html5 specific tags
 */
@ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8})
public class AutocompleteUITest extends WebDriverTestCase {
	private final String URL = "/uitest/autoComplete_Test.cmp";
	private final String INPUT_SELECTOR = "input[class*='uiInput']";
	private final String OUTPUT_SELECTOR = "span[class*='uiOutputText']";
	private final String AUTOCOMPLETE_LIST_SELECTOR = "div[class*='uiAutocompleteList']";
	private final String AUTOCOMPLETE_OPTION_SELECTOR = "li[class*='uiAutocompleteOption']";
	private final String AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION_SELECTOR = "div[class*='uitestAutoComplete_CustomTemplate']";
	private final String AUTOCOMPLETE_CUSTOM_OPTION_SELECTOR = "div[class*='uiAutocompleteOption']";
	private final String MATCHED_SELECTOR = "mark[class*='data-match']";
			
	private Map<String, Integer> AUTOCOMPLETE_COMPONENT = new HashMap<String, Integer>();
	{
		AUTOCOMPLETE_COMPONENT.put("Generic", 1);
		AUTOCOMPLETE_COMPONENT.put("Empty", 2);
		AUTOCOMPLETE_COMPONENT.put("LargeList", 3);
		AUTOCOMPLETE_COMPONENT.put("CustomTemplate", 4);
		AUTOCOMPLETE_COMPONENT.put("OptionExtention", 5);
	}
	private enum OptionType {
			AUTOCOMPLETE_OPTION,
			AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION,
			AUTOCOMPLETE_CUSTOM_OPTION
	};
	
	public AutocompleteUITest(String name) {
		super(name);
	}
	
	/**
	 * Initial load of the autocomplete component. Verify data is loaded and
	 * the list is not visible.
	 */
	public void testAutoCompleteComponentInitialRender() throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        assertTrue("AutocompleteList should be invisible on initial load", hasCssClass(list, "invisible"));
        List<WebElement> options = getAutoCompleteListOptions(list);
        assertEquals("Autocomplete has the incorrect number of options", 10, options.size());
        String matchCount = getAutoCompleteMatchCount(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        assertEquals("Match Done should not be fired yet", "", matchCount);
	}
	
	/**
	 * Matching multiple items verifying list is visible and matched items
	 * present.
	 */
	public void testAutoCompleteComponentRenderOnMatch() throws Exception {
		doTestMatch(AUTOCOMPLETE_COMPONENT.get("Generic"), "o", null, 10, 
				OptionType.AUTOCOMPLETE_OPTION);
	}
	
	/**
	 * Able to select an item from autocomplete list.
	 */
	public void _testAutoCompleteSelectOption() throws Exception {
		doTestSelectOption(AUTOCOMPLETE_COMPONENT.get("Generic"), OptionType.AUTOCOMPLETE_OPTION);
	}
	
	/**
	 * Matching single items verifying list is visible and single matched 
	 * items present.
	 */
	public void testAutoCompleteSingleMatch() throws Exception {
		doTestMatch(AUTOCOMPLETE_COMPONENT.get("Generic"), "hello world2", "hello world2", 1, 
				OptionType.AUTOCOMPLETE_OPTION);
	}
	
	/**
	 * Autocomplete list with no data renderes correctly.
	 */
	public void testAutoCompleteWithZeroItems() throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Empty"));
        List<WebElement> options = getAutoCompleteListOptions(list);
        assertEquals("Autocomplete with no data should not have any options", 0, options.size());
	}
	
	/**
	 * Tabing through input field and list items functions properly.
	 */
	public void testAutoCompleteTabing() throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        WebElement nextInput = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("Empty"));
        
        input.sendKeys("o");
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, true);
        
        auraUITestingUtil.pressTab(input);
        list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, false);
        assertEquals("Focus should be back on the input",
        		nextInput.getAttribute("data-aura-rendered-by"), auraUITestingUtil.getUniqueIdOfFocusedElement());
	}
	
	/**
	 * Using arrow keys to cycle through list items functions properly.
	 */
	public void testAutoCompleteArrowKeys() throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
       
        input.sendKeys("o");
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, true);
        
        // go to second option in list.
        input.sendKeys(Keys.ARROW_DOWN + "" +  Keys.ARROW_DOWN + "");
        auraUITestingUtil.pressEnter(input);
        list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, false);
        assertEquals("Wrong option was selected", "hello world2", input.getAttribute("value"));       
	}
	
	/**
	 * For a component using a custom template match multiple items and verify 
	 * list is visible and matched items present.
	 */
	public void testAutoCompleteCustomTemplateComponentRenderOnMatch() throws Exception {
		doTestMatch(AUTOCOMPLETE_COMPONENT.get("CustomTemplate"), "o", null, 10, 
				OptionType.AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION);
	}
	
	/**
	 * For a component using a custom template able to select item in list.
	 */
	public void _testAutoCompleteCustomTemplateComponentSelectOption() throws Exception {
		doTestSelectOption(AUTOCOMPLETE_COMPONENT.get("CustomTemplate"), OptionType.AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION);
	}
	
	/**
	 * For a component extending autocompleteOption able to match multiple 
	 * items, also verify list is visible and matched items present.
	 */
	public void testAutoCompleteCustomOptionComponentRenderOnMatch() throws Exception {
		doTestMatch(AUTOCOMPLETE_COMPONENT.get("OptionExtention"), "o", null, 10, 
				OptionType.AUTOCOMPLETE_CUSTOM_OPTION);
	}
	
	/**
	 * For component extending autocompleteOption able to select item in list.
	 */
	public void _testAutoCompleteCustomOptionComponentSelectOption() throws Exception {
		doTestSelectOption(AUTOCOMPLETE_COMPONENT.get("OptionExtention"), OptionType.AUTOCOMPLETE_CUSTOM_OPTION);
	}
	
	/**
	 * For a component extending autocompleteOption able to match single 
	 * item, also verify list is visible and matched items present.
	 */
	public void testAutoCompleteSingleMatchUsingCustomTemplate() throws Exception {
		doTestMatch(AUTOCOMPLETE_COMPONENT.get("CustomTemplate"), "hello world2", "hello world2", 1, 
				OptionType.AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION);
	}
	
	private void doTestMatch(int autoCompleteCmpNum, String searchString, String target, int expectedMatched, OptionType optionType) 
		throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, autoCompleteCmpNum);
        
        input.sendKeys(searchString); 
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
        waitForAutoCompleteListVisible(list, true);
        
        List<WebElement> matched;
        if (optionType.equals(OptionType.AUTOCOMPLETE_OPTION)) {
        	matched = getMatchedOptionsInList(list);
        } else {
        	matched = getMatchedOptionsInListThatUsesCustomOptions(list, optionType);
        }
        assertEquals("Incorrect number of matched options", expectedMatched, matched.size());
        String matchCount = getAutoCompleteMatchCount(driver, autoCompleteCmpNum);
        assertEquals("Total count for match items after Matchdone event fired is not correct", expectedMatched+"", matchCount);
        
        if (target != null) {
        	assertEquals("Wrong option matched", target, matched.get(0).getAttribute("innerHTML"));
        }
	}
	
	private void doTestSelectOption(int autoCompleteCmpNum, OptionType optionType) throws Exception {
		open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, autoCompleteCmpNum);
        
        input.sendKeys("o");
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
        waitForAutoCompleteListVisible(list, true);
        WebElement element = getInnerElementOfAutoCompleteOptionInList(list, 3, optionType);
        element.click();
        assertEquals("Wrong option was selected", "hello world3", input.getAttribute("value"));
	}
	
	private WebElement getAutoCompleteInput(WebDriver d, int inputNumber) {
		List<WebElement> inputs = d.findElements(By.cssSelector(INPUT_SELECTOR));
		return inputs.get(inputNumber-1);
	}
	
	private WebElement getAutoCompleteList(WebDriver d, int listNumber) {
		List<WebElement> lists = d.findElements(By.cssSelector(AUTOCOMPLETE_LIST_SELECTOR));
		return lists.get(listNumber-1);
	}
	
	/**
	 * Returns the count of the total items match
	 * @param d
	 * @param outputNumber
	 * @return
	 */
	private String getAutoCompleteMatchCount(WebDriver d, int outputNumber) {
		List<WebElement> outputs = d.findElements(By.cssSelector(OUTPUT_SELECTOR));
		return outputs.get(outputNumber-1).getText();
	}
	
	private List<WebElement> getAutoCompleteListOptions(WebElement l) {
		return getAutoCompleteListOptions(l, OptionType.AUTOCOMPLETE_OPTION);
	}
	
	private List<WebElement> getAutoCompleteListOptions(WebElement l, OptionType optionType) {
		switch (optionType) {
		case AUTOCOMPLETE_OPTION : 
			return l.findElements(By.cssSelector(AUTOCOMPLETE_OPTION_SELECTOR));
		case AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION : 
			return l.findElements(By.cssSelector(AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION_SELECTOR));
		case AUTOCOMPLETE_CUSTOM_OPTION : 
			return l.findElements(By.cssSelector(AUTOCOMPLETE_CUSTOM_OPTION_SELECTOR));
		default:
			return new ArrayList<WebElement>();
		}
	}
	
	private List<WebElement> getMatchedOptionsInList(WebElement l) {
		return l.findElements(By.cssSelector(MATCHED_SELECTOR));
	}
	
	private List<WebElement> getMatchedOptionsInListThatUsesCustomOptions(WebElement l, OptionType optionType) {
		List<WebElement> options = getAutoCompleteListOptions(l, optionType);
		List<WebElement> matched = new ArrayList<WebElement>();
		for (int i=0; i<options.size(); i++) {
			WebElement option = options.get(i);
			if (optionType.equals(OptionType.AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION)) {
				option = option.findElement(By.tagName("a"));
			} 
			if (!option.getAttribute("class").contains("invisible")) {
				matched.add(option);
			}
		}
		return matched;
	}
		
	private WebElement getInnerElementOfAutoCompleteOptionInList(WebElement l, int optionNumber, OptionType optionType) {
		List<WebElement> options = getAutoCompleteListOptions(l, optionType);
        WebElement option = options.get(optionNumber-1);
        return option.findElement(By.tagName("a"));
	}
}
