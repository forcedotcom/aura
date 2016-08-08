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
package org.auraframework.integration.test.components.ui.inlineEditGrid;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * Tests to verify uiExamples/inlineEdit.cmp keyboard interactions and UI.
 * 
 * Tests excluded on mobile browsers (Android, iOS) because WebDriver does not support advanced user interactions such
 * as Actions.moveToElement() yet. Excluded from IE7/8 because uses HTML5 features such as nav.
 */

@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX, BrowserType.IE11})
public class InlineEditGridUITest extends WebDriverTestCase {

    private final String inlineURL = "uitest/inlineEdit_Test.cmp";
    private final String ACTIVE_CELL_CLASS = ".slds-has-focus";
    private final String BUTTON_SELECTORS = ".uiButton";
    private final String EDIT_TRIGGER_SELECTOR = ".slds-has-focus .slds-cell-edit__button";
    private final String INPUT_PANEL_SELECTOR = ".slds-popover--edit";
    private final String INPUT_PANEL_INPUT_SELECTOR = INPUT_PANEL_SELECTOR + " input";
    private final String INPUT_TXT_SELECTOR = ".inputTxt";
    
    @Test
    public void testTabIntoInlineEditGrid() throws Exception {
        open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.TAB);
        for(int i = 0; i < 8; ++i) {
            WebElement activeCell = waitForActiveCellToLoad(driver);
            // verify active cell is in correct place
            assertEquals("Name" + i, activeCell.findElement(By.className("uiOutputText")).getText());
            for(int j = 0; j < 12; ++j) {
                pressKey(driver, Keys.TAB);
            }
        }
    }
    
    @Test
    public void testUpDownArrow() throws Exception {
        open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.TAB);
        for(int i = 0; i < 7; ++i) {
            WebElement activeCell = waitForActiveCellToLoad(driver);
            // verify active cell is in correct place
            assertEquals("Name" + i, activeCell.findElement(By.className("uiOutputText")).getText());
            pressKey(driver, Keys.ARROW_DOWN);
        }
        for(int i = 0; i < 7; ++i) {
            pressKey(driver, Keys.ARROW_UP);
        }
        WebElement activeCell = waitForActiveCellToLoad(driver);
        assertEquals("Name0", activeCell.findElement(By.className("uiOutputText")).getText());
    }
    
    @Test
    public void testLeftRightArrow() throws Exception {
        open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.ARROW_RIGHT);
        WebElement activeCell = waitForActiveCellToLoad(driver);
        assertEquals("Name0", activeCell.findElement(By.className("uiOutputText")).getText());
        for(int i = 0; i < 7; ++i) {
            pressKey(driver, Keys.ARROW_RIGHT);
        }
        for(int i = 0; i < 7; ++i) {
            pressKey(driver, Keys.ARROW_LEFT);
        }
        activeCell = waitForActiveCellToLoad(driver);
        assertEquals("Name0", activeCell.findElement(By.className("uiOutputText")).getText());
    }
    
    @Test
    public void testEnterEditCell() throws Exception {
        open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.ARROW_RIGHT);
        pressKey(driver, EDIT_TRIGGER_SELECTOR, Keys.ENTER);
        assertNotNull(driver.findElement(By.cssSelector(INPUT_PANEL_SELECTOR)));
    }
    
    /**
     * Test tabing out of edit panel.
     */
    @Test
    public void testTabOutOfEditPanel() throws Exception {
    	verifyKeypressEventOnEditPanel(Keys.TAB);
    }
    
    /**
     * Test shift-tab out of edit panel.
     */
    @Test
    public void testShiftTabOutOfEditPanel() throws Exception {
    	verifyKeypressEventOnEditPanel(Keys.SHIFT);
    }
    
    private void verifyKeypressEventOnEditPanel(Keys keyPress) throws MalformedURLException, URISyntaxException {
    	open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.TAB);
        
        // open edit on cell
        pressKey(driver, EDIT_TRIGGER_SELECTOR, Keys.ENTER);
        waitForEditPanelOpen(driver);
        editPanelContent(driver, "abc");
        
        if(keyPress.equals(Keys.TAB)) {
        	// tab out to close
            pressKey(driver, INPUT_PANEL_INPUT_SELECTOR, keyPress);
        }
        else {
            // shift tab out to close
        	driver.findElement(By.cssSelector(INPUT_PANEL_INPUT_SELECTOR)).sendKeys(Keys.SHIFT, Keys.TAB);
        }
        
        waitForEditPanelClose(driver);
        
        verifyCellContent(driver, 0, 1, "abc");
		
	}

	/**
     * Test click out of panel
     */
    @Test
    public void testClickOutOfEditPanel() throws Exception {
    	open(inlineURL);
        WebDriver driver = getDriver();
        switchKeyboardMode(driver);
        pressKey(driver, Keys.TAB);
        
        // open edit on cell
        pressKey(driver, EDIT_TRIGGER_SELECTOR, Keys.ENTER);
        waitForEditPanelOpen(driver);
        editPanelContent(driver, "abc");
        
        // click out to close
        WebElement input = driver.findElement(By.cssSelector(INPUT_TXT_SELECTOR));
        input.click();
        waitForEditPanelClose(driver);
        
        verifyCellContent(driver, 0, 1, "abc");
    }
    
    private WebElement waitForActiveCellToLoad(WebDriver wd) {
        getAuraUITestingUtil().waitForElement(By.cssSelector(ACTIVE_CELL_CLASS));
        return wd.findElement(By.cssSelector(ACTIVE_CELL_CLASS));
    }
    
    private void switchKeyboardMode(WebDriver wd) {
        wd.findElements(By.cssSelector(BUTTON_SELECTORS)).get(2).click();
    }
    
    private void pressKey(WebDriver wd, Keys key) {
    	wd.findElement(By.cssSelector(".slds-has-focus")).sendKeys(key);
    }
    
    private void pressKey(WebDriver d, String selector, Keys key) {
    	d.findElement(By.cssSelector(selector)).sendKeys(key);
    }
    
    private void waitForEditPanelOpen(WebDriver d) {
    	waitForEditPanel(d, true);
    }
    
    private void waitForEditPanelClose(WebDriver d) {
    	waitForEditPanel(d, false);
    }
    
    private void waitForEditPanel(WebDriver d, boolean isOpen) {
    	getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                List<WebElement> panel = d.findElements(By.cssSelector(INPUT_PANEL_SELECTOR));
                return isOpen == panel.size() > 0 ;
            }
        });
    }
    
    private void editPanelContent(WebDriver d, String newContent) {
    	WebElement input = d.findElement(By.cssSelector(INPUT_PANEL_INPUT_SELECTOR));
    	input.clear();
    	input.sendKeys(newContent);
    }
    
    private void verifyCellContent(WebDriver d, int rowIndex, int colIndex, String expected) {
    	WebElement col = d.findElement(By.xpath("//tbody/tr[" + (rowIndex+1) + "]/*[" + (colIndex+1) + 
    			"]//span[@class=\"uiOutputText\"]"));
    	assertEquals("Content for cell at (" + rowIndex + "," + colIndex +") is incorrect.",
    			expected, col.getText());
    }

}