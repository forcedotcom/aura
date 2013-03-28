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

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.http.HttpHeaders;
import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.client.UserAgent;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Lists;
import com.google.common.io.LineReader;

@ThreadHostileTest
public class AppCacheManifestHttpTest extends AuraHttpTestCase {

    private static final String APPCACHE_SUPPORTED_USERAGENT = UserAgent.GOOGLE_CHROME.getUserAgentString();
    private static final String APPCACHE_UNSUPPORTED_USERAGENT = UserAgent.EMPTY.getUserAgentString();
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<html data-lm=\"(.*?)\" manifest=\"(.*?)\">");

    private class ManifestInfo {
        String url;
        String lastmod;

        ManifestInfo(String url, String lastmod) {
            this.url = url;
            this.lastmod = lastmod;
        }
    }

    public AppCacheManifestHttpTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        ServletConfigController.setAppCacheDisabled(false);
    }

    private ManifestInfo getManifestInfo(String appPath) throws HttpException, IOException, Exception {
        GetMethod get = obtainGetMethod(appPath + "?aura.mode=PROD");
        getHttpClient().executeMethod(get);
        String responseBody = get.getResponseBodyAsString();
        Matcher m = HTML_TAG_PATTERN.matcher(responseBody);
        String url = null;
        String lastmod = null;
        if (m.find()) {
            lastmod = m.group(1);
            url = m.group(2);
        }
        return new ManifestInfo(url, lastmod);
    }

    private String getManifestErrorUrl(String manifestURI) {
        return manifestURI + "?aura.error=true";
    }

    private List<String> getManifestLinks(String manifestContents) throws IOException {
        List<String> links = Lists.newArrayList();

        LineReader reader = new LineReader(new StringReader(manifestContents));
        for (String line = reader.readLine(); line != null; line = reader.readLine()) {
            if (line.startsWith("/")) {
                links.add(line);
            }
        }
        return links;
    }

    private List<String> getRequiredLinks() throws Exception {
        List<String> required = Lists.newArrayList();
        required.add(".*/aura_prod\\.js\\?aura.fwuid=.*");
        return required;
    }

    private void assertManifest(String manifestContent, List<String> requiredLinks, String lastMod) throws Exception {
        assertManifestFormat(manifestContent);
        assertManifestLastMod(manifestContent, lastMod);

        List<String> links = getManifestLinks(manifestContent);
        List<String> required = getRequiredLinks();
        required.addAll(requiredLinks);
        assertRequiredLinks(required, links);
        assertLinksReachable(links);
    }

    private void assertManifestFormat(String manifestContent) {
        if (!manifestContent.startsWith("CACHE MANIFEST\n")) {
            fail("Manifest should starts with: " + "CACHE MANIFEST");
        }
    }

    /**
     * Check for the 'last mod' line.
     * 
     * Note that since the reformat of this line, there is no real
     * last mod date in the manifest.
     */
    private void assertManifestLastMod(String manifestContent, String lastMod) throws Exception {
        String lastModMarker = String.format("\n# LAST MOD: app=");
        if (!manifestContent.contains(lastModMarker)) {
            fail("Line not found: " + lastModMarker);
        }
    }

    private void assertRequiredLinks(List<String> required, List<String> links) throws Exception {
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
    }

    private void assertLinksReachable(List<String> links) throws Exception {
        for (String link : links) {
            GetMethod get = obtainGetMethod(link);
            getHttpClient().executeMethod(get);
            assertEquals(HttpStatus.SC_OK, get.getStatusCode());
        }
    }

    private void assertManifestHeaders(GetMethod get) throws Exception {
        assertEquals(
                String.format("%s;charset=%s", AuraBaseServlet.MANIFEST_CONTENT_TYPE, AuraBaseServlet.UTF_ENCODING),
                get.getResponseHeader(HttpHeaders.CONTENT_TYPE).getValue().replaceAll("\\s", ""));
        assertEquals("no-cache, no-store", get.getResponseHeader(HttpHeaders.CACHE_CONTROL).getValue());
    }

    /**
     * GET app cache manifest without a supported user agent returns 404.
     */
    public void testGetManifestWithUnsupportedUserAgent() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_UNSUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");

        GetMethod get = obtainGetMethod(manifest.url);
        getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();

        if (!response.isEmpty()) {
            fail("manifest should be empty: *" + manifest.url);
        }
    }

    /**
     * No manifest url is given when app cache is disabled via config.
     */
    public void testGetManifestWithAppCacheDisabled() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ServletConfigController.setAppCacheDisabled(true);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");
        if (manifest.url != null) {
            fail("no manifest url should be present, but got: " + manifest.url);
        }
    }

    /**
     * Manifest url is given even when app has no explicit preloads.
     */
    public void testGetManifestForAppWithoutPreloads() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/nopreload.app");
        if (manifest.url == null) {
            fail("manifest url should be present, but got: " + manifest.url);
        }
    }

    /**
     * GET app cache manifest for app with preloads returns a full manifest
     * containing preloading resources. * note that invalid and absolute css
     * urls are not included
     */
    public void testGetManifestForAppWithPreloads() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");
        GetMethod get = obtainGetMethod(manifest.url);
        getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();
        String serializedContextFragment = AuraTextUtil.urlencode(String
                .format("\"lastmod\":\"%s\"", manifest.lastmod));
        assertManifest(response, Lists.newArrayList(
                String.format(".*%s.*/app\\.css", serializedContextFragment),
                String.format(".*%s.*/app\\.js", serializedContextFragment)),
                manifest.lastmod);
    }

    /**
     * GET app cache manifest with aura.error query param returns empty response
     * and error-valued manifest cookie.
     */
    @UnAdaptableTest
    public void testGetManifestWithAuraErrorParam() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");

        GetMethod get = obtainGetMethod(getManifestErrorUrl(manifest.url));
        getHttpClient().executeMethod(get);

        assertEquals(HttpStatus.SC_NO_CONTENT, get.getStatusCode());
        assertManifestHeaders(get);

        String response = get.getResponseBodyAsString();
        if (response != null) {
            fail("Expected empty response, but got:\n" + response);
        }
    }

    /**
     * GET app cache manifest with manifest cookie with error value, returns 404
     * and deletes the manifest cookie.
     */
    public void testGetManifestWithErrorManifestCookie() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");

        GetMethod errorGet = obtainGetMethod(getManifestErrorUrl(manifest.url));
        getHttpClient().executeMethod(errorGet);

        GetMethod get = obtainGetMethod(manifest.url);
        getHttpClient().executeMethod(get);

        assertEquals(HttpStatus.SC_NOT_FOUND, get.getStatusCode());
        assertManifestHeaders(get);

        String response = get.getResponseBodyAsString();
        assertEquals("", response);

        GetMethod getClean = obtainGetMethod(manifest.url);
        getHttpClient().executeMethod(getClean);

        // Now, after one failed call a new manifest call should go thru.(Error
        // cookie cleared);
        String serializedContextFragment = AuraTextUtil.urlencode(String
                .format("\"lastmod\":\"%s\"", manifest.lastmod));
        assertManifest(getClean.getResponseBodyAsString(), Lists.newArrayList(
                String.format(".*%s.*/app\\.css", serializedContextFragment),
                String.format(".*%s.*/app\\.js", serializedContextFragment)),
                manifest.lastmod);
    }

    /**
     * GET app cache manifest with unknown format URL.
     */
    public void testGetManifestWithUnknownFormat() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/withpreload.app");

        GetMethod get = obtainGetMethod(manifest.url + "?param=unknown");
        getHttpClient().executeMethod(get);

        assertEquals(HttpStatus.SC_NOT_FOUND, get.getStatusCode());
        assertManifestHeaders(get);
        String response = get.getResponseBodyAsString();
        assertEquals("", response);
    }
    
    /**
     * GET app cache manifest for app with additional URLs specified using a controller action
     * returns a full manifest containing the additional URLs returned by controller. 
     */
    public void testGetManifestForAppWithAdditionalAppCacheURLs() throws Exception {
        System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
        ManifestInfo manifest = getManifestInfo("/appCache/additionalUrls.app");
        GetMethod get = obtainGetMethod(manifest.url);
        getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();
        String serializedContextFragment = AuraTextUtil.urlencode(String
                .format("\"lastmod\":\"%s\"", manifest.lastmod));
        assertManifest(response, Lists.newArrayList(
                String.format(".*%s.*/app\\.css", serializedContextFragment),
                String.format(".*%s.*/app\\.js", serializedContextFragment),
                "/auraFW/resources/aura/auraIdeLogo.png",
                "/auraFW/resources/aura/resetCSS.css"),
                manifest.lastmod);
    }
    /**
     * Verify behavior when action which provides additional app cache urls returns bad results or throws exception.
     * TODO: W-1590903 - What should the expected behavior be?
     *  Currently, the behavior is not consistent across these scenarios,
     *   it just continues and ignores the exception thrown by the action, in other cases it returns 404.
     *  Should we do something to signal that something went wrong, you might not have resources that you asked for?
     */
    public void _testGetManifestWhenAdditionalAppCacheUrlsActionBarfs() throws Exception{
        String values[] = {"{!c.throwException}", //Action throws exception 
                            "{!c.getString}", //Action returns literal instead of List<String>
                            "{!v.attr}", //A expression that refers to attribute instead of action
                            "/auraFW/resources/aura/resetCSS.css"};
        
        String appMarkup = String.format(baseApplicationTag,"useAppcache=\"true\" render=\"client\"  preload=\"appCache\" "+ 
                            "securityProvider=\"java://org.auraframework.java.securityProvider.LaxSecurityProvider\" "+ 
                            " controller=\"java://org.auraframework.impl.java.controller.TestController\" "+
                            "additionalAppCacheURLs=\"%s\"", "");
        
        for(String value: values){
            DefDescriptor<ApplicationDef> desc= addSourceAutoCleanup(ApplicationDef.class, String.format(appMarkup,value));
            System.setProperty(HttpMethodParams.USER_AGENT, APPCACHE_SUPPORTED_USERAGENT);
            ManifestInfo manifest = getManifestInfo(getUrl(desc));
            GetMethod get = obtainGetMethod(manifest.url);
            getHttpClient().executeMethod(get);
            assertEquals("Expected to fail manifest fetching. additionalAppCacheUrls:"+value, 
                    HttpStatus.SC_NOT_FOUND,get.getStatusCode());
            String response = get.getResponseBodyAsString();
            String serializedContextFragment = AuraTextUtil.urlencode(String
                    .format("\"lastmod\":\"%s\"", manifest.lastmod));
            assertManifest(response, Lists.newArrayList(
                    String.format(".*%s.*/app\\.css", serializedContextFragment),
                    String.format(".*%s.*/app\\.js", serializedContextFragment)),
                    manifest.lastmod);
        }
    }
}
