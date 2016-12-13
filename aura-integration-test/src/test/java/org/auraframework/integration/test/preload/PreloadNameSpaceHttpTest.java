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
package org.auraframework.integration.test.preload;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.auraframework.def.ApplicationDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.integration.test.util.AuraHttpTestCase;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.junit.Test;

import com.google.common.collect.Maps;

/**
 * Basic HTTP retrieve test for checking preloaded namespaces and componentDefs.
 */
public class PreloadNameSpaceHttpTest extends AuraHttpTestCase {
    /**
     * Verify that when a component is serialized down to the client, the component Def only has the descriptor and
     * nothing else.
     * <ol>
     * <li>Obtain a valid CSRF token to be used on a get request for a component in JSON format.</li>
     * <li>Request a component in JSON format.</li>
     * </ol>
     */
    @SuppressWarnings("unchecked")
    @AuraTestLabels("auraSanity")
    @Test
    public void testComponentDef() throws Exception {
        String response = obtainResponseCheckStatus();

        // Obtain a component which uses preloading namespaces
        String componentInJson = response.substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap;
        try {
            outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse: "+componentInJson, e);
        }
        List<Object> actions = (List<Object>) outerMap.get("actions");
        Map<String, Object> action = (Map<String, Object>) actions.get(0);
        Map<String, Object> returnValue = (Map<String, Object>) action.get("returnValue");
        Map<String, Object> def = (Map<String, Object>) returnValue.get("componentDef");
        String descriptor = (String) def.get("descriptor");

        // Verify that Descriptor was the only value sent back as part of the componentDef
        assertEquals(descriptor, "markup://preloadTest:test_Preload_Cmp_SameNameSpace");
    }

    /**
     * Test there are no more preloaded namespaces.
     */
    @SuppressWarnings("unchecked")
    @Test
    public void testNoPreloadsOnContext() throws Exception {
        String response = obtainResponseCheckStatus();

        // Grab the preloads attached to the context
        String componentInJson = response.substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap;
        try {
            outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse: "+componentInJson, e);
        }
        Map<String, Object> context = (Map<String, Object>) outerMap.get("context");
        ArrayList<String> preloads = (ArrayList<String>) context.get("preloads");

        assertNull("Preloads not found in the Context", preloads);
    }

    private String obtainResponseCheckStatus() throws Exception {
        String app = "preloadTest:test_Preload_Cmp_SameNameSpace";
        HttpPost post = new ServerAction("aura://ComponentController/ACTION$getApplication", null)
            .putParam("name", app)
            .setApp("preloadTest:test_Preload_Cmp_SameNameSpace", ApplicationDef.class)
            .getPostMethod();
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();
        assertTrue("Failed to reach aura servlet", statusCode == HttpStatus.SC_OK);
        assertFalse("Got error response "+response, response.endsWith("/*ERROR*/"));
        return response;
    }
    
    
    /*
     * Test for W-2109463
     * This test send a post request to server with dynamic-namespace (layout://rl_001_VIEW_ACCOUNT_HASH.c) in context, 
     * in response, the server consider layout://rl_001_VIEW_ACCOUNT_HASH.c as "preloaded" 
     * then serialize just the component's description into context, without putting down superDef/attributeDefs/etc
     */
    private String obtainResponseCheckStatusDN() throws Exception {
        String cmp = "preloadTest:test_dynamicNamespace";
        Map<String, Object> attribute = Maps.newHashMap();
        Object val = "mockRecordLayout"; 
        attribute.put("whatToDo", val); 
        HttpPost post = new ServerAction("aura://ComponentController/ACTION$getComponent", null)
            .putParam("name", cmp).putParam("attributes", attribute)
            .addDynamicName("rl_001_VIEW_ACCOUNT_HASH")
            .getPostMethod();
        HttpResponse httpResponse = perform(post);
        int statusCode = getStatusCode(httpResponse);
        String response = getResponseBody(httpResponse);
        post.releaseConnection();
        assertTrue("Failed to reach aura servlet", statusCode == HttpStatus.SC_OK);
        assertFalse("Got error response "+response, response.endsWith("/*ERROR*/"));
        return response;
    }
    
    @SuppressWarnings("unchecked")
    @Test
    public void testDynamicNamespace() throws Exception {
    	String response = obtainResponseCheckStatusDN();
    	String componentInJson = response.substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap;
        try {
            outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse: "+componentInJson, e);
        }
        Map<String,Object> context = (Map<String,Object>) outerMap.get("context");
        List<Object> componentDefs = (List<Object>) context.get("componentDefs");
        Map<String,Object> componentDef = (Map<String,Object>)componentDefs.get(0);
        Object value = componentDef.get("value");
        if(value instanceof String) {
        	assertEquals((String)value,"layout://rl_001_VIEW_ACCOUNT_HASH.c");
        }
    }
}
