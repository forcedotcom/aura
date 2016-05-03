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

import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.http.AuraServlet;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletConfig;

public class AuraServletTest extends UnitTestCase {

    private ContextService contextService = Aura.getContextService();

    private AuraServlet servlet;

    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    public AuraServletTest() {
        super(AuraServletTest.class.getName());
    }

    @Override
    public void setUp() throws Exception {
        servlet = new AuraServlet();
        MockServletConfig servletConfig = new MockServletConfig();
        servlet.init(servletConfig);
    }

    private MockHttpServletRequest getBaseAuraRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setScheme("http");
        request.setServerName("server");
        request.setRequestURI("/aura");
        request.addParameter("aura.tag", "aura:text");
        return request;
    }

    private void assertNoCacheHeaders(HttpServletResponse response) {
        assertEquals("Unexpected cache-control header", "no-cache, no-store",
                response.getHeader(HttpHeaders.CACHE_CONTROL));
        assertEquals("Unexpected pragma header", "no-cache", response.getHeader(HttpHeaders.PRAGMA));
    }
    
    public void testDoGet_NoCacheStartsWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setServerPort(9090);
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "/path?q1=v1+&q2=+v2&q3=v1+v2#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "http://server:9090/path?q1=v1+&q2=+v2&q3=v1+v2#a",
                response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheIsRoot() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "/");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "http://server/", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    /**
     * This handles a Chrome (or maybe WebKit) bug where a Location semi-correctly beginning with a double or more slash
     * is taken as a hostname (i.e. as if it were http: + the location),
     *
     */
    public void testDoGet_NoCacheDoubleSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "http://host//somepath");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "http://server//somepath", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheNoFragment() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "/?q");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "http://server/?q", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheNoQuery() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "/#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "http://server/#a", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheDoesNotStartWithSlash() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "urlisnotabsolute");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "/", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheUriExploit() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "@exploit/");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "/", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheInvalid() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "://:@:/");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "/", response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheHttpsToHttp() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setScheme("https");
        request.setServerPort(7443);
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "http://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "https://server:7443/path?q1=v1&q2=v2#a",
                response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheHttpToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "https://server/path?q1=v1&q2=v2#a",
                response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheHttpsToHttps() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setScheme("https");
        request.setServerPort(443);
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "https://server/path?q1=v1&q2=v2#a",
                response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    @Ignore("W-3041937: of most concern when switching to https, if request or redirect are on non-standard ports")
    public void _testDoGet_NoCacheRetainsRequestAuthority() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        request.setServerPort(9090);
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "https://user:password@otherserver:otherport/path?q1=v1&q2=v2#a");
        servlet.doGet(request, response);
        assertEquals(HttpStatus.SC_MOVED_TEMPORARILY, response.getStatus());
        assertEquals("Unexpected location", "https://server:9090/path?q1=v1&q2=v2#a",
                response.getHeader(HttpHeaders.LOCATION));
        assertNoCacheHeaders(response);
    }

    public void testDoGet_NoCacheEmpty() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", "");
        servlet.doGet(request, response);
        // components not directly accessible in PROD mode, but this check happens after nocache processing
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatus());
    }

    public void testDoGet_NoCacheNull() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        MockHttpServletRequest request = getBaseAuraRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addParameter("nocache", (String)null);
        servlet.doGet(request, response);
        // components not directly accessible in PROD mode, but this check happens after nocache processing
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatus());
    }
}
