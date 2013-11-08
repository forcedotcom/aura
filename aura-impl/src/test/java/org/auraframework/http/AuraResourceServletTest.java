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

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.SourceListener;
import org.auraframework.test.AuraTestCase;
import org.auraframework.test.DummyHttpServletRequest;
import org.auraframework.test.DummyHttpServletResponse;
import org.auraframework.test.util.AuraPrivateAccessor;

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
                AuraContext.Access.PUBLIC);

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
        assertEquals(HttpServletResponse.SC_NOT_FOUND, response.getStatus());
    }

    public void testAddAppManifestCookie() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.MANIFEST,
                AuraContext.Access.PUBLIC);

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

    /**
     * Verify the CSS cache is cleared in DEV mode after a source change. Usually this would be picked up by the file
     * source monitor, but we'll just emulate a source change for the sake of speed and simplicity. Original dev caching
     * story: W-1450222
     */
    public void testCssCacheClearedOnSourceChange() throws Exception {
        // DEV mode and Authenticated access so css is actually cached on servlet
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED);

        doGetToPopulateCache();

        // Verify something was actually added to cache
        Object cssCache = AuraPrivateAccessor.get(AuraResourceServlet.class, "cssCache");
        @SuppressWarnings("unchecked")
        Map<String, String> cache = (Map<String, String>) cssCache;
        assertTrue("Nothing added to CSS cache", cache.size() > 0);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.changed);
        assertTrue("CSS cache not cleared after source change event", cache.isEmpty());
    }

    /**
     * Verify cache of Javascript definitions is cleared on source change in DEV mode.
     */
    public void testJsCacheClearedOnSourceChange() throws Exception {
        // DEV mode and Authenticated access so js is actually cached on servlet
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.JS,
                AuraContext.Access.AUTHENTICATED);

        doGetToPopulateCache();

        // Verify something was actually added to cache
        Object jsCache = AuraPrivateAccessor.get(AuraResourceServlet.class, "definitionCache");
        @SuppressWarnings("unchecked")
        Map<String, String> cache = (Map<String, String>) jsCache;
        assertTrue("Nothing added to JS cache", cache.size() > 0);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.changed);
        assertTrue("JS cache not cleared after source change event", cache.isEmpty());
    }

    private void doGetToPopulateCache() throws Exception {
        DefDescriptor<ApplicationDef> nopreload = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        Aura.getContextService().getCurrentContext().setApplicationDescriptor(nopreload);

        HttpServletRequest request = new DummyHttpServletRequest();
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);
    }

    /**
     * Sanity check to make sure that app.js doesn't blow up
     */
    public void testWriteDefinitionsWithoutDupes() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.JS,
                AuraContext.Access.AUTHENTICATED);

        // prime def cache
        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeDefinitions(output);
        String text = output.toString();
        final String dupeCheck = "$A.clientService.initDefs(";
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }

        // now check that defs not re-written with unempty cache
        output = new StringBuilder();
        AuraResourceServlet.writeDefinitions(output);
        text = output.toString();
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }
    }

    /**
     * Sanity check to make sure that app.css does not have duplicate copy of component CSS. Component CSS was being
     * added twice, once because they were part of preload namespace and a second time because of component dependency.
     * This test mocks such duplication. W-1588568
     */
    public void testWriteCssWithoutDupes() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED);
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        // First reference to preloadTest
        ctx.addPreload("preloadTest");
        // preloadTest:test_SimpleApplication has the second explicit reference to preloadTest as a preload namespace
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "preloadTest:test_SimpleApplication", ApplicationDef.class);
        ctx.setApplicationDescriptor(appDesc);
        Aura.getDefinitionService().updateLoaded(appDesc, false);

        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeCss(output);

        // A snippet of component css
        String cssPiece = "AuraResourceServletTest-testWriteCssWithoutDupes";
        Pattern pattern = Pattern.compile(cssPiece);
        Matcher matcher = pattern.matcher(output.toString());
        int count = 0;
        while (matcher.find() && count < 3)
            count++;
        assertEquals("Component CSS repeated", 1, count);
    }

    /**
     * Verify CSS is ordered based off number of dependencies. Super component CSS should come before compnent that
     * extends super. If two components have the same number of dependencies, they should be written out in alphabetical
     * order.
     */
    public void testCSSOrder() throws Exception {
        Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED);
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor("test:cssOrderTest",
                ApplicationDef.class);
        ctx.setApplicationDescriptor(appDesc);
        Aura.getDefinitionService().updateLoaded(appDesc, false);

        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeCss(output);
        String css = output.toString();

        assertTrue("grandparent CSS should be written before parent CSS",
                css.indexOf(".setAttributesTestGrandparent") < css.indexOf(".setAttributesTestParent"));
        assertTrue("parent CSS should be written before child CSS",
                css.indexOf(".setAttributesTestParent") < css.indexOf(".setAttributesTestChild"));
        // Verify CSS sorts alphabetically when frequency (# of dependents) the same
        assertTrue("Components with same number of dependnecies should be ordered alphabetically",
                css.indexOf(".setAttributesTestAnotherChild") < css.indexOf(".setAttributesTestChild"));
    }
}
