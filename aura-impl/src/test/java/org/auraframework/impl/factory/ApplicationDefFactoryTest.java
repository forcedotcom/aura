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
package org.auraframework.impl.factory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.BundleSource;
import org.auraframework.util.test.annotation.XFailure;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * Tests for application def factory.
 *
 * The structure of these tests is to use the bundle compiler to compile a variety of scenarios and verify
 * that they work. There are tests to ensure that the correct attributes are disabled in custom namespaces
 * and permitted in internal namespaces. Generally, if there are a group of tests for values, there is only one
 * set of those in the most constrained environment (e.g. if it is allowed in custom, test in custom).
 *
 * Test Naming:
 * * testCustomTheTestName : Custom namespace
 * * testPrivilegedTheTestName : Privileged namespace
 * * testInternalTheTestName : Internal namespace
 */
public class ApplicationDefFactoryTest extends BaseComponentDefFactoryTest<ApplicationDef> {
    @Inject
    ApplicationDefFactory applicationDefFactory;

    public ApplicationDefFactoryTest() {
        super("<aura:application %s>%s</aura:application>", ApplicationDef.class);
    }

    @PostConstruct
    public void setupFactory() {
        setFactory(applicationDefFactory);
    }

    /////////////////////////////////////////////////////////////////////////////
    // App cache attribute (deprecated by browsers)
    /////////////////////////////////////////////////////////////////////////////
    @Test
    @XFailure
    public void testCustomAppCacheDefault() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application />")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNull(def.isAppcacheEnabled());
    }

    @Test
    public void testCustomAppCacheTrue() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application useAppcache='true' />")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(Boolean.TRUE, def.isAppcacheEnabled());
    }

    @Test
    public void testCustomAppCacheFalse() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application useAppcache='false' />")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(Boolean.FALSE, def.isAppcacheEnabled());
    }

    @Test
    @XFailure
    public void testCustomAppCacheInvalid() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application useAppcache='invalid'/>")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);

        def.validateDefinition();
        // This is actually incorrect, but we have released this way, and we won't fix, as
        // we will deprecate this rather than going through the process of versioning a check.
        assertNull(def.isAppcacheEnabled());
    }

    @Test
    @XFailure
    public void testInternalAppCacheDefault() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application />")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNull(def.isAppcacheEnabled());
    }

    @Test
    public void testInternalAppCacheTrue() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ApplicationDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ApplicationDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.APPLICATION, "<aura:application useAppcache='true' />")));
        ApplicationDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(Boolean.TRUE, def.isAppcacheEnabled());
    }


    /////////////////////////////////////////////////////////////////////////////
    // App cache additional urls attribute (deprecated by browsers)
    /////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomAppCacheAdditional() throws Exception {
    }

    @Test
    public void testInternalAppCacheAdditional() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // preload : deprecated, in favor of <aura:dependency>
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomPreloadNegative() throws Exception {
    }

    @Test
    public void testInternalPreload() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // tracking
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomTrackNegative() throws Exception {
    }

    @Test
    public void testInternalTrack() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // location change
    /////////////////////////////////////////////////////////////////////////////
 
    @Test
    public void testCustomLocationChangeNegative() throws Exception {
    }

    @Test
    public void testInternalLocationChange() throws Exception {
    }


    /////////////////////////////////////////////////////////////////////////////
    // template
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomTemplate() throws Exception {
    }


    @Test
    public void testInternalTemplate() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // token overrides
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomTokenOverridesNegative() throws Exception {
    }

    @Test
    public void testInternalTokenOverrides() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // flavor overrides
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomFlavorOverridesNegative() throws Exception {
    }

    @Test
    public void testInternalFlavorOverrides() throws Exception {
    }

    /////////////////////////////////////////////////////////////////////////////
    // bootstrap cache expiration
    /////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomBootstrapCacheNegative() throws Exception {
    }

    @Test
    public void testInternalBootstrapCacheOverrides() throws Exception {
    }
}
