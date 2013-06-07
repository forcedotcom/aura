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
package org.auraframework.components.ui.carousel;

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

/**
 * Tests to verify ui:carousel keyboard interactions and UI.
 */
@ExcludeBrowsers({BrowserType.IE7, BrowserType.IE8})
public class CarouselUITest extends WebDriverTestCase {
	
	private final String URL = "/uitest/carousel_Test.cmp";
	private final String CAROUSEL_XPATH = "//article[contains(@class, 'uitestCarousel_Test')] | //article[contains(@class, 'myclass')]";
	private final String NAVIGATION_ITEM_SELECTOR = "a[class*='uiCarouselPageIndicatorItem']";
	private final String NAVIGATION_ITEM_SELECTED_SELECTOR = "a[class*='uiCarouselPageIndicatorItem'][class*='carousel-nav-item-selected']";
	private final String CAROUSEL_PAGE_SELECTOR = "section[class*='uiCarouselPage']";
	private final String CAROUSEL_PAGE_ITEM_SELECTOR = "li[class*='uiCarouselPageItem']";
	private final String ACTIVE_ELEMENT_UNIQUE_ID = "return $A.test.getActiveElement().getAttribute('data-aura-rendered-by')";
	private final String AURA_RENDERED_BY_ID = "data-aura-rendered-by";
	
	public CarouselUITest(String name) {
		super(name);
	}
	
	/**
	 * Able to tab into a page on the carousel.
	 */
	public void testTabIntoCarouselPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1); 
		WebElement page = getPageOnCarousel(carousel, 2);
		
		// setup
		WebElement navElement = getNavigationItemSelected(carousel);
		navElement.click();
		assertEquals("Navigation bar element should be in focus.", 
				navElement.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
		
		// tab into carousel page
		auraUITestingUtil.pressTab(navElement);
		WebElement element1 = getMDMPageElement(page, 1);
		assertEquals("Should be focused on the first element on the carousel page.", 
				element1.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
	}
	
	/**
	 * Able to tab through elements on a carousel page.
	 */
	// TODO : @ctatlah - clicking on a carouselPageItem does not bring focus 
	public void _testTabingThroughElementsOnCarouselPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		WebElement page = getPageOnCarousel(carousel, 2);
		WebElement element1 = getMDMPageElement(page, 1);
		WebElement element2 = getMDMPageElement(page, 2);
		
		element1.click();
		
		// tab to next element
		auraUITestingUtil.pressTab(element1);
		assertEquals("Should be focused on the second element on the carousel page.", 
				element2.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
		
		// tab to previous element
		shiftTab().perform();
		assertEquals("Shift+Tab to previous element. Should be focused on the first element on the carousel page.", 
				element1.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
	}
	
	/**
	 * While on a carousel page you are able to tab back to the 
	 * navigation indicators.
	 */
	// TODO : @ctatlah - clicking on a carouselPageItem does not bring focus 
	public void _testTabBackToNavigationBar() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		WebElement page = getPageOnCarousel(carousel, 2);
		WebElement element = getMDMPageElement(page, 1);
		WebElement navElement = getNavigationItemSelected(carousel);
		
		element.click();
		
		// tab back to navigation bar
		shiftTab().perform();
		assertEquals("Shift+Tab to navigation bar. Should be focused on the navigation bar item.", 
				navElement.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
	}
	
	/**
	 * Tabing on the last element on a carousel page tabs you out
	 * of the carousel.
	 */
	public void testTabOutOfCarousel() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 3);
		WebElement navItem = getNavigationItemSelected(carousel);
		WebElement nextCarousel = getCarousel(driver, 4);
		WebElement expectedFocus = getNavigationItemOnCarousel(nextCarousel, 3);
		
		// this carousel has no elements on its page so tabbing in will
		// actually tab out. Tabbing once, focus will go on nav bar of
		// the next carousel.
		navItem.click();
		auraUITestingUtil.pressTab(navItem);
		assertEquals("Should be focused on the next carousel page.", 
				expectedFocus.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
		
	}
	
	/**
	 * Tabing out of carousel from the first element on carousel.
	 */
	public void testShiftTabOutOfCarousel() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 4);
		WebElement navItem = getNavigationItemSelected(carousel);
		WebElement previousCarousel = getCarousel(driver, 3);
		WebElement expectedFocus = getNavigationItemOnCarousel(previousCarousel, 1);
		
		// the previous carousel has no elements on its page so tabbing out
		// of this carousel will move focus to the nav bar of the previous carousel.
		navItem.click();
		shiftTab().perform();
		assertEquals("Should be focused on the previous carousel", 
				expectedFocus.getAttribute(AURA_RENDERED_BY_ID), getUniqueIdOfFocusedElement());
	}
	
	/**
	 * Using keyboard arrow keys to get to next page.
	 */
	public void testGoToNextPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		doArrowKeysTest(driver, carousel, Keys.ARROW_RIGHT, 3, "Understanding Execution Governors and Limits");
	}
	
	/**
	 * Using keyboard arrow keys to get to previous page.
	 */
	public void testGoToPreviousPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		doArrowKeysTest(driver, carousel, Keys.ARROW_LEFT, 1, "New Post 1");
	}
	
	/**
	 * Keyboard up arrow key does not change page on carousel.
	 */
	public void testUpArrow() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		doArrowKeysTest(driver, carousel, Keys.ARROW_UP, 2, "New Post 2");
	}
	
	/**
	 * Keyboard down arrow key does not change page on carousel.
	 */
	public void testDownArrow() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 1);
		doArrowKeysTest(driver, carousel, Keys.ARROW_DOWN, 2, "New Post 2");
	}
	
	/**
	 * While on first page attempt to move to a non existent page
	 * before the first page.
	 */
	public void testMovingBeforeFirstPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 3);
		doArrowKeysTest(driver, carousel, Keys.ARROW_LEFT, 1, "page 1");
	}
	
	/**
	 * While on last page attempt to move to a non existent page
	 * after the last page.
	 */
	public void testMovingPastLastPage() throws Exception {
		open(URL);
		WebDriver driver = getDriver();
		WebElement carousel = getCarousel(driver, 4);
		doArrowKeysTest(driver, carousel, Keys.ARROW_RIGHT, 3, "page 3");
	}
	
	private void doArrowKeysTest(WebDriver d, WebElement c, Keys key, int nextPageNum, String expectedTextOnPage) {
		WebElement navItem = getNavigationItemSelected(c);
		
		navItem.sendKeys(key);
		WebElement nextPage = getPageOnCarousel(c, nextPageNum);
		try {
			waitForCarouselPageToChange(nextPage, expectedTextOnPage);
		} catch(Exception e) {
			if (e.getMessage().contains("Timed out")) {
				String pageContent = nextPage.getAttribute("innerHTML");
				fail("Used arrow key to get to next/previous page, but page's content is incorrect, " +
						"could not find expected content: '" + expectedTextOnPage + 
						"' in actual content: '" + pageContent + "'");
			} else {
				fail("Got unexpected error while waiting for carousel page to turn: " +
						e.getMessage());
			}
		}
	}
	
	private WebElement getCarousel(WebDriver d, int carouselNum) {
		List<WebElement> carousels = d.findElements(By.xpath(CAROUSEL_XPATH));
		WebElement carousel = carousels.get(--carouselNum);
		new Actions(d).moveToElement(carousel).perform();
		return carousel;
	}
	
	private List<WebElement> getPagesOnCarousel(WebElement c) {
		return c.findElements(By.cssSelector(CAROUSEL_PAGE_SELECTOR));
	}
	
	private WebElement getPageOnCarousel(WebElement c, int pageNum) {
		List<WebElement> pages = getPagesOnCarousel(c);
		if (pages.size() > 0 && pageNum <= pages.size()) {
			return pages.get(--pageNum);
		}
		return null;
	}
	
	private WebElement getNavigationItemSelected(WebElement c) {
		return c.findElement(By.cssSelector(NAVIGATION_ITEM_SELECTED_SELECTOR));
	}
	
	private List<WebElement> getNavigationItemsOnCarousel(WebElement c) {
		return c.findElements(By.cssSelector(NAVIGATION_ITEM_SELECTOR));
	}

	private WebElement getNavigationItemOnCarousel(WebElement c, int itemNum) {
		List<WebElement> items = getNavigationItemsOnCarousel(c);
		if (items.size() > 0 && itemNum <= items.size()) {
			return items.get(--itemNum);
		}
		return null;
	}
	
	private WebElement getMDMPageElement(WebElement p, int entityNum) {
		List<WebElement> pageItems = p.findElements(By.cssSelector(CAROUSEL_PAGE_ITEM_SELECTOR));
		assertNotNull("Did not find any crouselPageItems on this page", pageItems);
		return pageItems.get(--entityNum).findElement(By.tagName("a")); // return tab-able element
	}
	
	private String getUniqueIdOfFocusedElement() {
		return (String) auraUITestingUtil.getEval(ACTIVE_ELEMENT_UNIQUE_ID);
	}
}
