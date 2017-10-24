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
package org.auraframework.integration.test.security;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.integration.test.util.AuraHttpTestCase;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.junit.Ignore;
import org.junit.Test;

/**
 * This test verifies that the aura servlet checks for CSRF token before
 * servicing any requests. All requests to aura are posted to /aura and handled
 * by the AuraServlet. A CSRF token is generated with the very first request and
 * sent back to the Client. Every subsequent request from the client has the
 * CSRF token embedded as a request parameter.
 */
public class CSRFTokenValidationHttpTest extends AuraHttpTestCase {
    @Inject
    private ConfigAdapter configAdapter;

    private Map<String, String> makeBasePostParams() {
        Map<String, Object> message = new HashMap<>();
        Map<String, Object> actionInstance = new HashMap<>();
        actionInstance.put("descriptor",
                "java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = JsonEncoder.serialize(message);
        Map<String, String> params = new HashMap<>();
        params.put("message", jsonMessage);
        return params;
    }

    /**
     * Test to post a request to aura servlet without a CSRF token. This test
     * tries to request a action defined on a controller. But the request does
     * not have a valid CSRF token, hence the request should fail to fetch the
     * def.
     */
    @SuppressWarnings("unchecked")
    @AuraTestLabels("auraSanity")
    @Test
    public void testVerifyPostWithoutToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        params.put("aura.context", String.format("{\"mode\":\"FTEST\",\"fwuid\":\"%s\"}",
                configAdapter.getAuraFrameworkNonce()));
        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();
        assertNotNull(response);
        if (statusCode != HttpStatus.SC_OK || !response.endsWith("/*ERROR*/")) {
            fail("Should not be able to post to aura servlet without a valid CSRF token");
        }
        if (response.startsWith(AuraBaseServlet.CSRF_PROTECT)) {
            response = "/*" + response;
        }
        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(response);
        assertEquals(true, json.get("exceptionEvent"));
        Map<String, Object> event = (Map<String, Object>) json.get("event");
        assertEquals("Expected to see a aura:systemError event", "markup://aura:systemError", event.get("descriptor"));
        assertEquals("Missing parameter value for aura.token",
                ((Map<String, Object>) ((Map<String, Object>) ((event.get("attributes")))).get("values")).get("message"));
    }

    /**
     * Test to post a request to aura servlet with an invalid CSRF token. This
     * test tries to request a action defined on a controller. But the request
     * does not have a valid CSRF token, hence the request should fail to fetch
     * the def.
     */
    @Ignore("W-1064983 - NO CSRF validation currently")
    @Test
    public void _testVerifyPostWithInvalidToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        // Invalid token
        params.put("aura.token", "invalid");
        params.put("aura.context", "{\"mode\":\"FTEST\"}");
        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        EntityUtils.consume(httpResponse.getEntity());
        post.releaseConnection();
        if (statusCode != HttpStatus.SC_NOT_FOUND) {
            fail("Should not be able to post to aura servlet with an invalid CSRF token");
        }
    }

    /**
     * Test to post a request to aura servlet with a valid CSRF token. This test
     * tries to request an action defined on a controller.
     */
    @AuraTestLabels("auraSanity")
    @Test
    public void testVerifyPostWithValidToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        // Valid token
        params.put("aura.token", configAdapter.getCSRFToken());
        params.put("aura.context", String.format("{\"mode\":\"FTEST\",\"fwuid\":\"%s\"}",
                configAdapter.getAuraFrameworkNonce()));
        HttpPost post = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        EntityUtils.consume(httpResponse.getEntity());
        post.releaseConnection();
        assertEquals("Failed to post to aura servlet", HttpStatus.SC_OK, statusCode);
    }
}
