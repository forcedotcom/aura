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

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.entity.ContentType;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.integration.test.configuration.JettyTestServletConfig;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.IntegrationTest;
import org.auraframework.util.test.configuration.TestServletConfig;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.ContextLoader;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;

/**
 * Base class for all Aura integration tests.
 */
@SuppressWarnings("deprecation")
@IntegrationTest
public abstract class IntegrationTestCase extends AuraImplTestCase {

    private TestServletConfig testServletConfig;
    
    private HttpClient httpClient = null;

    protected IntegrationTestCase() {
        setShouldSetupContext(false);
    }

    @Override
    protected void establishSpringContext() {
        if (applicationContext == null) {
            if (ContextLoader.getCurrentWebApplicationContext() == null) {
                try {
                    synchronized (IntegrationTestCase.class) {
                        // the test servlet starts up the jetty web server
                        testServletConfig = new JettyTestServletConfig();
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
            applicationContext = ContextLoader.getCurrentWebApplicationContext();
        }
    }

    public void setApplicationContext(ApplicationContext appContext) {
        applicationContext = appContext;
    }

    @Override
    protected void injectBeans() throws Exception {
        super.injectBeans();
        if (testServletConfig == null) {
            // we are likely running from test/runner.app and the web app context already existed
            // this will not start up a server, but assume defaults
            testServletConfig = applicationContext.getAutowireCapableBeanFactory().getBean(TestServletConfig.class);
        }
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

    /**
     * Start a context and set up default values.
     */
    protected AuraContext setupContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc)
            throws QuickFixException {
        AuraContext ctxt = contextService.startContext(mode, format, Authentication.AUTHENTICATED, desc);
        ctxt.setFrameworkUID(configAdapter.getAuraFrameworkNonce());
        String uid = definitionService.getUid(null, desc);
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
            Header[] headers) throws Exception {
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

    protected TestServletConfig getTestServletConfig() throws Exception {
        if (testServletConfig == null) {
            injectBeans();
        }
        return testServletConfig;
    }
}
