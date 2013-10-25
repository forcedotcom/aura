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
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.CharEncoding;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.params.HttpClientParams;

import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.entity.ContentType;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.test.annotation.IntegrationTest;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.configuration.TestServletConfig;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

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
     * Given a path on the api server, return a {@link HttpGet} that has the appropriate headers and server name.
     * 
     * @param path the relative path to the server, such as <tt>/services/Soap</tt> or
     *            <tt>/servlet/servlet.SForceMailMerge</tt> Follows redirects by default.
     * @return a {@link HttpGet}
     * @throws MalformedURLException if the path is invalid.
     * @throws URISyntaxException
     */
    protected HttpGet obtainGetMethod(String path) throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, true, null);
    }

    protected HttpGet obtainGetMethod(String path, boolean followRedirects) throws MalformedURLException,
            URISyntaxException {
        return obtainGetMethod(path, followRedirects, null);
    }

    protected HttpGet obtainGetMethod(String path, Header[] headers) throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, true, headers);
    }

    /**
     * Build a URL for a get from the given parameters with all the standard parameters set.
     *
     * This is a convenience function to make gets more consistent. It sets:
     * <ul>
     *   <li>aura.tag: the descriptor to get.</li>
     *   <li>aura.defType: the type of the descriptor.</li>
     *   <li>aura.context: the context, including
     *     <ul>
     *       <li>loaded: the descriptor + type from above.</li>
     *       <li>fwUID: the framework UID</li>
     *       <li>mode: from the parameters</li>
     *       <li>format: from the parameters</li>
     *     </ul>
     *   </li>
     * </ul>
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param type the type of descriptor.
     * @param params extra parameters to set.
     * @param headers extra headers.
     */
    protected HttpGet obtainAuraGetMethod(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            Map<String,String> params, Header[] headers)
            throws QuickFixException, MalformedURLException, URISyntaxException {
        return obtainAuraGetMethod(mode, format, Aura.getDefinitionService().getDefDescriptor(desc, type), params, headers);
    }

    protected HttpGet obtainAuraGetMethod(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            Map<String,String> params, Header[] headers)
            throws QuickFixException, MalformedURLException, URISyntaxException {
        List<NameValuePair> urlparams = Lists.newArrayList();
        urlparams.add(new BasicNameValuePair("aura.tag", String.format("%s:%s", desc.getNamespace(), desc.getName())));
          
        for (Map.Entry<String, String> entry : params.entrySet()) {
            urlparams.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }
        urlparams.add(new BasicNameValuePair("aura.context", getContext(mode, format, desc, false)));
        String query = URLEncodedUtils.format(urlparams, "UTF-8");

        // final url Request to be send to server
        return obtainGetMethod("aura?" + query, true, headers);
    }

    /**
     * Get a context for use with a get/post.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param type the type of descriptor.
     * @param modified break the context uid.
     */
    protected String getContext(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            boolean modified) throws QuickFixException {
        return getContext(mode, format, Aura.getDefinitionService().getDefDescriptor(desc, type), modified);
    }

    protected String getContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            boolean modified) throws QuickFixException {
        ContextService contextService = Aura.getContextService();
        String ctxtString;
        AuraContext ctxt = contextService.startContext(mode, format, Access.AUTHENTICATED, desc);
        ctxt.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
        ctxtString = getSerializedAuraContextWithModifiedUID(ctxt, modified);
        contextService.endContext();
        return ctxtString;
    }

    /**
     * Get a serialized context with a possibly modified UID.
     */
    protected String getSerializedAuraContextWithModifiedUID(AuraContext ctx, boolean modify) throws QuickFixException {
        String uid;
        if (modify) {
            uid = getModifiedAppUID();
        } else {
            uid = getAppUID(ctx);
        }
        ctx.addLoaded(ctx.getApplicationDescriptor(), uid);
        return getSerializedAuraContext(ctx);
    }

    protected String getSerializedAuraContext(AuraContext ctx) throws QuickFixException {
        StringBuilder sb = new StringBuilder();
        try {
            Aura.getSerializationService().write(ctx, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
        return sb.toString();
    }

    protected String getAppUID() throws QuickFixException {
        return getAppUID(Aura.getContextService().getCurrentContext());
    }

    protected String getAppUID(AuraContext ctxt) throws QuickFixException {
        return ctxt.getDefRegistry().getUid(null, ctxt.getApplicationDescriptor());
    }

    protected String getModifiedAppUID(String old) {
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

    protected String getModifiedAppUID() throws QuickFixException {
        return getModifiedAppUID(getAppUID());
    }

    /**
     * Sets up get request method for httpclient. Includes ability to follow redirects and set request headers
     * 
     * @param path
     * @param followRedirects
     * @param headers
     * @return
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    protected HttpGet obtainGetMethod(String path, boolean followRedirects, Header[] headers)
            throws MalformedURLException,
            URISyntaxException {
        String url = getTestServletConfig().getBaseUrl().toURI().resolve(path).toString();

        HttpGet get = new HttpGet(url);
        HttpParams params = get.getParams();
        HttpClientParams.setRedirecting(params, followRedirects);

        if (headers != null) {
            get.setHeaders(headers);
        }

        return get;
    }

    /**
     * Given the a path on the api server, return a {@link HttpPost} that has the appropriate headers and server name.
     * 
     * @param path the relative path to the server, such as <tt>/services/Soap</tt> or
     *            <tt>/servlet/servlet.SForceMailMerge</tt>.
     * @param params a set of name value string pairs to use as parameters to the post call.
     * @return a {@link HttpPost}
     * @throws MalformedURLException if the path is invalid.
     * @throws URISyntaxException
     */
    protected HttpPost obtainPostMethod(String path, Map<String, String> params) throws MalformedURLException,
            URISyntaxException, UnsupportedEncodingException {
        HttpPost post = new HttpPost(getTestServletConfig().getBaseUrl().toURI().resolve(path)
                .toString());

        List<NameValuePair> nvps = new ArrayList<NameValuePair>();

        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
            }
            post.setEntity(new UrlEncodedFormEntity(nvps, CharEncoding.UTF_8));

        }
        return post;
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

    public class ServerAction implements Action {

        private final String qualifiedName;
        private Map<String, Object> actionParams;
        private State state = State.NEW;
        private Object returnValue;
        private List<Object> errors;
        private HttpPost post;
        private String rawResponse;
        private final Map<String, BaseComponent<?, ?>> componentRegistry = Maps.newLinkedHashMap();
        private int nextId = 1;

        public ServerAction(String qualifiedName, Map<String, Object> actionParams) {
            this.qualifiedName = qualifiedName;
            this.actionParams = actionParams;
        }

        public ServerAction putParam(String name, Object value) {
            if (actionParams == null) {
                actionParams = Maps.newHashMap();
            }
            actionParams.put(name, value);
            return this;
        }

        public HttpPost getPostMethod() throws Exception {
            if (post == null) {
                Map<String, Object> message = new HashMap<String, Object>();
                Map<String, Object> actionInstance = new HashMap<String, Object>();
                actionInstance.put("descriptor", qualifiedName);
                if (actionParams != null) {
                    actionInstance.put("params", actionParams);
                }
                message.put("actions", new Map[] { actionInstance });
                String jsonMessage = Json.serialize(message);
                Map<String, String> params = new HashMap<String, String>();
                params.put("message", jsonMessage);
                params.put("aura.token", getTestServletConfig().getCsrfToken());

                AuraContext context = Aura.getContextService().getCurrentContext();
                if (context != null) {
                    StringBuilder sb = new StringBuilder();
                    context.setSerializeLastMod(false);
                    context.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
                    Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
                    params.put("aura.context", sb.toString());
                } else {
                    //
                    // We always need an fwuid or we'll reset.
                    //
                    params.put("aura.context", String.format("{'fwuid':'%s'}",
                            Aura.getConfigAdapter().getAuraFrameworkNonce()));
                }
                post = obtainPostMethod("/aura", params);
            }
            return post;
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return Aura.getDefinitionService().getDefDescriptor(qualifiedName, ActionDef.class);
        }

        @Override
        public void serialize(Json json) throws IOException {
            // Nothing for now
        }

        @Override
        public String getId() {
            return null;
        }

        @Override
        public void setId(String id) {
        }

        @SuppressWarnings("unchecked")
        @Override
        public void run() throws AuraExecutionException {
            try {
                HttpPost post = getPostMethod();
                HttpResponse response = getHttpClient().execute(post);

                assertEquals(HttpStatus.SC_OK, getStatusCode(response));
                rawResponse = getResponseBody(response);
                assertEquals(AuraBaseServlet.CSRF_PROTECT,
                        rawResponse.substring(0, AuraBaseServlet.CSRF_PROTECT.length()));
                Map<String, Object> json = (Map<String, Object>) new JsonReader().read(rawResponse
                        .substring(AuraBaseServlet.CSRF_PROTECT.length()));
                Map<String, Object> action = (Map<String, Object>) ((List<Object>) json.get("actions")).get(0);
                this.state = State.valueOf(action.get("state").toString());
                this.returnValue = action.get("returnValue");
                this.errors = (List<Object>) action.get("error");
            } catch (Exception e) {
                throw new AuraExecutionException(e, null);
            }
        }

        @Override
        public void add(List<Action> actions) {
            // Only 1 action supported for now
        }

        @Override
        public List<Action> getActions() {
            return ImmutableList.of((Action) this);
        }

        @Override
        public Object getReturnValue() {
            return returnValue;
        }

        @Override
        public State getState() {
            return state;
        }

        @Override
        public List<Object> getErrors() {
            return errors;
        }

        @Override
        public void registerComponent(BaseComponent<?, ?> component) {
            componentRegistry.put(component.getGlobalId(), component);
        }

        @Override
        public Map<String, BaseComponent<?, ?>> getComponents() {
            return componentRegistry;
        }

        @Override
        public int getNextId() {
            return nextId++;
        }

        @Override
        public void logParams(KeyValueLogger paramLogger) {
            // not implemented
        }

    }
}
