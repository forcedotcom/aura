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

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD, BrowserType.IE7, BrowserType.IE8})
public class PanelModalOverlayUITest extends WebDriverTestCase {

    private static final String APP = "/uitest/panelTest.cmp";
    private final String MODAL_OVERLAY_BUTTON = ".panelDialogModalButton";
    private final String NONMODAL_OVERLAY_BUTTON = ".panelDialogNonModalButton";
    private final String PANEL_OVERLAY_BUTTON = ".panelOverlayButton";
    private final String MODAL_OVERLAY_CMP = ".uiPanelDialog";
    private final String PANEL_OVERLAY_CMP = ".uiPanelOverlay";
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String ACTIVE_ELEMENT_TEXT = "return $A.test.getActiveElementText()";
    private final String ESC_BUTTON = ".closeBtn";	
    private final String NEWOVERLAY_BUTTON = ".pressOverlay";	
	
    public PanelModalOverlayUITest(String name) {
        super(name);
    }

    /**
     * [Accessibility] modal overlay dialog closing on Esc key.
     * Test case for W-2396326
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void testPressEscKeyOnModalOverlayDialog() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyPressEscKeyOnModalAndNonModalOverlay(MODAL_OVERLAY_BUTTON, MODAL_OVERLAY_CMP);
    }
    
    /**
     * [Accessibility] non-modal overlay dialog closing on Esc key.
     * Test case for W-2396326
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void testPressEscKeyOnNonModalDialog() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyPressEscKeyOnModalAndNonModalOverlay(NONMODAL_OVERLAY_BUTTON, MODAL_OVERLAY_CMP);
    }
    
    /**
     * [Accessibility] Panel overlay dialog - non Full screen should be closed on Esc key.
     * Test case for W-2424490 
     * TODO: uncomment the test once the bug is fixed.
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void _testPressEscKeyOnPanelOverlayDialog() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyPressEscKeyOnModalAndNonModalOverlay(PANEL_OVERLAY_BUTTON, PANEL_OVERLAY_CMP);
    }
    
    /**
     * Verify pressing ESC while modalOverlay dialog is opened should close the overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    private void verifyPressEscKeyOnModalAndNonModalOverlay(String button, String cmp) throws MalformedURLException, URISyntaxException, InterruptedException {
        //verifyTabOutAndEscBehaviour(Keys.ESCAPE, false);
    	open(APP);
    	verifyOverlayActive(cmp, false);
    	openOverlay(button);
    	verifyOverlayActive(cmp, true);
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
    	verifyOverlayActive(cmp, false);
    }
    
    /**
     * [Accessibility] Modal overlay dialog closes on pressing ESC button.
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void testPressEscButtonOnModalOverlayDialog() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyPressEscButtonOnModalAndNonModalOverlay(MODAL_OVERLAY_BUTTON);
    }
    
    /**
     * [Accessibility] non-modal overlay dialog closes on pressing ESC button.
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void testPressEscButtonOnNonModalDialog() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyPressEscButtonOnModalAndNonModalOverlay(NONMODAL_OVERLAY_BUTTON);
    }
    
    
    /**
     * Verify pressing ESC button with modal and non-modal Overlay dialog
     * @param button
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    private void verifyPressEscButtonOnModalAndNonModalOverlay(String button) throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(button);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	WebElement escButton = findDomElement(By.cssSelector(ESC_BUTTON));
    	escButton.click();
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    }
    
    /**
     * Test multiple overlay one above another on modal overlay should close all the overlay's when we press ESC on the newest overlay
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testClickEscButtonClosesAllModalOverlays() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyClickEscButtonClosesAllModalNonModalOverlays(MODAL_OVERLAY_BUTTON);
    }
    
    /**
     * Test multiple overlay one above another on non-modal overlay should close all the overlay's when we press ESC on the newest overlay
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testClickEscButtonClosesAllNonModalOverlays() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyClickEscButtonClosesAllModalNonModalOverlays(NONMODAL_OVERLAY_BUTTON);
    }
    
    /**
     * verify multiple overlay one above another on modal or nonModal should close all the overlay's when we press ESC on the newest overlay
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void verifyClickEscButtonClosesAllModalNonModalOverlays(String button) throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(button);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	openNewOverlayOnTopOfExistingModalOverlay(2);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    }
    
    /**
     * Tabs on Modal overlay should do focus trapping and not close the overlay
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testModalOverlayDialogDoesFocusTrapping() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyFocusTrappingForModalAndNonModalDialog(MODAL_OVERLAY_BUTTON, true);
    }
    
    /*
     * Tabs on nonModal overlay dialog should close the overlay and not trap the focus within the overlay
     */
    public void testNonModalOverlayDialogDoesNotDoFocusTrapping() throws MalformedURLException, URISyntaxException, InterruptedException{
    	verifyFocusTrappingForModalAndNonModalDialog(NONMODAL_OVERLAY_BUTTON, false);
    }
    
    /**
     * Verify pressing TAB key behavior for modal and nonModal overlay wrt to focus trapping 
     * @param button
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    private void verifyFocusTrappingForModalAndNonModalDialog(String button, Boolean isFocusTrapped) throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(button);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
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
    	if(isFocusTrapped){
    		assertEquals("Button1 should be active element", "button 1", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        }
    	else{
    		//Test case for W-2424553
    		//assertEquals("Show panel slider button should be active element", "Show panel slider", auraUITestingUtil.getEval(ACTIVE_ELEMENT_TEXT));
        }
    	verifyOverlayActive(MODAL_OVERLAY_CMP, isFocusTrapped);
    }
    
    private void openNewOverlayOnTopOfExistingModalOverlay(int expectedOverlay) {
    	WebElement newOverlayButton = findDomElement(By.cssSelector(NEWOVERLAY_BUTTON));
    	newOverlayButton.click();
    	List<WebElement> modalOverlays = findDomElements(By.cssSelector(MODAL_OVERLAY_CMP));
    	assertEquals(String.format("Only %s active overlay should be opened at any point",expectedOverlay), expectedOverlay, modalOverlays.size());
	}

	/**
     * Verify overlay is opened
     * @param overlayCmpLocator
     * @param isActive
     * @throws InterruptedException 
     */
    private void verifyOverlayActive(String overlayCmpLocator, boolean isActive) throws InterruptedException {
    	pause(1000);
		List<WebElement> activeOverlay = getActiveOverlay(overlayCmpLocator);
		if(isActive){
			assertNotNull("There should be one overlay active", activeOverlay);
	    	assertEquals("Only 1 active overlay should be opened at any point", 1, activeOverlay.size());
	    }
		else{
			assertNull("No Overlay should be active currently", activeOverlay);
		}
	}

	/**
	 * Get list of active overlay panel, typically it should just return 1
     * @return 
	 * @return
	 */
	private List<WebElement> getActiveOverlay(String overlayCmpLocator) {
		By locator = By.cssSelector(overlayCmpLocator + ".active");
		if(isElementPresent(locator)){
			return findDomElements(locator);
		}
		return null;
	}

	/**
	 * open overlay panel
	 * @param overlayLocator
	 * @throws InterruptedException 
	 */
	private void openOverlay(String overlayLocator) throws InterruptedException {
		WebDriver driver = this.getDriver();
		WebElement modalOverlayButton = driver.findElement(By.cssSelector(overlayLocator));
    	modalOverlayButton.click();
		pause(5000);
	}
	
	private void pause(long timeout) throws InterruptedException{
		Thread.sleep(timeout);
	}
}
