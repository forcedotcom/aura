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

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.AuraServlet;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletConfig;

public class AuraServletTest extends UnitTestCase {

    private ContextService contextService = Aura.getContextService();

    private AuraServlet servlet;

    @Mock
    private ServletUtilAdapter servletUtilAdapter;
    
    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    public AuraServletTest() {
        super(AuraServletTest.class.getName());
    }

    @Override
    public void setUp() throws Exception {
    	super.setUp();
        servlet = new AuraServlet(servletUtilAdapter);
        MockServletConfig servletConfig = new MockServletConfig();
        servlet.init(servletConfig);
    }
    
    @Override
    public void tearDown() throws Exception {
    	contextService.endContext();
    	super.tearDown();
    }

	/*
	 * The handling of standard ports may vary (in .getRequestURL) according to
	 * the version of MockHttpServletRequest provided, so just use a
	 * non-standard port.
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
		assertEquals(String.format("Unexpected number of '%s' headers", name),
				1, headers.size());
		assertEquals(String.format("Unexpected value for '%s' header", name),
				value, headers.get(0));
    }
    
    public void testDoGet_NoCacheStartsWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/path?q1=v1+&q2=+v2&q3=v1+v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION,
				"http://server:9090/path?q1=v1+&q2=+v2&q3=v1+v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheIsRoot() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
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
     *
     */
    public void testDoGet_NoCacheDoubleSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "http://host//somepath");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090//somepath");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheNoFragment() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/?q");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/?q");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheNoQuery() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "/#a");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "http://server:9090/#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheDoesNotStartWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "urlisnotabsolute");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheUriExploit() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "@exploit/");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheInvalid() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "://:@:/");
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
		assertSingleHeader(response, HttpHeaders.LOCATION, "/");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheHttpsToHttp() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
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

    public void testDoGet_NoCacheHttpToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:9090/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheHttpsToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
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

    @Ignore("W-3041937: of most concern when switching to https, if request or redirect are on non-standard ports")
    public void _testDoGet_NoCacheRetainsRequestAuthority() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertSingleHeader(response, HttpHeaders.LOCATION, "https://server:9090/path?q1=v1&q2=v2#a");
        Mockito.verify(servletUtilAdapter).setNoCache(response);
    }

    public void testDoGet_NoCacheEmpty() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		Mockito.when(
				servletUtilAdapter.isValidDefType(Mockito.any(), Mockito.any()))
				.thenReturn(false); // trigger 404 below
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", "");
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        // def type check occurs after nocache processing
		Mockito.verify(servletUtilAdapter).send404(Mockito.any(), Mockito.eq(request), Mockito.eq(response));
    }

    public void testDoGet_NoCacheNull() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
		Mockito.when(
				servletUtilAdapter.actionServletGetPre(Mockito.any(),Mockito.any()))
				.thenReturn(false);
		Mockito.when(
				servletUtilAdapter.isValidDefType(Mockito.any(), Mockito.any()))
				.thenReturn(false); // trigger 404 below
		
        MockHttpServletRequest request = getBaseAuraRequest();
        request.addParameter("nocache", (String)null);
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        servlet.doGet(request, response);
        
        // def type check occurs after nocache processing
		Mockito.verify(servletUtilAdapter).send404(Mockito.any(), Mockito.eq(request), Mockito.eq(response));
    }
}
