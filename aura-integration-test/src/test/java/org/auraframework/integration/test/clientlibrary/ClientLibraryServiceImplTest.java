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

import javax.inject.Inject;

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
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;

/**
 * Unit tests for {@link ClientLibraryServiceImpl}. Coverage should include {@link ClientLibraryResolverRegistryImpl},
 * and framework implementations of {@link org.auraframework.clientlibrary.ClientLibraryResolver}
 */
public class ClientLibraryServiceImplTest extends AuraImplTestCase {
    @Inject
    private ClientLibraryService clientLibraryService;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        AuraContext context = contextService.getCurrentContext();
        if (context == null) {
            contextService.startContext(AuraContext.Mode.SELENIUM, AuraContext.Format.HTML,
                    AuraContext.Authentication.AUTHENTICATED);
        }
    }

    @Override
    public void tearDown() throws Exception {
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
    @UnAdaptableTest
    @Test
    public void testClientLibraryService() {
        assertTrue(clientLibraryService instanceof ClientLibraryServiceImpl);
    }

    @Test
    public void testContextPath() throws Exception {
        AuraContext context = contextService.getCurrentContext();
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

    @Test
    public void testGetUrlsWithNullArgument() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> urls = getClientLibraryUrls(appDesc, null);
        assertEquals(0, urls.size());
    }

    @UnAdaptableTest
    @Test
    public void testGetUrlsChangesWithMode() throws Exception {
        contextService.endContext();
        contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertEquals(1, jsUrls.size());
        String url = getResolver("CkEditor", Type.JS).getUrl();
        assertTrue(jsUrls.contains(url));
    }

    // Should we do this with a simple string source?
    @Ignore("TODO: W-2970512 Need more libraries to test this")
    @Test
    public void testCaseSensitiveName() throws Exception {
        contextService.endContext();
        contextService.startContext(Mode.STATS, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:clientLibraryTest", ApplicationDef.class);

        Set<String> res = getClientLibraryUrls(appDesc, Type.CSS);
        assertFalse(res.isEmpty());
    }

    @Test
    public void testDifferentModes() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        String url = getResolver("CkEditor", Type.JS).getUrl();

        contextService.endContext();
        contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for PTEST mode", jsUrls.contains(url));

        contextService.endContext();
        contextService
                .startContext(Mode.CADENCE, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for CADENCE mode", jsUrls.contains(url));

        contextService.endContext();
        contextService.startContext(Mode.DEV, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for DEV mode", jsUrls.contains(url));

        contextService.endContext();
        contextService.startContext(Mode.STATS, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for STATS mode", jsUrls.contains(url));

        contextService.endContext();
        contextService.startContext(Mode.JSTEST, Format.JSON, Authentication.UNAUTHENTICATED, appDesc);
        jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        assertTrue("Missing library for JSTEST mode", jsUrls.contains(url));
    }

    @Test
    public void testGetUrlsForAppWithDependencies() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        Set<String> jsUrls = getClientLibraryUrls(appDesc, Type.JS);
        String url = getResolver("CkEditor", Type.JS).getUrl();
        assertEquals(1, jsUrls.size());
        assertTrue(jsUrls.contains(url));
    }

    @Ignore("TODO: W-2970512 Need test only injection of random1 & random2")
    @Test
    public void testGetUrlsForAppWithDependenciesInPTESTMode() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "clientLibraryTest:testDependencies", ApplicationDef.class);
        contextService.endContext();
        contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED, appDesc);
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
    @Test
    public void testCommaSeparatedStringInNameWillNotResolve() throws Exception {
        ClientLibraryService tmpService = new ClientLibraryServiceImpl();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("MyLib, MyLib2", ClientLibraryDef.Type.JS,
                null, null, null);
        String url = tmpService.getResolvedUrl(clientLibrary);
        assertNull("Expected null if a invalid library name was specified", url);
    }

    private Set<String> getClientLibraryUrls(DefDescriptor<? extends BaseComponentDef> desc, Type libraryType)
            throws Exception {
        AuraContext context = contextService.getCurrentContext();
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
