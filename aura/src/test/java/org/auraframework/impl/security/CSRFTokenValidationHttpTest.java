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
package org.auraframework.impl.security;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;

import org.auraframework.Aura;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

/**
 * This test verifies that the aura servlet checks for CSRF token before
 * servicing any requests. All requests to aura are posted to /aura and handled
 * by the AuraServlet. A CSRF token is generated with the very first request and
 * sent back to the Client. Every subsequent request from the client has the
 * CSRF token embedded as a request parameter.
 * 
 * @hierarchy Aura.Security
 * @priority high
 * @userStory a07B0000000DV9S
 */
public class CSRFTokenValidationHttpTest extends AuraHttpTestCase {
    public CSRFTokenValidationHttpTest(String name) {
        super(name);
    }

    private Map<String, String> makeBasePostParams() {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor",
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String, Object> actionParams = new HashMap<String, Object>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = Json.serialize(message);
        Map<String, String> params = new HashMap<String, String>();
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
    @TestLabels("auraSanity")
    public void testVerifyPostWithoutToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        params.put("aura.context", String.format("{\"mode\":\"FTEST\",\"fwuid\":\"%s\"}",
                Aura.getConfigAdapter().getAuraFrameworkNonce()));
        PostMethod post = obtainPostMethod("/aura", params);
        int statusCode = this.getHttpClient().executeMethod(post);
        String response = post.getResponseBodyAsString();
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
                ((Map<String, Object>) ((Map<String, Object>) ((Map<String, Object>) (event.get("attributes")))
                        .get("value")).get("values")).get("message"));
        Object f = json.get("defaultHandler");
        assertEquals(JsFunction.class, f.getClass());
        assertEquals("$A.error('unknown error');", ((JsFunction) f).getBody());
    }

    /**
     * Test to post a request to aura servlet with an invalid CSRF token. This
     * test tries to request a action defined on a controller. But the request
     * does not have a valid CSRF token, hence the request should fail to fetch
     * the def.
     */
    // W-1064983 - NO CSRF validation currently
    public void _testVerifyPostWithInvalidToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        // Invalid token
        params.put("aura.token", "invalid");
        params.put("aura.context", "{\"mode\":\"FTEST\"}");
        PostMethod post = obtainPostMethod("/aura", params);
        int statusCode = this.getHttpClient().executeMethod(post);
        if (statusCode != HttpStatus.SC_NOT_FOUND) {
            fail("Should not be able to post to aura servlet with an invalid CSRF token");
        }
    }

    /**
     * Test to post a request to aura servlet with a valid CSRF token. This test
     * tries to request an action defined on a controller.
     */
    @TestLabels("auraSanity")
    public void testVerifyPostWithValidToken() throws Exception {
        Map<String, String> params = makeBasePostParams();
        // Valid token
        params.put("aura.token", getCsrfToken());
        params.put("aura.context", "{\"mode\":\"FTEST\"}");
        PostMethod post = obtainPostMethod("/aura", params);
        int statusCode = this.getHttpClient().executeMethod(post);
        assertEquals("Failed to post to aura servlet", HttpStatus.SC_OK, statusCode);
    }
}
