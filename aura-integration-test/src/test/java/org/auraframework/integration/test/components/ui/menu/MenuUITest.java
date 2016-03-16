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

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.PerfTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
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
 * @userStory a07B0000000TG3R Excluding the test from IE due to know issue related to mouseOver Excluding it from touch
 * browsers due to to W-1478819 and mouse over related issues
 */
@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX})
public class MenuUITest extends WebDriverTestCase {

    public static final String MENUTEST_APP = "/uitest/menu_Test.app";
    public static final String MENUTEST_ATTACHTOBODY_APP = "/uitest/menu_AttachToBodyTest.app";
    public static final String MENUTEST_METADATA_APP = "/uitest/menu_MetadataTest.app";
    public static final String MENUTEST_EVENTBUBBLING_APP = "/uitest/menu_EventBubbling.app";

    public MenuUITest(String name) {
        super(name);
    }

    /**
     * Test that verify's interaction with Action Menu.
     */
    public void testActionMenu() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "");
    }

    /**
     * Test that verify's interaction with Action Menu with image is trigger link.
     */
    public void testActionMenuWithImageTrigger() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "Image", false);
    }

    public void testActionMenuNestedMenuItems() throws Exception {
        testActionMenuForApp(MENUTEST_APP, "Nested");
    }

    // Test case for W-2181713
    @Flapper
    public void testActionMenuAttachToBodySet() throws Exception {
        testActionMenuForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }

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
        waitForFocusOnMenuActionItem(actionItem3Element);

        assertTrue("Item 2 in the menu List is should be visible on the page", actionItem2.isDisplayed());

        // actionItem2 text starts with the letter F so pressing that key should switch focus to it
        actionItem3Element.sendKeys("f");
        waitForFocusOnMenuActionItem(actionItem2Element);

        // actionItem2 is not clickable as it's disabled via markup
        try {
            actionItem2Element.click();
            // The Firefox used in autobuild environments does not throw an exception. Passes locally on Firefox 42.
            if (getBrowserType() != BrowserType.FIREFOX) {
                fail("Expected exception trying to click an unclickable element");
            }
        } catch (Exception e) {
            checkExceptionContains(e, WebDriverException.class, "Element is not clickable");
        }

        if (verifyLabelUpdate) {
            // click on an item and verify the menu text is updated
            actionItem3Element.click();
            waitForMenuText(menuLabel, "Inter Milan");
        }
    }

    public void testActionMenuWithImageTriggerViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "Image", false);
    }

    public void testActionMenuViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "");
    }

    // Test case for W-2234265
    public void testActionMenuAttachToBodySetViaKeyboardInteraction() throws Exception {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }

    // TODO: W-2406307: remaining Halo test failure
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
        waitForFocusOnMenuActionItem(actionItem1Element);

        actionItem1Element.sendKeys(Keys.DOWN, Keys.DOWN);

        // verify focus on action item3
        getAuraUITestingUtil().setHoverOverElement(menuItem3);
        waitForFocusOnMenuActionItem(actionItem3Element);

        actionItem3Element.click();
        if (verifyLabelUpdate) {
            waitForMenuText(menuLabel, "Inter Milan");
        }

        openMenu(menuLabel, actionMenu);
        getAuraUITestingUtil().setHoverOverElement(menuItem4);
        waitForFocusOnMenuActionItem(actionItem4Element);

        actionItem4Element.sendKeys(Keys.UP);
        // verify focus on action item3
        waitForFocusOnMenuActionItem(actionItem3Element);

        // press space key and check if item3 got selected
        actionItem3Element.sendKeys(Keys.SPACE);
        if (verifyLabelUpdate) {
            waitForMenuText(menuLabel, "Inter Milan");
        }

        openMenu(menuLabel, actionMenu);
        getAuraUITestingUtil().setHoverOverElement(menuItem1);
        waitForFocusOnMenuActionItem(actionItem1Element);
        actionItem1Element.sendKeys(Keys.ESCAPE);
        waitForMenuClose(actionMenu);
    }

    @PerfTest
    // Timing issue on firefox when trying to click on non clickable element
    @ExcludeBrowsers({BrowserType.FIREFOX})
    public void testCheckboxMenu() throws Exception {
        testMenuCheckboxForApp(MENUTEST_APP);
    }

    // Timing issue on firefox when trying to click on non clickable element
    @ExcludeBrowsers({BrowserType.FIREFOX})
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
        String globalIdItem3 = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(menuItem3);
        String globalIdItem4 = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(menuItem4);
        String disableValueM4Exp = getAuraUITestingUtil().getValueFromCmpExpression(globalIdItem4, "v.disabled");
        String selectedValueM4Exp = getAuraUITestingUtil().getValueFromCmpExpression(globalIdItem4, "v.selected");
        String selectedValueM3Exp = getAuraUITestingUtil().getValueFromCmpExpression(globalIdItem3, "v.selected");
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
        assertTrue("Item4 should be disabled", (Boolean) getAuraUITestingUtil().getEval(disableValueM4Exp));
        assertTrue("Item4 should be selected", (Boolean) getAuraUITestingUtil().getEval(selectedValueM4Exp));

        // item4Element is not clickable as it's disabled via markup
        try {
            item4Element.click();
            fail("Expected exception trying to click an unclickable element");
        } catch (Exception e) {
            checkExceptionContains(e, WebDriverException.class, "Element is not clickable");
        }

        assertTrue("Item4 aria attribute should be Selected even when clicked",
            Boolean.valueOf(item4Element.getAttribute("aria-checked")));
        assertTrue("Item4 should be Selected even when clicked",
            (Boolean) getAuraUITestingUtil().getEval(selectedValueM4Exp));

        assertFalse("default: Item3 aria attribute should be Unchecked",
            Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertFalse("default: Item3 should be Unchecked", (Boolean) getAuraUITestingUtil().getEval(selectedValueM3Exp));

        // click on item3
        item3Element.click();
        assertTrue("Item3 aria attribute should be Selected after the click",
            Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertTrue("Item3 should be Selected after the click", (Boolean) getAuraUITestingUtil().getEval(selectedValueM3Exp));

        // click on item3 again
        // Keys.Enter does not work with chrome v40.0.2214.91
        item3Element.sendKeys(Keys.SPACE);
        // verify not selected
        assertFalse("Item3 aria attribute should be Uncheked after Pressing Enter",
            Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertFalse("Item3 should be Uncheked after Pressing Enter",
            (Boolean) getAuraUITestingUtil().getEval(selectedValueM3Exp));

        item3Element.sendKeys(Keys.SPACE);
        assertTrue("Item3 aria attribute should be checked after Pressing Space",
            Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertTrue("Item3 should be checked after Pressing Space",
            (Boolean) getAuraUITestingUtil().getEval(selectedValueM3Exp));

        // check if focus changes when you use up and down arrow using keyboard
        item3Element.sendKeys(Keys.DOWN);
        waitForFocusOnMenuActionItem(item4Element);
        item4Element.sendKeys(Keys.UP);
        waitForFocusOnMenuActionItem(item3Element);

        // press Tab to close to menu
        item3Element.sendKeys(Keys.TAB);
        waitForMenuClose(menu);

        // click on submit button and verify the results
        assertEquals("label value should not get updated", "NFC West Teams", menuLabel.getText());
        button.click();
        waitForElementTextPresent(result, "St. Louis Rams,Arizona Cardinals");
    }

    // W-2721266 : disable this test because it's a flapper.
    public void _testMenuRadio() throws Exception {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String label = "radioMenuLabel";
        String menuName = "radioMenu";
        String menuItem3 = "radioItem3";
        String menuItem4 = "radioItem4";
        String menuItem5 = "radioItem5";
        String disableValueM4Exp = getAuraUITestingUtil().getValueFromCmpRootExpression(menuItem4, "v.disabled");
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
        menuLabel.click();
        // verify menu list is visible
        assertTrue("CheckboxMenu list should be visible", menu.getAttribute("class").contains("visible"));
        item3.click();
        // verify item3 got selected
        assertTrue("Item3 should be selected after the click", item3Element.getAttribute("class").contains("selected"));

        // send key to go to item 4 using 'd'
        item3Element.sendKeys("d");
        // verify focus on item 4
        assertEquals("Focus should be on item4 after the search", item4Element.getText(),
            getAuraUITestingUtil().getActiveElementText());
        // verify item is disabled
        assertTrue("Item4 aria attribute should be defaulted to disable",
            Boolean.valueOf(item4Element.getAttribute("aria-disabled")));
        assertTrue("Item4 should be defaulted to disable", (Boolean) getAuraUITestingUtil().getEval(disableValueM4Exp));

        // click on item4
        item4Element.click();
        // verify item4 should not be selectable
        assertFalse("Item4 should not be selectable as its disable item",
            item4Element.getAttribute("class").contains("selected"));
        // goto item 5 using down arrow
        item4Element.sendKeys(Keys.DOWN);
        // verify focus on item 5
        assertEquals("Focus should be on item5 after pressing down key", item5Element.getText(),
            getAuraUITestingUtil().getActiveElementText());
        // click on item 5 using space
        item5Element.sendKeys(Keys.SPACE);
        assertTrue("Item5 should be checked after pressing Space",
            item5Element.getAttribute("class").contains("selected"));
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
    @UnAdaptableTest
    public void testMenuPositionWhenMenuItemAttachToBody() throws Exception {
        open(MENUTEST_ATTACHTOBODY_APP);

        // Verify menulist and trigger are properly aligned
        String menuItem3 = "actionItemAttachToBody3";
        WebDriver driver = this.getDriver();
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);
        // Need to make the screen bigger so WebDriver doesn't need to scroll
        driver.manage().window().setSize(new Dimension(1366, 768));
        waitForWindowResize(1366, 768);
        String trigger = "triggerAttachToBody";
        String menuList = "actionMenuAttachToBody";
        String triggerGlobalId = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(trigger);
        String menuListGlobalId = getAuraUITestingUtil().getCmpGlobalIdGivenElementClassName(menuList);
        WebElement menuLabel = driver.findElement(By.className(trigger));
        WebElement menu = driver.findElement(By.className(menuList));
        openMenu(menuLabel, menu);
        waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
            "Menu List is not positioned correctly when the menuList rendered on the page");

        // Select menu item and verify still aligned
        String triggerLeftPosBeforeClick = getAuraUITestingUtil().getBoundingRectPropOfElement(triggerGlobalId, "left");
        actionItem3Element.click();
        String triggerLeftPosAfterClickOnItem2 = getAuraUITestingUtil()
            .getBoundingRectPropOfElement(triggerGlobalId, "left");
        assertEquals("Menu Item position changed after clicking on Item2", triggerLeftPosBeforeClick,
            triggerLeftPosAfterClickOnItem2);

        // Resize window with menulist open and verify realigns properly
        openMenu(menuLabel, menu);
        int newWidth = driver.manage().window().getSize().width - 200;
        int newHeight = driver.manage().window().getSize().height - 100;
        driver.manage().window().setSize(new Dimension(newWidth, newHeight));
        waitForWindowResize(newWidth, newHeight);
        waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
            "Menu List is not positioned correctly after the resize");
    }

    private WebElement getAnchor(WebElement element) {
        return element.findElement(By.tagName("a"));
    }

    /**
     * Wait for the current window to have expected dimensions.
     *
     * @param width  Expected width of the current window.
     * @param height Expected height of the current window.
     */
    private void waitForWindowResize(final int width, final int height) {
        getAuraUITestingUtil().waitUntil(check -> {
            Dimension current = getDriver().manage().window().getSize();
            return current.width == width && current.height == height;
        });
    }

    /**
     * Verify horizontal alignment of menuItem
     */
    private void waitForMenuPositionedCorrectly(final String trigger, final String menuList, String failureMessage) {
        getAuraUITestingUtil().waitUntilWithCallback(
            check -> {
                String triggerLeftPos = getAuraUITestingUtil().getBoundingRectPropOfElement(trigger, "left");
                String menuListLeftPos = getAuraUITestingUtil().getBoundingRectPropOfElement(menuList, "left");
                return triggerLeftPos.equals(menuListLeftPos);
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
        waitForFocusOnMenuActionItem(actionItem3Element);

        // use send key("f") to move to actionItem2
        actionItem3Element.sendKeys("f");
        waitForFocusOnMenuActionItem(actionItem2Element);
    }

    /**
     * Test case to allow bubbling of event with menu Bug: W-2368359
     */
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
     * Open the menu and wait for it to have the visible class.
     *
     * @param menuLabel  The WebElement to click on that opens the menu
     * @param actionMenu The WebElement on which to wait for the visible class to be present
     */
    private void openMenu(WebElement menuLabel, WebElement actionMenu) {
        menuLabel.click();
        waitForMenuOpen(actionMenu);
    }

    /**
     * Wait for the visible class to be present on the menu list.
     *
     * @param actionMenu The WebElement on which to wait for the visible class to be present
     */
    private void waitForMenuOpen(final WebElement actionMenu) {
        getAuraUITestingUtil().waitUntil(check -> {
            return actionMenu.getAttribute("class").contains("visible");
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
     * @param actionItemElement The WebElement on which to wait for focus
     */
    private void waitForFocusOnMenuActionItem(final WebElement actionItemElement) {
        String text = actionItemElement.toString();
        getAuraUITestingUtil().waitUntil(check -> {
            String actionItemText = actionItemElement.getText();
            String activeElementText = getAuraUITestingUtil().getActiveElementText();
            return actionItemText.equals(activeElementText);
        }, "Focus hasn't switched to WebElement <" + text + ">");
    }

    /**
     * Wait for the menu label to display a certain text.
     *
     * @param menuLabel    The WebElement on which to verify the text on
     * @param expectedText The expected text
     */
    private void waitForMenuText(final WebElement menuLabel, final String expectedText) {
        getAuraUITestingUtil().waitUntil(check -> {
            return menuLabel.getText().equals(expectedText);
        }, "Menu text not updated after clicking menu item");
    }

}
