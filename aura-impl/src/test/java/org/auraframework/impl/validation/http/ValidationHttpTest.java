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
package org.auraframework.impl.validation.http;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpRequestBase;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Maps;

public final class ValidationHttpTest extends AuraHttpTestCase {

    private HttpRequestBase method;

    public ValidationHttpTest(String name) {
        super(name);
    }

    @Override
    public void tearDown() throws Exception {
        try {
            if (method != null) {
                method.releaseConnection();
                method = null;
            }
        } finally {
            super.tearDown();
        }
    }

    @SuppressWarnings("unchecked")
    public void testLintApp() throws Exception {
        // http://localhost:9090/auradev/lint.app?name=...
        Map<String, Object> message = Maps.newHashMap();
        Map<String, Object> actionInstance = Maps.newHashMap();
        actionInstance.put("descriptor",
                "aura://ComponentController/ACTION$getComponent");
        Map<String, Object> actionParams = Maps.newHashMap();
        actionParams.put("name", "markup://auradev:lintc");
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("name", "lintTest:basic");
        actionParams.put("attributes", attributes);
        actionInstance.put("params", actionParams);
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = Json.serialize(message);
        Map<String, String> params = Maps.newHashMap();
        params.put("message", jsonMessage);
        params.put("aura.token", getCsrfToken());
        params.put("aura.context", getSimpleContext(Format.JSON, false));

        method = obtainPostMethod("/aura", params);
        HttpResponse httpResponse = perform(method);
        assertEquals(200, getStatusCode(httpResponse));

        String response = getResponseBody(httpResponse);
        List<Map<String, ?>> errors = null;

        try {
            // remote starting: while(1);
            response = response.substring(response.indexOf('{'));
            Map<String, ?> json = (Map<String, ?>) new JsonReader().read(response);
            Map<String, ?> value = (Map<String, ?>) ((Map<String, ?>) ((Map<String, ?>) ((ArrayList<?>) json
                    .get("actions"))
                    .get(0))
                    .get("returnValue"))
                    .get("value");
            errors = (List<Map<String, ?>>) ((Map<String, ?>) ((Map<String, ?>) value)
                    .get("model"))
                    .get("errors");
        } catch (Exception ex) {
            fail(String.valueOf(ex) + " parsing unexpected response: " + response);
        }

        assertEquals(2, errors.size());
        Map<String, ?> error = errors.get(0);
        String errorMessage = (String) error.get("ErrorMessage");
        assertEquals("lintTest:basic", error.get("CompName"));
        assertTrue(errorMessage, errorMessage.contains("basicController.js (line 5, char 1) : Starting '(' missing"));
        error = errors.get(1);
        errorMessage = (String) error.get("ErrorMessage");
        assertEquals("lintTest:basic", error.get("CompName"));
        assertTrue(errorMessage,
                errorMessage.contains("basicController.js (line 7, char 20) : Expected ';' and instead saw '}'"));
    }
}
