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

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.*;

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
    private final String INPUT_PANEL_SELECTOR = ".slds-popover--edit";
    
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
        getTableElement(driver).sendKeys(Keys.ENTER);
        assertNotNull(driver.findElement(By.cssSelector(INPUT_PANEL_SELECTOR)));
    }
    
    private WebElement waitForActiveCellToLoad(WebDriver wd) {
        getAuraUITestingUtil().waitForElement(By.cssSelector(ACTIVE_CELL_CLASS));
        return wd.findElement(By.cssSelector(ACTIVE_CELL_CLASS));
    }
    
    private void switchKeyboardMode(WebDriver wd) {
        wd.findElements(By.cssSelector(BUTTON_SELECTORS)).get(2).click();
    }
    
    private WebElement getTableElement(WebDriver wd) {
        return wd.findElement(By.cssSelector(".slds-has-focus .slds-cell-edit__button"));
    }
    
    private void pressKey(WebDriver wd, Keys key) {
        wd.findElement(By.cssSelector(".slds-has-focus")).sendKeys(key);
    }

}