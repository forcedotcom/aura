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

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;

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
        originalUserAgent = System.getProperty(HttpMethodParams.USER_AGENT);
    }

    @Override
    public void tearDown() throws Exception {
        if (originalUserAgent == null) {
            System.clearProperty(HttpMethodParams.USER_AGENT);
        } else {
            System.setProperty(HttpMethodParams.USER_AGENT, originalUserAgent);
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
        GetMethod get = obtainGetMethod(new URI(null, url, null).toString());
        int status = this.getHttpClient().executeMethod(get);
        assertEquals(msg, statusCode, status);
    }

    protected String getHost() throws Exception {
        return servletConfig.getBaseUrl().getHost();
    }

    protected void clearCookies() throws Exception {
        getHttpClient().getState().clearCookies();
    }

    protected void addCookie(String domain, String name, String value, String path) throws Exception {
        getHttpClient().getState().addCookie(new Cookie(domain, name, value, path, null, false));
    }

    protected void assertNoCookie(String domain, String name, String path) throws Exception {
        Cookie expected = new Cookie(domain, name, null, path, 0, false);
        for (Cookie cookie : getHttpClient().getState().getCookies()) {
            if (expected.equals(cookie)) {
                fail("Cookie was not deleted: " + cookie);
            }
        }
    }

    protected void assertCookie(String domain, String name, String path, String value) throws Exception {
        Cookie expected = new Cookie(domain, name, value, path, 0, false);
        for (Cookie cookie : getHttpClient().getState().getCookies()) {
            if (expected.equals(cookie)) {
                assertEquals("Wrong cookie value!", expected.getValue(), cookie.getValue());
                return;
            }
        }
        fail("Missing cookie, expected " + expected);
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
