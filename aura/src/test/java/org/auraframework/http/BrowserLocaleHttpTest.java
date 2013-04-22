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

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

/**
 * Automation to verify output by changing browser Locale functionally.
 */
@UnAdaptableTest
public class BrowserLocaleHttpTest extends AuraHttpTestCase {
    public BrowserLocaleHttpTest(String name) {
        super(name);
    }

    @SuppressWarnings("unchecked")
    private void getValueByLocale(String locale, String expectedResult, Map<String, String> urlAuraParameters)
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
        Map<String, Object> componentsMap = (Map<String, Object>) json.get("component");
        Map<String, Object> valueMap = (Map<String, Object>) componentsMap.get("value");
        Map<String, Object> modelMap = (Map<String, Object>) valueMap.get("model");
        Object actualValue = modelMap.get("text");
        assertEquals(String.format("Localized value incorrect using locale: %s, for Requested Url: %s", locale, url),
                expectedResult, actualValue);
    }

    /**
     * Test to check if currency Code and currency value changes for different
     * locale
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testOutputCurrencyCmpWithPositiveValue() throws Exception {
        Double unlocalizedValue = 1234567.89;

        // key value map for aura URL Parameters
        Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "ui:outputCurrency", "aura.context",
                "{'mode':'DEV'}", "value", unlocalizedValue.toString());

        getValueByLocale("", "$1,234,567.89", urlAuraParameters);
        getValueByLocale("en-US", "$1,234,567.89", urlAuraParameters);
        getValueByLocale("de-DE", "123.456.789,00 €", urlAuraParameters);
        getValueByLocale("en-GB", "£1,234,567.89", urlAuraParameters);
    }

    public void testOutputCurrencyCmpWithInvalidLocale() throws Exception {
        try {
            Double unlocalizedValue = 1234567.89;

            // key value map for aura URL Parameters
            Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "ui:outputCurrency", "aura.context",
                    "{'mode':'DEV'}", "value", unlocalizedValue.toString());
            getValueByLocale("abc", "$1,234,567.89", urlAuraParameters);
            fail("Returned Currency Value with invalid locale");
        } catch (Exception e) {
            assertNotNull("Expected JsonStreamReader Exception to be thrown", e);
            String cause = e.toString();
            assertTrue("Expected JsonStreamReader exception",
                    cause.contains("org.auraframework.util.json.JsonStreamReader$JsonStreamParseException"));
        }
    }

    @TestLabels("auraSanity")
    public void testOutputCurrencyCmpWithNegativeValue() throws Exception {
        Double unlocalizedValue = 1234567.89;

        // key value map for aura URL Parameters
        Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "ui:outputCurrency", "aura.context",
                "{'mode':'DEV'}", "value", "-" + unlocalizedValue.toString());
        getValueByLocale("", "($1,234,567.89)", urlAuraParameters);
        getValueByLocale("en-US", "($1,234,567.89)", urlAuraParameters);
        getValueByLocale("de-DE", "-123.456.789,00 €", urlAuraParameters);
        getValueByLocale("en-GB", "-£1,234,567.89", urlAuraParameters);
    }

    public void testOutputCurrencyCmpWithZeroValue() throws Exception {
        // key value map for aura URL Parameters
        Map<String, String> urlAuraParameters = ImmutableMap.of("aura.tag", "ui:outputCurrency", "aura.context",
                "{'mode':'DEV'}", "value", "0.00");
        getValueByLocale("", "$0.00", urlAuraParameters);
        getValueByLocale("de-DE", "0,00 €", urlAuraParameters);
        getValueByLocale("en-GB", "£0.00", urlAuraParameters);

        Map<String, String> urlAuraParameters1 = ImmutableMap.of("aura.tag", "ui:outputCurrency", "aura.context",
                "{'mode':'DEV'}", "value", "-0.00");
        getValueByLocale("en-US", "$0.00", urlAuraParameters1);
    }
}
