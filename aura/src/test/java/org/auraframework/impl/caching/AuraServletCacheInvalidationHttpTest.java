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
    package org.auraframework.impl.caching;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraServlet;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import org.apache.commons.httpclient.HttpStatus;

import java.io.IOException;
import java.net.URLEncoder;

import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;

/**
 * Test class to verify that clientside cache is invalidated by Aura Servlet.
 *
 * @hierarchy Aura.Caching
 * @priority high
 * @userStorySyncIdOrName a07B0000000Dj10
 *
 *
 *
 */
public class AuraServletCacheInvalidationHttpTest extends AuraHttpTestCase {
    private static final String CACHE_INVALIDATION_TOKEN = "OUTDATED";

    public AuraServletCacheInvalidationHttpTest(String name){
        super(name);
    }

    /**
     * Verify that AuraServlet returns an error code in the response body when an expired lastmod timestamp is used in a GET request.
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testGetRequestWithOldTimeStamp() throws Exception{
        //When last mod time stamp is older than a year (400 days).
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        String uri = getGetURIWithModifiedLastMod(ctx,(getAuraLastMod() - 400L * 24 * 60 * 60 * 1000));
        GetMethod get = obtainGetMethod(uri);
        int statusCode = getHttpClient().executeMethod(get);
        assertTrue("Aura servlet should return 200.",statusCode == HttpStatus.SC_OK);
        String response = get.getResponseBodyAsString();

        assertOutdated(response);
    }
    /**
     * Verify that AuraServlet returns an error code in the response body when a future lastmod timestamp is used in a GET request.
     * @throws Exception
     */
    public void testGetRequestWithFutureTimeStamp() throws Exception{
        //When last mod time stamp is older than a year.
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        long lm = getAuraLastMod();
        String uri = getGetURIWithModifiedLastMod(ctx,lm+1);
        GetMethod get = obtainGetMethod(uri);
        int statusCode = getHttpClient().executeMethod(get);
        assertTrue("Aura servlet should return 200.",statusCode == HttpStatus.SC_OK);
        String response = get.getResponseBodyAsString();
        assertOutdated(response);
    }
    /**
     * Verify that AuraServlet returns an error code in the response body when a lastmod timestamp is not used in a GET request.
     */
    @TestLabels("auraSanity")
    public void _testGetRequestWithNoTimeStamp() throws Exception{
        //When last mod time stamp is older than a year.
        GetMethod get = obtainGetMethod("/aura?aura.tag=auratest:test_TokenValidation&aura.mode=FTEST&aura.format=JSON&");
        int statusCode = getHttpClient().executeMethod(get);
        assertTrue("Failed to reach aura servlet.",statusCode == HttpStatus.SC_OK);
        String response = get.getResponseBodyAsString();
        assertEquals("AuraServlet failed to notify the client about invalid cache.",
                CACHE_INVALIDATION_TOKEN, response);
    }
    /**
     * Verify that AuraServlet returns usable content in the response body when valid lastmod timestamp is used in a GET request.
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testGetRequestWithValidTimeStamp() throws Exception{
        //When last mod time stamp is older than a year.
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        long lm = getAuraLastMod();
        String uri = getGetURIWithModifiedLastMod(ctx, lm);
        GetMethod get = obtainGetMethod(uri);
        int statusCode = getHttpClient().executeMethod(get);
        assertTrue("Failed to reach aura servlet.",statusCode == HttpStatus.SC_OK);
        String response = get.getResponseBodyAsString();
        assertTrue("AuraServlet failed to notify the client about invalid cache.",
                 response.startsWith(AuraBaseServlet.CSRF_PROTECT));
    }
    /**
     * Verify that AuraServlet returns an error code in the response body when an expired lastmod timestamp is used in a POST request.
     * @throws Exception
     */
    public void testPostRequestWithOldTimeStamp() throws Exception{
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        PostMethod post = getPostObject(ctx, String.valueOf(getAuraLastMod() - 400L * 24 * 60 * 60 * 1000)); // 400 days
        int statusCode = this.getHttpClient().executeMethod(post);
        assertTrue("Aura servlet should return 200.",statusCode == HttpStatus.SC_OK);
        String response = post.getResponseBodyAsString();
        assertOutdated(response);
    }
    /**
     * Verify that AuraServlet returns an error code in the response body when a lastmod timestamp is not used in a POST request.
     */
    public void _testPostRequestWithNoTimeStamp() throws Exception{
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        PostMethod post = getPostObject(ctx, null);
        int statusCode = this.getHttpClient().executeMethod(post);
        assertTrue("Failed to post to aura servlet",statusCode == HttpStatus.SC_OK);
        String response = post.getResponseBodyAsString();
        assertEquals("AuraServlet failed to notify the client about invalid cache.",
                CACHE_INVALIDATION_TOKEN, response);
    }
    /**
     * Verify that AuraServlet returns an error code in the response body when a future lastmod timestamp is used in a POST request.
     * @throws Exception
     */
    public void testPostRequestWithFutureTimeStamp() throws Exception{
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        PostMethod post = getPostObject(ctx, String.valueOf(getAuraLastMod()+1));
        int statusCode = this.getHttpClient().executeMethod(post);
        assertTrue("Aura servlet should return 200.",statusCode == HttpStatus.SC_OK);
        String response = post.getResponseBodyAsString();
        assertOutdated(response);
    }

    /**
     * Verify that AuraServlet returns usable content in the response body when valid lastmod timestamp is used in a POST request.
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testPostRequestWithValidTimeStamp() throws Exception{
        AuraContext ctx = startContext("auratest:test_TokenValidation");
        long lm = getAuraLastMod();
        PostMethod post = getPostObject(ctx, String.valueOf(lm));
        int statusCode = this.getHttpClient().executeMethod(post);
        String response = post.getResponseBodyAsString();
        if (HttpStatus.SC_OK != statusCode) {
            fail(String
                    .format("Unexpected status code <%s>, expected <%s>, response:%n%s",
                            statusCode, HttpStatus.SC_OK, response));
        }
        assertTrue("AuraServlet did not accept lastMod param.",
                response.startsWith(AuraBaseServlet.CSRF_PROTECT));
    }

    /**
     * Conveniece method to create a POST object to invoke a server side action.
     * This method is very specific to this test, please do not use it for any other purpose.
     * @param lastModToken
     * @return
     * @throws Exception
     */
    private PostMethod getPostObject(AuraContext ctx, String lastModToken) throws Exception{

        Map<String,Object> message = new HashMap<String,Object>();
        Map<String,Object> actionInstance = new HashMap<String,Object>();
        actionInstance.put("descriptor", "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString");
        Map<String,Object> actionParams = new HashMap<String,Object>();
        actionParams.put("param", "some string");
        actionInstance.put("params", actionParams);
        @SuppressWarnings("rawtypes")
        Map[] actions = {actionInstance};
        message.put("actions", actions);

        String jsonMessage = Json.serialize(message);

        Map<String,String> params = new HashMap<String,String>();
        params.put("message", jsonMessage);
        PostMethod post = null;
        params.put("aura.token", getCsrfToken());

        String serContext = getSerializedAuraContextWithModifiedLastMod(ctx, Long.parseLong(lastModToken));

        params.put("aura.context", serContext);
        post = obtainPostMethod("/aura", params);
        return post;
    }

    private AuraContext startContext(String qualifiedName){
        return Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, Aura.getDefinitionService().getDefDescriptor(qualifiedName, ApplicationDef.class));
    }

    private String getSerializedAuraContext(AuraContext ctx) throws Exception{
        StringBuilder sb = new StringBuilder();
        try{
            Aura.getSerializationService().write(ctx, null, AuraContext.class, sb, "HTML");
        }catch(IOException e){
            throw new AuraRuntimeException(e);
        }
        return sb.toString();
    }

    private String getSerializedAuraContextWithModifiedLastMod(AuraContext ctx, long lastMod) throws Exception{
        String serContext = getSerializedAuraContext(ctx);
        long lm = getAuraLastMod();
        String curLastMod = Long.toString(lm);
        String newLastMod = Long.toString(lastMod);
        if(!curLastMod.equals(newLastMod)){
            serContext = serContext.replace(curLastMod, newLastMod);
        }
        return serContext;
    }

    private long getAuraLastMod() throws Exception{
        String uriLM = getGetURI(Aura.getContextService().getCurrentContext());
        GetMethod getLM = obtainGetMethod(uriLM);
        getHttpClient().executeMethod(getLM);
        return AuraServlet.getLastMod();
    }

    private String getGetURI(AuraContext ctx) throws Exception{
        return getGetURI(Aura.getContextService().getCurrentContext().getApplicationDescriptor().getQualifiedName(), getSerializedAuraContext(ctx));
    }

    private String getGetURI(String appQName, String serializedCtx) throws Exception{
        return "/aura?aura.tag="+appQName+"&aura.mode=FTEST&aura.format=JSON&" +
        "aura.context="+URLEncoder.encode(serializedCtx,"UTF-8");
    }

    private String getGetURIWithModifiedLastMod(AuraContext ctx, long lastMod) throws Exception{
        String serContext = getSerializedAuraContextWithModifiedLastMod(ctx, lastMod);
        return getGetURI(ctx.getApplicationDescriptor().getQualifiedName(), serContext);
    }

    @SuppressWarnings("unchecked")
    private void assertOutdated(String response){
        if(!response.endsWith("/*ERROR*/")){
            fail("respose should end with "+"/*ERROR*/");
        }

        String jsonString = "/*"+response;

        Map<String, Object> json = (Map<String, Object>)new JsonReader().read(jsonString);
        Map<String, Object> event = (Map<String, Object>)json.get("event");
        if(event != null){
            String descriptor = (String)event.get("descriptor");
            if(descriptor != null && descriptor.equals("markup://aura:clientOutOfSync")){
                return;
            }
        }

        fail("unexpected response: "+ response);
    }
}
