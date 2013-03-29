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
package org.auraframework.components.ui;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Map;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.json.JsonReader;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;


public class InputDateTimeUITest extends WebDriverTestCase {

    // URL string to go to
    private final String URL = "/uitest/dateTimePickerTest.cmp";

    private final String dateTimeStr = "yyyy-MM-dd HH:mm";

    private final String dateCSS = "input[class*='date_input_box']";
    private final String dateIcon = "a[class*='datePicker-openIcon']";
    private final String selectedDate = "a[class*='selectedDate']";


    public InputDateTimeUITest(String name) {
        super(name);
    }
    @SuppressWarnings("unchecked")
    private void getValueByLocale(String locale, String dayOfWeek, String month, Map<String, String> urlAuraParameters)
            throws Exception {
        String query = "";

        List<NameValuePair> params = Lists.newArrayList();

        for (Map.Entry<String, String> entry : urlAuraParameters.entrySet()) {
            params.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }
        query = URLEncodedUtils.format(params, "UTF-8");

        // final url Request to be send to server
        String url = "aura?" + query;

        GetMethod get = obtainGetMethod(url);
        get.addRequestHeader("Accept-Language", locale);
        getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();
        int statusCode = getHttpClient().executeMethod(get);
        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));

        System.out.println(json.toString());

        //Grab the object you are looking for from the json tree
        Map<String, Object> context = (Map<String, Object>) json.get("context");
        Map<String, Object> components = (Map<String, Object>) context.get("components");
        Map<String, Object>  num10= (Map<String, Object>) components.get("10");
        Map<String, Object>  valueMap = (Map<String, Object>) num10.get("value");
        Map<String, Object> model = (Map<String, Object>) valueMap.get("model");
        ArrayList<Map<String, Object>> monthLabels = (ArrayList<Map<String, Object>>) model.get("monthLabels");
        ArrayList<Map<String, Object>> weekDayLabels = (ArrayList<Map<String, Object>>) model.get("weekdayLabels");
        Map<String, Object> weekdayFromServer = weekDayLabels.get(1);
        Map<String, Object> monthFromServer = monthLabels.get(0);

        assertEquals("The week day in the new locale ("+locale+") matches",weekdayFromServer.get("fullName"),dayOfWeek);
        assertEquals("The month in the new locale ("+locale+") matches",monthFromServer.get("fullName"),month);

    }

    // TODO W-1591951
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void _testCheckLocale() throws Exception{

        Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "uiTest:dateTimePickerTest", "aura.context",
                "{'mode':'DEV'}", "visible","true");

        //Monday in Chinese
        String dayOfWeek = "星期一";

        //January in chinese
        String month = "一月";

        //Chinese locale symbol
        String locale = "zh";

        getValueByLocale(locale, dayOfWeek, month, urlAuraParameters);
    }

    private String addDateManuallyHelper(String dateTimeInput)
    {
        WebDriver driver = getDriver();

        //Grabing the input box, making sure it is clear and then sending in the input
        WebElement element = driver.findElement(By.cssSelector(dateCSS));
        element.click();
        element.clear();
        element.sendKeys(dateTimeInput);

        element = driver.findElement(By.cssSelector(dateIcon));
        element.click();

        element = driver.findElement(By.cssSelector(selectedDate));
        element.click();

        element = driver.findElement(By.cssSelector(dateCSS));
        element.click();

        return element.getAttribute("value");
    }

    /* Testing adding date manually then opening the calendar clicking on the same date
     * The only valid input for this component is YYYY-MM-DD HH:MM. All others are invalid
     * This component also uses the same JS classes as inputDateTime.cmp for the calendar.
     * The difference is the time which is handled differently.
     */
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testAddDateManually() throws Exception {

        open(URL);

        GregorianCalendar cal = new GregorianCalendar();
        cal.set(Calendar.HOUR_OF_DAY, 12);
        cal.set(Calendar.MINUTE, 13);

        SimpleDateFormat dtFormat = new SimpleDateFormat (dateTimeStr);
        String fmt= dtFormat.format(cal.getTime());

        //Test Begins
        //initial check


        assertEquals("Value sent in does not match value taken out", fmt, addDateManuallyHelper(fmt));

        //Creating a secondary format to send into the textbox
        String baseFmt = new SimpleDateFormat ("yyyy-MM-dd").format(cal.getTime());

        //Checking to make sure the input wraps around correctly
        cal.set(Calendar.HOUR_OF_DAY, 1);
        cal.set(Calendar.MINUTE, 11);

        //Resetting the format to the new time
        fmt= dtFormat.format(cal.getTime());
        //Checking that the time wraps around the hours 0-23
        assertEquals("Value sent in does not match value taken out", fmt, addDateManuallyHelper(baseFmt+" 25:11"));

        //Checking that the time wraps around the minutes 0-59
        assertEquals("Value sent in does not match value taken out", fmt,addDateManuallyHelper(baseFmt+" 24:71"));

    }
}