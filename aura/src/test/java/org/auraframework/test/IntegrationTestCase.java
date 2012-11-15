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
package org.auraframework.test;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.def.*;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraServlet;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.system.*;
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

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;

import com.google.common.collect.*;

/**
 * Base class for all Aura integration tests.
 */
@IntegrationTest
public abstract class IntegrationTestCase extends AuraTestCase {
    /**
     * Note, any tests that write to the servletConfig are {@link ThreadHostileTest}.
     */
    protected static TestServletConfig servletConfig = AuraUtil.get(TestServletConfig.class);
    // Do not use the testUtil to add string source in WebDriver tests.
    protected final AuraTestingUtil auraTestingUtil;
    private Set<DefDescriptor<?>> cleanUpDds;
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
        httpClient = null;
        auraTestingUtil.tearDown();
        // Clean up any defs that were created on the test app server
        if (cleanUpDds != null && !cleanUpDds.isEmpty()) {
            removeSource(cleanUpDds);
        }

        ServletConfigController.resetMocks();

        ContextService contextService = Aura.getContextService();
        if(contextService.isEstablished()){
            contextService.endContext();
        }

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

        long lastMod = AuraServlet.getLastMod();

        setContext(originalContext);

        return lastMod;
    }

    /**
     * Given a path on the api server, return a {@link GetMethod} that has the appropriate headers and server name.
     *
     * @param path
     *            the relative path to the server, such as <tt>/services/Soap</tt> or
     *            <tt>/servlet/servlet.SForceMailMerge</tt> Follows redirects by default.
     * @return a {@link GetMethod}
     * @throws MalformedURLException
     *             if the path is invalid.
     * @throws URISyntaxException
     */
    protected static GetMethod obtainGetMethod(String path) throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, true);
    }

    protected static GetMethod obtainGetMethod(String path, boolean followRedirects) throws MalformedURLException,
            URISyntaxException {
        String url = servletConfig.getBaseUrl().toURI().resolve(path).toString();
        GetMethod get = new GetMethod(url);
        if (System.getProperty(HttpMethodParams.USER_AGENT) != null)
            get.getParams().setParameter(HttpMethodParams.USER_AGENT, System.getProperty(HttpMethodParams.USER_AGENT));
        get.setFollowRedirects(followRedirects);
        return get;
    }

    /**
     * Given the a path on the api server, return a {@link PostMethod} that has the appropriate headers and server name.
     *
     * @param path
     *            the relative path to the server, such as <tt>/services/Soap</tt> or
     *            <tt>/servlet/servlet.SForceMailMerge</tt>.
     * @param params
     *            a set of name value string pairs to use as parameters to the post call.
     * @return a {@link PostMethod}
     * @throws MalformedURLException
     *             if the path is invalid.
     * @throws URISyntaxException
     */
    protected static PostMethod obtainPostMethod(String path, Map<String, String> params) throws MalformedURLException,
            URISyntaxException {
        PostMethod post = new PostMethod(servletConfig.getBaseUrl().toURI().resolve(path).toString());
        if (System.getProperty(HttpMethodParams.USER_AGENT) != null)
            post.getParams().setParameter(HttpMethodParams.USER_AGENT, System.getProperty(HttpMethodParams.USER_AGENT));

        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                post.addParameter(entry.getKey(), entry.getValue());
            }
        }
        return post;
    }

    protected <T extends Definition> void addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents,
            Date lastModified) {
        auraTestingUtil.addSourceAutoCleanup(descriptor, contents, lastModified);
    }

    protected <T extends Definition> void addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        addSourceAutoCleanup(descriptor, contents, new Date());
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(String contents, Class<T> defClass) {
        return auraTestingUtil.addSourceAutoCleanup(contents, defClass);
    }

    /**
     * Clean up defs created by tests.
     *
     * @param defs
     */
    protected void removeSource(Set<DefDescriptor<?>> defs) {
        StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();

        for(DefDescriptor<?> dd :defs){
            stringSourceLoader.removeSource(dd);
        }
    }

    public static class ServerAction implements Action {
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

        public PostMethod getPostMethod() throws Exception {
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
                    Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
                    params.put("aura.context", sb.toString());
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
        public void setId(String id) {}

        @SuppressWarnings("unchecked")
        @Override
        public void run() throws AuraExecutionException {
            try {
                PostMethod post = getPostMethod();
                servletConfig.getHttpClient().executeMethod(post);
                assertEquals(HttpStatus.SC_OK, post.getStatusCode());
                rawResponse = post.getResponseBodyAsString();
                assertEquals(AuraBaseServlet.CSRF_PROTECT, rawResponse.substring(0, AuraBaseServlet.CSRF_PROTECT.length()));
                Map<String, Object> json = (Map<String, Object>)new JsonReader().read(post.getResponseBodyAsString()
                        .substring(AuraBaseServlet.CSRF_PROTECT.length()));
                Map<String, Object> action = (Map<String, Object>)((List<Object>)json.get("actions")).get(0);
                this.state = State.valueOf(action.get("state").toString());
                this.returnValue = action.get("returnValue");
                this.errors = (List<Object>)action.get("error");
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
            return ImmutableList.of((Action)this);
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
		
		
        private String qualifiedName;
        private Map<String, Object> actionParams;
        private State state = State.NEW;
        private Object returnValue;
        private List<Object> errors;
        private PostMethod post;
        private String rawResponse;
        private final Map<String, BaseComponent<?, ?>> componentRegistry = Maps.newLinkedHashMap();
        private int nextId = 1;
    }
}
