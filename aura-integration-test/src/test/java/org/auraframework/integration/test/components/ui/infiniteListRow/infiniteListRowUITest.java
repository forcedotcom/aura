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
package org.auraframework.integration.test.components.ui.infiniteListRow;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

@UnAdaptableTest
@TargetBrowsers({ BrowserType.IPHONE })
public class infiniteListRowUITest extends WebDriverTestCase{
	private static final String TEST_APP = "/uitest/infiniteListRow_Test.cmp";
	private final String INFINITE_LISTROW = "li[class*='uiInfiniteListRow']";	
	private final String DIV_CONTAINER = ".container";	
	private final String SHOW_MORE_BUTTON = ".btnShowMore";	
	private final String REFRESH_BUTTON = ".btnRefresh";	
	private final String ROW_OPENED_SPAN = "span[class*='rowOpened']";
	private final String ROW_CLOSED_SPAN = "span[class*='rowClosed']";
	private final String INFINITE_LISTROW_OPEN = ".uiInfiniteListRow.open";	
    private final String LOADING_INDICATOR = "div.loadingIndicator";
	private int container_x_coordinate;
	private int swipeBody_x_coordinate;
	
	private enum SwipeDirection {
		SWIPE_LEFT,
		SWIPE_RIGHT,
		SWIPE_VERTICAL_DOWN,
		SWIPE_VERTICAL_UP,
    };
    
	/**
	 * Test to verify that logging for swipe works. This is basically checking to make sure that the event fires correctly 
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
    @Test
	public void testHorizontolSwipeLogs () throws MalformedURLException, URISyntaxException, InterruptedException {
		open(TEST_APP);
		setViewPortVariable();
		
        //swipe Right and check span has correct data
      	swipeAndVerifyLog(7, SwipeDirection.SWIPE_LEFT, "Opening row: ListView7 SwipeBody7","No Rows closed");
      	
      	//swipe Left and check span has correct data
      	swipeAndVerifyLog(7, SwipeDirection.SWIPE_RIGHT, "Opening row: ListView7 SwipeBody7","Closing row: ListView7 SwipeBody7");
      		
      	//Get new row and check to make sure that we only one element changes
    	swipeAndVerifyLog(9, SwipeDirection.SWIPE_LEFT, "Opening row: ListView9 SwipeBody9","Closing row: ListView7 SwipeBody7");
      	
	}
	
	/**
	 * Helper method that will get the row and the direction to be swiped, the verify that the correct 
	 * opened and closed messaged are logged.
	 *
	 * @param row
	 * @param swipeDir
	 * @param expectedOpenMsg
	 * @param expectedCloseMsg
	 * @throws InterruptedException
	 */
	public void swipeAndVerifyLog(int row, SwipeDirection swipeDir, String expectedOpenMsg, String expectedCloseMsg) throws InterruptedException{
		//horizontal flick
	    swipeOnElementAndVerify(row, swipeDir);
				
	    //Check open message in span has correct data
	    WebElement span = findDomElement(By.cssSelector(ROW_OPENED_SPAN));
	    assertEquals("Span did not correctly give us the correct log message for opening a row",expectedOpenMsg, span.getText());
	    
	    //Check close message in span has correct data
	    span = findDomElement(By.cssSelector(ROW_CLOSED_SPAN));
	    assertEquals("Span did not correctly give us the correct log message for closing a row", expectedCloseMsg, span.getText());
	}
	
	
	/**
	 * Test to verify default Horizontal left and right swipe
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
    @Test
	public void testHorizontalSwipeGesturesDefaultBehavior() throws MalformedURLException, URISyntaxException, InterruptedException{
		open(TEST_APP);
		setViewPortVariable();
		verifyOnlyOneSwipeBodyIsOpen(null, false);
		//Horizontal right swipe should not swipe
		//TODO: uncomment once W-2327441 is fixed
		//swipeOnElementAndVerify(row7, SwipeDirection.SWIPE_RIGHT);
		//verify there is no uiInfiniteListRow element with class open
		verifyOnlyOneSwipeBodyIsOpen(null, false);
		//horizontal left flick
        swipeOnElementAndVerify(7, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(getListRowElement(7), true);
        //Horizontal right swipe should close the swipeBody
      	swipeOnElementAndVerify(7, SwipeDirection.SWIPE_RIGHT);
      	verifyOnlyOneSwipeBodyIsOpen(null, false);
    }
	
	/**
	 * Test to verify Horizontal left swipe behavior
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
    @Test
	public void testHorizontalLeftSwipeBehavior() throws MalformedURLException, URISyntaxException, InterruptedException{
		open(TEST_APP);
		setViewPortVariable();
		verifyOnlyOneSwipeBodyIsOpen(null, false);
		WebElement row8 = getListRowElement(8);
		WebElement row12 = getListRowElement(12);
		//horizontal left flick on row7
        swipeOnElementAndVerify(7, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(getListRowElement(7), true);
        //Click on row8 should close row7
        clickOnListRowAndWait(row8);
        swipeOnElementAndVerify(8, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(row8, true);
        //click on row12 should close row8
        clickOnListRowAndWait(row12);
        swipeOnElementAndVerify(12, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(row12, true);
        //Horizontal right swipe on row7 should close row12
        swipeOnElementAndVerify(7, SwipeDirection.SWIPE_RIGHT);
      	verifyOnlyOneSwipeBodyIsOpen(row12, false);
    }
	
	/**
	 * Click on any row to close the open Listrow
	 * @param element
	 * @throws InterruptedException
	 */
	private void clickOnListRowAndWait(WebElement listRow) throws InterruptedException {
		listRow.click();
		pause(1000);
	}

	/**
	 * Test to verify adding more ListRows using show More button should close the open swipeBody if any
	 * 
	 * Commented test out do to bug: W-2472587
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
	public void _testShowMoreListRowsClosesOpenSwipeBody() throws MalformedURLException, URISyntaxException, InterruptedException{
		verifyListRowAfterRefreshOrShowMoreAction("showMore");
	}
	
	/**
	 * Test to verify doing refresh on ListRows should close the open swipeBody if any
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
    @Test
	public void testRefreshOnListRowsClosesOpenSwipeBody() throws MalformedURLException, URISyntaxException, InterruptedException{
        verifyListRowAfterRefreshOrShowMoreAction("refresh");
	}
	
    @Test
	public void testScrollingAnyVerifyDefaultSwipeBehavior() throws MalformedURLException, URISyntaxException, InterruptedException {
		open(TEST_APP);
        setViewPortVariable();
        clickOnShowMore();
        //vertical flick
        swipeOnElementAndVerify(25, SwipeDirection.SWIPE_VERTICAL_DOWN); 

        //left swipe on row35
        swipeOnElementAndVerify(35, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(getListRowElement(35), true);
        swipeOnElementAndVerify(35, SwipeDirection.SWIPE_RIGHT);
        verifyOnlyOneSwipeBodyIsOpen(null, false);
    }
	
	
	private void verifyListRowAfterRefreshOrShowMoreAction(String action) throws MalformedURLException, URISyntaxException, InterruptedException {
		open(TEST_APP);
		setViewPortVariable();
		verifyOnlyOneSwipeBodyIsOpen(null, false);
		int totalListRows = getAllListRows().size();
		assertEquals("Total ListRow on the page should be 25", 25, totalListRows);

		//horizontal left flick on row7
        swipeOnElementAndVerify(20, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(getListRowElement(20), true);
        int expectedListRows = 25;
        if(action.equalsIgnoreCase("showMore")){
        	clickOnShowMore();
        	expectedListRows = 50;
        }
        else{
        	//refresh case
            refreshInfiniteList();
        }
        totalListRows = getAllListRows().size();
        assertEquals("Total ListRow on the page should remain 25 after clicking on refresh button", expectedListRows, totalListRows);
		//Swipe body for row20 should be closed after the action is performed
        verifyOnlyOneSwipeBodyIsOpen(null, false);
    }

	/**
	 * Automation for vertical swipe support to infiniteList & infiniteListRow
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 * Bug: W-2257072
	 */
    @Test
	public void testVerticalSwipeClosesOpenSwipeBody() throws MalformedURLException, URISyntaxException, InterruptedException{
		open(TEST_APP);
		setViewPortVariable();
		verifyOnlyOneSwipeBodyIsOpen(null, false);

		//horizontal left flick
        swipeOnElementAndVerify(7, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen( getListRowElement(7), true);
        //Vertical right swipe should close the swipeBody
        performFlick( getListRowElement(1), 0, -4000);
      	verifyOnlyOneSwipeBodyIsOpen(null, false);
    }
	
	/**
	 * tap outside of active row should close active row
	 * Bug: W-2297263
	 * @throws MalformedURLException
	 * @throws URISyntaxException
	 * @throws InterruptedException
	 */
    @Test
	public void testTapOnNonActiveRowClosesActiveRow() throws MalformedURLException, URISyntaxException, InterruptedException{
		open(TEST_APP);
		setViewPortVariable();
		verifyOnlyOneSwipeBodyIsOpen(null, false);

		//horizontal left flick
        swipeOnElementAndVerify(7, SwipeDirection.SWIPE_LEFT);
        verifyOnlyOneSwipeBodyIsOpen(getListRowElement(7), true);
        //tap on non active list row1 should close swipe body for row7
        clickOnListRowAndWait(getListRowElement(1));
        verifyOnlyOneSwipeBodyIsOpen(null, false);
	}
	
	/**
	 * To verify swipe body for the listRow that is opened after the Horizontal swipe is done
	 * @param listRow
	 * @param isPresent
	 */
	private void verifyOnlyOneSwipeBodyIsOpen(WebElement listRow, boolean isPresent) {
		List<WebElement> openRow = getListRowOpened();
		if(isPresent){
			assertEquals("Swipe Body for Only one list row should be opened", 1, openRow.size());
			WebElement actualRow = openRow.get(0);
			assertEquals(String.format("Correct List Row is not Opened it should be %s", listRow.getText()), listRow, actualRow);
		}else{
			assertNull("No Swipe Body should be opened", openRow);
		}
		
	}

	/**
	 * Method To add more listRows on the page
	 * @throws InterruptedException
	 */
	private void clickOnShowMore() {
		WebElement showMoreButton = findDomElement(By.cssSelector(SHOW_MORE_BUTTON));
		showMoreButton.click();
		waitForLoadingIndicatorToDisappear();
	}

	private void waitForLoadingIndicatorToDisappear() {
        getAuraUITestingUtil().waitForElementNotDisplayed(By.cssSelector(LOADING_INDICATOR),
                "The 'loadingIndicator' never disappeared.");
    }

    /**
	 * Set x-coordinate of the container and x-coordinate for swipeBody to some variables for future reference
	 * Helpful to check if element is within the viewport after swipe gestures
	 */
	private void setViewPortVariable() {
		WebElement container = findDomElement(By.cssSelector(DIV_CONTAINER));
		container_x_coordinate = container.getLocation().getX();
		WebElement row1 = getListRowElement(1);
		WebElement row1SwipeBody = getListRowSwipeBody(row1);
		swipeBody_x_coordinate = row1SwipeBody.getLocation().getX();
	}
	
	/**
	 * Swipe and then verify if the element is within or outside of the viewport depending
	 * on the swipe gesture performed
	 * @param elem
	 * @param swipeOption
	 * @throws InterruptedException
	 */
	private void swipeOnElementAndVerify(int elmRow, SwipeDirection swipeOption) throws InterruptedException {
		WebElement elm = getListRowElement(elmRow);
		WebElement swipBody;
		WebElement eleBody;
		switch (swipeOption) {
        case SWIPE_LEFT:
        	performFlick(elm, -10000, 0);
        	elm = getListRowElement(elmRow);
        	swipBody = getListRowSwipeBody(elm);
        	eleBody = getListRowBody(elm);
            getAuraUITestingUtil().waitUntil((driver) -> {
                return swipBody.isDisplayed();
            }, String.format("Swipe body for %s should be visible on the page after horizontal swipe", swipBody.getText()));
        	int swipeBody_xPos_SL = swipBody.getLocation().getX();
    		int eleBody_xPos_SL = eleBody.getLocation().getX();
            boolean viewPortConditionForSwipeBody_SL = container_x_coordinate <= swipeBody_xPos_SL && swipeBody_xPos_SL <= swipeBody_x_coordinate;
            assertTrue(String.format("%s should be within the view port after horizontal Left swipe",swipBody.getText()), viewPortConditionForSwipeBody_SL);
            boolean viewPortConditionForListBody_SL =  eleBody_xPos_SL < container_x_coordinate;
            assertTrue(String.format("%s should not be within the view port after horizontal Left swipe",eleBody.getText()), viewPortConditionForListBody_SL);
            break;
        case SWIPE_RIGHT:
        	swipBody = getListRowSwipeBody(elm);
        	performFlick(swipBody, 10000, 0);
        	elm = getListRowElement(elmRow);
        	eleBody = getListRowBody(elm);
        	WebElement rowElement = elm;
            getAuraUITestingUtil().waitUntil((driver) -> {
                return rowElement.isDisplayed();
            }, String.format("%s should be visible on the page", eleBody.getText()));
            int swipeBody_xPos_SR = swipBody.getLocation().getX();
    		int eleBody_xPos_SR = eleBody.getLocation().getX();
            boolean viewPortConditionForListBody_SR =  container_x_coordinate <= eleBody_xPos_SR && eleBody_xPos_SR <= swipeBody_x_coordinate;
            assertTrue(String.format("%s should be within the view port after horizontal Right swipe",eleBody.getText()), viewPortConditionForListBody_SR);
            boolean viewPortConditionForSwipeBody_SR = swipeBody_xPos_SR >= swipeBody_x_coordinate;
            assertTrue(String.format("%s should be outside of the view port after horizontal Right swipe",swipBody.getText()), viewPortConditionForSwipeBody_SR);
            break;
        case SWIPE_VERTICAL_DOWN:
        	int totalElementBeforeFlick = getAllListRows().size();
        	performFlick(elm, 0, -200);
        	WebElement lastElement = getListRowElement(totalElementBeforeFlick);
            getAuraUITestingUtil().waitUntil((driver) -> {
                return lastElement.isDisplayed();
            }, String.format("Last Element %s should be visible on the page",getListRowBody(lastElement).getText()));
            break;
        case SWIPE_VERTICAL_UP:
        	performFlick(elm, 0, 200);
        	break;
		}
    }

	/**
	 * Perform swipe gesture
	 * @param elem
	 * @param xOffset
	 * @param yOffset
	 * @throws InterruptedException
	 */
	private void performFlick(WebElement elem, int xOffset, int yOffset) throws InterruptedException {
		flick(elem, xOffset, yOffset);
		pause(1000);
	}

	private void pause(long timeout) throws InterruptedException{
		Thread.sleep(timeout);
	}

	/**
	 * Refresh infinite List
	 */
	private void refreshInfiniteList() {
		WebElement refreshButton = findDomElement(By.cssSelector(REFRESH_BUTTON));
		refreshButton.click();
		waitForLoadingIndicatorToDisappear();
	}

	/**
	 * Get list of rows with the swipe body opened 
	 * @return
	 */
	private List<WebElement> getListRowOpened() {
		By locator = By.cssSelector(INFINITE_LISTROW_OPEN);
		if(isElementPresent(locator)){
			return findDomElements(locator);
		}
		return null;
	}

	private WebElement getListRowSwipeBody(WebElement elem) {
		return elem.findElement(By.cssSelector(".swipeBody"));
	}

	private WebElement getListRowBody(WebElement elem) {
		return elem.findElement(By.cssSelector(".body"));
	}

	/**
	 * Return List Row given particular rowNumber
	 * @param rowNumber
	 * @return
	 */
	private WebElement getListRowElement(int rowNumber) {
		String locator = "li:nth-child(" + rowNumber +")";
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(locator),
                String.format("ListViewRow%s not visible on the screen", rowNumber));
		return findDomElement(By.cssSelector(locator));
	}

	/**
	 * get all ListRows on the page
	 * @return
	 */
	private List<WebElement> getAllListRows() {
		return findDomElements(By.cssSelector(INFINITE_LISTROW));
	}
}
