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
package org.auraframework.impl.preload;

import java.util.ArrayList;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.util.json.JsonReader;

/**
 * Basic HTTP retrieve test for checking preloaded namespaces and componentDefs.
 */
@ThreadHostileTest
public class PreloadNameSpaceHttpTest extends AuraHttpTestCase {
    public PreloadNameSpaceHttpTest(String name) {
        super(name);
    }

    /**
     * Verify that when a component is serialized down to the client, the component Def only has the descriptor and
     * nothing else.
     * <ol>
     * <li>Obtain a valid CSRF token to be used on a get request for a component in JSON format.</li>
     * <li>Request a component in JSON format.</li>
     * </ol>
     */
    @SuppressWarnings("unchecked")
    @TestLabels("auraSanity")
    public void testComponentDef() throws Exception {
        HttpResponse httpResponse = obtainResponseCheckStatus();

        // Obtain a component which uses preloading namespaces
        String componentInJson = getResponseBody(httpResponse).substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        Map<String, Object> component = (Map<String, Object>) outerMap.get("component");
        Map<String, Object> value = (Map<String, Object>) component.get("value");
        Map<String, Object> componentDef = (Map<String, Object>) value.get("componentDef");
        componentDef = (Map<String, Object>) componentDef.get("value");

        // Verify that Descriptor was the only value sent back as part of the componentDef
        assertTrue(componentDef.size() == 1);
        assertTrue(componentDef.containsKey("descriptor"));
        assertEquals(componentDef.get("descriptor"), "markup://preloadTest:test_Preload_Cmp_SameNameSpace");
    }

    /**
     * Verify preload namespaces are properly attached to the Context, including the preloads explicitly declared on the
     * component using the preload='<namespace>' tag.
     */
    @SuppressWarnings("unchecked")
    public void testPreloadsOnContext() throws Exception {
        HttpResponse httpResponse = obtainResponseCheckStatus();

        // Grab the preloads attached to the context
        String componentInJson = getResponseBody(httpResponse).substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        Map<String, Object> context = (Map<String, Object>) outerMap.get("context");
        ArrayList<String> preloads = (ArrayList<String>) context.get("preloads");

        assertNotNull("No preloads found in the Context", preloads);
        assertTrue("Preloads array on Context is empty", !preloads.isEmpty());
        assertTrue("'aura' preloaded namespace not found on Context", preloads.contains("aura"));
        assertTrue("'ui' preloaded namespace not found on Context", preloads.contains("ui"));
        assertTrue("Preloads explicitly declared on component using the preload='' tag should be present on Context",
                preloads.contains("preloadTest"));
    }

    private HttpResponse obtainResponseCheckStatus() throws Exception {
        String url = String
                .format("/aura?aura.tag=preloadTest:test_Preload_Cmp_SameNameSpace&aura.format=JSON&aura.mode=FTEST&aura.lastmod=%s&aura.deftype=APPLICATION",
                        getLastMod(Mode.FTEST, "preloadTest"));
        HttpResponse httpResponse = performGet(url);
        int statusCode = getStatusCode(httpResponse);
        assertTrue("Failed to reach aura servlet", statusCode == HttpStatus.SC_OK);
        return httpResponse;
    }
}
