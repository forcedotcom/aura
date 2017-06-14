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
package org.auraframework.integration.test.util;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.CharEncoding;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.CookieStore;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.cookie.BasicClientCookie;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.impl.java.controller.DebugController;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceBuilderProvider;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.EncodingStyle;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;

import javax.inject.Inject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Base class with some helper methods specific to Aura.
 */
@SuppressWarnings("deprecation")
public abstract class AuraHttpTestCase extends IntegrationTestCase {
    @Inject
    private ConfigAdapter configAdapter;
    
    @Inject
    private InstanceBuilderProvider instanceBuilderProvider;

    @SuppressWarnings("unchecked")
    @Override
    public void runTest() throws Throwable {
        try {
            super.runTest();
        } catch (Throwable t) {
            Map<String, String> info;
            try {
                ServerAction action = new ServerAction("java://org.auraframework.impl.java.controller.DebugController/ACTION$getInfo", null);
                action.run();
                info = (Map<String, String>) action.getReturnValue();
                
                DebugController controller = instanceBuilderProvider.get(DebugController.class);
                Map<String, String> clientInfo = controller.getInfo();
                
                t = new Error(String.format("See cause for real exception. Debug properties - \napp: %s \ntest: %s",
                        info, clientInfo), t);
                t.setStackTrace(new StackTraceElement[0]);
            }catch(Throwable ignore){
                System.err.println(ignore);
            }
            throw t;
        }
    }
    
    /**
     * Given a URL to post a GET request, this method compares the actual status code of the response with an expected
     * status code.
     *
     * @param msg Error message that should be displayed if the actual response does not match the expected response
     * @param url URL to be used to execute the GET request
     * @param statusCode expected status code of response
     * @throws Exception
     */
    protected void assertUrlResponse(String msg, String url, int statusCode) throws Exception {
        HttpGet get = obtainGetMethod(new URI(null, url, null).toString());
        HttpResponse httpResponse = perform(get);
        EntityUtils.consume(httpResponse.getEntity());
        get.releaseConnection();
        int status = getStatusCode(httpResponse);
        assertEquals(msg, statusCode, status);
    }

    /**
     * Helper method to check that a response has the default X-FRAME-OPTIONS and Content-Security-Policy headers. If
     * your test doesn't use the default security policy, you get to roll your own validation of that, of course.
     *
     * Asserts if anything is wrong.
     *
     * As a safety provision, if the config adapter *isn't* recognized as "ours," we don't check anything. (This covers
     * the fact that inside SFDC, we have a different config adapter with a different default CSP.)
     *
     * @param response
     * @param guarded If {@code true}, check that we HAVE headers. If {@code false}, check that they are absent.
     * @param allowInline Allows inline script-src and style-src
     */
    protected void assertDefaultAntiClickjacking(HttpResponse response, boolean guarded, boolean allowInline) {
        String adapterClassName = configAdapter.getClass().getName();
        if (adapterClassName.equals("org.auraframework.impl.adapter.ConfigAdapterImpl")
                || adapterClassName.equals("org.auraframework.impl.adapter.MockConfigAdapterImpl")) {
            Header[] headers = response.getHeaders("X-FRAME-OPTIONS");

            if (guarded) {
                assertEquals("wrong number of X-FRAME-OPTIONS header lines", 1, headers.length);

                AuraContext context = contextService.getCurrentContext();
                boolean testMode = context != null && context.isTestMode();
                
                // There may be multiple CSP headers, so we will look for the one we're interested in
                Map<String, List<String>> cspDirectives = getCSPDirectives(response);
                
                if (testMode || allowInline) {
                    assertTrue("frame-ancestors is wrong", cspDirectives.get("frame-ancestors").contains("*"));
                    assertTrue("script-src is wrong",
                            cspDirectives.get("script-src").contains("'self' chrome-extension: 'unsafe-eval'"));
                    assertTrue("style-src is wrong",
                            cspDirectives.get("style-src").contains("'self' chrome-extension: 'unsafe-inline'"));
                    assertEquals("ALLOWALL", headers[0].getValue());
                } else {
                    assertTrue("frame-ancestors is wrong", cspDirectives.get("frame-ancestors").contains("'self'"));
                    assertTrue("script-src is wrong",
                            cspDirectives.get("script-src").contains("'self' chrome-extension:"));
                    assertTrue("style-src is wrong",
                            cspDirectives.get("style-src").contains("'self' chrome-extension: 'unsafe-inline'"));
                    assertEquals("SAMEORIGIN", headers[0].getValue());
                }

                // These maybe aren't strictly "anti-clickjacking", but since
                // we're testing the rest of the default CSP:
                assertTrue("font-src is wrong", cspDirectives.get("font-src").contains("*"));
                assertTrue("img-src is wrong", cspDirectives.get("img-src").contains("*"));
                assertTrue("media-src is wrong", cspDirectives.get("media-src").contains("*"));
                assertTrue("default-src is wrong", cspDirectives.get("default-src").contains("'self'"));
                assertTrue("object-src is wrong", cspDirectives.get("object-src").contains("'self'"));
                assertTrue("connect-src is wrong", cspDirectives.get("connect-src")
                        .contains("'self' http://invalid.salesforce.com http://offline https://offline"));
            } else {
                headers = response.getHeaders("Content-Security-Policy");
                assertEquals(0, headers.length);
                // Check X-FRAME-OPTIONS vis-a-vis CSP
                assertEquals("wrong number of X-FRAME-OPTIONS header lines", 0, headers.length);
            }
        }
    }

    /**
     * Gather all the CSP directives in the response's headers into a Map keyed
     * by directive name. The entry values are a list of the directive values
     * found, since multiple headers may declare the same directives.
     */
    protected Map<String, List<String>> getCSPDirectives(HttpResponse response) {
        Header[] headers = response.getHeaders("Content-Security-Policy");
        Map<String, List<String>> directives = Maps.newHashMap();
        for (Header header : headers) {
            for (String element : header.getValue().split(";")) {
                String[] parts = element.trim().split(" ", 2);
                String name = parts[0];
                String value = parts[1];
                List<String> entry = directives.get(name);
                if (entry != null) {
                    entry.add(value);
                } else {
                    directives.put(name, Lists.newArrayList(value));
                }
            }
        }
        return directives;
    }

    protected String getHost() throws Exception {
        return getTestServletConfig().getBaseUrl().getHost();
    }

    /**
     * Clear cookies from httpclient cookie store
     *
     * @throws Exception
     */
    protected void clearCookies() throws Exception {
        getCookieStore().clear();
    }

    /**
     * Adds cookie with name and value
     *
     * @param name cookie name
     * @param value cookie value
     * @throws Exception
     */
    protected void addCookie(String name, String value) throws Exception {
        BasicClientCookie cookie = makeCookie(name, value);
        addCookie(cookie);
    }

    /**
     * Adds cookie to httpclient cookie store
     *
     * @param domain cookie domain
     * @param name cookie name
     * @param value cookie value
     * @param path cookie path
     * @throws Exception
     */
    protected void addCookie(String domain, String name, String value, String path) throws Exception {
        BasicClientCookie cookie = makeCookie(domain, name, value, path);
        addCookie(cookie);
    }

    /**
     * Adds cookie to httpclient cookie store
     *
     * @param cookie cookie
     * @throws Exception
     */
    protected void addCookie(Cookie cookie) throws Exception {
        getCookieStore().addCookie(cookie);
    }

    /**
     * Creates HttpContext with httpclient cookie store. Allows cookies to be part of specific request method.
     *
     * @return http context
     * @throws Exception
     */
    protected HttpContext getHttpCookieContext() throws Exception {
        CookieStore cookieStore = getCookieStore();
        HttpContext localContext = new BasicHttpContext();
        localContext.setAttribute(ClientContext.COOKIE_STORE, cookieStore);
        return localContext;
    }

    /**
     * Checks there is no cookie in httpclient cookie store
     *
     * @param domain cookie domain
     * @param name cookie name
     * @param path cookie path
     * @throws Exception
     */
    protected void assertNoCookie(String domain, String name, String path) throws Exception {
        Cookie expected = makeCookie(domain, name, null, path);
        for (Cookie cookie : getCookies()) {
            if (expected.equals(cookie)) {
                fail("Cookie was not deleted: " + cookie);
            }
        }
    }

    /**
     * Checks for cookie
     *
     * @param domain cookie domain
     * @param name cookie name
     * @param value cookie value
     * @param path cookie path
     * @throws Exception
     */
    protected void assertCookie(String domain, String name, String path, String value) throws Exception {
        Cookie expected = makeCookie(domain, name, value, path);
        for (Cookie cookie : getCookies()) {
            if (expected.equals(cookie)) {
                assertEquals("Wrong cookie value!", expected.getValue(), cookie.getValue());
                return;
            }
        }
        fail("Missing cookie, expected " + expected);
    }

    /**
     * Creates cookie with only provided name and value
     *
     * @param name cookie name
     * @param value cookie value
     * @return
     */
    protected BasicClientCookie makeCookie(String name, String value) throws Exception {
        BasicClientCookie cookie = makeCookie(getHost(), name, value, "/");
        return cookie;
    }

    /**
     * Creates cookie
     *
     * @param domain cookie domain
     * @param name cookie name
     * @param value cookie value
     * @param path cookie path
     * @return
     */
    protected BasicClientCookie makeCookie(String domain, String name, String value, String path) {
        BasicClientCookie cookie = new BasicClientCookie(name, value);
        cookie.setDomain(domain);
        cookie.setPath(path);
        return cookie;
    }

    /**
     * Gets all cookies in httpclient cookie store
     *
     * @return cookies
     * @throws Exception
     */
    protected List<Cookie> getCookies() throws Exception {
        return getCookieStore().getCookies();
    }

    /**
     * Gets httpclient cookie store
     *
     * @return cookie store
     * @throws Exception
     */
    protected CookieStore getCookieStore() throws Exception {
        return ((DefaultHttpClient) getHttpClient()).getCookieStore();
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
    protected HttpPost obtainPostMethod(String path, Map<String, String> params)
            throws MalformedURLException, URISyntaxException, UnsupportedEncodingException {

        HttpPost post = new HttpPost(getTestServletConfig().getBaseUrl().toURI().resolve(path).toString());

        List<NameValuePair> nvps = Lists.newArrayList();
        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
            }
            post.setEntity(new UrlEncodedFormEntity(nvps, CharEncoding.UTF_8));

        }
        return post;
    }

    /**
     * Convenience method for executing an Action
     *
     * @param serverControllerClass controller class
     * @param methodName name of controller action method
     * @return a {@link HttpPost}
     * @throws Exception
     */
    protected HttpPost executeAuraAction(Class<?> serverControllerClass, String methodName,
            Map<String, String> actionParams, Map<String, String> postParams) throws Exception {
        Map<String, Object> message = new HashMap<>();
        Map<String, Object> actionInstance = new HashMap<>();
        String descriptor = "java://" + serverControllerClass.getCanonicalName() + "/ACTION$" + methodName;
        actionInstance.put("descriptor", descriptor);
        if (actionParams != null) {
            actionInstance.put("params", actionParams);
        }
        Map<?, ?>[] actions = { actionInstance };
        message.put("actions", actions);
        String jsonMessage = JsonEncoder.serialize(message);

        if (postParams == null) {
            postParams = Maps.newHashMap();
        }
        postParams.put("message", jsonMessage);
        if (!postParams.containsKey("aura.token")) {
            postParams.put("aura.token", configAdapter.getCSRFToken());
        }
        if (!postParams.containsKey("aura.context")) {
            postParams.put("aura.context",
                    contextService.getCurrentContext().serialize(EncodingStyle.Normal));
        }
        HttpPost post = obtainPostMethod("/aura", postParams);
        perform(post);
        post.releaseConnection();
        return post;
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

    protected HttpGet obtainGetMethod(String path, boolean followRedirects)
            throws MalformedURLException, URISyntaxException {
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
     * <li>aura.tag: the descriptor to get.</li>
     * <li>aura.defType: the type of the descriptor.</li>
     * <li>aura.context: the context, including
     * <ul>
     * <li>loaded: the descriptor + type from above.</li>
     * <li>fwUID: the framework UID</li>
     * <li>mode: from the parameters</li>
     * <li>format: from the parameters</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the name of the descriptor to set as the primary object.
     * @param type the type of descriptor.
     * @param params extra parameters to set.
     * @param headers extra headers.
     */
    protected HttpGet obtainAuraGetMethod(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            Map<String, String> params, Header[] headers)
                    throws QuickFixException, MalformedURLException, URISyntaxException {
        return obtainAuraGetMethod(mode, format, definitionService
                .getDefDescriptor(desc, type), params, headers);
    }

    /**
     * Build a URL for a get from the given parameters with all the standard parameters set from a descriptor.
     *
     * This is a convenience function to make gets more consistent. It sets:
     * <ul>
     * <li>aura.tag: the name of the descriptor to get.</li>
     * <li>aura.defType: the type of the descriptor.</li>
     * <li>aura.context: the context, including
     * <ul>
     * <li>loaded: the descriptor + type from above.</li>
     * <li>fwUID: the framework UID</li>
     * <li>mode: from the parameters</li>
     * <li>format: from the parameters</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param params extra parameters to set.
     * @param headers extra headers.
     */
    protected HttpGet obtainAuraGetMethod(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            Map<String, String> params, Header[] headers)
                    throws QuickFixException, MalformedURLException, URISyntaxException {
        List<NameValuePair> urlparams = Lists.newArrayList();
        urlparams.add(new BasicNameValuePair("aura.tag", String.format("%s:%s", desc.getNamespace(), desc.getName())));
        urlparams.add(new BasicNameValuePair("aura.defType", desc.getDefType().toString()));

        for (Map.Entry<String, String> entry : params.entrySet()) {
            urlparams.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }
        urlparams.add(
                new BasicNameValuePair("aura.context", getAuraTestingUtil().getContextURL(mode, format, desc, false)));
        String query = URLEncodedUtils.format(urlparams, "UTF-8");

        // final url Request to be send to server
        return obtainGetMethod("aura?" + query, true, headers);
    }

    public class ServerAction implements Action {

        private final ArrayList<String> qualifiedName;
        private List<Map<String, Object>> actionParams = new ArrayList<>();
        private State state = State.NEW;
        private Object returnValue;
        private List<Object> errors;
        private HttpPost post;
        private String rawResponse;
        private final List<State> stateList = new ArrayList<>();
        private final List<List<Object>> errorsList = new ArrayList<>();
        private final List<Object> returnValueList = new ArrayList<>();
        private final List<String> dn = new ArrayList<>();
        private DefDescriptor<? extends BaseComponentDef> app;
        private final Mode mode = Mode.DEV;

        public ServerAction(String qualifiedName, Map<String, Object> actionParams) {
            this.qualifiedName = new ArrayList<>();
            this.qualifiedName.add(qualifiedName);
            if (actionParams != null) {
                this.actionParams.add(actionParams);
            } else {
                this.actionParams.add(null);
            }
        }

        /**
         * Constructor for Server action using two array lists Note that each list must be of equal length or will throw
         * an IllegalArgumentException
         *
         * @param qualifiedName
         * @param actionParams
         */
        public ServerAction(ArrayList<String> qualifiedName, ArrayList<Map<String, Object>> actionParams) {
            this.qualifiedName = qualifiedName;
            this.actionParams = actionParams;
            if (qualifiedName == null || actionParams == null) {
                throw new IllegalArgumentException(
                        "Cannot pass in a null list. You can pass in a list of null parameters if parameters are not yet known");
            }
            // Now will verify that we have actions and params
            if (this.qualifiedName.toArray().length != this.actionParams.toArray().length) {
                throw new IllegalArgumentException("Number of action names does not match number of action parameters");
            }
        }

        /**
         * Will insert the given key-value pair as a parameter in the first entry of the action parameters list.
         * Corresponds with the first entry in the qualified names list.
         *
         * @param name Description of parameter
         * @param value Object of action parameter
         * @return Returns instance of Server Action
         */
        public ServerAction putParam(String name, Object value) {
            if (actionParams.get(0) == null) {
                actionParams.add(0, Maps.newHashMap(new HashMap<String, Object>()));
            }
            actionParams.get(0).put(name, value);
            return this;
        }

        public ServerAction addDynamicName(String name) {
            dn.add(name);
            return this;
        }

        public ServerAction setApp(String name, Class<? extends BaseComponentDef> clazz) {
            app = definitionService.getDefDescriptor(name, clazz);
            return this;
        }

        /**
         * Will insert the given key-value pair as a parameter for the given qualified name. Throws
         * IllegalArguementException if qualified name is not found. Cannot distinguish between multiple qualified names
         * with the same name.
         *
         * @param qualifiedName The name of the qualified Name you are adding a parameter for.
         * @param name Description of the parameter
         * @param value Object of the action parameter
         * @return Returns instance of Server Action
         */
        public ServerAction putParamUsingQName(String qualifiedName, String name, Object value) {
            int index = this.qualifiedName.indexOf(qualifiedName);
            if (index < 0) {
                throw new IllegalArgumentException("Qualified name does not exist.");
            }
            if (actionParams.get(index) == null) {
                actionParams.add(index, Maps.newHashMap(new HashMap<String, Object>()));
            }
            actionParams.get(index).put(name, value);
            return this;
        }

        public HttpPost getPostMethod() throws Exception {
            if (post == null) {
                Map<String, Object> message = Maps.newHashMap();
                ArrayList<Map<String, Object>> actionInstanceArray = new ArrayList<>();
                for (int i = 0; i < qualifiedName.size(); i++) {
                    Map<String, Object> actionInstance = Maps.newHashMap();
                    actionInstance.put("descriptor", qualifiedName.get(i));
                    if (actionParams.get(i) != null) {
                        actionInstance.put("params", actionParams.get(i));
                    }
                    actionInstanceArray.add(actionInstance);
                }
                if (app == null) {
                    app = definitionService.getDefDescriptor("aura:application",
                            ApplicationDef.class);
                }
                message.put("actions", actionInstanceArray.toArray());
                String jsonMessage = JsonEncoder.serialize(message);
                Map<String, String> params = Maps.newHashMap();
                params.put("message", jsonMessage);
                params.put("aura.token", configAdapter.getCSRFToken());

                params.put("aura.context", getAuraTestingUtil().buildContextForPost(mode, app, null, dn));
                post = obtainPostMethod("/aura", params);
            }
            return post;
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return definitionService.getDefDescriptor(qualifiedName.get(0),
                    ActionDef.class);
        }

        public ArrayList<String> getQualifiedName() {
            return qualifiedName;
        }

        public DefDescriptor<ActionDef> getDescriptor(String qualifiedName) {
            return definitionService.getDefDescriptor(qualifiedName, ActionDef.class);
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
                if (rawResponse.endsWith("/*ERROR*/")) {
                    fail("Error response:" + rawResponse);
                }
                Map<String, Object> json = (Map<String, Object>) new JsonReader()
                .read(rawResponse.substring(AuraBaseServlet.CSRF_PROTECT.length()));
                ArrayList<Map<String, Object>> actions = (ArrayList<Map<String, Object>>) json.get("actions");
                for (Map<String, Object> action : actions) {

                    this.stateList.add(State.valueOf(action.get("state").toString()));
                    this.returnValueList.add(action.get("returnValue"));
                    this.errorsList.add((List<Object>) action.get("error"));
                }
                // for legacy uses
                Map<String, Object> action = (Map<String, Object>) ((List<Object>) json.get("actions")).get(0);
                this.state = State.valueOf(action.get("state").toString());
                this.returnValue = action.get("returnValue");
                this.errors = (List<Object>) action.get("error");

            } catch (Exception e) {
                throw new AuraExecutionException(e, null);
            }
        }

        @Override
        public void setup(){
            //do nothing
        }

        @Override
        public void cleanup(){
            //do nothing
        }

        public String getRawResponse() {
            return this.rawResponse;
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

        public List<Object> getReturnValueList() {
            return returnValueList;
        }

        @Override
        public State getState() {
            return state;
        }

        public List<State> getStateList() {
            return stateList;
        }

        @Override
        public List<Object> getErrors() {
            return errors;
        }

        public List<List<Object>> getErrorsList() {
            return errorsList;
        }

        @Override
        public void logParams(KeyValueLogger paramLogger) {
            // not implemented
        }

        @Override
        public boolean isStorable() {
            return false;
        }

        @Override
        public void setStorable() {
        }

        @Override
        public Map<String, Object> getParams() {
            return null;
        }

        private final InstanceStack instanceStack = new InstanceStack();

        @Override
        public InstanceStack getInstanceStack() {
            return instanceStack;
        }

        @Override
        public String getPath() {
            return getId();
        }

        @Override
        public DefDescriptor<ComponentDef> getCallingDescriptor() {
            return null;
        }

        @Override
        public void setCallingDescriptor(DefDescriptor<ComponentDef> descriptor) {
        }

        @Override
        public String getCallerVersion() {
            return null;
        }

        @Override
        public void setCallerVersion(String callerVersion) {
        }
    }
}
