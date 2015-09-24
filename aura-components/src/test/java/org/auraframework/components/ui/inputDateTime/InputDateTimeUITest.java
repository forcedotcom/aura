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

package org.auraframework.components.ui.inputDateTime;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

/*
 * Mobile devices are still using the old time picker.
 */
@ExcludeBrowsers({BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
public class InputDateTimeUITest extends WebDriverTestCase {

    // URL string to go to
    public String URL = "/uitest/inputDateTime_Test.cmp";

    private final String DATE_ICON_SEL = "a[class*='datePicker-openIcon']";
    private final String TIME_ICON_SEL = "a[class*='timePicker-openIcon']";

    private final String TIME_INPUT_BOX_SEL = ".uiInputDateTime .dateTime-inputTime input";
    private final String TIME_PICKER_SEL = ".uiInputTimePicker .visible";

    private final String ACTIVE_ELEM = "return $A.test.getActiveElement()";

    public InputDateTimeUITest(String name) {
        super(name);
    }

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing ESCAPE on timePicker
     * @throws Exception
     */
    public void testTPFocusOnClosingWithEscapeKey() throws Exception {
        open(URL);
        checkTPFocusOnClosingWithKey(Keys.ESCAPE);
    }

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing ENTER on timePicker
     * @throws Exception
     */
    public void testTPFocusOnClosingWithEnterKey() throws Exception {
        open(URL);
        checkTPFocusOnClosingWithKey(Keys.ENTER);
    }

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing SPACE on timePicker
     * @throws Exception
     */
    public void testTPFocusOnClosingWithSpaceKey() throws Exception {
        open(URL);
        checkTPFocusOnClosingWithKey(Keys.ESCAPE);
    }

    /**
     * Test flow:
     * - Open time picker
     * - Click outside
     * - Check if inputTimePicker disappears
     * @throws Exception
     */
    public void testTPCloseWithClick() throws Exception {
         open(URL);

        clickToOpenTimePicker();

        // click outside to close the timePicker
        WebElement body = findDomElement(By.tagName("body"));
        body.click();

        // check if TimePicker is closed
        waitForElementDisappear("TimePicker should not be present", By.cssSelector(TIME_PICKER_SEL));
    }

    /**
     * Test flow:
     * - Click on input time box
     * - Check if inputTimePicker turns visible
     * @throws Exception
     */
    public void testTPClickToOpenWithEmptyInput() throws Exception {
        open(URL);

        // clicking on input time box when it's empty should bring up timePicker
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.click();
        waitForElementAppear("TimePicker doesn't appear", By.cssSelector(TIME_PICKER_SEL));
    }

    /**
     * Test flow:
     * - select a time in time picker
     * - check if input time box is empty
     * @throws Exception
     */
    public void testSelectTimeFromTP() throws Exception {
        open(URL);

        clickToOpenTimePicker();

        // focus is on timePicker, just press ENTER to select a time
        WebElement activeElement = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
        auraUITestingUtil.pressEnter(activeElement);

        // after selecting a time, input time box should not be empty
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = inputTimeBox.getAttribute("value").trim();
        assertNotSame("Input time box should be set to some time values, but it's empty", outputTime, "");
    }

    /**
     * Test flow
     * - select a date
     * - check if input time box is empty
     * @throws Exception
     */
    public void testSelectDateSetDefaultTime() throws Exception {
        open(URL);

        WebElement inputDateIcon = findDomElement(By.cssSelector(DATE_ICON_SEL));
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = null;

        outputTime = inputTimeBox.getAttribute("value").trim();
        assertEquals("Input time box is not empty initially", outputTime, "");

        // open inputDate calendar and select a date
        inputDateIcon.click();
        auraUITestingUtil.pressEnter(inputDateIcon);

        // selecting a date should set the default time
        outputTime = inputTimeBox.getAttribute("value").trim();
        assertNotSame("Input time box should be set to some time values, but it's empty", outputTime, "");
    }

    /**
     * Test flow
     * - set initial time
     * - move to the previous time value and see it's the right value
     * @throws Exception
     */
    public void testTPUpArrow() throws Exception {
        open(URL);

        // set initial time
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.sendKeys("1:30 PM");

        // select the previous time
        selectTimePicker(Keys.ARROW_UP, "1:00 PM");
    }

    /**
     * Test flow
     * - set initial time
     * - move to the next time value and see it's the right value
     * @throws Exception
     */
    public void testTPDownArrow() throws Exception {
        open(URL);

        // set initial time
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.sendKeys("1:00 PM");

        // select the next time
        selectTimePicker(Keys.ARROW_DOWN, "1:30 PM");
    }

    /**
     * Test flow
     * - set initial time
     * - move to the previous time value and see it's the right value
     * @throws Exception
     */
    public void testTPLeftArrow() throws Exception {
        open(URL);

        // set initial time
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.sendKeys("1:30 PM");

        // select the previous time
        selectTimePicker(Keys.ARROW_LEFT, "1:00 PM");
    }

    /**
     * Test flow
     * - set initial time
     * - move to the next time value and see it's the right value
     * @throws Exception
     */
    public void testTPRightArrow() throws Exception {
        open(URL);

        // set initial time
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.sendKeys("1:00 PM");

        // select the next time
        selectTimePicker(Keys.ARROW_RIGHT, "1:30 PM");
    }

    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS*******************************************
     ***********************************************************************************************/

    /**
     * Use arrow key to select the next time value on timePicker
     * @throws Exception
     */
    private void selectTimePicker(Keys arrow, String expectedTime) throws Exception {
        clickToOpenTimePicker();

        // focus on timepicker and press arrow key
        WebElement activeElem = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
        activeElem.sendKeys(arrow);

        // since focus is changed to the next time value, get focus again and press ENTER
        activeElem = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
        auraUITestingUtil.pressEnter(activeElem);

        // return the selected time value
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = inputTimeBox.getAttribute("value").trim();
        assertEquals("Time values should be the same, but they are different!",
                expectedTime, outputTime);
    }

    /**
     * clickToOpenTimePicker used to have some timing issues, but they are gone now.
     * This is kept just in case. Also, SAFARI doesn't allow tabbing into the calendar
     * icon, so if this is used, need to exclude SAFARI.
     */
    private void tabToOpenTimePicker() {
        // use input time box to tab into calendar icon
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        auraUITestingUtil.pressTab(inputTimeBox);

        // active element should now be the calendar icon - hit enter to open time picker
        WebElement activeElem = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
        auraUITestingUtil.pressEnter(activeElem);

        // wait for time picker to appear
        waitForElementAppear("TimePicker doesn't appear", By.cssSelector(TIME_PICKER_SEL));
    }

    private void clickToOpenTimePicker() {
        // use input time box to tab into calendar icon
        WebElement inputTimeIcon = findDomElement(By.cssSelector(TIME_ICON_SEL));
        inputTimeIcon.click();

        // wait for time picker to appear
        waitForElementAppear("TimePicker doesn't appear", By.cssSelector(TIME_PICKER_SEL));
    }

    /**
     * Flow
     * - Open TimePicker
     * - Press a key to close it
     * - Check if inputTimeBox has focus
     */
    private void checkTPFocusOnClosingWithKey(Keys key) {
        clickToOpenTimePicker();

        // activeElement is timePicker now
        WebElement activeElement = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);

        // use key to close the timePicker and check
        activeElement.sendKeys(key);
        waitForElementDisappear("TimePicker should not be present", By.cssSelector(TIME_PICKER_SEL));

        // check if active element is the inputTimeBox
        activeElement = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        assertEquals("Focus is not on input time box", activeElement, inputTimeBox);
    }
}

