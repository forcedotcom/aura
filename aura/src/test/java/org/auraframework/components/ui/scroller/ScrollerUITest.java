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
package org.auraframework.components.ui.scroller;

import java.util.List;

import org.auraframework.test.*;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.touch.TouchActions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.uiautomation.ios.client.uiamodels.impl.augmenter.IOSDriverAugmenter;

/**
 * Test basic scroller
 */
@TargetBrowsers({BrowserType.IPHONE, BrowserType.IPAD})
public class ScrollerUITest extends WebDriverTestCase{

    private static final String SCROLLER_CMP = "/uitest/scroller_basic.cmp";
    private WebDriver driver;
    
    public ScrollerUITest(String name) {
        super(name);
    }
    
    public void testScrollingWorkflow() throws Exception {
        open(SCROLLER_CMP);
        driver = this.getDriver();
        augmentDriver();
        
        //pull to refresh
        this.startFlick(0, 50);
        pause(600);
        //after pull to refresh, we will get 2 data items from server which will be prepended to the DOM
        //they will have id's 0, 1. since it's prepend they will be in viewport anyways, so we are
        //not asserting verifyIfElementInViewport. we are just ensuring we have those 2 data items in the DOM.
        assertEquals("Seems like pull to refresh did not work as expected", 2, verifyPullToRefreshData().size());
        //scroll down vertically and ensure it scrolls correctly by asserting elements that you got in pull to refresh
        //are no longer in viewport now e.g. element with id 1
        this.startFlick(0, -600);
        pause(2500);
        assertFalse("Seems like vertical scrolling did not work after pull to refresh", verifyIfElementInViewport("1"));
        //pull to show more
        //pull to show more will fetch 4 data items from the server and they will be appended to the DOM
        //they will have id's 2, 3, 4, 5 respectively. we are asserting if these 4 data items got appended to the DOM
        this.startFlick(0, -50);
        pause(800);
        assertEquals("Seems like pull to show more did not work as expected", 4, verifyPullToShowMoreData().size());
        //scroll down vertically to get to elements after pull to show more and ensure they are in viewport. we are
        //asserting for data item with id 5
        this.startFlick(0, -600);
        pause(600);
        assertTrue("Seems like vertical scrolling did not work", verifyIfElementInViewport("5"));
    }
    
    private void startFlick(int xOffset, int yOffset){
		new TouchActions(driver).flick(xOffset, yOffset).build().perform();
	}
    
    private void augmentDriver(){
    	driver = IOSDriverAugmenter.getIOSDriver((RemoteWebDriver)driver);
    }
    
    private List<WebElement> verifyPullToRefreshData(){
    	List<WebElement> PTRdata = driver.findElements(By.className("onPTR"));
    	return PTRdata;
    }
    
    private List<WebElement> verifyPullToShowMoreData(){
    	List<WebElement> PTLdata = driver.findElements(By.className("onPTL"));
    	return PTLdata;
    }
    
    private boolean verifyIfElementInViewport(String elementId){
    	String expressionFn = "window.isElementInViewport = function(el) {" +
    	    "var rect = el.getBoundingClientRect();" +

    	    "return (" +
    	        "rect.top >= 0 &&" +
    	        "rect.left >= 0 &&"+
    	        "rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&"+
    	        "rect.right <= (window.innerWidth || document.documentElement.clientWidth)"+
    	    ");" +
    	"}";
    	String expression = "return window.isElementInViewport(document.getElementById('"+elementId+"'));";
    	
    	((JavascriptExecutor) driver).executeScript(expressionFn);
    	return (Boolean) ((JavascriptExecutor) driver).executeScript(expression);
    }
    //TO-DO
    private void pause(long timeout) throws InterruptedException{
    	Thread.sleep(timeout);
    }
    
}
