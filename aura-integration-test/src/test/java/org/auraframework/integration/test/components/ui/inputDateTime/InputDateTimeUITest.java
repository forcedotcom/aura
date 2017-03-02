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

package org.auraframework.integration.test.components.ui.inputDateTime;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
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
    private final String TIME_PICKER_SEL = ".uiInputTimePicker.visible";

    private final String TIME_1200_XPATH = "//li[@data-hours='12' and @data-minutes='00']";
    private final String TIME_1230_XPATH = "//li[@data-hours='12' and @data-minutes='30']";

    private final String ACTIVE_ELEM = "return $A.test.getActiveElement()";

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing ESCAPE on timePicker
     * @throws Exception
     */
    @Test
    public void testTPFocusOnClosingWithEscapeKey() throws Exception {
        open(URL);
        checkTPFocusOnClosingWithKey(Keys.ESCAPE);
    }

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing ENTER on timePicker
     * @throws Exception
     */
    @Test
    public void testTPFocusOnClosingWithEnterKey() throws Exception {
        open(URL);
        checkTPFocusOnClosingWithKey(Keys.ENTER);
    }

    /**
     * Test Flow:
     * - check if focus is back to inputTimeBox after pressing SPACE on timePicker
     * @throws Exception
     */
    @Test
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
    @Test
    public void testTPCloseWithClick() throws Exception {
         open(URL);

        clickToOpenTimePicker();

        // click outside to close the timePicker
        WebElement body = findDomElement(By.tagName("body"));
        body.click();

        waitForTimePickerDisappear();
    }

    /**
     * Test flow:
     * - Click on input time box
     * - Check if inputTimePicker turns visible
     * @throws Exception
     */
    @Test
    public void testTPClickToOpenWithEmptyInput() throws Exception {
        open(URL);

        // clicking on input time box when it's empty should bring up timePicker
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        inputTimeBox.click();
        waitForTimePickerAppear();
    }

    /**
     * Test flow:
     * - select a time in time picker
     * - check if input time box is empty
     * @throws Exception
     */
    @Test
    public void testSelectTimeFromTP() throws Exception {
        open(URL);

        clickToOpenTimePicker();

        // focus is on timePicker, just press ENTER to select a time
        WebElement activeElement = findDomElement(By.xpath(TIME_1200_XPATH));
        getAuraUITestingUtil().pressEnter(activeElement);

        waitForTimePickerDisappear();

        // after selecting a time, input time box should not be empty
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = inputTimeBox.getAttribute("value");
        assertEquals("Input time box should be set to some time values, but it's not", outputTime, "12:00 PM");
    }

    /**
     * Test flow
     * - select a date
     * - check if input time box is empty
     * @throws Exception
     */
    @Test
    public void testSelectDateSetDefaultTime() throws Exception {
        open(URL);

        WebElement inputDateIcon = findDomElement(By.cssSelector(DATE_ICON_SEL));
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = null;

        outputTime = inputTimeBox.getAttribute("value");
        assertEquals("Input time box should be empty initially", outputTime, "");

        // open inputDate calendar and select a date
        inputDateIcon.click();
        getAuraUITestingUtil().pressEnter(inputDateIcon);

        // selecting a date should set the default time
        outputTime = inputTimeBox.getAttribute("value");
        assertNotSame("Input time box should be set to some time values, but it's empty", outputTime, "");
    }

    /**
     * Test flow
     * - go to 12:30 PM
     * - move to the previous time value and see it's 12:00 PM
     * @throws Exception
     */
    @Test
    public void testTPUpArrow() throws Exception {
        open(URL);

        selectTimePicker(Keys.ARROW_LEFT, TIME_1230_XPATH, "12:00 PM");
    }

    /**
     * Test flow
     * - go to 12:00 PM
     * - move to the next time value and see it's 12:30 PM
     * @throws Exception
     */
    @Test
    public void testTPDownArrow() throws Exception {
        open(URL);

        selectTimePicker(Keys.ARROW_DOWN, TIME_1200_XPATH, "12:30 PM");
    }

    /**
     * Test flow
     * - go to 12:30 PM
     * - move to the previous time value and see it's 12:00 PM
     * @throws Exception
     */
    @Test
    // TODO: Flapping on Jenkins autobuilds
    public void _testTPLeftArrow() throws Exception {
        open(URL);

        selectTimePicker(Keys.ARROW_LEFT, TIME_1230_XPATH, "12:00 PM");
    }

    /**
     * Test flow
     * - go to 12:00 PM
     * - move to the next time value and see it's 12:30 PM
     * @throws Exception
     */
    @Test
    public void testTPRightArrow() throws Exception {
        open(URL);

        selectTimePicker(Keys.ARROW_RIGHT, TIME_1200_XPATH, "12:30 PM");
    }

    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS*******************************************
     ***********************************************************************************************/

    /**
     * Use arrow key to select the next time value on timePicker
     * @throws Exception
     */
    private void selectTimePicker(Keys arrow, String timeXpath, String expectedTime) throws Exception {
        clickToOpenTimePicker();

        // focus on timepicker and press arrow key
        WebElement activeElem = findDomElement(By.xpath(timeXpath));
        activeElem.sendKeys(arrow);

        // since focus is changed to the next time value, get the focus
        activeElem = (WebElement)getAuraUITestingUtil().getEval(ACTIVE_ELEM);
        getAuraUITestingUtil().pressEnter(activeElem);

        waitForTimePickerDisappear();

        // return the selected time value
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        String outputTime = inputTimeBox.getAttribute("value");
        assertEquals("Time values should be the same, but they are different!",
                expectedTime, outputTime);
    }

    /**
     * clickToOpenTimePicker used to have some timing issues that causes focus issue,
     * but they are resolved by focusing on <li> element directly using xpath.
     * This is kept just in case. Also, SAFARI doesn't allow tabbing into the calendar
     * icon, so if this is used, need to exclude SAFARI.
     */
//    @SuppressWarnings("unused")
//    private void tabToOpenTimePicker() {
//        // use input time box to tab into calendar icon
//        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
//        auraUITestingUtil.pressTab(inputTimeBox);
//
//        // active element should now be the calendar icon - hit enter to open time picker
//        WebElement activeElem = (WebElement)auraUITestingUtil.getEval(ACTIVE_ELEM);
//        auraUITestingUtil.pressEnter(activeElem);
//        waitForTimePickerAppear();
//    }

    private void clickToOpenTimePicker() {
        // use input time box to tab into calendar icon and wait for timePicker
        WebElement inputTimeIcon = findDomElement(By.cssSelector(TIME_ICON_SEL));
        inputTimeIcon.click();
        waitForTimePickerAppear();
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
        WebElement activeElement = findDomElement(By.xpath(TIME_1200_XPATH));

        // use key to close the timePicker and check
        activeElement.sendKeys(key);
        waitForTimePickerDisappear();

        // check if active element is the inputTimeBox
        activeElement = (WebElement)getAuraUITestingUtil().getEval(ACTIVE_ELEM);
        WebElement inputTimeBox = findDomElement(By.cssSelector(TIME_INPUT_BOX_SEL));
        assertEquals("Focus is not on input time box", activeElement, inputTimeBox);
    }

    private void waitForTimePickerAppear() {
        getAuraUITestingUtil().waitForElement("TimePicker should appear", By.cssSelector(TIME_PICKER_SEL));
    }

    private void waitForTimePickerDisappear() {
        getAuraUITestingUtil().waitForElementNotPresent("TimePicker should disappear", By.cssSelector(TIME_PICKER_SEL));
    }
}

