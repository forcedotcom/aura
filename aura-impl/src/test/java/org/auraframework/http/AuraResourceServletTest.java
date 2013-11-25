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

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceListener;
import org.auraframework.test.AuraTestCase;
import org.auraframework.test.DummyHttpServletRequest;
import org.auraframework.test.DummyHttpServletResponse;

import com.google.common.collect.Sets;

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
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        HttpServletRequest request = new DummyHttpServletRequest(){
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "CSS:" + mKey + uid;

        // Verify something was actually added to cache
        String cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to CSS cache", cssCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.changed);

        cssCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNull("CSS cache not cleared after source change event", cssCache);
    }

    /**
     * Verify cache of Javascript definitions is cleared on source change in DEV mode.
     */
    public void testJsCacheClearedOnSourceChange() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        HttpServletRequest request = new DummyHttpServletRequest(){
            @Override
            public long getDateHeader(String name) {
                return -1;
            }
        };
        HttpServletResponse response = new DummyHttpServletResponse();
        AuraResourceServlet servlet = new AuraResourceServlet();
        servlet.doGet(request, response);

        final String key = "JS:" + mKey + uid;

        // Verify something was actually added to cache
        String jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNotNull("Nothing added to JS cache", jsCache);

        // Now force a source change event and verify cache is emptied
        Aura.getDefinitionService().onSourceChanged(null, SourceListener.SourceMonitorEvent.changed);

        jsCache = context.getDefRegistry().getCachedString(uid, appDesc, key);
        assertNull("JS cache not cleared after source change event", jsCache);
    }

    /**
     * Sanity check to make sure that app.js doesn't blow up
     */
    public void testWriteDefinitionsWithoutDupes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("appCache:withpreload",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.JS, AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        // prime def cache
        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeDefinitions(dependencies, output);
        String text = output.toString();
        final String dupeCheck = "$A.clientService.initDefs(";
        if (text.indexOf(dupeCheck) != text.lastIndexOf(dupeCheck)) {
            fail("found duplicated code in: " + text);
        }

        // now check that defs not re-written with unempty cache
        output = new StringBuilder();
        AuraResourceServlet.writeDefinitions(dependencies, output);
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
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance("preloadTest:test_SimpleApplication",
                ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.DEV, AuraContext.Format.CSS, AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);
        
        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeCss(dependencies, output);

        // A snippet of component css
        String cssPiece = "AuraResourceServletTest-testWriteCssWithoutDupes";
        Pattern pattern = Pattern.compile(cssPiece);
        Matcher matcher = pattern.matcher(output.toString());
        int count = 0;
        while (matcher.find() && count < 3) {
            count++;
        }
        assertEquals("Component CSS repeated", 1, count);
    }

    /**
     * Verify CSS is ordered based off number of dependencies. Super component CSS should come before compnent that
     * extends super. If two components have the same number of dependencies, they should be written out in alphabetical
     * order.
     */
    public void testCSSOrder() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("auratest:test_SimpleServerRenderedPage", ApplicationDef.class);
        DefDescriptor<ComponentDef> child1 = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:child", ComponentDef.class);
        DefDescriptor<ComponentDef> child2 = Aura.getDefinitionService()
                .getDefDescriptor("setAttributesTest:anotherchild", ComponentDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED, appDesc);
        MasterDefRegistry mdr = context.getDefRegistry();
        final String uid = mdr.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = mdr.getDependencies(uid);
        Set<DefDescriptor<?>> child1deps = mdr.getDependencies(mdr.getUid(null, child1));
        Set<DefDescriptor<?>> child2deps = mdr.getDependencies(mdr.getUid(null, child2));
        Set<DefDescriptor<?>> allDeps = Sets.newHashSet(dependencies);
        allDeps.addAll(child1deps);
        allDeps.addAll(child2deps);

        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeCss(allDeps, output);

        String css = output.toString();
        System.out.println(css);

        assertTrue("grandparent CSS should be written before parent CSS",
                css.indexOf(".setAttributesTestGrandparent") < css.indexOf(".setAttributesTestParent"));
        assertTrue("parent CSS should be written before child CSS",
                css.indexOf(".setAttributesTestParent") < css.indexOf(".setAttributesTestChild"));
        // Verify CSS sorts alphabetically when frequency (# of dependents) the same
        assertTrue("Components with same number of dependnecies should be ordered alphabetically",
                css.indexOf(".setAttributesTestAnotherChild") < css.indexOf(".setAttributesTestChild"));
    }

    public void testPreloadCSSDependencies() throws Exception {

        DefDescriptor<ComponentDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeCss(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");
        String preloaded1 = ".clientApiTestCssStyleTest{background-color:#eee}";
        String preloaded2 = ".testTestValidCSS{color:#1797c0";
        assertTrue("Does not have preloaded css", sourceNoWhitespace.contains(preloaded1));
        assertTrue("Does not have preloaded css", sourceNoWhitespace.contains(preloaded2));
    }

    public void testPreloadJSDependencies() throws Exception {
        DefDescriptor<ComponentDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientApiTest:cssStyleTest", ComponentDef.class);
        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.DEV, AuraContext.Format.CSS,
                AuraContext.Access.AUTHENTICATED, appDesc);
        final String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);

        StringBuilder output = new StringBuilder();
        AuraResourceServlet.writeDefinitions(dependencies, output);

        String sourceNoWhitespace = output.toString().replaceAll("\\s", "");

        String[] preloads = new String[]{
                "\"descriptor\":\"markup://aura:placeholder\",",
                "\"descriptor\":\"markup://ui:input\",",
                "\"descriptor\":\"markup://ui:inputText\",",
                "\"descriptor\":\"markup://ui:output\",",
                "\"descriptor\":\"markup://ui:outputText\",",
                "\"descriptor\":\"markup://test:testValidCSS\","
        };

        for (String preload : preloads) {
            assertTrue("Does not have preloaded component: (" + preload + ")" , sourceNoWhitespace.contains(preload));
        }
    }
}
