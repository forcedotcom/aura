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
	
private static final String SCROLLER_CMP1 = "/uitest/scroller_basic.cmp";
//private static final String SCROLLER_CMP2 = "/uitest/scrollerEndless.cmp";
//private static final String SCROLLER_CMP3 = "/uitest/scrollerSnap.cmp";
//private static final String SCROLLER_CMP4 = "/uitest/scrollerNative.cmp";
private WebDriver driver;

public ScrollerUITest(String name) {
    super(name);
}

public void testNothing() {
	
}

public void testScrollingWorkflow() throws Exception {
    open(SCROLLER_CMP1);
    driver = this.getDriver();
    augmentDriver();
    /* disable due to W-2233861
    //attempting pull to refresh
    this.startFlick(0, 50);
    pause(600);
    assertFalse("canRefresh attribute set as false isn't propagated.", 
    		verifyIfElementInViewport("1onPTR"));
    
    //toggling canRefresh to true
    evaluateTogglePTLPTR("PullToRefresh");
    
    //pull to refresh
    this.startFlick(0, 50);
    pause(600);

    //after pull to refresh, we will get 2 data items from 
    //server which will be prepended to the DOM they will 
    //have id's '1onPTR', '2onPTR'. since it's prepend they will be in 
    //viewport anyways, so we are not asserting verifyIfElementInViewport. 
    //we are just ensuring we have those 2 data items in the DOM.
    //if needed, you can assert if the items got correctly 
    //prepended by querying div.items and looking for
    //first two elements in it.
    assertEquals("Seems like pull to refresh did not work as expected", 
    		2, verifyPullToRefreshData().size());
    //scroll down vertically and ensure it scrolls correctly by 
    //asserting elements that you got in pull to refresh
    //are no longer in viewport now e.g. element with id '1onPTR'
    this.startFlick(0, -600);
    pause(2500);
    assertFalse("Seems like vertical scrolling did not work after pull to refresh", 
    		verifyIfElementInViewport("1onPTR"));
    /* disable due to W-2233861
    //attempting to pull to show more when canShowMore attribute is false
    this.startFlick(0, -50);
    pause(2500);
    
    //asserting that pull to show more didnt happen. 
    
    assertFalse("Seems like setting canShowMore attribute false didn't work", 
    		verifyIfElementInViewport("4onPTL"));
    
    //toggling canShowMore to true
    evaluateTogglePTLPTR("PullToShowMore");
    
    //pull to show more
    //pull to show more will fetch 4 data items from the server 
    //and they will be appended to the DOM they will have id's '1onPTL', '2onPTL', '3onPTL', '4onPTL' 
    //respectively. we are asserting if these 4 data items got appended to the DOM
    //if needed, you can assert if the items got correctly appended by 
    //querying div.items and looking for last four elements in it.
    this.startFlick(0, -50);
    pause(2500);
    
    assertEquals("Seems like pull to show more did not work as expected", 
    		4, verifyPullToShowMoreData().size());
    //scroll down vertically to get to elements after pull to 
    //show more and ensure they are in viewport. we are
    //asserting for data item with id '4onPTL' to exist in viewport
    this.startFlick(0, -600);
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work", 
    		verifyIfElementInViewport("4onPTL"));
    
    
    //test for scrollTo and scrollBy events
    //scrollTo top
    evaluateEventExpression("scrollTo","{destination:'top'}");
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work on firing scrollTo", 
    		verifyIfElementInViewport("1onPTR"));
    //scrollTo bottom
    evaluateEventExpression("scrollTo","{destination:'bottom'}");
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work", 
    verifyIfElementInViewport("4onPTL"));
    //scrollBy 
    evaluateEventExpression("scrollBy","{deltaX: 0, deltaY: 600, time: 0}");
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work", 
    verifyIfElementInViewport("r97"));
    
    
    //test for events onBeforeScrollStart, onScrollStart,
    //onScrollMove, onScrollEnd
    //assert event onBeforeScrollStart fired
    assertEquals("Seems like onBeforeScrollStart did not get fired", "1", getEventHandlerExecutionStatus("beforeScrollStartHandlerCalled"));
    //assert event onScrollStart fired
    assertEquals("Seems like onScrollStart did not get fired", "1", getEventHandlerExecutionStatus("scrollStartHandlerCalled"));
    //assert event onScrollMove fired
    assertEquals("Seems like onScrollMove did not get fired", "1", getEventHandlerExecutionStatus("scrollMoveHandlerCalled"));
    //assert event onScrollEndStart fired
    assertEquals("Seems like onScrollEndStart did not get fired", "1", getEventHandlerExecutionStatus("scrollEndHandlerCalled"));
    */
    assertTrue(true);
}
/* disable due to W-2233861
public void testScrollingEndlessHorizontal() throws Exception {
    open(SCROLLER_CMP2);
    driver = this.getDriver();
    augmentDriver();
    
    //testing horizontal scroll works correctly
    this.startFlick(50,0);
    pause(600);
    assertTrue("Seems like horizontal scrolling in the right direction did not work", 
    		verifyIfElementInViewport("r53"));
    this.startFlick(-50,0);
    pause(600);
    assertTrue("Seems like horizontal scrolling in the left direction did not work", 
    		verifyIfElementInViewport("r16"));
    //testing endless scrolling by verifying both the last element and the first element are in viewport.
    this.startFlick(500,0);
    pause(1000);
    assertTrue("Seems like endless scrolling did not work", 
    		verifyIfElementInViewport("r1"));
    assertTrue("Seems like endless scrolling did not work", 
    		verifyIfElementInViewport("r60"));
}

public void testScrollingSnapInfinite() throws Exception {
    open(SCROLLER_CMP3);
    driver = this.getDriver();
    augmentDriver();
    //testing if snap sticky works correctly
    this.startFlick(0,-50);
    pause(600);
    assertTrue("Seems like vertical scrolling did not work", 
    		verifyIfElementInViewport("r22"));
    //scrolling back to top  
    evaluateEventExpression("scrollTo","{destination:'top'}");
    pause(1000);
    //testing if flicking with a different momentum doesn't result in a different element set in viewport.
    //snap plugin property 
    this.startFlick(0,-100);
    pause(600);
    assertTrue("Seems like vertical scrolling did not work", 
    		verifyIfElementInViewport("r22"));
    //scrolling to bottom to evaluate infinite scrolling 
    evaluateEventExpression("scrollTo","{destination:'bottom'}"); 
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work", 
    		verifyIfElementInViewport("4onINF"));
   
}

public void testScrollingNativeFiresEvents() throws Exception {
	 open(SCROLLER_CMP4);
	    driver = this.getDriver();
	    augmentDriver();
	    
	//test for scrollTo event
	//scrollTo bottom
	evaluateEventExpression("scrollTo","{destination:'bottom'}");
	pause(1000);
	assertTrue("Seems like vertical scrolling did not work", 
	verifyIfElementInViewport("r100"));
	//scrollTo top
    evaluateEventExpression("scrollTo","{destination:'top'}");
    pause(1000);
    assertTrue("Seems like vertical scrolling did not work on firing scrollTo", 
    		verifyIfElementInViewport("r1"));
    
	//assert event onScrollMove fired
    assertEquals("Seems like onScrollMove did not get fired", "1", getEventHandlerExecutionStatus("scrollMoveHandlerCalled"));
}
 */
private void startFlick(int xOffset, int yOffset){
	//for iPhone
	int yOffsetByDevice = yOffset;
	
	if(this.getBrowserType() == BrowserType.IPAD){
		yOffsetByDevice = yOffset * 2;
		new TouchActions(driver).flick(xOffset, yOffsetByDevice).build().perform();
	}
	new TouchActions(driver).flick(xOffset, yOffsetByDevice).build().perform();
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
		"if(!el) {" +
	    	"return 'Element was not found in the DOM.';" +
	    "}" +
		"var rect = el.getBoundingClientRect();" +
	    
	    "return (" +
	        "rect.top >= 0 &&" +
	        "rect.left >= 0 &&"+
	        "rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&"+
	        "rect.right <= (window.innerWidth || document.documentElement.clientWidth)"+
	    ");" +
	"}";
	String expression = "return window.isElementInViewport(document.getElementById('"+elementId+"'));";
	auraUITestingUtil.getEval(expressionFn);
	return (Boolean) auraUITestingUtil.getEval(expression);
}

//Thread.sleep is not a good practice, ideally should execute,
//something like auraUITestingUtil.waitUntil(ExpectedCondition)
//but that approach does not work here, since the ExpectedCondition
//will query the DOM (poll) frequently and that interferes with
//the scrolling making it jittery. so the only way is to halt
//WebDriver java calls until the DOM animation completes.

private void pause(long timeout) throws InterruptedException{
	Thread.sleep(timeout);
}

private String getEventHandlerExecutionStatus(String id){
	String expression = "return window.document.getElementById('"+id+"').textContent;";
	return (String) auraUITestingUtil.getEval(expression);
}

private void evaluateEventExpression(String evt, String params){
    String expression = "$A.getRoot().find('test-scroller').getEvent('"+evt+"').setParams("+params+").fire();";
    auraUITestingUtil.getEval(expression);
}
/* disable due to W-2233861
private void evaluateTogglePTLPTR(String evt){
    String expression = "$A.getRoot().find('test-scroller').getScrollerInstance().toggle"+evt+"()";
    auraUITestingUtil.getEval(expression);
}
*/
}
