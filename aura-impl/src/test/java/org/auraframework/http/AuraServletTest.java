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
package org.auraframework.http;

import java.util.List;

import javax.inject.Inject;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.AuraConfiguration;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletConfig;
import org.springframework.mock.web.MockServletContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.GenericWebApplicationContext;

import test.org.auraframework.impl.adapter.ConfigAdapterImpl;

public class AuraServletTest extends UnitTestCase {

    @Inject
    private ContextService contextService;

    private AuraServlet servlet;

    @Mock
    private ServletUtilAdapter servletUtilAdapter;

    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();

        MockServletContext servletContext = new MockServletContext();
        MockServletConfig servletConfig = new MockServletConfig(servletContext);

        AnnotationConfigApplicationContext appContext = new AnnotationConfigApplicationContext(AuraConfiguration.class, ConfigAdapterImpl.class);
        DefaultListableBeanFactory dlbf = new DefaultListableBeanFactory(appContext.getBeanFactory());
        GenericWebApplicationContext gwac = new GenericWebApplicationContext(dlbf);
        servletContext.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, gwac);
        gwac.setServletContext(servletContext);
        gwac.refresh();

        servlet = new AuraServlet();
        servlet.init(servletConfig);
        servlet.setServletUtilAdapter(servletUtilAdapter);
    }

    @Override
    public void tearDown() throws Exception {
        contextService.endContext();
        super.tearDown();
    }

    /*
     * The handling of standard ports may vary (in .getRequestURL) according to the version of MockHttpServletRequest
     * provided, so just use a non-standard port.
     */
    private MockHttpServletRequest getBaseAuraRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setScheme("http");
        request.setServerName("server");
        request.setServerPort(9090);
        request.setRequestURI("/aura");
        request.addParameter("aura.tag", "aura:text");
        return request;
    }

    private void assertSingleHeader(MockHttpServletResponse response, String name, String value) {
        List<String> headers = response.getHeaders(name);
        assertEquals(String.format("Unexpected number of '%s' headers", name), 1, headers.size());
        assertEquals(String.format("Unexpected value for '%s' header", name), value, headers.get(0));
    }
    
    @Mock
    private ConfigAdapter configAdapter;
    @Mock
    private DefinitionService definitionService;
    @Mock
    private SerializationService serializationService;
    
    /*
     * This test verify that we do definitionService.updateLoaded before serializationService.read, 
     * when action from client arrives, if the client is running out-dated code, we will throw COOS to force it reload, 
     * before the fix we always do de-serialization first, it could give us QFE, which leads to tons of Gack every release) 
     * automation for W-3360478.
     */
    @Test
    public void testDoPost_CoosBeforeQFE() throws Exception {
        DefDescriptor<ApplicationDef> applicationDescriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(applicationDescriptor.getDefType()).thenReturn(DefDescriptor.DefType.APPLICATION);
    	contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED, applicationDescriptor);
        
        AuraContext auracontext = contextService.getCurrentContext();
        
        auracontext.setFrameworkUID("testFWUID");
        Mockito.when(configAdapter.getAuraFrameworkNonce()).thenReturn("testFWUID");
        
    	MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setScheme("http");
        request.setServerName("server");
        request.setServerPort(9090);
        request.setRequestURI("/aura");
        request.setParameter("JavaTest.echoText", "1");
        request.setParameter("message", "{action:blablabla}");
        MockHttpServletResponse response = new MockHttpServletResponse();

        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);
        
        ClientOutOfSyncException coos = new ClientOutOfSyncException("throw from test");
        Mockito.doThrow(coos).when(definitionService).updateLoaded(Mockito.any());        
        
        DefinitionNotFoundException qfe = Mockito.mock(DefinitionNotFoundException.class);
		Mockito.doThrow(qfe).when(serializationService).read(Mockito.any(), Mockito.any());
        
        servlet.setSerializationService(serializationService);
        servlet.setServletUtilAdapter(servletUtilAdapter);
        servlet.setConfigAdapter(configAdapter);
        servlet.setDefinitionService(definitionService);
        servlet.doPost(request, response);
        
        Mockito.verify(servletUtilAdapter).handleServletException(coos, false, auracontext, request, response, false);  
        Mockito.verify(serializationService, Mockito.never()).read(Mockito.any(), Mockito.any());
    }

    @Test
    public void testDoGet_NoCacheStartsWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/path?q1=v1+&q2=+v2&q3=v1+v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/path?q1=v1+&q2=+v2&q3=v1+v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheIsRoot() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    /**
     * This handles a Chrome (or maybe WebKit) bug where a Location semi-correctly beginning with a double or more slash
     * is taken as a hostname (i.e. as if it were http: + the location),
     */
    @Test
    public void testDoGet_NoCacheDoubleSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "http://host//somepath");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090//somepath");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheNoFragment() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/?q");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/?q");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheNoQuery() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheDoesNotStartWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "urlisnotabsolute");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheUriExploit() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "@exploit/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheInvalid() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "://:@:/");

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheHttpsToHttp() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.setScheme("https");
        request.setServerPort(7443);
        request.addParameter("nocache", "http://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:7443/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheHttpToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:9090/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheHttpsToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.setScheme("https");
        request.setServerPort(7443);
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:7443/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    @Ignore("W-3041937: of most concern when switching to https, if request or redirect are on non-standard ports")
    public void _testDoGet_NoCacheRetainsRequestAuthority() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:9090/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    @Test
    public void testDoGet_NoCacheEmpty() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);
        Mockito.when(servletUtilAdapter.isValidDefType(Matchers.any(), Matchers.any())).thenReturn(false); // trigger 404
                                                                                                         // below

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        // def type check occurs after nocache processing
        Mockito.verify(servletUtilAdapter).send404(Matchers.any(), Matchers.eq(request), Matchers.eq(response));
    }

    @Test
    public void testDoGet_NoCacheNull() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);
        Mockito.when(servletUtilAdapter.isValidDefType(Matchers.any(), Matchers.any())).thenReturn(false); // trigger 404
                                                                                                         // below

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", (String)null);
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        // def type check occurs after nocache processing
        Mockito.verify(servletUtilAdapter).send404(Matchers.any(), Matchers.eq(request), Matchers.eq(response));
    }

    @Test
    public void testDoGet_NoCacheNoPath() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);
        Mockito.when(servletUtilAdapter.isValidDefType(Matchers.any(), Matchers.any())).thenReturn(false);

        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "mailto:java-net@java.sun.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        servlet.doGet(request, response);

        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }
}
