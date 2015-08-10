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

@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD,
        BrowserType.IE7, BrowserType.IE8 })
public class PanelModalOverlayUITest extends WebDriverTestCase {

    private static final String APP = "/uitest/panelTest.cmp";
    private final String PANELDIALOG_MODAL_BUTTON = ".panelDialogModalButton";
    private final String PANELDIALOG_NONMODAL_BUTTON = ".panelDialogNonModalButton";
    private final String PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON = ".panelDialogNonModalNonTransientButton";
    private final String PANEL_OVERLAY_BUTTON = ".panelOverlayButton";
    private final String PANELDIALOG_MODAL_CMP = ".uiPanelDialog";
    private final String PANEL_OVERLAY_CMP = ".uiPanelOverlay";
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String ACTIVE_ELEMENT_TEXT = "return $A.test.getActiveElementText()";
    private final String ESC_BUTTON = ".closeBtn";
    private final String NEWOVERLAY_BUTTON = ".pressOverlay";
    private final String INPUT_TEXT = ".inputText";

    public PanelModalOverlayUITest(String name) {
        super(name);
    }

    /**
     * [Accessibility] modal overlay dialog closing on Esc key. Test case for W-2396326
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPressEscKeyOnModalOverlayDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANELDIALOG_MODAL_BUTTON, PANELDIALOG_MODAL_CMP,
                Keys.ESCAPE, false);
    }

    /**
     * [Accessibility] non-modal overlay dialog closing on Esc key. Test case for W-2396326
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPressEscKeyOnNonModalDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANELDIALOG_NONMODAL_BUTTON, PANELDIALOG_MODAL_CMP,
                Keys.ESCAPE, false);
    }

    /**
     * [Accessibility] non-modal overlay dialog with transient set to false should be closing on Esc key. Test case for
     * W-2396326
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPressEscKeyOnNonModalNonTransientDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON,
                PANELDIALOG_MODAL_CMP, Keys.ESCAPE, false);
    }

    /**
     * [Accessibility] non-modal overlay dialog should not be closed when closeOnClickOut is not set to true Test case
     * for W-2518413
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPanelDialogWithCloseOnClickOutNotSet() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANELDIALOG_NONMODAL_BUTTON, PANELDIALOG_MODAL_CMP, null,
                true);
    }

    /**
     * [Accessibility] non-modal overlay dialog should be closed when closeOnClickOut is set to true Test case for
     * W-2518413
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPanelDialogWithCloseOnClickOutSet() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON,
                PANELDIALOG_MODAL_CMP, null, false);
    }

    /**
     * [Accessibility] Panel overlay dialog - non Full screen should be closed on Esc key. Test case for W-2424490 TODO:
     * uncomment the test once the bug is fixed.
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void _testPressEscKeyOnPanelOverlayDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(PANEL_OVERLAY_BUTTON, PANEL_OVERLAY_CMP, Keys.ESCAPE,
                false);
    }

    /**
     * Verify pressing ESC while modalOverlay dialog is opened should close the overlay
     * 
     * @param keyToBePressed
     * @param isOverlayActiveAfterPressingESC
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    private void verifyPressEscKeyORClickOutOnModalAndNonModalOverlay(String button, String cmp, Keys keyToBePressed,
            boolean isOverlayActiveAfterPressingESC) throws MalformedURLException, URISyntaxException,
            InterruptedException {
        // verifyTabOutAndEscBehaviour(Keys.ESCAPE, false);
        open(APP);
        verifyOverlayActive(cmp, false);
        openOverlay(button);
        verifyOverlayActive(cmp, true);
        WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        if (keyToBePressed != null) {
            activeElement.sendKeys(keyToBePressed);
        }
        else {
            WebElement inputText = findDomElement(By.cssSelector(INPUT_TEXT));
            inputText.click();
        }
        verifyOverlayActive(cmp, isOverlayActiveAfterPressingESC);
    }

    /**
     * [Accessibility] Modal overlay dialog closes on pressing ESC button.
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPressEscButtonOnModalOverlayDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscButtonOnModalAndNonModalOverlay(PANELDIALOG_MODAL_BUTTON);
    }

    /**
     * [Accessibility] non-modal overlay dialog closes on pressing ESC button.
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testPressEscButtonOnNonModalDialog() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyPressEscButtonOnModalAndNonModalOverlay(PANELDIALOG_NONMODAL_BUTTON);
    }

    /**
     * Verify pressing ESC button with modal and non-modal Overlay dialog
     * 
     * @param button
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    private void verifyPressEscButtonOnModalAndNonModalOverlay(String button) throws MalformedURLException,
            URISyntaxException, InterruptedException {
        open(APP);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, false);
        openOverlay(button);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, true);
        WebElement escButton = findDomElement(By.cssSelector(ESC_BUTTON));
        escButton.click();
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, false);
    }

    /**
     * Test multiple overlay one above another on modal overlay should close all the overlay's when we press ESC on the
     * newest overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testClickEscButtonClosesAllModalOverlays() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyClickEscButtonClosesAllModalNonModalOverlays(PANELDIALOG_MODAL_BUTTON, true, 2);
    }

    /**
     * Test multiple overlay one above another on non-modal overlay should close all the overlay's when we press ESC on
     * the newest overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException TODO: Once W-2521190 is fixed need to change the arogument from 1 to 2
     */
    public void testClickEscButtonClosesAllNonModalOverlays() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyClickEscButtonClosesAllModalNonModalOverlays(PANELDIALOG_NONMODAL_BUTTON, true, 2);
    }

    /**
     * verify multiple overlay one above another on modal or nonModal should close all the overlay's when we press ESC
     * on the newest overlay
     * 
     * @param expOverlays
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void verifyClickEscButtonClosesAllModalNonModalOverlays(String button, boolean isTransient, int expOverlays)
            throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, false);
        openOverlay(button);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, true);
        String globalId1 = null;
        if (!isTransient) {
            List<WebElement> activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
            globalId1 = activeOverlay.get(0).getAttribute("data-aura-rendered-by");
        }
        openNewOverlayOnTopOfExistingModalOverlay(expOverlays, isTransient);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, true);
        if (!isTransient) {
            List<WebElement> activeOverlay = getActiveOverlay(PANELDIALOG_MODAL_CMP);
            String globalId2 = activeOverlay.get(0).getAttribute("data-aura-rendered-by");
            // For transient set to false the cmp should use the prev instance, and no new cmp should be created
            assertEquals("It should use old instance of panelDialog cmp for non transient panel Dialog", globalId1,
                    globalId2);
        }
        WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.ESCAPE);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, false);
    }

    /**
     * verify multiple overlay one above another on nonModal non transient should close all the overlay's when we press
     * ESC on the newest overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException Test case for W-2518413
     */
    public void testClickEscButtonClosesAllNonModalNonTransientOverlays() throws MalformedURLException,
            URISyntaxException, InterruptedException {
        verifyClickEscButtonClosesAllModalNonModalOverlays(PANELDIALOG_NONTRANSIENT_NONMODAL_BUTTON, false, 1);
    }

    /**
     * Tabs on Modal overlay should do focus trapping and not close the overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testModalOverlayDialogDoesFocusTrapping() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyFocusTrappingForModalAndNonModalDialog(PANELDIALOG_MODAL_BUTTON, true);
    }

    /*
     * Tabs on nonModal overlay dialog should close the overlay and not trap the focus within the overlay
     */
    public void testNonModalOverlayDialogDoesNotDoFocusTrapping() throws MalformedURLException, URISyntaxException,
            InterruptedException {
        verifyFocusTrappingForModalAndNonModalDialog(PANELDIALOG_NONMODAL_BUTTON, false);
    }

    /**
     * Verify pressing TAB key behavior for modal and nonModal overlay wrt to focus trapping
     * 
     * @param button
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    private void verifyFocusTrappingForModalAndNonModalDialog(String button, Boolean isFocusTrapped)
            throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, false);
        openOverlay(button);
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, true);
        assertEquals("Button1 should be active element", "button 1", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
        assertEquals("Button1 should be active element", "button 2", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
        activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
        activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
        if (isFocusTrapped) {
            assertEquals("Button1 should be active element", "button 1", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        }
        else {
            // Test case for W-2424553
            // assertEquals("Show panel slider button should be active element", "Show panel slider",
            // auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        }
        verifyOverlayActive(PANELDIALOG_MODAL_CMP, isFocusTrapped);
    }

    private void openNewOverlayOnTopOfExistingModalOverlay(int expectedOverlay, boolean isTransient)
            throws InterruptedException {
        WebElement newOverlayButton = findDomElement(By.cssSelector(NEWOVERLAY_BUTTON));
        newOverlayButton.click();
        pause(1000);
        List<WebElement> modalOverlays = findDomElements(By.cssSelector(PANELDIALOG_MODAL_CMP));
        assertEquals(String.format("Only %s active overlay should be opened at any point", expectedOverlay),
                expectedOverlay, modalOverlays.size());
    }

    /**
     * Verify overlay is opened
     * 
     * @param overlayCmpLocator
     * @param isActive
     * @throws InterruptedException
     */
    private void verifyOverlayActive(String overlayCmpLocator, boolean isActive) throws InterruptedException {
        pause(1000);
        List<WebElement> activeOverlay = getActiveOverlay(overlayCmpLocator);
        if (isActive) {
            assertNotNull("There should be one overlay active", activeOverlay);
            assertEquals("Only 1 active overlay should be opened at any point", 1, activeOverlay.size());
        }
        else {
            assertNull("No Overlay should be active currently", activeOverlay);
        }
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
    private void openOverlay(String overlayLocator) throws InterruptedException {
        WebDriver driver = this.getDriver();
        WebElement modalOverlayButton = driver.findElement(By.cssSelector(overlayLocator));
        modalOverlayButton.click();
        pause(5000);
    }

    private void pause(long timeout) throws InterruptedException {
        Thread.sleep(timeout);
    }
}
