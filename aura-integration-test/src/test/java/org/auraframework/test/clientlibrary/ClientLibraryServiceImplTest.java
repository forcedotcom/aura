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
package org.auraframework.test.clientlibrary;

import java.net.URLDecoder;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.clientlibrary.ClientLibraryResolver;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.clientlibrary.ClientLibraryResolverRegistryImpl;
import org.auraframework.impl.clientlibrary.ClientLibraryServiceImpl;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.ClientLibraryException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonReader;

/**
 * Unit tests for {@link ClientLibraryServiceImpl}. Coverage should include {@link ClientLibraryResolverRegistryImpl},
 * and framework implementations of {@link org.auraframework.clientlibrary.ClientLibraryResolver}
 */
public class ClientLibraryServiceImplTest extends AuraImplTestCase {
    ClientLibraryService clientLibraryService;

    public ClientLibraryServiceImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        ContextService contextService = Aura.getContextService();
        AuraContext context = contextService.getCurrentContext();
        if (context == null) {
            contextService.startContext(AuraContext.Mode.SELENIUM, AuraContext.Format.HTML,
                    AuraContext.Authentication.AUTHENTICATED);
        }
        clientLibraryService = Aura.getClientLibraryService();
    }

    @Override
    public void tearDown() throws Exception {
        ContextService contextService = Aura.getContextService();
        AuraContext context = contextService.getCurrentContext();
        if (context != null) {
            contextService.endContext();
        }
        super.tearDown();
    }

    /**
     * Verify the ClientLibraryService used by Aura Standalone. It is important that ClientLibraryServiceImpl is used
     * for aura standalone.
     */
    public void testClientLibraryService() {
        ClientLibraryService cls = Aura.getClientLibraryService();
        assertTrue(cls instanceof ClientLibraryServiceImpl);
    }

    // SFDC uses UIPerf
    @UnAdaptableTest
    public void testUIPerfCSS() throws Exception {
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("UIPerfCSS", null, ClientLibraryDef.Type.CSS,
                null, false, null, null);
        String url = clientLibraryService.getResolvedUrl(clientLibrary);
        assertTrue(url.contains("UIPerf.css"));
    }

    // SFDC uses UIPerf
    @UnAdaptableTest
    public void testUIPerfJS() throws Exception {
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("UIPerf", null, ClientLibraryDef.Type.JS,
                null, false, null, null);
        String url = clientLibraryService.getResolvedUrl(clientLibrary);
        assertTrue(url.contains("UIPerf.js"));
    }

    // SFDC uses UIPerf
    @UnAdaptableTest
    public void testUIPerfUiJS() throws Exception {
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("UIPerfUi", null, ClientLibraryDef.Type.JS,
                null, false, null, null);
        String url = clientLibraryService.getResolvedUrl(clientLibrary);
        assertTrue(url.contains("UIPerfUi.js"));
    }

    public void testWriteResourcesCSS() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        context.setApplicationDescriptor(appDesc);
        Aura.getDefinitionService().updateLoaded(appDesc);

        StringBuilder sb = new StringBuilder();
        clientLibraryService.writeCss(context, sb);
        String libraryContent = sb.toString();
        assertTrue("Missing resource CSS", libraryContent.contains("clientLibraryTestStyle"));

        try {
            clientLibraryService.writeCss(context, null);
            fail("Should not be able to write to null stream");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "Output cannot be null");
        }
    }

    public void testWriteResourcesJS() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService()
                .getDefDescriptor("clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        context.setApplicationDescriptor(appDesc);
        Aura.getDefinitionService().updateLoaded(appDesc);
        StringBuilder sb = new StringBuilder();

        clientLibraryService.writeJs(context, sb);
        String libraryContent = sb.toString();
        assertTrue("Missing resource JS", libraryContent.contains("clientLibraryTest"));

        try {
            clientLibraryService.writeJs(context, null);
            fail("Should not be able to write to null stream");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "Output cannot be null");
        }

    }

    public void testGetResolvedUrl() {
        assertNull(clientLibraryService.getResolvedUrl(null));

        // Non existing
        ClientLibraryDef badClientLibrary = vendor.makeClientLibraryDef("UIPerfCSS", null, Type.JS,
                null, false, null, null);
        assertNull(clientLibraryService.getResolvedUrl(badClientLibrary));

        // Null name and null type
        ClientLibraryDef nullsClientLibrary = vendor.makeClientLibraryDef(null, null, null,
                null, false, null, null);
        assertNull(clientLibraryService.getResolvedUrl(nullsClientLibrary));

        // When url is present, no resolving required
        ClientLibraryDef urlClientLibrary = vendor.makeClientLibraryDef(null,
                "js://clientLibraryTest.clientLibraryTest", Type.JS,
                null, false, null, null);
        assertEquals("js://clientLibraryTest.clientLibraryTest", clientLibraryService.getResolvedUrl(urlClientLibrary));
    }

    public void testCanCombine() throws Exception {
        assertFalse(clientLibraryService.canCombine(null));

        ClientLibraryDef combinableURL = vendor.makeClientLibraryDef("combinableUrl_test", "", Type.JS,
                null, true, null, null);
        ClientLibraryResolver combinableResolver = new ClientLibraryResolver() {
            @Override
            public String getName() {
                return "combinableUrl_test";
            }

            @Override
            public Type getType() {
                return Type.JS;
            }

            @Override
            public boolean canCombine() {
                return true;
            }

            @Override
            public String getLocation() {
                return null;
            }

            @Override
            public String getUrl() {
                return null;
            }
        };
        ClientLibraryResolverRegistryImpl.INSTANCE.register(combinableResolver);
        assertTrue(clientLibraryService.canCombine(combinableURL));

        ClientLibraryResolver unCombinableResolver = new ClientLibraryResolver() {
            @Override
            public String getName() {
                return "combinableUrl_test";
            }

            @Override
            public Type getType() {
                return Type.JS;
            }

            @Override
            public String getLocation() {
                return null;
            }

            @Override
            public String getUrl() {
                return null;
            }

            @Override
            public boolean canCombine() {
                return false;
            }
        };
        ClientLibraryResolverRegistryImpl.INSTANCE.register(unCombinableResolver);
        assertFalse(clientLibraryService.canCombine(combinableURL));
    }

    public void testLibraryDefWithUrlCanBeCombinedWithoutUsingResolver() throws Exception {
        ClientLibraryDef combinableURL = vendor.makeClientLibraryDef("fooBar",
                "js://clientLibraryTest.clientLibraryTest", Type.JS,
                null, true, null, null);
        assertTrue("ResourceDef should always to combined", clientLibraryService.canCombine(combinableURL));
        ClientLibraryDef unCombinableURL = vendor.makeClientLibraryDef("fooBar",
                "js://clientLibraryTest.clientLibraryTest", Type.JS,
                null, false, null, null);
        assertTrue("ResourceDef should always to combined", clientLibraryService.canCombine(unCombinableURL));
        // TODO: If a library cannot be resolved, can it still be combined?

        ClientLibraryDef blankURL = vendor.makeClientLibraryDef("fooBar", "", Type.JS,
                null, true, null, null);
        try {
            clientLibraryService.canCombine(blankURL);
            fail("Client library will blank url and no resolver should throw exception");
        } catch (QuickFixException qfe) {
            assertTrue(qfe instanceof ClientLibraryException);
        }
    }

    public void testGetUrlsWithoutEstablishingContext() throws Exception {
        Aura.getContextService().endContext();
        try {
            clientLibraryService.getUrls(null, Type.JS);
            fail("Should not be able to getUrls() without a context.");
        } catch (Exception e) {
            checkExceptionFull(e, NoContextException.class, "AuraContext was not established");
        }
    }

    public void testGetUrlsWithNullArgument() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> urls = getClientLibraryUrls(appDesc, null);
        assertEquals(0, urls.size());
    }

    public void testGetUrlsWithSimpleApp() throws Exception {
        // UTEST mode
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(2, jsUrls.size());
        Iterator<String> it = jsUrls.iterator();
        assertEquals(getResolver("CkEditor", Type.JS).getUrl(), it.next());
        String resourceUrl = it.next();
        assertRootComponentResourceUrl(appDesc, resourceUrl, Type.JS);

        Set<String> cssUrls = getClientLibraryUrls(appDesc, Type.CSS);
        assertEquals(1, cssUrls.size());
        it = cssUrls.iterator();
        resourceUrl = it.next();
        assertRootComponentResourceUrl(appDesc, resourceUrl, Type.CSS);
    }

    // SFDC uses UIPerf
    @UnAdaptableTest
    public void testGetUrlsChangesWithMode() throws Exception {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(4, jsUrls.size());
        Iterator<String> it = jsUrls.iterator();
        assertEquals(getResolver("UIPerf", Type.JS).getUrl(), it.next());
        assertEquals(getResolver("UIPerfUi", Type.JS).getUrl(), it.next());
        assertEquals(getResolver("CkEditor", Type.JS).getUrl(), it.next());
        String resourceUrl = it.next();
        assertRootComponentResourceUrl(appDesc, resourceUrl, Type.JS);
    }

    public void testCaseSensitiveName() throws Exception {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.STATS, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        try {
            getClientLibraryUrls(appDesc, Type.CSS);
            fail("Should have thrown exception for no resolver");
        } catch (Exception e) {
            checkExceptionFull(e, ClientLibraryException.class, "Client library must have resolver if url is blank: UIPerfCsS");
        }
    }

    public void testDifferentModes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED, laxSecurityApp);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for PTEST mode", jsUrls.contains("http://likeaboss.com/mode.js"));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.CADENCE, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for CADENCE mode", jsUrls.contains("http://likeaboss.com/mode.js"));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.DEV, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for DEV mode", jsUrls.contains("http://likeaboss.com/mode.js"));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.STATS, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for STATS mode", jsUrls.contains("http://likeaboss.com/mode.js"));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.JSTEST, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertFalse("Library should not be included for JSTEST mode", jsUrls.contains("http://likeaboss.com/mode.js"));

    }

    public void testGetUrlsForAppWithDependencies() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(6, jsUrls.size());

        Iterator<String> it = jsUrls.iterator();
        // Order in the Root component's body is correct
        assertEquals("http://likeaboss.com/topOfBody.js", it.next());
        it.remove();
        assertEquals("http://likeaboss.com/endOfBody.js", it.next());
        it.remove();
        assertEquals("http://likeaboss.com/duplicate.js", it.next());
        it.remove();

        //
        // FIXME: order is not maintained.
        //
        String url;

        url = "http://likeaboss.com/facet.js";
        assertTrue("did not find "+url, jsUrls.contains(url));
        url = "http://likeaboss.com/child.js";
        assertTrue("did not find "+url, jsUrls.contains(url));
        url = "http://likeaboss.com/parent.js";
        assertTrue("did not find "+url, jsUrls.contains(url));

    }

    private void assertRootComponentResourceUrl(DefDescriptor<? extends BaseComponentDef> desc, String resourceUrl,
            Type resourceType) throws Exception {
        String suffix = (resourceType == Type.JS) ? "/resources.js" : "/resources.css";
        resourceUrl = URLDecoder.decode(resourceUrl, "UTF-8");
        assertTrue(resourceUrl.startsWith("/l/"));
        assertTrue(resourceUrl.endsWith(suffix));
        resourceUrl = resourceUrl.substring("/l/".length(), resourceUrl.length() - suffix.length());
        @SuppressWarnings("unchecked")
        Map<String, Object> configMap = (Map<String, Object>) new JsonReader().read(resourceUrl);
        assertEquals(desc.getDescriptorName(), configMap.get("app"));
    }

    private Set<String> getClientLibraryUrls(DefDescriptor<? extends BaseComponentDef> desc, Type libraryType)
            throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setApplicationDescriptor(desc);
        // TODO: Why this extra step, should the Client Library service take care of loading the appDesc def and
        // returning the urls?
        Aura.getDefinitionService().updateLoaded(desc);
        Set<String> urls = clientLibraryService.getUrls(context, libraryType);
        return urls;
    }

    private ClientLibraryResolver getResolver(String name, Type type) {
        return ClientLibraryResolverRegistryImpl.INSTANCE.get(name, type);
    }
}
