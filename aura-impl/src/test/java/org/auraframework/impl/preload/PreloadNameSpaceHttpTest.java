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
package org.auraframework.impl.preload;

import java.util.Map;

import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.util.json.JsonReader;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
/**
 * Basic HTTP retieve test for pre loading componentDefs from namespaces.
 * @hierarchy Aura.Basic
 * @priority high
 * @userStory a07B0000000DfxB
 *
 *
 * @since 138
 */
public class PreloadNameSpaceHttpTest extends AuraHttpTestCase {
    public PreloadNameSpaceHttpTest(String name){
        super(name);
    }
    /**
     * Verify that when a component is serialized down to the client, the component Def only has the descriptor and nothing else.
     * Step 1: Obtain a valid CSRF token to be used on a get request for a component in JSON format.
     * Step 2: Request a component in JSON format.
     */
    @SuppressWarnings("unchecked")
    @TestLabels("auraSanity")
    public void testComponentDef() throws Exception{
        //Obtain CSRF token
        String url = String.format("/aura?aura.tag=preloadTest:test_Preload_Cmp_SameNameSpace&aura.format=JSON&aura.mode=FTEST&aura.lastmod=%s&aura.deftype=APPLICATION",
                getLastMod(Mode.FTEST, "preloadTest"));
        GetMethod get = obtainGetMethod(url);
        int statusCode = this.getHttpClient().executeMethod(get);
        assertTrue("Failed to reach aura servlet",statusCode == HttpStatus.SC_OK);
        //Obtain a component which uses preloading namespaces
        String componentInJson = get.getResponseBodyAsString().substring(AuraBaseServlet.CSRF_PROTECT.length());
        Map<String, Object> outerMap = (Map<String, Object>) new JsonReader().read(componentInJson);
        Map<String, Object> component = (Map<String, Object>)outerMap.get("component");
        Map<String, Object> value = (Map<String, Object>)component.get("value");
        Map<String, Object> componentDef = (Map<String, Object>)value.get("componentDef");
        componentDef = (Map<String, Object>)componentDef.get("value");
        //Verify that Descriptor was the only value sent back as part of the componentDef
        assertTrue(componentDef.size()==1);
        assertTrue(componentDef.containsKey("descriptor"));
        assertEquals(componentDef.get("descriptor"),"markup://preloadTest:test_Preload_Cmp_SameNameSpace");
    }
}
