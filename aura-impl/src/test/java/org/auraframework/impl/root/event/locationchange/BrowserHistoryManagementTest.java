/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.root.event.locationchange;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Tests that Verify the mechanics of Browser History Management. Location
 * Change event is an APPLICATION event. {@link aura.def.EventType} Which means
 * that all handler registered to handle this event are invoked. NOTE: Location
 * change event is fired as soon as the page is loaded. Implementation is in
 * AuraHistoryService_Private.js
 */
public class BrowserHistoryManagementTest extends WebDriverTestCase {
    public BrowserHistoryManagementTest(String name) {
        super(name);
    }

    /**
     * A basic component which has specified a event to be fired for location
     * change but has no handler.
     * 
     * @exception Changes the URL to the location specified in the client action
     *                but nothing else.
     */
    public void testNoHandlerForLocationChange() throws MalformedURLException, URISyntaxException {
        open("/test/test_LocChng_NoHandler.app");
        String content = getBodyText();
        findByXpath("//div[contains(@class,'identifier')]").click();
        assertEquals("Contents on the page changed even though location change event was not handled", content,
                getBodyText());
        assertEquals("WillDoNothing", auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
    }

    private String getBodyText() {
        return getDriver().findElement(By.tagName("body")).getText();
    }

    /**
     * Verify that browser History events are fired with a simple component.
     * Have a simple component which has registered an event for handling
     * Location Change. Have a handler which handles this location change event.
     * Verify that the handler was evoked when aura.historyService.set()
     */
    public void testBrowserHistoryInteractionInSimpleComponent() throws MalformedURLException, URISyntaxException {
        open("/test/test_LocChng_SimpleComponent.app");
        findByXpath("//div[contains(@class,'SimpleComponent')]").click();
        assertTrue(
                "Location change event failed to evoke the right client action",
                "test_LocChng_SimpleComponent#aura:locationChange".equals(findByXpath(
                        "//div[contains(@class,'SimpleComponent')]").getText()));
        assertEquals("ButtonClickedSimpleComponent",
                auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
        assertEquals("1", auraUITestingUtil.getEval("return window.aura.historyService.get().num"));
    }

    /**
     * Verify that browser History events in a complex component with multiple
     * handlers. Have a simple component which has registered an event for
     * handling Location Change. Have a Bigger component which has registered an
     * event for handling Location Change and also includes the simple component
     * within it's body. Have 2 handlers which handle both location change
     * events. Verify that the handler was evoked when aura.historyService.set()
     * This also tests that all handlers registered for the location change
     * event are invoked.
     */
    public void testBrowserHistoryInteractionInComplexComponent() throws MalformedURLException, URISyntaxException {
        open("/test/test_LocChng_CompositeComponent.app");
        String compositeCmp = "//div[contains(@class,'CompositeComponent')]";
        findByXpath(compositeCmp).click();
        assertTrue("Location change event failed to evoke the right client action",
                "test_LocChng_Composite:test:test_LocChng_Event2".equals(findByXpath(compositeCmp).getText()));
        /*
         * For Future: When applications can be included as FACETS &&
         * "test_LocChng_SimpleComponent#test:test_LocChng_Event2"
         * .equals(this.getText("//div[contains(@class,'SimpleComponent')]"))
         */
        assertEquals("ButtonClickedCompositeComponent",
                auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
        assertEquals("1", auraUITestingUtil.getEval("return window.aura.historyService.get().locator"));

    }

    /**
     * For Future: When Application can be included as FACETS
     */
    public void _testBrowserHistoryInteractionInComplexComponent2() throws MalformedURLException, URISyntaxException {
        /*
         * This verifies that even though the Inner component has its own
         * location change event, in the context of another bigger component,
         * only the root component's location change event is fired. In this
         * case test:test_LocChng_Event2
         */
        open("/test/test_LocChng_CompositeComponent.app");
        findByXpath("//div[contains(@class,'SimpleComponent')]").click();

        assertEquals("Location change event failed to evoke the right client action",
                "test_LocChng_Composite:test:test_LocChng_Event2",
                findByXpath("//div[contains(@class,'CompositeComponent')]").getText());
        assertEquals("Location change event failed to evoke the right client action",
                "test_LocChng_SimpleComponent#test:test_LocChng_Event2",
                findByXpath("//div[contains(@class,'SimpleComponent')]").getText());
        assertEquals("ButtonClickedSimpleComponent",
                auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
        assertEquals("1", auraUITestingUtil.getEval("return window.aura.historyService.get().locator"));

    }

    /**
     * Verify the functionality of "aura.historyService.back()" and
     * "aura.historyService.forward()". The component has 3 buttons. One to
     * start the navigation and the other two to go back and forth using Aura
     * History Service. The locator string used in the aura.historyService.set()
     * has an attribute value which is used to initialize the location change
     * event for this component. test:test_LocChng_Event is the event and it has
     * a 'num' attribute. The history service set() is setting the values of
     * this attribute. The actions registered for Location Change event handlers
     * use this num. The number is extracted from the event.
     */
    // TODO W-1089043
    public void testNavigation() throws Exception {
        open("/test/test_LocChng_Navigation.app");
        int i = 0;
        String locationChangeIndicator = "//div[contains(@class,'complete')]";
        String displayLocator = "//div[contains(@class,'id')]";
        String nextLocator = "//div[contains(@class,'Next')]";
        String backLocator = "//div[contains(@class,'Back')]";
        // 1
        i = navigateForwardWithClientActionAndVerify(i);
        // 2
        i = navigateForwardWithClientActionAndVerify(i);
        // 3
        i = navigateForwardWithClientActionAndVerify(i);
        // 4
        i = navigateForwardWithClientActionAndVerify(i);

        findByXpath(backLocator).click();
        i--;
        // 3
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals("ButtonClicked", auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
        assertEquals(Integer.toString(i), auraUITestingUtil.getEval("return window.aura.historyService.get().num"));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(backLocator).click();
        i--;
        // 2
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(nextLocator).click();
        i++;
        // 3
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(backLocator).click();
        i--;
        // 2
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(nextLocator).click();
        i++;
        // 3
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(nextLocator).click();
        i++;
        // 4
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());

        // The user hasn't navigated further. So clicking next should still be
        // at the same page
        findByXpath(nextLocator).click();
        // 4
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(nextLocator).click();
        // 4
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());

        // Let's go back 4 times and click one more back to make sure we can't
        // go any further(backwards)
        findByXpath(backLocator).click();
        i--;
        // 3
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(backLocator).click();
        i--;
        // 2
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(backLocator).click();
        i--;
        // 1
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        // Pressing back now only changes the URL to the starting location, when
        // there was don't click me.
        // It actually doesn't change the button label because the client action
        // is not written that way. Don't worry
        // about it
        findByXpath(backLocator).click();
        // 1
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());

        findByXpath(nextLocator).click();
        // 1
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        findByXpath(nextLocator).click();
        i++;
        // 2
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
        // Using the browser's back button
        getDriver().navigate().back();
        i--;
        // 1
        waitForElementPresent(findByXpath(locationChangeIndicator));
        assertEquals(Integer.toString(i), findByXpath(displayLocator).getText());
    }

    private WebElement findByXpath(String xpathLocator) {
        return findDomElement(By.xpath(xpathLocator));
    }

    private int navigateForwardWithClientActionAndVerify(int index) throws Exception {
        findByXpath("//div[contains(@class,'SimpleComponent')]").click();
        index++;
        waitForElementPresent(findByXpath("//div[contains(@class,'complete')]"));
        assertEquals("ButtonClicked", auraUITestingUtil.getEval("return window.aura.historyService.get().token"));
        assertEquals(Integer.toString(index), auraUITestingUtil.getEval("return window.aura.historyService.get().num"));
        assertEquals(Integer.toString(index), findByXpath("//div[contains(@class,'id')]").getText());
        return index;
    }
}
