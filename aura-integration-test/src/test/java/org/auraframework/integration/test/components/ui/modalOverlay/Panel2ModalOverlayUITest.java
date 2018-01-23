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
package org.auraframework.integration.test.components.ui.modalOverlay;

import java.util.List;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

@ExcludeBrowsers({BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD,
        BrowserType.IE8})
@Ignore("W-2929107")
public class Panel2ModalOverlayUITest extends WebDriverTestCase {
    private final String APP = "/uitest/panel2_Test.app";
    private final String PARAM_PANEL_TYPE = "&testPanelType=";
    private final String PARAM_DIRECTION = "&testDirection=";
    private final String PARAM_USE_FOOTER = "&testUseFooter=";
    private final String PARAM_TRAP_FOCUS = "&testTrapFocus=";
    private final String PARAM_CLOSE_ON_LOCATION_CHANGE = "&testCloseOnLocationChange";
    private final String FLAVOR = "&testFlavor=";
    private final String CREATE_PANEL_BUTTON = ".createPanelBtnClass";
    private final String PANEL_DIALOG = ".uiPanel";
    private final String PANEL_MODAL = ".uiModal";
    private final String CLOSE_ON_CLICKOUT = ".inputcloseOnClickOutClass";
    private final String MAKE_SCROLLABLE = ".inputMakeScrollableClass";
    private final String MAKE_NONSCROLLABLE = ".inputNonScrollableClass";
    private final String ENABLE_CUSTOM_CLOSEACTION = ".inputCustomizeCloseAction";
    private final String INPUT_PANELTYPE = ".inputPanelTypeClass";
    private final String INPUT_AUTOFOCUS = ".inputAutoFocusClass";
    private final String INPUT_CLOSE_ON_LOCATION_CHANGE = ".inputCloseOnLocationChange";

    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String APP_INPUT = ".appInput";
    private final String APP_INPUT2 = ".appInput2";
    private final String CLOSE_BTN = "closeBtn";

    /**
     * [Accessibility] modal closing on Esc key. Bug: W-2617212
     */
    @Test
    public void testPressEscKeyOnModalWithAutoFocusSet() throws Exception {
        String panelType = "modal";
        Boolean autoFocus = true;
        verifyCloseOnEsc(panelType, autoFocus);
    }

    /**
     * [Accessibility] panel dialog closing on Esc key. Bug: W-2643030
     */
    @Test
    public void testPressEscKeyOnPanelDialogWithAutoFocusSet() throws Exception {
        String panelType = "panel";
        Boolean autoFocus = true;
        verifyCloseOnEsc(panelType, autoFocus);
    }

    /**
     * [Accessibility] modal closing on Esc key. Bug: W-2617212
     */
    @Test
    public void testPressEscKeyOnModalWithAutoFocusNotSet() throws Exception {
        String panelType = "modal";
        Boolean autoFocus = false;
        verifyCloseOnEsc(panelType, autoFocus);
    }

    /**
     * [Accessibility] panel dialog closing on Esc key. Bug: W-2643030
     */
    @Test
    public void testPressEscKeyOnPanelDialogWithAutoFocusNotSet() throws Exception {
        String panelType = "panel";
        Boolean autoFocus = false;
        verifyCloseOnEsc(panelType, autoFocus);
    }

    private void verifyCloseOnEsc(String panelType, Boolean autoFocus) throws Exception {
        String url = APP;
        boolean isPanel = panelType.contains("panel");
        if (isPanel) {
            url += "?" + PARAM_PANEL_TYPE + panelType;
        }
        open(url);
        if (!autoFocus) {
            // disable autoFocus
            WebElement autoFocusElement = findDomElement(By.cssSelector(INPUT_AUTOFOCUS));
            autoFocusElement.click();
        }
        openPanel();
        if (isPanel) {
            waitForPanelDialogOpen();
        } else {
            waitForModalOpen();
        }

        if (autoFocus) {
            waitTillFocusOnTopElement();
        } else {
            waitTillFocusOnParticularElement(CLOSE_BTN, "Focus should be on closeBtn");
        }

        WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.ESCAPE);
        if (isPanel) {
            waitForPanelDialogClose();
        } else {
            waitForModalClose();
        }
    }

    /**
     * Wait till the focus is on the top input element for panel/modal.
     */
    private void waitTillFocusOnTopElement() {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
                String activeElementValue = activeElement.getAttribute("value");
                return activeElementValue.equals("modal");
            }
        }, "After opening panel/modal, focus is not on first input");
    }

    /**
     * Wait till focus is on the correct element
     *
     * @param elementClassName: Element on which you expect the focus to be on
     * @param failureMessage
     */
    private void waitTillFocusOnParticularElement(String elementClassName, String failureMessage) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
                String activeElementClassName = activeElement.getAttribute("class");
                return activeElementClassName.contains(elementClassName);
            }
        }, failureMessage);
    }

    /**
     * Verify custom close action Bug: W-2619406
     */
    @Test
    public void testPressEscKeyOnPanelDialogWhenCloseActionSet() throws Exception {
        open(APP + "?" + PARAM_PANEL_TYPE + "panel");
        WebElement enableCustomCloseAction = findDomElement(By.cssSelector(ENABLE_CUSTOM_CLOSEACTION));
        enableCustomCloseAction.click();

        openPanel();
        waitForPanelDialogOpen();

        waitTillFocusOnTopElement();

        WebElement fistInputElement = findDomElements(By.cssSelector(INPUT_PANELTYPE)).get(1);
        fistInputElement.click();

        fistInputElement.sendKeys(Keys.ESCAPE);
        // ESC does not close the panel
        waitForPanelDialogOpen();
        String actionType = "closeOnEsc";
        verifyCustomCloseActionMethodCalled(actionType);
    }

    private void verifyCustomCloseActionMethodCalled(String actionType) {
        String panelGlobalId = findDomElements(By.cssSelector(".info .idCurrent")).get(0).getText();
        String attrValueExp = getAuraUITestingUtil().getValueFromCmpExpression(panelGlobalId, "v.closeActionCalled");
        String expectedText = String.format("CloseActionCustomMethodCalled when %s", actionType);

        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String attrValueText = (String) getAuraUITestingUtil().getEval(attrValueExp);
                return attrValueText.contains(expectedText);
            }
        }, "Custom close on Action method was not called");
    }

    /**
     * Test modal does have scrollbar when content is not so long Test case: W-2615146
     */
    @Test
    public void testModalWithScrollBar() throws Exception {
        verifyScrollbarPresent(true, MAKE_SCROLLABLE);
    }

    /**
     * Test modal does have scrollbar when content is not so long Test case: W-2615146
     * <p>
     * Excluding in IE11 for now because added extra padding to modal-body causing scroller to appear because font is
     * bigger than body and the body has overflow-y:auto. Tried css changes to outputText but it did not work.
     */
    @ExcludeBrowsers({BrowserType.IE11})
    @Test
    public void testModalWithoutScrollBar() throws Exception {
        verifyScrollbarPresent(false, MAKE_NONSCROLLABLE);
    }

    private void verifyScrollbarPresent(boolean hasScrollbar, String locator) throws Exception {
        open(APP);
        String errorMessage = "Scroller should not be present for Modal body";
        WebElement makeScrollable = findDomElement(By.cssSelector(locator));
        makeScrollable.click();

        if (hasScrollbar) {
            errorMessage = "Scroller should be present for Modal body";
        }
        openPanel();
        waitForModalOpen();
        String bodyClassName = "modal-body";
        boolean hasScroll = getAuraUITestingUtil().hasScrollBar(bodyClassName);
        assertEquals(errorMessage, hasScrollbar, hasScroll);
    }

    /**
     * Test multiple modal one above another, should close top panel when we press ESC on the newest panel
     */
    @Test
    public void testMultipleModalPressEscKeyWithAutoFocusSet() throws Exception {
        verifyPressingEscOnMultipleModalDestorysModal(PANEL_MODAL, true);
    }

    @Test
    public void testMultipleModalPressEscKeyWithAutoFocusNotSet() throws Exception {
        verifyPressingEscOnMultipleModalDestorysModal(PANEL_MODAL, false);
    }

    @Test
    public void testMultiplePanelPressEscKeyWithAutoFocusSet() throws Exception {
        verifyPressingEscOnMultipleModalDestorysModal(PANEL_DIALOG, true);
    }

    @Test
    public void testMultiplePanelPressEscKeyWithAutoFocusNotSet() throws Exception {
        verifyPressingEscOnMultipleModalDestorysModal(PANEL_DIALOG, false);
    }

    private void verifyPressingEscOnMultipleModalDestorysModal(String locator, boolean autoFocus)
            throws Exception {
        String url = APP;
        boolean isPanel = locator.contains(PANEL_DIALOG);
        String errorMessage = "modal";
        if (isPanel) {
            url += "?" + PARAM_PANEL_TYPE + "panel";
            errorMessage = "panel";
        }

        open(url);

        // disable autoFocus for modal 1
        if (!autoFocus) {
            WebElement autoFocusElement = findDomElement(By.cssSelector(INPUT_AUTOFOCUS));
            autoFocusElement.click();
        }

        openPanel();
        if (locator.contains(PANEL_MODAL)) {
            waitForModalOpen();
        } else {
            waitForPanelDialogOpen();
            WebElement fistInputElement = findDomElements(By.cssSelector(INPUT_PANELTYPE)).get(1);
            fistInputElement.clear();
            fistInputElement.click();
            fistInputElement.sendKeys("panel");
        }

        verifyModalPanelIsActive(String.format("First %s should have class active", errorMessage), locator, true, 0);
        openPanel(2);
        waitForNumberOfPanels(locator, 2);

        verifyModalPanelIsActive(String.format("First %s should not have class active after opening second modal", errorMessage), locator, false, 0);
        verifyModalPanelIsActive(String.format("Second %s should have class active", errorMessage), locator, true, 1);

        waitTillFocusOnTopElement();

        WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.ESCAPE);
        waitForNumberOfPanels(locator, 1);

        verifyModalPanelIsActive(String.format("First %s should have class active after press ESC on 2nd %s", errorMessage, errorMessage), locator, true, 0);

        activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.ESCAPE);
        waitForNumberOfPanels(locator, 0);
    }

    private void verifyModalPanelIsActive(String failureMessage, String locator, boolean isActive, int modalPanelNumber) {
        WebElement element = findDomElements(By.cssSelector(locator)).get(modalPanelNumber);
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return element.getAttribute("class").contains("active") == isActive;
            }
        }, failureMessage);
    }

    /**
     * [Accessibility] panel dialog should not close when closeOnClickOut is not set to true
     */
    @Test
    public void testPanelDialogWithCloseOnClickOutNotSet() throws Exception {
        open(APP + "?" +
                PARAM_PANEL_TYPE + "panel");
        openPanel();
        waitForPanelDialogOpen();

        WebElement inputText = findDomElement(By.cssSelector(APP_INPUT));
        inputText.click();
        waitForNumberOfPanels(PANEL_DIALOG, 1);
    }

    /**
     * [Accessibility] panel dialog should close when closeOnClickOut is set to true
     */
    @Test
    public void testPanelDialogWithCloseOnClickOutSet() throws Exception {
        open(APP + "?" +
                PARAM_PANEL_TYPE + "panel");

        WebElement closeOutChexbox = findDomElement(By.cssSelector(CLOSE_ON_CLICKOUT));
        closeOutChexbox.click();

        openPanel();
        waitForPanelDialogOpen();
        waitTillFocusOnTopElement();

        WebElement inputText = findDomElement(By.cssSelector(APP_INPUT));
        inputText.click();
        waitForNumberOfPanels(PANEL_DIALOG, 0);
    }

    /**
     * Verify custom close action Bug: W-2619406
     */
    @Test
    public void testPanelDialogWithCloseOnClickOutSetAndCustomCloseActionSet() throws Exception {
        open(APP + "?" +
                PARAM_PANEL_TYPE + "panel");
        WebElement closeOutChexbox = findDomElement(By.cssSelector(CLOSE_ON_CLICKOUT));
        closeOutChexbox.click();
        WebElement enableCustomCloseAction = findDomElement(By.cssSelector(ENABLE_CUSTOM_CLOSEACTION));
        enableCustomCloseAction.click();
        openPanel();
        waitForPanelDialogOpen();
        waitTillFocusOnTopElement();

        WebElement inputText = findDomElement(By.cssSelector(APP_INPUT));
        inputText.click();
        // Click outside should not close the panel
        waitForPanelDialogOpen();

        String actionType = "closeOnClickOut";
        verifyCustomCloseActionMethodCalled(actionType);
    }

    /**
     * Tabs on Modal overlay should do focus trapping and not close the overlay
     */
    @Test
    public void testModalFocusTrapping() throws Exception {
        String panelType = "modal";
        String url = APP + "?" + PARAM_PANEL_TYPE + panelType;
        open(url);
        cycleThroughPanelInputElements(url, "modal", false);
    }

    /**
     * Tabs on panel dialog should close the panel and not trap the focus within the panel
     */
    @Test
    public void testPanelDoesNotDoFocusTrapping() throws Exception {
        String panelType = "panel";
        String url = APP + "?" + PARAM_PANEL_TYPE + panelType;
        open(url);
        cycleThroughPanelInputElements(url, "panel", true);
    }

    /**
     * Verify custom close action Bug: W-2619406
     */
    @Test
    public void testPanelTabOutCallsCustomCloseActionWhenSet() throws Exception {
        String panelType = "panel";
        String url = APP + "?" + PARAM_PANEL_TYPE + panelType;
        open(url);
        WebElement enableCustomCloseAction = findDomElement(By.cssSelector(ENABLE_CUSTOM_CLOSEACTION));
        enableCustomCloseAction.click();
        cycleThroughPanelInputElements(url, "panel", false);
        String actionType = "closeOnTabOut";
        verifyCustomCloseActionMethodCalled(actionType);
    }

    /**
     * Tabs on panel with full-screen should close the panel and not trap the focus within the panel
     */
    @Test
    public void testPanelWithFullScreenDoesNotDoFocusTrapping() throws Exception {
        String panelType = "panel";
        String flavor = "full-screen";
        String url = APP + "?" + PARAM_PANEL_TYPE + panelType + FLAVOR + flavor;
        open(url);
        cycleThroughPanelInputElements(url, "panel", true);
    }

    /**
     * Tab out closes panel and sets focus back on element that called it. Test panel focuses on reference element after
     * its been closed.
     */
    @Test
    public void testPanelTabOutFocus() throws Exception {
        String url = APP + "?" + PARAM_PANEL_TYPE + "panel" +
                PARAM_DIRECTION + "south";

        open(url);

        // open panel
        WebElement input = findDomElement(By.cssSelector(APP_INPUT2));
        input.click();
        waitForPanelDialogOpen();

        waitTillFocusOnParticularElement(CLOSE_BTN, "Focus should be on closeBtn");

        // tab out to close
        WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        activeElement.sendKeys(Keys.TAB);
        waitForPanelDialogClose();

        // check focus
        waitTillFocusOnParticularElement("appInput2", "Active element is not app input");
    }

    /**
     * Test tabbing goes through footer
     */
    @Test
    public void testPanelTabWithFooter() throws Exception {
        String url = APP + "?" + PARAM_PANEL_TYPE + "modal" +
                PARAM_USE_FOOTER + "true";

        open(url);
        cycleThroughPanelInputElements(url, "modal", false);


        // check focus on footer's button
        waitTillFocusOnParticularElement("defaultCustomPanelFooterBtn", "Active element is not button in footer");
    }
    
    /**
     * Test panel when trapFocus is false
     */
    @Test
    public void testPanelTabingWithTrapFocusFalse() throws Exception {
    	String url = APP + "?" + PARAM_TRAP_FOCUS + "false";

        open(url);
        cycleThroughPanelInputElements(url, "modal", false);

        // check focus outside of panel
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
                String tag = activeElement.getTagName();
                return "body".equals(tag);
            }
        }, "Focus should be on element outside of panel.");
    }
    
    /**
     * Test back button on browser closes panel.
     */
    @Test
    public void testBrowserBackButton() throws Exception {
    	String url = APP + "?" + PARAM_CLOSE_ON_LOCATION_CHANGE + "true";
    	open(url);
    	
    	openPanel();
        waitForModalOpen();
        
        WebElement closeOnLocationChangeCheckbox = findDomElements(By.cssSelector(INPUT_CLOSE_ON_LOCATION_CHANGE)).get(1);
        closeOnLocationChangeCheckbox.click();
        openPanel(2);
        waitForNumberOfPanels(PANEL_MODAL, 2);
        
        getDriver().navigate().back();
        waitForModalClose();
    }

    private void cycleThroughPanelInputElements(String url, String panelType, boolean doesPanelClose) throws Exception {
        openPanel();
        if (panelType.equals("modal")) {
            waitForModalOpen();
        } else {
            waitForPanelDialogOpen();
        }
        List<WebElement> firstInput = findDomElements(By.cssSelector(INPUT_PANELTYPE));
        firstInput.get(1).click();
        WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        // assertEquals("Focus should be on first element", panelType, auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        int numElements = 27;
        // cycle through input elements on panel
        for (int i = 1; i < numElements; i++) {
            WebElement prevActiveElement = activeElement;
            activeElement.sendKeys(Keys.TAB);
            activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
            getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    WebElement activeElement = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
                    return activeElement != prevActiveElement;
                }
            }, String.format("Tab event was not fired for element with className: %s", prevActiveElement.getAttribute("class")));
        }

        // on close button
        activeElement.sendKeys(Keys.TAB);

        if (doesPanelClose) {
            if (panelType.equals("modal")) {
                waitForModalClose();
            } else {
                waitForPanelDialogClose();
            }
        } else {
            /*
             * activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
             * assertEquals("Panel should not be close and focus should be on first element", panelType,
             * auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
             */
            if (panelType.equals("modal")) {
                waitForModalOpen();
            } else {
                waitForPanelDialogOpen();
            }
        }
    }

    private void openPanel() {
        openPanel(1);
    }

    private void openPanel(int panelNumber) {
        List<WebElement> createPanelBtn = findDomElements(By.cssSelector(CREATE_PANEL_BUTTON));
        createPanelBtn.get(panelNumber - 1).click();
    }

    private void waitForModalOpen() throws InterruptedException {
        waitForPanel(PANEL_MODAL, true);
    }

    private void waitForModalClose() throws InterruptedException {
        waitForPanel(PANEL_MODAL, false);
    }

    private void waitForPanelDialogOpen() throws InterruptedException {
        waitForPanel(PANEL_DIALOG, true);
    }

    private void waitForPanelDialogClose() throws InterruptedException {
        waitForPanel(PANEL_DIALOG, false);
    }

    private void waitForPanel(final String panelType, final boolean isOpen) throws InterruptedException {
        By locator = By.cssSelector(panelType);
        if (isOpen) {
            getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    List<WebElement> panels = findDomElements(locator);
                    return panels != null;
                }
            }, String.format("Panel %s is not open", panelType));
        } else {
            String failureMessage = String.format("Panel Type: %s is not open", panelType);
            isPanelPresent(failureMessage, false, locator);
        }
    }

    private void waitForNumberOfPanels(String panelType, int numPanels) throws InterruptedException {
        By locator = By.cssSelector(panelType);
        if (numPanels != 0) {
            getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    List<WebElement> elements = findDomElements(locator);
                    return elements.size() == numPanels;
                }
            }, String.format("Number of panels open is incorrect, it should be: %s", numPanels));
        } else {
            String failureMessage = "No panels should be opened";
            isPanelPresent(failureMessage, false, locator);
        }
    }

    private void isPanelPresent(String failureMessage, boolean isElemPresent, By locator) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return isElementPresent(locator) == isElemPresent;
            }
        }, failureMessage);
    }
}
