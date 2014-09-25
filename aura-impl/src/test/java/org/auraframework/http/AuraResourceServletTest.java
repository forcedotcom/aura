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

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client.Type;
import org.auraframework.system.Client;
import org.auraframework.system.SourceListener;
import org.auraframework.test.AuraTestCase;
import org.auraframework.test.DummyHttpServletRequest;
import org.auraframework.test.DummyHttpServletResponse;
import org.auraframework.test.client.UserAgent;

/**
 * Simple (non-integration) test case for {@link AuraResourceServlet}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AuraResourceServletTest extends AuraTestCase {

    public static class SimulatedErrorException extends RuntimeException {
        private static final long serialVersionUID = 411181168049748986L;
    }

    public AuraResourceServletTest() {
        super(AuraResourceServletTest.class.getName());
    }

    public void testWriteManifestNoAccessError() throws Exception {
        // Start a context to fetch manifests; the other details don't matter
        // much 'cause we'll error out. Then try to fetch one, with that error:
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.UNAUTHENTICATED);

        HttpServletRequest request = new DummyHttpServletRequest() {
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
        servlet.doGet(request, response);
        Aura.getContextService().endContext();
        assertEquals(HttpServletResponse.SC_NOT_FOUND, response.getStatus());
    }

    public void testAddAppManifestCookie() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.UNAUTHENTICATED);

        DefDescriptor<ApplicationDef> nopreload = DefDescriptorImpl.getInstance("appCache:nopreload",
                ApplicationDef.class);
        Aura.getContextService().getCurrentContext().setApplicationDescriptor(nopreload);

        DummyHttpServletRequest request = new DummyHttpServletRequest();
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

        Aura.getContextService().endContext();

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
     * for W-2136514 
     * this test is to verify we cache CSS by appDescriptor+browserType, 
     * so when different browser request on the same page, they don't get each other's cache one
     * server cache CSS for cmp too.
     */
    private void runTestRequestFromDifferentBrowserOnSamePage(String ua, Type uaType, String cssMsgToVerify) throws Exception {
    	String cmpname = "appCache:withpreload";
    	String cmporapp = "app";
    	DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance(cmpname,
    			ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        Client clientWEBKIT = new Client(ua);
        assertEquals(uaType,clientWEBKIT.getType());
		context.setClient(clientWEBKIT);
		final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DummyHttpServletRequest request = new DummyHttpServletRequest(){
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, cmporapp);
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "CSS:" + context.getClient().getType() + "$" + mKey + uid;
        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);
        if(!cssMsgToVerify.isEmpty()) {
        	assertTrue(cssCache.contains(cssMsgToVerify));
        }
        
        Aura.getContextService().endContext();
    }
    
    public void testRequestFromDifferentBrowserOnSamePage() throws Exception {
    	runTestRequestFromDifferentBrowserOnSamePage(UserAgent.IE9.getUserAgentString(),Type.IE9,"");
    	//ui:button has special session for IE7 in button.css under @if (IE7){...}
    	runTestRequestFromDifferentBrowserOnSamePage(UserAgent.IE7.getUserAgentString(),Type.IE7,"display:inline; zoom:1; overflow:visible!important");
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

        DummyHttpServletRequest request = new DummyHttpServletRequest(){
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "CSS:" + context.getClient().getType() + "$" + mKey + uid;

        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        Aura.getContextService().endContext();

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

        DummyHttpServletRequest request = new DummyHttpServletRequest(){
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        request.setQueryParam(AuraResourceRewriteFilter.TYPE_PARAM, "app");
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "JS:" + mKey + uid;

        // Verify something was actually added to cache
        String jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to JS cache", jsCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.CHANGED, null);

        jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        Aura.getContextService().endContext();
        assertNull("JS cache not cleared after source change event", jsCache);
    }

}
