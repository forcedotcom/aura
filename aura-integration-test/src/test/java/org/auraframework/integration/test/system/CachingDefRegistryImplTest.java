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
package org.auraframework.integration.test.system;

import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.CachingDefRegistryImpl;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * This class has automation to verify behavior of {@link CachingDefRegistryImpl}.
 */
@ThreadHostileTest("relies on cache state/contents")
public class CachingDefRegistryImplTest extends AuraImplTestCase {
    private static final int CACHE_SIZE_MAX = 1024;

    public CachingDefRegistryImplTest() {
        // The behavior of caching Def registry changes based on Context.
        // So it is necessary to let each test case set its own context
    	this.setShouldSetupContext(false);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // Establish a PROD context
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
    }

    @Override
    public void tearDown() throws Exception {
        // Make sure the context is ended, if it was not ended by the test case.
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        super.tearDown();
    }

    /**
     * Fill up the cache with defs and try to get a new def.
     */
    @Test
    public void testFetchDefsAfterFillingUpCache() throws Exception {
        List<DefDescriptor<ComponentDef>> dummyDefs = fillCachingDefRegistryForComponents();
        // Fetch the defs that were used to fill up the cache initially, chances are most of them were thrown out when
        // the cache was full
        assertTrue(dummyDefs.size() >= CACHE_SIZE_MAX / 2);
        for (int i = 0; i < CACHE_SIZE_MAX / 2; i++) {
            DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor(dummyDefs.get(i).getDescriptorName(),
                    ComponentDef.class);
            assertTrue(definitionService.exists(dd));
            assertNotNull("Failed to fetch def from caching def registry.", definitionService.getDefinition(dd));
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
        ComponentDef initialDef = definitionService.getDefinition(dd);
        long initialTimeStamp = initialDef.getLocation().getLastModified();

        // Have to stop and start context because a given def is cached in MasterDefRegistry per request (context of the
        // request)
        contextService.endContext();
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);

        StringSource<?> source = (StringSource<?>) getSource(dd);
        source.addOrUpdate(String.format(markup, "<aura:attribute type=\"String\" name=\"attr\"/>"));
        // Verify that the initial def object hasn't been updated
        assertEquals(initialTimeStamp, initialDef.getLocation().getLastModified());

        // Fetch the def
        assertTrue(definitionService.exists(dd));
        ComponentDef updatedDef = definitionService.getDefinition(dd);
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
    @Test
    public void testForStaleCheckWhenRegistryFull() throws Exception {
        long startTimeStamp = System.currentTimeMillis() - 60000;
        String markup = "<aura:component> %s </aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, String.format(markup, ""));
        ((StringSource<?>) getSource(dd)).setLastModified(startTimeStamp);
        ComponentDef initialDef = definitionService.getDefinition(dd);
        long initialTimeStamp = initialDef.getLocation().getLastModified();
        assertEquals(startTimeStamp, initialTimeStamp);
        fillCachingDefRegistryForComponents();

        // Have to stop and start context because a given def is cached in MasterDefRegistry per request (context of the
        // request)
        contextService.endContext();
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED, laxSecurityApp);
        StringSource<?> source = (StringSource<?>) getSource(dd);
        source.addOrUpdate(String.format(markup, "<aura:attribute type=\"String\" name=\"attr\"/>"));
        source.setLastModified(startTimeStamp + 5);
        // Verify that the initial def object hasn't been updated
        assertEquals(initialTimeStamp, initialDef.getLocation().getLastModified());

        // Fetch the def
        assertTrue(definitionService.exists(dd));
        ComponentDef updatedDef = definitionService.getDefinition(dd);
        // Verify that stale check has been performed
        long updatedTimeStamp = updatedDef.getLocation().getLastModified();
        assertEquals("Time stamp on def should have been updated", startTimeStamp + 5, updatedTimeStamp);
        assertTrue(updatedDef instanceof BaseComponentDefImpl);
        BaseComponentDefImpl<?> def = (BaseComponentDefImpl<?>) updatedDef;
        assertNotNull("Failed to obtain the updated component Def", def.getAttributeDef("attr"));
    }

    @Test
    public void testLocationCaching() throws Exception {
        // Load something from a ResourceSource, which does caching... except it turns out that no such animal exists;
        // even the built-ins are loaded from source (and so from file) under "mvn test", so we have to look to see what
        // world we're in.
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
     * There's can be multiple CachingDegRegistry. We will fill up the one used to store component defs (markup://xx:xx)
     */
    private List<DefDescriptor<ComponentDef>> fillCachingDefRegistryForComponents() throws Exception {
        // Fill up the cache
        String markup = "<aura:component> %d </aura:component>";
        List<DefDescriptor<ComponentDef>> dummyDefs = Lists.newArrayList();
        // Fill up twice the capacity to make sure the initial set of defs are thrown out
        for (int i = 0; i < CACHE_SIZE_MAX * 2; i++) {
            DefDescriptor<ComponentDef> dummyCmps = addSourceAutoCleanup(ComponentDef.class, String.format(markup, i));
            definitionService.getDefinition(dummyCmps);
            dummyDefs.add(dummyCmps);
        }
        return dummyDefs;
    }

    /**
     * Test to verify that information stored about descriptor in cache are correct.
     */
    @Test
    public void testExists() {
        String markup = "<aura:component></aura:component>";
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class, markup);
        assertTrue("Failed to find an existing def.", dd.exists());

        // The value should be cached
        assertTrue("Should have fetched the def from the cache.", dd.exists());

        // Create a descriptor but do not add it.
        DefDescriptor<ComponentDef> nonExisting = getAuraTestingUtil().createStringSourceDescriptor(
                "nonExisting", ComponentDef.class, null);
        definitionService.getDefDescriptor(nonExisting.getDescriptorName(), ComponentDef.class);
        assertFalse("How can a non existing def exist?", nonExisting.exists());
        /*
         * The cached value. Well, this test cannot really guarantee that the exists() really returned the value from
         * the cache. It does verify that the CachingDefRegsitryImpl is returning the right value. and that's the
         * functionality the unit test cares
         */
        assertFalse("How can a non existing def exist in the cache?", nonExisting.exists());
    }
}
