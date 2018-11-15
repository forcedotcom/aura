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

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.sameInstance;
import static org.junit.Assert.assertThat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.AuraConfiguration;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.SerializationService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraRequestInputException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
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
    
    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Inject
    private ContextService contextService;

    @Mock
    private ServerService serverService;

    private AuraServlet originalServlet;

    private AuraServlet servlet;

    private AnnotationConfigApplicationContext appContext;
    
    private GenericWebApplicationContext gwac;

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

        appContext = new AnnotationConfigApplicationContext(AuraConfiguration.class, ConfigAdapterImpl.class);
        DefaultListableBeanFactory dlbf = new DefaultListableBeanFactory(appContext.getBeanFactory());
        gwac = new GenericWebApplicationContext(dlbf);
        servletContext.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, gwac);
        gwac.setServletContext(servletContext);
        gwac.refresh();

        originalServlet = new AuraServlet();
        originalServlet.init(servletConfig);
        originalServlet.setServletUtilAdapter(servletUtilAdapter);
        originalServlet.setSerializationService(serializationService);
        originalServlet.setConfigAdapter(configAdapter);
        originalServlet.setDefinitionService(definitionService);
        originalServlet.setServerService(serverService);
        originalServlet.setInstanceService(instanceService);
        servlet = Mockito.spy(originalServlet);
    }

    @Override
    public void tearDown() throws Exception {
        contextService.endContext();
        appContext.close();
        gwac.close();
        super.tearDown();
    }

    /*
     * The handling of standard ports may vary (in .getRequestURL) according to the version of MockHttpServletRequest
     * provided, so just use a non-standard port.
     */
    private static MockHttpServletRequest getBaseAuraRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setScheme("http");
        request.setServerName("server");
        request.setServerPort(9090);
        request.setRequestURI("/aura");
        request.addParameter("aura.tag", "aura:text");
        return request;
    }
    
    /*
     * Returns a mock action with the given name
     */
    @SuppressWarnings("unchecked")
    private static Action getAction(String name) {
        DefDescriptor<ActionDef> actionDescriptor = Mockito.mock(DefDescriptor.class);
        Action action = Mockito.mock(Action.class);
        Mockito.when(action.getDescriptor()).thenReturn(actionDescriptor);
        Mockito.when(actionDescriptor.getQualifiedName()).thenReturn(name);
        return action;
    }
    
    /*
     * Returns a mock action with the given name
     */
    @SuppressWarnings("unchecked")
    private static ActionDef getActionDef(String name) {
        DefDescriptor<ActionDef> actionDescriptor = Mockito.mock(DefDescriptor.class);
        ActionDef actionDef = Mockito.mock(ActionDef.class);
        Mockito.when(actionDef.getDescriptor()).thenReturn(actionDescriptor);
        Mockito.when(actionDescriptor.getQualifiedName()).thenReturn(name);
        return actionDef;
    }
    
    /*
     * Starts authenticated context and sets framework UID. 
     */
    private AuraContext startContext() {
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> applicationDescriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(applicationDescriptor.getDefType()).thenReturn(DefDescriptor.DefType.APPLICATION);
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED, applicationDescriptor);
        
        AuraContext auracontext = contextService.getCurrentContext();
        
        auracontext.setFrameworkUID("testFWUID");
        Mockito.when(configAdapter.getAuraFrameworkNonce()).thenReturn("testFWUID");

        return auracontext;
    }

    private static void assertSingleHeader(MockHttpServletResponse response, String name, String value) {
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
    @Mock
    private InstanceService instanceService;
    
    @Test
    public void testReadMessageNull() throws Exception {
        Message test = originalServlet.readMessage(null);
        assertNull("Null message should result in a null", test);
    }

    @Test
    public void testReadMessageEmpty() throws Exception {
        Message test = originalServlet.readMessage("");
        assertNull("Empty message should result in a null", test);
    }

    @Test
    public void testReadMessageEmptyObject() throws Exception {
        Message test = originalServlet.readMessage("{}");
        assertNotNull("Empty message object should result in a message", test);
        assertEquals(test.getActions().size(), 0);
    }

    @Test
    public void testReadMessageEmptyActions() throws Exception {
        Message test = originalServlet.readMessage("{actions:[]}");
        assertNotNull("Empty message actions should result in a message");
        assertEquals(test.getActions().size(), 0);
    }

    @Test
    public void testReadMessageBadJSON() throws Exception {
        JsonParseException expected = null;
        try {
            originalServlet.readMessage("{actions:[}");
        } catch (JsonParseException jpe) {
            expected = jpe;
        }
        assertNotNull("Bad JSON should result in an exception", expected);
    }
    
    @Test
    public void testReadMessageInvalidFormatJSON() throws QuickFixException {
        thrown.expect(AuraRequestInputException.class);
        thrown.expectMessage("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Data in a request must be a map of name-value pairs in JSON format\".");
        
        originalServlet.readMessage("3.141592653589793238462643383279");
    }

    @Test
    public void testReadMessageActionQFE() throws Exception {
        String actionName = "myAction";
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        QuickFixException actual = null;
        Message message = null;
        Mockito.doThrow(expected).when(definitionService).getDefinition(actionName, ActionDef.class);
        try {
            message = originalServlet.readMessage("{'actions':[{'descriptor':'"+actionName+"'}]}");
        } catch (QuickFixException qfe) {
            actual = qfe;
        }
        assertNull("should get no exception", actual);
        assertNotNull(message);
        assertEquals(0, message.getActions().size());
    }

    @Test
    public void testReadMessageActionInstanceQFE() throws Exception {
        String actionName = "myAction";
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        QuickFixException actual = null;
        ActionDef myActionDef = getActionDef(actionName);
        Mockito.doReturn(myActionDef).when(definitionService).getDefinition(actionName, ActionDef.class);
        Mockito.doThrow(expected).when(instanceService).getInstance(Matchers.eq(myActionDef), Matchers.any());
        try {
            originalServlet.readMessage("{'actions':[{'descriptor':'"+actionName+"'}]}");
        } catch (QuickFixException qfe) {
            actual = qfe;
        }
        assertSame("should get expected exception", expected, actual);
    }

    /**
     * This test verify that we do {@link DefinitionService#updateLoaded(DefDescriptor)} before message read, 
     * when action from client arrives, if the client is running out-dated code, we will throw COOS to force it reload, 
     * before the fix we always do de-serialization first, it could give us QFE, which leads to tons of Gack every release) 
     * automation for W-3360478.
     */
    @Test
    public void testDoPost_CoosBeforeQFE() throws Exception {
        @SuppressWarnings("unchecked")
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
        Mockito.doThrow(coos).when(definitionService).updateLoaded(Matchers.any(DefDescriptor.class));
        
        DefinitionNotFoundException qfe = Mockito.mock(DefinitionNotFoundException.class);
        Mockito.doThrow(qfe).when(servlet).readMessage(Matchers.any());
        
        servlet.doPost(request, response);
        
        Mockito.verify(servletUtilAdapter).handleServletException(coos, false, auracontext, request, response, false);
    }

    @Test
    public void testDoPost_WithNoBodyThrowsAuraHandledException() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> applicationDescriptor = Mockito.mock(DefDescriptor.class);
        Mockito.when(applicationDescriptor.getDefType()).thenReturn(DefDescriptor.DefType.APPLICATION);
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED, applicationDescriptor);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setScheme("http");
        request.setServerName("server");
        request.setServerPort(9090);
        request.setRequestURI("/aura");
        MockHttpServletResponse response = new MockHttpServletResponse();

        Mockito.when(servletUtilAdapter.actionServletGetPre(Matchers.any(), Matchers.any())).thenReturn(false);

        servlet.doPost(request, response);

        Mockito.verify(servletUtilAdapter).handleServletException(Matchers.isA(AuraHandledException.class), Matchers.anyBoolean(),
                Matchers.any(AuraContext.class), Matchers.any(), Matchers.any(), Matchers.anyBoolean());
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
    
    @Test
    public void testDoPostRunsMessage() throws Exception {
        // Arrange
        startContext();
        
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("aura.token", "token");
        request.setParameter("message", "someMessage");
        
        MockHttpServletResponse response = new MockHttpServletResponse();

        Message message = new Message(Arrays.asList(getAction("someAction")));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.any());

        // Act
        servlet.doPost(request, response);
        
        // Assert
        Mockito.verify(serverService).run(Matchers.same(message), Matchers.any(), Matchers.any(), Matchers.any());
    }
    
    @Test
    public void testDoGetActionFails() throws Exception {
        // Arrange
        startContext();
        
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("aura.token", "token");
        request.setParameter("aura.isAction", "true");
        request.setParameter("message", "someMessage");
        
        MockHttpServletResponse response = new MockHttpServletResponse();

        Message message = new Message(Arrays.asList(getAction("someAction")));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.any());

        Mockito.when(configAdapter.isActionPublicCachingEnabled()).thenReturn(true);

        // Act
        servlet.doGet(request, response);

        // Assert
        Mockito.verify(servletUtilAdapter).handleServletException(Matchers.any(), Matchers.anyBoolean(), Matchers.any(), Matchers.any(), Matchers.any(), Matchers.anyBoolean());
    }

    @Test
    public void testDoGetActionFailsWhenPublicCachingDisabled() throws Exception {
        // Arrange
        startContext();

        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("aura.token", "token");
        request.setParameter("aura.isAction", "true");
        request.setParameter("message", "someMessage");

        MockHttpServletResponse response = new MockHttpServletResponse();

        Message message = new Message(Arrays.asList(getAction("someAction")));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.any());

        Mockito.when(configAdapter.isActionPublicCachingEnabled()).thenReturn(false);

        // Act
        servlet.doGet(request, response);

        // Assert
        Mockito.verify(servletUtilAdapter).handleServletException(Matchers.any(), Matchers.anyBoolean(), Matchers.any(), Matchers.any(), Matchers.any(), Matchers.anyBoolean());
    }

    @Test
    public void testDoGetForPubliclyCacheableAction() throws Exception {
        // Arrange
        AuraContext context = startContext();

        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("aura.token", "token");
        request.setParameter("aura.isAction", "true");
        request.setParameter("message", "someMessage");

        MockHttpServletResponse response = new MockHttpServletResponse();

        Message message = new Message(Arrays.asList(getAction("someAction")));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.anyString());

        Mockito.when(configAdapter.isActionPublicCachingEnabled()).thenReturn(true);
        Mockito.when(servletUtilAdapter.isPubliclyCacheableAction(message)).thenReturn(true);
        Mockito.when(servletUtilAdapter.getPubliclyCacheableActionExpiration(message)).thenReturn(10L);

        context.setActionPublicCacheKey("somekey");
        Mockito.when(configAdapter.getActionPublicCacheKey()).thenReturn(context.getActionPublicCacheKey());

        // Act
        servlet.doGet(request, response);

        // Assert
        Mockito.verify(serverService).run(Matchers.same(message), Matchers.any(), Matchers.any(), Matchers.any());
        assertFalse("Publicly cached action should not have Browser GVP in the context.", 
                context.getGlobalProviders().containsKey(AuraValueProviderType.BROWSER.getPrefix()));
    }
    
    @Test
    public void testDoGetForPubliclyCacheableActionReturnsCacheHeaders() throws Exception {
        // Arrange
        AuraContext context = startContext();
        
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("message", "test");
        request.setParameter("aura.token", "token");
        request.setParameter("aura.isAction", "true");
        
        MockHttpServletResponse response = new MockHttpServletResponse();

        @SuppressWarnings("unchecked")
        DefDescriptor<ActionDef> actionDescriptor = Mockito.mock(DefDescriptor.class);
        Action action = Mockito.mock(Action.class);
        Mockito.when(action.getDescriptor()).thenReturn(actionDescriptor);
        Mockito.when(actionDescriptor.getQualifiedName()).thenReturn("someName");

        Message message = new Message(Arrays.asList(action));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.any());

        Mockito.when(configAdapter.isActionPublicCachingEnabled()).thenReturn(true);
        Mockito.when(servletUtilAdapter.isPubliclyCacheableAction(message)).thenReturn(true);
        Mockito.when(servletUtilAdapter.getPubliclyCacheableActionExpiration(message)).thenReturn(10L);

        context.setActionPublicCacheKey("somekey");
        Mockito.when(configAdapter.getActionPublicCacheKey()).thenReturn(context.getActionPublicCacheKey());

        // Act
        servlet.doGet(request, response);

        // Assert

        // verify the method used to set the headers was called
        // multiply expected expiration by 1000 since it must be passed in milliseconds
        Mockito.verify(servletUtilAdapter).setCacheTimeout(response, 10 * 1000, false);
    }

    @Test
    public void testDoGetForPubliclyCacheableActionReturnsNoCacheHeadersWhenActionPublicCacheKeyDiffers() throws Exception {
        // Arrange
        AuraContext context = startContext();

        MockHttpServletRequest request = getBaseAuraRequest();
        request.setParameter("message", "test");
        request.setParameter("aura.token", "token");
        request.setParameter("aura.isAction", "true");

        MockHttpServletResponse response = new MockHttpServletResponse();

        @SuppressWarnings("unchecked")
        DefDescriptor<ActionDef> actionDescriptor = Mockito.mock(DefDescriptor.class);
        Action action = Mockito.mock(Action.class);
        Mockito.when(action.getDescriptor()).thenReturn(actionDescriptor);
        Mockito.when(actionDescriptor.getQualifiedName()).thenReturn("someName");

        Message message = new Message(Arrays.asList(action));
        Mockito.doReturn(message).when(servlet).readMessage(Matchers.any());

        context.setActionPublicCacheKey("someKey");
        Mockito.when(configAdapter.getActionPublicCacheKey()).thenReturn("someOtherKey");

        Mockito.when(configAdapter.isActionPublicCachingEnabled()).thenReturn(true);
        Mockito.when(servletUtilAdapter.isPubliclyCacheableAction(message)).thenReturn(true);
        Mockito.when(servletUtilAdapter.getPubliclyCacheableActionExpiration(message)).thenReturn(10L);

        // Act
        servlet.doGet(request, response);

        // Assert
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }
    
    @Test
    public void testReadMessageInvalidActionDefinitionFormat() throws QuickFixException {

        // Arrange
        final AuraRuntimeException are = new AuraRuntimeException("Do not pass go. Do not collect $200.");
        Mockito.when(definitionService.getDefinition(Matchers.anyString(), Matchers.any())).thenThrow(are);
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"aura://ComponentController   /ACTION$getComponent\",\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException.");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action descriptor must be in a valid component format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("aura://ComponentController   /ACTION$getComponent"));
            assertThat("Cause does not match", arie.getCause(), sameInstance(are));
        }
    }
    
    @SuppressWarnings("unchecked")
    @Test
    public void testReadMessageInvalidComponentDefinitionFormat() throws QuickFixException {

        // Arrange
        final AuraRuntimeException are = new AuraRuntimeException("Do not pass go. Do not collect $200.");
        Mockito.when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.eq(ComponentDef.class))).thenThrow(are);
        Mockito.when(instanceService.getInstance(Matchers.any(ActionDef.class), Matchers.anyMap())).thenReturn(Mockito.mock(Action.class));
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"aura://ComponentController   /ACTION$getComponent\",\"callingDescriptor\":\"UNKNOWN_UNKNOWNS\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException.");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Component descriptor must be in a valid component format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("aura://ComponentController   /ACTION$getComponent"));
            assertThat("Cause does not match", arie.getCause(), sameInstance(are));
        }
    }
    
    @Test
    public void testReadMessageInvalidDefinitionFormatBlank() throws QuickFixException {

        // Arrange
        final AuraRuntimeException are = new AuraRuntimeException("Do not pass go. Do not collect $200.");
        Mockito.when(definitionService.getDefinition(Matchers.anyString(), Matchers.any())).thenThrow(are);
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"\",\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException.");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action descriptor must be in a valid component format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo(""));
            assertThat("Cause does not match", arie.getCause(), sameInstance(are));
        }
    }
    
    @Test
    public void testReadMessageDefinitionFormatNull() throws QuickFixException {

        // Arrange
        
        // Act
        final Message message = originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":null,\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
        
        // Assert
        assertThat("The List of actions should be empty.", Boolean.valueOf(message.getActions().isEmpty()), equalTo(Boolean.TRUE));
        Mockito.verifyZeroInteractions(definitionService);
    }
    
    @Test
    public void testReadMessageActionNotMap() throws QuickFixException {

        // Arrange
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[\"jackson\"]}");
            fail("Expected an AuraRequestInputException.");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action must be in an object format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("jackson"));
            assertThat("Cause does not match", arie.getCause(), instanceOf(ClassCastException.class));
        }
    }
    
    @Test
    public void testReadMessageActionNull() throws QuickFixException {
        // Arrange
        
        // Act
        final Message message = originalServlet.readMessage("{\"actions\":[null]}");
        
        // Assert
        assertThat("The List of actions should be empty.", Boolean.valueOf(message.getActions().isEmpty()), equalTo(Boolean.TRUE));
        Mockito.verifyZeroInteractions(definitionService);
    }
    
    @Test
    public void testReadMessageActionDescriptorNotString() throws QuickFixException {

        // Arrange
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":1,\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action descriptor must be in a valid component format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("1"));
            assertThat("Cause does not match", arie.getCause(), instanceOf(ClassCastException.class));
        }
    }
    
    @Test
    public void testReadMessageActionIdNotString() throws QuickFixException {

        // Arrange
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":1,\"descriptor\":\"aura://ComponentController/ACTION$getComponent\",\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action id must be in a String format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("1"));
            assertThat("Cause does not match", arie.getCause(), instanceOf(ClassCastException.class));
        }
    }

    @Test
    public void testReadMessageActionCallingDescriptorNotString() throws QuickFixException {

        // Arrange
        Mockito.when(instanceService.getInstance(Matchers.any(ActionDef.class), Matchers.anyMapOf(String.class, Object.class))).thenReturn(Mockito.mock(Action.class));
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"aura://ComponentController/ACTION$getComponent\",\"callingDescriptor\":1,\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action callingDescriptor must be in a String format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("1"));
            assertThat("Cause does not match", arie.getCause(), instanceOf(ClassCastException.class));
        }
    }

    @Test
    public void testReadMessageActionVersionNotString() throws QuickFixException {

        // Arrange
        Mockito.when(instanceService.getInstance(Matchers.any(ActionDef.class), Matchers.anyMapOf(String.class, Object.class))).thenReturn(Mockito.mock(Action.class));
        
        try {
            // Act
            originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"aura://ComponentController/ACTION$getComponent\",\"callingDescriptor\":\"UNKNOWN\",\"version\":1,\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
            fail("Expected an AuraRequestInputException");
        } catch(final AuraRequestInputException arie) {
            // Assert
            assertThat("Message does not match", arie.getMessage(), equalTo("[AuraClientInputException from server] Unexpected request input. Expected input format: \"Action version must be in a String format.\"."));
            assertThat("InvalidInput does not match", arie.getInvalidInput(), equalTo("1"));
            assertThat("Cause does not match", arie.getCause(), instanceOf(ClassCastException.class));
        }
    }
    
    @SuppressWarnings("unchecked")
    @Test
    public void testReadMessageValidComponentDefinitionFormat() throws QuickFixException {

        // Arrange
        final DefDescriptor<ComponentDef> mockDefDescriptor = Mockito.mock(DefDescriptor.class);
        final MockAction expectedAction = new MockAction();
        expectedAction.setId("2;a");
        expectedAction.setCallingDescriptor(mockDefDescriptor);
        Mockito.when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.eq(ComponentDef.class))).thenReturn(mockDefDescriptor);
        Mockito.when(instanceService.getInstance(Matchers.any(ActionDef.class), Matchers.anyMap())).thenReturn(new MockAction());
        
        // Act
        final Message actualMessage = originalServlet.readMessage("{\"actions\":[{\"id\":\"2;a\",\"descriptor\":\"aura://ComponentController   /ACTION$getComponent\",\"callingDescriptor\":\"UNKNOWN_UNKNOWNS\",\"params\":{\"name\":\"markup://test:runnerContainer\",\"attributes\":{}}}]}");
        
        // Assert
        assertThat("Message does not match", actualMessage, hasProperty("actions", contains(equalTo(expectedAction))));
    }
    
    private final class MockAction implements Action {
        
        private String callerVersion;
        private String id;
        private List<Action> actions = new ArrayList<>();
        private boolean storable = false;
        private boolean offlineAction = false;
        private DefDescriptor<? extends BaseComponentDef> callingDescriptor;
        private BaseComponentDef callingDefinition;

        @Override
        public DefDescriptor<ActionDef> getDescriptor() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public String getPath() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public void serialize(Json json) throws IOException {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public String getId() {
            return id;
        }

        @Override
        public void setId(String id) {
            this.id = id;
        }

        @Override
        public void run() throws AuraExecutionException {
          //No-op
        }

        @Override
        public void setup() {
          //No-op
        }

        @Override
        public void cleanup() {
            //No-op
        }

        @Override
        public void add(List<Action> actions) {
            this.actions.addAll(actions);
        }

        @Override
        public List<Action> getActions() {
            return actions;
        }

        @Override
        public Object getReturnValue() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public State getState() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public List<Object> getErrors() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public void logParams(KeyValueLogger logger) {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public boolean isStorable() {
            return storable;
        }

        @Override
        public void setStorable() {
            this.storable = true;
        }

        @Override
        public boolean isOfflineAction() {
            return offlineAction;
        }

        @Override
        public void markOfflineAction() {
            this.offlineAction = true;
        }

        @Override
        public Map<String, Object> getParams() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public InstanceStack getInstanceStack() {
            throw new NotImplementedException("This method has not been implemented yet");
        }

        @Override
        public DefDescriptor<? extends BaseComponentDef> getCallingDescriptor() {
            return callingDescriptor;
        }

        @Override
        public void setCallingDescriptor(DefDescriptor<? extends BaseComponentDef> def) {
            this.callingDescriptor = def;
        }

        @Override
        public BaseComponentDef getCallingDefinition() {
            return callingDefinition;
        }

        @Override
        public void setCallingDefinition(BaseComponentDef def) {
            this.callingDefinition = def;
        }

        @Override
        public String getCallerVersion() {
            return callerVersion;
        }

        @Override
        public void setCallerVersion(String callerVersion) {
            this.callerVersion = callerVersion;
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + ((actions == null) ? 0 : actions.hashCode());
            result = prime * result + ((callerVersion == null) ? 0 : callerVersion.hashCode());
            result = prime * result + ((callingDefinition == null) ? 0 : callingDefinition.hashCode());
            result = prime * result + ((callingDescriptor == null) ? 0 : callingDescriptor.hashCode());
            result = prime * result + ((id == null) ? 0 : id.hashCode());
            result = prime * result + (offlineAction ? 1231 : 1237);
            result = prime * result + (storable ? 1231 : 1237);
            return result;
        }

        @Override
        public boolean equals(final Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            MockAction other = (MockAction) obj;
            if (actions == null) {
                if (other.actions != null) {
                    return false;
                }
            } else if (!actions.equals(other.actions)) {
                return false;
            }
            if (callerVersion == null) {
                if (other.callerVersion != null) {
                    return false;
                }
            } else if (!callerVersion.equals(other.callerVersion)) {
                return false;
            }
            if (callingDefinition == null) {
                if (other.callingDefinition != null) {
                    return false;
                }
            } else if (!callingDefinition.equals(other.callingDefinition)) {
                return false;
            }
            if (callingDescriptor == null) {
                if (other.callingDescriptor != null) {
                    return false;
                }
            } else if (!callingDescriptor.equals(other.callingDescriptor)) {
                return false;
            }
            if (id == null) {
                if (other.id != null) {
                    return false;
                }
            } else if (!id.equals(other.id)) {
                return false;
            }
            if (offlineAction != other.offlineAction) {
                return false;
            }
            if (storable != other.storable) {
                return false;
            }
            return true;
        }
        
        @Override
        public String toString() {
            return ReflectionToStringBuilder.toString(this);
        }
    }
}
