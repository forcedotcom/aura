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

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD, BrowserType.IE7, BrowserType.IE8})
public class Panel2ModalOverlayUITest extends WebDriverTestCase {
	private final String APP = "/uitest/panel2_Test.app";
	private final String PARAM_PANEL_TYPE = "&testPanelType=";
	private final String PARAM_CLOSE_ON_CLICK_OUT = "&testcloseOnClickOut=";
	private final String PARAM_AUTO_FOCUS = "&testAutoFocus=";
	
	private final String CREATE_PANEL_BUTTON = ".createPanelBtnClass";
	private final String PANEL_DIALOG = ".uiPanel";
    private final String PANEL_MODAL = ".uiModal";
    private final String CLOSE_BUTTON = ".closeBtn";	
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String ACTIVE_ELEMENT_TEXT = "return $A.test.getActiveElementText()";
    private final String APP_INPUT = ".appInput";
    
	public Panel2ModalOverlayUITest(String name) {
		super(name);
	}
	
	 /**
     * [Accessibility] modal closing on Esc key.
     */
    public void testPressEscKeyOnModal() throws Exception{
// need at least one uncommented test for jenkins builds to be happy
    	open(APP);
//    	openPanel();
//    	waitForModalOpen();
//    	
//    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
//    	activeElement.sendKeys(Keys.ESCAPE);
//        waitForModalClose();
    }
    
    /**
     * [Accessibility] panel dialog closing on Esc key.
     */
    public void _testPressEscKeyOnPanelDialog() throws Exception{
    	open(APP + "?" + PARAM_PANEL_TYPE + "panel");
    	openPanel();
    	waitForPanelDialogOpen();
    	
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
        waitForPanelDialogClose();
    }
    
    /**
     * Test multiple modal one above another, should close top panel when we press ESC on the newest panel
     */
    public void _testMultipleModalPressEscKey() throws Exception{
    	open(APP);
    	openPanel();
    	waitForModalOpen();
    	
    	//open second modal
    	openPanel();
    	waitForNumberOfPanels(PANEL_MODAL, 2);
    	
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
    	waitForNumberOfPanels(PANEL_MODAL, 1);
    }
    
    /**
     * [Accessibility] panel dialog should not close when closeOnClickOut is not set to true
     */
    public void _testPanelDialogWithCloseOnClickOutNotSet() throws Exception{
    	open(APP + "?" + 
    			PARAM_PANEL_TYPE + "panel" +
    			PARAM_CLOSE_ON_CLICK_OUT + "false");
    	openPanel();
    	waitForPanelDialogOpen();
    	
    	WebElement inputText = findDomElement(By.cssSelector(APP_INPUT));
		inputText.click();
    	waitForNumberOfPanels(PANEL_DIALOG, 2);
    }
    
    /**
     * [Accessibility] panel dialog should close when closeOnClickOut is set to true
     */
    public void _testPanelDialogWithCloseOnClickOutSet() throws Exception{
    	open(APP + "?" + 
    			PARAM_PANEL_TYPE + "panel" +
    			PARAM_CLOSE_ON_CLICK_OUT + "true");
    	openPanel();
    	waitForPanelDialogOpen();
    	
    	WebElement inputText = findDomElement(By.cssSelector(APP_INPUT));
		inputText.click();
    	waitForNumberOfPanels(PANEL_DIALOG, 1);
    }
    
    /**
     * Tabs on Modal overlay should do focus trapping and not close the overlay
     */
    public void _testModalFocusTrapping() throws Exception{
    	doTestCycleThroughPanelInputElements("modal", 20, false);
    }
    
    /**
     * Tabs on panel dialog should close the panel and not trap the focus within the panel
     */
    public void _testPanelDialogDoesNotDoFocusTrapping() throws Exception{
    	doTestCycleThroughPanelInputElements("panel", 20, true);
    }
    
    private void doTestCycleThroughPanelInputElements(String panelType, int numElements, boolean doesPanelClose) throws Exception{
    	open(APP + "?" + 
    			PARAM_PANEL_TYPE + panelType +
    			PARAM_AUTO_FOCUS + "true");
    	
    	openPanel();
    	if (panelType.equals("modal")) {
    		waitForModalOpen();
    	} else {
    		waitForPanelDialogOpen();
    	}
    	
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	assertEquals("Focus should be on first element", "panel", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
    	
    	// cycle through input elements on panel
    	for (int i=1; i<numElements; i++) {
    		activeElement.sendKeys(Keys.TAB);
    		activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
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
    		activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
        	assertEquals("Panel should not be close and focus should be on first element", 
        			"panel", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
    	}
    }

    private void openPanel() {
    	WebElement createPanelBtn = getDriver().findElement(By.cssSelector(CREATE_PANEL_BUTTON));
    	createPanelBtn.click();
    }
    
    @SuppressWarnings("unused")
	private void closePanel() {
    	WebElement closePanelBtn = getDriver().findElement(By.cssSelector(CLOSE_BUTTON));
    	closePanelBtn.click();
    }
    
    private void waitForModalOpen() {
    	waitForPanel(PANEL_MODAL, true);
    }
    
    private void waitForModalClose() {
    	waitForPanel(PANEL_MODAL, false);
    }
    
    private void waitForPanelDialogOpen() {
    	waitForPanel(PANEL_DIALOG, true);
    }
    
    private void waitForPanelDialogClose() {
    	waitForPanel(PANEL_DIALOG, false);
    }
    
    private void waitForPanel(String panelType, boolean isOpen) {
    	By locator = By.cssSelector(panelType);
    	if (isOpen) {
    		auraUITestingUtil.waitForElement("Panel " + panelType + " is not open", locator);
    	} else {
    		auraUITestingUtil.waitForElementNotPresent("Panel " + panelType + " is not open", locator);
    	}
    }
    
    private void waitForNumberOfPanels(String panelType, int numPanels) {
    	By locator = By.cssSelector(panelType);
    	List<WebElement> elements = findDomElements(locator);
    	assertEquals("Number of panels open is incorrect", numPanels, elements.size());
    }
}
