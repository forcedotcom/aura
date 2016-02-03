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
package org.auraframework.integration.test.validation;

import java.util.List;
import java.util.Map;

import org.apache.http.client.methods.HttpRequestBase;
import org.auraframework.test.util.AuraHttpTestCase;

import com.google.common.collect.Maps;

import org.auraframework.util.json.Json;

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
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("name", "lintTest:basic");
        Map<String, Object> actionParams = Maps.newHashMap();
        actionParams.put("name", "markup://auradev:lintc");
        actionParams.put("attributes", attributes);
        ServerAction action = new ServerAction("aura://ComponentController/ACTION$getComponent", actionParams);
        action.run();
        Map<String,Object> returnValue = (Map<String,Object>)action.getReturnValue();
        Map<String,Object> value = (Map<String,Object>)returnValue.get(Json.ApplicationKey.VALUE.toString());
        Map<String,Object> model = (Map<String,Object>)value.get("model");
        List<Object> errors = (List<Object>)model.get("errors");
        assertEquals(2, errors.size());
        Map<String, ?> error = (Map<String,?>)errors.get(0);
        String errorMessage = (String) error.get("ErrorMessage");
        assertEquals("lintTest:basic", error.get("CompName"));
        assertTrue(errorMessage, errorMessage.contains("basicController.js (line 5, char 1) : Starting '(' missing"));
        error = (Map<String,?>)errors.get(1);
        errorMessage = (String) error.get("ErrorMessage");
        assertEquals("lintTest:basic", error.get("CompName"));
        assertTrue(errorMessage,
                errorMessage.contains("basicController.js (line 7, char 20) : Expected ';' and instead saw '}'"));
    }
}
