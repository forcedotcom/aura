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
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

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
import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Base class with some helper methods specific to Aura.
 */
public abstract class AuraHttpTestCase extends IntegrationTestCase {
	private static final String SAMEORIGIN = "SAMEORIGIN";
	private static final String X_FRAME_OPTIONS = "X-FRAME-OPTIONS";
	    
    public AuraHttpTestCase(String name) {
        super(name);
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
    protected void assertUrlResponse(String msg, String url, int statusCode)
            throws Exception {
        HttpGet get = obtainGetMethod(new URI(null, url, null).toString());
        HttpResponse httpResponse = perform(get);
        EntityUtils.consume(httpResponse.getEntity());
        get.releaseConnection();
        int status = getStatusCode(httpResponse);
        assertEquals(msg, statusCode, status);
    }
    
    protected void assertAntiClickjacking(HttpResponse response) {
    	assertTrue(response.getFirstHeader(X_FRAME_OPTIONS) != null);
    	assertEquals("Failed to use anti-clickjacking " + X_FRAME_OPTIONS, 
                SAMEORIGIN, response.getFirstHeader(X_FRAME_OPTIONS).getValue());
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
    protected void addCookie(String domain, String name, String value,
            String path) throws Exception {
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
    protected void assertNoCookie(String domain, String name, String path)
            throws Exception {
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
    protected void assertCookie(String domain, String name, String path,
            String value) throws Exception {
        Cookie expected = makeCookie(domain, name, value, path);
        for (Cookie cookie : getCookies()) {
            if (expected.equals(cookie)) {
                assertEquals("Wrong cookie value!", expected.getValue(),
                        cookie.getValue());
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
    protected BasicClientCookie makeCookie(String name, String value)
            throws Exception {
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
    protected BasicClientCookie makeCookie(String domain, String name,
            String value, String path) {
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
     * This gets a simple context string that uses a single preload.
     */
    protected String getSimpleContext(Format format, boolean modified)
            throws Exception {
        return getAuraTestingUtil().getContext(Mode.DEV, format,
                "auratest:test_SimpleServerRenderedPage", ApplicationDef.class,
                modified);
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
            throws MalformedURLException, URISyntaxException,
            UnsupportedEncodingException {
        HttpPost post = new HttpPost(getTestServletConfig().getBaseUrl()
                .toURI().resolve(path).toString());

        List<NameValuePair> nvps = Lists.newArrayList();
        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                nvps.add(new BasicNameValuePair(entry.getKey(), entry
                        .getValue()));
            }
            post.setEntity(new UrlEncodedFormEntity(nvps, CharEncoding.UTF_8));

        }
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
    protected HttpGet obtainGetMethod(String path)
            throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, true, null);
    }

    protected HttpGet obtainGetMethod(String path, boolean followRedirects)
            throws MalformedURLException, URISyntaxException {
        return obtainGetMethod(path, followRedirects, null);
    }

    protected HttpGet obtainGetMethod(String path, Header[] headers)
            throws MalformedURLException, URISyntaxException {
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
     * @param desc the name of the descriptor to set as the primary object.
     * @param type the type of descriptor.
     * @param params extra parameters to set.
     * @param headers extra headers.
     */
    protected HttpGet obtainAuraGetMethod(Mode mode, Format format,
            String desc, Class<? extends BaseComponentDef> type,
            Map<String, String> params, Header[] headers)
            throws QuickFixException, MalformedURLException, URISyntaxException {
        return obtainAuraGetMethod(mode, format, Aura.getDefinitionService()
                .getDefDescriptor(desc, type), params, headers);
    }

    /**
     * Build a URL for a get from the given parameters with all the standard parameters set from a descriptor.
     *
     * This is a convenience function to make gets more consistent. It sets:
     * <ul>
     *   <li>aura.tag: the name of the descriptor to get.</li>
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
     * @param params extra parameters to set.
     * @param headers extra headers.
     */
    protected HttpGet obtainAuraGetMethod(Mode mode, Format format,
            DefDescriptor<? extends BaseComponentDef> desc,
            Map<String, String> params, Header[] headers)
            throws QuickFixException, MalformedURLException, URISyntaxException {
        List<NameValuePair> urlparams = Lists.newArrayList();
        urlparams.add(new BasicNameValuePair("aura.tag", String.format("%s:%s",
                desc.getNamespace(), desc.getName())));
        urlparams.add(new BasicNameValuePair("aura.defType", desc.getDefType()
                .toString()));

        for (Map.Entry<String, String> entry : params.entrySet()) {
            urlparams.add(new BasicNameValuePair(entry.getKey(), entry
                    .getValue()));
        }
        urlparams.add(new BasicNameValuePair("aura.context",
                getAuraTestingUtil().getContext(mode, format, desc, false)));
        String query = URLEncodedUtils.format(urlparams, "UTF-8");

        // final url Request to be send to server
        return obtainGetMethod("aura?" + query, true, headers);
    }

    public class ServerAction implements Action {

        private final String qualifiedName;
        private Map<String, Object> actionParams;
        private State state = State.NEW;
        private Object returnValue;
        private List<Object> errors;
        private HttpPost post;
        private String rawResponse;
        private String contextValue;

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

        public ServerAction setContext(String value) {
            contextValue = value;
            return this;
        }

        public HttpPost getPostMethod() throws Exception {
            if (post == null) {
                Map<String, Object> message = Maps.newHashMap();
                Map<String, Object> actionInstance = Maps.newHashMap();
                actionInstance.put("descriptor", qualifiedName);
                if (actionParams != null) {
                    actionInstance.put("params", actionParams);
                }
                message.put("actions", new Map[] { actionInstance });
                String jsonMessage = Json.serialize(message);
                Map<String, String> params = Maps.newHashMap();
                params.put("message", jsonMessage);
                params.put("aura.token", getTestServletConfig().getCsrfToken());

                if (contextValue != null) {
                    params.put("aura.context", contextValue);
                } else {
                    AuraContext context = Aura.getContextService().getCurrentContext();
                    if (context != null) {
                        StringBuilder sb = new StringBuilder();
                        context.setSerializeLastMod(false);
                        context.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
                        Aura.getSerializationService().write(context, null, AuraContext.class, sb, "HTML");
                        params.put("aura.context", sb.toString());
                    } else {
                        params.put("aura.context", getSimpleContext(Format.JSON, false));
                    }
                }
                post = obtainPostMethod("/aura", params);
            }
            return post;
        }

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            return Aura.getDefinitionService().getDefDescriptor(qualifiedName,
                    ActionDef.class);
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
                assertEquals(
                        AuraBaseServlet.CSRF_PROTECT,
                        rawResponse.substring(0,
                                AuraBaseServlet.CSRF_PROTECT.length()));
                Map<String, Object> json = (Map<String, Object>) new JsonReader()
                        .read(rawResponse
                                .substring(AuraBaseServlet.CSRF_PROTECT
                                        .length()));
                Map<String, Object> action = (Map<String, Object>) ((List<Object>) json
                        .get("actions")).get(0);
                this.state = State.valueOf(action.get("state").toString());
                this.returnValue = action.get("returnValue");
                this.errors = (List<Object>) action.get("error");
            } catch (Exception e) {
                throw new AuraExecutionException(e, null);
            }
        }
        
        public String getrawResponse() {
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

        @Override
        public State getState() {
            return state;
        }

        @Override
        public List<Object> getErrors() {
            return errors;
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
    }
}
