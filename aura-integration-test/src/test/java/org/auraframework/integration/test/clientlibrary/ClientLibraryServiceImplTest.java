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
package org.auraframework.integration.test.clientlibrary;

import java.util.Iterator;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.AuraConfiguration;
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
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;

/**
 * Unit tests for {@link ClientLibraryServiceImpl}. Coverage should include {@link ClientLibraryResolverRegistryImpl},
 * and framework implementations of {@link org.auraframework.clientlibrary.ClientLibraryResolver}
 */
public class ClientLibraryServiceImplTest extends AuraImplTestCase {
    ClientLibraryService clientLibraryService;

    public ClientLibraryServiceImplTest(String name) {
        super(name);
        // start spring context for injected ClientLibraryService
        getAuraTestingUtil().startSpringContext(AuraConfiguration.class);
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

    public void testContextPath() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<ApplicationDef> appDesc = definitionService
                .getDefDescriptor("clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        context.setApplicationDescriptor(appDesc);
        String coolContext = "/cool";
        context.setContextPath(coolContext);
        definitionService.updateLoaded(appDesc);

        Set<String> urlSet = clientLibraryService.getUrls(context, Type.JS);
        Pattern pattern = Pattern.compile("/auraFW|/l/");
        for (String url : urlSet) {
            Matcher matcher = pattern.matcher(url);
            while (matcher.find()) {
                int start = matcher.start();
                String cool = url.substring(start - 5, start);
                if (!cool.equals(coolContext)) {
                    fail("Context path was not prepended to Aura urls");
                }
            }
        }
    }

    public void testGetUrlsWithNullArgument() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> urls = getClientLibraryUrls(appDesc, null);
        assertEquals(0, urls.size());
    }

    @UnAdaptableTest
    public void testGetUrlsChangesWithMode() throws Exception {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(1, jsUrls.size());
        Iterator<String> it = jsUrls.iterator();
        assertEquals(getResolver("CkEditor", Type.JS).getUrl(), it.next());
    }

    // Should we do this with a simple string source?
    @Ignore("TODO: W-2970512 Need more libraries to test this")
    public void testCaseSensitiveName() throws Exception {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.STATS, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);

        Set<String> res = getClientLibraryUrls(appDesc, Type.CSS);
        assertFalse(res.isEmpty());
    }

    public void testDifferentModes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        String url = getResolver("CkEditor", Type.JS).getUrl();
        System.out.println(url);

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        System.out.println(jsUrls);
        assertTrue("Missing library for PTEST mode", jsUrls.contains(url));

        Aura.getContextService().endContext();
        Aura.getContextService()
                .startContext(Mode.CADENCE, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for CADENCE mode", jsUrls.contains(url));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.DEV, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for DEV mode", jsUrls.contains(url));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.STATS, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for STATS mode", jsUrls.contains(url));

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.JSTEST, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for JSTEST mode", jsUrls.contains(url));
    }

    public void testGetUrlsForAppWithDependencies() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        String url = getResolver("CkEditor", Type.JS).getUrl();
        assertEquals(1, jsUrls.size());
        assertTrue(jsUrls.contains(url));
    }

    @Ignore("TODO: W-2970512 Need test only injection of random1 & random2")
    public void testGetUrlsForAppWithDependenciesInPTESTMode() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(3, jsUrls.size());
        String url;
        Iterator<String> it = jsUrls.iterator();

        url = getResolver("CkEditor", Type.JS).getUrl();
        assertEquals(url, it.next());
        it.remove();

        url = getResolver("random1", Type.JS).getUrl();
        assertEquals(url, it.next());
        it.remove();

        url = getResolver("randoem2", Type.JS).getUrl();
        assertEquals(url, it.next());
        it.remove();
    }

    /**
     * Verify ClientLibraryService doesn't process ClientLibraryDef whose name contain separated library names.
     * Each library name has to have its own aura:clientLibrary tag.
     */
    public void testCommaSeparatedStringInNameWillNotResolve() throws Exception {
        ClientLibraryService tmpService = new ClientLibraryServiceImpl();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("MyLib, MyLib2", ClientLibraryDef.Type.JS,
                null, null, null);
        String url = tmpService.getResolvedUrl(clientLibrary);
        assertNull("Expected null if a invalid library name was specified", url);
    }

    private Set<String> getClientLibraryUrls(DefDescriptor<? extends BaseComponentDef> desc, Type libraryType)
            throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setApplicationDescriptor(desc);
        // TODO: Why this extra step, should the Client Library service take care of loading the appDesc def and
        // returning the urls?
        definitionService.updateLoaded(desc);
        Set<String> urls = clientLibraryService.getUrls(context, libraryType);
        return urls;
    }

    private ClientLibraryResolver getResolver(String name, Type type) {
        return ClientLibraryResolverRegistryImpl.INSTANCE.get(name, type);
    }
}
