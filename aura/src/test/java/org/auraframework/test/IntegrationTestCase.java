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
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;

import org.apache.http.*;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.entity.ContentType;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.CSP;
import org.auraframework.service.ContextService;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.IntegrationTest;
import org.auraframework.test.configuration.TestServletConfig;
import org.auraframework.throwable.quickfix.QuickFixException;

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
        AuraContext ctxt = contextService.startContext(mode, format, Authentication.AUTHENTICATED, desc);
        ctxt.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
        String uid = ctxt.getDefRegistry().getUid(null, desc);
        ctxt.addLoaded(desc, uid);
        return ctxt;
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
    protected HttpGet obtainGetMethod(String path, boolean followRedirects,
            Header[] headers) throws MalformedURLException, URISyntaxException {
        String url = getTestServletConfig().getBaseUrl().toURI().resolve(path)
                .toString();

        HttpGet get = new HttpGet(url);
        HttpParams params = get.getParams();
        HttpClientParams.setRedirecting(params, followRedirects);

        if (headers != null) {
            get.setHeaders(headers);
        }

        return get;
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
        HttpResponse response = getHttpClient().execute(method, context);
        Header cspHeaders[] = response.getHeaders(CSP.Header.REPORT_ONLY);
        if (response.getStatusLine().getStatusCode() == 200) {
            // TODO(fabbott): Although a request for e.g. moment.js from testSetRunner.app
            // does have a header, the same request from AuraFrameworkServletHttpTest does
            // not.  I suspect this is because the test has no UID, but the "real life" one
            // does... but for now, let's validate the CSP header only if it's actually there.
            if (cspHeaders.length != 0) {
                assertEquals(1, cspHeaders.length);
                assertTrue("No connect-src in default CSP",
                        cspHeaders[0].getValue().contains("; connect-src 'self';"));
            }
        }
        return response;
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
