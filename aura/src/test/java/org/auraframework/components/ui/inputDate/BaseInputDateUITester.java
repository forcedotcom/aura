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
package org.auraframework.components.ui.inputDate;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;

public class BaseInputDateUITester extends WebDriverTestCase {

    // URL string to go to
    public String URL = "";

    private final String DATE_FORMAT_STR = "yyyy-MM-dd";
    private final String TEST_DATE_TO_USE = "2013-04-15";
    private final int YEAR_TO_USE = 2013;
    private final int MONTH_TO_USE = Calendar.APRIL;
    private final int DAY_TO_USE = 28;
    private final String MONTH_YEAR_FORMAT = "MMMMMMMMM yyyy";

    private final String DATE_INPUT_BOX_SEL = "input[class*='date_input_box']";
    private final String DATE_ICON_SEL = "a[class*='datePicker-openIcon']";
    private final String ARIA_SELECTED_SEL = "a[aria-selected*='true']";
    private final String SELECTED_DATE = "a[class*='selectedDate']";

    private final String CLASSNAME = "return $A.test.getActiveElement().className";

    /**
     * Excluded Browser Reasons: IE9/10: Sending in Shift anything (tab, page up, page down), does not register when
     * sent through WebDriver. Manually works fine Android and IOS devices: this feature will not be used on mobile
     * devices. Instead the their native versions will be used Safari: Sending in Shift tab does not register when sent
     * through WebDriver. Manually works fine
     */

    public BaseInputDateUITester(String name) {
        super(name);
    }

    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS********************************************
     ***********************************************************************************************/
    private WebElement loopThroughKeys(WebElement element, WebDriver driver, String keyString, int iterCondition,
            String cssSel, String assertVal) {
        // Pressing one button iterCondition times
        for (int i = 0; i < iterCondition; i++) {
            element.sendKeys(keyString);
            element = findDomElement(By.cssSelector(cssSel));
            assertTrue(assertVal + "combination could not find aria-selected='true'", element != null);
        }

        return element;
    }

    private String pageUpDownHelper(int iterCondition, String keyString)
    {
        WebDriver driver = getDriver();
        // Test Begins
        // Making sure the textBox is empty so we always start at the same date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.sendKeys(TEST_DATE_TO_USE);

        // Grabbing the Date Icon and click on it to open the calendar
        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        element = loopThroughKeys(element, driver, keyString, iterCondition, ARIA_SELECTED_SEL, "Shift+Page Up/Down");

        // Selecting the date that we are on to get the value and compare it to what it should be
        element.sendKeys(Keys.SPACE);

        // Setting the input box in focus to get its value
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Checking if the values are equal
        return element.getAttribute("value");
    }

    private String iterateCal(int monthIter, int yearIter, String monthSel, String yearSel) {
        // Start at specific date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.click();
        element.sendKeys(TEST_DATE_TO_USE);

        // Clicking on the the textbox to gain focus
        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        // Finding either the increasing or decreasing month arrow
        element = findDomElement(By.cssSelector(monthSel));

        // Increasing or decreasing the month
        for (int i = 0; i < monthIter; i++) {
            element.click();
            element = findDomElement(By.cssSelector(monthSel));
            assertTrue("Page up/down could not find aria-selected='true'", element != null);
        }

        // Finding either the increasing or decreasing year arrow
        element = findDomElement(By.cssSelector(yearSel));

        // Increasing or decreasing the year
        for (int i = 0; i < yearIter; i++) {
            element.click();
            element = findDomElement(By.cssSelector(yearSel));
            assertTrue("Shift + Page up/down could not find aria-selected='true'", element != null);
        }

        /*
         * Returning a Boolean value, whether the label in the calendar matches the month and year that we were
         * expecting
         */
        return findDomElement(By.cssSelector("h4[class*='monthYear']")).getText();
    }

    // Method to modify calendar
    private String modCal(int month, int year) {

        // Getting the current date so all tests start from the same area
        GregorianCalendar cal = new GregorianCalendar(YEAR_TO_USE, MONTH_TO_USE, DAY_TO_USE);
        // Formatting the calendar in the format that we expect
        SimpleDateFormat dtFormat = new SimpleDateFormat(MONTH_YEAR_FORMAT);

        // Modifying calendar by either positive or negative months/years
        cal.add(Calendar.MONTH, month);
        cal.add(Calendar.YEAR, year);
        return dtFormat.format(cal.getTime());
    }

    private String homeEndButtonHelper(String initDate, Keys buttonToPress)
    {
        // Getting the input box, making sure it is clear, and sending in the the starting date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.sendKeys(initDate);

        // Opening the calendar icon to grab the date we are looking for
        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        // Grabbing the correct focus cell date
        element = findDomElement(By.cssSelector(SELECTED_DATE));

        // Pressing the home or End button and grabbing the associated date
        element.sendKeys(buttonToPress);
        element = findDomElement(By.cssSelector(ARIA_SELECTED_SEL));

        // Clicking on that element to compare it to the date we should receive
        element.sendKeys(Keys.SPACE);

        // Repointing to the InputTextBox
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Making sure they are equal
        return element.getAttribute("value");
    }

    public void gotToNextElem(WebDriver driver, String shftTab) {
        String classOfActiveElem = "a[class*='" + auraUITestingUtil.getEval(CLASSNAME) + "']";
        findDomElement(By.cssSelector(classOfActiveElem)).sendKeys(shftTab);

    }

    /***********************************************************************************************
     *********************************** Date Picker Tests*******************************************
     ***********************************************************************************************/
    // Home and End Button Test using January (31 days) , February (28 or 29 days), September (30 days)
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testHomeEnd() throws Exception {
        open(URL);

        // Checking January (31 days)
        String inputBoxResult = homeEndButtonHelper("2011-1-31", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of January", "2011-01-01", inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-1-1", Keys.END);
        assertEquals("The End button did not go to the end of January", "2011-01-31", inputBoxResult);

        // Checking February (28 or 29 days), none Leap year
        inputBoxResult = homeEndButtonHelper("2011-2-28", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of February", "2011-02-01", inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-2-1", Keys.END);
        assertEquals("The End button did not go to the end of February", "2011-02-28", inputBoxResult);

        // Checking February (28 or 29 days), Leap year
        inputBoxResult = homeEndButtonHelper("2012-2-29", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of February", "2012-02-01", inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2012-2-1", Keys.END);
        assertEquals("The End button did not go to the end of February", "2012-02-29", inputBoxResult);

        // Checking September (30 days)
        inputBoxResult = homeEndButtonHelper("2011-9-30", Keys.HOME);
        assertEquals("The Home button did not go to the beginning of September", "2011-09-01", inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-9-1", Keys.END);
        assertEquals("The End button did not go to thes end of September", "2011-09-30", inputBoxResult);
    }

    // Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
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
        assertEquals("Shift + Page up did not go to the correct date", fmt, result);

        // Resetting calendar
        cal = new GregorianCalendar();

        // Running test, decreasing month
        result = pageUpDownHelper(15, Keys.SHIFT + "" + Keys.PAGE_DOWN);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.YEAR, 15);
        fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());

        // Making sure test result and true calendar outcome match
        assertEquals("shift + Page Down did not find the correct date", fmt, result);
    }

    // Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testPageUpDownMonth() throws Exception {
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
        assertEquals("Page up id not find the correct date", fmt, result);

        // Resetting calendar
        cal = new GregorianCalendar();

        // Running Test, increasing month
        result = pageUpDownHelper(10, "" + Keys.PAGE_DOWN);

        // Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(TEST_DATE_TO_USE));
        cal.add(Calendar.MONTH, 10);
        fmt = new SimpleDateFormat(DATE_FORMAT_STR).format(cal.getTime());

        // Making sure test result and true calendar outcome match
        assertEquals("Page down id not find the correct date", fmt, result);
    }

    // Testing functionallity of tab, starting from the InputBox to the today button
    // Do Not run with Safari. Safari does not handle tabs normally
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD,
            BrowserType.IPHONE })
    public void testTab() throws Exception {
        open(URL);

        // Tab test Begins
        // Getting input textbox in focus
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));

        // Tabbing to the next item and getting what is in focus
        auraUITestingUtil.pressTab(element);

        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        // Clicking on the Icon
        element.click();

        // Todays date should be on focus, Grabbing that element. Pressing tab with WebDriver after clicking on the icon
        // will move to the move month to the left
        classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        // Moving from the on focus element to the today link
        auraUITestingUtil.pressTab(element);

        // Clicking on the today link
        classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("button[class*='" + classOfActiveElem + "']"));
        assertEquals("Tabbing through every buttong did not take us to the today button", "calToday",
                element.getAttribute("class"));
    }

    // Checking functionality of the shift tab button
    @ExcludeBrowsers({ BrowserType.IE9, BrowserType.IE10, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testShiftTab() throws Exception {
        open(URL);

        WebDriver driver = getDriver();

        // Tab test Begins
        // Getting input textbox in focus
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.click();
        element.sendKeys("11111111");
        auraUITestingUtil.pressTab(element);

        String classOfActiveElem = "a[class*='" + auraUITestingUtil.getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));
        element.click();

        // Focused on Today's date, grabbing it and pressing tab to go to the Today hyperlink
        classOfActiveElem = "a[class*='" + auraUITestingUtil.getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));
        auraUITestingUtil.pressTab(element);

        String shftTab = Keys.SHIFT + "" + Keys.TAB;

        // Going from Today hyperlink, back to SELECTED_DATE
        String classOfActiveElemButton = "button[class*='" + auraUITestingUtil.getEval(CLASSNAME) + "']";
        findDomElement(By.cssSelector(classOfActiveElemButton)).sendKeys(shftTab);

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
        classOfActiveElem = "input[class*='" + auraUITestingUtil.getEval(CLASSNAME) + "']";
        element = findDomElement(By.cssSelector(classOfActiveElem));

        assertEquals("Shift Tabbing did not get us to the input textbox", "1111-11-11", element.getAttribute("value"));
    }

    // Testing functionality of the ESC key
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testEscape() throws Exception {
        open(URL);

        boolean escButtonClosedCal = false;

        // Setting focus to the Calendar Icon and clicking on it
        WebElement element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        // Looking for the current date, which should be focused on
        element = findDomElement(By.cssSelector(SELECTED_DATE));

        // Hitting escape to close the Calendar
        element.sendKeys(Keys.ESCAPE);

        // Want to get a NoSuchElementExpection when looking for the class
        // if visible exists, that means that the calendar did not close
        element = findDomElement(By.cssSelector("div[class*='uiDatePicker']"));

        escButtonClosedCal = !element.getAttribute("class").contains("visible");

        assertTrue("Escape button did not close the calendar", escButtonClosedCal);
    }

    // Testing Functionality of calendar in traversing through 1 year by the keys
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testDateWithOneArrow() throws Exception {
        open(URL);
        WebDriver driver = getDriver();

        // Test Begins
        // Getting the calendar Icon
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.click();
        element.sendKeys("2013-10-01");

        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);

        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        // Loop through 355 days
        element = loopThroughKeys(element, driver, "" + Keys.ARROW_RIGHT, 151, ARIA_SELECTED_SEL, "Arrow-Right ");

        element.sendKeys(Keys.SPACE);

        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Dates do not match up", "2014-03-01", element.getAttribute("value"));
    }

    // Testing functionality of arrows being used one after the other
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testLeftAndRightArrows() throws Exception {
        // Increase day in month by 1
        open(URL);
        WebDriver driver = getDriver();

        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.click();
        element.sendKeys(TEST_DATE_TO_USE);
        // Test Begins
        // Grab calendar Icon
        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        // Find todays date, which should be focused
        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        // Move from todays date, to the todays date +41
        element = loopThroughKeys(element, driver, "" + Keys.ARROW_RIGHT, 41, ARIA_SELECTED_SEL, "Arrow-Right key ");

        // Move from today (date+41), to the todays date+1
        element = loopThroughKeys(element, driver, "" + Keys.ARROW_LEFT, 40, ARIA_SELECTED_SEL, "Arrow-Left key");

        // Select element
        element.sendKeys(Keys.SPACE);

        // Focus on the input box and get its value
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Next day was not correctly found", "2013-04-16", element.getAttribute("value"));
    }

    // Testing functionality of arrows being used one after the other, while going through months
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void testUpAndDownArrows() throws Exception {

        open(URL);
        WebDriver driver = getDriver();

        // Start at specific date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.click();
        element.sendKeys(TEST_DATE_TO_USE);

        // Test Begins
        // Select the calendar Icon
        element = findDomElement(By.cssSelector(DATE_ICON_SEL));
        element.click();

        // Find todays date, which should be focused
        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));

        // Move 4 months up
        element = loopThroughKeys(element, driver, "" + Keys.ARROW_UP, 4, ARIA_SELECTED_SEL, "Arrow-Up key");

        // Move 4 months down
        element = loopThroughKeys(element, driver, "" + Keys.ARROW_DOWN, 4, ARIA_SELECTED_SEL, "Arrow-Down key");

        // Focus should be back on todays date
        element.sendKeys(Keys.SPACE);

        // Select the input text box and get its value for comparison
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("Moving dates using arrows has not brought us to todays date", TEST_DATE_TO_USE,
                element.getAttribute("value"));
    }

    // Testing functionality of arrows button on calendar by intercombining them and making them go through months and
    // year
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    public void _testMonthYearByArrowsButtons() throws Exception {
        String nextMonth = "a[class*='navLink nextMonth']";
        String nextYear = "a[class*='navLink nextYear']";
        String prevMonth = "a[class*='navLink prevMonth']";
        String prevYear = "a[class*='navLink prevYear']";

        open(URL);

        // Increases month and year
        String result = iterateCal(7, 5, nextMonth, nextYear);

        // Get correct date
        String fmt = modCal(7, 5);

        assertEquals("Date using Month and Year buttons both increasing found incorrectly", fmt, result);

        // Increase month and Decrease year
        result = iterateCal(7, 10, nextMonth, prevYear);

        // Get correct date
        fmt = modCal(7, -10);
        assertEquals(
                "Date using Month and Year buttons, with Month increasing and Year Decreasing, found  incorrectly",
                fmt, result);

        // Decrease month and Increases year
        result = iterateCal(12, 10, prevMonth, nextYear);

        // Get correct date
        fmt = modCal(-12, 10);

        assertEquals("Date using Month and Year buttons, with Month Decreasing and Year increasing found incorrectly",
                fmt, result);

        // Decrease month and year
        result = iterateCal(12, 10, prevMonth, prevYear);

        // Get correct date
        fmt = modCal(-12, -10);

        assertEquals("Date using Month and Year buttons both increasing found incorrectly", fmt, result);
    }
}
