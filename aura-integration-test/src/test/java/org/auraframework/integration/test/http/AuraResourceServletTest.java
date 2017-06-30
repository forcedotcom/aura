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

import org.apache.http.HttpHeaders;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.http.AuraResourceRewriteFilter;
import org.auraframework.http.AuraResourceServlet;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.SourceListener;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.test.util.DummyHttpServletRequest;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestContextManager;

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Simple (non-integration) test case for {@link AuraResourceServlet}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AuraResourceServletTest extends AuraTestCase {
    @Inject
    private FileMonitor fileMonitor;

    @Inject
    DefinitionService definitionService;

    @Inject
    ContextService contextService;

    @Inject
    CachingService cachingService;

    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    @Mock
    private ServletConfig servletConfig;

    private AuraResourceServlet getAuraResourceServlet() throws Exception {
        AuraResourceServlet servlet = new AuraResourceServlet();
        TestContextManager testContextManager = new TestContextManager(getClass());
        testContextManager.prepareTestInstance(servlet);
        return servlet;
    }

    private String getKey(String uid, DefDescriptor<?> descriptor, String key) {
        return String.format("%s@%s@%s", uid, descriptor.getQualifiedName().toLowerCase(), key);
        }

    /**
     * Verify cache of SVG definitions is cleared on source change in DEV mode.
     */
    @UnAdaptableTest("W-2929438")
    @Test
    @Ignore("The cache is sometimes wrong here")
    @ThreadHostileTest("depends on cache state")
    public void testSvgCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        final String uid = definitionService.getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        DummyHttpServletRequest request = new DummyHttpServletRequest("resources.svg") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "SVG:" + context.getClient().getType() + "$" + uid;

        // Verify something was actually added to cache
        String svgCache = cachingService.getStringsCache().getIfPresent(getKey(uid, svgDesc, key));
        assertNotNull("Nothing added to SVG cache", svgCache);

        // Now force a source change event and verify cache is emptied
        fileMonitor.onSourceChanged(SourceListener.SourceMonitorEvent.CHANGED, null);

        svgCache = cachingService.getStringsCache().getIfPresent(getKey(uid, svgDesc, key));
        assertNull("SVG cache not cleared after source change event", svgCache);
    }

    /**
     * Verify SVG requests return a correct etag.
     */
    @Test
    public void testSvgCacheUsesEtag() throws Exception {
        DefDescriptor<ApplicationDef> appDesc =
                definitionService.getDefDescriptor("markup://appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService.startContext(
                Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        String etag = "\"" + definitionService.getDefinition(svgDesc).getOwnHash() + "\"";
        String uid = definitionService.getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
                    //If referer is empty we assume the image is not viewed from within a webpage
        mockRequest.addHeader(HttpHeaders.REFERER, "ANotNullString");
        mockRequest.setSession(new MockHttpSession());

        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(mockRequest, mockResponse);

        List<String> headers = mockResponse.getHeaders(HttpHeaders.ETAG);
        assertTrue("Failed to find expected value in header: " + headers, headers.contains(etag));

        // For etag to work properly, we need to "disable" the browser from caching it permanently.
        headers = mockResponse.getHeaders(HttpHeaders.CACHE_CONTROL);
        assertTrue("Failed to find expected value in header: " + headers, headers.contains("no-cache"));

        // If referer is not null, the image should be sent as a embedded image.
        // IE not an attachment.
        headers = mockResponse.getHeaders("Content-Disposition");
        assertTrue(headers.isEmpty());
    }

    /**
     * Verify SVG servlet returns 304 if etag's match.
     */
    @Test
    public void testSvgReturns304() throws Exception {
        DefDescriptor<ApplicationDef> appDesc =
                definitionService.getDefDescriptor("markup://appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService.startContext(
                Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        //First we will go to the server with no etag. This will give us the etag to use for next step
        MockHttpServletRequest mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setSession(new MockHttpSession());
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        //If referer is empty we assume the image is not viewed from within a webpage
        mockRequest.addHeader(HttpHeaders.REFERER, "ANotNullString");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");

        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(mockRequest, mockResponse);

        assertEquals(200, mockResponse.getStatus());
        String etag = mockResponse.getHeader(HttpHeaders.ETAG);

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        String uid = definitionService.getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        //Now that we have the etag from the first request, we will query with that etag
        mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setSession(new MockHttpSession());
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        mockRequest.addHeader(HttpHeaders.IF_NONE_MATCH, etag);
        //If referer is empty we assume the image is not viewed from within a webpage
        mockRequest.addHeader(HttpHeaders.REFERER, "ANotNullString");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");

        servlet.doGet(mockRequest, mockResponse);

        assertEquals(304, mockResponse.getStatus());
    }

    /**
     * Verify SVG servlet returns Content-Disposition = attachment; filename=resources.svg if referer header is null
     * This is to prevent any scripts hidden in the SVG from running on the local domain
     */
    @Test
    public void testSvgNoReferer() throws Exception {
        DefDescriptor<ApplicationDef> appDesc =
                definitionService.getDefDescriptor("markup://appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService.startContext(
                Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        String uid = definitionService.getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        mockRequest.setSession(new MockHttpSession());

        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(mockRequest, mockResponse);

        List<String> headers = mockResponse.getHeaders("Content-Disposition");
        assertFalse("Failed to find any header for Content-Disposition", headers.isEmpty());
        assertTrue(headers.contains("attachment; filename=resources.svg"));
    }
}
