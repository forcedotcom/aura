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
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Test to verify resizing on inline edit for grid
 */
@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX, BrowserType.IE11, BrowserType.SAFARI})
public class InlineEditGridResizeUITest extends WebDriverTestCase {

    private final String URL = "uitest/inlineEdit_resizeTest.cmp";
    
    /**
     * Test resize column widths
     */
    @Test
    public void testResizeColumnWidth() throws Exception {
    	open(URL);
    	WebDriver driver = getDriver();
    	doTestResizeColumn(driver, "bigger", 1, 10);
    	doTestResizeColumn(driver, "smaller", 1, 5);
    }
    
    private void doTestResizeColumn(WebDriver d, String testCase, int columnIndex, int widthOffset) throws Exception {
    	int expectedWidth = 0;
    	WebElement slider = getSlider(d, columnIndex);
    	int initialWidth = getWidthOfColumn(d, columnIndex);
    	
    	if ("bigger".equals(testCase)) {
    		moveSlider(d, slider, widthOffset, true, true);
    		expectedWidth = 10 * widthOffset + initialWidth;
    	} else {
    		moveSlider(d, slider, widthOffset, false, true);
    		expectedWidth = -10 * widthOffset + initialWidth;
    	}
    	int actualWidth = getWidthOfColumn(d, columnIndex);
    	
    	assertEquals("Column (column index = " + columnIndex + ") width is incorrect after resizing (initial width = " + initialWidth + ")",
    			expectedWidth, actualWidth);
    }
    
    private WebElement getSlider(WebDriver d, int colIndex) {
    	return d.findElements(By.cssSelector("input[type='range']")).get(colIndex);
    }
    
    private int getWidthOfColumn(WebDriver d, int colIndex) {
    	return d.findElements(By.cssSelector("th[scope='col']")).get(colIndex).getSize().getWidth();
    }
    
    private void moveSlider(WebDriver d, WebElement slider, int offset, boolean isPositive, boolean useKeyboard) {
    	if (useKeyboard) {
    		moveSliderWithKeyboard(slider, offset, isPositive);
    	}
    }
    
    private void moveSliderWithKeyboard(WebElement slider, int offset, boolean isPositive) {
    	Keys moveKey;
    	
    	if (isPositive) {
    		moveKey = Keys.ARROW_RIGHT;
    	} else {
    		moveKey = Keys.ARROW_LEFT;
    	}
    	
    	for (int i=0; i<offset; i++) {
    		slider.sendKeys(moveKey);
    	}
    }
}
