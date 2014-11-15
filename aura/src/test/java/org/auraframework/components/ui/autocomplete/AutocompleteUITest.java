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

/**
 * UI test to test autocomplete component. Excluding IE7 and IE8 because component uses html5 specific tags
 */
@ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8 })
public class AutocompleteUITest extends WebDriverTestCase {
    private final String URL = "/uitest/autoComplete_Test.cmp";
    private final String INPUT_SELECTOR = "input[class*='default']";
    private final String OUTPUT_SELECTOR = "span[class*='uiOutputText']";
    private final String EVENT_OUTPUT_SELECTOR = "span[class*='outputLabel']";
    private final String AUTOCOMPLETE_LIST_SELECTOR = "div[class*='uiAutocompleteList']";
    private final String AUTOCOMPLETE_OPTION_SELECTOR = "li[class*='uiAutocompleteOption']";
    private final String AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION_SELECTOR = "div[class*='uitestAutoComplete_CustomTemplate']";
    //since W-2419601, 'invisible' is being added to the li contains "div[class*='customOption']";
    private final String AUTOCOMPLETE_CUSTOM_OPTION_SELECTOR = "li[class*='uiAutocompleteOption']";
    private final String MATCHED_SELECTOR = "mark[class*='data-match']";

    private final Map<String, Integer> AUTOCOMPLETE_COMPONENT = new HashMap<>();
    {
        AUTOCOMPLETE_COMPONENT.put("Generic", 1);
        AUTOCOMPLETE_COMPONENT.put("Empty", 2);
        AUTOCOMPLETE_COMPONENT.put("LargeList", 3);
        AUTOCOMPLETE_COMPONENT.put("CustomTemplate", 4);
        AUTOCOMPLETE_COMPONENT.put("OptionExtention", 5);
        AUTOCOMPLETE_COMPONENT.put("autoCompleteUpdateOn", 6);
        AUTOCOMPLETE_COMPONENT.put("emptyListContent", 7);
        AUTOCOMPLETE_COMPONENT.put("matchFunc", 8);
        AUTOCOMPLETE_COMPONENT.put("blurFocus", 9);
        AUTOCOMPLETE_COMPONENT.put("toggle", 10);
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
     * Initial load of the autocomplete component. Verify data is loaded and the list is not visible.
     */
    public void testAutoCompleteComponentInitialRender() throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        assertTrue("AutocompleteList should be invisible on initial load", hasCssClass(list, "invisible"));
        List<WebElement> options = getAutoCompleteListOptions(list);
        assertEquals("Autocomplete has the incorrect number of options", 10, options.size());
        WebElement toggle = getAutoCompleteToggle(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        assertNull("List toggle button should not be present", toggle);
        String matchCount = getAutoCompleteMatchCount(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        assertEquals("Match Done should not be fired yet", "", matchCount);
    }

    /**
     * Test to verify input cmp does get its value updated on clicking ENTER in the field Bug: W-2293143 Press Enter is
     * not used for Safari
     */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    public void testAutoCompleteWithUpdateOnAttributeSet() throws Exception {
        open(URL);
        String inputAutoComplete = "autoCompleteUpdateOn";
        String expr = auraUITestingUtil.prepareReturnStatement(auraUITestingUtil.getFindAtRootExpr(inputAutoComplete)
                + ".find('input').get('v.value')");
        String autoCompleteText = (String)auraUITestingUtil.getEval(expr);
        assertNull("Auto complete Text for input should be undefined", autoCompleteText);
        WebDriver driver = getDriver();
        WebElement inputElement = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("autoCompleteUpdateOn"));
        inputElement.click();
        String expectedText = "testing";
        inputElement.sendKeys(expectedText);
        auraUITestingUtil.pressEnter(inputElement);
        autoCompleteText = (String)auraUITestingUtil.getEval(expr);
        assertEquals("Input Value was not change after pressing Enter", expectedText, autoCompleteText);
    }
    
    /**
     * Test to verify blur and focus events works when set in the ui:autocomplete component.
     * Test case: W-2391008
     */
    // Exclude on ios-driver because the driver hides the keyboard after send keys which triggers a blur event
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testAutoCompleteWithBlurAndFocusEvent() throws Exception {
        open(URL);
        String inputAutoComplete = "blurFocus";
        String outputTextLocator = "span[class*='outputLabelOnFocusAndBlur']";
        Integer inputBlurFocus = AUTOCOMPLETE_COMPONENT.get(inputAutoComplete);
        Integer matchFuncInput = AUTOCOMPLETE_COMPONENT.get("matchFunc");
        WebDriver driver = getDriver();
        WebElement outputText = findDomElement(By.cssSelector(outputTextLocator));
        assertEquals("No Event should be fire yet", "", outputText.getText());
        //selecting input to fire focus event
        WebElement inputElement = getAutoCompleteInput(driver, inputBlurFocus);
        inputElement.click();
        assertEquals("Focus Event should be fired", "Focus Event Fired!!", outputText.getText());
        //selecting different input to fire blur event
        WebElement inputmatchFunc = getAutoCompleteInput(driver, matchFuncInput);
        inputmatchFunc.click();
        assertEquals("Blur Event should be fired", "Blur Event Fired!!", outputText.getText());
    }

    /**
     * Matching multiple items verifying list is visible and matched items present.
     */
    public void testAutoCompleteComponentRenderOnMatch() throws Exception {
        doTestMatch(AUTOCOMPLETE_COMPONENT.get("Generic"), "o", null, 10, OptionType.AUTOCOMPLETE_OPTION);
    }

    /**
     * Able to select an item from autocomplete list.
     */
    public void _testAutoCompleteSelectOption() throws Exception {
        doTestSelectOption(AUTOCOMPLETE_COMPONENT.get("Generic"), OptionType.AUTOCOMPLETE_OPTION);
    }

    /**
     * Matching single items verifying list is visible and single matched items present.
     */
    public void testAutoCompleteSingleMatch() throws Exception {
        doTestMatch(AUTOCOMPLETE_COMPONENT.get("Generic"), "hello world2", "hello world2", 1,
                OptionType.AUTOCOMPLETE_OPTION);
    }

    /**
     * Autocomplete list with no data renderes correctly.
     */
    // TODO: W-2406307: remaining Halo test failure
    public void _testAutoCompleteWithZeroItems() throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        Integer autoCompleteCmpNum = AUTOCOMPLETE_COMPONENT.get("Empty");
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
        assertFalse("Expected emptyListContent to be invisible", hasCssClass(list, "showEmptyContent"));
        List<WebElement> options = getAutoCompleteListOptions(list);
        assertEquals("Autocomplete with no data should not have any options", 0, options.size());

        // Make sure the list is not visible after input since no emptyListContent is specified.
        doTestEmptyListContent(autoCompleteCmpNum, "o", false, false);
    }

    /**
     * Test to check support for keydown event. Test case for W-2227931
     */
    public void testAutoCompleteKeyDownEventSupport() throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("Empty"));
        input.click();
        input.sendKeys("o");
        WebElement output = driver.findElement(By.cssSelector(EVENT_OUTPUT_SELECTOR));
        waitForElementTextPresent(output, "KeyDown Event Fired");
    }

    /**
     * Tabbing through input field and list items functions properly.
     */
    // Excluding mobile devices since they don't have tabbing functionality
    // Excluding Firefox as well because tabbing in Firefox works differently. There is a separate test for this.
    // TODO : Bug W-1780786
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8, BrowserType.FIREFOX, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
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
        assertEquals("Focus should be on the next input", nextInput.getAttribute("data-aura-rendered-by"),
                auraUITestingUtil.getUniqueIdOfFocusedElement());
    }

    /**
     * Using arrow keys to cycle through list items functions properly.
     */
    // Excluding mobile devices since they dont have arrow key functionality
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    public void testAutoCompleteArrowKeys() throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));

        input.sendKeys("o");
        WebElement list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, true);

        // go to second option in list.
        input.sendKeys(Keys.ARROW_DOWN + "" + Keys.ARROW_DOWN + "");
        auraUITestingUtil.pressEnter(input);
        list = getAutoCompleteList(driver, AUTOCOMPLETE_COMPONENT.get("Generic"));
        waitForAutoCompleteListVisible(list, false);
        assertEquals("Wrong option was selected", "hello world2", input.getAttribute("value"));
    }

    /**
     * For a component using a custom template match multiple items and verify list is visible and matched items
     * present.
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
     * For a component extending autocompleteOption able to match multiple items, also verify list is visible and
     * matched items present.
     */
    public void testAutoCompleteCustomOptionComponentRenderOnMatch() throws Exception {
        doTestMatch(AUTOCOMPLETE_COMPONENT.get("OptionExtention"), "o", null, 10, OptionType.AUTOCOMPLETE_CUSTOM_OPTION);
    }

    /**
     * For component extending autocompleteOption able to select item in list.
     */
    public void _testAutoCompleteCustomOptionComponentSelectOption() throws Exception {
        doTestSelectOption(AUTOCOMPLETE_COMPONENT.get("OptionExtention"), OptionType.AUTOCOMPLETE_CUSTOM_OPTION);
    }

    /**
     * For a component extending autocompleteOption able to match single item, also verify list is visible and matched
     * items present.
     */
    public void testAutoCompleteSingleMatchUsingCustomTemplate() throws Exception {
        doTestMatch(AUTOCOMPLETE_COMPONENT.get("CustomTemplate"), "hello world2", "hello world2", 1,
                OptionType.AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION);
    }

    /**
     * Test for autocomplete with emptyListContent when there are no matches in the list.
     */

    // DVAL: HALO: HACK: WTF: FIXME THIS WHOLE AUTOCOMPLETE COMPONENT

    // public void testAutoCompleteEmptyListContentNoMatches() throws Exception {
    //     doTestEmptyListContent(AUTOCOMPLETE_COMPONENT.get("emptyListContent"), "hello worldx", true, true);
    // }

    /**
     * Test for autocomplete with emptyListContent when there are matches in the list.
     */
    public void testAutoCompleteEmptyListContentOnMatch() throws Exception {
        doTestEmptyListContent(AUTOCOMPLETE_COMPONENT.get("emptyListContent"), "hello world", true, false);
    }

    /**
     * Test for autocomplete with emptyListContent. Verifies that emptyListContent is not visible when matches are
     * present and becomes visible when no matches are found.
     */

    // DVAL: HALO: HACK: WTF: FIXME THIS WHOLE AUTOCOMPLETE COMPONENT

    // public void testAutoCompleteEmptyListContentUseCase() throws Exception {
    //     Integer autoCompleteCmpNum = AUTOCOMPLETE_COMPONENT.get("emptyListContent");
    //     doTestEmptyListContent(autoCompleteCmpNum, "hello world", true, false);
    //     doTestEmptyListContent(autoCompleteCmpNum, "hello worldx", true, true);

    //     WebDriver driver = getDriver();
    //     WebElement input = getAutoCompleteInput(driver, autoCompleteCmpNum);
    //     auraUITestingUtil.pressTab(input);

    //     WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
    //     waitForAutoCompleteListVisible(list, false);
    //     assertFalse("Expected emptyListContent to be invisible", hasCssClass(list, "showEmptyContent"));
    // }

    /**
     * Test for autocomplete with a matchFunc override. The behavior is overridden to show all items no matter what gets
     * typed in the input field. Verifies that all elements are found.
     */
    public void testAutoCompleteMatchFunc() throws Exception {
        Integer autoCompleteCmpNum = AUTOCOMPLETE_COMPONENT.get("matchFunc");

        open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, autoCompleteCmpNum);

        input.sendKeys("hello worldx");
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
        waitForAutoCompleteListVisible(list, true);

        List<WebElement> options = getAutoCompleteListOptions(list);
        assertEquals("Incorrect number of visible options", 10, options.size());
    }
    
    /**
     * Test for autocomplete with a list toggle button. The behavior is overridden to show all items no matter what gets
     * typed in the input field. Verifies that the list visibility can be toggled.
     */
    public void testAutoCompleteToggle() throws Exception {
        Integer autoCompleteCmpNum = AUTOCOMPLETE_COMPONENT.get("toggle");

        open(URL);
        WebDriver driver = getDriver();
        WebElement toggle = getAutoCompleteToggle(driver, autoCompleteCmpNum);
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);

        assertNotNull("List toggle button should be present", toggle);

        toggle.click();
        waitForAutoCompleteListVisible(list, true);

        toggle.click();
        waitForAutoCompleteListVisible(list, false);
    }
    
    private void doTestMatch(int autoCompleteCmpNum, String searchString, String target, int expectedMatched,
            OptionType optionType) throws Exception {
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
        assertEquals("Total count for match items after Matchdone event fired is not correct", expectedMatched + "",
                matchCount);

        if (target != null) {
            assertEquals("Wrong option matched", target, matched.get(0).getAttribute("innerHTML"));
        }
    }

    private void doTestEmptyListContent(int autoCompleteCmpNum, String searchString, boolean listVisible,
            boolean emptyContentVisible) throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        WebElement input = getAutoCompleteInput(driver, autoCompleteCmpNum);

        input.sendKeys(searchString);
        WebElement list = getAutoCompleteList(driver, autoCompleteCmpNum);
        waitForAutoCompleteListVisible(list, listVisible);

        boolean visible = hasCssClass(list, "showEmptyContent");
        if (emptyContentVisible) {
            assertTrue("Expected emptyListContent to be visible", visible);
        } else {
            assertFalse("Expected emptyListContent to be invisible", visible);
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
        return inputs.get(inputNumber - 1);
    }

    private WebElement getAutoCompleteToggle(WebDriver d, int inputNumber) {
        WebElement input = getAutoCompleteInput(d, inputNumber);
        List<WebElement> toggles = input.findElements(By.xpath("following-sibling::button"));
        if (toggles.isEmpty()) {
            return null;
        } else {
            return toggles.get(0);
        }
    }

    private WebElement getAutoCompleteList(WebDriver d, int listNumber) {
        List<WebElement> lists = d.findElements(By.cssSelector(AUTOCOMPLETE_LIST_SELECTOR));
        return lists.get(listNumber - 1);
    }

    /**
     * Returns the count of the total items match
     * 
     * @param d
     * @param outputNumber
     * @return
     */
    private String getAutoCompleteMatchCount(WebDriver d, int outputNumber) {
        List<WebElement> outputs = d.findElements(By.cssSelector(OUTPUT_SELECTOR));
        return outputs.get(outputNumber - 1).getText();
    }

    private List<WebElement> getAutoCompleteListOptions(WebElement l) {
        return getAutoCompleteListOptions(l, OptionType.AUTOCOMPLETE_OPTION);
    }

    private List<WebElement> getAutoCompleteListOptions(WebElement l, OptionType optionType) {
        switch (optionType) {
        case AUTOCOMPLETE_OPTION:
            return l.findElements(By.cssSelector(AUTOCOMPLETE_OPTION_SELECTOR));
        case AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION:
            return l.findElements(By.cssSelector(AUTOCOMPLETE_CUSTOM_TEMPLATE_OPTION_SELECTOR));
        case AUTOCOMPLETE_CUSTOM_OPTION:
            return l.findElements(By.cssSelector(AUTOCOMPLETE_CUSTOM_OPTION_SELECTOR));
        default:
            return new ArrayList<>();
        }
    }

    private List<WebElement> getMatchedOptionsInList(WebElement l) {
        return l.findElements(By.cssSelector(MATCHED_SELECTOR));
    }

    private List<WebElement> getMatchedOptionsInListThatUsesCustomOptions(WebElement l, OptionType optionType) {
        List<WebElement> options = getAutoCompleteListOptions(l, optionType);
        List<WebElement> matched = new ArrayList<>();
        for (int i = 0; i < options.size(); i++) {
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
        WebElement option = options.get(optionNumber - 1);
        return option.findElement(By.tagName("a"));
    }
}
