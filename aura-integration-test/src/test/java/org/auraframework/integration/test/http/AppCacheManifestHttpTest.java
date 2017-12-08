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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.LineReader;
import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.protocol.HttpContext;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.integration.test.util.AuraHttpTestCase;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.client.UserAgent;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;

import java.io.StringReader;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AppCacheManifestHttpTest extends AuraHttpTestCase {

    private static final String APPCACHE_SUPPORTED_USERAGENT = UserAgent.GOOGLE_CHROME.getUserAgentString();
    private static final Pattern HTML_MANIFEST_PATTERN = Pattern.compile("<html[^>]* manifest=\"(.*?)\"[^>]*>");

    private String getManifestURL(String appPath, Mode mode, boolean expectNull) throws Exception {
        HttpGet get = obtainGetMethod(appPath + String.format("?aura.mode=%s",mode.toString()));
        HttpResponse response = perform(get);
        String responseBody = getResponseBody(response);
        get.releaseConnection();
        Matcher m = HTML_MANIFEST_PATTERN.matcher(responseBody);
        String url = null;
        if (m.find()) {
            url = m.group(1);
        }
        if ((expectNull == false) && (url == null)) {
            fail("getManifestURL fail to get valid url, appPath:"+appPath+"\n responseBody:"+responseBody+"\n");
        }
        return url;
    }

    private String getManifestURL(String appPath, boolean expectNull) throws Exception {
        return getManifestURL(appPath, Mode.PROD, expectNull);
    }

    private String getManifestErrorUrl(String manifestURI) {
        if (manifestURI.indexOf("?") != -1) {
            return manifestURI + "&aura.error=true";
        } else {
            return manifestURI + "?aura.error=true";
        }
    }

    private List<String> getManifestCacheLinks(String manifestContents) throws Exception {
        Manifest m = new Manifest(manifestContents);
        return m.getCacheUrls();
    }

    private List<String> getRequiredLinks() throws Exception {
        List<String> required = Lists.newArrayList();
        required.add(".*/aura_.*\\.js");
        return required;
    }

    private void assertManifest(String manifestContent, List<String> requiredLinks) throws Exception {
    	assertManifest(manifestContent, requiredLinks, null);
    }

    /**
     * check if requried links are in manifest content, also make sure excludeLinks are NOT in manifest content.
     * @param manifestContent
     * @param requiredLinks
     * @param excludedLinks could be null
     * @throws Exception
     */
    private void assertManifest(String manifestContent, List<String> requiredLinks, List<String> excludedLinks) throws Exception {
    	assertManifestFormat(manifestContent);
        assertTrue("Could not find the LAST MOD: line in manifest", manifestContent.contains("\n# LAST MOD: app="));

        List<String> links = getManifestCacheLinks(manifestContent);
        List<String> required = getRequiredLinks();
        required.addAll(requiredLinks);
        assertRequiredLinks(required, excludedLinks, links);
        assertLinksReachable(links);
    }

    private void assertManifestFormat(String manifestContent) {
        if (!manifestContent.startsWith("CACHE MANIFEST\n")) {
            fail("Manifest should starts with: " + "CACHE MANIFEST");
        }
    }

    private void assertRequiredLinks(List<String> required, List<String> excluded, List<String> links) throws Exception {
        for (String requiredLink : required) {
            boolean foundFlag = false;
            for (String link : links) {
                if (link.matches(requiredLink)) {
                    foundFlag = true;
                }
            }
            if (!foundFlag) {
                fail("Missing required link: " + requiredLink + " but got instead: " + links);
            }
        }
        if(excluded != null) {
	        	for (String excludedLink : excluded) {
	            boolean failFlag = false;
	            for (String link : links) {
	                if (link.matches(excludedLink)) {
	                	failFlag = true;
	                }
	            }
	            if (failFlag) {
	                fail("Hit link that not suppose to exist: " + excludedLink);
	            }
        	}
        }
    }

    private void assertLinksReachable(List<String> links) throws Exception {
        for (String link : links) {
            HttpGet get = obtainGetMethod(link);
            HttpResponse response = perform(get);
            int statusCode = getStatusCode(response);
            get.releaseConnection();
            assertEquals("Unexpected response code for link [" + link + "]", HttpStatus.SC_OK, statusCode);
        }
    }

    private void assertManifestHeaders(HttpResponse response) throws Exception {
    	assertDefaultAntiClickjacking(response, true, false);
        String cacheControlHeader = String.format(",%s,", response.getFirstHeader(HttpHeaders.CACHE_CONTROL).getValue()
                .replaceAll("\\s", ""));
        if (!cacheControlHeader.contains(",no-cache,") || !cacheControlHeader.contains(",no-store,")) {
            fail("Missing cache control header values in: " + cacheControlHeader);
        }

        String expectedContentType = String.format("%s;charset=%s", "text/cache-manifest",
                AuraBaseServlet.UTF_ENCODING);
        Header[] contentTypeHeaders = response.getHeaders(HttpHeaders.CONTENT_TYPE);
        System.out.println("expectedContentType:"+expectedContentType+", contentTypeHeaders:");
        for (Header header : contentTypeHeaders) {
        	System.out.println("header:"+header.getValue());
            if (expectedContentType.equalsIgnoreCase(header.getValue().replaceAll("\\s", ""))) {
                return;
            }
        }
        fail("Did not find expected content type header: " + Arrays.asList(contentTypeHeaders));
    }

    /**
     * No manifest url is given when app cache is disabled via config.
     */
    @ThreadHostileTest("disables AppCache")
    @Test
    public void testGetManifestWithAppCacheDisabled() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        getMockConfigAdapter().setIsClientAppcacheEnabled(false);
        String manifest = getManifestURL("/appCache/withpreload.app", true);
        if (manifest != null) {
            fail("no manifest url should be present, but got: " + manifest);
        }
    }

    /**
     * Manifest url is given even when app has no explicit preloads.
     */
    @Test
    public void testGetManifestForAppWithoutPreloads() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        String manifest = getManifestURL("/appCache/nopreload.app", false);
        if (manifest == null) {
            fail("manifest url should be present, but got: " + manifest);
        }
    }

    /**
     * GET app cache manifest for app with preloads returns a full manifest containing preloading resources.
     *
     * note that invalid and absolute css urls are not included
     */
    @Test
    public void testGetManifestForAppWithPreloads() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        String manifest = getManifestURL("/appCache/withpreload.app", false);

        HttpGet get = obtainGetMethod(manifest);
        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertManifest(response, Lists.newArrayList(".*/app.*\\.css", ".*/app.*\\.js"));
    }

    /**
     * GET app cache manifest with aura.error query param returns empty response and error-valued manifest cookie.
     */
    @UnAdaptableTest
    @Test
    public void testGetManifestWithAuraErrorParam() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        String manifest = getManifestURL("/appCache/withpreload.app", false);

        HttpGet get = obtainGetMethod(getManifestErrorUrl(manifest));

        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);

        assertManifestHeaders(httpResponse);

        get.releaseConnection();

        if (response != null) {
            fail("Expected empty response, but got:\n" + response);
        }
        assertEquals(HttpStatus.SC_NO_CONTENT, getStatusCode(httpResponse));
    }

    /**
     * GET app cache manifest with manifest cookie with error value, returns 404 and deletes the manifest cookie.
     */
    @Test
    public void testGetManifestWithErrorManifestCookie() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        String manifest = getManifestURL("/appCache/withpreload.app", false);

        //
        // HttpClient Cookie Example
        // 1. Add cookie
        // 2. Create HttpContext which has default CookieStore
        // 3. Perform request method with context
        //
        addCookie(getHost(), "appCache_withpreload_lm", "error", "/");
        HttpContext httpContext = getHttpCookieContext();
        HttpGet get = obtainGetMethod(manifest);
        HttpResponse httpResponse = perform(get, httpContext);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertEquals(HttpStatus.SC_NOT_FOUND, statusCode);
        assertManifestHeaders(httpResponse);
        assertEquals("", response);
        assertNoCookie(getHost(), "appCache_withpreload_lm", "/");

        get = obtainGetMethod(manifest);
        HttpResponse clean = perform(get);
        String cleanResponse = getResponseBody(clean);
        get.releaseConnection();

        // Now, after one failed call a new manifest call should go thru.(Error
        // cookie cleared);
        assertManifest(cleanResponse, Lists.newArrayList(".*/app\\.css", ".*/app\\.js"));
    }

    /**
     * GET app cache manifest for app with additional URLs specified using a controller action returns a full manifest
     * containing the additional URLs returned by controller.
     */
    @Test
    public void testGetManifestForAppWithAdditionalAppCacheURLs() throws Exception {
        setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
        String manifest = getManifestURL("/appCache/additionalUrls.app", false);

        HttpGet get = obtainGetMethod(manifest);
        HttpResponse httpResponse = perform(get);
        String response = getResponseBody(httpResponse);
        get.releaseConnection();

        assertManifest(response, Lists.newArrayList(".*/app\\.css", ".*/app\\.js",
                "/auraFW/resources/aura/auraIdeLogo.png", "/auraFW/resources/aura/resetCSS.css"),
                Lists.newArrayList("/auraFW/resources/aura/normalize.css"));
    }

    /**
     * Verify behavior when action which provides additional app cache urls returns bad results or throws exception.
     * TODO: W-1590903 - What should the expected behavior be? Currently, the behavior is not consistent across these
     * scenarios, it just continues and ignores the exception thrown by the action, in other cases it returns 404.
     * Should we do something to signal that something went wrong, you might not have resources that you asked for?
     */
    @Ignore
    @Test
    public void testGetManifestWhenAdditionalAppCacheUrlsActionBarfs() throws Exception {
        String values[] = { "{!c.throwException}", // Action throws exception
                "{!c.getString}", // Action returns literal instead of List<String>
                "{!v.attr}", // A expression that refers to attribute instead of action
                "/auraFW/resources/aura/resetCSS.css" };

        String appMarkup = String.format(baseApplicationTag,
                "useAppcache=\"true\" render=\"client\" " +
                        " controller=\"java://org.auraframework.components.test.java.controller.TestController\" " +
                        "additionalAppCacheURLs=\"%s\"", "");

        for (String value : values) {
            DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                    String.format(appMarkup, value));
            setHttpUserAgent(APPCACHE_SUPPORTED_USERAGENT);
            String manifest = getManifestURL(getUrl(desc), false);
            HttpGet get = obtainGetMethod(manifest);
            HttpResponse httpResponse = perform(get);
            String response = getResponseBody(httpResponse);
            int statusCode = getStatusCode(httpResponse);
            get.releaseConnection();

            assertEquals("Expected to fail manifest fetching. additionalAppCacheUrls:" + value,
                    HttpStatus.SC_NOT_FOUND, statusCode);

            assertManifest(response, Lists.newArrayList(".*/app\\.css", ".*/app\\.js"));
        }
    }

    /**
     * A basic appcache manifest parser and representation.
     */
    class Manifest {
        /** URLs in the CACHE directive section */
        List<String> cache;
        /** Map of source to target URL in the FALLBACK directive section */
        Map<String,String> fallback;

        Manifest(String manifestContents) throws Exception {
            cache = Lists.newArrayList();
            fallback = Maps.newHashMap();
            parse(manifestContents);
        }

        List<String> getCacheUrls() {
            return cache;
        }

        Map<String,String> getFallbackUrls() {
            return fallback;
        }

        void parse(String manifestContents) throws Exception {
            List<String> fallbackUnprocessed = Lists.newArrayList();
            List<String> target = null;

            LineReader reader = new LineReader(new StringReader(manifestContents));
            for (String line = reader.readLine(); line != null; line = reader.readLine()) {
                if ("CACHE:".equals(line)) {
                    target = cache;
                } else if ("FALLBACK:".equals(line)) {
                    target = fallbackUnprocessed;
                } else if (target != null && line.startsWith("/")) {
                    target.add(line);
                }
            }

            for (String line : fallbackUnprocessed) {
                String[] split = line.split(" ");
                if (split.length != 2) {
                    throw new Exception("Unrecognized FALLBACK directive: " + line);
                }
                fallback.put(split[0], split[1]);
            }
        }
    }
}
