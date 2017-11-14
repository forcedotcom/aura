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
package org.auraframework.integration.test.http;

import static org.auraframework.system.AuraContext.Format.HTML;
import static org.auraframework.system.AuraContext.Format.JSON;
import static org.auraframework.system.AuraContext.Format.MANIFEST;
import static org.mockito.Mockito.verify;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Vector;

import javax.inject.Inject;
import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.http.AuraContextFilter;
import org.auraframework.http.AuraServlet;
import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.impl.service.BrowserCompatibilityServiceImplTest.UserAgentResult;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;

import com.google.common.collect.ImmutableList;

public class AuraContextFilterTest extends AuraTestCase {
    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private BrowserCompatibilityService browserCompatibilityService;

    @Mock
    private LoggingService loggingService;

    @Mock
    private HttpServletRequest request;
    
    @Mock
    private HttpServletResponse response;
    
    @Mock
    private FilterChain filterChain;

    private AuraContextFilter filter = new AuraContextFilter();

    @Override
    public void setUp() throws Exception {
        super.setUp();
        
        filter.setContextService(contextService);
        filter.setLoggingService(loggingService);
        filter.setDefinitionService(definitionService);
        filter.setConfigAdapter(configAdapter);
        filter.setBrowserCompatibilityService(browserCompatibilityService);
        
        Mockito.when(request.getLocales()).thenReturn(new Vector<>(ImmutableList.of(Locale.ENGLISH)).elements());
    }
    
    private static void assertContextPath(AuraContextFilter filter, HttpServletRequest mock, String input, String expected)
            throws Exception {
        Mockito.when(mock.getContextPath()).thenReturn(input);
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", mock, null, null);
        assertEquals(expected, context.getContextPath());
        AuraPrivateAccessor.invoke(filter, "endContext");
    }

    @Test
    public void testStartContextContextPath() throws Exception {
        assertContextPath(filter, request, "/something", "/something");
        assertContextPath(filter, request, "/", "");
        assertContextPath(filter, request, "", "");    }

    @Test
    public void testUseCompatWithDifferentUserAgents() throws Exception {
        List<UserAgentResult> uaTestEntries = new ArrayList<>();
        uaTestEntries.add(new UserAgentResult("Safari 11.0", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38", true));
        uaTestEntries.add(new UserAgentResult("Safari 10.0.3", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8", false));
        uaTestEntries.add(new UserAgentResult("Chrome 58", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", true));
        uaTestEntries.add(new UserAgentResult("Chrome 55", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36", false));
        uaTestEntries.add(new UserAgentResult("IE 11", "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko", false));
        uaTestEntries.add(new UserAgentResult("IE 9", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)", false));
        uaTestEntries.add(new UserAgentResult("MS Edge 15", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986", true));
        uaTestEntries.add(new UserAgentResult("MS Edge 15", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986", true));
        uaTestEntries.add(new UserAgentResult("Firefox 53", "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.16.5; rv:53.0) Gecko/20100101 Firefox/53.0", true));
        uaTestEntries.add(new UserAgentResult("Firefox 52", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_19_2; rv:52.0a) Gecko/20100101 Firefox/52.0a", false));

        for (UserAgentResult uar : uaTestEntries) {
            MockHttpServletRequest mockRequest = new MockHttpServletRequest();
            mockRequest.addHeader(HttpHeaders.USER_AGENT, uar.ua);
            AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", mockRequest, null, null);
            boolean useCompat = context.useCompatSource();
            boolean expectedUseCompat = !uar.compatible; // use compat if not compatible (opposite of compatible)
            assertEquals(uar.name + ": expected " + expectedUseCompat + ", actual " + uar, expectedUseCompat, useCompat);
            AuraPrivateAccessor.invoke(filter, "endContext");
        }

    }

    @Test
    public void testStartContextIgnoresInvalidConfigJson() throws Exception {
        // Arrange
        Mode expected = configAdapter.getDefaultMode();
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "config")).thenReturn("Scooby Dooby Doo");

        // Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        Mode actual = context.getMode();

        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testStartContextSetsFormatFromFormatRequestParam() throws Exception {
    	// Arrange
    	Format expected = MANIFEST;
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "format")).thenReturn("MANIFEST");
    	
    	// Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        Format actual = context.getFormat(); 
        
        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testStartContextSetsHTMLFormatForGETRequests() throws Exception {
    	// Arrange
    	Format expected = HTML;
        Mockito.when(request.getMethod()).thenReturn("GET");
    	
    	// Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        Format actual = context.getFormat(); 
        
        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testStartContextSetsJSONFormatForPOSTRequests() throws Exception {
    	// Arrange
    	Format expected = JSON;
        Mockito.when(request.getMethod()).thenReturn("POST");
    	
    	// Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        Format actual = context.getFormat(); 
        
        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testStartContextSetsJSONFormatForActionGETRequests() throws Exception {
    	// Arrange
    	Format expected = JSON;
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "isAction")).thenReturn("true");
        Mockito.when(request.getMethod()).thenReturn("GET");
    	
    	// Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        Format actual = context.getFormat(); 
        
        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testDoFilterSetsLoggingServicePageURI() throws Exception {
    	// Arrange
    	String expected = "someURI";
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "pageURI")).thenReturn("someURI");
        
        // Act
    	filter.doFilter(request, response, filterChain);
    	
    	// Assert
    	verify(loggingService).setValue(LoggingService.PAGE_URI, expected);
    }
    
    @Test
    public void testDoFilterSetsLoggingServicePageURIFromReferrerHeader() throws Exception {
    	// Arrange
    	String expected = "refererURI";
        Mockito.when(request.getHeader("Referer")).thenReturn("refererURI");
        
        // Act
    	filter.doFilter(request, response, filterChain);
    	
    	// Assert
    	verify(loggingService).setValue(LoggingService.PAGE_URI, expected);
    }
    
    @Test
    public void testStartContextSetsActionPublicCacheKeyFromServer() throws Exception {
        // Arrange
        String expected = configAdapter.getActionPublicCacheKey();
        
        // Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        String actual = context.getActionPublicCacheKey();
        
        // Assert
        assertEquals(expected, actual);
    }
    
    @Test
    public void testStartContextSetsActionPublicCacheKeyFromClient() throws Exception {
        // Arrange
    	String expected = "someKey";
        Mockito.when(request.getParameter("aura.context")).thenReturn("{apck:'" + expected + "'}");
        
        // Act
        AuraContext context = AuraPrivateAccessor.invoke(filter, "startContext", request, null, null);
        String actual = context.getActionPublicCacheKey();
        
        // Assert
        assertEquals(expected, actual);
    }
}
