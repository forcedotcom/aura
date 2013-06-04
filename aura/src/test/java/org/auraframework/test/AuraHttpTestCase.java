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

import java.net.URI;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.client.CookieStore;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.cookie.BasicClientCookie;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;

import org.auraframework.def.ApplicationDef;

import org.auraframework.service.ContextService;

import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.ThreadHostileTest;

import org.auraframework.throwable.AuraRuntimeException;

/**
 * Base class with some helper methods specific to Aura.
 */
@ThreadHostileTest
public abstract class AuraHttpTestCase extends IntegrationTestCase {
    public AuraHttpTestCase(String name) {
        super(name);
    }

    private String originalUserAgent;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        originalUserAgent = System.getProperty(CoreProtocolPNames.USER_AGENT);
    }

    @Override
    public void tearDown() throws Exception {
        if (originalUserAgent == null) {
            System.clearProperty(CoreProtocolPNames.USER_AGENT);
        } else {
            System.setProperty(CoreProtocolPNames.USER_AGENT, originalUserAgent);
        }
        super.tearDown();
    }

    /**
     * Given a URL to post a GET request, this method compares the actual status
     * code of the response with an expected status code.
     * 
     * @param msg Error message that should be displayed if the actual response
     *            does not match the expected response
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

    protected String getHost() throws Exception {
        return servletConfig.getBaseUrl().getHost();
    }

    /**
     * Clear cookies from httpclient cookie store
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
     * @param cookie cookie
     * @throws Exception
     */
    protected void addCookie(Cookie cookie) throws Exception {
        getCookieStore().addCookie(cookie);
    }

    /**
     * Creates HttpContext with httpclient cookie store. Allows cookies to be part of specific request method.
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
     * @param domain cookie domain
     * @param name cookie name
     * @param value cookie value
     * @param path cookie path
     * @throws Exception
     */
    protected void assertCookie(String domain, String name, String path, String value) throws Exception {
        Cookie expected = makeCookie(domain, name, value, path);
        for (Cookie cookie :getCookies()) {
            if (expected.equals(cookie)) {
                assertEquals("Wrong cookie value!", expected.getValue(), cookie.getValue());
                return;
            }
        }
        fail("Missing cookie, expected " + expected);
    }

    /**
     * Creates cookie with only provided name and value
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
     * @return cookies
     * @throws Exception
     */
    protected List<Cookie> getCookies() throws Exception {
        return getCookieStore().getCookies();
    }

    /**
     * Gets httpclient cookie store
     * @return cookie store
     * @throws Exception
     */
    protected CookieStore getCookieStore() throws Exception {
        return ((DefaultHttpClient) getHttpClient()).getCookieStore();
    }

    /**
     * This gets a simple context string that uses a single preload.
     */
    protected String getSimpleContext(Format format, boolean modified) throws Exception {
        ContextService contextService = Aura.getContextService();
        String ctxtString;
        AuraContext ctxt = contextService.startContext(Mode.DEV, format, Access.AUTHENTICATED,
                                    Aura.getDefinitionService().getDefDescriptor("auratest:test_SimpleServerRenderedPage",
                                                                                 ApplicationDef.class));
        ctxt.addPreload("preloadTest");
        ctxt.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
        ctxtString = getSerializedAuraContextWithModifiedUID(ctxt, modified);
        contextService.endContext();
        return ctxtString;
    }


    protected String getSerializedAuraContext(AuraContext ctx) throws Exception {
        StringBuilder sb = new StringBuilder();
        try {
            Aura.getSerializationService().write(ctx, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
        return sb.toString();
    }

    protected String getSerializedAuraContextWithModifiedUID(AuraContext ctx, boolean modify) throws Exception {
        String uid;
        if (modify) {
            uid = getModifiedAppUID();
        } else {
            uid = getAppUID(ctx);
        }
        ctx.addLoaded(ctx.getApplicationDescriptor(), uid);
        return getSerializedAuraContext(ctx);
    }

    protected String getAppUID() throws Exception {
        return getAppUID(Aura.getContextService().getCurrentContext());
    }

    protected String getAppUID(AuraContext ctxt) throws Exception {
        return ctxt.getDefRegistry().getUid(null, ctxt.getApplicationDescriptor());
    }

    protected String getModifiedAppUID(String old) throws Exception {
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

    protected String getModifiedAppUID() throws Exception {
        return getModifiedAppUID(getAppUID());
    }

}
