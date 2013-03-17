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
package org.auraframework.impl;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;

import org.auraframework.Aura;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.client.UserAgent;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 * Test class to perform sanity tests on AuraServlet with all possible modes.
 * 
 * @hierarchy Aura.Configuration
 * @priority high
 * @userStory a07B0000000Dtmj
 */
public class AuraFormatsHttpTest extends AuraHttpTestCase {
    private final String componentTag = "&aura.tag=auratest:test_TokenValidation";
    private final String quickFixComponentTag = "&aura.tag=foo:bar";
    private static Map<Format, String> FORMAT_CONTENTTYPE = new HashMap<Format, String>();
    static {
        FORMAT_CONTENTTYPE.put(Format.JSON, Json.MIME_TYPE + ";charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.JS, "text/javascript;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.HTML, "text/html;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.CSS, "text/css;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.MANIFEST, "text/cache-manifest;charset=" + AuraBaseServlet.UTF_ENCODING);
    }

    public AuraFormatsHttpTest(String name) {
        super(name);
    }

    private void requestAndAssertContentType(HttpMethod method, String url, Format format) throws Exception {
        getHttpClient().executeMethod(method);
        Header contentTypeHeader = method.getResponseHeader("Content-Type");
        String contentType = contentTypeHeader != null ? contentTypeHeader.toString()
                .substring("Content-Type: ".length()).trim() : "";
        // Eliminate the spaces separating the content Type specification
        contentType = AuraTextUtil.arrayToString(contentType.split(";\\s+"), ";", -1, false);
        assertEquals(String.format(
                "Received wrong Content-Type header%nURL(or Action): %s%nContent:%s%nRequest type:%s", url,
                method.getResponseBodyAsString(), method.getName()), FORMAT_CONTENTTYPE.get(format), contentType);
    }

    private void getOnAuraServlet(Format f, String tag) throws Exception {
        String url = String.format("/aura?%s&aura.mode=FTEST&aura.format=%s", tag, f.toString());
        GetMethod get = obtainGetMethod(url);
        requestAndAssertContentType(get, url, f);
    }

    private void postOnAuraServlet(Format f, Boolean causeException) throws Exception {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = Json.serialize(message);
        Map<String, String> params = new HashMap<String, String>();
        params.put("message", jsonMessage);
        if (!causeException) {
            params.put("aura.token", getCsrfToken());
        }
        params.put("aura.context", String.format("{\"mode\":\"FTEST\",\"fwuid\":\"%s\"}",
            Aura.getConfigAdapter().getAuraFrameworkNonce()));
        params.put("aura.format", "JSON");
        PostMethod post = obtainPostMethod("/aura", params);
        requestAndAssertContentType(post,
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString", f);
    }

    /**
     * Basic sanity testing for all Valid Formats that can be specified for
     * AuraServlet.
     * 
     * @throws Exception
     */
    public void testResponseHeadersFromAuraServlet() throws Exception {
        for (Format format : Format.values()) {
            switch (format) {
            case JSON:
                // Valid component get request
                getOnAuraServlet(format, this.componentTag);
                // Quick fix exception
                getOnAuraServlet(format, this.quickFixComponentTag);
                // Non Quick fix exception, Not specifying component tag will
                // cause RequestParam.MissingParamException
                getOnAuraServlet(format, "");

                // Valid component post request
                postOnAuraServlet(format, false);
                // Exception
                postOnAuraServlet(format, true);
                break;
            case HTML:
                // Valid component get request
                getOnAuraServlet(format, this.componentTag);
                // Quick fix exception
                getOnAuraServlet(format, this.quickFixComponentTag);
                // Non Quick fix exception
                getOnAuraServlet(format, "");
                break;
            case JS:// No implementation for this format
            case CSS:// No implementation for this format
            case MANIFEST:// No implementation for this format
                break;
            default:
                fail(String.format("A new format value (%s) was added, update this test", format));
                break;
            }
        }
    }

    private void getOnAuraResourceServlet(Format f, String url) throws Exception {
        GetMethod get = obtainGetMethod(url);
        requestAndAssertContentType(get, url, f);
    }

    /**
     * Sanity testing for all valid formats that can be specified for
     * AuraResourceServlet.
     */
    public void testResponseHeadersFromAuraResourceServlet() throws Exception {
        String url;
        String modeAndPreload;
        for (Format format : Format.values()) {
            switch (format) {
            case JSON:
                // Valid preload namespace
                modeAndPreload = "{'mode':'DEV','preloads':['preloadTest']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.json?aura.token=+"
                        + servletConfig.getCsrfToken();
                getOnAuraResourceServlet(format, url);

                // Cause exception by not specifying CSRF token
                // The response looks much like a JSON string as much as it
                // looks like a piece of JS
                modeAndPreload = "{'mode':'DEV','preloads':['preloadTest']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.json";
                getOnAuraResourceServlet(format, url);

                break;
            case HTML:// No implementation for this format
                break;
            case JS:
                // Valid preload namespace
                modeAndPreload = "{'mode':'DEV','preloads':['preloadTest']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.js";
                getOnAuraResourceServlet(format, url);

                // Bad preload namespace, should cause an exception in
                // AuraResourceServlet.
                // But the response should still be in JavaScript mime type
                modeAndPreload = "{'mode':'DEV','preloads':['test']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.js";
                getOnAuraResourceServlet(format, url);
                break;
            case CSS:
                // Valid preload namespace
                modeAndPreload = "{'mode':'DEV','preloads':['preloadTest']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.css";
                getOnAuraResourceServlet(format, url);

                // Bad preload namespace, should cause an exception in
                // AuraResourceServlet.
                // But the response should still be in CSS mime type
                modeAndPreload = "{'mode':'DEV','preloads':['test']}";
                url = "/l/" + AuraTextUtil.urlencode(modeAndPreload) + "/app.css";
                getOnAuraResourceServlet(format, url);
                break;
            case MANIFEST:
                String appManifestUrl = "{'mode':'DEV','app':'appCache:testApp'}";
                url = "/l/" + AuraTextUtil.urlencode(appManifestUrl) + "/app.manifest";
                System.setProperty(HttpMethodParams.USER_AGENT, UserAgent.GOOGLE_CHROME.getUserAgentString());
                getOnAuraResourceServlet(format, url);
                break;
            default:
                fail(String.format("A new format value (%s) was added, update this test", format));
                break;
            }
            url = null;
            modeAndPreload = null;
        }
    }
}
