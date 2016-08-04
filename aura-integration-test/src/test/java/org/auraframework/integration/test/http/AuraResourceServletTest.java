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
import java.util.List;

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraResourceRewriteFilter;
import org.auraframework.http.AuraResourceServlet;
import org.auraframework.http.ManifestUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.Client.Type;
import org.auraframework.system.SourceListener;
import org.auraframework.test.client.UserAgent;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.test.util.DummyHttpServletRequest;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestContextManager;
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

    public void testAddAppManifestCookie() throws Exception {
        contextService.startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.UNAUTHENTICATED);

        DefDescriptor<ApplicationDef> nopreload = definitionService.getDefDescriptor("appCache:nopreload",
                ApplicationDef.class);
        contextService.getCurrentContext().setApplicationDescriptor(nopreload);

        DummyHttpServletRequest request = new DummyHttpServletRequest("app.manifest");
        DummyHttpServletResponse response = new DummyHttpServletResponse() {
            Cookie cookie;

            @Override
            public void addCookie(Cookie newCookie) {
                this.cookie = newCookie;
            }

            @Override
            public Cookie getCookie(String name) {
                return cookie != null && cookie.getName().equals(name) ? cookie : null;
            }
        };
        new ManifestUtil(contextService, configAdapter).checkManifestCookie(request, response);
        String expectedName = Mode.UTEST + "_" + nopreload.getNamespace() + "_" + nopreload.getName() + "_lm";
        Cookie cookie = response.getCookie(expectedName);
        assertEquals(expectedName, cookie.getName());
        //
        // Format of the cookie is now <n>:<time>
        //
        assertEquals(AuraBaseServlet.SHORT_EXPIRE_SECONDS, cookie.getMaxAge());
        assertTrue("Cookie should contain : but was:" + cookie.getValue(), cookie.getValue().contains(":"));
        String countStr = cookie.getValue().substring(0, cookie.getValue().indexOf(':'));
        String startTimeStr = cookie.getValue().substring(countStr.length() + 1);

        try {
            int count = Integer.parseInt(countStr);
            assertTrue("count should be between 1 & 8 was " + count, (count >= 0 && count < 9));
        } catch (NumberFormatException nfe) {
            fail("Invalid count of " + countStr);
        }
        try {
            long startTime = Long.parseLong(startTimeStr);
            assertTrue("Start time should be in the past", (startTime <= System.currentTimeMillis()));
        } catch (NumberFormatException nfe) {
            fail("Invalid start time of " + startTimeStr);
        }
    }

    /*
     * for W-2136514 this test is to verify we cache CSS by appDescriptor+browserType, so when different browser request
     * on the same page, they don't get each other's cache one server cache CSS for cmp too.
     */
    private void runTestRequestFromDifferentBrowserOnSamePage(String ua, Type uaType, String cssMsgToVerify) throws Exception {
        String cmpname = "appCache:withpreload";
        String cmporapp = "app";
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(cmpname, ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        Client clientWEBKIT = new Client(ua);
        assertEquals(uaType, clientWEBKIT.getType());
        context.setClient(clientWEBKIT);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        boolean minify = context.getMode().minify();
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest("app.css") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, cmporapp);
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "CSS:" + context.getClient().getType().name().toLowerCase() + "$" + mKey + uid;
        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getAltCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);
        if (!cssMsgToVerify.isEmpty()) {
            assertTrue(cssCache.contains(cssMsgToVerify));
        }
    }

    @UnAdaptableTest("W-2931019 enable this once 3Tier change is in")
    @Test
    public void testRequestFromDifferentBrowserOnSamePage() throws Exception {
        runTestRequestFromDifferentBrowserOnSamePage(UserAgent.IE9.getUserAgentString(), Type.IE9, "");
        // ui:button has special session for IE7 in button.css under @if (IE7){...}
        runTestRequestFromDifferentBrowserOnSamePage(UserAgent.IE7.getUserAgentString(), Type.IE7,
                "display:inline; zoom:1; overflow:visible!important");
    }

    /**
     * Verify the CSS cache is cleared in DEV mode after a source change. Usually this would be picked up by the file
     * source monitor, but we'll just emulate a source change for the sake of speed and simplicity. Original dev caching
     * story: W-1450222
     */
    @UnAdaptableTest("W-2931019 enable this once 3Tier change is in")
    @Test
    public void testCssCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        boolean minify = context.getMode().minify();
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest("app.css") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "CSS:" + context.getClient().getType().name().toLowerCase() + "$" + mKey + uid;

        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getAltCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);

        // Now force a source change event and verify cache is emptied
        fileMonitor.onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);

        assertNull("CSS cache not cleared after source change event", cssCache);
    }

    /**
     * Verify cache of Javascript definitions is cleared on source change in DEV mode.
     *
     * FIXME: this test should not be here.... it should be on MDR.
     */
    @UnAdaptableTest("W-2929438")
    @Test
    public void testJsCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        boolean minify = context.getMode().minify();
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest("app.js") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "JS:" + mKey + uid;

        // Verify something was actually added to cache
        String jsCache = context.getDefRegistry().getAltCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to JS cache", jsCache);

        // Now force a source change event and verify cache is emptied
        fileMonitor.onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNull("JS cache not cleared after source change event", jsCache);
    }

    /**
     * Verify cache of SVG definitions is cleared on source change in DEV mode.
     */
    @UnAdaptableTest("W-2929438")
    @Test
    public void testSvgCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        AuraContext context = contextService
                .startContext(Mode.DEV, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        final String uid = context.getDefRegistry().getUid(null, svgDesc);
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
        String svgCache = context.getDefRegistry().getCachedString(uid, svgDesc, key);
        assertNotNull("Nothing added to SVG cache", svgCache);

        // Now force a source change event and verify cache is emptied
        fileMonitor.onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        svgCache = context.getDefRegistry().getCachedString(uid, svgDesc, key);
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
        String etag = definitionService.getDefinition(svgDesc).getOwnHash();
        String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
                    //If referer is empty we assume the image is not viewed from within a webpage
        mockRequest.addHeader("referer", "ANotNullString");
        mockRequest.setSession(new MockHttpSession());

        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
        servlet.doGet(mockRequest, mockResponse);

        List<String> headers = mockResponse.getHeaders("etag");
        assertTrue("Failed to find expected value in header: " + headers, headers.contains(etag));

        // For etag to work properly, we need to "disable" the browser from caching it permanently.
        headers = mockResponse.getHeaders("cache-control");
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

        DefDescriptor<SVGDef> svgDesc = definitionService.getDefinition(appDesc).getSVGDefDescriptor();
        String etag = definitionService.getDefinition(svgDesc).getOwnHash();
        String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest(null, "resources.svg");
        mockRequest.setSession(new MockHttpSession());
        mockRequest.setAttribute(AuraResourceServlet.ORIG_REQUEST_URI, "resources.svg");
        mockRequest.addHeader("if-none-match", etag);
                    //If referer is empty we assume the image is not viewed from within a webpage
        mockRequest.addHeader("referer", "ANotNullString");
        mockRequest.addParameter(AuraResourceRewriteFilter.TYPE_PARAM, "svg");

        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        AuraResourceServlet servlet = getAuraResourceServlet();
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
        String uid = context.getDefRegistry().getUid(null, svgDesc);
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
