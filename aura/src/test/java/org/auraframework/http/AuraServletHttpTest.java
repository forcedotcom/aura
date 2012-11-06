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

import java.util.*;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.*;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;

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
    // this test needs to be updated because of preloads fix
    public void _testGetContextHasPreloads() throws Exception {
        String modeAndContext = "{'mode':'DEV','preloads':['preloadTest']}";
        String url = "/aura?aura.tag=test%3Atext.cmp&aura.context=" + AuraTextUtil.urlencode(modeAndContext)
                + "&aura.lastmod=" + getLastMod(Mode.DEV, "preloadTest");
        GetMethod get = obtainGetMethod(url);
        int statusCode = getHttpClient().executeMethod(get);
        String response = get.getResponseBodyAsString();
        if (HttpStatus.SC_OK != statusCode) {
            fail(String
                    .format("Unexpected status code <%s>, expected <%s>, response:%n%s",
                            statusCode, HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> context = (Map<String, Object>)json.get("context");
        assertTrue("preloads wasn't serialized", context.containsKey("preloads"));
        List<String> preloads = (List<String>)context.get("preloads");
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
        actionInstance.put("descriptor", "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
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
            fail(String
                    .format("Unexpected status code <%s>, expected <%s>, response:%n%s",
                            statusCode, HttpStatus.SC_OK, response));
        }
        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(response
                .substring(AuraBaseServlet.CSRF_PROTECT.length()));
        Map<String, Object> context = (Map<String, Object>)json.get("context");
        assertFalse("preloads shouldn't get serialized on posts", context.containsKey("preloads"));
    }

    @SuppressWarnings("unchecked")
    public void testPostWithOldLastMod() throws Exception {
        Map<String, Object> message = new HashMap<String, Object>();
        Map<String, Object> actionInstance = new HashMap<String, Object>();
        actionInstance.put("descriptor", "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
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
        response = response.substring(AuraBaseServlet.CSRF_PROTECT.length() + 2, response.length() - "/*ERROR*/".length());
        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(response);
        assertEquals(true, json.get("exceptionEvent"));
        assertEquals("markup://aura:clientOutOfSync", ((Map<String, Object>)json.get("event")).get("descriptor"));
        Object f = json.get("defaultHandler");
        assertEquals(JsFunction.class, f.getClass());
        assertEquals("try{$A.clientService.setOutdated()}catch(e){$L.clientService.setOutdated()}", ((JsFunction)f).getBody());
    }
}
