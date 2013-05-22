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
package org.auraframework.impl.caching;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

/**
 * Test class to verify that clientside cache is invalidated by Aura Servlet.
 * ThreadHostile due to reliance on getLastMod.
 * 
 * @hierarchy Aura.Caching
 * @priority high
 * @userStorySyncIdOrName a07B0000000Dj10
 */
@ThreadHostileTest
public class AuraServletCacheInvalidationHttpTest extends AuraHttpTestCase {

    public AuraServletCacheInvalidationHttpTest(String name) {
        super(name);
    }

    /**
     * Verify that AuraServlet returns an error code in the response body when
     * a different UID.
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testGetRequestWithModifiedUID() throws Exception {
        // When last mod time stamp is older than a year (400 days).
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);
        String uri = getGetURIWithModifiedUID(ctx, true);

        HttpResponse httpResponse = performGet(uri);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);

        assertTrue("Aura servlet should return 200.", statusCode == HttpStatus.SC_OK);
        assertOutdated(response);
    }

    /**
     * Verify that AuraServlet returns usable content in the response body when
     * valid lastmod timestamp is used in a GET request.
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testGetRequestWithValidTimeStamp() throws Exception {
        // When last mod time stamp is older than a year.
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);
        String uri = getGetURIWithModifiedUID(ctx, false);
        HttpResponse httpResponse = performGet(uri);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);

        assertTrue("Failed to reach aura servlet.", statusCode == HttpStatus.SC_OK);
        assertTrue("AuraServlet failed to notify the client about invalid cache.",
                response.startsWith(AuraBaseServlet.CSRF_PROTECT));
    }

    /**
     * Verify that AuraServlet returns an error code in the response body when
     * an expired lastmod timestamp is used in a POST request.
     * 
     * @throws Exception
     */
    public void testPostRequestWithDifferentUID() throws Exception {
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);
        HttpResponse httpResponse = getPostResponse(ctx, true);
                                                                                                             // days
        int statusCode = getStatusCode(httpResponse);
        assertTrue("Aura servlet should return 200.", statusCode == HttpStatus.SC_OK);
        String response = getResponseBody(httpResponse);
        assertOutdated(response);
    }

    /**
     * Verify that AuraServlet returns usable content in the response body when
     * valid lastmod timestamp is used in a POST request.
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testPostRequestWithValidUID() throws Exception {
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);
        HttpResponse httpResponse = getPostResponse(ctx, false);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        if (HttpStatus.SC_OK != statusCode) {
            fail(String.format("Unexpected status code <%s>, expected <%s>, response:%n%s", statusCode,
                    HttpStatus.SC_OK, response));
        }
        assertTrue("AuraServlet did not accept lastMod param.", response.startsWith(AuraBaseServlet.CSRF_PROTECT));
    }

    /**
     * Convenience method to create a POST object to invoke a server side action.
     * This method is very specific to this test, please do not use it for any
     * other purpose.
     *
     * @param ctx
     * @param modified
     * @return response
     * @throws Exception
     */
    private HttpResponse getPostResponse(AuraContext ctx, boolean modified) throws Exception {
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

        String serContext = getSerializedAuraContextWithModifiedUID(ctx, modified);

        params.put("aura.context", serContext);

        return performPost("/aura", params);
    }

    private AuraContext startContext(String qualifiedName, Class<? extends BaseComponentDef> clazz) {
        return Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED,
                Aura.getDefinitionService().getDefDescriptor(qualifiedName, clazz));
    }

    private String getGetURI(String appQName, String serializedCtx) throws Exception {
        return "/aura?aura.tag=" + appQName + "&aura.mode=FTEST&aura.format=JSON&" + "aura.context="
                + URLEncoder.encode(serializedCtx, "UTF-8");
    }

    private String getGetURIWithModifiedUID(AuraContext ctx, boolean modify) throws Exception {
        String serContext = getSerializedAuraContextWithModifiedUID(ctx, modify);
        return getGetURI(ctx.getApplicationDescriptor().getQualifiedName(), serContext);
    }

    @SuppressWarnings("unchecked")
    private void assertOutdated(String response) {
        if (!response.endsWith("/*ERROR*/")) {
            fail("respose should end with " + "/*ERROR*/");
        }

        String jsonString = "/*" + response;

        Map<String, Object> json = (Map<String, Object>) new JsonReader().read(jsonString);
        Map<String, Object> event = (Map<String, Object>) json.get("event");
        if (event != null) {
            String descriptor = (String) event.get("descriptor");
            if (descriptor != null && descriptor.equals("markup://aura:clientOutOfSync")) {
                return;
            }
        }

        fail("unexpected response: " + response);
    }
}
