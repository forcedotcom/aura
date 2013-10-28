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
package org.auraframework.test;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpRequestBase;

import org.apache.http.entity.ContentType;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.IntegrationTest;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.configuration.TestServletConfig;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 * Base class for all Aura integration tests.
 */
@IntegrationTest
public abstract class IntegrationTestCase extends AuraTestCase {
    private TestServletConfig servletConfig = null;
    private HttpClient httpClient = null;

    public IntegrationTestCase(String name) {
        super(name);
    }

    @Override
    public void tearDown() throws Exception {
        if (httpClient != null) {
            httpClient.getConnectionManager().shutdown();
        }
        httpClient = null;
        super.tearDown();
    }

    protected HttpClient getHttpClient() throws Exception {
        if (httpClient == null) {
            httpClient = getTestServletConfig().getHttpClient();
        }
        return httpClient;
    }

    protected String getCsrfToken() throws Exception {
        return getTestServletConfig().getCsrfToken();
    }

    /**
     * Note: Any tests utilizing getLastMod are suspects for {@link ThreadHostileTest} since the last mod is shared
     * global state.
     */
    protected static long getLastMod(Mode mode, String... preloads) throws Exception {
        // AuraContextImpl adds aura & ui namespaces as default
        // SFDCAuraContext adds os namespace as default
        List<String> preloadsList = Lists.<String> newArrayList(new String[] { "aura", "ui" });
        preloadsList.addAll(Arrays.asList(preloads));

        ContextService contextService = Aura.getContextService();
        AuraContext context;

        // reuse existing context if available
        AuraContext originalContext = null;
        if (contextService.isEstablished()) {
            originalContext = contextService.getCurrentContext();
        }
        if (originalContext == null || !originalContext.getMode().equals(mode)) {
            context = contextService.startContext(mode, Format.JSON, Access.AUTHENTICATED);
        } else {
            context = originalContext;
        }

        for (String preload : preloadsList) {
            context.addPreload(preload);
        }

        long lastMod = AuraBaseServlet.getLastMod();

        setContext(originalContext);

        return lastMod;
    }

    protected TestServletConfig getTestServletConfig() {
        if (servletConfig == null) {
            servletConfig = Aura.get(TestServletConfig.class);
        }
        return servletConfig;
    }

    /**
     * Start a context and set up default values.
     */
    protected AuraContext setupContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc) 
            throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        AuraContext ctxt = contextService.startContext(mode, format, Access.AUTHENTICATED, desc);
        ctxt.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
        String uid = ctxt.getDefRegistry().getUid(null, desc);
        ctxt.addLoaded(desc, uid);
        return ctxt;
    }

    /**
     * Get a context for use with a get/post.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor name to set as the primary object.
     * @param type the type of descriptor.
     * @param modified break the context uid.
     */
    protected String getContext(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            boolean modified) throws QuickFixException {
        return getContext(mode, format, Aura.getDefinitionService().getDefDescriptor(desc, type), modified);
    }

    /**
     * Get a context as a string.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param modified break the context uid.
     */
    protected String getContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            boolean modified) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        AuraContext ctxt = setupContext(mode, format, desc);
        String ctxtString;
        if (modified) {
            String uid = modifyUID(ctxt.getLoaded().get(desc));
            ctxt.addLoaded(desc, uid);
        }
        ctxtString = getSerializedAuraContext(ctxt);
        contextService.endContext();
        return ctxtString;
    }

    /**
     * Get a serialized context with a possibly modified UID.
     *
     * FIXME: this should be cleaned out.
     */
    protected String getSerializedAuraContextWithModifiedUID(AuraContext ctx, boolean modify) throws QuickFixException {
        String uid = ctx.getDefRegistry().getUid(null, ctx.getApplicationDescriptor());
        if (modify) {
            uid = modifyUID(uid);
        }
        ctx.addLoaded(ctx.getApplicationDescriptor(), uid);
        return getSerializedAuraContext(ctx);
    }

    /**
     * Serialize a context.
     *
     * This simply runs the serialization and handles exceptions.
     *
     * @param ctx the context to serialize.
     * @return the serialized context as a string
     * @throws QuickFixException if the serialization service does (unlikely).
     */
    protected String getSerializedAuraContext(AuraContext ctx) throws QuickFixException {
        StringBuilder sb = new StringBuilder();
        try {
            Aura.getSerializationService().write(ctx, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            // This should never happen, stringbuilders don't throw IOException.
            throw new AuraRuntimeException(e);
        }
        return sb.toString();
    }

    /**
     * Make a UID be incorrect.
     */
    protected String modifyUID(String old) {
        StringBuilder sb = new StringBuilder(old);
        char flip = sb.charAt(3);

        // change the character.
        if (flip == 'a') {
            flip = 'b';
        } else {
            flip = 'a';
        }
        sb.setCharAt(3, flip);
        return sb.toString();
    }

    /**
     * Performs request method
     * 
     * @param method request method
     * @return request response
     * @throws Exception
     */
    protected HttpResponse perform(HttpRequestBase method) throws Exception {
        return perform(method, null);
    }

    /**
     * Performs request method with HttpContext. HttpContext typically contains cookie store with all cookies to include
     * with request
     * 
     * @param method request method
     * @param context httpcontext
     * @return request response
     * @throws Exception
     */
    protected HttpResponse perform(HttpRequestBase method, HttpContext context) throws Exception {
        return getHttpClient().execute(method, context);
    }

    /**
     * Set the desired user agent to be used in HttpClient requests from this test
     */
    protected void setHttpUserAgent(String userAgentString) throws Exception {
        HttpProtocolParams.setUserAgent(getHttpClient().getParams(), userAgentString);
    }

    /**
     * Gets status code of response
     * 
     * @param response request response
     * @return status code
     */
    protected static int getStatusCode(HttpResponse response) {
        return response.getStatusLine().getStatusCode();
    }

    /**
     * Gets string body of response
     * 
     * @param response request response
     * @return response body
     * @throws IOException
     */
    protected static String getResponseBody(HttpResponse response) throws IOException {
        HttpEntity entity = response.getEntity();
        return entity == null ? null : EntityUtils.toString(entity);
    }

    /**
     * Gets content type of response
     * 
     * @param response request response
     * @return content type
     */
    protected static ContentType getContentType(HttpResponse response) {
        return ContentType.getOrDefault(response.getEntity());
    }

    /**
     * Gets charset of response
     * 
     * @param response request response
     * @return charset
     */
    protected static String getCharset(HttpResponse response) {
        Charset charset = getContentType(response).getCharset();
        return charset == null ? null : charset.displayName();
    }

    /**
     * Gets mime type of response
     * 
     * @param response request response
     * @return mime type
     */
    protected static String getMimeType(HttpResponse response) {
        return getContentType(response).getMimeType();
    }

    /**
     * Get the relative URL for a given BaseComponentDef descriptor.
     * 
     * @param desc the DefDescriptor of a BaseComponentDef
     * @return the relative URL for the descriptor
     */
    protected String getUrl(DefDescriptor<? extends BaseComponentDef> desc) {
        return String.format("/%s/%s.%s", desc.getNamespace(), desc.getName(),
                DefType.APPLICATION.equals(desc.getDefType()) ? "app" : "cmp");
    }

}
