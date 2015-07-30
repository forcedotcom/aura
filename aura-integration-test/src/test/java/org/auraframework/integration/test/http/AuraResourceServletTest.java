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

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ConcurrentModificationException;
import java.util.EmptyStackException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.collect.Lists;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraResourceRewriteFilter;
import org.auraframework.http.AuraResourceServlet;
import org.auraframework.http.ManifestUtil;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.Client.Type;
import org.auraframework.system.SourceListener;
import org.auraframework.test.client.UserAgent;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.test.util.DummyHttpServletRequest;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.ServiceLoader;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.auraframework.util.test.util.ServiceLocatorMocker;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;

/**
 * Simple (non-integration) test case for {@link AuraResourceServlet}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AuraResourceServletTest extends AuraTestCase {

    public static final String RESOURCE_URI = "/auraFW/resources/some.css";

    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    public AuraResourceServletTest() {
        super(AuraResourceServletTest.class.getName());
    }

    private void doGet(AuraResourceServlet servlet,  HttpServletRequest request, HttpServletResponse response) throws Exception {
        AuraPrivateAccessor.invoke(servlet, "doGet", request, response);
    }

    private void handleServletException(AuraBaseServlet servlet, Throwable throwable, boolean quickfix,
                                        AuraContext context, HttpServletRequest request, HttpServletResponse response,
                                        boolean written) throws Exception {
        AuraPrivateAccessor.invoke(servlet, "handleServletException", throwable, quickfix, context, request, response, written);
    }

    public void testWriteManifestNoAccessError() throws Exception {
        // Start a context to fetch manifests; the other details don't matter
        // much 'cause we'll error out. Then try to fetch one, with that error:
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.UNAUTHENTICATED);

        HttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI) {
            @Override
            // This is the method that's going to cause the simulated failure.
            public String getHeader(String name) {
                if ("user-agent".equals(name)) {
                    throw new SimulatedErrorException();
                }
                return "";
            }
        };
        // Careful. Resin apparently has no getStatus().
        DummyHttpServletResponse response = new DummyHttpServletResponse() {
            int status = -1;

            @Override
            public void setStatus(int status) {
                this.status = status;
            }

            @Override
            public int getStatus() {
                return status;
            }
        };
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);
        assertEquals(HttpServletResponse.SC_NOT_FOUND, response.getStatus());
    }

    public void testAddAppManifestCookie() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.UNAUTHENTICATED);

        DefDescriptor<ApplicationDef> nopreload = DefDescriptorImpl.getInstance("appCache:nopreload",
                ApplicationDef.class);
        Aura.getContextService().getCurrentContext().setApplicationDescriptor(nopreload);

        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI);
        DummyHttpServletResponse response = new DummyHttpServletResponse() {
            Cookie cookie;

            @Override
            public void addCookie(Cookie cookie) {
                this.cookie = cookie;
            }

            @Override
            public Cookie getCookie(String name) {
                return cookie != null && cookie.getName().equals(name) ? cookie : null;
            }
        };
        ManifestUtil.checkManifestCookie(request, response);
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
    private void runTestRequestFromDifferentBrowserOnSamePage(String ua, Type uaType, String cssMsgToVerify)
            throws Exception {
        String cmpname = "appCache:withpreload";
        String cmporapp = "app";
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance(cmpname,
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        Client clientWEBKIT = new Client(ua);
        assertEquals(uaType, clientWEBKIT.getType());
        context.setClient(clientWEBKIT);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI) {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, cmporapp);
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        final String key = "CSS:" + context.getClient().getType() + "$" + mKey + uid;
        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);
        if (!cssMsgToVerify.isEmpty()) {
            assertTrue(cssCache.contains(cssMsgToVerify));
        }
    }

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
    public void testCssCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI) {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        final String key = "CSS:" + context.getClient().getType() + "$" + mKey + uid;

        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);

        assertNull("CSS cache not cleared after source change event", cssCache);
    }

    /**
     * Verify cache of Javascript definitions is cleared on source change in DEV mode.
     *
     * FIXME: this test should not be here.... it should be on MDR.
     */
    public void testJsCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI) {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        final String key = "JS:" + mKey + uid;

        // Verify something was actually added to cache
        String jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to JS cache", jsCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNull("JS cache not cleared after source change event", jsCache);
    }

    /**
     * Verify cache of SVG definitions is cleared on source change in DEV mode.
     */
    public void testSvgCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = appDesc.getDef().getSVGDefDescriptor();
        final String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        DummyHttpServletRequest request = new DummyHttpServletRequest("dummy.app") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        final String key = "SVG:" + context.getClient().getType() + "$" + uid;

        // Verify something was actually added to cache
        String svgCache = context.getDefRegistry().getCachedString(uid, svgDesc, key);
        assertNotNull("Nothing added to SVG cache", svgCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        svgCache = context.getDefRegistry().getCachedString(uid, svgDesc, key);
        assertNull("SVG cache not cleared after source change event", svgCache);
    }

    /**
     * Verify SVG requests return a correct etag.
     */
    public void testSvgCacheUsesEtag() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = appDesc.getDef().getSVGDefDescriptor();
        String etag = svgDesc.getDef().getOwnHash();

        final String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        DummyHttpServletRequest request = new DummyHttpServletRequest("dummy.app") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }

            @Override
            public String getHeader(String name) {
                if (name.equalsIgnoreCase("referer")) {
                    //If referer is empty we assume the image is not viewed from within a webpage
                    return "ANotNullString";
                }
                return super.getHeader(name);
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        HttpServletResponse response = new DummyHttpServletResponse() {
            Map<String, String> headers = new HashMap<>();
            @Override
            public void setHeader(String name, String value) {
                headers.put(name.toLowerCase(), value);
            }

            @Override
            public String getHeader(String name) {
                return headers.get(name.toLowerCase());
            }
        };
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        String etagResponce = response.getHeader("etag");
        assertEquals(etag, etagResponce);
        //For etag to work properly, we need to "disable" the browser from caching it permanently.
        assertEquals("no-cache", response.getHeader("cache-control"));
        //If referer is not null, the image should be sent as a embedded image.
        // IE not an attachment.
        assertNull(response.getHeader("Content-Disposition"));
    }

    /**
     * Verify SVG servlet returns 304 if etag's match.
     */
    public void testSvgReturns304() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = appDesc.getDef().getSVGDefDescriptor();
        final String etag = svgDesc.getDef().getOwnHash();

        final String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        DummyHttpServletRequest request = new DummyHttpServletRequest("dummy.app") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }

            @Override
            public String getHeader(String name) {
                if (name.equalsIgnoreCase("if-none-match")) {
                    return etag;
                } else if (name.equalsIgnoreCase("referer")) {
                    //If referer is empty we assume the image is not viewed from within a webpage
                    return "ANotNullString";
                }
                return super.getHeader(name);
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        HttpServletResponse response = new DummyHttpServletResponse() {
            int status;
            @Override
            public int getStatus() {
                return status;
            }

            @Override
            public void setStatus(int sc) {
                status = sc;
            }
        };
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        assertEquals(304, response.getStatus());
    }

    /**
     * Verify SVG servlet returns Content-Disposition = attachment; filename=resources.svg if referer header is null
     * This is to prevent any scripts hidden in the SVG from running on the local domain
     */
    public void testSvgNoReferer() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.PROD, AuraContext.Format.SVG, AuraContext.Authentication.AUTHENTICATED, appDesc);

        DefDescriptor<SVGDef> svgDesc = appDesc.getDef().getSVGDefDescriptor();

        final String uid = context.getDefRegistry().getUid(null, svgDesc);
        context.addLoaded(appDesc, uid);

        DummyHttpServletRequest request = new DummyHttpServletRequest("dummy.app") {
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "svg");
        HttpServletResponse response = new DummyHttpServletResponse() {
            Map<String, String> headers = new HashMap<>();
            @Override
            public void setHeader(String name, String value) {
                headers.put(name.toLowerCase(), value);
            }

            @Override
            public String getHeader(String name) {
                return headers.get(name.toLowerCase());
            }
        };
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        assertTrue(response.getHeader("Content-Disposition").contains("attachment; filename"));
    }

    /**
     * Verify that context path is prepended on all Aura urls in appcache manifest
     */
    public void testManifestContentWithContextPath() throws Exception {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:testApp",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setApplicationDescriptor(appDesc);
        String coolContext = "/cool";
        context.setContextPath(coolContext);
        String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI);
        DummyHttpServletResponse response = new MyDummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        doGet(servlet, request, response);

        String content = response.getContentType();
        Pattern pattern = Pattern.compile("/auraFW|/l/");
        Matcher matcher = pattern.matcher(content);
        while(matcher.find()) {
            int start =  matcher.start();
            String cool = content.substring(start - 5, start);
            if (!cool.equals(coolContext)) {
                fail("Context path was not prepended to Aura urls");
            }
        }

    }

    /**
     * Verify framework UID exists in auraFW javascript urls in appcache manifest
     */
    public void testManifestFwJsUrlContainsFWId() throws Exception {
        // Arrange
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:testApp",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV,
                AuraContext.Format.MANIFEST, AuraContext.Authentication.AUTHENTICATED, appDesc);
        String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        DummyHttpServletRequest request = new DummyHttpServletRequest(RESOURCE_URI);
        DummyHttpServletResponse response = new MyDummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();

        // Act
        doGet(servlet, request, response);

        // Assert
        String content = response.getContentType();
        Pattern pattern = Pattern.compile("FW=(.*)\n");
        Matcher matcher = pattern.matcher(content);
        if(matcher.find()) {
            String fwId = matcher.group(1);
            Pattern p = Pattern.compile("/auraFW/.*\\.js\n");
            Matcher m = p.matcher(content);
            while(m.find()) {
                String url = m.group(0);
                if(!url.contains(fwId)) {
                    fail("AuraFW JS url does not contain FW UID: " + url);
                }
            }
        }
    }

    /**
     * Unhandled exceptions such has InterruptedException should set response status to 500 for JS (and CSS)
     * so it doesn't cache in browser, appcache, etc
     */
    public void testHandleInterruptedException() throws Exception {
        try {
            PrintWriter writer = mock(PrintWriter.class);
            HttpServletRequest mockRequest = mock(HttpServletRequest.class);
            HttpServletResponse mockResponse = mock(HttpServletResponse.class);
            ContextService mockContextService = mock(ContextService.class);
            AuraContext mockContext = mock(AuraContext.class);
            ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
            InstanceStack mockInstanceStack = mock(InstanceStack.class);
            List<String> stack = Lists.newArrayList();
            SerializationService mockSerializationService = mock(SerializationService.class);

            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            Mockito.when(locator.get(ContextService.class)).thenReturn(mockContextService);
            Mockito.when(locator.get(ConfigAdapter.class)).thenReturn(mockConfigAdapter);
            Mockito.when(locator.get(SerializationService.class)).thenReturn(mockSerializationService);

            Mockito.when(mockResponse.getWriter()).thenReturn(writer);
            // for JS, SC_INTERNAL_SERVER_ERROR
            Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JS);
            Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
            Mockito.when(mockContext.getInstanceStack()).thenReturn(mockInstanceStack);
            Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
            Mockito.when(mockInstanceStack.getStackInfo()).thenReturn(stack);
            Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);

            AuraBaseServlet servlet = new AuraResourceServlet();
            Throwable exception = new InterruptedException("opps");

            handleServletException(servlet, exception, true, mockContext, mockRequest, mockResponse, true);

            Mockito.verify(mockResponse).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }

    /**
     * Verifies first exception within handleServletException is caught and processed
     */
    public void testHandleExceptionDeathCaught() throws Exception {
        try {
            PrintWriter writer = mock(PrintWriter.class);
            HttpServletRequest mockRequest = mock(HttpServletRequest.class);
            HttpServletResponse mockResponse = mock(HttpServletResponse.class);
            ContextService mockContextService = mock(ContextService.class);
            AuraContext mockContext = mock(AuraContext.class);
            ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
            ExceptionAdapter mockExceptionAdapter = mock(ExceptionAdapter.class);

            Throwable firstException = new EmptyStackException();

            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            Mockito.when(locator.get(ContextService.class)).thenReturn(mockContextService);
            Mockito.when(locator.get(ConfigAdapter.class)).thenReturn(mockConfigAdapter);
            Mockito.when(locator.get(ExceptionAdapter.class)).thenReturn(mockExceptionAdapter);

            Mockito.when(mockResponse.getWriter()).thenReturn(writer);
            Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JSON);
            Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
            Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
            Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
            Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);

            AuraBaseServlet servlet = new AuraResourceServlet();
            Throwable exception = new InterruptedException("opps");

            handleServletException(servlet, exception, true, mockContext, mockRequest, mockResponse, true);

            ArgumentCaptor<Throwable> handledException = ArgumentCaptor.forClass(Throwable.class);
            Mockito.verify(mockExceptionAdapter, Mockito.times(1)).handleException(handledException.capture());

            assertTrue("Should handle EmptyStackException", handledException.getValue() instanceof EmptyStackException);

            Mockito.verify(mockResponse, atLeastOnce()).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }

    /**
     * Verifies second exception within handleServletException is caught and processed
     */
    public void testHandleExceptionDoubleDeathCaught() throws Exception {
        try {
            PrintWriter writer = mock(PrintWriter.class);
            HttpServletRequest mockRequest = mock(HttpServletRequest.class);
            HttpServletResponse mockResponse = mock(HttpServletResponse.class);
            ContextService mockContextService = mock(ContextService.class);
            AuraContext mockContext = mock(AuraContext.class);
            ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
            ExceptionAdapter mockExceptionAdapter = mock(ExceptionAdapter.class);

            Throwable firstException = new EmptyStackException();
            String ccmeMsg = "double dead";
            Throwable secondException = new ConcurrentModificationException("double dead");

            ServiceLoader locator = ServiceLocatorMocker.spyOnServiceLocator();
            Mockito.when(locator.get(ContextService.class)).thenReturn(mockContextService);
            Mockito.when(locator.get(ConfigAdapter.class)).thenReturn(mockConfigAdapter);
            Mockito.when(locator.get(ExceptionAdapter.class)).thenReturn(mockExceptionAdapter);

            Mockito.when(mockResponse.getWriter()).thenReturn(writer);
            Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.HTML);
            Mockito.when(mockContext.getMode()).thenReturn(Mode.DEV);
            Mockito.when(mockConfigAdapter.isProduction()).thenReturn(false);
            Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
            Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);
            Mockito.when(mockExceptionAdapter.handleException(firstException)).thenThrow(secondException);

            AuraBaseServlet servlet = new AuraResourceServlet();
            Throwable exception = new InterruptedException("opps");

            handleServletException(servlet, exception, true, mockContext, mockRequest, mockResponse, true);

            ArgumentCaptor<String> exceptionMessage = ArgumentCaptor.forClass(String.class);
            Mockito.verify(writer, Mockito.times(1)).println(exceptionMessage.capture());

            assertEquals(ccmeMsg, exceptionMessage.getValue());
            Mockito.verify(mockResponse, atLeastOnce()).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        } finally {
            ServiceLocatorMocker.unmockServiceLocator();
        }
    }

    private static class MyDummyHttpServletResponse extends DummyHttpServletResponse {
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        @Override
        public PrintWriter getWriter() throws IOException {
            return writer;
        }

        // Hacking method to verify content of PrintWriter. This is never called in writeManifest
        @Override
        public String getContentType() {
            return stringWriter.toString();
        }
    }
}
