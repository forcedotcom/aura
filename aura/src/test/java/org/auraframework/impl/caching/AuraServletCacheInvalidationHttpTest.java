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

import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.AuraTestLabels;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

/**
 * Test class to verify that clientside cache is invalidated by Aura Servlet.
 * 
 * @hierarchy Aura.Caching
 * @priority high
 * @userStorySyncIdOrName a07B0000000Dj10
 */
@ThreadHostileTest("relies on getLastMod")
public class AuraServletCacheInvalidationHttpTest extends AuraHttpTestCase {

    public AuraServletCacheInvalidationHttpTest(String name) {
        super(name);
    }

    /**
     * Verify that AuraServlet returns an error code in the response body when
     * an expired lastmod timestamp is used in a POST request.
     * 
     * @throws Exception
     */
    public void testPostRequestWithDifferentUID() throws Exception {
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);

        HttpPost post = getPostMethod(ctx, true);
        HttpResponse httpResponse = perform(post);                                                        // days
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();
        assertTrue("Aura servlet should return 200.", statusCode == HttpStatus.SC_OK);
        assertOutdated(response);
    }

    /**
     * Verify that AuraServlet returns usable content in the response body when
     * valid lastmod timestamp is used in a POST request.
     * 
     * @throws Exception
     */
    @AuraTestLabels("auraSanity")
    public void testPostRequestWithValidUID() throws Exception {
        AuraContext ctx = startContext("auratest:test_TokenValidation", ComponentDef.class);
        HttpPost post = getPostMethod(ctx, false);
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();

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
    private HttpPost getPostMethod(AuraContext ctx, boolean modified) throws Exception {
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

        String serContext = getAuraTestingUtil().getSerializedAuraContextWithModifiedUID(ctx, modified);

        params.put("aura.context", serContext);

        return obtainPostMethod("/aura", params);
    }

    private AuraContext startContext(String qualifiedName, Class<? extends BaseComponentDef> clazz) {
        return Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED,
                Aura.getDefinitionService().getDefDescriptor(qualifiedName, clazz));
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
