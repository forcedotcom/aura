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

import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.client.UserAgent;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

/**
 * Automation to verify the handling of AuraServlet requests.
 * 
 * 
 * @since 0.0.139
 */
public class AuraServletHttpTest extends AuraHttpTestCase {
    public AuraServletHttpTest(String name) {
        super(name);
    }

    /**
     * Get responses should have preloads serialized.
     */
    @SuppressWarnings("unchecked")
    public void testGetContextHasPreloads() throws Exception {
        String url = "/aura?aura.tag=test%3Atext&aura.context="
                + AuraTextUtil.urlencode(getSimpleContext(Format.JSON, false));
        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> context = (Map<String, Object>) json.get("context");
        assertTrue("preloads wasn't serialized", context.containsKey("preloads"));
        List<String> preloads = (List<String>) context.get("preloads");
        assertNotNull(preloads);
        assertTrue("missing explicit preload", preloads.contains("preloadTest"));
    }

    /**
     * Post requests should not have preloads serialzied.
     */
    public void testPostContextWithoutPreloads() throws Exception {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<String, Object>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        @SuppressWarnings("rawtypes")
        Map[] actions = { actionInstance };
        message.put("actions", actions);

        String jsonMessage = Json.serialize(message);

        Map<String, String> params = new HashMap<String, String>();
        params.put("message", jsonMessage);
        params.put("aura.token", getCsrfToken());
        params.put("aura.context", getSimpleContext(Format.JSON, false));

        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();

        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) json.get("context");
        assertFalse("preloads shouldn't get serialized on posts", context.containsKey("preloads"));
    }

    /**
     * This is actually an invalid test.
     * 
     */
    public void testPostWithOldLastMod() throws Exception {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<String, Object>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        @SuppressWarnings("rawtypes")
        Map[] actions = { actionInstance };
        message.put("actions", actions);

        String jsonMessage = Json.serialize(message);

        Map<String, String> params = new HashMap<String, String>();
        params.put("message", jsonMessage);
        params.put("aura.token", getCsrfToken());
        params.put("aura.context", getSimpleContext(Format.JSON, true));

        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();

        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }

        assertTrue("response not wrapped with ERROR marker",
                response.startsWith(AuraBaseServlet.CSRF_PROTECT + "*/") && response.endsWith("/*ERROR*/"));
        response = response.substring(AuraBaseServlet.CSRF_PROTECT.length() + 2,
                response.length() - "/*ERROR*/".length());
        @SuppressWarnings("unchecked")
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response);
        assertEquals(true, json.get("exceptionEvent"));
        @SuppressWarnings("unchecked")
        Map<String, Object> eventJson = (Map<String, Object>) json.get("event");
        assertEquals("markup://aura:clientOutOfSync", eventJson.get("descriptor"));
        Object f = json.get("defaultHandler");
        assertEquals(JsFunction.class, f.getClass());
        assertEquals("try{$A.clientService.setOutdated()}catch(e){$L.clientService.setOutdated()}",
                ((JsFunction) f).getBody());
    }

    private void assertNoCacheRequest(String inputUrl, String expectedRedirect) throws Exception {
        HttpGet get = obtainGetMethod(inputUrl, false);
        HttpResponse response = perform(get);
        EntityUtils.consume(response.getEntity());
        get.releaseConnection();

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, getStatusCode(response));
        assertEquals(expectedRedirect, response.getFirstHeader(HttpHeaders.LOCATION).getValue());
        assertEquals("no-cache, no-store", response.getFirstHeader(HttpHeaders.CACHE_CONTROL).getValue());
        assertEquals("no-cache", response.getFirstHeader(HttpHeaders.PRAGMA).getValue());
    }

    /**
     * nocache in the request will redirect to the input url (minus the protocol and host)
     */
    public void testNoCache() throws Exception {
        assertNoCacheRequest(String.format("/aura?aura.tag&nocache=%s", URLEncoder.encode(
                "http://any.host/m?aura.mode=PROD&aura.format=HTML#someidinhere?has=someparam", "UTF-8")),
                "/m?aura.mode=PROD&aura.format=HTML#someidinhere?has=someparam");
    }

    public void testNoCacheNoFragment() throws Exception {
        assertNoCacheRequest(
                String.format("/aura?aura.tag&nocache=%s", URLEncoder.encode("http://any.host/m?chatter", "UTF-8")),
                "/m?chatter");
    }

    public void testNoCacheNoQuery() throws Exception {
        assertNoCacheRequest(
                String.format("/aura?aura.tag&nocache=%s",
                        URLEncoder.encode("http://any.host/m#someid?param=extra", "UTF-8")), "/m#someid?param=extra");
    }

    public void testNoCacheNoValue() throws Exception {
        HttpGet get = obtainGetMethod("/aura?aura.tag&nocache");
        HttpResponse response = perform(get);

        assertEquals(HttpStatus.SC_OK, getStatusCode(response));
        assertTrue(getResponseBody(response).startsWith(
                String.format("%s*/{\n  \"message\":\"QualifiedName is required for descriptors\"",
                        AuraBaseServlet.CSRF_PROTECT)));

        get.releaseConnection();
    }

    public void testHTMLTemplateCaching() throws Exception {
        // An application with isOnePageApp set to true
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application isOnePageApp='true'></aura:application>");

        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));

        // An application with isOnePageApp set to false
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application isOnePageApp='false'></aura:application>");
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));

        // An application with no specification
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application isOnePageApp='false'></aura:application>");
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));

        // A component and AuraBaseServlet.isManifestEnabled() is false because
        // UserAgent is not "AppleWebKit" based
        setHttpUserAgent(UserAgent.EMPTY.getUserAgentString());
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component ></aura:component>");
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName()));
    }

    public void testHTMLTemplateCachingWhenAppCacheIsEnable() throws Exception {
        setHttpUserAgent(UserAgent.GOOGLE_CHROME.getUserAgentString());

        // An application with isOnePageApp set to true and useAppcache set to
        // true
        // isOnePageApp overrides useAppCache specification
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application isOnePageApp='true' useAppcache='true'></aura:application>");
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));

        // An application with useAppcache set to true and no specification for
        // isOnePageApp
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application useAppcache='true'></aura:application>");
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));

        // A component and AuraBaseServlet.isManifestEnabled() is false
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component ></aura:component>");
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName()));
    }

    /**
     * Wiggle factor.
     * 
     * This is intended to allow for variance between the local date and the server date, along with any latency that
     * might occur. Currently it is set to 1 hour, which should be more than enough to account for offsets, but short
     * enough so that we don't really care.
     */
    private final static long WIGGLE_FACTOR = (1000L * 60 * 60 * 1);

    /**
     * Submit a request and check that the 'long cache' is set correctly.
     * 
     * See documentation for {@link #WIGGLE_FACTOR}.
     * 
     * @param url the url
     */
    private void assertResponseSetToLongCache(String url) throws Exception {
        Date expected = new Date(System.currentTimeMillis() + AuraBaseServlet.LONG_EXPIRE - WIGGLE_FACTOR);

        HttpGet get = obtainGetMethod(url);
        HttpResponse response = perform(get);

        assertEquals("Failed to execute request successfully.", HttpStatus.SC_OK, getStatusCode(response));

        assertEquals("Expected response to be marked for long cache",
                String.format("max-age=%s, public", AuraBaseServlet.LONG_EXPIRE / 1000),
                response.getFirstHeader(HttpHeaders.CACHE_CONTROL).getValue());

        String expiresHdr = response.getFirstHeader(HttpHeaders.EXPIRES).getValue();
        Date expires = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH).parse(expiresHdr);
        //
        // We show all of the related dates/strings to help with debugging.
        //
        assertTrue(String.format("Expires header is earlier than expected. Expected !before %s, got %s (%s).",
                expected, expires, expiresHdr), !expires.before(expected));

        get.releaseConnection();
    }

    /**
     * Submit a request and check that the 'no cache' is set correctly.
     * 
     * We are very generous with the expires time here, as we really don't care other than to have it well in the past.
     * 
     * @param url the url path.
     */
    private void assertResponseSetToNoCache(String url) throws Exception {
        Date expected = new Date(System.currentTimeMillis());
        HttpGet get = obtainGetMethod(url);
        HttpResponse response = perform(get);
        assertEquals("Failed to execute request successfully.", HttpStatus.SC_OK, getStatusCode(response));

        assertEquals("Expected response to be marked for no-cache", "no-cache, no-store",
                response.getFirstHeader(HttpHeaders.CACHE_CONTROL).getValue());
        assertEquals("no-cache", response.getFirstHeader(HttpHeaders.PRAGMA).getValue());

        String expiresHdr = response.getFirstHeader(HttpHeaders.EXPIRES).getValue();
        Date expires = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH).parse(expiresHdr);
        //
        // We show all of the related dates/strings to help with debugging.
        //
        assertTrue(String.format("Expires header should be in the past. Expected before %s, got %s (%s).",
                expected, expires, expiresHdr), expires.before(expected));

        EntityUtils.consume(response.getEntity());
        get.releaseConnection();
    }

    /**
     * Verify the Script tag to fetch the Aura Framework JS has nonce. The initial get request for an application gets a
     * template as response. Part of the template response should be a script tag which fetches the Aura FW JS. The URL
     * for the js file should have nonce indicating the last mod of the JS group.
     * 
     * @throws Exception
     */
    public void testJSFrameworkUrlHasNonce() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client'></aura:application>");
        HttpGet get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        HttpResponse response = perform(get);
        assertEquals(HttpStatus.SC_OK, getStatusCode(response));
        // Fetch the latest timestamp of the JS group and construct URL for DEV mode.
        String expectedFWUrl = String.format("/auraFW/javascript/%s/aura_dev.js?aura.fwuid=%s",
                Aura.getConfigAdapter().getAuraFrameworkNonce(),
                Aura.getConfigAdapter().getAuraFrameworkNonce());
        String scriptTag = String.format("<script src=\"%s\" ></script>", expectedFWUrl);
        assertTrue("Expected Aura FW Script tag not found. Expected to see: " + scriptTag,
                getResponseBody(response).contains(scriptTag));

        get.releaseConnection();
    }

    public void testGetUnhandledError() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application><aura:attribute type='bah'/></aura:application>");
        HttpGet get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        HttpResponse httpResponse = perform(get);
        assertEquals(HttpStatus.SC_NOT_FOUND, getStatusCode(httpResponse));
        String response = getResponseBody(httpResponse);
        assertEquals("Expected simple error page but got: " + response, "404 Not Found\ndescriptor is null\n", response);
        get.releaseConnection();
    }
}
