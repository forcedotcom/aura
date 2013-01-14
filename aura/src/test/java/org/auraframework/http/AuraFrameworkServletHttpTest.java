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
import java.util.Date;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpHeaders;
import org.auraframework.test.AuraHttpTestCase;

/**
 * Automation to verify the implementation of AuraFrameworkServlet.
 * AuraFrameworkServlet responds to requests of pattern /auraFW/* This config is
 * stored in aura/dist/config/web.xml for aura running on jetty. In SFDC build,
 * the config is in main-sfdc/config/aura.conf AuraFrameworkServlet sets
 * resources to be cached for 45 days.
 * 
 * @since 0.0.298
 */
public class AuraFrameworkServletHttpTest extends AuraHttpTestCase {
    public final String sampleBinaryResourcePath = "/auraFW/resources/aura/auraIdeLogo.png";
    public final String sampleTextResourcePath = "/auraFW/resources/aura/resetCSS.css";
    public final String sampleJavascriptResourcePath = "/auraFW/javascript/aura_dev.js";
    public final String sampleBinaryResourcePathWithNonce = "/auraFW/resources/123456/aura/auraIdeLogo.png";
    public final String sampleTextResourcePathWithNonce = "/auraFW/resources/123456/aura/resetCSS.css";
    private final long timeWindowExpiry = 60000; // one minute expiration test
                                                 // window

    public AuraFrameworkServletHttpTest(String name) {
        super(name);
    }

    private boolean ApproximatelyEqual(long a, long b, long delta) {
        return (Math.abs(a - b) < delta);
    }

    /**
     * Verify that AuraFrameworkServlet can handle bad resource paths. 1. Non
     * existing resource path. 2. Empty resource path. 3. Access to root
     * directory or directory walking.
     */
    public void testBadResourcePaths() throws Exception {
        String[] badUrls = { "/auraFW", "/auraFW/", "/auraFW/root/",
                // BUG "/auraFW/resources/aura/..", Causes a 500
                "/auraFW/resources/aura/../../",
                // BUG "/auraFW/resources/aura/../../../../", causes a 400
                "/auraFW/home/", "/auraFW/resources/aura/home", "/auraFW/resources/foo/bar",
                // Make sure the regex used in implementation doesn't barf
                "/auraFW/resources/aura/resources/aura/auraIdeLogo.png",
                "/auraFW/resources/aura/auraIdeLogo.png/resources/aura/" };
        for (String url : badUrls) {
            int statusCode = getHttpClient().executeMethod(obtainGetMethod(url));
            assertEquals("Expected:" + HttpStatus.SC_NOT_FOUND + " but found " + statusCode + ", when trying to reach:"
                    + url, HttpStatus.SC_NOT_FOUND, statusCode);
        }
    }

    private void verifyResourceAccess(String resourcePath, int expectedResponseStatus, String failureMsg)
            throws Exception {
        GetMethod get = obtainGetMethod(resourcePath);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals(failureMsg, expectedResponseStatus, statusCode);
    }

    /**
     * Verify that incomplete resource path returns SC_NOT_FOUND(404).
     * Subsequent requests for valid resource on the same path are successful.
     * 
     * @throws Exception
     */
    public void testRequestingFolderAsFileNotAllowed() throws Exception {
        String[] parts = sampleBinaryResourcePath.split("/");
        // Accessing folder(which might have had previous valid access) as file
        String incompletePath = StringUtils.join(Arrays.copyOfRange(parts, 0, parts.length - 1), "/");
        verifyResourceAccess(incompletePath, HttpStatus.SC_NOT_FOUND,
                "Expected server to return a 404 status for folder as file.");

        // Accessing a valid folder
        verifyResourceAccess(incompletePath + "/", HttpStatus.SC_NOT_FOUND,
                "Expected server to return a 404 status for folders(incomplete paths).");

        // Subsequent requests for filed on same path are accepted and serviced
        verifyResourceAccess(sampleBinaryResourcePath, HttpStatus.SC_OK,
                "Expected server to return a 200 status for valid resource.");

    }

    /**
     * Test that AuraFrameworkServlet inspects the date header in the request
     * and sends 304(SC_NOT_MODIFIED) if the If-Modified-Since header indicates
     * that resource is not stale.
     */
    public void testResourceCaching() throws Exception {
        GetMethod get = obtainGetMethod(sampleBinaryResourcePath);
        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.DAY_OF_YEAR, 45);
        get.setRequestHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime()));
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("Expected server to return a 304 for unexpired cache.", HttpStatus.SC_NOT_MODIFIED, statusCode);
        assertNull(get.getResponseBodyAsString());
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a binary resource.
     */
    public void testRequestBinaryResourceWithNonce() throws Exception {
        GetMethod get = obtainGetMethod(sampleBinaryResourcePathWithNonce);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("AuraResourceServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());
        assertEquals("Framework servlet not responding with correct mime type", "image/png",
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue());
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = (df.parse(get.getResponseHeader(HttpHeaders.EXPIRES).getValue()).getTime() - currentDate
                .getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.LONG_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a binary resource.
     */
    public void testRequestBinaryResourceShortExpire() throws Exception {
        GetMethod get = obtainGetMethod(sampleBinaryResourcePath);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("AuraResourceServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());
        assertEquals("Framework servlet not responding with correct mime type", "image/png",
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue());
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = ((df.parse(get.getResponseHeader(HttpHeaders.EXPIRES).getValue()).getTime() + 5000) - currentDate
                .getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.SHORT_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a text resource.
     */
    public void testRequestTextResourceWithNonce() throws Exception {
        GetMethod get = obtainGetMethod(sampleTextResourcePathWithNonce);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("AuraResourceServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());

        assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                get.getResponseCharSet());
        assertTrue("Framework servlet not responding with correct mime type",
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue().startsWith("text/css;"));

        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = ((df.parse(get.getResponseHeader(HttpHeaders.EXPIRES).getValue()).getTime() + 5000) - currentDate
                .getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.LONG_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a text resource.
     */
    public void testRequestTextResourceShortExpire() throws Exception {
        GetMethod get = obtainGetMethod(sampleTextResourcePath);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("AuraResourceServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());

        assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                get.getResponseCharSet());
        assertTrue("Framework servlet not responding with correct mime type",
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue().startsWith("text/css;"));
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = ((df.parse(get.getResponseHeader(HttpHeaders.EXPIRES).getValue()).getTime() + 5000) - currentDate
                .getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.SHORT_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a javascript resource.
     */
    // "W-1402893 - Until we predictable get the nonce (lastmod) in the path at auraFW, we will always return LONG_EXPIRES for javascript"
    public void testRequestJavascriptResourceLongExpire() throws Exception {
        GetMethod get = obtainGetMethod(sampleJavascriptResourcePath);
        int statusCode = getHttpClient().executeMethod(get);
        assertEquals("AuraResourceServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(get.getResponseBodyAsString());

        assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                get.getResponseCharSet());
        assertTrue("Framework servlet not responding with correct mime type",
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue().startsWith("text/javascript;"));
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = ((df.parse(get.getResponseHeader(HttpHeaders.EXPIRES).getValue()).getTime() + 5000) - currentDate
                .getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.LONG_EXPIRE, timeWindowExpiry));
    }
}
