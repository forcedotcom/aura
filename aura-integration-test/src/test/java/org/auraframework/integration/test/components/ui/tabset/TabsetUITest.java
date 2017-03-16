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
package org.auraframework.integration.test.components.ui.tabset;

import java.util.List;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public class TabsetUITest extends WebDriverTestCase {
    private final String URL = "/uitest/tabset_Test.cmp";
    private final By OVERFLOW_LOCATOR =  By.cssSelector("li[class*='tabs__item uiTabOverflowMenuItem'] a");
    private final By OVERFLOW_MENU_LOCATOR =  By.cssSelector("div.uiMenuList");
    private final By ACTIVE_LI_LOCATOR = By.cssSelector("li[class*='tabs__item active uiTabItem'] > a");
    private final By ACTIVE_SECTION = By.cssSelector("section[class*='tabs__content active uiTab']");
    private final String[] TITLE_ARRAY = {"Accounts", "Contacts", "Opportunities", "Leads", "Chatter", "Icon",
            "Dashboards"};
    private final String[] OVERFLOW_TITLE_ARRAY = {"Accounts", "Contacts", "Opportunities", "Leads", "Chatter", "Icon",
    "Dashboards", "Campaigns", "Calendars", "Events", "Tasks"};
    private final String[] BODY_ARRAY = {"tab 1 contents", "tab 2 contents", "tab 3 contents", "tab 4 contents",
            "tab 5 contents", "tab 6 contents", "tab 7 contents"};
    private int NUMBER_OF_TABS = 7;
    private int NUMBER_OF_TABS_OVERFLOW_TABSET = 8;

    /********************************************** HELPER FUNCTIONS ******************************************/

    /**
     * Function that will iterate through all tabs and make sure that we go in the correct order
     * 
     * @param rightOrDownArrow - Key to press
     * @param leftOrUpArrow Key to press
     */
    private void iterateThroughTabs(CharSequence rightOrDownArrow, CharSequence leftOrUpArrow) {
        WebElement element = findDomElement(By.linkText("Accounts"));
        element.click();
        waitForTabSelected("Did not switch over to Accounts tab", element);
        WebElement activeSection = findDomElement(ACTIVE_SECTION);

        // Loop through all of the tabs to make sure we get to the correct values
        for (int i = 0; i < TITLE_ARRAY.length; i++) {

            // Verify on correct tab
            assertEquals("Did not get to the correct tab", TITLE_ARRAY[i], element.getText());

            // Verify Section id and tab id match
            assertEquals("The aria-controls id and section id do not match", element.getAttribute("aria-controls"),
                    activeSection.getAttribute("id"));

            // Verify Body text matches what we think it should be
            assertTrue("The body of the section is not what it should be",
                    activeSection.getText().contains(BODY_ARRAY[i]));

            // Go to the next element then grab the new active elements
            element.sendKeys(rightOrDownArrow);
            int index = i + 1;
            // Loop back to the first tab if we've reached the end of the list
            index = index == TITLE_ARRAY.length ? 0 : index;
            waitForTabSelected("Right or down arrow navigation did not navigate to expected tab",
                    findDomElement(By.linkText(TITLE_ARRAY[index])));
            element = findDomElement(ACTIVE_LI_LOCATOR);
            activeSection = findDomElement(ACTIVE_SECTION);
        }

        // Loop through all of the tabs to make sure we get to the correct values
        for (int i = TITLE_ARRAY.length - 1; i >= 0; i--) {
            element.sendKeys(leftOrUpArrow);
            waitForTabSelected("Left or up arrow navigation did not navigate to expected tab",
                    findDomElement(By.linkText(TITLE_ARRAY[i])));
            element = findDomElement(ACTIVE_LI_LOCATOR);
            activeSection = findDomElement(ACTIVE_SECTION);

            // Verify on correct tab
            assertEquals("Did not get to the correct tab", TITLE_ARRAY[i], element.getText());

            // Verify Section id and tab id match
            assertEquals("The aria-controls id and section id do not match", element.getAttribute("aria-controls"),
                    activeSection.getAttribute("id"));

            // Verify Body text matches what we think it should be
            assertTrue("The body of the section is not what it should be",
                    activeSection.getText().contains(BODY_ARRAY[i]));
        }
    }

    private void waitForTabSelected(String msg, final WebElement element) {
        WebDriverWait wait = new WebDriverWait(getDriver(), getAuraUITestingUtil().getTimeout());
        wait.withMessage(msg);
        wait.until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement parent = element.findElement(By.xpath(".."));
                return parent.getAttribute("class").contains("active");
            }
        });
    }

    /**
     * Verify that when a tab closes that it actually closes
     * 
     * @param loc - string location of tab to close
     */
    private void closeTabAndVerify(String loc) {
        findDomElement(By.xpath(loc)).click();
        int numberOfElement = findDomElements(By.xpath("//ul/li")).size();

        // Subtracting total number of tabs that we expect by 1
        --NUMBER_OF_TABS;
        assertEquals("The number of tabs, after deleting a tab, do not match", numberOfElement, NUMBER_OF_TABS);
    }

    /**
     * Making sure that when an element closes the element that is focused is no longer focused, and focus is on the
     * next item
     * 
     * @param initialFocusLocator - where the current focus is
     * @param initialText - the text that we are expecting
     * @param secondaryText - text of the element where we want the focus to be
     */
    private void checkFocusMoves(String initialFocusLocator, String initialText, String secondaryText) {
        WebElement element = findDomElement(By.xpath(initialFocusLocator));
        assertTrue("Correct element (" + initialText + ") was not found", element.getText().contains(initialText));
        element.click();

        // Close element directly before/after tab current tab
        closeTabAndVerify(initialFocusLocator + "/a");

        // Verify that there is only one active element on the page
        List<WebElement> elms = findDomElements(ACTIVE_LI_LOCATOR);
        assertEquals("Amount of active elements on the page is incorrect", 1, elms.size());

        element = elms.get(0);
        assertTrue("Correct element (" + secondaryText + ") was not found", element.getText().contains(secondaryText));
    }

    /**
     * method to create an xpath location that we are looking for
     * 
     * @param pos - position of the li, under the UL that we are looking for
     * @return - the xpath string
     */
    private String createXPath(int pos) {
        return "//ul/li[" + pos + "]/a";
    }

    /**
     * Function that will create a tab, tab and verify its contents
     * 
     * @param tabName - Name of the tab
     * @param tabBody - Body of the tab
     */
    private void createNewTab(String tabName, String tabBody) {
        WebElement element = findDomElement(By.xpath("//button[contains(@class,'addTab')]"));
        element.click();

        element = findDomElement(ACTIVE_LI_LOCATOR);
        assertTrue("Correct element was not found", element.getText().contains(tabName));

        // Verify Body text matches what we think it should be
        element = findDomElement(ACTIVE_SECTION);
        assertEquals("The body of the section is not what it should be", tabBody, element.getText());
        NUMBER_OF_TABS++;
    }

    /**
     * Function that will create a url based on the item attribute. Depending on what ITem is the page will render
     * differently
     * 
     * @param item - what item we want rendered
     * @return - the desired URL string
     */
    private String createURL(String item, String closable) {
        return URL + "?renderItem=" + item + "&closable=" + closable;
    }

    /**
     * Function verifying that the element we are expecting to be active is actually active
     * 
     * @param loc - the locator for the element
     */
    private void verifyElementIsActive(By loc) {
        WebElement el = findDomElement(loc);
        assertTrue("The Active class name was not found in the non deleted element",
                el.getAttribute("class").contains("active"));
    }

    public void verifyElementFocus(String itemToVerifyAgainst) {
        // Verify correct element is focused (verified with with the class that we are expecting the element to contain)
        String activeElementClass = (String) getAuraUITestingUtil()
                .getEval("return $A.test.getActiveElement().getAttribute('class')");
        assertTrue("Focus is not on ther correct element", activeElementClass.contains(itemToVerifyAgainst));
    }

    /**
     * Function to open an overflow menu
     * 
     * @param overflowElement - Overflow menu trigger DOM element
     * @param openMethod - The keyboard key with which to open the overflow menu
     */
    public void openOverflowMenu(WebElement overflowElement, Keys openMethod) {
    	Actions actions = new Actions(this.getDriver());
    	actions.moveToElement(overflowElement);
        actions.sendKeys(openMethod);
        actions.build().perform();
    }
    
    /**
     * Function to wait for the overflow menu in the tabset to open
     */
    public void waitForOverflowMenuOpen() {   	
    	WebElement overflowMenu = findDomElement(OVERFLOW_MENU_LOCATOR);
    	getAuraUITestingUtil().waitUntil(check -> {
            return overflowMenu.getAttribute("class").contains("visible");
        }, "Menu list should be visible after clicking to open");
    }
    
    /**
     * Function to navigate from a random tab to the overflow menu and open overflow menu
     * 
     * @param startIndex - Index or the tab from which to start navigating to overflow menu
     * @param useTab - Use tab key to navigate to overflow menu
     * @param openMethod - Keyboard key with which to open overflow menu
     */
    public void overflowKeyboardNav(int startIndex, Boolean useTabKey, Keys openMethod) {    	
    	
    	WebElement tab = findDomElement(By.linkText(OVERFLOW_TITLE_ARRAY[startIndex]));
        tab.click();
        waitForTabSelected("Did not switch over to " + OVERFLOW_TITLE_ARRAY[startIndex] + " tab", tab);
    	
        if(useTabKey) {
        	getAuraUITestingUtil().pressTab(tab);
        }
        else {
        	// Navigate only up to the overflow menu
        	for(int i = startIndex; i < NUMBER_OF_TABS_OVERFLOW_TABSET; i++) {
            	tab.sendKeys(Keys.ARROW_RIGHT);
            	int nextIndex = i + 1;
            	nextIndex = nextIndex == NUMBER_OF_TABS_OVERFLOW_TABSET ? nextIndex-1 : nextIndex;
            	waitForTabSelected("Did not switch over to " + OVERFLOW_TITLE_ARRAY[nextIndex] + " tab",
                        findDomElement(By.linkText(OVERFLOW_TITLE_ARRAY[nextIndex])));
            	tab = findDomElement(ACTIVE_LI_LOCATOR);
            }
        }       
        
        WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval("return $A.test.getActiveElement()");
        WebElement overflowElement = findDomElement(OVERFLOW_LOCATOR);
        assertTrue(activeElement.equals(overflowElement));
        
        openOverflowMenu(overflowElement, openMethod);
                
        waitForOverflowMenuOpen();
    }

    /********************************************************************************************************************/

    /**
     * Test that will verify that the arrows keys work. This is not something that will be run on mobile devices
     * 
     * IE7/8 don't handle arrows well.
     */
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD,
            BrowserType.IE8, BrowserType.IE7 })
    @Test
    public void testLeftRightUpDownArrows() throws Exception {
        open(createURL("basic", "false"));

        // Left/Up and Right/Down Arrows do the samething. Making sure that the result is also the same
        iterateThroughTabs(Keys.ARROW_RIGHT, Keys.ARROW_LEFT);
        iterateThroughTabs(Keys.ARROW_DOWN, Keys.ARROW_UP);
    }

    /**
     * Test that will verify that when a tab closes, the active element is moved to either the correct element.
     */
    @Test
    public void testFocusOnClose_MovesToAnotherElement() throws Exception {
        open(createURL("basic", "true"));
        NUMBER_OF_TABS = 7;
        // Check focus moves from the first element to the second element after it is closed
        checkFocusMoves(createXPath(1), TITLE_ARRAY[0], TITLE_ARRAY[1]);

        // Check focus moves from middle element to next element
        checkFocusMoves(createXPath(2), TITLE_ARRAY[2], TITLE_ARRAY[3]);

        // Check focus moves from the last element to the second to last element
        checkFocusMoves(createXPath(5), TITLE_ARRAY[6], TITLE_ARRAY[5]);
    }

    /**
     * Test verifying that if an element that is not active is closed, then focus is not lost
     */
    @Test
    public void testFocusOnClose_NonCurrentElementDoesntLoseFocus() throws Exception {
        open(createURL("basic", "true"));
        NUMBER_OF_TABS = 7;
        closeTabAndVerify(createXPath(4) + "/a");

        WebElement element = findDomElement(ACTIVE_LI_LOCATOR);
        assertEquals("Correct element was not found", TITLE_ARRAY[4], element.getText());
    }

    /**
     * Dynamically create a component, verify it and make sure that it still acts as a normal component
     */
    @Test
    public void testFocusOnClose_DynamicTabGeneration() throws Exception {
        String tabName = "Dynamic";
        String tabBody = "Dynamically generated";
        NUMBER_OF_TABS = 7;

        open(createURL("basic", "false"));
        createNewTab(tabName, tabBody);

        checkFocusMoves(createXPath(8), tabName, TITLE_ARRAY[6]);
    }

    /**
     * Verifying that nestedTabs work the same as normal tabs
     */
    @Test
    public void testNestedTabsDelete() throws Exception {
        open(createURL("nestedTabs", "false"));
        WebElement el = findDomElement(By.partialLinkText("inner tab 1"));
        el.click();

        el = findDomElement(By.xpath("//li/a/a"));
        el.click();

        // Verify nested tab that was not deleted is active
        verifyElementIsActive(By.xpath("//li[contains(., 'inner tab 2')]"));

        // Verify that the parent tab is still active, and that both elements in the parents tabBar still exist
        verifyElementIsActive(By.xpath("//li[contains(., 'tab1')]"));

        List<WebElement> elements = findDomElements(By.xpath("//div[contains(@class,'nestedTabs')]/div/ul/li"));
        assertEquals("Size of the part tabBar was not as expected. Something must have been deleted", 2,
                elements.size());
    }

    /**
     * Test that will verify that tabbing through tabset should go into the body.
     * 
     * Disabled against mobile since tabbing does not make sense on mobile Tabbing with Safari acts oddly. For some
     * strange reason, I have to grab the element I want and then send the tab key to put it into focus other wise
     * nothing happens
     */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE,
            BrowserType.IPAD })
    @Test
    public void testTabbingInTabSet() throws Exception {
        open(createURL("tab", "true"));

        // Focus on tab and move to next focusable element
        WebElement element = findDomElement(By.partialLinkText("Accounts"));
        element.click();
        getAuraUITestingUtil().pressTab(element);

        // Verify anchor is focused on
        String activeElementText = getAuraUITestingUtil().getActiveElementText();
        assertTrue("Focus is not on ther correct element", activeElementText.contains("Close"));

        // Move from anchor to next item (inputTextBox)
        element = findDomElement(By.xpath(createXPath(1) + "/a"));
        getAuraUITestingUtil().pressTab(element);

        // Verify inputTextBox (in tab section) is focused
        verifyElementFocus("inputTabTitle");

        // Tab to the next focusable area
        element = findDomElement(By.cssSelector("input[class*='inputTabTitle']"));
        getAuraUITestingUtil().pressTab(element);

        // Verify inputTextArea (outside of the tab) is focused
        verifyElementFocus("inputTabContent");
    }
    
    /**
     * Test to navigate from a random tab to the overflow menu using the right arrow and open the overflow
     * menu using the ENTER key
     * Disabled against mobile since tabbing does not make sense on mobile Tabbing with Safari acts oddly.
     * 
     * @throws Exception
     */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE,
            BrowserType.IPAD })
    @Test
    @Flapper
    public void _testOverflowKeyboardInteraction() throws Exception { 	
    	open("/uitest/tabset_Test.cmp?renderItem=overflow");
    	overflowKeyboardNav(5, false, Keys.ARROW_LEFT);
    }
    
    /**
     * Test to navigate from a random tab to the overflow menu using the tab key and open the overflow menu
     * using the UP arrow key
     * Disabled against mobile since tabbing does not make sense on mobile Tabbing with Safari acts oddly.
     * 
     * @throws Exception
     */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE,
        BrowserType.IPAD })
    @Test
    public void testOverflowKeyboardInteractionWithTab() throws Exception { 	
    	open("/uitest/tabset_Test.cmp?renderItem=overflow");
    	overflowKeyboardNav(6, true, Keys.ENTER);
    }

}