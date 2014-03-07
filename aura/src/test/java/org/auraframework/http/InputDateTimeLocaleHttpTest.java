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

import java.util.List;

import java.util.Map;

import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.message.BasicHeader;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.json.JsonReader;
import org.json.JSONException;

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

    private void checkValues(String dayOfWeek, String month, HttpPost auraPost) throws Exception {
        HttpResponse httpResponse = perform(auraPost);

        String response = getResponseBody(httpResponse);
        int statusCode = getStatusCode(httpResponse);
        auraPost.releaseConnection();

        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        
        //Grab the object you are looking for from the json tree
        @SuppressWarnings("unchecked")
        List<Object> actions = (List<Object>) json.get("actions");
        @SuppressWarnings("unchecked")
        Map<String, Object> action = (Map<String, Object>) actions.get(0);
        @SuppressWarnings("unchecked")
        List<Map<String,Object>> components = (List<Map<String,Object>>) action.get("components");
        Map<String, Object>  num = null;
        
        /*
         * Structure of components array: 
         * [
         *   {
         *       serId:10, 
         *       value:{
         *               model:{
         *                      monthLabels:[...], 
         *                      weekdayLabels:[...], 
         *                      langLocale:zh
         *                     }, 
         *               componentDef:{
         *                             serId:11, 
         *                             value:{...}
         *                            }, 
         *               globalId:20
         *              }
         *      }, 
         *    {
         *        serRefId:1
         *    }
         * ]
         * What we want is the gloabalId key (in this case 20), since it is the only one with the key 'value' underneath it.
         * We could just look for 20 but that is going to change. next lines of code try to find the key, that has the key 
         * value under it.  
         */
        
               
        for (Map<String,Object> cmp : components) {
            if(cmp.containsKey("value")){
                num = cmp;
                break;
            }
        }
        
        if(num == null){
            throw new JSONException("Key: 'Values', not found under parent key(s): "+components.toString());
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object>  valueMap = (Map<String, Object>) num.get("value"); 
        @SuppressWarnings("unchecked")
        Map<String, Object> model = (Map<String, Object>) valueMap.get("model");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> monthLabels = (List<Map<String, Object>>) model.get("monthLabels"); 
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> weekDayLabels = (List<Map<String, Object>>) model.get("weekdayLabels"); 
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
        Header[] headers = new Header[]{ new BasicHeader(HttpHeaders.ACCEPT_LANGUAGE, locale) };
        HttpPost auraPost = new ServerAction("aura://ComponentController/ACTION$getComponent", null)
            .putParam("name", "uiTest:inputDate_Test").getPostMethod();
        auraPost.setHeaders(headers);
        checkValues(dayOfWeek, month, auraPost);
    }
}
