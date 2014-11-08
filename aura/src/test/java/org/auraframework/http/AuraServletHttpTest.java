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

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.adapter.ContentSecurityPolicy;
import org.auraframework.adapter.DefaultContentSecurityPolicy;
import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.client.UserAgent;
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
     * Test for W-2063110 this test is to verify the order of actions and context in the response we used to have
     * context before actions, now it's the opposite
     */
    public void testPostRawResponseSimpleAction() throws Exception {
        Map<String, Object> actionParams = new HashMap<>();
        actionParams.put("param", "some string");
        ServerAction a = new ServerAction(
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString",
                actionParams);
        a.run();
        String rawRes = a.getrawResponse();
        Integer posActions = rawRes.indexOf("actions");
        Integer posContex = rawRes.indexOf("context");
        assertTrue(posActions < posContex);
    }
    
    public void testMulitpleActionsInOnePost() {
    	ArrayList<String> qNameList = new ArrayList<>();
    	ArrayList<Map<String,Object>> actionParamsArrayList = new ArrayList<>();

		Map<String, Object> actionParams = new HashMap<>();
        actionParams.put("param", "some string");
        qNameList.add("java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        actionParamsArrayList.add(actionParams);
        
        Map<String, Object> actionParams1 = new HashMap<>();
        actionParams1.put("param", 6);
        qNameList.add("java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getInt");
        actionParamsArrayList.add(actionParams1);

    	ServerAction a = new ServerAction(qNameList,actionParamsArrayList);
    	a.run();
    	assertTrue("The response does not have the expected number of actions", a.getReturnValueList().size() == 2);
    	assertTrue(a.getReturnValueList().get(0).equals("some string") && a.getReturnValueList().get(1).equals(new BigDecimal(6)));
    	
    }

    /**
     * Check a post context.
     */
    public void testPostContext() throws Exception {
        Map<String, Object> message = new HashMap<>();
        Map<String, Object> actionInstance = new HashMap<>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        @SuppressWarnings("rawtypes")
        Map[] actions = { actionInstance };
        message.put("actions", actions);

        String jsonMessage = Json.serialize(message);

        Map<String, String> params = new HashMap<>();
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
        new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
    }

    /**
     * This is actually an invalid test.
     * 
     */
    public void testPostWithOldLastMod() throws Exception {
        Map<String, Object> message = new HashMap<>();
        Map<String, Object> actionInstance = new HashMap<>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        @SuppressWarnings("rawtypes")
        Map[] actions = { actionInstance };
        message.put("actions", actions);

        String jsonMessage = Json.serialize(message);

        Map<String, String> params = new HashMap<>();
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
        assertDefaultAntiClickjacking(response, false, false);  // Redirects don't have XFO/CSP guarding
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

    public void testNoCacheNoTag() throws Exception {
        HttpGet get = obtainGetMethod("/aura?aura.tag&nocache");
        HttpResponse response = perform(get);

        assertEquals(HttpStatus.SC_OK, getStatusCode(response));
        String responseText = getResponseBody(response);
        assertTrue("Expected tag error in: " + responseText,
                responseText.contains("Invalid request, tag must not be empty"));
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
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application></aura:application>");
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

    @ThreadHostileTest("swaps config adapter")
    public void testSpecialCsp() throws Exception {
        ContentSecurityPolicy mockCsp = new ContentSecurityPolicy() {

            @Override
            public String getCspHeaderValue() {
                return DefaultContentSecurityPolicy.buildHeaderNormally(this);
            }

            @Override
            public Collection<String> getFrameAncestors() {
                List<String> list = new ArrayList<String>(3);
                list.add(null);
                list.add("www.itrustu.com/frame");
                list.add("www.also.com/other");
                return list;
            }

            @Override
            public Collection<String> getFrameSources() {
                return new ArrayList<String>(0);
            }

            @Override
            public Collection<String> getScriptSources() {
                List<String> list = new ArrayList<String>(1);
                list.add(null);
                return list;
            }

            @Override
            public Collection<String> getStyleSources() {
                List<String> list = new ArrayList<String>(1);
                list.add(null);
                return list;
            }

            @Override
            public Collection<String> getConnectSources() {
                List<String> list = new ArrayList<String>(2);
                list.add("www.itrustu.com/");
                list.add("www.also.com/other");
                return list;
            }

            @Override
            public Collection<String> getFontSources() {
                return null;
            }

            @Override
            public Collection<String> getDefaultSources() {
                List<String> list = new ArrayList<String>(1);
                list.add(null);
                return list;
            }

            @Override
            public Collection<String> getImageSources() {
                return null;
            }

            @Override
            public Collection<String> getObjectSources() {
                return new ArrayList<String>(0);
            }

            @Override
            public Collection<String> getMediaSources() {
                return null;
            }

            @Override
            public String getReportUrl() {
                return "http://doesnt.matter.com/";
            }
        };

        MockConfigAdapter mci = getMockConfigAdapter();

        try {
            mci.setContentSecurityPolicy(mockCsp);

            // An application with isOnePageApp set to true
            DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                    "<aura:application isOnePageApp='true'></aura:application>");

            HttpGet get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
            HttpResponse response = perform(get);

            // Check X-FRAME-OPTIONS
            Header[] headers = response.getHeaders("X-FRAME-OPTIONS");
            assertEquals("wrong number of X-FRAME-OPTIONS header lines", 3, headers.length);
            assertEquals("SAMEORIGIN", headers[0].getValue());
            assertEquals("www.itrustu.com/frame", headers[1].getValue());
            assertEquals("www.also.com/other", headers[2].getValue());
            // And CSP
            Map<String, String> csp = getCSP(response);
            assertEquals("frame-ancestors is wrong", "'self' www.itrustu.com/frame www.also.com/other", csp.get("frame-ancestors"));
            assertEquals("script-src is wrong", "'self'", csp.get("script-src"));
            assertEquals("style-src is wrong", "'self'", csp.get("style-src"));
            assertEquals("connect-src is wrong", "www.itrustu.com/ www.also.com/other", csp.get("connect-src"));
            assertEquals("font-src is wrong", "*", csp.get("font-src"));
            assertEquals("img-src is wrong", "*", csp.get("img-src"));
            assertEquals("object-src is wrong", "'none'", csp.get("object-src"));
            assertEquals("media-src is wrong", "*", csp.get("media-src"));
            assertEquals("default-src is wrong", "'self'", csp.get("default-src"));

        } finally {
            mci.setContentSecurityPolicy(null);
            ServiceLocatorMocker.unmockServiceLocator();
        }
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
        assertDefaultAntiClickjacking(response, true, true);
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
        assertDefaultAntiClickjacking(response, true, true);

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
        String expectedFWUrl = String.format("/auraFW/javascript/%s/aura_dev.js",
                Aura.getConfigAdapter().getAuraFrameworkNonce());
        String scriptTag = String.format("<script src=\"%s\" ></script>", expectedFWUrl);
        assertTrue("Expected Aura FW Script tag not found. Expected to see: " + scriptTag,
                getResponseBody(response).contains(scriptTag));

        assertDefaultAntiClickjacking(response, true, true);
        get.releaseConnection();
    }

    public void testGetUnhandledError() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application><aura:attribute name='bah'/></aura:application>");
        HttpGet get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        HttpResponse httpResponse = perform(get);
        assertEquals(HttpStatus.SC_OK, getStatusCode(httpResponse));
        String response = getResponseBody(httpResponse);
        assertTrue("Expected null descriptor error message but got: " + response,
                response.contains("descriptor is null"));
        get.releaseConnection();
    }

    /**
     * Verify providing invalid DefDescriptor format to the aura.tag param results in the proper handled Exception and
     * not an AuraUnhandledException, which results in a Gack on SFDC.
     */
    public void testInvalidDefDescriptorFormat() throws Exception {
        String url = String.format("/aura?aura.tag=foo:bar:baz");
        HttpGet get = obtainGetMethod(url);
        HttpResponse httpResponse = perform(get);
        assertEquals(HttpStatus.SC_OK, getStatusCode(httpResponse));
        String response = getResponseBody(httpResponse);
        assertTrue("Expected 'SystemErrorException: Invalid Descriptor Format' but got: " + response,
                response.contains("SystemErrorException: Invalid Descriptor Format: foo:bar:baz"));
        assertFalse("Invalid aura.tag input should not result in an AuraUnhandledException. " + response,
                response.contains("AuraUnhandledException: Unable to process your request"));
        get.releaseConnection();
    }
}
