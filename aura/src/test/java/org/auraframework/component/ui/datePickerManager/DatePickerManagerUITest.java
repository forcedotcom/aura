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
package org.auraframework.component.ui.datePickerManager;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class DatePickerManagerUITest extends WebDriverTestCase {

    // URL string to go to
    public String URL = "/uitest/datePickerManager_Test.cmp";
    private final String TEST_DATE_TO_USE = "4/15/2013";

    private final String DATE_INPUT_BOX_SEL = "input[class*='date_input_box']";
    private final String DATE_ICON_SEL = "//a[@class='datePicker-openIcon uiInput uiInputDate'][2]";
    private final String CLASSNAME = "return $A.test.getActiveElement().className";

    public DatePickerManagerUITest(String name) {
        super(name);

    }
    /**
     * Test verifying that the inputText takes in input
     * @throws Exception
     */
    public void testDatepickerOpensToCorrectValue () throws Exception {
        open(URL);
        // Test Begins
        // Making sure the textBox is empty so we always start at the same date
        WebElement element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        element.clear();
        element.sendKeys(TEST_DATE_TO_USE);
        
        // Grabbing the Date Icon and click on it to open the calendar
        element = findDomElement(By.xpath(DATE_ICON_SEL));
        element.click();

        //Grabbing the date that the datePicker opened to. Then verifying that it is correct
        String classOfActiveElem = "" + auraUITestingUtil.getEval(CLASSNAME);
        element = findDomElement(By.cssSelector("a[class*='" + classOfActiveElem + "']"));
        assertEquals("The date the that datepicker opened to is incorrect", TEST_DATE_TO_USE, element.getAttribute("data-datevalue"));
        
        //Grabbing date directly above it, clicking on it, then verifying that it is the correct date.
        element = findDomElement(By.linkText("8"));      
        element.click();
        element = findDomElement(By.cssSelector(DATE_INPUT_BOX_SEL));
        assertEquals("The date selected and the date in the inputText box do not match", "04/08/2013", element.getAttribute("value"));
       
        
    }
}