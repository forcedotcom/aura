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
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.IntegrationTest;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.configuration.TestServletConfig;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.AuraUtil;
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
    /**
     * Note, any tests that write to the servletConfig are {@link ThreadHostileTest}.
     */
    protected static TestServletConfig servletConfig = AuraUtil.get(TestServletConfig.class);
    protected final AuraTestingUtil auraTestingUtil;
    private HttpClient httpClient = null;

    public IntegrationTestCase(String name) {
        super(name);
        auraTestingUtil = AuraUtil.get(AuraTestingUtil.class);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        auraTestingUtil.setUp();
    }

    @Override
    public void tearDown() throws Exception {
        if (httpClient != null) {
            httpClient.getConnectionManager().shutdown();
        }
        httpClient = null;
        auraTestingUtil.tearDown();
        super.tearDown();
    }

    protected HttpClient getHttpClient() throws Exception {
        if (httpClient == null) {
            httpClient = servletConfig.getHttpClient();
        }
        return httpClient;
    }

    protected String getCsrfToken() throws Exception {
        return servletConfig.getCsrfToken();
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

    /**
     * Given a path on the api server, return a {@link HttpGet} that has the appropriate headers and server name.
     * 
     * @param path the relative path to the server, such as <tt>/services/Soap</tt> or
     *            <tt>/servlet/servlet.SForceMailMerge</tt> Follows redirects by default.
     * @return a {@link HttpGet}
     * @throws MalformedURLException if the path is invalid.
     * @throws URISyntaxException
     */
    protected static HttpGet obtainGetMethod(String path) throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, true, null);
    }

    protected static HttpGet obtainGetMethod(String path, boolean followRedirects) throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, followRedirects, null);
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
    protected static HttpGet obtainGetMethod(String path, boolean followRedirects, Header[] headers) throws MalformedURLException,
            URISyntaxException {
        String url = servletConfig.getBaseUrl().toURI().resolve(path).toString();
        HttpParams params = new BasicHttpParams();
        HttpClientParams.setRedirecting(params, followRedirects);

        if (System.getProperty(CoreProtocolPNames.USER_AGENT) != null) {
            HttpProtocolParams.setUserAgent(params, System.getProperty(CoreProtocolPNames.USER_AGENT));
        }

        HttpGet get = new HttpGet(url);
        get.setParams(params);

        if( headers != null ) {
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
    protected static HttpPost obtainPostMethod(String path, Map<String, String> params) throws MalformedURLException,
            URISyntaxException, UnsupportedEncodingException {
        HttpPost post = new HttpPost(servletConfig.getBaseUrl().toURI().resolve(path).toString());

        List <NameValuePair> nvps = new ArrayList<NameValuePair>();

        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
            }
            post.setEntity(new UrlEncodedFormEntity(nvps, CharEncoding.UTF_8));

        }
        return post;
    }

    /**
     * Performs get request with path
     * @param path
     * @return
     * @throws Exception
     */
    protected static HttpResponse performGet(String path) throws Exception {
        return performGet(path, true);
    }

    /**
     * Performs get request with path and follow redirects
     * @param path
     * @param followRedirects
     * @return
     * @throws Exception
     */
    protected static HttpResponse performGet(String path, boolean followRedirects) throws Exception {
        HttpGet get = obtainGetMethod(path, followRedirects, null);
        return perform(get);
    }

    /**
     * Performs get request with path and request headers
     * @param path
     * @param headers
     * @return
     * @throws Exception
     */
    protected static HttpResponse performGet(String path, Header[] headers) throws Exception {
        HttpGet get = obtainGetMethod(path, true, headers);
        return perform(get);
    }

    /**
     * Performs get request with path, follow redirects, and request headers
     * @param path
     * @param followRedirects
     * @param headers
     * @return
     * @throws Exception
     */
    protected static HttpResponse performGet(String path, boolean followRedirects, Header[] headers) throws Exception {
        HttpGet get = obtainGetMethod(path, followRedirects, headers);
        return perform(get);
    }

    /**
     * Performs post request with path and post parameters
     * @param path
     * @param params
     * @return
     * @throws Exception
     */
    protected static HttpResponse performPost(String path, Map<String, String> params) throws Exception {
        HttpPost post = obtainPostMethod(path, params);
        return perform(post);
    }

    /**
     * Performs request method
     * @param method
     * @return
     * @throws Exception
     */
    protected static HttpResponse perform(HttpRequestBase method) throws Exception {
        return perform(method, null);
    }

    /**
     * Performs request method with HttpContext. HttpContext typically contains cookie store with all cookies
     * to include with request
     *
     * @param method
     * @param context
     * @return
     * @throws Exception
     */
    protected static HttpResponse perform(HttpRequestBase method, HttpContext context) throws Exception {
        return servletConfig.getHttpClient().execute(method, context);
    }

    /**
     * Gets status code of response
     * @param response
     * @return
     */
    protected static int getStatusCode(HttpResponse response) {
        return response.getStatusLine().getStatusCode();
    }

    /**
     * Gets string body of response
     * @param response
     * @return
     * @throws IOException
     */
    protected static String getResponseBody(HttpResponse response) throws IOException {
        HttpEntity entity = response.getEntity();
        return entity == null ? null : EntityUtils.toString(entity);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents) {
        return auraTestingUtil.addSourceAutoCleanup(defClass, contents);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix) {
        return auraTestingUtil.addSourceAutoCleanup(defClass, contents, namePrefix);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        return auraTestingUtil.addSourceAutoCleanup(descriptor, contents);
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

    public static class ServerAction implements Action {

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

        public static ServerAction run(String qualifiedName, Map<String, Object> actionParams) {
            ServerAction action = new ServerAction(qualifiedName, actionParams);
            action.run();
            return action;
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
                params.put("aura.token", servletConfig.getCsrfToken());

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
                HttpResponse response = servletConfig.getHttpClient().execute(post);

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


    }
}
