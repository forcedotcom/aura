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
package org.auraframework.components.ui;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class LocalizationAppUITest extends WebDriverTestCase {

	public String URL = "/uitest/testLocalizationApp.app";
	
	public LocalizationAppUITest(String name) {
		super(name);		
	}

	// Checking functionality of the inputDate/outputDate components
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testDateComponents() throws Exception {
        open(URL);        
       
        //initial load
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputDate']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputDate']"));
        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2004", elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2004", elementoutput.getText());

        //Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Sep 23, 2005");
        auraUITestingUtil.pressTab(elementInput);
        
        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2005", elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2005", elementoutput.getText());
        
        //Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Sep 23, 2006");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Date']"));
        elementButton.click();
                        
        assertEquals("InputDate component rendered with wrong value", "Sep 23, 2006", elementInput.getAttribute("value"));
        assertEquals("outputDate component rendered with wrong value", "Sep 23, 2006", elementoutput.getText());        
    }
    
    // Checking functionality of the inputDateTime/outputDateTime components
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testDateTimeComponents() throws Exception {
        open(URL);        
       
        //initial load
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputDateTime']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputDateTime']"));
        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2004 4:30:00 PM", elementInput.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2004 4:30:00 PM", elementoutput.getText());

        //Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Oct 23, 2005 9:30:00 AM");
        auraUITestingUtil.pressTab(elementInput);
        
        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2005 9:30:00 AM", elementInput.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2005 9:30:00 AM", elementoutput.getText());
        
        //Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("Oct 23, 2006 9:30:00 AM");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='DateTime']"));
        elementButton.click();
                        
        assertEquals("InputDateTime component rendered with wrong value", "Oct 23, 2006 9:30:00 AM", elementInput.getAttribute("value"));
        assertEquals("outputDateTime component rendered with wrong value", "Oct 23, 2006 9:30:00 AM", elementoutput.getText());        
    }
    
    // Checking functionality of the inputNumber/outputNumber components
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testNumberComponents() throws Exception {
        open(URL);        
       
        //initial load
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputNumber']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputNumber']"));
        assertEquals("InputNumber component rendered with wrong value", "411", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "411", elementoutput.getText());

        //Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("511");
        auraUITestingUtil.pressTab(elementInput);
        
        assertEquals("InputNumber component rendered with wrong value", "511", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "511", elementoutput.getText());
        
        //Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("611");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Number']"));
        elementButton.click();
                        
        assertEquals("InputNumber component rendered with wrong value", "611", elementInput.getAttribute("value"));
        assertEquals("outputNumber component rendered with wrong value", "611", elementoutput.getText());        
    }
    
    // Checking functionality of the inputPercent/outputPercent components
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testPercentComponents() throws Exception {
        open(URL);        
       
        //initial load
        WebElement elementInput = findDomElement(By.cssSelector("input[class~='uiInputPercent']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputPercent']"));
        assertEquals("InputPercent component rendered with wrong value", "1,235%", elementInput.getAttribute("value"));
        assertEquals("outputPercent component rendered with wrong value", "1,235%", elementoutput.getText());

        //Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys(".2235");
        auraUITestingUtil.pressTab(elementInput);
        
        assertEquals("InputPercent component rendered with wrong value", ".2235", elementInput.getAttribute("value"));
        assertEquals("outputPercent component rendered with wrong value", "22%", elementoutput.getText());
        
        //Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("1.2235");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Percent']"));
        elementButton.click();
                        
        assertEquals("InputPercent component rendered with wrong value", "1.2235", elementInput.getAttribute("value"));
        assertEquals("outputPercent component rendered with wrong value", "122%", elementoutput.getText());        
    }
    
    // Checking functionality of the inputCurrency/outputCurrency components
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testCurrencyComponents() throws Exception {
        open(URL);        
        
        //initial load
        WebElement elementInput = findDomElement(By.cssSelector("span[id='MyCurrency'] > input[class~='uiInputNumber']"));
        WebElement elementoutput = findDomElement(By.cssSelector("span[class~='uiOutputCurrency']"));
        assertEquals("InputCurrency component rendered with wrong value", "$123,456.79", elementInput.getAttribute("value"));
        assertEquals("outputCurrency component rendered with wrong value", "$123,456.79", elementoutput.getText());

        //Tab out
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("123456");
        auraUITestingUtil.pressTab(elementInput);
        
        assertEquals("InputCurrency component rendered with wrong value", "123456", elementInput.getAttribute("value"));
        assertEquals("outputCurrency component rendered with wrong value", "$123,456.00", elementoutput.getText());
        
        //Submit click
        elementInput.click();
        elementInput.clear();
        elementInput.sendKeys("123.456");
        WebElement elementButton = findDomElement(By.cssSelector("button[title~='Currency']"));
        elementButton.click();
                        
        assertEquals("InputCurrency component rendered with wrong value", "123.456", elementInput.getAttribute("value"));
        assertEquals("outputCurrency component rendered with wrong value", "$123.46", elementoutput.getText());        
    }
}
