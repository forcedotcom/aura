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

import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.integration.test.util.AuraHttpTestCase;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;
import org.junit.Test;

import javax.inject.Inject;

import java.util.HashMap;
import java.util.Map;

/**
 * Test class to perform sanity tests on AuraServlet with all possible modes.
 *
 * This should be killed.
 */
public class AuraFormatsHttpTest extends AuraHttpTestCase {
    @Inject
    private ConfigAdapter configAdapter;

    private final String componentTag = "&aura.tag=auratest:test_TokenValidation";
    private final String quickFixComponentTag = "&aura.tag=foo:bar";
    private static Map<Format, String> FORMAT_CONTENTTYPE = new HashMap<>();

    static {
        FORMAT_CONTENTTYPE.put(Format.JSON, JsonEncoder.MIME_TYPE + ";charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.JS, "text/javascript;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.HTML, "text/html;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.CSS, "text/css;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.MANIFEST, "text/cache-manifest;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.SVG, "image/svg+xml;charset=" + AuraBaseServlet.UTF_ENCODING);
        FORMAT_CONTENTTYPE.put(Format.ENCRYPTIONKEY, "text/plain;charset=" + AuraBaseServlet.UTF_ENCODING);
    }

    private void requestAndAssertContentType(HttpRequestBase method, String url, Format format, boolean expectHeaders)
            throws Exception {

        HttpResponse response = perform(method);
        String contentType = response.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue();
        // Eliminate the spaces separating the content Type specification
        contentType = AuraTextUtil.arrayToString(contentType.split(";\\s+"), ";", -1, false);
        assertEquals(String.format(
                "Received wrong Content-Type header%nURL(or Action): %s%nContent:%s%nRequest type:%s", url,
                getResponseBody(response), method.getMethod()), FORMAT_CONTENTTYPE.get(format), contentType);
        assertDefaultAntiClickjacking(response, expectHeaders, true);
    }

    private void getOnAuraServlet(Format f, String tag, boolean expectHeaders) throws Exception {
        String url = String.format("/aura?%s&aura.mode=FTEST&aura.format=%s", tag, f.toString());
        HttpGet get = obtainGetMethod(url);
        requestAndAssertContentType(get, url, f, expectHeaders);
    }

    private void postOnAuraServlet(Format f, Boolean causeException) throws Exception {
        Map<String, Object> message = new HashMap<>();
        Map<String, Object> actionInstance = new HashMap<>();
        actionInstance.put("descriptor",
                "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getString");
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = JsonEncoder.serialize(message);
        Map<String, String> params = new HashMap<>();
        params.put("message", jsonMessage);
        if (!causeException) {
            params.put("aura.token", configAdapter.getCSRFToken());
        }
        params.put("aura.context", String.format("{\"mode\":\"FTEST\",\"fwuid\":\"%s\"}",
                configAdapter.getAuraFrameworkNonce()));
        params.put("aura.format", "JSON");
        HttpPost post = obtainPostMethod("/aura", params);
        requestAndAssertContentType(post,
                "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getString", f,
                !causeException);
    }

    /**
     * Basic sanity testing for all Valid Formats that can be specified for AuraServlet.
     *
     * @throws Exception
     */
    @Test
    public void testResponseHeadersFromAuraServlet() throws Exception {
        for (Format format : Format.values()) {
            switch (format) {
            case JSON:
                // Valid component post request
                postOnAuraServlet(format, false);
                // Exception
                postOnAuraServlet(format, true);
                break;
            case HTML:
                // Valid component get request
                getOnAuraServlet(format, this.componentTag, true);
                // Quick fix exception
                getOnAuraServlet(format, this.quickFixComponentTag, false);
                // Non Quick fix exception
                getOnAuraServlet(format, "", false);
                break;
            case JS:// No implementation for this format
            case CSS:// No implementation for this format
            case SVG:// No implementation for this format
            case MANIFEST:// No implementation for this format
            case ENCRYPTIONKEY:// No implementation for this format
                break;
            default:
                fail(String.format("A new format value (%s) was added, update this test", format));
                break;
            }
        }
    }
}
