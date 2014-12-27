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
package org.auraframework.test;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.context.AuraRegistryProviderImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefFactoryImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Tests for DefinitionServiceImpl.
 * 
 * @see org.auraframework.impl.registry.RootDefFactoryTest
 */
public class DefinitionServiceImplTest extends AuraImplTestCase {
    private static final String DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT = "definitionServiceImplTest:targetComponent";

    public DefinitionServiceImplTest(String name) {
        super(name, false);
    }

    @Override
    public void tearDown() throws Exception {
        Aura.getContextService().endContext();
        super.tearDown();
    }

    public void testGetDefinitionOfApplicationWithPublicAccessInPublicContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "access='UNAUTHENTICATED'",
                        ""));
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.UNAUTHENTICATED, desc);
        assertEquals(desc, Aura.getDefinitionService().getDefinition(desc).getDescriptor());
    }

    public void testGetDefinitionOfApplicationWithPublicAccessInAuthenticatedContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "access='UNAUTHENTICATED'",
                        ""));
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertEquals(desc, Aura.getDefinitionService().getDefinition(desc).getDescriptor());
    }

    public void testGetDefinitionOfApplicationWithAuthenicatedAccessInPublicContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class, String.format(baseApplicationTag,
                        "", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.UNAUTHENTICATED, desc);
        try {
            Aura.getDefinitionService().getDefinition(desc);
            fail("Expected DefinitionNotFoundException from assertAccess");
        } catch (DefinitionNotFoundException e) {
        }
    }

    public void testGetDefinitionOfApplicationWithAuthenicatedAccessInAuthenticatedContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class, String.format(baseApplicationTag,
                        "", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertEquals(desc, Aura.getDefinitionService().getDefinition(desc).getDescriptor());
    }

    /**
     * ContextService.assertAccess is called during getDefinition(DefDescriptor).
     */
    public void testGetDefinition_DefDescriptor_assertAccess() throws QuickFixException {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor(
                DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT, ComponentDef.class);
        try {
            Definition def = definitionService.getDefinition(desc);
            definitionService.getDefRegistry().assertAccess(null, def);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {
        }
    }

    /**
     * ContextService.assertAccess is called during getDefinition(String, Class).
     */
    public void testGetDefinition_StringClass_assertAccess() throws QuickFixException {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor(
                DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT, ComponentDef.class);
        try {
            Definition def = Aura.getDefinitionService().getDefinition(desc.getQualifiedName(), ComponentDef.class);
            definitionService.getDefRegistry().assertAccess(null, def);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {
        }
    }

    /**
     * ContextService.assertAccess is called during getDefinition(String, DefType...).
     */
    public void testGetDefinition_StringDefType_assertAccess() throws QuickFixException {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor(
                DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT, ComponentDef.class);
        try {
            Definition def = Aura.getDefinitionService().getDefinition(desc.getQualifiedName(), DefType.COMPONENT);
            definitionService.getDefRegistry().assertAccess(null, def);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {
        }
    }

    /**
     * Client loaded set is still preloaded for null input
     */
    public void testUpdateLoadedInitialNull() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        DefDescriptor<?> dummyDesc = DefDescriptorImpl.getInstance("uh:oh", ComponentDef.class);
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String clientUid = context.getDefRegistry().getUid(null, clientDesc);
        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, clientUid));

        assertNull("No preloads initially", context.getPreloadedDefinitions());

        // null input should not affect the loaded set
        Aura.getDefinitionService().updateLoaded(null);
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should only have client loaded", 1, loaded.size());
        assertEquals("Wrong uid for preloaded", clientUid, loaded.get(clientDesc));
        assertNull("Not expecting uid for loaded", loaded.get(dummyDesc));
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertNotNull("Client set should be preloaded", preloads);
        assertTrue("Preloads missing parent", preloads.contains(clientDesc));

        // one more try to make sure
        Aura.getDefinitionService().updateLoaded(null);
        loaded = context.getLoaded();
        assertEquals("Loaded set should not have changed size", 1, loaded.size());
        assertEquals("Preloaded uid should not have changed", clientUid, loaded.get(clientDesc));
        assertNull("Still not expecting uid for loaded", loaded.get(dummyDesc));
        Set<DefDescriptor<?>> preloadsAgain = context.getPreloadedDefinitions();
        assertTrue("Preloaded set should not have changed", Sets.difference(preloads, preloadsAgain).isEmpty());
    }

    /**
     * Uid mismatch will trigger ClientOutOfSyncException.
     * 
     * Update test according what I learned from W-2176923. ApexPagesAuraContext.java doesn't have the source for app,
     * but it go ahead and create app definition with its own (fake) builder, then add it to localDef: ComponentDef
     * cmpDef = (ComponentDef) Aura.getDefinitionService().getDefinition(cmpDesc);
     * context.getDefRegistry().addLocalDef(cmpDef); this will make context.ClientLoaded associate appDefDesc with wrong
     * UID, later when the request hit the server, server build the appDef with the correct source, this will give us a
     * different uid, which trigger the ClientOutOfSyncException.
     */
    public void testUpdateLoadedWithWrongUidInContext() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        // build the cmpDesc with empty content
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(cmpDesc, "expired");
        context.setClientLoaded(clientLoaded);
        try {
            Aura.getDefinitionService().updateLoaded(cmpDesc);
            fail("Expected ClientOutOfSyncException");
        } catch (ClientOutOfSyncException e) {
            checkExceptionStart(e, ClientOutOfSyncException.class,
                    String.format("%s: mismatched UIDs ", cmpDesc.getQualifiedName()));
        }
    }

    /**
     * QFE expected from inner getUid.
     */
    public void testUpdateLoadedWithQuickFixException() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        try {
            Aura.getDefinitionService().updateLoaded(cmpDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No COMPONENT named markup://invalid:thisbetternotexistorthistestwillfail found");
        }
    }

    /**
     * DefinitionNotFoundException expected when non-loaded descriptor is not found in the registry.
     */
    public void testUpdateLoadedWithNonExistentDescriptor() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> testDesc = getAuraTestingUtil().createStringSourceDescriptor("garbage",
                ComponentDef.class, null);
        try {
            Aura.getDefinitionService().updateLoaded(testDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    String.format("No COMPONENT named %s found", testDesc.getQualifiedName()));
        }
    }

    /**
     * ClientOutOfSyncException thrown when def was deleted (not found).
     */
    public void testUpdateLoadedClientOutOfSyncTrumpsQuickFixException() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(cmpDesc, "expired");
        context.setClientLoaded(clientLoaded);
        try {
            Aura.getDefinitionService().updateLoaded(cmpDesc);
            fail("Expected ClientOutOfSyncException");
        } catch (ClientOutOfSyncException e) {
            checkExceptionStart(e, ClientOutOfSyncException.class,
                    String.format("%s: mismatched UIDs ", cmpDesc.getQualifiedName()));
        }
    }
    /**
     * UID, for unloaded descriptor, added to empty loaded set.
     */
    public void testUpdateLoadedInitial() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String uid = context.getDefRegistry().getUid(null, cmpDesc);
        context.getDefRegistry().invalidate(cmpDesc);

        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String clientUid = context.getDefRegistry().getUid(null, clientDesc);
        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, clientUid));

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));
        assertNull("No preloads initially", context.getPreloadedDefinitions());

        Aura.getDefinitionService().updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertNotNull("Client set should be preloaded", preloads);
        assertTrue("Preloads missing parent", preloads.contains(clientDesc));
    }

    /**
     * Null descriptor shouldn't affect current loaded set.
     */
    public void testUpdateLoadedNullWithLoadedSet() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String uid = context.getDefRegistry().getUid(null, cmpDesc);
        context.getDefRegistry().invalidate(cmpDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));

        Aura.getDefinitionService().updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        assertEquals("Loaded set should only have added component", 1, loaded.size());

        // null input should not affect the loaded set
        Aura.getDefinitionService().updateLoaded(null);
        loaded = context.getLoaded();
        assertEquals("Loaded set should not have changed size", 1, loaded.size());
        assertEquals("uid should not have been updated", uid, loaded.get(cmpDesc));
    }

    /**
     * UID, for unloaded descriptor, added to non-empty loaded set.
     */
    public void testUpdateLoadedWithLoadedSet() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<?> nextDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String uid = context.getDefRegistry().getUid(null, cmpDesc);
        String nextUid = context.getDefRegistry().getUid(null, nextDesc);
        Aura.getDefinitionService().updateLoaded(cmpDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should only have added component", 1, loaded.size());
        assertEquals("First uid was updated incorrectly", uid, loaded.get(cmpDesc));

        Aura.getDefinitionService().updateLoaded(nextDesc);
        loaded = context.getLoaded();
        assertEquals("Loaded set should have 2 components", 2, loaded.size());
        assertEquals("First uid should not have changed", uid, loaded.get(cmpDesc));
        assertEquals("Second uid was updated incorrectly", nextUid, loaded.get(nextDesc));
    }

    /**
     * UID, for unloaded descriptor, added to non-empty loaded set.
     */
    public void testUpdateLoadedNotInPreloadedSet() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<?> nextDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String nextUid = context.getDefRegistry().getUid(null, nextDesc);
        context.setPreloadedDefinitions(ImmutableSet.<DefDescriptor<?>> of(cmpDesc));

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should be empty", 0, loaded.size());

        Aura.getDefinitionService().updateLoaded(nextDesc);
        loaded = context.getLoaded();
        assertEquals("Loaded set should only have non-preloaded component", 1, loaded.size());
        assertEquals("uid was updated incorrectly", nextUid, loaded.get(nextDesc));
    }

    /**
     * Preloads are empty if nothing loaded on client.
     */
    public void testUpdateLoadedWithoutPreloads() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        assertNull(context.getPreloadedDefinitions());
        Aura.getDefinitionService().updateLoaded(null);
        assertEquals(0, context.getPreloadedDefinitions().size());
    }

    /**
     * Dependencies should be added to preloads during updateLoaded.
     */
    public void testUpdateLoadedSpidersPreloadDependencies() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String uid = context.getDefRegistry().getUid(null, clientDesc);

        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, uid));
        assertNull("Preloads shouldn't be set until update", context.getPreloadedDefinitions());

        Aura.getDefinitionService().updateLoaded(null);
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing parent from client", preloads.contains(clientDesc));
        assertTrue("Preloads missing dependency of client", preloads.contains(depDesc));
    }

    /**
     * Def not validated and ClientOutOfSyncException.
     */
    public void testUpdateLoadedWithNullClientUID() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(clientDesc, null);
        context.setClientLoaded(clientLoaded);

        try {
            Aura.getDefinitionService().updateLoaded(clientDesc);
            fail("expected a client out of sync");
        } catch (ClientOutOfSyncException coose) {
            // ok.
        }
    }
    /**
     * Loaded dependencies are pruned from preloads
     */
    public void testUpdateLoadedUnloadsRedundancies() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String depUid = context.getDefRegistry().getUid(null, depDesc);
        String clientUid = context.getDefRegistry().getUid(null, clientDesc);

        // client has both parent and dependency loaded
        // in dependency last order
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(clientDesc, clientUid);
        clientLoaded.put(depDesc, depUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Parent missing from loaded set", clientUid, loaded.get(clientDesc));
        assertEquals("Dependency missing from loaded set", depUid, loaded.get(depDesc));

        Aura.getDefinitionService().updateLoaded(null);

        // dependency is redundant with client set, so it should be removed from loaded set
        loaded = context.getLoaded();
        assertEquals("Parent missing from loaded set", clientUid, loaded.get(clientDesc));
        assertEquals("Dependency stil in loaded set", null, loaded.get(depDesc));

        // check dependency is still in preloads
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing parent from client", preloads.contains(clientDesc));
        assertTrue("Preloads missing dependency from client", preloads.contains(depDesc));
    }

    /**
     * Loaded dependencies are pruned from preloads even if before
     */
    public void testUpdateLoadedUnloadsRedundanciesBefore() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String depUid = context.getDefRegistry().getUid(null, depDesc);
        String clientUid = context.getDefRegistry().getUid(null, clientDesc);

        // client has both parent and dependency loaded
        // in dependency first order
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(depDesc, depUid);
        clientLoaded.put(clientDesc, clientUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Parent missing from loaded set", clientUid, loaded.get(clientDesc));
        assertEquals("Dependency missing from loaded set", depUid, loaded.get(depDesc));

        Aura.getDefinitionService().updateLoaded(null);

        // dependency is redundant with client set, so it should be removed from loaded set
        loaded = context.getLoaded();
        assertEquals("Parent missing from loaded set", clientUid, loaded.get(clientDesc));
        assertEquals("Dependency still in loaded set", null, loaded.get(depDesc));

        // check dependency is still in preloads
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing parent from client", preloads.contains(clientDesc));
        assertTrue("Preloads missing dependency from client", preloads.contains(depDesc));
    }

    /**
     * Check circular dependencies, keeping component.
     */
    public void testUpdateLoadedUnloadsCircularComp() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefinitionService ds = Aura.getDefinitionService();
        DefDescriptor<?> compDesc = ds.getDefDescriptor("markup://aura:component", ComponentDef.class);
        DefDescriptor<?> tempDesc = ds.getDefDescriptor("markup://aura:template", ComponentDef.class);
        String compUid = context.getDefRegistry().getUid(null, compDesc);
        String tempUid = context.getDefRegistry().getUid(null, tempDesc);

        //
        // Now make sure we have truly circular references.
        //
        assertTrue("Component should have template in dependencies",
                context.getDefRegistry().getDependencies(compUid).contains(tempDesc));
        assertTrue("Template should have component in dependencies",
                context.getDefRegistry().getDependencies(tempUid).contains(compDesc));

        // client has both component and templage
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(compDesc, compUid);
        clientLoaded.put(tempDesc, tempUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Component missing from loaded set", compUid, loaded.get(compDesc));
        assertEquals("Template missing from loaded set", tempUid, loaded.get(tempDesc));

        Aura.getDefinitionService().updateLoaded(null);

        // dependency is redundant with client set, so it should be removed from loaded set
        loaded = context.getLoaded();
        assertEquals("Component missing from loaded set", compUid, loaded.get(compDesc));
        assertEquals("Template still in loaded set", null, loaded.get(tempDesc));

        // check dependency is still in preloads
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing component from client", preloads.contains(compDesc));
        assertTrue("Preloads missing template from client", preloads.contains(tempDesc));
    }

    /**
     * Check circular dependencies, keeping template.
     */
    public void testUpdateLoadedUnloadsCircularTemp() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefinitionService ds = Aura.getDefinitionService();
        DefDescriptor<?> compDesc = ds.getDefDescriptor("markup://aura:component", ComponentDef.class);
        DefDescriptor<?> tempDesc = ds.getDefDescriptor("markup://aura:template", ComponentDef.class);
        String compUid = context.getDefRegistry().getUid(null, compDesc);
        String tempUid = context.getDefRegistry().getUid(null, tempDesc);

        //
        // Now make sure we have truly circular references.
        //
        assertTrue("Component should have template in dependencies",
                context.getDefRegistry().getDependencies(compUid).contains(tempDesc));
        assertTrue("Template should have component in dependencies",
                context.getDefRegistry().getDependencies(tempUid).contains(compDesc));

        // client has both component and templage
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(tempDesc, tempUid);
        clientLoaded.put(compDesc, compUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Component missing from loaded set", compUid, loaded.get(compDesc));
        assertEquals("Template missing from loaded set", tempUid, loaded.get(tempDesc));

        Aura.getDefinitionService().updateLoaded(null);

        // dependency is redundant with client set, so it should be removed from loaded set
        loaded = context.getLoaded();
        assertEquals("Template missing from loaded set", tempUid, loaded.get(tempDesc));
        assertEquals("Component still in loaded set", null, loaded.get(compDesc));

        // check dependency is still in preloads
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing component from client", preloads.contains(compDesc));
        assertTrue("Preloads missing template from client", preloads.contains(tempDesc));
    }

    /**
     * Dependencies should be added to loaded set during updateLoaded.
     */
    public void _testUpdateLoadedWithImplicitDependency() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String uid = context.getDefRegistry().getUid(null, cmpDesc);
        String depUid = context.getDefRegistry().getUid(null, depDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));
        assertNull("Dependency should not be loaded initially", loaded.get(depDesc));

        context.addLoaded(cmpDesc, uid);
        loaded = context.getLoaded();
        assertEquals("Parent was not added", uid, loaded.get(cmpDesc));
        assertNull("Dependency should not have been added", loaded.get(depDesc));

        Aura.getDefinitionService().updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        assertEquals("Dependency should have been added in update", depUid, loaded.get(depDesc));
    }

    /**
     * Test find() using regex's and look in different DefRegistry's for results.
     */
    public void testFindRegex() throws Exception {
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Authentication.UNAUTHENTICATED);

        String baseContents = "<aura:application></aura:application>";

        String nonce = getAuraTestingUtil().getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("house%sboat", nonce));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("house%sparty", nonce));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("pants%sparty", nonce));

        // Test wildcards
        assertEquals("find() fails with wildcard as prefix", 1,
                definitionService.find(new DescriptorFilter("*://" + houseboat.getDescriptorName())).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                definitionService.find(new DescriptorFilter("markup://*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard as name", 1,
                definitionService.find(new DescriptorFilter(houseboat.getQualifiedName())).size());
        assertEquals("find() fails with wildcard at end of name", 2,
                definitionService.find(new DescriptorFilter(String.format("markup://string:house%s*", nonce))).size());
        assertEquals("find() fails with wildcard at beginning of name", 2,
                definitionService.find(new DescriptorFilter(String.format("markup://string:*%sparty*", nonce))).size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                definitionService.find(new DescriptorFilter("markup://string:*notherecaptain")).size());

        // Look in NonCachingDefRegistry
        assertTrue("find() should find results for markup://ui:outputNumber",
                definitionService.find(new DescriptorFilter("markup://ui:outputNumber")).size() > 0);
        assertTrue("find() fails with wildcard as prefix",
                definitionService.find(new DescriptorFilter("*://ui:outputNumber")).size() > 2);
        assertEquals("find() is finding non-existent items", 0,
                definitionService.find(new DescriptorFilter("markup://ui:doesntexist")).size());

        // Look in AuraStaticTypeDefRegistry (StaticDefRegistry)
        assertEquals("find() fails looking in StaticDefRegistry", 1,
                definitionService.find(new DescriptorFilter("aura://*:String")).size());
        // Look in AuraStaticControllerDefRegistry (StaticDefRegistry)
        assertEquals("find() fails looking in StaticDefRegistry", 1,
                definitionService.find(new DescriptorFilter("aura://*:ComponentController")).size());
        assertEquals("find() is finding non-existent items", 0,
                definitionService.find(new DescriptorFilter("aura://*:doesntexist")).size());

        // Find CSS
        DefDescriptor<ApplicationDef> appWithCss = getAuraTestingUtil().createStringSourceDescriptor(null,
                ApplicationDef.class, null);
        DefDescriptor<StyleDef> CSSdesc = Aura.getDefinitionService().getDefDescriptor(appWithCss,
                DefDescriptor.CSS_PREFIX, StyleDef.class);
        addSourceAutoCleanup(appWithCss, baseContents);
        addSourceAutoCleanup(CSSdesc, ".THIS { background: blue }");

        assertEquals("find() failed to find both markup and css file in same bundle", 2,
                definitionService.find(new DescriptorFilter("*://" + appWithCss.getDescriptorName())).size());
        assertEquals("find() did not find CSS file", 1,
                definitionService.find(new DescriptorFilter("css://" + appWithCss.getDescriptorName())).size());
        assertEquals("find() is finding non-existent CSS", 0,
                definitionService.find(new DescriptorFilter("css://*:doesntexist")).size());
    }

    public static class AuraTestRegistryProviderWithNulls extends AuraRegistryProviderImpl {

        @Override
        public DefRegistry<?>[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> extraLoaders) {
            return new DefRegistry<?>[] { createDefRegistry(new TestTypeDefFactory(), DefType.TYPE, "test") };
        }

        public static class TestTypeDefFactory extends DefFactoryImpl<TypeDef> {

            @Override
            public TypeDef getDef(DefDescriptor<TypeDef> descriptor) throws QuickFixException {
                return new TestTypeDef(descriptor, null);
            }

            @Override
            public Set<DefDescriptor<TypeDef>> find(DefDescriptor<TypeDef> matcher) {
                Set<DefDescriptor<TypeDef>> ret = new HashSet<>();
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar1", TypeDef.class));
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar2", TypeDef.class));
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar3", TypeDef.class));
                return ret;
            }
        }

        public static class TestTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {
            private static final long serialVersionUID = 1L;

            public TestTypeDef(DefDescriptor<TypeDef> descriptor, Object object) {
                super(descriptor, null, null);
            }

            @Override
            public void serialize(Json json) throws IOException {
            }

            @Override
            public Object valueOf(Object stringRep) {
                return null;
            }

            @Override
            public Object wrap(Object o) {
                return null;
            }

            @Override
            public Object getExternalType(String prefix) throws QuickFixException {
                return null;
            }

            @Override
            public Object initialize(Object config, BaseComponent<?, ?> valueProvider) throws QuickFixException {
                return null;
            }

            @Override
            public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) {
            }

            @Override
            public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barA", TypeDef.class));
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barB", TypeDef.class));
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barC", TypeDef.class));
            }
        }

    }
}
