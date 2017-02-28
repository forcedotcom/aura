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
package org.auraframework.integration.test.http;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;

import javax.inject.Inject;

import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.message.BasicHeader;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.integration.test.util.AuraHttpTestCase;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

/**
 * Automation to verify the functioning of AuraResourceServlet. AuraResourceServlet is used to preload definitions of
 * components in a given namespace. It is also used to load CSS
 */
public class AuraResourceServletHttpTest extends AuraHttpTestCase {
	@Inject
	private MockConfigAdapter configAdapter;
	
    /**
     * Verify style def ordering for components included as facets. Create a chain of components as facet and verify the
     * order of css(Style Defs)
     *
     * @throws Exception
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testCSSOrdering_AcrossFacets() throws Exception {
        String modeAndContext = getAuraTestingUtil().getContextURL(Mode.DEV, Format.CSS,
                "auratest:test_css_a", ComponentDef.class, false);
        String url = "/l/" + AuraTextUtil.urlencode(modeAndContext) + "/app.css";
        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);

        int idx_a, idx_b, idx_c, idx_d;

        idx_a = response.indexOf("div.auratestTest_css_a");
        idx_b = response.indexOf("div.auratestTest_css_b");
        idx_c = response.indexOf("div.auratestTest_css_c");
        idx_d = response.indexOf("div.auratestTest_css_d");
        assertTrue("_d must come before _c in: " + response, idx_d < idx_c);
        assertTrue("_c must come before _b in: " + response, idx_c < idx_b);
        assertTrue("_b must come before _a in: " + response, idx_b < idx_a);
    }

    @AuraTestLabels("auraSanity")
    @Test
    public void testCSSOrdering_AcrossInheritance() throws Exception {
        String modeAndContext = getAuraTestingUtil().getContextURL(Mode.DEV, Format.CSS, "auratest:test_css_child",
                ComponentDef.class, false);
        String url = "/l/" + AuraTextUtil.urlencode(modeAndContext) + "/app.css";
        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);

        int idx_child, idx_parent, idx_grandParent;

        idx_child = response.indexOf("div.auratestTest_css_child");
        idx_parent = response.indexOf("div.auratestTest_css_parent");
        idx_grandParent = response.indexOf("div.auratestTest_css_grandParent");
        assertTrue("_grandParent must come before _parent in: " + response, idx_grandParent < idx_parent);
        assertTrue("_parent must come before _child in: " + response, idx_parent < idx_child);
    }

    /**
     * Verify that special characters in CSS file are serialized down to the client. To make sure they are not replaced
     * with a '?' Automation for W-1071128
     *
     * @throws Exception
     */
    @UnAdaptableTest
    @Test
    public void testSpecialCharactersInCSSAreSerialized() throws Exception {
        String modeAndContext = getSimpleContext(Format.CSS, false);
        String url = "/l/" + AuraTextUtil.urlencode(modeAndContext) + "/app.css";

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);

        String expected = Arrays.toString("•".getBytes());
        String token = "content:'";
        int start = response.indexOf(token) + token.length();
        String actual = Arrays.toString(response.substring(start, response.indexOf('\'', start)).getBytes());
        assertEquals(String.format("Failed to see the special character in the CSS file (%s)", url), expected, actual);
    }

    /**
     * Verify that special characters in component mark up are serialized as part of component definition. Automation
     * for W-1071128
     *
     * @throws Exception
     */
    @UnAdaptableTest
    @Test
    public void testSpecialCharactersInMarkupAreSerialized() throws Exception {
        String modeAndContext = getSimpleContext(Format.JS, false);
        String url = "/l/" + AuraTextUtil.urlencode(modeAndContext) + "/app.js";

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);

        String expected = Arrays.toString("공유".getBytes("UTF8"));
        String token = "Test whether the special character shows up: ";
        int start = response.indexOf(token) + token.length();
        String actual = Arrays.toString(response.substring(start, response.indexOf(" ", start)).getBytes("UTF8"));
        assertEquals(String.format("Failed to see the special character in the Component definition (%s)", url),
                expected, actual);
    }

    /**
     * GET with If-Modified-Since header from an hour ago, will return 304 if the UID is correct.
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testGetWithIfModifiedSinceOld() throws Exception {
        String requestContext = getSimpleContext(Format.JS, false);
        String url = "/l/" + AuraTextUtil.urlencode(requestContext) + "/app.js";

        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.HOUR, -1);

        Header[] headers = new Header[] { new BasicHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime())) };

        HttpGet get = obtainGetMethod(url, headers);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_NOT_MODIFIED, statusCode);
        assertNull(response);
    }

    /**
     * GET with If-Modified-Since header from an hour ago, will return 304 if the UID is correct.
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testGetWithIfModifiedSinceOldModified() throws Exception {
        String requestContext = getSimpleContext(Format.JS, true);
        String url = "/l/" + AuraTextUtil.urlencode(requestContext) + "/app.js";

        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.HOUR, -1);

        Header[] headers = new Header[] { new BasicHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime())) };

        HttpGet get = obtainGetMethod(url, headers);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
    }

    /**
     * GET with If-Modified-Since header 45 days from now, will return 304 with empty body.
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testGetWithIfModifiedSinceNew() throws Exception {
        String url = "/l/" + AuraTextUtil.urlencode(getSimpleContext(Format.JS, false)) + "/app.js";
        Calendar stamp = Calendar.getInstance();
        stamp.add(Calendar.DAY_OF_YEAR, 45);

        Header[] headers = new Header[] { new BasicHeader(HttpHeaders.IF_MODIFIED_SINCE,
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz").format(stamp.getTime())) };

        HttpGet get = obtainGetMethod(url, headers);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_NOT_MODIFIED, statusCode);
        assertNull(response);
    }

    /**
     * GET without If-Modified-Since header from an hour ago, will return the expected resource.
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testGetWithoutIfModifiedSince() throws Exception {
        String requestContext = getSimpleContext(Format.JS, false);
        String url = "/l/" + AuraTextUtil.urlencode(requestContext) + "/app.js";

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
    }

    /**
     * Verify that an svg resource can be retrieved and will return the expected source for components with svg
     * definitions. Also verify that no source is returned in the case that the svg definition does not exist.
     */
    @Test
    public void testGetSvgResource() throws Exception {
        String requestContext = getSimpleContext(Format.SVG, false);
        String url = "/l/" + AuraTextUtil.urlencode(requestContext) + "/test:fakeComponent/resources.svg";

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
        assertTrue("SVG source was not found in the response.", response.contains("SVG"));

        url = "/l/" + AuraTextUtil.urlencode(requestContext) + "/test:doesNotExist/resources.svg";

        get = obtainGetMethod(url);
        httpResponse = perform(get);
        statusCode = getStatusCode(httpResponse);
        response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_OK, statusCode);
        assertNotNull(response);
        assertTrue("SVG source should not have been returned.", response.isEmpty());
    }

    @Test
    public void testInlineJSNoCacheHeaders() throws Exception {
        String url = "/l/" + AuraTextUtil.urlencode(getSimpleContext(Format.JS, false)) + "/inline.js?jwt=" + configAdapter.generateJwtToken();

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        get.releaseConnection();

        Header cacheControl[] = httpResponse.getHeaders(HttpHeaders.CACHE_CONTROL);
        assertEquals(HttpStatus.SC_OK, getStatusCode(httpResponse));
        assertTrue(HttpHeaders.CACHE_CONTROL + " header must exists for inline.js", cacheControl.length > 0);
        assertTrue(HttpHeaders.CACHE_CONTROL + " header should be no-cache, no-store",
                cacheControl[0].getValue().contains("no-cache, no-store"));
        Header pragma[] = httpResponse.getHeaders(HttpHeaders.PRAGMA);
        assertTrue(HttpHeaders.PRAGMA + " header must exists for inline.js", pragma.length > 0);
        assertTrue(HttpHeaders.PRAGMA + " header should be no-cache",
                pragma[0].getValue().contains("no-cache"));
    }

    @Test
    public void testInlineJSExceptionCode() throws Exception {
        // modified uid url
        String url = "/l/" + AuraTextUtil.urlencode(getSimpleContext(Format.JS, true)) + "/inline.js?jwt=" + configAdapter.generateJwtToken();

        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertTrue("JS Exception code should be in IIFE",
                response.startsWith("(function () { function execAuraException() { $A.clientService.throwExceptionEvent("));
        assertTrue("JS exception code should be in beforeFrameworkInit",
                response.contains("window.Aura.beforeFrameworkInit.push(execAuraException)"));
    }

    /**
     * This gets a simple context string that uses a single preload.
     */
    private String getSimpleContext(Format format, boolean modified) throws Exception {
        return getAuraTestingUtil().getContextURL(Mode.DEV, format,
                "auratest:test_SimpleServerRenderedPage", ApplicationDef.class,
                modified);
    }
}
