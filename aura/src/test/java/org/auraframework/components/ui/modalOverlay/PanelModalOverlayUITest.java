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
@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD})
public class PanelModalOverlayUITest extends WebDriverTestCase {

    private static final String APP = "uitest/panelTest.cmp";
    private final String MODAL_OVERLAY_BUTTON = ".modalOverlayButton";	
    private final String MODAL_OVERLAY_CMP = ".uiModalOverlay";	
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String ESC_BUTTON = ".closeBtn";	
    private final String NEWOVERLAY_BUTTON = ".pressOverlay";	
	
    public PanelModalOverlayUITest(String name) {
        super(name);
    }

    /**
     * Verify pressing ESC while modalOverlay dialog is opened should close the overlay
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    /**
     * [Accessibility] modal panels not closing on Esc key.
     * Test case for W-2396326
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException 
     */
    public void testPressEscKeyOnModalOverlay() throws MalformedURLException, URISyntaxException, InterruptedException {
        //verifyTabOutAndEscBehaviour(Keys.ESCAPE, false);
    	open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(MODAL_OVERLAY_BUTTON);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    }
    
    /**
     * [Accessibility] modal panels not closing on Esc key.
     * Test case for W-2396326
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testClickEscButtonOnModalOverlay() throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(MODAL_OVERLAY_BUTTON);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	WebElement escButton = findDomElement(By.cssSelector(ESC_BUTTON));
    	escButton.click();
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    }
    
    /**
     * Stacking multiple overlay one above another should close all the overlay's when we press ESC on the newest overlay
     * @throws MalformedURLException
     * @throws URISyntaxException
     * @throws InterruptedException
     */
    public void testClickEscButtonClosesAllModalOverlays() throws MalformedURLException, URISyntaxException, InterruptedException {
        open(APP);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
    	openOverlay(MODAL_OVERLAY_BUTTON);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	openNewOverlayOnTopOfExistingModalOverlay(2);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, true);
    	WebElement activeElement = (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT);
    	activeElement.sendKeys(Keys.ESCAPE);
    	verifyOverlayActive(MODAL_OVERLAY_CMP, false);
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
