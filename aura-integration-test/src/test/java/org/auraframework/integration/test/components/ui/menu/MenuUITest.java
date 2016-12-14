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
package org.auraframework.integration.test.components.ui.menu;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.PerfTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

/**
 * UI automation to verify Action, checkbox and radio Menu using mouse and keyboard interaction .
 *
 * @userStory a07B0000000TG3R Excluding some tests from IE due to know issue related to mouseOver
 * Excluding it from touch browsers due to to W-1478819 and mouse over related issues
 */
@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX, BrowserType.IE11})
public class MenuUITest extends WebDriverTestCase {

    private static final String MENUTEST_APP = "/uitest/menu_Test.app";
    private static final String MENUTEST_ATTACHTOBODY_APP = "/uitest/menu_AttachToBodyTest.app";
    private static final String MENUTEST_METADATA_APP = "/uitest/menu_MetadataTest.app";
    private static final String MENUTEST_EVENTBUBBLING_APP = "/uitest/menu_EventBubbling.app";

    /**
     * Test that verify's interaction with Action Menu.
     */
    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenu() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "");
    }

    /**
     * Test that verify's interaction with Action Menu with image is trigger link.
     */
    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuWithImageTrigger() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "Image", false);
    }

    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuNestedMenuItems() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "Nested");
    }

    // Test case for W-2181713
/*    @Flapper
    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuAttachToBodySet() throws Exception {
        testActionMenuForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }*/

    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuGeneratedFromMetaData() throws Exception {
        testActionMenuForApp(MENUTEST_METADATA_APP, "");
    }

    private void testActionMenuForApp(String appName, String appendId) throws Exception {
        testActionMenuForApp(appName, appendId, true);
    }

    private void testActionMenuForApp(String appName, String appendId, boolean verifyLabelUpdate) throws Exception {
        open(appName);
        WebDriver driver = this.getDriver();
        String label = "trigger" + appendId;
        String menuName = "actionMenu" + appendId;
        String menuItem2 = "actionItem2" + appendId;
        String menuItem3 = "actionItem3" + appendId;
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        WebElement actionItem2 = driver.findElement(By.className(menuItem2));
        WebElement actionItem2Element = getAnchor(actionItem2);
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);

        // check menu list is not visible
        assertFalse("Menu list should not be visible", actionMenu.getAttribute("class").contains("visible"));

        openMenu(menuLabel, actionMenu);

        getAuraUITestingUtil().setHoverOverElement(menuItem3);
        waitForFocusOnElement(actionItem3Element);

        assertTrue("'Item 2' in the menu menu list should be visible on the page", actionItem2.isDisplayed());

        // actionItem2 text starts with the letter F so pressing that key should switch focus to it
        actionItem3Element.sendKeys("f");
        waitForFocusOnElement(actionItem2Element);

        // actionItem2 is not clickable as it's disabled via markup
        tryToClickDisabledElm(actionItem2Element);

        if (verifyLabelUpdate) {
            // click on an item and verify the menu text is updated
            actionItem3Element.click();
            waitForMenuText(menuLabel, "Inter Milan");
        }
    }

    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuWithImageTriggerViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "Image", false);
    }

    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "");
    }

    // Test case for W-2234265
    /*@Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testActionMenuAttachToBodySetViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }*/

    @Test
    public void testOpenMenuViaKeyboardDownKey() throws Exception {
    	openMenuViaKeyboardAndTestActionMenu(MENUTEST_APP, Keys.DOWN, "actionItem1", "actionItem2");
    }
    
    @Test
    public void testOpenMenuViaKeyboardSpace() throws Exception {
    	openMenuViaKeyboardAndTestActionMenu(MENUTEST_APP, Keys.SPACE, "trigger", "actionItem1");
    }

    /**
     * Test type ahead by typing a single letter
     */
    @Test
    public void testFocusAfterTypeAheadSingleChar() throws Exception {
        testFocusAfterKeysPressed(MENUTEST_APP, "a", "typeAheadMenu", "menuItem2");
    }

    /**
     * Test type ahead allows using multiple characters to jump to more specific item
     */
    @Test
    public void testFocusAfterTypeAheadMultipleChars() throws Exception {
        testFocusAfterKeysPressed(MENUTEST_APP, "se", "typeAheadMenu", "menuItem4");
    }

    /**
     * Test type ahead should also jump to disabled item
     */
    @Test
    public void testFocusAfterTypeAheadToDisabledItem() throws Exception {
        testFocusAfterKeysPressed(MENUTEST_APP, "l", "typeAheadMenu", "menuItem3");
    }
    
    /**
     * Test type ahead only opens menu when there's no matched item
     */
    @Test
    public void testFocusAfterTypeAheadOnNonexistentItem() throws Exception {
        testFocusAfterKeysPressed(MENUTEST_APP, "b", "typeAheadMenu", "menuTrigger");
    }

    private void testFocusAfterKeysPressed(String appName, CharSequence keys,
            String menuClassName, String expectedFocusedItemClassName) throws Exception {
        open(appName);
        WebDriver driver = this.getDriver();
        WebElement menu = driver.findElement(By.className(menuClassName));
        WebElement menuLabel = menu.findElement(By.className("menuTrigger"));
        WebElement menuList = menu.findElement(By.className("menuList"));
        WebElement expectedFocusedItem = menu.findElement(By.className(expectedFocusedItemClassName));

        openMenu(menuLabel, menuList, keys);
        waitForFocusOnElement(expectedFocusedItem);
    }
    
    // TODO: W-2406307: remaining Halo test failure
    @ExcludeBrowsers({BrowserType.IE11})
    public void _testActionMenuGeneratedFromMetaDataViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_METADATA_APP, "");
    }

    private void testActionMenuViaKeyboardInteractionForApp(String appName, String appendString) throws Exception {
        testActionMenuViaKeyboardInteractionForApp(appName, appendString, true);
    }

    private void testActionMenuViaKeyboardInteractionForApp(String appName, String appendString,
        boolean verifyLabelUpdate) throws Exception {
        open(appName);
        WebDriver driver = this.getDriver();
        String label = "trigger" + appendString;
        String menuName = "actionMenu" + appendString;
        String menuItem1 = "actionItem1" + appendString;
        String menuItem3 = "actionItem3" + appendString;
        String menuItem4 = "actionItem4" + appendString;
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        WebElement actionItem1 = driver.findElement(By.className(menuItem1));
        WebElement actionItem1Element = getAnchor(actionItem1);
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);
        WebElement actionItem4 = driver.findElement(By.className(menuItem4));
        WebElement actionItem4Element = getAnchor(actionItem4);

        openMenu(menuLabel, actionMenu);

        // default focus on trigger
        assertEquals("Focus should be on the trigger", menuLabel.getText(), getAuraUITestingUtil().getActiveElementText());

        // press down key once
        menuLabel.sendKeys(Keys.DOWN);

        // focus should be one the first item
        waitForFocusOnElement(actionItem1Element);

        actionItem1Element.sendKeys(Keys.DOWN, Keys.DOWN);

        // verify focus on action item3
        getAuraUITestingUtil().setHoverOverElement(menuItem3);
        waitForFocusOnElement(actionItem3Element);

        actionItem3Element.click();
        if (verifyLabelUpdate) {
            waitForMenuText(menuLabel, "Inter Milan");
        }

        openMenu(menuLabel, actionMenu);
        getAuraUITestingUtil().setHoverOverElement(menuItem4);
        waitForFocusOnElement(actionItem4Element);

        actionItem4Element.sendKeys(Keys.UP);
        // verify focus on action item3
        waitForFocusOnElement(actionItem3Element);

        // press space key and check if item3 got selected
        actionItem3Element.sendKeys(Keys.SPACE);
        if (verifyLabelUpdate) {
            waitForMenuText(menuLabel, "Inter Milan");
        }

        openMenu(menuLabel, actionMenu);
        getAuraUITestingUtil().setHoverOverElement(menuItem1);
        waitForFocusOnElement(actionItem1Element);
        actionItem1Element.sendKeys(Keys.ESCAPE);
        waitForMenuClose(actionMenu);
    }
    
    private void openMenuViaKeyboardAndTestActionMenu(String appName, Keys openKey, String focusAfterOpen,
        String itemExpected) throws Exception{
	     
    	open(appName);
    	
    	WebDriver driver = this.getDriver();
        WebElement menuLabel = driver.findElement(By.className("trigger"));
        WebElement actionMenu = driver.findElement(By.className("actionMenu"));
        WebElement focusAfterOpenItem = driver.findElement(By.className(focusAfterOpen));
        WebElement focusAfterOpenElement;
        WebElement expectedItem = driver.findElement(By.className(itemExpected));
        WebElement expectedItemElement = getAnchor(expectedItem);
          
        // opening menu using keyboard return or space - focus would remain on the trigger
        if("trigger".equals(focusAfterOpen)) {
        	focusAfterOpenElement = menuLabel;
        	openMenu(menuLabel, actionMenu, openKey);
        	assertEquals("Focus should be on the trigger", menuLabel.getText(), getAuraUITestingUtil().getActiveElementText());
        }
        
        // opening menu using keyboard interaction down button - focus should be on 1st element
        else {
        	focusAfterOpenElement = getAnchor(focusAfterOpenItem);
            openMenu(menuLabel, actionMenu, openKey);
            waitForFocusOnElement(focusAfterOpenElement);
        }

        focusAfterOpenElement.sendKeys(Keys.DOWN);
        waitForFocusOnElement(expectedItemElement);
    }

    @PerfTest
    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testCheckboxMenu() throws Exception {
        testMenuCheckboxForApp(MENUTEST_APP);
    }

    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testCheckboxMenuGeneratedFromMetaData() throws Exception {
        testMenuCheckboxForApp(MENUTEST_METADATA_APP);
    }

    private void testMenuCheckboxForApp(String appName) throws Exception {
        open(appName);
        WebDriver driver = this.getDriver();
        String label = "checkboxMenuLabel";
        String menuName = "checkboxMenu";
        String menuItem3 = "checkboxItem3";
        String menuItem4 = "checkboxItem4";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        WebElement button = driver.findElement(By.className("checkboxButton"));
        WebElement result = driver.findElement(By.className("checkboxMenuResult"));

        // check for default label present
        assertEquals("label is wrong", "NFC West Teams", menuLabel.getText());
        assertFalse("Default: CheckboxMenu list should not be visible", menu.getAttribute("class").contains("visible"));

        openMenu(menuLabel, menu);

        WebElement item3 = driver.findElement(By.className(menuItem3));
        WebElement item3Element = getAnchor(item3);
        WebElement item4 = driver.findElement(By.className(menuItem4));
        WebElement item4Element = getAnchor(item4);

        // verify aria attribute item4 which is used for accessibility is disabled and selected
        assertTrue("Item4 aria attribute should be disabled",
            Boolean.valueOf(item4Element.getAttribute("aria-disabled")));
        assertTrue("Item4 aria attribute should be selected",
            Boolean.valueOf(item4Element.getAttribute("aria-checked")));

        // verify item4 is disabled and selected
        assertTrue("Item4 should be disabled", getCmpBoolAttribute(menuItem4, "v.disabled"));
        assertTrue("Item4 should be selected", getCmpBoolAttribute(menuItem4, "v.selected"));

        // item4Element is not clickable as it's disabled via markup
        tryToClickDisabledElm(item4Element);

        assertTrue("Item4 aria attribute should be Selected even when clicked",
            Boolean.valueOf(item4Element.getAttribute("aria-checked")));
        assertTrue("Item4 should be Selected even when clicked",
            getCmpBoolAttribute(menuItem4, "v.selected"));

        assertFalse("default: Item3 aria attribute should be Unchecked",
            Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertFalse("default: Item3 should be Unchecked",
            getCmpBoolAttribute(menuItem3, "v.selected"));

        // check item3 with click
        item3Element.click();
        getAuraUITestingUtil().waitUntil(check -> Boolean.valueOf(item3Element.getAttribute("aria-checked")), "Item3 aria attribute should be checked after the click");
        assertTrue("Item3 v.selected should be true after the click",
            getCmpBoolAttribute(menuItem3, "v.selected"));

        // uncheck item3 with ENTER key
        item3Element.sendKeys(Keys.ENTER);
        getAuraUITestingUtil().waitUntil(check -> !Boolean.valueOf(item3Element.getAttribute("aria-checked")), "Item3 aria attribute should be uncheked after pressing ENTER");
        assertFalse("Item3 v.selected should be false after pressing ENTER",
            getCmpBoolAttribute(menuItem3, "v.selected"));

        // check item3 with SPACE key
        item3Element.sendKeys(Keys.SPACE);
        getAuraUITestingUtil().waitUntil(check -> Boolean.valueOf(item3Element.getAttribute("aria-checked")), "Item3 aria attribute should be checked after pressing SPACE");
        assertTrue("Item3 v.selected should be true after pressing SPACE",
            getCmpBoolAttribute(menuItem3, "v.selected"));
        
        // check if focus changes when you use up and down arrow using keyboard
        item3Element.sendKeys(Keys.DOWN);
        waitForFocusOnElement(item4Element);
        item4Element.sendKeys(Keys.UP);
        waitForFocusOnElement(item3Element);

        // press Tab to close to menu
        item3Element.sendKeys(Keys.TAB);
        waitForMenuClose(menu);

        // click on submit button and verify the results
        assertEquals("label value should not get updated", "NFC West Teams", menuLabel.getText());
        button.click();
        waitForElementTextPresent(result, "St. Louis Rams,Arizona Cardinals");
    }

    @ExcludeBrowsers({BrowserType.IE11})
    public void testMenuRadio() throws Exception {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String label = "radioMenuLabel";
        String menuName = "radioMenu";
        String menuItem3 = "radioItem3";
        String menuItem4 = "radioItem4";
        String menuItem5 = "radioItem5";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        WebElement item3 = driver.findElement(By.className(menuItem3));
        WebElement item3Element = getAnchor(item3);
        WebElement item4 = driver.findElement(By.className(menuItem4));
        WebElement item4Element = getAnchor(item4);
        WebElement item5 = driver.findElement(By.className(menuItem5));
        WebElement item5Element = getAnchor(item5);
        WebElement button = driver.findElement(By.className("radioButton"));
        WebElement result = driver.findElement(By.className("radioMenuResult"));

        // check for default label present
        assertEquals("label is wrong", "National League West", menuLabel.getText());
        assertFalse("Default: CheckboxMenu list should not be visible", menu.getAttribute("class").contains("visible"));

        // open menu list
        openMenu(menuLabel, menu);
        
        // click and verify item3 got selected
        item3Element.click();
        getAuraUITestingUtil().waitUntil(check -> item3Element.getAttribute("class").contains("selected"), "Item3 should be selected after the click");

        // send key to go to item 4 using 'd'
        item3Element.sendKeys("d");
        waitForFocusOnElement(item4Element);

        // verify item is disabled
        assertTrue("Item4 aria attribute should be defaulted to disable",
            Boolean.valueOf(item4Element.getAttribute("aria-disabled")));
        assertTrue("Item4 v.disabled should default to true",
            getCmpBoolAttribute(menuItem4, "v.disabled"));

        // click on item4 and verify item4 should not be selectable
        tryToClickDisabledElm(item4Element);
        assertFalse("Item4 should not be selectable as it's disable item",
            item4Element.getAttribute("class").contains("selected"));
        
        // goto item 5 using down arrow and check focus
        item4Element.sendKeys(Keys.DOWN);
        waitForFocusOnElement(item5Element);

        // click on item 5 using space
        item5Element.sendKeys(Keys.SPACE);
        getAuraUITestingUtil().waitUntil(check -> item5Element.getAttribute("class").contains("selected"), "Item5 should be checked after pressing Space");

        assertFalse("Item3 should be unchecked after clicking item 5",
            item3Element.getAttribute("class").contains("selected"));

        // close the menu using esc key
        item5Element.sendKeys(Keys.ESCAPE);

        // check the result
        button.click();
        assertEquals("Checkbox items selected are not correct", "Colorado", result.getText());
    }

    /**
     * Test case for W-1575100
     */
    @Test
    public void testMenuExpandCollapse() throws Exception {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        WebElement button = driver.findElement(By.className("radioButton"));

        assertFalse("Action Menu list should not be visible", menu.getAttribute("class").contains("visible"));
        openMenu(menuLabel, menu);
        button.click();
        waitForMenuClose(menu);
    }

    /**
     * Test case : W-2235117 menuItem should reposition itself relative to its trigger when attachToBody attribute is
     * set
     */
    // For env reason the test is failing on Luna Autobuild, will run the test on jenkins only for now.
    //
    // W-3140286
    @UnAdaptableTest
    @Flapper
    @Test
    public void testMenuPositionWhenMenuItemAttachToBody() throws Exception {
        open(MENUTEST_ATTACHTOBODY_APP);
        WebDriver driver = this.getDriver();

        // save current dimension and reset it after test finishes
        // if not chrome would remember the size we set here and
        // that would affect other tests
        Dimension originalDimension = getDriver().manage().window().getSize();
        
        // dimensions for testing
        Dimension initialDimension = new Dimension(800, 600);
        Dimension newDimension = new Dimension(600, 500);

        // elements
        String menuItem3 = "actionItemAttachToBody3";
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);

        String trigger = "triggerAttachToBody";
        String menuList = "actionMenuAttachToBody";
        String triggerGlobalId = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(trigger);
        String menuListGlobalId = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(menuList);
        WebElement menuLabel = driver.findElement(By.className(trigger));
        WebElement menu = driver.findElement(By.className(menuList));

        try {
            // set initial size to make sure we have room to resize later
            driver.manage().window().setSize(initialDimension);
            waitForWindowResize(initialDimension);

            // Verify menulist and trigger are properly aligned
            openMenu(menuLabel, menu);
            waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
                "Menu List is not positioned correctly when the menuList rendered on the page");

            // Select menu item and verify still aligned
            String triggerLeftPosBeforeClick = getAuraUITestingUtil()
                    .getBoundingRectPropOfElement(triggerGlobalId, "left");

            actionItem3Element.click();
            waitForMenuText(menuLabel, "Inter Milan");

            String triggerLeftPosAfterClick = getAuraUITestingUtil()
                    .getBoundingRectPropOfElement(triggerGlobalId, "left");

            assertEquals("Menu Item position changed after clicking on Item3",
                    triggerLeftPosBeforeClick, triggerLeftPosAfterClick);

            // Resize window with menulist open and verify realigns properly
            openMenu(menuLabel, menu);
            driver.manage().window().setSize(newDimension);
            waitForWindowResize(newDimension);
            waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
                    "Menu List is not positioned correctly after the resize");
        } finally {
            // always reset size for other tests
            driver.manage().window().setSize(originalDimension);
            waitForWindowResize(originalDimension);
        }
    }

    private WebElement getAnchor(WebElement element) {
        return element.findElement(By.tagName("a"));
    }

    /**
     * Wait for the current window to have expected dimensions.
     */
    private void waitForWindowResize(final Dimension newDimension) {
        getAuraUITestingUtil().waitUntilWithCallback(
            check -> {
                Dimension current = getDriver().manage().window().getSize();
                return current.equals(newDimension);
            }, check -> {
                Dimension current = getDriver().manage().window().getSize();
                return "Current window dimension is {width: " + current.width + ", height: " + current.height + "}";
            },
            getAuraUITestingUtil().getTimeout(),
            "Window size is not resized correctly");
    }

    /**
     * Verify horizontal alignment of menuItem
     */
    private void waitForMenuPositionedCorrectly(final String trigger, final String menuList, String failureMessage) {
        getAuraUITestingUtil().waitUntilWithCallback(
            check -> {
                double triggerLeftPos = Double.valueOf(getAuraUITestingUtil().getBoundingRectPropOfElement(trigger, "left"));
                double menuListLeftPos = Double.valueOf(getAuraUITestingUtil().getBoundingRectPropOfElement(menuList, "left"));
                return Math.floor(triggerLeftPos) == Math.floor(menuListLeftPos);
            }, check -> {
                String triggerLeftPos = getAuraUITestingUtil().getBoundingRectPropOfElement(trigger, "left");
                String menuListLeftPos = getAuraUITestingUtil().getBoundingRectPropOfElement(menuList, "left");
                return "Trigger left position is <" + triggerLeftPos + "> and menu list left position is <"
                    + menuListLeftPos + ">";
            },
            getAuraUITestingUtil().getTimeout(),
            failureMessage);
    }

    /*
     * Test case for: W-1559070
     */
    @Test
    public void testRemovingMenuDoesNotThrowJsError() throws Exception {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String uiMenuClassName = "clubMenu";
        String uiMenuLocalId = "uiMenu";
        WebElement menuLabel = driver.findElement(By.className(uiMenuClassName));
        assertTrue("UiMenu should be present on the page", menuLabel.isDisplayed());

        // For W-1540590
        assertEquals("ui:menu's wrapper element should be div", "div", menuLabel.getTagName());
        String uiMenu = getAuraUITestingUtil().getFindAtRootExpr(uiMenuLocalId);
        getAuraUITestingUtil().getEval("$A.unrender(" + uiMenu + ")");
        assertFalse("UiMenu should not be present after unrender", isElementPresent(By.className(uiMenuClassName)));
    }

    /**
     * Test case to check double clicking on Menu Trigger link component within 350ms with disableDoubleClicks attribute
     * set disregards the 2nd click. Test case for W-1855568
     */
    @Test
    public void testDoubleClickOnMenuTrigger() throws Exception {
        open(MENUTEST_APP);
        String label = "doubleClick";
        String menuName = "doubleClickDisabledMenuList";
        WebDriver driver = this.getDriver();
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        Actions a = new Actions(driver);
        a.doubleClick(menuLabel).build().perform();
        waitForMenuOpen(menu);
    }

    /**
     * Test case for W-2315592 Components extends menuItem get's focus
     */
    @Test
    @ExcludeBrowsers({BrowserType.IE11})
    public void testFocusForExtendedMenuItem() throws Exception {
        open("/uitest/menu_extendMenuItem.app");
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        String menuItem2 = "actionItem2";
        String menuItem3 = "actionItem3";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        WebElement actionItem2 = driver.findElement(By.className(menuItem2));
        WebElement actionItem2Element = getAnchor(actionItem2);
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);

        openMenu(menuLabel, actionMenu);

        assertEquals("Focus should be on the trigger", menuLabel.getText(), getAuraUITestingUtil().getActiveElementText());

        // verify focus on action item3
        getAuraUITestingUtil().setHoverOverElement(menuItem3);
        waitForFocusOnElement(actionItem3Element);

        // use send key("f") to move to actionItem2
        actionItem3Element.sendKeys("f");
        waitForFocusOnElement(actionItem2Element);
    }

    /**
     * Test case to allow bubbling of event with menu Bug: W-2368359
     */
    @Test
    public void testStopClickPropagationByDefault() throws Exception {
        open(MENUTEST_EVENTBUBBLING_APP);
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        String valueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.eventBubbled");
        valueExpression = getAuraUITestingUtil().prepareReturnStatement(valueExpression);
        assertNull("Event should not bubble up to parent div", getAuraUITestingUtil().getEval(valueExpression));
        openMenu(menuLabel, actionMenu);
        assertTrue("Event should get bubble up to parent div", getAuraUITestingUtil().getBooleanEval(valueExpression));
    }

    /**
     * Test case to Stop bubbling of event when StopClickPropogoation attribute is set Bug: W-2368359
     */
    @Test
    public void testStopClickPropagationIsSet() throws Exception {
        open(MENUTEST_EVENTBUBBLING_APP + "?stopClickPropagation=true");
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        String valueExpression = getAuraUITestingUtil().getValueFromRootExpr("v.eventBubbled");
        valueExpression = getAuraUITestingUtil().prepareReturnStatement(valueExpression);
        assertNull("Event should not bubble up to parent div", getAuraUITestingUtil().getEval(valueExpression));
        openMenu(menuLabel, actionMenu);
        assertNull("Event should not bubble up to parent div when StopPropogoation is set on menu",
            getAuraUITestingUtil().getEval(valueExpression));
    }
    
    /**
     * Test case for W-2958313 to check focus after tabbing out of menu
     */
    @Test
    public void testFocusWhenTabOnOpenMenu() throws Exception {
        open(MENUTEST_APP);
        String nextFocusableElmClassName = "checkboxMenuLabel";
        verifyFocusOnTabOnOpenMenu(nextFocusableElmClassName);
    }

    /**
     * Tabbing out of open menu should close menu and focuses on next DOM element
     * Bug: W-3197504
     */
/*
    @Test
    public void testFocusWhenTabOnOpenMenuWithAttachToBodySet() throws Exception {
        open(MENUTEST_ATTACHTOBODY_APP);
        String nextFocusableElmClassName = "triggerAttachToBody";
        verifyFocusOnTabOnOpenMenu(nextFocusableElmClassName);
    }
*/

    private void verifyFocusOnTabOnOpenMenu(String nextFocusableElmClassName) {
    	WebDriver driver = this.getDriver();
        WebElement menuElm = driver.findElement(By.className("actionMenu"));
        WebElement item1Elm = driver.findElement(By.className("actionItem1"));
        WebElement triggerElm = driver.findElement(By.className("trigger"));
        WebElement nextFocusableElm = driver.findElement(By.className(nextFocusableElmClassName));

        // open menu and make sure focus is on the trigger label
        openMenu(triggerElm, menuElm);
        waitForFocusOnElement(triggerElm);

        // move the focus to the menuList by moving to the first item
        triggerElm.sendKeys(Keys.DOWN);
        waitForFocusOnElement(item1Elm);

        // tab out to close the menu and check the focus is set to the right element
        if (getBrowserType().equals(BrowserType.FIREFOX)) {
            // firefox closes the menu on the first tab, but the focus is still on the item
            // need a second tab to get to the next element
            getAnchor(item1Elm).sendKeys(Keys.TAB, Keys.TAB);
        } else {
            getAuraUITestingUtil().pressTab(getAnchor(item1Elm));
        }

        waitForFocusOnElement(nextFocusableElm);
	}

	/**
     * Open the menu and wait for it to have the visible class.
     *
     * @param menuLabel  The WebElement to click on that opens the menu
     * @param actionMenu The WebElement on which to wait for the visible class to be present
     */
    private void openMenu(WebElement menuLabel, WebElement actionMenu) {
        if (getBrowserType() == BrowserType.IE11) {
            // on win 7 IE11, for some reason webdriver moves the focus to the
            // last element of the list when activating the menu through click()
            getAuraUITestingUtil().pressEnter(menuLabel);
        } else {
            menuLabel.click();  
        }
        waitForMenuOpen(actionMenu);
    }
    
    /**
     * Open the menu through a keyboard interaction and wait for it to have the visible class.
     *
     * @param menuLabel  The WebElement to click on that opens the menu
     * @param actionMenu The WebElement on which to wait for the visible class to be present
     * @param openKey    The WebDriver key to use that opens the menu
     */
    private void openMenu(WebElement menuLabel, WebElement actionMenu, CharSequence openKey) {
    	menuLabel.sendKeys("");
        menuLabel.sendKeys(openKey);
        waitForMenuOpen(actionMenu);
    }

    /**
     * Wait for the visible class to be present on the menu list.
     *
     * @param menu The WebElement on which to wait for the visible class to be present
     */
    private void waitForMenuOpen(final WebElement menu) {
        getAuraUITestingUtil().waitUntil(check -> {
            String classAttribute = menu.getAttribute("class");
            return classAttribute.contains("visible")
                && classAttribute.contains("positioned");
        }, "Menu list should be visible after clicking to open");
    }

    /**
     * Wait for the visible class to no longer be present on the menu list.
     *
     * @param actionMenu The WebElement on which to wait for the visible class to not be present on
     */
    private void waitForMenuClose(final WebElement actionMenu) {
        getAuraUITestingUtil().waitUntil(check -> !actionMenu.getAttribute("class").contains("visible"), "Menu list never closed");
    }

    /**
     * Wait for focus to be on a certain menu action item by checking the current active element.
     *
     * @param element The WebElement on which to wait for focus
     */
    private void waitForFocusOnElement(final WebElement element) {
        String text = element.toString();
        getAuraUITestingUtil().waitUntil(check -> {
            String elementText = element.getText();
            String activeElementText = getAuraUITestingUtil().getActiveElementText();
            return elementText.equals(activeElementText);
        }, "Focus hasn't switched to WebElement <" + text + ">");
    }

    /**
     * Wait for the menu label to display a certain text.
     *
     * @param menuLabel    The WebElement on which to verify the text on
     * @param expectedText The expected text
     */
    private void waitForMenuText(final WebElement menuLabel, final String expectedText) {
        getAuraUITestingUtil().waitUntil(check -> menuLabel.getText().equals(expectedText), "Menu text not updated after clicking menu item");
    }

    /**
     * Use javascript expression to get component's attribute,
     * such as v.disabled, v.selected, etc.
     */
    private boolean getCmpBoolAttribute(final String cmpClassName, final String attrName) {
        String globalIdItem = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(cmpClassName);
        String jsExp = getAuraUITestingUtil().getValueFromCmpExpression(globalIdItem, attrName);
        return (Boolean) getAuraUITestingUtil().getEval(jsExp);
    }

    /**
     * Helper method to click on a disabled item
     * Non-firebox/IE browsers would throw an exception, so check the exception for those
     * browsers
     */
    private void tryToClickDisabledElm(final WebElement elm) {
        try {
            // The Firefox used in autobuild environments does not throw an exception. Passes locally on Firefox 42.
            // IE11 doesn't throw an exception either
            if (getBrowserType() != BrowserType.FIREFOX && getBrowserType() != BrowserType.IE11) {
                elm.click();
                fail("Expected exception trying to click an unclickable element");
            }
        } catch (Exception e) {
            checkExceptionContains(e, WebDriverException.class, "Element is not clickable");
        }
    }
}
