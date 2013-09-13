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
package org.auraframework.http;

import java.util.*;

import org.apache.http.*;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

/**
 * Automation to check support for date and dateTimePicker for different Locales.
 */
@UnAdaptableTest
public class InputDateTimeLocaleHttpTest extends AuraHttpTestCase{
	
	 //Monday in Chinese
	private final String dayOfWeek = "星期一";
    
    //January in chinese
	private final String month = "一月";
    
    //Chinese locale symbol
	private final String locale = "zh";
	
	public InputDateTimeLocaleHttpTest(String name) {
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

        Header[] headers = new Header[]{ new BasicHeader(HttpHeaders.ACCEPT_LANGUAGE, locale) };

        HttpGet get = obtainGetMethod(url, headers);
        HttpResponse httpResponse = perform(get);

        String response = getResponseBody(httpResponse);
        int statusCode = getStatusCode(httpResponse);
        get.releaseConnection();

        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        
        //Grab the object you are looking for from the json tree
        Map<String, Object> context = (Map<String, Object>) json.get("context");
        Map<String, Object> components = (Map<String, Object>) context.get("components");
        Map<String, Object>  num11= (Map<String, Object>) components.get("11");
        Map<String, Object>  valueMap = (Map<String, Object>) num11.get("value"); 
        Map<String, Object> model = (Map<String, Object>) valueMap.get("model");
        ArrayList<Map<String, Object>> monthLabels = (ArrayList<Map<String, Object>>) model.get("monthLabels"); 
        ArrayList<Map<String, Object>> weekDayLabels = (ArrayList<Map<String, Object>>) model.get("weekdayLabels"); 
        Map<String, Object> weekdayFromServer = weekDayLabels.get(1);
        Map<String, Object> monthFromServer = monthLabels.get(0);
        
        assertEquals("The week day in the new locale ("+locale+") matches",weekdayFromServer.get("fullName"),dayOfWeek);      
        assertEquals("The month in the new locale ("+locale+") matches",monthFromServer.get("fullName"),month);

    }

	/**
	 * Test to verify daysofweek and month changes for chinese locale
	 * For Date Picker
     * @throws Exception
	 */
	public void testCheckLocaleForDatePicker() throws Exception{
		
		Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "uiTest:datePickerTest", "aura.context",
                "{'mode':'DEV'}", "visible","true");
        
        getValueByLocale(locale, dayOfWeek, month, urlAuraParameters);
    }
}
