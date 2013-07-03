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

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.test.IntegrationTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.util.AuraPrivateAccessor;

/**
 * Tests for AuraServlet.
 * 
 * @since 0.0.2.48
 */
public class AuraServletIntegrationTest extends IntegrationTestCase {
    public AuraServletIntegrationTest(String name) {
        super(name);
    }

    private void assertBustedUrl(String expectedFormat, String initialValue) throws Exception {
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED);
        String buster = "" + Aura.getConfigAdapter().getBuildTimestamp();
        String expected = String.format(expectedFormat, buster);
        String actual = AuraBaseServlet.addCacheBuster(initialValue);
        assertEquals(expected, actual);
    }

    /**
     * Null input returns null
     */
    public void testAddCacheBusterToNull() throws Exception {
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED);
        assertNull(AuraBaseServlet.addCacheBuster(null));
    }

    /**
     * Empty URL string should still have the buster returned.
     */
    public void testAddCacheBusterToEmptyString() throws Exception {
        assertBustedUrl("?aura.cb=%s", "");
    }

    /**
     * Basic URL, without query or hash, has buster simply appended as query.
     */
    public void testAddCacheBusterWithoutQueryOrHash() throws Exception {
        assertBustedUrl("/something?aura.cb=%s", "/something");
    }

    /**
     * URL with query will have buster appended to query.
     */
    public void testAddCacheBusterWithQuery() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s", "/something?is=fishy");
    }

    /**
     * URL with hash will have buster appended as query (before the hash).
     */
    public void testAddCacheBusterWithHash() throws Exception {
        assertBustedUrl("/something?aura.cb=%s#toremember", "/something#toremember");
    }

    /**
     * URL with hash with query will have buster appended as query (before the hash).
     */
    public void testAddCacheBusterWithHashQuery() throws Exception {
        assertBustedUrl("/something?aura.cb=%s#layout?option=value", "/something#layout?option=value");
    }

    /**
     * URL with query and hash will have buster appended to query (before the hash).
     */
    public void testAddCacheBusterWithQueryAndHash() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s#inside", "/something?is=fishy#inside");
    }

    /**
     * URL with query and hash with query will have buster appended to query (before the hash).
     */
    public void testAddCacheBusterWithQueryAndHashQuery() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s#inside?where=fridge", "/something?is=fishy#inside?where=fridge");
    }

    private Runnable touchSource(final DefDescriptor<?> toUpdate) {
        return new Runnable() {
            @Override
            public void run() {
                final Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry()
                        .getSource(toUpdate);
                final String originalContent = source.getContents();
                source.addOrUpdate(originalContent + " ");
                Aura.getDefinitionService().onSourceChanged(source.getDescriptor(), SourceMonitorEvent.changed);
                addTearDownStep(new Runnable() {
                    @Override
                    public void run() {
                        source.addOrUpdate(originalContent);
                    }
                });
            }
        };
    }

    private Runnable simulateFrameworkUpdate() {
        return new Runnable() {
            @Override
            public void run() {
                try {
                    long newStamp = AuraBaseServlet.getLastMod() + 1;
                    ConfigAdapter configAdapter = Aura.getConfigAdapter();
                    AuraPrivateAccessor.set(configAdapter, "buildTimestamp", newStamp);
                    Object jsGroup = AuraPrivateAccessor.get(configAdapter, "jsGroup");
                    if (jsGroup != null) {
                        Object bundle = AuraPrivateAccessor.get(jsGroup, "bundle");
                        AuraPrivateAccessor.set(bundle, "lastMod", newStamp);
                    }
                } catch (Exception e) {
                    throw new Error("Failed to simulate framework update", e);
                }
            }
        };
    }

    private void assertLastModAfterUpdate(Mode mode, DefDescriptor<ApplicationDef> appDesc, Runnable update,
            boolean shouldLastModUpdate) throws Exception {
        long lastModBeforeUpdate = AuraBaseServlet.getLastMod();
        assertTrue("failed to get valid lastmod: " + lastModBeforeUpdate, lastModBeforeUpdate > 0);
        Thread.sleep(1002); // ensure lastMod changes despite system time resolution
        update.run();

        // restart context as prior context will have old lastMod
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(mode, Format.HTML, Access.AUTHENTICATED, appDesc);
        long lastModAfterUpdate = AuraBaseServlet.getLastMod();
        if (shouldLastModUpdate) {
            if (lastModBeforeUpdate >= lastModAfterUpdate) {
                fail(String.format("Did not get updated lastMod - previous: <%s>, current: <%s>", lastModBeforeUpdate,
                        lastModAfterUpdate));
            }
        } else {
            assertEquals("lastMod changed unexpectedly", lastModBeforeUpdate, lastModAfterUpdate);
        }
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModDevUpdateFrameworkJS() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        assertLastModAfterUpdate(Mode.DEV, appDesc, simulateFrameworkUpdate(), true);
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModDevUpdateCss() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(appDesc.getDef().getStyleDescriptor()), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateController() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(getClientController(appDesc.getDef())), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateMarkup() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(appDesc), true);
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModDevUpdateDependentCss() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateable", ComponentDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(depDef.getStyleDescriptor()), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateDependentController() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService()
                .getDefinition("updateTest:updateableAlso", ComponentDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(getClientController(depDef)), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateDependentMarkup() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateable", ComponentDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(depDef.getDescriptor()), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateDependentEventMarkup() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        EventDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateableEvent", EventDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(depDef.getDescriptor()), true);
    }

    @UnAdaptableTest
    public void testGetLastModDevUpdateExtendsMarkup() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithoutPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED, appDesc);
        ApplicationDef depDef = Aura.getDefinitionService()
                .getDefinition("updateTest:updateBase", ApplicationDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(depDef.getDescriptor()), true);
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModDevUpdatePreloadedCss() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithPreload", ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED,
                appDesc);
        context.addPreload("updateTest");
        ComponentDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateableOther",
                ComponentDef.class);
        assertLastModAfterUpdate(Mode.DEV, appDesc, touchSource(depDef.getStyleDescriptor()), true);
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModProdUpdateFrameworkJS() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, appDesc);
        assertLastModAfterUpdate(Mode.PROD, appDesc, simulateFrameworkUpdate(), true);
    }

    @UnAdaptableTest
    @ThreadHostileTest("invalidates caches")
    public void testGetLastModProdUpdateDependentCss() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateable", ComponentDef.class);
        assertLastModAfterUpdate(Mode.PROD, appDesc, touchSource(depDef.getStyleDescriptor()), true);
    }

    @UnAdaptableTest
    public void testGetLastModProdUpdateDependentController() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService()
                .getDefinition("updateTest:updateableAlso", ComponentDef.class);
        assertLastModAfterUpdate(Mode.PROD, appDesc, touchSource(getClientController(depDef)), true);
    }

    @UnAdaptableTest
    public void testGetLastModProdUpdateDependentMarkup() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "updateTest:updateWithPreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, appDesc);
        ComponentDef depDef = Aura.getDefinitionService().getDefinition("updateTest:updateable", ComponentDef.class);
        assertLastModAfterUpdate(Mode.PROD, appDesc, touchSource(depDef.getDescriptor()), true);
    }

    /**
     * No manifest URL when context has no preloads.
     */
    public void testGetManifestWithoutPreloads() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(
                "appPreloadTest:appCacheNoPreload", ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, desc);
        context.clearPreloads();
        assertEquals(false, ManifestUtil.isManifestEnabled());
    }

    /**
     * Get a URL when context has preloads.
     */
    @ThreadHostileTest("preload sensitive")
    public void testGetManifestWithPreloads() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(
                "appPreloadTest:appCacheNoPreload", ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, desc);
        context.clearPreloads();
        context.addPreload("aura");
        context.addPreload("ui");
        String url = ManifestUtil.getManifestUrl();
        assertEquals(
                "/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appPreloadTest%3AappCacheNoPreload%22%2C"
                        + "%22preloads%22%3A%5B%22aura%22%2C%22ui%22%5D%2C"
                        + "%22test%22%3A%22org.auraframework.http.AuraServletIntegrationTest.testGetManifestWithPreloads%22%7D/app.manifest",
                url);
    }
}
