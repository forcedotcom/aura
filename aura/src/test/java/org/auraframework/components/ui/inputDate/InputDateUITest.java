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
package org.auraframework.components.ui.inputDate;



import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class InputDateUITest extends WebDriverTestCase {

    // URL string to go to
    private final String URL = "/uitest/datePickerTest.cmp";

    private final String dateStr = "yyyy-MM-dd";
    private final String inDate = "2012-12-24";
    private final String dateStrTogether = "yyyyMMdd";
    private final String mnthYr = "MMMMMMMMM yyyy";

    private final String dateCSS = "input[class*='date_input_box']";
    private final String dateIcon = "a[class*='datePicker-openIcon']";
    private final String calToday = "a[class*='calToday']";
    private final String ariaTrue = "a[aria-selected*='true']";
    private final String selectedDate = "a[class*='selectedDate']";

    private final String className = "return $A.test.getActiveElement().className";

    public InputDateUITest(String name) {
        super(name);
    }
    
    private String homeEndButtonHelper(String initDate, Keys buttonToPress)
    {
        WebDriver driver = getDriver();


        //Getting the input box, making sure it is clear, and sending in the the starting date
        WebElement element = driver.findElement(By.cssSelector(dateCSS));
        element.clear();
        element.sendKeys(initDate);

        //Opening the calendar icon to grab the date we are looking for
        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Grabbing the correct focus cell date
        element = driver.findElement(By.cssSelector(selectedDate));

        //Pressing the home or End button and grabbing the associated date
        element.sendKeys(buttonToPress);
        element = driver.findElement(By.cssSelector(ariaTrue));

        //Clicking on that element to compare it to the date we should receive
        element.sendKeys(Keys.SPACE);

        //Repointing to the InputTextBox
        element = driver.findElement(By.cssSelector(dateCSS));

        //Making sure they are equal
        return element.getAttribute("value");
    }

    //Home and End Button Test using January (31 days) , February (28 or 29 days), September (30 days)
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testHomeEnd() throws Exception {
        open(URL);

        int year = 2011;
        int begMonth = 1;

        GregorianCalendar cal = new GregorianCalendar();
        SimpleDateFormat dtFormat = new SimpleDateFormat (dateStr);
        String fmt= dtFormat.format(cal.getTime());

        //Checking January (31 days)
        String inputBoxResult = homeEndButtonHelper("2011-1-31", Keys.HOME);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, 2011);
        cal.set(Calendar.MONTH, Calendar.JANUARY);
        cal.set(Calendar.DAY_OF_MONTH, begMonth);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The Home button took us to the beginning of the January", fmt, inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-1-1", Keys.END);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, year);
        cal.set(Calendar.MONTH, Calendar.JANUARY);
        cal.set(Calendar.DAY_OF_MONTH, 31);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The End button took us to the end of the January", fmt, inputBoxResult);

        //Checking February (28 or 29 days), none Leap year
        inputBoxResult = homeEndButtonHelper("2011-2-28",  Keys.HOME);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, year);
        cal.set(Calendar.MONTH, Calendar.FEBRUARY);
        cal.set(Calendar.DAY_OF_MONTH, begMonth);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The Home button took us to the beginning of the February", fmt, inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-2-1", Keys.END);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, year);
        cal.set(Calendar.MONTH, Calendar.FEBRUARY);
        cal.set(Calendar.DAY_OF_MONTH, 28);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The End button took us to the end of the February", fmt, inputBoxResult);

        //Checking February (28 or 29 days), Leap year
        inputBoxResult = homeEndButtonHelper("2012-2-29", Keys.HOME);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, 2012);
        cal.set(Calendar.MONTH, Calendar.FEBRUARY);
        cal.set(Calendar.DAY_OF_MONTH, begMonth);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The Home button took us to the beginning of the February", fmt, inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2012-2-1", Keys.END);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, 2012);
        cal.set(Calendar.MONTH, Calendar.FEBRUARY);
        cal.set(Calendar.DAY_OF_MONTH, 29);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The End button took us to the end of the February", fmt, inputBoxResult);

        //Checking September (30 days)
        inputBoxResult = homeEndButtonHelper("2011-9-30", Keys.HOME);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, year);
        cal.set(Calendar.MONTH,  Calendar.SEPTEMBER);
        cal.set(Calendar.DAY_OF_MONTH, begMonth);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The Home button took us to the beginning of the September", fmt, inputBoxResult);

        inputBoxResult = homeEndButtonHelper("2011-9-1", Keys.END);

        //Setting the date to what we should be expecting
        cal.set(GregorianCalendar.YEAR, year);
        cal.set(Calendar.MONTH,  Calendar.SEPTEMBER);
        cal.set(Calendar.DAY_OF_MONTH, 30);
        fmt= dtFormat.format(cal.getTime());

        assertEquals("The End button took us to the end of the September", fmt, inputBoxResult);
    }

    private final String pageUpDownHelper(int iterCondition, String keyString)
    {
        WebDriver driver = getDriver();
        //Test Begins
        //Making sure the textBox is empty so we always start at the same date
        WebElement element = driver.findElement(By.cssSelector(dateCSS));
        element.clear();
        element.sendKeys(inDate);
        
        //Grabbing the Date Icon and click on it to open the calendar
        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Getting the item that focus is on (should be selected Date)
        String classOfActiveElem = ""+ auraUITestingUtil.getEval(className);
        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));

        //Pressing one button iterCondition times
        for(int i=0; i<iterCondition; i++){
            element.sendKeys(keyString);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }

        //Selecting the date that we are on to get the value and compare it to what it should be
        element.sendKeys(Keys.SPACE);

        //Setting the input box in focus to get its value
        element = driver.findElement(By.cssSelector(dateCSS));

        //Checking if the values are equal
        return element.getAttribute("value");
    }

    //Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.IE10,BrowserType.IE9, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testPageUpDownYear() throws Exception {
    	DateFormat formatter = new SimpleDateFormat (dateStr);
    	open(URL);
        //Calendar used to get current date
        GregorianCalendar cal = new GregorianCalendar();
        //Running test, Increasing year
        String result = pageUpDownHelper( 10, Keys.SHIFT+""+Keys.PAGE_UP);

        //Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(inDate));
        cal.add(Calendar.YEAR, -10);

        //Formatting date to match out of test
        String fmt = new SimpleDateFormat (dateStr).format(cal.getTime());

        //Making sure test result and true calendar outcome match
        assertEquals("Shift + Page up went to the correct date", fmt,result );

        //Resetting calendar
        cal = new GregorianCalendar();

        //Running test, decreasing month
        result = pageUpDownHelper( 15, Keys.SHIFT+""+Keys.PAGE_DOWN);

        //Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(inDate));
        cal.add(Calendar.YEAR, 15);
        fmt = new SimpleDateFormat (dateStr).format(cal.getTime());

       //Making sure test result and true calendar outcome match
        assertEquals("shift + Page Down went to the correct date", fmt,result );
    }


    //Testing the functionality of page_down, page_up, shift+page_down, shift+page_up
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testPageUpDownMonth() throws Exception {
        DateFormat formatter = new SimpleDateFormat (dateStr);
    	open(URL);
    	
        //Calendar used to get current date
        GregorianCalendar cal = new GregorianCalendar();

        //Running test, Decreasing month
        String result = pageUpDownHelper(4, ""+Keys.PAGE_UP);

        //Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(inDate));
        cal.add(Calendar.MONTH, -4);
        String fmt = new SimpleDateFormat (dateStr).format(cal.getTime());
        assertEquals("Page up went to the correct date", fmt,result );

        //Resetting calendar
        cal = new GregorianCalendar();

        //Running Test, increasing month
        result = pageUpDownHelper( 10, ""+Keys.PAGE_DOWN);

        //Moving calendar to match corresponding action of test and formatting date
        cal.setTime(formatter.parse(inDate));
        cal.add(Calendar.MONTH, 10);
        fmt = new SimpleDateFormat (dateStr).format(cal.getTime());

        //Making sure test result and true calendar outcome match
        assertEquals("Page down went to the correct date", fmt, result);
    }

    //Testing functionallity of tab, starting from the InputBox to the today button
    //Do Not run with Safari. Safari does not handle tabs normally
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE,
        BrowserType.SAFARI })
    public void testTab() throws Exception {
        open(URL);

        WebDriver driver = getDriver();
        GregorianCalendar cal = new GregorianCalendar();

        SimpleDateFormat dtFormat = new SimpleDateFormat (dateStr);
        String fmt= dtFormat.format(cal.getTime());

        //Tab test Begins
        //Getting input textbox in focus
        WebElement input = driver.findElement(By.cssSelector(dateCSS));
        input.click();

        //Tabbing to the next item and getting what is in focus
        auraUITestingUtil.pressTab(input);

        String classOfActiveElem = ""+ auraUITestingUtil.getEval(className);
        WebElement element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));

        //Clicking on the Icon
        element.click();

        //Todays date should be on focus, Grabbing that element. Pressing tab with WebDriver after clicking on the icon will move to the move month to the left
        classOfActiveElem = ""+ auraUITestingUtil.getEval(className);
        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));

        //Moving from the on focus element to the today link
        auraUITestingUtil.pressTab(element);

        //Clicking on the today link
        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));
        element.click();

        assertEquals("Value from pressing Today link is todays date", fmt, input.getAttribute("value"));
    }

    //TODO:Should Fail until bug W-1570768 is fixed
    //Checking functionality of the shift tab button
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void _testShiftTab() throws Exception {
         open(URL);

         WebDriver driver = getDriver();

         //Tab test Begins
         //Getting input textbox in focus
         WebElement element = driver.findElement(By.cssSelector(dateCSS));
         element.click();
         element.sendKeys("11111111");
         auraUITestingUtil.pressTab(element);

         String classOfActiveElem = "a[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));
         element.click();

         //Focused on Today's date, grabbing it and pressing tab to go to the Today hyperlink
         classOfActiveElem = "a[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));
         auraUITestingUtil.pressTab(element);

         String shftTab = Keys.SHIFT+""+Keys.TAB;

         //Going from Today hyperlink, back to SelectedDate
         classOfActiveElem = "a[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));
         element.sendKeys(shftTab);

         //Going from SelectedDate to Icon
         classOfActiveElem = "a[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));
         element.sendKeys(shftTab);

         //going from Icon to input
         classOfActiveElem = "a[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));
         element.sendKeys(shftTab);

         //Getting the input textbox in focus and getting the value, which should not have changed
         classOfActiveElem = "input[class*='"+ auraUITestingUtil.getEval(className)+"']";
         element = driver.findElement(By.cssSelector(classOfActiveElem));

         assertEquals("Successfully went from Today, back to the input", "1111-11-11", element.getAttribute("value"));
    }

    //Testing functionality of the ESC key
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testEscape() throws Exception {
        open(URL);

        boolean escButtonClosedCal = false;
        WebDriver driver = getDriver();

        //Setting focus to the Calendar Icon and clicking on it
        WebElement element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Looking for the current date, which should be focused on
        element = driver.findElement(By.cssSelector(selectedDate));

        //Hitting escape to close the Calendar
        element.sendKeys(Keys.ESCAPE);

        //Want to get a NoSuchElementExpection when looking for the class
        //if visible exists, that means that the calendar did not close
        element = driver.findElement(By.cssSelector("div[class*='uiDatePicker uiInputDate uiInput']"));

        escButtonClosedCal = !element.getAttribute("class").contains("visible");

        assertTrue("Escape button closed the calendar and set focus on the calendar Icon", escButtonClosedCal);
    }

    // Testing adding date manually then opening the calendar clicking on the same date
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testAddDateManually() throws Exception {

        open(URL);

        WebDriver driver = getDriver();
        GregorianCalendar cal = new GregorianCalendar();

        SimpleDateFormat dtFormat = new SimpleDateFormat (dateStr);
        String fmt= dtFormat.format(cal.getTime());

        //Test Begins
        auraUITestingUtil.waitForDocumentReady();

        //Checking if date sent in as 2012-12-24 registers correctly after opening calendar
        WebElement element = driver.findElement(By.cssSelector(dateCSS));
        element.click();
        element.sendKeys(fmt);

        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        element = driver.findElement(By.cssSelector(dateCSS));
        element.click();

        assertEquals("Value sent in does not match value taken out", fmt,element.getAttribute("value"));
        element.clear();

        //Checking if date sent in as 20121224 registers correctly after opening calendar
        dtFormat = new SimpleDateFormat (dateStrTogether);
        element = driver.findElement(By.cssSelector(dateCSS));
        element.click();

        element.sendKeys(dtFormat.format(cal.getTime()));

        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        element = driver.findElement(By.cssSelector(dateCSS));
        element.click();

        assertEquals("Value sent in does not match value taken out", fmt,element.getAttribute("value"));
        element.clear();

        //Checking if Today anchor works correctly
        //Should work completely after Bug w-1565525 is closed. Otherwise, breaks after 4pm
        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        element = driver.findElement(By.cssSelector(calToday));
        element.click();

        element = driver.findElement(By.cssSelector(dateCSS));
        element.click();

        assertEquals("Value sent in does not match value taken out", fmt, element.getAttribute("value"));
    }

    //Testing Functionality of calendar in traversing through 1 year by the keys
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDateWithOneArrow() throws Exception {
        open(URL);
        WebDriver driver = getDriver();
        GregorianCalendar cal = new GregorianCalendar();

        //Increase day in month by 10 and year by 1
        cal.add(Calendar.YEAR, 1);
        cal.add(Calendar.DAY_OF_MONTH, -10);

        //Formatting the calendar
        String fmt= new SimpleDateFormat (dateStr).format(cal.getTime());

        //Test Begins
        //Getting the calendar Icon
        WebElement element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        String classOfActiveElem = ""+ auraUITestingUtil.getEval(className);

        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));
        element.sendKeys(Keys.RIGHT);

        assertTrue("Arrow key was recognized: ", "true".equals(auraUITestingUtil.getEval("return $A.test.getActiveElement().getAttribute('aria-selected')")));

        for(int i=0; i<355; i++){
            element.sendKeys(Keys.ARROW_RIGHT);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }

        element.sendKeys(Keys.SPACE);

        element = driver.findElement(By.cssSelector(dateCSS));
        assertEquals("Dates do not match up", fmt, element.getAttribute("value"));
    }

    //Testing functionality of arrows being used one after the other
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testLeftAndRightArrows() throws Exception {
        // Increase day in month by 1
        open(URL);
        WebDriver driver = getDriver();
        GregorianCalendar cal = new GregorianCalendar();

        cal.add(Calendar.DAY_OF_MONTH, 1);

        //Formatting the calendar
        String fmt= new SimpleDateFormat (dateStr).format(cal.getTime());

        //Test Begins
        //Grab calendar Icon
        WebElement element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Find todays date, which should be focused
        String classOfActiveElem = ""+ auraUITestingUtil.getEval(className);
        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));

        //Move from todays date, to the todays date +41
        for(int i=0; i<41; i++){
            element.sendKeys(Keys.ARROW_RIGHT);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }

      //Move from todays date+41, to the todays date+1
        for(int i=0; i<40; i++){
            element.sendKeys(Keys.ARROW_LEFT);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }

        //Select element
        element.sendKeys(Keys.SPACE);

        //Focus on the input box and get its value
        element = driver.findElement(By.cssSelector(dateCSS));
        assertEquals("Next day correctly found", fmt, element.getAttribute("value"));
    }

    //Testing functionality of arrows being used one after the other, while going through months
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testUpAndDownArrows() throws Exception {

        open(URL);
        WebDriver driver = getDriver();

        //Getting the current date so all tests start from the same area
        GregorianCalendar cal = new GregorianCalendar();

        //Formatting the calendar in the format that we expect
        SimpleDateFormat dtFormat = new SimpleDateFormat (dateStr);
        String fmt= dtFormat.format(cal.getTime());

        //Test Begins
        //Select the calendar Icon
        WebElement element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Find todays date, which should be focused
        String classOfActiveElem = ""+ auraUITestingUtil.getEval(className);
        element = driver.findElement(By.cssSelector("a[class*='"+classOfActiveElem+"']"));

        //Move 4 months up
        for(int i=0; i<4; i++){
            element.sendKeys(Keys.ARROW_UP);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }

        //Move four months down
        for(int i=0; i<4; i++){
            element.sendKeys(Keys.ARROW_DOWN);
            element = driver.findElement(By.cssSelector(ariaTrue));
        }
        //Focus should be back on todays date
        element.sendKeys(Keys.SPACE);

        //Select the input text box and get its value for comparison
        element = driver.findElement(By.cssSelector(dateCSS));
        assertEquals("Date has not changed", fmt, element.getAttribute("value"));
    }


    private String iterateCal(int monthIter, int yearIter, String monthSel, String yearSel) {

        WebDriver driver = getDriver();

        //Clicking on the the textbox to gain focus
        WebElement element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        //Finding either the increasing or decreasing month arrow
        element = driver.findElement(By.cssSelector(monthSel));

        //Increasing or decreasing the month
        for(int i=0; i<monthIter;i++){
            element.click();
            element = driver.findElement(By.cssSelector(monthSel));
        }

        //Finding either the increasing or decreasing year arrow
        element = driver.findElement(By.cssSelector(yearSel));

         //Increasing or decreasing the year
        for(int i=0; i<yearIter;i++){
            element.click();
            element = driver.findElement(By.cssSelector(yearSel));
        }

        /* Returning a Boolean value, whether the label in the calendar
         * matches the month and year that we were expecting
         */
        return driver.findElement(By.cssSelector("h4[class*='monthYear']")).getText();
    }

    //Testing functionality of arrows button on calendar by intercombining them and making them go through months and year
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testMonthYearByArrowsButtons() throws Exception {
        String nextMonth = "a[class*='navLink nextMonth']";
        String nextYear = "a[class*='navLink nextYear']";
        String prevMonth = "a[class*='navLink prevMonth']";
        String prevYear = "a[class*='navLink prevYear']";

        open(URL);

        //Getting the current date so all tests start from the same area
        GregorianCalendar cal = new GregorianCalendar();

        //Formatting the calendar in the format that we expect
        SimpleDateFormat dtFormat = new SimpleDateFormat (mnthYr);

        //Increases month and year
        String result = iterateCal(7, 5, nextMonth, nextYear);

        //Modifying calendar by either positive or negative months/years
        cal.add(Calendar.MONTH, 7);
        cal.add(Calendar.YEAR, 5);
        String fmt= dtFormat.format(cal.getTime());

        assertEquals("Date using Month and Year buttons both increasing found correctly", fmt, result);

        //Increase month and Decrease year
        result = iterateCal(7, 10, nextMonth, prevYear);

        cal = new GregorianCalendar();
        cal.add(Calendar.MONTH, 7);
        cal.add(Calendar.YEAR, -10);
        fmt = dtFormat.format(cal.getTime());
        assertEquals("Date using Month and Year buttons, with Month increasing and Year Decreasing, found correctly", fmt, result);

        //Decrease month and Increases year
        result = iterateCal(12, 10, prevMonth, nextYear);

        cal = new GregorianCalendar();
        cal.add(Calendar.MONTH, -12);
        cal.add(Calendar.YEAR,  10);
        fmt = dtFormat.format(cal.getTime());

        assertEquals("Date using Month and Year buttons, with Month Decreasing and Year increasing found correctly", fmt, result);

        //Decrease month and year
        result = iterateCal(12, 10, prevMonth, prevYear);

        cal = new GregorianCalendar();
        cal.add(Calendar.MONTH, -12);
        cal.add(Calendar.YEAR,  -10);
        fmt = dtFormat.format(cal.getTime());

        assertEquals("Date using Month and Year buttons both increasing found correctly", fmt, result);
    }
}