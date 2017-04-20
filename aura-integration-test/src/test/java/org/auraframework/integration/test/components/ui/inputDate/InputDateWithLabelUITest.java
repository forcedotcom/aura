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
package org.auraframework.integration.test.components.ui.inputDate;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;

public class InputDateWithLabelUITest extends WebDriverTestCase {

    // URL string to go to
    public String URL = "/uitest/inputDate_Test.cmp";
    private final String DATE_FORMAT_STR = "yyyy-MM-dd";
    private final String TEST_DATE_TO_USE = "2013-04-15";

    private final String DATE_INPUT_BOX_SEL = "input[class*='date_input_box']";
    private final String DATE_ICON_SEL = "a[class*='datePicker-openIcon']";
    private final String ARIA_SELECTED_SEL = "td[aria-selected*='true']";
    private final String SELECTED_DATE = "td[class*='is-selected']";
    private final String OUTPUT_ST = "span[class*='outputStatus']";

    private final String DATEPICKER_SEL = "div.uiDatePicker.visible";

    private final String CLASSNAME = "return $A.test.getActiveElement().className";
    private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";

    /**
     * Excluded Browser Reasons:
     *
     * IE7: pageUpDown test is flappy, works through webdriver after running a few times and manually. Issue here is
     * that it will sometimes stop one short
     *
     * IE8: homeEndButton test is flappy, works fine manually and on webdriver after running a few times
     *
     * IE9/10/11: Sending in Shift anything (tab, page up, page down), does not register when sent through WebDriver.
     * Manually works fine
     *
     * Android/IOS: This feature will not be used on mobile devices. Instead the their native versions will be used
     *
     * Safari: Sending in Shift tab does not register when sent through WebDriver. Manually works fine
     */
    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS********************************************
     ***********************************************************************************************/
    private WebElement loopThroughKeys(WebElement element, String keyString, int iterCondition,
                                       String cssSel, String assertVal) {
        // Pressing one button iterCondition times
        for (int i = 0; i < iterCondition; i++) {
            element.sendKeys(keyString);
            element = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
            assertTrue(assertVal + "combination could not find active element", element != null);
        }

        return element;
    }

    private String pageUpDownHelper(int iterCondition, String keyString)
    {
        // Making sure the textBox is empty so we always start at the same date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.sendKeys(TEST_DATE_TO_USE);

        openDatePicker();

        String classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));

        element = loopThroughKeys(element, keyString, iterCondition, ARIA_SELECTED_SEL, "Shift+Page Up/Down");

        // Selecting the date that we are on to get the value and compare it to what it should be
        element.sendKeys(Keys.SPACE);

        // Setting the input box in focus to get its value
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Checking if the values are equal
        return element.getAttribute("value");
    }

    private String homeEndButtonHelper(String initDate, Keys buttonToPress)
    {
        // Getting the input box, making sure it is clear, and sending in the the starting date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.sendKeys(initDate);

        // Opening the calendar icon to grab the date we are looking for
        openDatePicker();

        // Grabbing the correct focus cell date
        By selectedDate = By.cssSelector(SELECTED_DATE);
        element = findDomElement(selectedDate);

        // Pressing the home or End button and grabbing the associated date
        element.sendKeys(buttonToPress);

        // Clicking on that element to compare it to the date we should receive
        element = (WebElement) getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        element.sendKeys(Keys.ENTER);

        // Repointing to the InputTextBox
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Making sure they are equal
        return element.getAttribute("value");
    }

    private void openDatePicker() {
        // Grabbing the Date Icon and click on it to open the calendar
        WebElement element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();
        waitForDatePickerVisible();
    }

    private void waitForDatePickerVisible() {
        getAuraUITestingUtil().waitForElement("DatePicker doesn't appear after clicking on the calendar icon!",
            By.cssSelector(DATEPICKER_SEL));
    }

    public void gotToNextElem(WebDriver driver, String shftTab) {
        String classOfActiveElem = "td[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        findDomElement(By.cssSelector(classOfActiveElem)).sendKeys(shftTab);

    }

    /***********************************************************************************************
     *********************************** Date Picker Tests*******************************************
     ***********************************************************************************************/
    // Home and End Button Test using January (31 days) , February (28 or 29 days), September (30 days)
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testHomeEnd() throws Exception {
        open(URL);

        // Checking January (31 days)
        String inputBoxResult = homeEndButtonHelper("2011-1-31", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of January", "2011-01-01", inputBoxResult.trim());

        inputBoxResult = homeEndButtonHelper("2011-1-1", Keys.END);
        assertEquals("The End button did not go to the end of January", "2011-01-31", inputBoxResult.trim());

        // Checking February (28 or 29 days), none Leap year
        inputBoxResult = homeEndButtonHelper("2011-2-28", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of February", "2011-02-01", inputBoxResult.trim());

        inputBoxResult = homeEndButtonHelper("2011-2-1", Keys.END);
        assertEquals("The End button did not go to the end of February", "2011-02-28", inputBoxResult.trim());

        // Checking February (28 or 29 days), Leap year
        inputBoxResult = homeEndButtonHelper("2012-2-29", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of February", "2012-02-01", inputBoxResult.trim());

        inputBoxResult = homeEndButtonHelper("2012-2-1", Keys.END);
        assertEquals("The End button did not go to the end of February", "2012-02-29", inputBoxResult.trim());

        // Checking September (30 days)
        inputBoxResult = homeEndButtonHelper("2011-9-30", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of September", "2011-09-01", inputBoxResult.trim());

        inputBoxResult = homeEndButtonHelper("2011-9-1", Keys.END);
        assertEquals("The End button did not go to thes end of September", "2011-09-30", inputBoxResult.trim());
    }

    // Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE9, BrowserType.IE10, BrowserType.IE11, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testPageUpDownYear() throws Exception {
        DateFormat formatter = new SimpleDateFormat(DATE_FORMAT_STR);
        open(URL);
        // Calendar used to get current date
        GregorianCalendar cal = new GregorianCalendar();
        // Running test, Increasing year
        String result = pageUpDownHelper(10, Keys.SHIFT + "" + Keys.PAGE_UP);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.YEAR, -10);

        // Formatting date to match out of test
        String fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());

        // Making sure test result and true calendar outcome match
        assertEquals("Shift + Page up did not go to the correct date", fmt, result.trim());

        // Resetting calendar
        cal = new GregorianCalendar();

        // Running test, decreasing month
        result = pageUpDownHelper(15, Keys.SHIFT + "" + Keys.PAGE_DOWN);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.YEAR, 15);
        fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());

        // Making sure test result and true calendar outcome match
        assertEquals("shift + Page Down did not find the correct date", fmt, result.trim());
    }

    // Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    // test disabled due to flapper: W-2733724
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void _testPageUpDownMonth() throws Exception {
        DateFormat formatter = new SimpleDateFormat(DATE_FORMAT_STR);
        open(URL);

        // Calendar used to get current date
        GregorianCalendar cal = new GregorianCalendar();

        // Running test, Decreasing month
        String result = pageUpDownHelper(4, "" + Keys.PAGE_UP);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.MONTH, -4);
        String fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());
        assertEquals("Page up id not find the correct date", fmt, result.trim());

        // Resetting calendar
        cal = new GregorianCalendar();

        // Running Test, increasing month
        result = pageUpDownHelper(10, "" + Keys.PAGE_DOWN);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.MONTH, 10);
        fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());

        // Making sure test result and true calendar outcome match
        assertEquals("Page down id not find the correct date", fmt, result.trim());
    }

    // Testing functionallity of tab, starting from the InputBox to the today button
    // Do Not run with Safari. Safari does not handle tabs normally
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    // TODO(W-2671175): Fails due to GMT/PST timezone difference for user.timezone and actual timezone
    public void _testTab() throws Exception {
        open(URL);

        // Getting input textbox in focus
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Tabbing to the next item and getting what is in focus
        getAuraUITestingUtil().pressTab(element);

        String classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));
        String elementClass = element.getAttribute("class");
        assertTrue("Tabbing did not take us to the date picker icon",
                elementClass.indexOf("datePicker-openIcon") >= 0);

        // Clicking on the Icon
        element.click();

        // Todays date should be on focus, Grabbing that element. Pressing tab with WebDriver after clicking on the icon
        // will move to the move month to the left
        classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));
        elementClass = element.getAttribute("class");
        assertTrue("Tabbing did not take us to today's date",
                elementClass.indexOf("todayDate") >= 0);
    }

    // Test case for W-2031902
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testValueChangeEvent() throws Exception {
        open(URL);
        // Getting input textbox in focus
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Tabbing to the next item and getting what is in focus
        getAuraUITestingUtil().pressTab(element);

        element = findDomElement(By.cssSelector(OUTPUT_ST));
        // tab out does not fire value change event
        assertEquals("Value Change event should not be fired", "", element.getText());

        openDatePicker();

        // Todays date should be on focus, Grabbing that element. Pressing tab with WebDriver after clicking on the icon
        // will move to the move month to the left
        String classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));

        // Moving from the on focus element to the today link
        // Keys.Enter does not work with chrome v40.0.2214.91
        element.click();
        // make sure value change event got fired
        element = findDomElement(By.cssSelector(OUTPUT_ST));
        assertEquals("Value Change event should not be fired", "Value Change Event Fired", element.getText());
    }

    /*
     * UnAdaptable because issue with sfdc environments with sendkeys in iframes see W-1985839 and W-2009411
     */
    @UnAdaptableTest
    // Checking functionality of the shift tab button
    // temporarily disabled due to a bug in the initial positioning. Will re-enable once that issue is fixed
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void _testShiftTab() throws Exception {
        open(URL);

        WebDriver driver = getDriver();

        // Getting input textbox in focus
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.click();
        element.sendKeys("20151111");
        getAuraUITestingUtil().pressTab(element);

        String classOfActiveElem = "a[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));
        String elementClass = element.getAttribute("class");
        assertTrue("Tabbing did not take us to the date picker icon",
                elementClass.indexOf("datePicker-openIcon") >= 0);
        element.click();

        // Focused on Today's date
        classOfActiveElem = "td[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));
        elementClass = element.getAttribute("class");
        assertTrue("Tabbing did not take us to the selected date",
                elementClass.indexOf("selectedDate") >= 0);
        getAuraUITestingUtil().pressTab(element);

        String shftTab = Keys.SHIFT + "" + Keys.TAB;

        // Going from SELECTED_DATE to next-year
        gotToNextElem(driver, shftTab);

        // Going from next-year to next-month
        gotToNextElem(driver, shftTab);

        // Going from next-month to prev-month
        gotToNextElem(driver, shftTab);

        // Going from prev-month to prev-Year
        gotToNextElem(driver, shftTab);

        // Going from prev-Year to icon
        gotToNextElem(driver, shftTab);

        // Going from icon to input box
        gotToNextElem(driver, shftTab);

        // Getting the input textbox in focus and getting the value, which should not have changed
        classOfActiveElem = "input[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));

        assertEquals("Shift Tabbing did not get us to the input textbox", "2015-11-11", element.getAttribute("value"));
    }

    // Testing functionality of the ESC key
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testEscape() throws Exception {
        open(URL);

        boolean escButtonClosedCal;

        openDatePicker();

        // Looking for the current date, which should be focused on
        WebElement element = findDomElement(By.cssSelector(SELECTED_DATE));

        // Hitting escape to close the Calendar
        element.sendKeys(Keys.ESCAPE);

        // Check to make sure element was removed from dom
        assertFalse("Escape button did not close the calendar", isElementPresent(By.cssSelector("div[class*='uiDatePicker']")));
    }

    /**
     * Test Flow:
     * 1. Have focus on inputDate
     * 2. Tab onto the calendar icon and press enter
     * 3. After datepicker opens, press a button (ESC, ENTER, SPACE) to close it
     * 4. Check if inputDate has focus
     * @throws Exception
     */
    // Testing the focus after closing datePicker
    // Disabling for Safari since Safari does not handle tabs normally
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })

    @Test
    public void testFocusOnClosingDP() throws Exception {

    	// the different keys we will use to close the datePicker
    	Keys[] keysToClose = {Keys.ESCAPE, Keys.ENTER, Keys.SPACE};

    	open(URL);

        for(int i = 0; i < keysToClose.length; i++) {

        	WebElement inputDate = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
            inputDate.sendKeys(Keys.TAB);

            //active element should now be the calendar icon - hit enter to open datePicker
            WebElement activeElement = (WebElement)getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
            activeElement.sendKeys(Keys.ENTER);

            //datePicker should be open
            getAuraUITestingUtil().waitForElement("datePicker should been present, but its not", By.cssSelector(".uiDatePicker.visible"));

            //use key to close the datePicker
            WebElement selectedDate = findDomElement(By.cssSelector(SELECTED_DATE));
            selectedDate.sendKeys(keysToClose[i]);

            //check if datePicker is closed
            getAuraUITestingUtil().waitForElementNotPresent("datePicker should not be present, but it is", By.cssSelector(".uiDatePicker.visible"));

            //check if active element is the inputDate
            activeElement = (WebElement)getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
            assertEquals("Focus not on the right element", activeElement, inputDate);

        }
    }

    // Testing Functionality of calendar in traversing through 1 year by the keys
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // TODO(W-2701964): Flapping in autobuilds, needs to be revisited
    @Flapper
    @Test
    public void testDateWithOneArrow() throws Exception {
        open(URL);

        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.sendKeys("2013-10-01");
        element.click();

        openDatePicker();

        String classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);

        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));

        // Loop through 151 days
        element = loopThroughKeys(element, "" + Keys.ARROW_RIGHT, 151, ARIA_SELECTED_SEL, "Arrow-Right ");

        element.sendKeys(Keys.SPACE);

        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Dates do not match up", "2014-03-01", element.getAttribute("value").trim());
    }

    // Testing functionality of arrows being used one after the other
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testLeftAndRightArrows() throws Exception {
        open(URL);

        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.sendKeys(TEST_DATE_TO_USE);
        element.click();

        openDatePicker();

        // Find todays date, which should be focused
        By activeElmLoc = By.cssSelector("td[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']");
        element = findDomElement(activeElmLoc);

        // Move from todays date, to the todays date +41
        element = loopThroughKeys(element, "" + Keys.ARROW_RIGHT, 41, ARIA_SELECTED_SEL, "Arrow-Right key ");

        // Move from today (date+41), to the todays date+1
        element = loopThroughKeys(element, "" + Keys.ARROW_LEFT, 40, ARIA_SELECTED_SEL, "Arrow-Left key");

        // Select element
        element.sendKeys(Keys.SPACE);

        // Focus on the input box and get its value
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Next day was not correctly found", "2013-04-16", element.getAttribute("value").trim());
    }

    // Testing functionality of arrows being used one after the other, while going through months
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testUpAndDownArrows() throws Exception {
        open(URL);

        // Start at specific date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.sendKeys(TEST_DATE_TO_USE);
        element.click();

        openDatePicker();

        // Find todays date, which should be focused
        String classOfActiveElem = "" + getAuraUITestingUtil().getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("td[class*='" + classOfActiveElem + "']"));

        // Move 4 months up
        element = loopThroughKeys(element, "" + Keys.ARROW_UP, 4, ARIA_SELECTED_SEL, "Arrow-Up key");

        // Move 4 months down
        element = loopThroughKeys(element, "" + Keys.ARROW_DOWN, 4, ARIA_SELECTED_SEL, "Arrow-Down key");

        // Focus should be back on todays date
        element.sendKeys(Keys.SPACE);

        // Select the input text box and get its value for comparison
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Moving dates using arrows has not brought us to todays date", TEST_DATE_TO_USE,
                element.getAttribute("value").trim());
    }

    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testFocusClickOnInputBoxToOpenDatePicker() throws Exception {
        open(URL);

        WebElement inputElement = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        inputElement.click();
        waitForDatePickerVisible();

        WebElement activeElement = (WebElement)getAuraUITestingUtil().getEval(ACTIVE_ELEMENT);
        assertEquals("Focus should be on input box", activeElement, inputElement);
    }
}
