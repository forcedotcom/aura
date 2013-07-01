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

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
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
    public final String sampleBinaryResourcePathWithNonce = "/auraFW/resources/%s/aura/auraIdeLogo.png";
    public final String sampleTextResourcePathWithNonce = "/auraFW/resources/%s/aura/resetCSS.css";
    public static final String PRODUCTION_PROPERTY = "aura.production";
    private final long timeWindowExpiry = 600000; // ten minute expiration test window

    public AuraFrameworkServletHttpTest(String name) {
        super(name);
    }

    private boolean ApproximatelyEqual(long a, long b, long delta) {
        return (Math.abs(a - b) < delta);
    }

    private SimpleDateFormat getHttpDateFormat() {
        return new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
    }

    /**
     * Execute a get method and check that we got a long cache response.
     */
    private int checkLongCache(HttpResponse httpResponse, String mimeType) throws Exception {

        int statusCode = getStatusCode(httpResponse);
        assertEquals("AuraFrameworkServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(getResponseBody(httpResponse));

        String charset = getCharset(httpResponse);
        String responseMime = httpResponse.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue();

        if (mimeType.startsWith("text/")) {

            assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                    charset);
            assertTrue("Framework servlet not responding with correct mime type expected " + mimeType
                    + " got " + responseMime, responseMime.startsWith(mimeType + ";"));
        } else {
            assertEquals("Framework servlet not responding with correct mime type", mimeType,
                    responseMime);
        }

        SimpleDateFormat df = getHttpDateFormat();
        Date currentDate = new Date();
        long expirationMillis = (df.parse(httpResponse.getFirstHeader(HttpHeaders.EXPIRES).getValue()).getTime()
                - currentDate.getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.LONG_EXPIRE, timeWindowExpiry));
        return statusCode;
    }

    private int checkExpired(HttpResponse response, String mimeType) throws Exception {
        int statusCode = getStatusCode(response);
        SimpleDateFormat df = getHttpDateFormat();
        assertEquals("AuraFrameworkServlet failed to return ok.", HttpStatus.SC_OK, statusCode);

        String charset = getCharset(response);
        String responseMime = response.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue();

        if (mimeType.startsWith("text/")) {

            assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                    charset);
            assertTrue("Framework servlet not responding with correct mime type expected " + mimeType
                    + " got " + responseMime, responseMime.startsWith(mimeType + ";"));
        } else {
            assertEquals("Framework servlet not responding with correct mime type", mimeType,
                    responseMime);
        }
        long expirationMillis = df.parse(response.getFirstHeader(HttpHeaders.EXPIRES).getValue()).getTime();
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                expirationMillis < System.currentTimeMillis());
        EntityUtils.consume(response.getEntity());
        return statusCode;
    }

    protected static HttpGet obtainNoncedGetMethod(String noncedPath, boolean fake) throws Exception {
        String nonce;

        if (fake) {
            nonce = "thisisnotanonce";
        } else {
            nonce = Aura.getConfigAdapter().getAuraFrameworkNonce();
        }
        String realPath = String.format(noncedPath, nonce);

        return obtainGetMethod(realPath);
    }

    protected static HttpGet obtainUidedGetMethod(String path, boolean fake) throws Exception {
        String nonce;

        if (fake) {
            nonce = "thisisnotanonce";
        } else {
            nonce = Aura.getConfigAdapter().getAuraFrameworkNonce();
        }
        String realPath = path + "?aura.fwuid=" + nonce;
        return obtainGetMethod(realPath);
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
            HttpGet get = obtainGetMethod(url);
            int statusCode = getStatusCode(perform(get));
            get.releaseConnection();
            assertEquals("Expected:" + HttpStatus.SC_NOT_FOUND + " but found " + statusCode + ", when trying to reach:"
                    + url, HttpStatus.SC_NOT_FOUND, statusCode);
        }
    }

    private void verifyResourceAccess(String resourcePath, int expectedResponseStatus, String failureMsg)
            throws Exception {
        HttpGet get = obtainGetMethod(resourcePath);
        int statusCode = getStatusCode(perform(get));
        get.releaseConnection();
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
     * and sends 200 even though If-Modified-Since header indicates
     * that resource is not stale, but has no fwUid or nonce
     */
    public void testResourceCachingWithoutUidNonce() throws Exception {

        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.DAY_OF_YEAR, 45);

        Header[] headers = new Header[]{ new BasicHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime())) };

        HttpGet get = obtainGetMethod(sampleBinaryResourcePath, false, headers);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();
        assertEquals("Expected server to return a 200 for unexpired cache without fwUid or nonce.", HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
    }

    /**
     * Test that AuraFrameworkServlet inspects the date header in the request
     * and sends 304(SC_NOT_MODIFIED) if the If-Modified-Since header indicates
     * that resource is not stale.
     */
    public void testResourceCachingWithUid() throws Exception {

        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.DAY_OF_YEAR, 45);

        HttpGet get = obtainUidedGetMethod(sampleBinaryResourcePath, false);
        get.setHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime()));

        HttpResponse httpResponse = perform(get);

        int statusCode = getStatusCode(httpResponse);
        assertEquals("Expected server to return a 304 for unexpired cache.", HttpStatus.SC_NOT_MODIFIED, statusCode);
        assertNull(getResponseBody(httpResponse));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a binary resource.
     */
    public void testRequestBinaryResourceWithNonce() throws Exception {
        HttpGet get = obtainNoncedGetMethod(sampleBinaryResourcePathWithNonce, false);
        SimpleDateFormat df = getHttpDateFormat();
        HttpResponse response = perform(get);
        int statusCode;
        checkLongCache(response, "image/png");
        get.releaseConnection();

        get = obtainNoncedGetMethod(sampleBinaryResourcePathWithNonce, false);
        // set the if modified since to a long time ago.
        get.setHeader(HttpHeaders.IF_MODIFIED_SINCE, df.format(new Date(1)));
        statusCode = getStatusCode(perform(get));
        EntityUtils.consume(response.getEntity());
        get.releaseConnection();
        assertEquals("AuraFrameworkServlet failed to return not modified.", HttpStatus.SC_NOT_MODIFIED, statusCode);

        get = obtainNoncedGetMethod(sampleBinaryResourcePathWithNonce, false);
        // set the if modified since to the future.
        get.setHeader(HttpHeaders.IF_MODIFIED_SINCE, df.format(new Date(System.currentTimeMillis() + 24 * 3600 * 1000)));
        statusCode = getStatusCode(perform(get));
        EntityUtils.consume(response.getEntity());
        get.releaseConnection();
        assertEquals("AuraFrameworkServlet failed to return not modified.", HttpStatus.SC_NOT_MODIFIED, statusCode);

        get = obtainNoncedGetMethod(sampleBinaryResourcePathWithNonce, true);
        response = perform(get);

        checkExpired(response, "image/png");
        get.releaseConnection();
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a binary resource.
     */
    public void testRequestBinaryResourceShortExpire() throws Exception {
        HttpGet get = obtainGetMethod(sampleBinaryResourcePath, false);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        String contentType = httpResponse.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue();
        String expires = httpResponse.getFirstHeader(HttpHeaders.EXPIRES).getValue();
        get.releaseConnection();

        assertEquals("AuraFrameworkServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
        assertEquals("Framework servlet not responding with correct mime type", "image/png", contentType);
        SimpleDateFormat df = getHttpDateFormat();
        Date currentDate = new Date();
        long expirationMillis = (df.parse(expires).getTime() - currentDate.getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.SHORT_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a text resource.
     */
    public void testRequestTextResourceWithNonce() throws Exception {
        HttpGet get = obtainNoncedGetMethod(sampleTextResourcePathWithNonce, false);
        HttpResponse response = perform(get);
        SimpleDateFormat df = getHttpDateFormat();
        checkLongCache(response, "text/css");
        get.releaseConnection();

        get = obtainNoncedGetMethod(sampleTextResourcePathWithNonce, false);
        // set the if modified since to a long time ago.
        get.setHeader(HttpHeaders.IF_MODIFIED_SINCE, df.format(new Date(1)));
        int statusCode = getStatusCode(perform(get));
        get.releaseConnection();
        assertEquals("AuraFrameworkServlet failed to return not modified.", HttpStatus.SC_NOT_MODIFIED, statusCode);

        get = obtainNoncedGetMethod(sampleTextResourcePathWithNonce, true);
        response = perform(get);
        checkExpired(response, "text/css");
        get.releaseConnection();
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a text resource.
     */
    public void testRequestTextResourceShortExpire() throws Exception {
        HttpGet get = obtainGetMethod(sampleTextResourcePath);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        String charset = getCharset(httpResponse);
        get.releaseConnection();

        assertEquals("AuraFrameworkServlet failed to fetch a valid resource request.", HttpStatus.SC_OK, statusCode);
        assertNotNull(response);

        assertEquals("Framework servlet not responding with correct encoding type.", AuraBaseServlet.UTF_ENCODING,
                charset);
        assertTrue("Framework servlet not responding with correct mime type",
                httpResponse.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue().startsWith("text/css;"));
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
        Date currentDate = new Date();
        long expirationMillis = (df.parse(httpResponse.getFirstHeader(HttpHeaders.EXPIRES).getValue()).getTime()
                - currentDate.getTime());
        assertTrue("AuraFrameworkServlet is not setting the right value for expires header.",
                ApproximatelyEqual(expirationMillis, AuraBaseServlet.SHORT_EXPIRE, timeWindowExpiry));
    }

    /**
     * Verify that AuraFrameworkServlet responds successfully to valid request
     * for a javascript resource.
     */
    public void testRequestJavascriptResourceLongExpire() throws Exception {
        HttpGet get = obtainGetMethod(sampleJavascriptResourcePath);
        HttpResponse response = perform(get);

        checkExpired(response, "text/javascript");
        get.releaseConnection();

        get = obtainUidedGetMethod(sampleJavascriptResourcePath, false);
        response = perform(get);

        checkLongCache(response, "text/javascript");
        get.releaseConnection();

        get = obtainUidedGetMethod(sampleJavascriptResourcePath, true);
        response = perform(get);

        checkExpired(response, "text/javascript");
        get.releaseConnection();
    }

    public void testExistingMinifiedResource() throws Exception {

        getMockConfigAdapter().setIsProduction(true);

        HttpGet get = obtainGetMethod("/auraFW/resources/moment/moment.js");
        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);

        checkExpired(httpResponse, "text/javascript");
        assertTrue(response.contains("(function(e){"));

        get.releaseConnection();
    }

    public void testNonExistentMinifiedResource() throws Exception {

        getMockConfigAdapter().setIsProduction(true);

        HttpGet get = obtainGetMethod("/auraFW/resources/codemirror/js/codemirror.js");
        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);

        checkExpired(httpResponse, "text/javascript");
        assertTrue(response.contains("function setDefaults("));

        get.releaseConnection();
    }
}
