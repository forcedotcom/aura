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
package org.auraframework.http;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.http.HttpHeaders;

import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.AuraTextUtil;

/**
 * Automation to verify the functioning of AuraResourceServlet.
 * AuraResourceServlet is used to preload definitions of components in a given namespace.
 * It is also used to load CSS
 *
 *
 *
 * @since 0.0.128
 */
public class AuraResourceServletHttpTest extends AuraHttpTestCase {
    public AuraResourceServletHttpTest(String name){
        super(name);
    }
    /**
     * Verify that special characters in CSS file are serialized down to the client.
     * To make sure they are not replaced with a '?'
     * Automation for W-1071128
     * @throws Exception
     */
    @UnAdaptableTest
    public void testSpecialCharactersInCSSAreSerialized()throws Exception{
        String modeAndContext = "{'mode':'DEV','preloads':['preloadTest']}";
        String url = "/l/"+AuraTextUtil.urlencode(modeAndContext) +"/app.css";
        GetMethod get = obtainGetMethod(url);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, statusCode);
        String response = get.getResponseBodyAsString();
        String expected = Arrays.toString("•".getBytes());
        String token = "content: '";
        int start = response.indexOf(token) + token.length();
        String actual = Arrays.toString(response.substring(start, response.indexOf('\'',start)).getBytes());
        assertEquals(String.format("Failed to see the special character in the CSS file (%s)", url), expected, actual);
    }
    /**
     * Verify that special characters in component mark up are serialized as part of component definition.
     * Automation for W-1071128
     * @throws Exception
     */
    @UnAdaptableTest
    public void testSpecialCharactersInMarkupAreSerialized() throws Exception{
        String modeAndContext = "{'mode':'DEV','preloads':['preloadTest']}";
        String url = "/l/"+AuraTextUtil.urlencode(modeAndContext) +"/app.js";
        GetMethod get = obtainGetMethod(url);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, statusCode);
        String response = get.getResponseBodyAsString();
        String expected = Arrays.toString("공유".getBytes());
        String token = "Test whether the special character shows up: ";
        int start = response.indexOf(token) + token.length();
        String actual = Arrays.toString(response.substring(start, response.indexOf(" ",start)).getBytes());
        assertEquals(String.format("Failed to see the special character in the Component definition (%s)", url), expected, actual);
    }

    /**
     * GET with If-Modified-Since header from an hour ago, will return the expected resource.
     */
    @TestLabels("auraSanity")
    public void testGetWithIfModifiedSinceOld() throws Exception {
        String requestContext = "{'mode':'DEV'}";
        String url = "/l/"+AuraTextUtil.urlencode(requestContext) +"/app.js";
        GetMethod get = obtainGetMethod(url);
        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.HOUR, -1);
        get.setRequestHeader(HttpHeaders.IF_MODIFIED_SINCE, new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime()));
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());
    }

    /**
     * GET with If-Modified-Since header 45 days from now, will return 304 with empty body.
     */
    @TestLabels("auraSanity")
    public void testGetWithIfModifiedSinceNew() throws Exception {
        String requestContext = "{'mode':'DEV'}";
        String url = "/l/"+AuraTextUtil.urlencode(requestContext) +"/app.js";
        GetMethod get = obtainGetMethod(url);
        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.DAY_OF_YEAR, 45);
        get.setRequestHeader(HttpHeaders.IF_MODIFIED_SINCE, new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime()));
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_NOT_MODIFIED, statusCode);
        assertNull(get.getResponseBodyAsString());
    }

    /**
     * GET without If-Modified-Since header from an hour ago, will return the expected resource.
     */
    @TestLabels("auraSanity")
    public void testGetWithoutIfModifiedSince() throws Exception {
        String requestContext = "{'mode':'DEV'}";
        String url = "/l/"+AuraTextUtil.urlencode(requestContext) +"/app.js";
        GetMethod get = obtainGetMethod(url);
        get.removeRequestHeader(HttpHeaders.IF_MODIFIED_SINCE);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());
    }
}
