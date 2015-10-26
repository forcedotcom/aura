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
package org.auraframework.components.ui.modalOverlay;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * WARNING this test is testing deprecated components. Usages of panelManager should be replaced with panelManager2
 */
@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD,
        BrowserType.IE7, BrowserType.IE8 })
public class PanelModalOverlayUITest extends WebDriverTestCase {

    private static final String APP = "/uitest/panelTest.cmp";
    private final String PANELDIALOG_MODAL_BUTTON = ".panelDialogModalButton";
    private final String PANELDIALOG_NONMODAL_BUTTON = ".panelDialogNonModalButton";
    private final String PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON = ".panelDialogNonModalNonTransientButton";
    private final String PANELDIALOG_MODAL_CMP = ".uiPanelDialog";
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String ESC_BUTTON = ".closeBtn";
    private final String ACTIVE_ELEMENT_TEXT = "return $A.test.getActiveElementText()";
    private final String NEWOVERLAY_BUTTON = ".pressOverlay";
    private final String INPUT_TEXT = ".inputText";

    public PanelModalOverlayUITest(String name) {
        super(name);
    }

    /**
     * [Accessibility] modal overlay dialog closing on Esc key. Test case for W-2396326
     */
    public void testPressEscKeyOnModalOverlayDialog() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_MODAL_BUTTON);
        verifyOverlayActive();
        pressEscapeOnActiveElement();
        waitForElementAbsent(getDriver().findElement(By.cssSelector(PANELDIALOG_MODAL_CMP)));
        verifyOverlayNotActive();
    }

    /**
     * [Accessibility] non-modal overlay dialog closing on Esc key. Test case for W-2396326
     */
    public void testPressEscKeyOnNonModalDialog() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONMODAL_BUTTON);
        verifyOverlayActive();
        pressEscapeOnActiveElement();
        waitForElementDisappear(By.cssSelector(PANELDIALOG_MODAL_CMP));
        verifyOverlayNotActive();
    }

    /**
     * [Accessibility] non-modal overlay dialog with transient set to false should be closing on Esc key. Test case for
     * W-2396326
     */
    public void testPressEscKeyOnNonModalNonTransientDialog() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON);
        verifyOverlayActive();
        pressEscapeOnActiveElement();
        waitForElementAbsent(getDriver().findElement(By.cssSelector(PANELDIALOG_MODAL_CMP)));
        verifyOverlayNotActive();
    }

    /**
     * [Accessibility] non-modal overlay dialog should not be closed when closeOnClickOut is not set to true Test case
     * for W-2518413
     */
    public void testPanelDialogWithCloseOnClickOutNotSet() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONMODAL_BUTTON);
        verifyOverlayActive();
        clickOutModal();
        // Since panel stays open and active just try to wait for the click away to be fully processed
        waitForActiveElementText("", "Active element never switched when clicking out of modal");
        verifyOverlayActive();
    }

    /**
     * [Accessibility] non-modal overlay dialog should be closed when closeOnClickOut is set to true Test case for
     * W-2518413
     */
    public void testPanelDialogWithCloseOnClickOutSet() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON);
        verifyOverlayActive();
        clickOutModal();
        waitForElementAbsent(getDriver().findElement(By.cssSelector(PANELDIALOG_MODAL_CMP)));
        verifyOverlayNotActive();
    }

    /**
     * [Accessibility] Modal overlay dialog closes on pressing ESC button.
     */
    public void testPressEscButtonOnModalOverlayDialog() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_MODAL_BUTTON);
        verifyOverlayActive();
        findDomElement(By.cssSelector(ESC_BUTTON)).click();
        waitForElementAbsent(getDriver().findElement(By.cssSelector(PANELDIALOG_MODAL_CMP)));
        verifyOverlayNotActive();
    }

    /**
     * [Accessibility] non-modal overlay dialog closes on pressing ESC button.
     */
    public void testPressEscButtonOnNonModalDialog() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONMODAL_BUTTON);
        verifyOverlayActive();
        findDomElement(By.cssSelector(ESC_BUTTON)).click();
        waitForElementDisappear(By.cssSelector(PANELDIALOG_MODAL_CMP));
        verifyOverlayNotActive();
    }

    /**
     * Test multiple overlay one above another on modal overlay should close all the overlay's when we press ESC on the
     * newest overlay
     */
    // TODO(W-2789664): Opening modal on top of first one then pressing escape causes error.
    // "Invalid component tried calling function [get] with arguments [v.isModal], markup://ui:panelDialog [22:c]"
    public void _testClickEscButtonClosesAllModalOverlays() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_MODAL_BUTTON);
        verifyOverlayActive();
        openNewOverlayOnTopOfExistingModalOverlay(2, true);
        verifyOverlayActive();
        pressEscapeOnActiveElement();
        waitNumberOfPanelsInDom(1);
        verifyOverlayNotActive();
    }

    /**
     * Test multiple overlay one above another on non-modal overlay should close all the overlay's when we press ESC on
     * the newest overlay
     */
    // TODO(W-2789664): Opening modal on top of first one then pressing escape causes error.
    // "Invalid component tried calling function [get] with arguments [v.isModal], markup://ui:panelDialog [22:c]"
    public void _testClickEscButtonClosesAllNonModalOverlays() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONMODAL_BUTTON);
        verifyOverlayActive();
        openNewOverlayOnTopOfExistingModalOverlay(2, true);
        verifyOverlayActive();
        pressEscapeOnActiveElement();
        waitNumberOfPanelsInDom(0);
        verifyOverlayNotActive();
    }

    /**
     * verify multiple overlay one above another on nonModal non transient should close all the overlay's when we press
     * ESC on the newest overlay Test case for W-2518413
     */
    public void testClickEscButtonClosesAllNonModalNonTransientOverlays() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON);
        verifyOverlayActive();
        List<WebElement> activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
        String globalId1 = activeOverlay.get(0).getAttribute("data-aura-rendered-by");
        openNewOverlayOnTopOfExistingModalOverlay(1, false);
        verifyOverlayActive();
        activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
        String globalId2 = activeOverlay.get(0).getAttribute("data-aura-rendered-by");
        // Cmp should use the prev instance and no new cmp should be created
        assertEquals("It should use old instance of panelDialog cmp for non transient panel Dialog", globalId1,
                globalId2);
        pressEscapeOnActiveElement();
        waitForElementAbsent(getDriver().findElement(By.cssSelector(PANELDIALOG_MODAL_CMP)));

        verifyOverlayNotActive();
    }

    /**
     * Tabs on Modal overlay should do focus trapping and not close the overlay
     */
    public void testModalOverlayDialogDoesFocusTrapping() throws Exception {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_MODAL_BUTTON);
        verifyOverlayActive();
        assertEquals("Button1 should be active element", "button 1", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        pressTabOnActiveElementAndWait("button 2");
        pressTabOnActiveElementAndWait("open another overlay");
        pressTabOnActiveElementAndWait("Close");
        pressTabOnActiveElementAndWait("button 1");
        verifyOverlayActive();
    }

    /**
     * Tabs on nonModal overlay dialog should close the overlay and not trap the focus within the overlay
     */
    public void testNonModalOverlayDialogDoesNotDoFocusTrapping()
            throws MalformedURLException, URISyntaxException,
            InterruptedException {
        open(APP);
        verifyOverlayNotActive();
        openOverlay(PANELDIALOG_NONMODAL_BUTTON);
        verifyOverlayActive();
        assertEquals("Button1 should be active element", "button 1", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        pressTabOnActiveElementAndWait("button 2");
        pressTabOnActiveElementAndWait("open another overlay");
        pressTabOnActiveElementAndWait("Close");
        pressTabOnActiveElement();
        waitForElementDisappear(By.cssSelector(PANELDIALOG_MODAL_CMP));
        verifyOverlayNotActive();
    }

    private void openNewOverlayOnTopOfExistingModalOverlay(final int expectedOverlays, boolean isTransient)
            throws Exception {
        WebElement newOverlayButton = findDomElement(By.cssSelector(NEWOVERLAY_BUTTON));
        newOverlayButton.click();
        waitNumberOfPanelsInDom(expectedOverlays);

    }

    private void waitNumberOfPanelsInDom(final int expectedPanels) {
        auraUITestingUtil
                .waitUntil(
                        new ExpectedCondition<Boolean>() {
                            @Override
                            public Boolean apply(WebDriver d) {
                                List<WebElement> elements = findDomElements(By
                                        .cssSelector(PANELDIALOG_MODAL_CMP));
                                return elements.size() == expectedPanels;
                            }
                        },
                        "After excape only " + expectedPanels + " panel(s) should be present in DOM");
    }

    /**
     * Verify overlay is opened
     * 
     * @param overlayCmpLocator
     * @param isActive
     * @throws InterruptedException
     */
    private void verifyOverlayActive() {
        List<WebElement> activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
        assertNotNull("There should be one overlay active", activeOverlay);
        assertEquals("Only 1 active overlay should be opened at any point", 1, activeOverlay.size());
    }

    private void verifyOverlayNotActive() {
        List<WebElement> activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
        assertNull("No Overlay should be active currently", activeOverlay);
    }

    /**
     * Get list of active overlay panel, typically it should just return 1
     * 
     * @return
     * @return
     */
    private List<WebElement> getActiveOverlay(String overlayCmpLocator) {
        By locator = By.cssSelector(overlayCmpLocator + ".active");
        if (isElementPresent(locator)) {
            return findDomElements(locator);
        }
        return null;
    }

    /**
     * open overlay panel
     * 
     * @param overlayLocator
     * @throws InterruptedException
     */
    private void openOverlay(String buttonLocator) throws InterruptedException {
        WebDriver driver = this.getDriver();
        WebElement modalOverlayButton = driver.findElement(By.cssSelector(buttonLocator));
        modalOverlayButton.click();
        waitForElementAppear(By.cssSelector(PANELDIALOG_MODAL_CMP));
    }

    private void pressEscapeOnActiveElement() {
        WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.ESCAPE);
    }

    private void pressTabOnActiveElementAndWait(final String expectedText) {
        pressTabOnActiveElement();
        waitForActiveElementText(expectedText, "Did not tab to expected location");
    }

    private void waitForActiveElementText(final String expectedText, String message) {
        auraUITestingUtil
                .waitUntil(
                        new ExpectedCondition<Boolean>() {
                            @Override
                            public Boolean apply(WebDriver d) {
                                String text = (String) auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT);
                                return text.startsWith(expectedText);
                            }
                        },
                        message);
    }

    private void pressTabOnActiveElement() {
        WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
    }

    private void clickOutModal() {
        WebElement inputText = findDomElement(By.cssSelector(INPUT_TEXT));
        inputText.click();
    }

}
