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
package org.auraframework.impl.system;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutsDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;

import com.google.common.collect.Lists;

/**
 * This class has automation to verify behavior of
 * {@link aura.impl.system.CachingDefRegistryImpl} . ThreadHostile due to cache
 * filling assumptions.
 */
@ThreadHostileTest
public class CachingDefRegistryImplTest extends AuraImplTestCase {
    private static final int CACHE_SIZE_MAX = 1024;

    public CachingDefRegistryImplTest(String name) {
        // The behavior of caching Def registry changes based on Context.
        // So it is necessary to let each test case set its own context
        super(name, false);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // Establish a PROD context
        Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED, laxSecurityApp);

    }

    @Override
    public void tearDown() throws Exception {
        // Make sure the context is ended, if it was not ended by the test case.
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        super.tearDown();
    }

    /**
     * Automation to verify that, in test mode definitions are fetched fresh for
     * each request.
     */
    public void testDefinitionsFetchingInTestMode() throws Exception {
        // Obtain the definition of an application without layout and make sure
        // the
        // layoutsDefDescriptor is null
        ApplicationDef appWithNoLayout = auraTestingUtil.addSourceAutoCleanup(ApplicationDef.class,
        "<aura:application></aura:application>").getDef();
        DefDescriptor<ApplicationDef> appDesc = appWithNoLayout.getDescriptor();
        assertNotNull("Test failed to retrieve definition of an application.", appWithNoLayout);
        assertNull("Application should not have had any layouts associted with it.",
                appWithNoLayout.getLayoutsDefDescriptor());

        // Add a new layouts file to the application.
        DefDescriptor<LayoutsDef> layoutDesc = DefDescriptorImpl.getInstance(appDesc.getDescriptorName(),
                LayoutsDef.class);
        String layoutData = "<aura:layouts catchall='home' default='home'>" + "<aura:layout name='home' title='Home'>"
        + "<aura:layoutItem container='content'>" + "Home" + "</aura:layoutItem>" + "</aura:layout>"
        + "</aura:layouts>";
        auraTestingUtil.addSourceAutoCleanup(layoutDesc, layoutData);

        // We are still fetching definition in PROD mode, so it should fetch the
        // definition from
        // cache. So no layout def yet.
        appWithNoLayout = definitionService.getDefinition(appDesc);
        assertNotNull("Test failed to retrieve definition of an application.", appWithNoLayout);
        assertNull("In PROD mode, new layout file should not have been fetched.",
                appWithNoLayout.getLayoutsDefDescriptor());

        Aura.getContextService().endContext();
        // Fetch definition in TEST mode
        Aura.getContextService().startContext(Mode.UTEST, null, Format.JSON, Access.AUTHENTICATED);
        appWithNoLayout = definitionService.getDefinition(appDesc);
        assertNotNull("Test failed to retrieve definition of an application.", appWithNoLayout);
        assertNotNull("Fetching definition is TESt mode should have noticed the new layout file.",
                appWithNoLayout.getLayoutsDefDescriptor());
        assertNotNull("Failed to read definition from new layout file.", appWithNoLayout.getLayoutsDefDescriptor()
                .getDef());
    }

    /**
     * Fill up the cache with defs and try to get a new def.
     * 
     * @throws Exception
     */
    public void testFetchDefsAfterFillingUpCache() throws Exception {
        List<DefDescriptor<ComponentDef>> dummyDefs = fillCachingDefRegistryForComponents();
        // Fetch the defs that were used to fill up the cache initially, chances
        // are most of them
        // were thrown out when the cache was full
        assertTrue(dummyDefs.size() >= CACHE_SIZE_MAX / 2);
        for (int i = 0; i < CACHE_SIZE_MAX / 2; i++) {
            DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor(dummyDefs.get(i).getDescriptorName(),
                    ComponentDef.class);
            assertTrue(Aura.getContextService().getCurrentContext().getDefRegistry().exists(dd));
            assertNotNull("Failed to fetch def from caching def registry.", dd.getDef());
            assertEquals("Definition service failed to retrieve the correct definition", dummyDefs.get(i)
                    .getQualifiedName(), dd.getQualifiedName());
        }
    }

    /**
     * Verify staleness check is done when CachingDefRegistry is not filled up.
     */
    public void _testForStaleCheckWhenRegistryPartiallyFull() throws Exception {
        String markup = "<aura:component> %s </aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, String.format(markup, ""));
        ComponentDef initialDef = dd.getDef();
        long initialTimeStamp = initialDef.getLocation().getLastModified();

        // Have to stop and start context because a given def is cached in
        // MasterDefRegistry per
        // request (context of the request)
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED, laxSecurityApp);

        StringSource<?> source = (StringSource<?>) auraTestingUtil.getSource(dd);
        source.addOrUpdate(String.format(markup, "<aura:attribute type=\"String\" name=\"attr\"/>"));
        // Verify that the initial def object hasn't been updated
        assertEquals(initialTimeStamp, initialDef.getLocation().getLastModified());

        // Fetch the def
        assertTrue(Aura.getContextService().getCurrentContext().getDefRegistry().exists(dd));
        ComponentDef updatedDef = dd.getDef();
        // Verify that stale check has been performed
        long updatedTimeStamp = updatedDef.getLocation().getLastModified();
        assertTrue("Time stamp on def should have been updated", updatedTimeStamp > initialTimeStamp);
        assertTrue(updatedDef instanceof BaseComponentDefImpl);
        BaseComponentDefImpl<?> def = (BaseComponentDefImpl<?>) updatedDef;
        assertNotNull("Failed to obtain the updated component Def", def.getAttributeDef("attr"));
    }

    /**
     * verify staleness check is done when CachingDefRegistry is filled up.
     */
    // Flaps in SFDC build W-1265411
    @UnAdaptableTest
    public void testForStaleCheckWhenRegistryFull() throws Exception {
        long startTimeStamp = System.currentTimeMillis() - 60000;
        String markup = "<aura:component> %s </aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, String.format(markup, ""));
        ((StringSource<?>) auraTestingUtil.getSource(dd)).setLastModified(startTimeStamp);
        ComponentDef initialDef = dd.getDef();
        long initialTimeStamp = initialDef.getLocation().getLastModified();
        assertEquals(startTimeStamp, initialTimeStamp);
        fillCachingDefRegistryForComponents();

        // Have to stop and start context because a given def is cached in
        // MasterDefRegistry per
        // request (context of the request)
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED, laxSecurityApp);
        StringSource<?> source = (StringSource<?>) auraTestingUtil.getSource(dd);
        source.addOrUpdate(String.format(markup, "<aura:attribute type=\"String\" name=\"attr\"/>"));
        source.setLastModified(startTimeStamp + 5);
        // Verify that the initial def object hasn't been updated
        assertEquals(initialTimeStamp, initialDef.getLocation().getLastModified());

        // Fetch the def
        assertTrue(Aura.getContextService().getCurrentContext().getDefRegistry().exists(dd));
        ComponentDef updatedDef = dd.getDef();
        // Verify that stale check has been performed
        long updatedTimeStamp = updatedDef.getLocation().getLastModified();
        assertEquals("Time stamp on def should have been updated", startTimeStamp + 5, updatedTimeStamp);
        assertTrue(updatedDef instanceof BaseComponentDefImpl);
        BaseComponentDefImpl<?> def = (BaseComponentDefImpl<?>) updatedDef;
        assertNotNull("Failed to obtain the updated component Def", def.getAttributeDef("attr"));
    }

    public void testLocationCaching() throws Exception {
        // Load something from a ResourceSource, which does caching... except it
        // turns out that no
        // such animal exists; even the built-ins are loaded from source (and so
        // from file) under
        // "mvn test", so we have to look to see what world we're in.
        ComponentDef component = definitionService.getDefinition("aura:component", ComponentDef.class);
        if (!component.getLocation().getFileName().contains("/src/main/components/")) {
            // Okay, we didn't load from source, go ahead and check:
            assertTrue("no cache for built-in component " + component.getLocation().getFileName(), component
                    .getLocation().hasCacheEntry());
            String cacheFile = component.getLocation().getCacheFile();
            assertTrue("built-in component has too-short cacheFile \"" + cacheFile + "\"", cacheFile.length() > 1);
        }

        // Assured non-resource has no caching set:
        String markup = "<aura:component> %s </aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, String.format(markup, ""));
        component = definitionService.getDefinition(dd);
        assertFalse("string source has caching, but shouldn't", component.getLocation().hasCacheEntry());
        assertNull("string source has non-null cache file", component.getLocation().getCacheFile());
    }

    /**
     * There's can be multiple CachingDegRegistry. We will fill up the one used
     * to store component defs (markup://xx:xx)
     */
    private List<DefDescriptor<ComponentDef>> fillCachingDefRegistryForComponents() throws Exception {
        // Fill up the cache
        String markup = "<aura:component> %d </aura:component>";
        List<DefDescriptor<ComponentDef>> dummyDefs = Lists.newArrayList();
        // Fill up twice the capacity to make sure the initial set of defs are
        // thrown out
        for (int i = 0; i < CACHE_SIZE_MAX * 2; i++) {
            DefDescriptor<ComponentDef> dummyCmps = addSourceAutoCleanup(ComponentDef.class, String.format(markup, i));
            dummyCmps.getDef();
            dummyDefs.add(dummyCmps);
        }
        return dummyDefs;
    }

    /**
     * Test to verify that information stored about descriptor in cache are
     * correct.
     */
    public void testExists() {
        String markup = "<aura:component></aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, markup);
        assertTrue("Failed to find an existing def.", dd.exists());

        // The value should be cached
        assertTrue("Should have fetched the def from the cache.", dd.exists());

        // Create a descriptor but do not add it.
        DefDescriptor<ComponentDef> nonExisting = StringSourceLoader.getInstance().createStringSourceDescriptor(
                "nonExisting", ComponentDef.class);
        definitionService.getDefDescriptor(nonExisting.getDescriptorName(), ComponentDef.class);
        assertFalse("How can a non existing def exist?", nonExisting.exists());
        /*
         * The cached value. Well, this test cannot really guarantee that the
         * exists() really returned the value from the cache. It does verify
         * that the CachingDefRegsitryImpl is returning the right value. and
         * that's the functionality the unit test cares
         */
        assertFalse("How can a non existing def exist in the cache?", nonExisting.exists());
    }
}
