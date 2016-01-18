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
package org.auraframework.components.ui.menu;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.PerfTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * UI automation to verify Action, checkbox and radio Menu using mouse and keyboard interaction .
 * 
 * @userStory a07B0000000TG3R Excluding the test from IE due to know issue related to mouseOver Excluding it from touch
 *            browsers due to to W-1478819 and mouse over related issues
 */
@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.FIREFOX })
public class MenuUITest extends WebDriverTestCase {

    public static final String MENUTEST_APP = "/uitest/menu_Test.app";
    public static final String MENUTEST_ATTACHTOBODY_APP = "/uitest/menu_AttachToBodyTest.app";
    public static final String MENUTEST_METADATA_APP = "/uitest/menu_MetadataTest.app";
    public static final String MENUTEST_EVENTBUBBLING_APP = "/uitest/menu_EventBubbling.app";

    public MenuUITest(String name) {
        super(name);
    }

    private void testActionMenuForApp(String appName, String appendId) throws MalformedURLException, URISyntaxException {
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

        menuLabel.click();
        // check menu list is visible after the click
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));

        // verify focus on action item3
        auraUITestingUtil.setHoverOverElement(menuItem3);
        assertEquals("Focus should be on actionItem3", actionItem3Element.getText(),
                auraUITestingUtil.getActiveElementText());

        assertTrue("Item 2 in the menu List is should be visible on the page", actionItem2.isDisplayed());

        // use send key("f") to move to actionItem2
        actionItem3Element.sendKeys("f");

        // verify focus on actionItem2
        assertEquals("Focus should be on actionItem 2", actionItem2Element.getText(),
                auraUITestingUtil.getActiveElementText());

        // action item 2 not clickable as its disable item
        boolean disabledItemNotClickable = false;
        try {
            actionItem2Element.click();
        } catch (Exception e) {
            disabledItemNotClickable = true;
        }

        // check that the disabled item is not clickable
        assertTrue("Disabled item should not be clickable", disabledItemNotClickable);

        // click on item 1 and verify click worked
        actionItem3Element.click();
        assertEquals("Item3 not selected", "Inter Milan", menuLabel.getText());
    }

    private void testActionMenuViaKeyboardInteractionForApp(String appName, String appendString)
            throws MalformedURLException,
            URISyntaxException {
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

        // click on menu list
        menuLabel.click();
        // check menu list is visible after the click
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));

        // default focus on action item1
        assertEquals("Focus should be on actionItem1", actionItem1Element.getText(),
                auraUITestingUtil.getActiveElementText());

        // press down key twice
        actionItem1Element.sendKeys(Keys.DOWN, Keys.DOWN);

        // verify focus on action item3
        auraUITestingUtil.setHoverOverElement(menuItem3);
        assertEquals("Focus should be on actionItem3", actionItem3Element.getText(),
                auraUITestingUtil.getActiveElementText());

        actionItem3Element.click();
        assertEquals("Item3 unchecked after pressing Enter key", "Inter Milan", menuLabel.getText());

        menuLabel.click();
        // focus on action item4
        auraUITestingUtil.setHoverOverElement(menuItem4);
        assertEquals("Focus should be on actionItem4", actionItem4Element.getText(),
                auraUITestingUtil.getActiveElementText());

        actionItem4Element.sendKeys(Keys.UP);
        // verify focus on action item3
        assertEquals("Focus should be on actionItem3", actionItem3Element.getText(),
                auraUITestingUtil.getActiveElementText());

        // press space key and check if item3 got selected
        actionItem3Element.sendKeys(Keys.SPACE);
        assertEquals("Item3 not selected after pressing space key", "Inter Milan", menuLabel.getText());

        menuLabel.click();
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));
        auraUITestingUtil.setHoverOverElement(menuItem1);
        actionItem1Element.sendKeys(Keys.ESCAPE);
        assertFalse("Menu list should not be visible", actionMenu.getAttribute("class").contains("visible"));
    }

    /**
     * Test that verify's interaction with Action Menu Excluding Ipad and iphone as hover wont work for touch devices
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testActionMenu() throws MalformedURLException, URISyntaxException {
        testActionMenuForApp(MENUTEST_APP, "");
    }

    /**
     * Test that verify's interaction with Action Menu with image is trigger link Test case: W-2515040 Excluding Ipad
     * and iphone as hover wont work for touch devices
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException Uncomment test once W-2515040 is fixed
     */
    public void _testActionMenuWithImageTrigger() throws MalformedURLException, URISyntaxException {
        testActionMenuForApp(MENUTEST_APP, "Image");
    }

    public void testActionMenuNestedMenuItems() throws MalformedURLException, URISyntaxException {
        testActionMenuForApp(MENUTEST_APP, "Nested");
    }

    /**
     * Uncomment test once W-2515040 is fixed
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void _testActionMenuWithImageTriggerViaKeyboardInteraction() throws MalformedURLException,
            URISyntaxException {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "Image");
    }

    // Test case for W-2181713
    @Flapper
    public void testActionMenuAttachToBodySet() throws MalformedURLException, URISyntaxException {
        testActionMenuForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }

    public void testActionMenuGeneratedFromMetaData() throws MalformedURLException, URISyntaxException {
        testActionMenuForApp(MENUTEST_METADATA_APP, "");
    }

    public void testActionMenuViaKeyboardInteraction() throws MalformedURLException, URISyntaxException {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_APP, "");
    }

    // Test case for W-2234265
    // TODO: Uncomment test once W-2234265 is fixed
    public void testActionMenuAttachToBodySetViaKeyboardInteraction() throws MalformedURLException, URISyntaxException {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_ATTACHTOBODY_APP, "");
    }

    // TODO: W-2406307: remaining Halo test failure
    public void _testActionMenuGeneratedFromMetaDataViaKeyboardInteraction() throws MalformedURLException,
            URISyntaxException {
        testActionMenuViaKeyboardInteractionForApp(MENUTEST_METADATA_APP, "");
    }

    @PerfTest
    //Timing issue on firefox when trying to click on non clickable element
    @ExcludeBrowsers({BrowserType.FIREFOX})
    public void testCheckboxMenu() throws MalformedURLException, URISyntaxException {
        testMenuCheckboxForApp(MENUTEST_APP);
    }
    
    //Timing issue on firefox when trying to click on non clickable element
    @ExcludeBrowsers({BrowserType.FIREFOX})
    public void testCheckboxMenuGeneratedFromMetaData() throws MalformedURLException, URISyntaxException {
        testMenuCheckboxForApp(MENUTEST_METADATA_APP);
    }

    private void testMenuCheckboxForApp(String appName) throws MalformedURLException, URISyntaxException {
        open(appName);
        WebDriver driver = this.getDriver();
        String label = "checkboxMenuLabel";
        String menuName = "checkboxMenu";
        String menuItem3 = "checkboxItem3";
        String menuItem4 = "checkboxItem4";
        String globalIdItem3 = auraUITestingUtil.getCmpGlobalIdGivenElementClassName(menuItem3);
        String globalIdItem4 = auraUITestingUtil.getCmpGlobalIdGivenElementClassName(menuItem4);
        String disableValueM4Exp = auraUITestingUtil.getValueFromCmpExpression(globalIdItem4, "v.disabled");
        String selectedValueM4Exp = auraUITestingUtil.getValueFromCmpExpression(globalIdItem4, "v.selected");
        String selectedValueM3Exp = auraUITestingUtil.getValueFromCmpExpression(globalIdItem3, "v.selected");
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        WebElement item3 = driver.findElement(By.className(menuItem3));
        WebElement item3Element = getAnchor(item3);
        WebElement item4 = driver.findElement(By.className(menuItem4));
        WebElement item4Element = getAnchor(item4);
        WebElement button = driver.findElement(By.className("checkboxButton"));
        WebElement result = driver.findElement(By.className("checkboxMenuResult"));

        // check for default label present
        assertEquals("label is wrong", "NFC West Teams", menuLabel.getText());
        assertFalse("Default: CheckboxMenu list should not be visible", menu.getAttribute("class").contains("visible"));

        // click on label
        menuLabel.click();

        // verify menu list is visible
        assertTrue("CheckboxMenu list should be visible", menu.getAttribute("class").contains("visible"));

        // verify aria attribute item4 which is used for accessibility is disabled and selected
        assertTrue("Item4 aria attribute should be disabled",
                Boolean.valueOf(item4Element.getAttribute("aria-disabled")));
        assertTrue("Item4 aria attribute should be selected",
                Boolean.valueOf(item4Element.getAttribute("aria-checked")));

        // verify item4 is disabled and selected

        assertTrue("Item4 should be disabled", (Boolean) auraUITestingUtil.getEval(disableValueM4Exp));
        assertTrue("Item4 should be selected", (Boolean) auraUITestingUtil.getEval(selectedValueM4Exp));

        // click on item4
        //flapper in firefox
        boolean disabledItemNotClickable = false;
        try {
        	item4Element.click();
        } catch (Exception e) {
            disabledItemNotClickable = true;
        }
        assertTrue("Item4 should not be clickable", disabledItemNotClickable);
        assertTrue("Item4 aria attribute should be Selected even when clicked",
                Boolean.valueOf(item4Element.getAttribute("aria-checked")));
        assertTrue("Item4 should be Selected even when clicked",
                (Boolean) auraUITestingUtil.getEval(selectedValueM4Exp));

        assertFalse("default: Item3 aria attribute should be Uncheked",
                Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertFalse("default: Item3 should be Uncheked", (Boolean) auraUITestingUtil.getEval(selectedValueM3Exp));

        // click on item3
        item3Element.click();
        assertTrue("Item3 aria attribute should be Selected after the click",
                Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertTrue("Item3 should be Selected after the click", (Boolean) auraUITestingUtil.getEval(selectedValueM3Exp));

        // click on item3 again
        // Keys.Enter does not work with chrome v40.0.2214.91
        item3Element.sendKeys(Keys.SPACE);
        // verify not selected
        assertFalse("Item3 aria attribute should be Uncheked after Pressing Enter",
                Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertFalse("Item3 should be Uncheked after Pressing Enter",
                (Boolean) auraUITestingUtil.getEval(selectedValueM3Exp));

        item3Element.sendKeys(Keys.SPACE);
        assertTrue("Item3 aria attribute should be checked after Pressing Space",
                Boolean.valueOf(item3Element.getAttribute("aria-checked")));
        assertTrue("Item3 should be checked after Pressing Space",
                (Boolean) auraUITestingUtil.getEval(selectedValueM3Exp));

        // check if focus changes when you use up and down arrow using keyboard
        item3Element.sendKeys(Keys.DOWN);
        assertEquals("Focus should be on item 4", item4Element.getText(), auraUITestingUtil.getActiveElementText());
        item4Element.sendKeys(Keys.UP);
        assertEquals("Focus should be back to item 3", item3Element.getText(), auraUITestingUtil.getActiveElementText());

        // press Tab to close to menu
        item3Element.sendKeys(Keys.TAB);

        // verify menu not visible
        assertFalse("CheckboxMenu list should not be visible after escape",
                menu.getAttribute("class").contains("visible"));

        // click on submit button and verify the results
        assertEquals("label value should not get updated", "NFC West Teams", menuLabel.getText());
        button.click();
        assertEquals("Checkbox items selected are not correct", "St. Louis Rams,Arizona Cardinals", result.getText());
    }

    // W-2721266 : disable this test because it's a flapper.
    public void _testMenuRadio() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String label = "radioMenuLabel";
        String menuName = "radioMenu";
        String menuItem3 = "radioItem3";
        String menuItem4 = "radioItem4";
        String menuItem5 = "radioItem5";
        String disableValueM4Exp = auraUITestingUtil.getValueFromCmpRootExpression(menuItem4, "v.disabled");
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
                auraUITestingUtil.getActiveElementText());
        // verify item is disabled
        assertTrue("Item4 aria attribute should be defaulted to disable",
                Boolean.valueOf(item4Element.getAttribute("aria-disabled")));
        assertTrue("Item4 should be defaulted to disable", (Boolean) auraUITestingUtil.getEval(disableValueM4Exp));

        // click on item4
        item4Element.click();
        // verify item4 should not be selectable
        assertFalse("Item4 should not be selectable as its disable item",
                item4Element.getAttribute("class").contains("selected"));
        // goto item 5 using down arrow
        item4Element.sendKeys(Keys.DOWN);
        // verify focus on item 5
        assertEquals("Focus should be on item5 after pressing down key", item5Element.getText(),
                auraUITestingUtil.getActiveElementText());
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
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testMenuExpandCollapse() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        WebElement button = driver.findElement(By.className("radioButton"));
        assertFalse("Action Menu list should not be visible", menu.getAttribute("class").contains("visible"));
        menuLabel.click();
        assertTrue("Action Menu list should be expanded", menu.getAttribute("class").contains("visible"));
        button.click();
        assertFalse("Action Menu list should be collapsed", menu.getAttribute("class").contains("visible"));
    }

    /**
     * Test case : W-2235117 menuItem should reposition itself relative to its trigger when attachToBody attribute is
     * set
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    //For env reason the test is failing on Luna Autobuild, will run the test on jenkins only for now.
    @UnAdaptableTest
    public void testMenuPositionWhenMenuItemAttachToBody() throws MalformedURLException, URISyntaxException {
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
        String triggerGlobalId = auraUITestingUtil.getCmpGlobalIdGivenElementClassName(trigger);
        String menuListGlobalId = auraUITestingUtil.getCmpGlobalIdGivenElementClassName(menuList);
        WebElement menuLabel = driver.findElement(By.className(trigger));
        WebElement menu = driver.findElement(By.className(menuList));
        menuLabel.click();
        assertTrue("Action Menu list should be expanded", menu.getAttribute("class").contains("visible"));
        waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
                "Menu List is not positioned correctly when the menuList rendered on the page");

        // Select menu item and verify still aligned
        String triggerLeftPosBeforeClick = auraUITestingUtil.getBoundingRectPropOfElement(triggerGlobalId, "left");
        actionItem3Element.click();
        String triggerLeftPosAfterClickOnItem2 = auraUITestingUtil
                .getBoundingRectPropOfElement(triggerGlobalId, "left");
        assertEquals("Menu Item position changed after clicking on Item2", triggerLeftPosBeforeClick,
                triggerLeftPosAfterClickOnItem2);

        // Resize window with menulist open and verify realigns properly
        menuLabel.click();
        int newWidth = driver.manage().window().getSize().width - 200;
        int newHeight = driver.manage().window().getSize().height - 100;
        driver.manage().window().setSize(new Dimension(newWidth, newHeight));
        waitForWindowResize(newWidth, newHeight);
        waitForMenuPositionedCorrectly(triggerGlobalId, menuListGlobalId,
                "Menu List is not positioned correctly after the resize");
    }

    private WebElement getAnchor(WebElement actionItem3) {
        return actionItem3.findElement(By.tagName("a"));
    }

    /**
     * Wait for the current window to have expected dimensions.
     * 
     * @param width Expected width of the current window.
     * @param height Expected height of the current window.
     */
    private void waitForWindowResize(final int width, final int height) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Dimension current = getDriver().manage().window().getSize();
                return current.width == width && current.height == height;
            }
        });
    }

    /**
     * Verify horizontal alignment of menuItem
     * 
     * @param trigger
     * @param menuList
     * @param failureMessage
     */
    private void waitForMenuPositionedCorrectly(final String trigger, final String menuList, String failureMessage) {
        auraUITestingUtil.waitUntilWithCallback(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        String triggerLeftPos = auraUITestingUtil.getBoundingRectPropOfElement(trigger, "left");
                        String menuListLeftPos = auraUITestingUtil.getBoundingRectPropOfElement(menuList, "left");
                        return triggerLeftPos.equals(menuListLeftPos);
                    }
                }, new ExpectedCondition<String>() {
                    @Override
                    public String apply(WebDriver d) {
                        String triggerLeftPos = auraUITestingUtil.getBoundingRectPropOfElement(trigger, "left");
                        String menuListLeftPos = auraUITestingUtil.getBoundingRectPropOfElement(menuList, "left");
                        return "Trigger left position is <" + triggerLeftPos + "> and menu list left position is <"
                                + menuListLeftPos + ">";
                    }
                },
                getAuraUITestingUtil().getTimeout(),
                failureMessage);
    }

    /*
     * Test case for: W-1559070
     */
    public void testRemovingMenuDoesNotThrowJsError() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_APP);
        WebDriver driver = this.getDriver();
        String uiMenuClassName = "clubMenu";
        String uiMenuLocalId = "uiMenu";
        WebElement menuLabel = driver.findElement(By.className(uiMenuClassName));
        assertTrue("UiMenu should be present on the page", menuLabel.isDisplayed());

        // For W-1540590
        assertEquals("ui:menu's wrapper element should be div", "div", menuLabel.getTagName());
        String uiMenu = auraUITestingUtil.getFindAtRootExpr(uiMenuLocalId);
        auraUITestingUtil.getEval("$A.unrender(" + uiMenu + ")");
        assertFalse("UiMenu should not be present after unrender", isElementPresent(By.className(uiMenuClassName)));
    }

    /**
     * Test case to check double clicking on Menu Trigger link component within 350ms with disableDoubleClicks attribute
     * set disregards the 2nd click. Test case for W-1855568
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testDoubleClickOnMenuTrigger() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_APP);
        String label = "doubleClick";
        String menuName = "doubleClickDisabledMenuList";
        WebDriver driver = this.getDriver();
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement menu = driver.findElement(By.className(menuName));
        Actions a = new Actions(driver);
        a.doubleClick(menuLabel).build().perform();
        assertTrue("Check Menu list should be expanded even after double click",
                menu.getAttribute("class").contains("visible"));
    }

    /**
     * Test case for W-2315592 Components extends menuItem get's focus
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testFocusForExtendedMenuItem() throws MalformedURLException, URISyntaxException {
        open("/uitest/menu_extendMenuItem.app");
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        String menuItem1 = "actionItem1";
        String menuItem2 = "actionItem2";
        String menuItem3 = "actionItem3";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        WebElement actionItem1 = driver.findElement(By.className(menuItem1));
        WebElement actionItem1Element = getAnchor(actionItem1);
        WebElement actionItem2 = driver.findElement(By.className(menuItem2));
        WebElement actionItem2Element = getAnchor(actionItem2);
        WebElement actionItem3 = driver.findElement(By.className(menuItem3));
        WebElement actionItem3Element = getAnchor(actionItem3);
        // click on menu list
        menuLabel.click();
        // check menu list is visible after the click
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));

        // default focus on action item1
        assertEquals("Focus should be on actionItem1", actionItem1Element.getText(),
                auraUITestingUtil.getActiveElementText());

        // verify focus on action item3
        auraUITestingUtil.setHoverOverElement(menuItem3);
        assertEquals("Focus should be on actionItem3", actionItem3Element.getText(),
                auraUITestingUtil.getActiveElementText());
        // use send key("f") to move to actionItem2
        actionItem3Element.sendKeys("f");

        // verify focus on actionItem2
        assertEquals("Focus should be on actionItem 2", actionItem2Element.getText(),
                auraUITestingUtil.getActiveElementText());
    }

    /**
     * Test case to allow bubbling of event with menu Bug: W-2368359
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testStopClickPropogoationByDefault() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_EVENTBUBBLING_APP);
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        String valueExpression = auraUITestingUtil.getValueFromRootExpr("v.eventBubbled");
        valueExpression = auraUITestingUtil.prepareReturnStatement(valueExpression);
        assertNull("Event should not bubble up to parent div", auraUITestingUtil.getEval(valueExpression));
        // click on menu list
        menuLabel.click();
        // check menu list is visible after the click
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));
        assertTrue("Event should get bubble up to parent div", auraUITestingUtil.getBooleanEval(valueExpression));
    }

    /*
     * Test case to Stop bubbling of event when StopClickPropogoation attribute is set Bug: W-2368359
     */
    public void testStopClickPropogoationIsSet() throws MalformedURLException, URISyntaxException {
        open(MENUTEST_EVENTBUBBLING_APP + "?stopClickPropagation=true");
        WebDriver driver = this.getDriver();
        String label = "trigger";
        String menuName = "actionMenu";
        WebElement menuLabel = driver.findElement(By.className(label));
        WebElement actionMenu = driver.findElement(By.className(menuName));
        String valueExpression = auraUITestingUtil.getValueFromRootExpr("v.eventBubbled");
        valueExpression = auraUITestingUtil.prepareReturnStatement(valueExpression);
        assertNull("Event should not bubble up to parent div", auraUITestingUtil.getEval(valueExpression));

        // click on menu list
        menuLabel.click();
        // check menu list is visible after the click
        assertTrue("Menu list should be visible", actionMenu.getAttribute("class").contains("visible"));
        assertNull("Event should not bubble up to parent div when StopPropogoation is set on menu",
                auraUITestingUtil.getEval(valueExpression));
    }
}
