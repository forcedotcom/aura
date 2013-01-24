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

import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
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
        String modeAndContext = "{'mode':'DEV','preloads':['preloadTest']}";
        String url = "/aura?aura.tag=test%3Atext&aura.context=" + AuraTextUtil.urlencode(modeAndContext)
                + "&aura.lastmod=" + getLastMod(Mode.DEV, "preloadTest");
        GetMethod get = obtainGetMethod(url);
        int statusCode = getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();
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
    @SuppressWarnings("unchecked")
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
        params.put("aura.context", "{'mode':'DEV','preloads':['preloadTest']}");
        PostMethod post = obtainPostMethod("/aura", params);

        int statusCode = getHttpClient().executeMethod(post);
        String response = post.getResponseBodyAsString();
        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> context = (Map<String, Object>) json.get("context");
        assertFalse("preloads shouldn't get serialized on posts", context.containsKey("preloads"));
    }

    @SuppressWarnings("unchecked")
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
        params.put("aura.context", String.format("{'mode':'DEV','lastmod':'%s'}", getLastMod(Mode.DEV) - 1));
        PostMethod post = obtainPostMethod("/aura", params);

        int statusCode = getHttpClient().executeMethod(post);
        String response = post.getResponseBodyAsString();
        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }

        assertTrue("response not wrapped with ERROR marker", response.startsWith(AuraBaseServlet.CSRF_PROTECT + "*/")
                && response.endsWith("/*ERROR*/"));
        response = response.substring(AuraBaseServlet.CSRF_PROTECT.length() + 2,
                response.length() - "/*ERROR*/".length());
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response);
        assertEquals(true, json.get("exceptionEvent"));
        assertEquals("markup://aura:clientOutOfSync", ((Map<String, Object>) json.get("event")).get("descriptor"));
        Object f = json.get("defaultHandler");
        assertEquals(JsFunction.class, f.getClass());
        assertEquals("try{$A.clientService.setOutdated()}catch(e){$L.clientService.setOutdated()}",
                ((JsFunction) f).getBody());
    }

    private void assertNoCacheRequest(String inputUrl, String expectedRedirect) throws Exception {
        GetMethod get = obtainGetMethod(inputUrl);
        get.setFollowRedirects(false);
        getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, get.getStatusCode());
        assertEquals(expectedRedirect, get.getResponseHeader("Location").getValue());
        assertEquals("no-cache, no-store", get.getResponseHeader("Cache-Control").getValue());
        assertEquals("no-cache", get.getResponseHeader("Pragma").getValue());
    }

    /**
     * nocache in the request will redirect to the input url (minus the protocol
     * and host)
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
        GetMethod get = obtainGetMethod("/aura?aura.tag&nocache");
        get.setFollowRedirects(false);
        getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, get.getStatusCode());
        assertTrue(get.getResponseBodyAsString().startsWith(
                String.format("%s*/{\n  \"message\":\"QualifiedName is required for descriptors\"",
                        AuraBaseServlet.CSRF_PROTECT)));
    }

    public void testHTMLTemplateCaching() throws Exception {
        // An application with isOnePageApp set to true
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application isOnePageApp='true'></aura:application>");
        GetMethod get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(get);

        // An application with isOnePageApp set to false
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application isOnePageApp='false'></aura:application>");
        get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(get);

        // An application with no specification
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application isOnePageApp='false'></aura:application>");
        get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(get);

        // A component and AuraBaseServlet.isManifestEnabled() is false because
        // UserAgent is not "AppleWebKit" based
        System.setProperty(HttpMethodParams.USER_AGENT, UserAgent.EMPTY.getUserAgentString());
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component ></aura:component>");
        get = obtainGetMethod(String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName()));
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(get);
    }

    public void testHTMLTemplateCachingWhenAppCacheIsEnable() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, UserAgent.GOOGLE_CHROME.getUserAgentString());

        // An application with isOnePageApp set to true and useAppcache set to
        // true
        // isOnePageApp overrides useAppCache specification
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application isOnePageApp='true' useAppcache='true'></aura:application>");
        GetMethod get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(get);

        // An application with useAppcache set to true and no specification for
        // isOnePageApp
        desc = addSourceAutoCleanup(ApplicationDef.class, "<aura:application useAppcache='true'></aura:application>");
        get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        // Expect the get request to be set for no caching
        assertResponseSetToNoCache(get);

        // A component and AuraBaseServlet.isManifestEnabled() is false
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component ></aura:component>");
        get = obtainGetMethod(String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName()));
        // Expect the get request to be set for long cache
        assertResponseSetToLongCache(get);
    }

    private void assertResponseSetToLongCache(HttpMethod request) throws Exception {
        final long WIGGLE_FACTOR = 60000; // it's going to expire far off, so
                                          // factor in some wiggle due to client
                                          // latency timing
        Date expected = new Date(System.currentTimeMillis() + AuraBaseServlet.LONG_EXPIRE - WIGGLE_FACTOR);
        getHttpClient().executeMethod(request);
        assertEquals("Failed to execute request successfully.", HttpStatus.SC_OK, request.getStatusCode());

        assertEquals("Expected response to be marked for long cache",
                String.format("max-age=%s, public", AuraBaseServlet.LONG_EXPIRE / 1000),
                request.getResponseHeader("Cache-Control").getValue());
        Date expires = new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss z", Locale.ENGLISH).parse(request
                .getResponseHeader("Expires").getValue());
		assertTrue(
				String.format(
						"Expires header in response is set to an earlier date than expected. Expected !before %s, got %s.",
						expected, expires), !expires.before(expected));
    }

    private void assertResponseSetToNoCache(HttpMethod request) throws Exception {
        Date expected = new Date(System.currentTimeMillis());
        getHttpClient().executeMethod(request);
        assertEquals("Failed to execute request successfully.", HttpStatus.SC_OK, request.getStatusCode());

        assertEquals("Expected response to be marked for no-cache", "no-cache, no-store",
                request.getResponseHeader("Cache-Control").getValue());
        assertEquals("no-cache", request.getResponseHeader("Pragma").getValue());
        Date expires = new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss z", Locale.ENGLISH).parse(request
                .getResponseHeader("Expires").getValue());
		assertTrue(
				String.format(
						"Expires header in response should be set to a date in the past. Expected before %s, got %s.",
						expected, expires), expires.before(expected));
    }

    /**
     * Verify the Script tag to fetch the Aura Framework JS has nonce. The
     * initial get request for an application gets a template as response. Part
     * of the template response should be a script tag which fetches the Aura FW
     * JS. The URL for the js file should have nonce indicating the last mod of
     * the JS group.
     * 
     * @throws Exception
     */
    public void testJSFrameworkUrlHasNonce() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application render='client'></aura:application>");
        GetMethod get = obtainGetMethod(String.format("/%s/%s.app", desc.getNamespace(), desc.getName()));
        getHttpClient().executeMethod(get);
        assertEquals(HttpStatus.SC_OK, get.getStatusCode());
        // Fetch the latest timestamp of the JS group and construct URL for DEV
        // mode.
        String expectedFWUrl = String.format("/auraFW/javascript/%d/aura_dev.js", Aura.getConfigAdapter()
                .getAuraFrameworkNonce());
        String scriptTag = "<script src=\"%s\" ></script>";
        assertTrue(
                "Expected Aura FW Script tag not found. Expected to see: " + String.format(scriptTag, expectedFWUrl),
                get.getResponseBodyAsString().contains(String.format(scriptTag, expectedFWUrl)));
    }
}
