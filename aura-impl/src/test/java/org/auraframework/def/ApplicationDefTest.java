/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.def;

import java.util.Date;

import org.auraframework.Aura;
import org.auraframework.http.AuraServlet;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * ThreadHostile for at least MultipleAppCache
 */
@ThreadHostileTest
public class ApplicationDefTest extends BaseComponentDefTest<ApplicationDef> {

    public ApplicationDefTest(String name) {
        super(name, ApplicationDef.class, "aura:application");
    }

    public void testGetSecurityProviderDefDescriptorDefault() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(String.format(baseTag, "", ""), ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals("java://org.auraframework.components.DefaultSecurityProvider", appdef
                .getSecurityProviderDefDescriptor().getQualifiedName());
    }

    public void testGetSecurityProviderDefDescriptorProvided() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(String.format(baseTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows'", ""),
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals("java://org.auraframework.components.security.SecurityProviderAlwaysAllows", appdef
                .getSecurityProviderDefDescriptor().getQualifiedName());
    }

    public void testGetSecurityProviderDefDescriptorEmpty() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(String.format(baseTag, "securityProvider=''", ""),
                ApplicationDef.class);
        try {
            Aura.getDefinitionService().getDefinition(desc);
            fail("No AuraRuntimeException when securityProvider is empty string");
        } catch (AuraRuntimeException e) {
            assertEquals("QualifiedName is required for descriptors", e.getMessage());
        }
    }

    public void testGetSecurityProviderDefDescriptorInherited() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(
                String.format(
                        baseTag,
                        "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows' extensible='true'",
                        ""), ApplicationDef.class);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                String.format(baseTag, String.format("extends='%s'", parentDesc.getQualifiedName()), ""),
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals("java://org.auraframework.components.security.SecurityProviderAlwaysAllows", appdef
                .getSecurityProviderDefDescriptor().getQualifiedName());
    }

    public void testGetSecurityProviderDefDescriptorGrandInherited() throws Exception {
        DefDescriptor<ApplicationDef> grandparentDesc = addSourceAutoCleanup(
                String.format(
                        baseTag,
                        "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows' extensible='true'",
                        ""), ApplicationDef.class);
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(
                String.format(baseTag,
                        String.format("extends='%s' extensible='true'", grandparentDesc.getQualifiedName()), ""),
                ApplicationDef.class);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                String.format(baseTag, String.format("extends='%s'", parentDesc.getQualifiedName()), ""),
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals("java://org.auraframework.components.security.SecurityProviderAlwaysAllows", appdef
                .getSecurityProviderDefDescriptor().getQualifiedName());
    }

    public void testGetSecurityProviderDefDescriptorOverride() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(
                String.format(
                        baseTag,
                        "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows' extensible='true'",
                        ""), ApplicationDef.class);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                String.format(
                        baseTag,
                        String.format(
                                "extends='%s' securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'",
                                parentDesc.getQualifiedName()), ""), ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals("java://org.auraframework.components.security.SecurityProviderAlwaysDenies", appdef
                .getSecurityProviderDefDescriptor().getQualifiedName());
    }

    /**
     * App will inherit useAppcache='false' from aura:application if attribute not specified
     */
    public void testIsAppCacheEnabledInherited() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(
                String.format(baseTag, "useAppcache='true' preload='aura' extensible='true'", ""), ApplicationDef.class);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                String.format(baseTag, String.format("extends='%s' preload='aura'", parentDesc.getQualifiedName()), ""),
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from aura:application
     */
    public void testIsAppCacheEnabledOverridesDefault() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                String.format(baseTag, "useAppcache='true' preload='aura'", ""), ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from parent app
     */
    public void testIsAppCacheEnabledOverridesExtends() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(
                String.format(baseTag, "useAppcache='true' preload='aura' extensible='true'", ""), ApplicationDef.class);
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(String.format(baseTag,
                String.format("extends='%s' useAppcache='false' preload='aura'", parentDesc.getQualifiedName()), ""),
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is empty
     */
    public void testIsAppCacheEnabledUseAppcacheEmpty() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup("<aura:application useAppCache='' preload='aura'/>",
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is true, but application has no preloads
     */
    public void testIsAppCacheEnabledWithoutPreload() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup("<aura:application useAppCache='true'/>",
                ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * Test app cache with more than one app.
     */
    public void testMultipleAppCache() throws Exception {
        String appFormat = "<aura:application securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows' useAppCache='true' preload='%s'>\n    <%s:%s />\n</aura:application>";
        String componentText = "<aura:component>the body</aura:component>";
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<ComponentDef> oldcomp = loader.createStringSourceDescriptor("oldComp", ComponentDef.class);
        addSourceAutoCleanup(oldcomp, componentText);
        String appText;
        DefDescriptor<ApplicationDef> oldApp;

        appText = String.format(appFormat, oldcomp.getNamespace(), oldcomp.getNamespace(), oldcomp.getName());
        oldApp = loader.createStringSourceDescriptor("old", ApplicationDef.class);
        addSourceAutoCleanup(oldApp, appText);
        enablePreloads(oldApp);

        // With the preloads seeded, get a lastMod for the source that we know is greater.
        Date soon = new Date(Math.max(System.currentTimeMillis(), AuraServlet.getLastMod()) + 1);
        loader.updateSource(oldcomp, componentText, soon);
        loader.updateSource(oldApp, appText, soon);

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, null, Access.AUTHENTICATED, oldApp);
        enablePreloads(oldApp);
        //
        // The app should give us 'soon'
        //
        assertEquals("Expected first app to show up as soon", soon.getTime(), AuraServlet.getLastMod());
        Date later = new Date(Math.max(System.currentTimeMillis(), AuraServlet.getLastMod()) + 1);
        Aura.getContextService().endContext();

        DefDescriptor<ComponentDef> newcomp = loader.createStringSourceDescriptor("new", ComponentDef.class);
        addSourceAutoCleanup(newcomp, componentText, later);
        appText = String.format(appFormat, newcomp.getNamespace(), newcomp.getNamespace(), newcomp.getName());
        DefDescriptor<ApplicationDef> newerApp = loader.createStringSourceDescriptor("new", ApplicationDef.class);
        addSourceAutoCleanup(newerApp, appText, later);

        // Start a newerApp context in DEV mode so that we can update the lastMod cache.
        Aura.getContextService().startContext(Mode.DEV, null, Access.AUTHENTICATED, newerApp);

        // Sanity check that we get the expected answer in DEV mode.
        // assertEquals("Sanity check DEV mode lastMod update", later.getTime(), AuraServlet.getLastMod());

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, null, Access.AUTHENTICATED, newerApp);
        enablePreloads(newerApp);

        //
        // The newer app should give its newer lastmod 'later'.
        //
        assertEquals("Expected second app to show up as soon", later.getTime(), AuraServlet.getLastMod());
        Aura.getContextService().endContext();

        //
        // Switching back to dev mode should reset, and give us 'later' for the first app as the
        // namespace was updated by newer
        //
        Aura.getContextService().startContext(Mode.DEV, null, Access.AUTHENTICATED, oldApp);
        enablePreloads(newerApp);
        assertEquals("Expected first app to show up as later second time", later.getTime(), AuraServlet.getLastMod());
        Aura.getContextService().endContext();

        Aura.getContextService().startContext(Mode.PROD, null, Access.AUTHENTICATED, newerApp);
        enablePreloads(newerApp);
        assertEquals("Expected second app to show up as later second time", later.getTime(), AuraServlet.getLastMod());
        Aura.getContextService().endContext();
    }

    /**
     * Enable preloading in the current context and all the preloads from the given definition.
     * 
     * @param applicationDef
     * @throws QuickFixException
     */
    private void enablePreloads(DefDescriptor<ApplicationDef> applicationDef) throws QuickFixException {
        Aura.getContextService().getCurrentContext().setPreloading(true);
        for (String preload : applicationDef.getDef().getPreloads()) {
            Aura.getContextService().getCurrentContext().addPreload(preload);
        }
    }

    /**
     * App's useAppcache attribute value is invalid
     */
    public void testIsAppCacheEnabledUseAppcacheInvalid() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(
                "<aura:application useAppCache='yes' preload='aura'/>", ApplicationDef.class);
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * Additional test cases which are specific to Applications. Test Case: When a component has a layout.xml specified,
     * do not auto render serverside. Automation for W-911562
     */
    public void testIsLocallyRenderable_extra() throws Exception {
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition("test:test_Layouts", ApplicationDef.class);
        assertNotNull(appdef);
        assertFalse("Applications with a layout def should not be locally renderable.", appdef.isLocallyRenderable());
    }

    /**
     * W-788745
     * 
     * @throws Exception
     */
    public void _testNonExistantNameSpace() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("auratest:test_Preload_ScrapNamespace", ApplicationDef.class);
            fail("Expected Exception");
        } catch (AuraRuntimeException e) {
            assertEquals("Namespace somecrap does not exist", e.getMessage());
        }

    }
    /**
     * Verify the isOnePageApp() API on ApplicationDef 
     * Applications who have the isOnePageApp attribute set, will have the template cached.
     * @throws Exception
     */
    public void testIsOnePageApp()throws Exception{
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(String.format(baseTag, "isOnePageApp='true'", "")
                , ApplicationDef.class);
        ApplicationDef onePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, onePageApp.isOnePageApp());
        
        desc = addSourceAutoCleanup(String.format(baseTag, "isOnePageApp='false'","")
                , ApplicationDef.class);
        ApplicationDef nonOnePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, nonOnePageApp.isOnePageApp());
        
        //By default an application is not a onePageApp
        desc = addSourceAutoCleanup(String.format(baseTag, "", ""), ApplicationDef.class);
        ApplicationDef simpleApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, simpleApp.isOnePageApp());
        
    }
}
