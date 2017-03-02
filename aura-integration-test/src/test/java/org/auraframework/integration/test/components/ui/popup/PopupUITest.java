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
package org.auraframework.integration.test.components.ui.popup;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

/**
 * UI Component tests for ui:popup
 */
// Note that as of July '14 this component is still in its early stages
// https://gus.my.salesui.com/0D5B0000001QjOc
@TargetBrowsers({BrowserType.GOOGLECHROME})
public class PopupUITest extends WebDriverTestCase {

    private final String POPUP_CONTAINER = ".popupTargetContainer";
    private final String POPUP_CONTAINER_TARGET = POPUP_CONTAINER + " div";

    /**
     * Creates a popup with an extended target and confirms the
     * popup is launched with the specified height and width
     *
     * @throws Exception
     * @expectedResults Popup launches with the specified size
     */
    @Test
    public void testPopupWithExtendedTarget() throws Exception {
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "a[class='triggerExtendedTrigger']";
        int popupWidth = 150;
        int popupHeight = 200;
        WebDriver driver = this.getDriver();

        // Open Extended Popup app and verify the trigger loads
        openExtendedPopupComponent(triggerText, popupText, true, false, true, false, false, false, false, popupWidth, popupHeight);

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                "Popup did not launch");
        verifyPopupSize(POPUP_CONTAINER, popupHeight, popupWidth);
        WebElement popupTarget = driver.findElement(By.cssSelector(POPUP_CONTAINER_TARGET));
        assertTrue("Popup does not contain specified text", popupTarget.getText().contains(popupText));

        // Click outside popup and verify it closes
        clickOutsidePopup(POPUP_CONTAINER);
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                "Popup did not close");
    }

    private String randString(int len) {
        return getAuraUITestingUtil().randString(len);
    }

    /**
     * Sets a label to be the target of the popup, launches the popup
     * and verifies the label is present, then closes the popup
     *
     * @throws Exception
     * @expectedResults popup launches with the label used as the target
     */
    @Test
    public void testPopupWithLabelTarget() throws Exception {
        WebDriver driver = this.getDriver();
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "a[class='triggerLabel']";

        String cmpMarkup = "<aura:application>"
            + "<ui:popup>"
            + "<ui:popupTrigger class='triggerLabel' aura:id='triggerLabel' label='" + triggerText + "'/>"
            + "<ui:popupTarget aura:id='targetLabel' attachToBody='true'>"
            + popupText
            + "</ui:popupTarget>"
            + "</ui:popup>"
            + "</aura:application>";

        // Open app and verify the trigger loads
        openComponentApp(cmpMarkup);

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();

        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(POPUP_CONTAINER),
                "Popup did not launch");
        WebElement popupContainer = driver.findElement(By.cssSelector(POPUP_CONTAINER));
        assertTrue("Popup does not contain specified text", popupContainer.getText().contains(popupText));

        // Click outside popup and verify it closes
        clickOutsidePopup(POPUP_CONTAINER);
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(POPUP_CONTAINER), "Popup did not close");
    }

    /**
     * Creates a trigger with a popup outside of an iFrame, opens the
     * popup, then verifies that clicking inside of the iFrame will
     * close the popup.  This issue was found during development.
     *
     * @throws Exception
     * @expectedResults Popup closes when the click occurs in the iFrame
     */
    //Currently this test is not passing
    public void _testPopupCollapseAfterClickInIframe() throws Exception {
        WebDriver driver = this.getDriver();
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "div[class='triggerLabel']>a";
        int popupWidth = 150;
        int popupHeight = 200;

        String appMarkup = "<aura:application>"
            + "<ui:popup>"
            + "<ui:popupTrigger class='triggerLabel' aura:id='triggerLabel' label='" + triggerText + "'/>"
            + "<ui:popupTarget class='targetExtendedTarget' aura:id='targetExtendedTarget' attachToBody='false'>"
            + "<div style='width: " + popupWidth + "px;height: " + popupHeight + "px'>" + popupText
            + "</div>"
            + "</ui:popupTarget>"
            + "</ui:popup>"
            + "<iframe width='500' height='500' name='frameId' title='iframeTitle'/>"
            + "</aura:application>";

        // Open app and verify the trigger loads
        DefDescriptor<ApplicationDef> appDef = addSourceAutoCleanup(ApplicationDef.class, appMarkup);
        String appUrl = String.format("/%s/%s.app", appDef.getNamespace(), appDef.getName());
        open(appUrl);
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector("iframe"),
                "iframe not found");
        WebElement iframeElement = driver.findElement(By.cssSelector("iframe"));

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(POPUP_CONTAINER),
                "Popup did not launch");
        WebElement popupContainer = driver.findElement(By.cssSelector(POPUP_CONTAINER));
        assertTrue("Popup does not contain specified text", popupContainer.getText().contains(popupText));

        // Click outside popup in the iFrame and verify the popup closes
        iframeElement.click();
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(POPUP_CONTAINER), "Popup did not close");
    }

    /**
     * Sets a popup target to close with a mouse click outside of it.
     * Also verifies the popup will not close if clicked inside.
     *
     * @throws Exception
     * @expectedResult Popup only closes when the mouse is clicked outside
     * of it
     */
    @Test
    public void testPopupCloseOnClickOutside() throws Exception {
        verifyPopupCloseWithClick(false, true);
    }

    /**
     * Sets a popup target to close with a mouse click inside and outside
     * of itself.  Verifies the popup can be closed both ways.
     *
     * @throws Exception
     * @expectedResult Popup closes when the mouse is clicked inside
     * of it as well as outside
     */
    @Test
    public void testPopupCloseOnClickInsideAndOutside() throws Exception {
        verifyPopupCloseWithClick(true, true);
    }

    /**
     * Sets a popup target to close with a mouse click outside of it.
     * Also verifies the popup will not close if clicked inside.
     *
     * @throws Exception
     * @expectedResult Popup only closes when the mouse is clicked outside
     * of it
     */
    @Test
    public void testPopupCloseOnClickInside() throws Exception {
        verifyPopupCloseWithClick(true, false);
    }

    /**
     * Verifies the popup closes when the trigger is clicked; also
     * verifies the popup will NOT close when the mouse is clicked
     * inside or outside the popup
     *
     * @throws Exception
     * @expectedResult Popup closes only when the mouse is clicked
     * on the trigger
     */
/*
    @Test
    public void testPopupCloseOnTriggerClickOnly() throws Exception {
        verifyPopupCloseWithClick(false, false);
    }
*/

    /**
     * Uses input box selection as a custom trigger to launch a
     * popup.  Closes the popup via a button (custom close trigger).
     *
     * @throws Exception
     * @expectedResults Popup opens when the input box is selected
     * and closes when the button is clicked
     */
    /*@Test
    public void testPopupCustomTrigger() throws Exception {
        verifyCustomTrigger(false);
    }*/

    /**
     * Uses input box selection as a custom trigger to launch a
     * popup.  Closes the popup via the TAB key.
     *
     * @throws Exception
     * @expectedResults Popup opens when the input box is selected
     * and closes when the TAB key is pressed
     */
    //Not working as pressing Tab key does not close the target container if there are many popup's on the page
    public void _testCloseOnTabKey() throws Exception {
        verifyCustomTrigger(true);
    }

    /**
     * Sets a popup to open at a manual position (move left by 5px)
     * and verifies the popup opens at the specified location.
     *
     * @throws Exception
     */
    @Test
    public void testPopupManualPosition() throws Exception {
        WebDriver driver = this.getDriver();
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "a[class='triggerExtendedTarget']";
        int popupWidth = 100;
        int popupHeight = 220;
        int xCoord = 5;

        String cmpMarkup = "<aura:application>"
            + "<ui:popup>"
            + "<ui:popupTrigger class='triggerExtendedTarget' aura:id='triggerExtendedTarget' label='" + triggerText + "'/>"
            + "<ui:popupTarget aura:id='targetExtendedTarget' attachToBody='true' manualPosition='true' autoPosition='false'>"
            + "<div style='position: relative; left: " + xCoord + "px;width: " + popupWidth + "px;height: " + popupHeight + "px'>" + popupText
            + "</div>"
            + "</ui:popupTarget>"
            + "</ui:popup>"
            + "</aura:application>";
        DefDescriptor<ApplicationDef> appDef = addSourceAutoCleanup(ApplicationDef.class, cmpMarkup);
        String appUrl = String.format("/%s/%s.app", appDef.getNamespace(), appDef.getName());

        // Open app and verify the trigger loads
        open(appUrl);

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                "Popup did not launch");
        WebElement containerTgt = driver.findElement(By.cssSelector(POPUP_CONTAINER_TARGET));
        assertTrue("Popup does not contain specified text", containerTgt.getText().contains(popupText));

        // Verify the popup location is as specified
        WebElement popupElem = driver.findElement(By.cssSelector(POPUP_CONTAINER_TARGET));
        assertEquals("Popup position incorrect", xCoord, popupElem.getLocation().getX());
    }

    /**
     * Sets a curtain to open with the popup, verifies it is present
     * when the popup opens, and confirms it closes when the popup is
     * closed.
     *
     * @throws Exception
     * @expectedResults Curtain is present when the popup opens and
     * closes along with the popup
     */
    @Test
    public void testPopupWithCurtain() throws Exception {
        WebDriver driver = this.getDriver();
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "a[class='triggerExtendedTrigger']";
        String popupLocator = ".popupCurtain";
        int popupWidth = 100;
        int popupHeight = 220;

        // Open Extended Popup app and verify the trigger loads
        openExtendedPopupComponent(triggerText, popupText, true, true, false, true, true, false, false, popupWidth, popupHeight);

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(popupLocator),
                "Popup with curtain did not launch");

        // Click outside popup and verify it closes
        clickOutsidePopup(POPUP_CONTAINER);
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(popupLocator), "Popup did not close");
    }

    /**
     * Helper to create a custom popup trigger and closer.  Trigger is
     * selecting an input box; popup closing is done via clicking on a
     * button OR via the keyboard TAB key.
     *
     * @param closeOnTabKey true if using the TAB key to close the popup;
     *                      false if using the button to close the popup
     * @throws Exception
     */
    private void verifyCustomTrigger(boolean closeOnTabKey) throws Exception {
        WebDriver driver = this.getDriver();
        String triggerLocator = "customTriggerInput";
        String buttonLocator = "customTriggerButton";
        String targetLocator = "customTriggerTargetContainer";
        String appUrl = "/uitest/popupTest.app";
        open(appUrl);

        // Click on the trigger and verify the popup opens
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(triggerLocator),
                "Trigger input box not present");
        WebElement triggerInput = driver.findElement(By.className(triggerLocator));
        triggerInput.click();
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(targetLocator),
                "Popup did not launch");
        // Close the popup either by the TAB key or the close button
        if (closeOnTabKey) {
            Actions builder = new Actions(this.getDriver());
            builder.sendKeys(Keys.TAB, Keys.NULL).build().perform();
        } else {
            WebElement customTriggerButton = driver.findElement(By.className(buttonLocator));
            customTriggerButton.click();
        }

        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(targetLocator), "Popup did not close");
    }

    /**
     * Helper to verify popup closes via a mouse click inside the popup,
     * outside the popup, or on the trigger.
     *
     * @param closeOnClickInside
     * @param closeOnClickOutside
     * @throws Exception
     */
    private void verifyPopupCloseWithClick(boolean closeOnClickInside, boolean closeOnClickOutside) throws Exception {
        WebDriver driver = this.getDriver();
        String triggerText = "Trigger" + randString(4);
        String popupText = "Target" + randString(4);
        String triggerLocator = "a[class='triggerExtendedTrigger']";
        int popupWidth = 150;
        int popupHeight = 200;

        // Open Extended Popup app and verify the trigger loads
        openExtendedPopupComponent(triggerText, popupText, true, closeOnClickInside, closeOnClickOutside, false, false, false, false, popupWidth, popupHeight);

        // Click the trigger and verify popup launches
        WebElement trigger = driver.findElement(By.cssSelector(triggerLocator));
        trigger.click();
        getAuraUITestingUtil().waitUntil(check -> {
            String classAttribute = driver.findElement(By.cssSelector(POPUP_CONTAINER)).getAttribute("class");
            return classAttribute.contains("visible")
                && classAttribute.contains("positioned");
        }, 5, "Popup did not appear");
        verifyPopupSize(POPUP_CONTAINER, popupHeight, popupWidth);
        WebElement popContainerTgtElem = driver.findElement(By.cssSelector(POPUP_CONTAINER_TARGET));
        assertTrue("Popup does not contain specified text", popContainerTgtElem.getText().contains(popupText));
        if (!closeOnClickOutside) {
            // Verify popup doesn't close with a mouse click outside of it
            clickOutsidePopup(POPUP_CONTAINER);
            verifyPopupNotClosed(POPUP_CONTAINER_TARGET);
            clickInsidePopup(POPUP_CONTAINER);

            if (!closeOnClickInside) {
                // Verify popup doesn't close with a mouse click inside of it
                verifyPopupNotClosed(POPUP_CONTAINER_TARGET);
                WebElement trgLocatorElemt = driver.findElement(By.cssSelector(triggerLocator));
                trgLocatorElemt.click();
            }

        } else {
            if (closeOnClickInside) {
                // Verify popup closes when mouse is clicked inside
                clickInsidePopup(POPUP_CONTAINER);
                getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                        "Popup did not close");
                WebElement trgLocatorElemt = driver.findElement(By.cssSelector(triggerLocator));
                trgLocatorElemt.click();
                getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                        "Popup did not launch");

                // Verify popup closes when mouse is clicked outside
                clickOutsidePopup(POPUP_CONTAINER);

            } else {
                // Verify popup doesn't close with a mouse click inside of it
                clickInsidePopup(POPUP_CONTAINER);
                verifyPopupNotClosed(POPUP_CONTAINER_TARGET);

                // Verify popup closes with a mouse click inside of it
                clickOutsidePopup(POPUP_CONTAINER);
            }
        }
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(POPUP_CONTAINER_TARGET),
                "Popup did not close");
    }

    /**
     * Helper that performs a mouse click inside a launched popup
     *
     * @param popupLocator CSS locator of popup
     * @throws Exception
     */
    private void clickInsidePopup(String popupLocator) throws Exception {
        WebDriver driver = this.getDriver();
        WebElement popupElem = driver.findElement(By.cssSelector(popupLocator));
        //org.openqa.selenium.Dimension popupSize = popupElem.getSize();
        popupElem.click();
        //wdUtil.click(popupElem, popupSize.getWidth() - 5, popupSize.getHeight() - 5);
    }

    /**
     * Helper to verify the popup does not close
     *
     * @param popupLocator CSS locator of popup target
     * @throws Exception
     */
    private void verifyPopupNotClosed(String popupLocator) throws Exception {
        int originalTimeout = getAuraUITestingUtil().getTimeout();
        try {
            // wait 2s to see if popup closes
            getAuraUITestingUtil().setTimeoutInSecs(2);
			getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(popupLocator),
					"expected to not close");
			fail("Popup closed when it shouldn't");
        } catch (Exception e) {
            //Continue with no failure if the popup didn't close
        } finally {
            getAuraUITestingUtil().setTimeoutInSecs(originalTimeout);
        }
    }

    /**
     * Helper to verify that the height and width of a popup match
     * the expected values
     *
     * @param popupLocator   CSS locator of popup
     * @param expectedHeight Expected height of the popup
     * @param expectedWidth  Expected width of the popup
     * @throws Exception
     */
    private void verifyPopupSize(String popupLocator, int expectedHeight, int expectedWidth) throws Exception {
        WebDriver driver = this.getDriver();
        org.openqa.selenium.Dimension popupSize = driver.findElement(By.cssSelector(popupLocator)).getSize();
        assertEquals("Popup height not as specified", expectedHeight, popupSize.getHeight());
        assertEquals("Popup width not as specified", expectedWidth, popupSize.getWidth());
    }

    /**
     * Helper that performs a mouse click outside of a launchd popup
     *
     * @param popupLocator CSS locator of popup
     * @throws Exception
     */
    private void clickOutsidePopup(String popupLocator) throws Exception {
        WebDriver driver = this.getDriver();
//        WebElement popupElem = driver.findElement(By.cssSelector(popupLocator));
//        org.openqa.selenium.Point popupLoc = popupElem.getLocation();
//        org.openqa.selenium.Dimension popupSize = popupElem.getSize();
//        int clickX = popupLoc.getX() + popupSize.getWidth() + 5;
//        int clickY = popupLoc.getY() + popupSize.getHeight() + 5;
        String elemLoc = isElementPresent(By.cssSelector(".popupCurtain")) ? ".popupCurtain" : "body";
        WebElement bodyElem = driver.findElement(By.cssSelector(elemLoc));
        bodyElem.click();
        //wdUtil.click(bodyElem, clickX, clickY);
    }

    /**
     * Helper that creates and opens a popup with Extended target
     *
     * @param triggerText         Text for the trigger
     * @param popupText           Text to appear in the popup
     * @param attachToBody        true if popup should be at body level; false if
     *                            popup should be at trigger level
     * @param closeOnClickInside  true if popup can be closed with a click
     *                            inside of it
     * @param closeOnClickOutside true if popup can be closed witha click
     *                            outside of it
     * @param width               Width of popup in px
     * @param height              Height of popup in px
     * @throws Exception
     */
    private void openExtendedPopupComponent(String triggerText, String popupText, boolean attachToBody, boolean closeOnClickInside,
        boolean closeOnClickOutside, boolean manualPosition, boolean curtain, boolean closeOnTabKey, boolean visible, int width, int height) throws Exception {
        String cmpMarkup = "<aura:application>"
            + "<ui:popup>"
            + "<ui:popupTrigger class='triggerExtendedTrigger' aura:id='triggerExtendedTarget' label='" + triggerText + "'/>"
            + "<ui:popupTarget class='targetExtendedTarget' aura:id='targetExtendedTarget' attachToBody='" + attachToBody
            + "' closeOnClickInside='" + closeOnClickInside
            + "' closeOnClickOutside='" + closeOnClickOutside
            + "' manualPosition='" + manualPosition
            + "' curtain='" + curtain
            + "' closeOnTabKey='" + closeOnTabKey
            + "' visible='" + visible
            + "'>"
            + "<div style='width:" + width + "px;height:" + height + "px;'>" + popupText
            + "</div>"
            + "</ui:popupTarget>"
            + "</ui:popup>"
            + "</aura:application>";

        // Open app and verify the trigger loads
        openComponentApp(cmpMarkup);
    }

    /**
     * Creates an app and opens it in the browser based on
     * input app markup
     *
     * @param markup String markup for app
     * @throws Exception
     */
    private void openComponentApp(String markup) throws Exception {
        DefDescriptor<ApplicationDef> appDef = addSourceAutoCleanup(ApplicationDef.class, markup);
        String appUrl = String.format("/%s/%s.app", appDef.getNamespace(), appDef.getName());
        open(appUrl);
    }
}
