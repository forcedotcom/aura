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
package org.auraframework.integration.test.components.ui.inputSmartNumber;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class BaseInputSmartNumber extends WebDriverTestCase {

    protected final String URL;
    protected final String INPUT_SEL = ".input";
    protected final String OUTPUT_SEL = ".vvalue";
    protected final String SUBMIT_SEL = ".submitBtn";
    protected final String CLEAR_EVENTS_SEL = ".clearEventsBtn";
    protected final String EVENTLIST_SEL = ".eventList li";

    public BaseInputSmartNumber(String urlPath) {
        this.setName(urlPath);
        this.URL = urlPath;
    }

    /***
     * Test for W-2973052.
     * Previously user cannot enter any input that is < min, this prevents user
     * from typing if min is very small. For example, setting min to any number > 9,
     * since the first digit a user types is always <= 9, so input box becomes uneditable
     * unless a user copies and pastes a larger value
     */
    public void testMinAttribute() throws Exception {
        open(URL + "&min=10");
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));
        inputElm.sendKeys("9");
        waitForInputBoxTextPresent(inputElm, "9");
    }

    /**
     * Test invalid inputs are not allowed to enter
     */
    public void testInvalidInputs() throws Exception {
        open(URL);
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));
        String someInvalidInputs = "acde:;`~!@#$%_{([])}^&|\"'*/";

        // do not include "+- " here because 1 + or - is allowed to indicate pos/neg num
        // empty spaces are allowed currently but they get removed after value gets formatted
        inputElm.sendKeys(someInvalidInputs + "12");
        waitForInputBoxTextPresent(inputElm, "12");

        // invalid chars after some numbers, including "+- "
        clearInput(inputElm);
        inputElm.sendKeys("34" + someInvalidInputs + "+- ");
        waitForInputBoxTextPresent(inputElm, "34");

        // invalid chars after decimal marker, including "," now since thousand marker is
        // not allowed after decimal marker(.)
        clearInput(inputElm);
        inputElm.sendKeys("1.2" + someInvalidInputs + "+- ,");
        waitForInputBoxTextPresent(inputElm, "1.2");
    }

    /**
     * Test events when inputting values
     */
    public void testInputEvents() throws Exception {
        open(URL);
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));
        inputElm.sendKeys("1");
        verifyEventsFired(EVENTLIST_SEL, "keydown", "keypress", "input", "keyup");
    }

    /**
     * Test tabbing out of input box should fire blur event
     */
    @ExcludeBrowsers({BrowserType.IPHONE, BrowserType.IPAD})
    public void testTabToBlur() throws Exception {
        open(URL);
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));

        inputElm.click();
        verifyEventsFired(EVENTLIST_SEL, "focus");

        getAuraUITestingUtil().pressTab(inputElm);
        verifyEventsFired(EVENTLIST_SEL, "blur");
    }

    /**
     * Test change event is only fired when input value is changed
     */
    public void testChangeEvent() throws Exception {
        open(URL);
        WebElement inputElm = findDomElement(By.cssSelector(INPUT_SEL));
        WebElement submitBtnElm = findDomElement(By.cssSelector(SUBMIT_SEL));
        WebElement clearEventsBtn = findDomElement(By.cssSelector(CLEAR_EVENTS_SEL));

        // new value, change event should be fired
        inputElm.sendKeys("123");
        submitBtnElm.click();
        verifyEventsFired(EVENTLIST_SEL, "change");

        // clear events to check the next step
        clearEventsBtn.click();
        getAuraUITestingUtil().waitForElementNotPresent("Event list should be cleared", By.cssSelector(EVENTLIST_SEL));

        // change event should be fired if value has not changed
        inputElm.sendKeys("1", Keys.BACK_SPACE);
        submitBtnElm.click();
        verifyEventsNotFired(EVENTLIST_SEL, "change");
    }

    /****************************
     * Helper Functions
     ****************************/

    /**
     * Wait for input to be present in input box
     */
    protected void waitForInputBoxTextPresent(WebElement inputElm, String expectedValue)
            throws Exception {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return expectedValue.equals(inputElm.getAttribute("value"));
            }
        }, "Expected input element's value: " + expectedValue + ", but actual: " + inputElm.getAttribute("value"));
    }
    
    /**
     * A much stabler way to clear the input than inputElm.clear();
     */
    protected void clearInput(WebElement inputElm) throws Exception {
        getAuraUITestingUtil().getEval("document.getElementsByTagName('input')[0].value = '';");
        waitForInputBoxTextPresent(inputElm, "");
    }

    protected void verifyEventsFired(String eventsSel, String ... events) throws Exception {
        verifyEvents(eventsSel, true, events);
    }

    protected void verifyEventsNotFired(String eventsSel, String ... events) throws Exception {
        verifyEvents(eventsSel, false, events);
    }
    
    /**
     * Verify what events are fired
     */
    private void verifyEvents(String eventsSel, Boolean expectEvents, String ... events)
            throws Exception {
        By eventListSel = By.cssSelector(eventsSel);
        getAuraUITestingUtil().waitForElement("Event list should be cleared", eventListSel);

        // get the actual events and lowercase their names just in case
        List<WebElement> eventListElm = findDomElements(eventListSel);
        Set<String> eventsFired = new HashSet<>();
        for (WebElement eventFired : eventListElm) {
            eventsFired.add(eventFired.getText().toLowerCase());
        }

        // lowercase expected events as well and check if actual events contain expected events
        String event;
        for (int i = 0; i < events.length; i++) {
            event = events[i].toLowerCase();
            if (expectEvents) {
                assertTrue("Expected event missing: " + event, eventsFired.contains(event));
            } else {
                assertFalse("Unexpected event fired: " + event, eventsFired.contains(event));
            }
        }
    }
}
