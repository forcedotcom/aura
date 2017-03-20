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
package org.auraframework.integration.test.service;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.cache.Cache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.DefinitionServiceImpl;
import org.auraframework.impl.context.AbstractRegistryAdapterImpl;
import org.auraframework.impl.system.DefFactoryImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.CachingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.SourceLoader;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Tests for DefinitionServiceImpl.
 */
public class DefinitionServiceImplTest extends AuraImplTestCase {
    private static final String DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT = "definitionServiceImplTest:targetComponent";

    public DefinitionServiceImplTest() {
        this.setShouldSetupContext(false);
    }

    @Override
    public void tearDown() throws Exception {
        super.tearDown();
    }
    
    @Test
    public void testGetDefinitionOfApplicationWithDependencyThatTriggerACF() throws Exception {
        String eventSource = "<aura:event type='APPLICATION' description='Application event under custom namespace'/>";
        DefDescriptor<EventDef> eventDefdesc = getAuraTestingUtil().addSourceAutoCleanup(
                EventDef.class,
                eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent", 
                NamespaceAccess.CUSTOM);
        String dependencySource = "<aura:dependency resource='"+
                eventDefdesc.getQualifiedName()+"' type='EVENT'/>";
        DefDescriptor<? extends BaseComponentDef> desc = getAuraTestingUtil().addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "",
                        dependencySource
                        ),
                StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE+":testApplication", 
                NamespaceAccess.CUSTOM);
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.UNAUTHENTICATED, desc);
        try {
            definitionService.getDefinition(desc);
        }catch(NoAccessException e) {
            String expectErrorMessage = "Access to event '"+eventDefdesc.getNamespace()+":"+eventDefdesc.getName()+"'"
            +" with access 'PUBLIC' from namespace '"+desc.getNamespace()+"' in '"+desc.getQualifiedName()+"(APPLICATION)'"+
            " is not allowed";
            assertEquals(expectErrorMessage, e.getMessage());
        }
    }

    @Test
    public void testGetDefinitionOfApplicationWithPublicAccessInPublicContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "access='UNAUTHENTICATED'",
                        ""));
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.UNAUTHENTICATED, desc);
        assertEquals(desc, definitionService.getDefinition(desc).getDescriptor());
    }

    @Test
    public void testGetDefinitionOfApplicationWithPublicAccessInAuthenticatedContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "access='UNAUTHENTICATED'",
                        ""));
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertEquals(desc, definitionService.getDefinition(desc).getDescriptor());
    }

    @Test
    public void testGetDefinitionOfApplicationWithAuthenicatedAccessInPublicContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class, String.format(baseApplicationTag, "", ""));
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.UNAUTHENTICATED, desc);
        DefinitionNotFoundException expected = null;
        try {
            definitionService.getDefinition(desc);
        } catch (DefinitionNotFoundException e) {
            expected = e;
        }

        assertNotNull("Expected DefinitionNotFoundException from assertAccess", expected);
        assertEquals("No APPLICATION named "+desc.getQualifiedName()+" found", expected.getMessage());
    }

    @Test
    public void testGetDefinitionOfApplicationWithAuthenicatedAccessInAuthenticatedContext() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(
                ApplicationDef.class, String.format(baseApplicationTag,
                        "", ""));
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertEquals(desc, definitionService.getDefinition(desc).getDescriptor());
    }

    @Test
    public void testGetDefinitionThrowsExceptionWhenComponentHasInvalidHelper() {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> cmpDescriptor = addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<HelperDef> helperDescriptor = getAuraTestingUtil().getBundlePartDescriptor(HelperDef.class, cmpDescriptor);
        String invalidHelperJs = "({help:function(){ ";
        addSourceAutoCleanup(helperDescriptor, invalidHelperJs);

        try {
            definitionService.getDefinition(cmpDescriptor.getQualifiedName(), ComponentDef.class);
            fail("InvalidDefinitionException should be thrown when getting a definition of component with invalid helper.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "JsonStreamReader");
        }
    }

    @Test
    public void testGetDefinitionThrowsExceptionWhenComponentUsesNonExistingHelper() {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        String cmpMarkup = String.format(baseComponentTag, "helper='js://test.notExistingHelper'", "");
        DefDescriptor<ComponentDef> cmpDescriptor = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);

        try {
            definitionService.getDefinition(cmpDescriptor.getQualifiedName(), ComponentDef.class);
            fail("DefinitionNotFoundException should be thrown when getting a definition of component using non existing helper.");
        } catch (Exception e) {
            this.checkExceptionContains(e, DefinitionNotFoundException.class, "No HELPER named js://test.notExistingHelper");
        }
    }

    @Test
    public void testGetDefinitionThrowsExceptionWhenComponentUsesInvalidHelperDescriptor() {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> cmpDescriptor = getAuraTestingUtil().createStringSourceDescriptor(null, ComponentDef.class, null);
		DefDescriptor<HelperDef> helperDescriptor = getAuraTestingUtil().getBundlePartDescriptor(HelperDef.class, cmpDescriptor);

        addSourceAutoCleanup(helperDescriptor, "({})");
        // using colon (:) as separator
        String helperAttributeWithInvalidHelperDescriptor = String.format("helper='js://%s:%s'", helperDescriptor.getNamespace(), helperDescriptor.getName());
        String cmpMarkup = String.format(baseComponentTag, helperAttributeWithInvalidHelperDescriptor, "");
        addSourceAutoCleanup(cmpDescriptor, cmpMarkup);

        try {
            definitionService.getDefinition(cmpDescriptor.getQualifiedName(), ComponentDef.class);
            fail("InvalidDefinitionException should be thrown when getting a definition of component using invalid helper descriptor.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "Invalid Descriptor Format");
        }
    }

    @Test
    public void testGetDefinitionThrowsExceptionWhenUsingDescriptorOfComponentWithoutHelper() throws Exception {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> cmpWithoutHelperDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        // make sure it doesn't has helper
        assertNull(definitionService.getDefinition(cmpWithoutHelperDescriptor).getHelperDef());

        String helperAttribute = String.format("helper='js://%s.%s'",
                cmpWithoutHelperDescriptor.getNamespace(), cmpWithoutHelperDescriptor.getName());
        String cmpMarkup = String.format(baseComponentTag, helperAttribute, "");
        DefDescriptor<ComponentDef> cmpDescriptor = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        Exception expected = null;

        try {
            definitionService.getDefinition(cmpDescriptor.getQualifiedName(), ComponentDef.class);
        } catch (Exception e) {
            expected = e;
        }

        assertNotNull("DefinitionNotFoundException should be thrown when getting a definition of component using descriptor of a component without helper.", expected);
            String errorMessage = String.format("No HELPER named js://%s.%s found",
                    cmpWithoutHelperDescriptor.getNamespace(), cmpWithoutHelperDescriptor.getName());
        this.checkExceptionContains(expected, DefinitionNotFoundException.class, errorMessage);
        }
    
    @Test
    public void testGetDefinition_DefDescriptor_assertAccess() throws QuickFixException {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor(
                DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT, ComponentDef.class);
        NoAccessException expected = null;
        Definition def = definitionService.getDefinition(desc);
        try {
            definitionService.assertAccess(null, def);
        } catch (NoAccessException e) {
            expected = e;
        }
        assertNotNull("Expected NoAccessException from assertAccess", expected);
        assertEquals("Access to COMPONENT 'definitionServiceImplTest:targetComponent' is not allowed: referencing namespace was empty or null", expected.getMessage());
    }

    @Test
    public void testAssertAccessWithNullReferencingDescriptor() throws QuickFixException {
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor(
                DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT, ComponentDef.class);
        NoAccessException expected = null;
        Definition def = definitionService.getDefinition(desc.getQualifiedName(), ComponentDef.class);
        try {
            definitionService.assertAccess(null, def);
        } catch (NoAccessException e) {
            expected = e;
        }
        assertNotNull("Expected NoAccessException from assertAccess", expected);
        assertEquals("Access to COMPONENT 'definitionServiceImplTest:targetComponent' is not allowed: referencing namespace was empty or null", expected.getMessage());
    }

    @Test
    public void testFindNonExistingComponentByFilter() throws Exception {
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.UNAUTHENTICATED);

        Set<DefDescriptor<?>> set = definitionService.find(new DescriptorFilter("markup://notExists:blah", DefType.COMPONENT));
        assertEquals(0, set.size());
    }

    /**
     * Client loaded set is still preloaded for null input
     */
    @Test
    public void testUpdateLoadedInitialNull() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        DefDescriptor<?> dummyDesc = definitionService.getDefDescriptor("uh:oh", ComponentDef.class);
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String clientUid = definitionService.getUid(null, clientDesc);
        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, clientUid));

        assertNull("No preloads initially", context.getPreloadedDefinitions());

        // null input should not affect the loaded set
        definitionService.updateLoaded(null);
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should only have client loaded", 1, loaded.size());
        assertEquals("Wrong uid for preloaded", clientUid, loaded.get(clientDesc));
        assertNull("Not expecting uid for loaded", loaded.get(dummyDesc));
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertNotNull("Client set should be preloaded", preloads);
        assertTrue("Preloads missing parent", preloads.contains(clientDesc));

        // one more try to make sure
        definitionService.updateLoaded(null);
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
     * cmpDef = (ComponentDef) definitionService.getDefinition(cmpDesc);
     * definitionService.addDynamicDef(cmpDef); this will make context.ClientLoaded associate appDefDesc with wrong
     * UID, later when the request hit the server, server build the appDef with the correct source, this will give us a
     * different uid, which trigger the ClientOutOfSyncException.
     */
    @Test
    public void testUpdateLoadedWithWrongUidInContext() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        // build the cmpDesc with empty content
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(cmpDesc, "expired");
        context.setClientLoaded(clientLoaded);
        try {
            definitionService.updateLoaded(cmpDesc);
            fail("Expected ClientOutOfSyncException");
        } catch (ClientOutOfSyncException e) {
            checkExceptionStart(e, ClientOutOfSyncException.class,
                    String.format("%s: mismatched UIDs ", cmpDesc.getQualifiedName()));
        }
    }

    /**
     * QFE expected from inner getUid.
     */
    @Test
    public void testUpdateLoadedWithQuickFixException() throws Exception {
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        try {
            definitionService.updateLoaded(cmpDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No COMPONENT named markup://invalid:thisbetternotexistorthistestwillfail found");
        }
    }

    /**
     * DefinitionNotFoundException expected when non-loaded descriptor is not found in the registry.
     */
    @Test
    public void testUpdateLoadedWithNonExistentDescriptor() throws Exception {
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<ComponentDef> testDesc = getAuraTestingUtil().createStringSourceDescriptor("garbage",
                ComponentDef.class, null);
        try {
            definitionService.updateLoaded(testDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    String.format("No COMPONENT named %s found", testDesc.getQualifiedName()));
        }
    }

    /**
     * ClientOutOfSyncException thrown when def was deleted (not found).
     */
    @Test
    public void testUpdateLoadedClientOutOfSyncTrumpsQuickFixException() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(cmpDesc, "expired");
        context.setClientLoaded(clientLoaded);
        try {
            definitionService.updateLoaded(cmpDesc);
            fail("Expected ClientOutOfSyncException");
        } catch (ClientOutOfSyncException e) {
            checkExceptionStart(e, ClientOutOfSyncException.class,
                    String.format("%s: mismatched UIDs ", cmpDesc.getQualifiedName()));
        }
    }

    /**
     * UID, for unloaded descriptor, added to empty loaded set.
     */
    @Test
    public void testUpdateLoadedInitial() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String uid = definitionService.getUid(null, cmpDesc);

        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String clientUid = definitionService.getUid(null, clientDesc);
        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, clientUid));

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));
        assertNull("No preloads initially", context.getPreloadedDefinitions());

        definitionService.updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertNotNull("Client set should be preloaded", preloads);
        assertTrue("Preloads missing parent", preloads.contains(clientDesc));
    }

    /**
     * Null descriptor shouldn't affect current loaded set.
     */
    @Test
    public void testUpdateLoadedNullWithLoadedSet() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        String uid = definitionService.getUid(null, cmpDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));

        definitionService.updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        assertEquals("Loaded set should only have added component", 1, loaded.size());

        // null input should not affect the loaded set
        definitionService.updateLoaded(null);
        loaded = context.getLoaded();
        assertEquals("Loaded set should not have changed size", 1, loaded.size());
        assertEquals("uid should not have been updated", uid, loaded.get(cmpDesc));
    }

    /**
     * UID, for unloaded descriptor, added to non-empty loaded set.
     */
    @Test
    public void testUpdateLoadedWithLoadedSet() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<?> nextDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String uid = definitionService.getUid(null, cmpDesc);
        String nextUid = definitionService.getUid(null, nextDesc);
        definitionService.updateLoaded(cmpDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should only have added component", 1, loaded.size());
        assertEquals("First uid was updated incorrectly", uid, loaded.get(cmpDesc));

        definitionService.updateLoaded(nextDesc);
        loaded = context.getLoaded();
        assertEquals("Loaded set should have 2 components", 2, loaded.size());
        assertEquals("First uid should not have changed", uid, loaded.get(cmpDesc));
        assertEquals("Second uid was updated incorrectly", nextUid, loaded.get(nextDesc));
    }

    /**
     * UID, for unloaded descriptor, added to non-empty loaded set.
     */
    @Test
    public void testUpdateLoadedNotInPreloadedSet() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<?> nextDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        String nextUid = definitionService.getUid(null, nextDesc);
        context.setPreloadedDefinitions(ImmutableSet.<DefDescriptor<?>> of(cmpDesc));

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Loaded set should be empty", 0, loaded.size());

        definitionService.updateLoaded(nextDesc);
        loaded = context.getLoaded();
        assertEquals("Loaded set should only have non-preloaded component", 1, loaded.size());
        assertEquals("uid was updated incorrectly", nextUid, loaded.get(nextDesc));
    }

    /**
     * Preloads are empty if nothing loaded on client.
     */
    @Test
    public void testUpdateLoadedWithoutPreloads() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED);
        assertNull(context.getPreloadedDefinitions());
        definitionService.updateLoaded(null);
        assertEquals(0, context.getPreloadedDefinitions().size());
    }

    /**
     * Dependencies should be added to preloads during updateLoaded.
     */
    @Test
    public void testUpdateLoadedSpidersPreloadDependencies() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String uid = definitionService.getUid(null, clientDesc);

        context.setClientLoaded(ImmutableMap.<DefDescriptor<?>, String> of(clientDesc, uid));
        assertNull("Preloads shouldn't be set until update", context.getPreloadedDefinitions());

        definitionService.updateLoaded(null);
        Set<DefDescriptor<?>> preloads = context.getPreloadedDefinitions();
        assertTrue("Preloads missing parent from client", preloads.contains(clientDesc));
        assertTrue("Preloads missing dependency of client", preloads.contains(depDesc));
    }

    /**
     * Def not validated and ClientOutOfSyncException.
     */
    @Test
    public void testUpdateLoadedWithNullClientUID() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<invalid:thisbetternotexistorthistestwillfail/>"));
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(clientDesc, null);
        context.setClientLoaded(clientLoaded);

        try {
            definitionService.updateLoaded(clientDesc);
            fail("expected a client out of sync");
        } catch (ClientOutOfSyncException coose) {
            // ok.
        }
    }

    /**
     * Loaded dependencies are pruned from preloads
     */
    @Test
    public void testUpdateLoadedUnloadsRedundancies() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String depUid = definitionService.getUid(null, depDesc);
        String clientUid = definitionService.getUid(null, clientDesc);

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

        definitionService.updateLoaded(null);

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
    @Test
    public void testUpdateLoadedUnloadsRedundanciesBefore() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> clientDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String depUid = definitionService.getUid(null, depDesc);
        String clientUid = definitionService.getUid(null, clientDesc);

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

        definitionService.updateLoaded(null);

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
    @Test
    public void testUpdateLoadedUnloadsCircularComp() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> compDesc = definitionService.getDefDescriptor("markup://aura:component", ComponentDef.class);
        DefDescriptor<?> tempDesc = definitionService.getDefDescriptor("markup://aura:template", ComponentDef.class);
        String compUid = definitionService.getUid(null, compDesc);
        String tempUid = definitionService.getUid(null, tempDesc);

        //
        // Now make sure we have truly circular references.
        //
        assertTrue("Component should have template in dependencies",
                definitionService.getDependencies(compUid).contains(tempDesc));
        assertTrue("Template should have component in dependencies",
                definitionService.getDependencies(tempUid).contains(compDesc));

        // client has both component and templage
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(compDesc, compUid);
        clientLoaded.put(tempDesc, tempUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Component missing from loaded set", compUid, loaded.get(compDesc));
        assertEquals("Template missing from loaded set", tempUid, loaded.get(tempDesc));

        definitionService.updateLoaded(null);

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
    @Test
    public void testUpdateLoadedUnloadsCircularTemp() throws Exception {
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> compDesc = definitionService.getDefDescriptor("markup://aura:component", ComponentDef.class);
        DefDescriptor<?> tempDesc = definitionService.getDefDescriptor("markup://aura:template", ComponentDef.class);
        String compUid = definitionService.getUid(null, compDesc);
        String tempUid = definitionService.getUid(null, tempDesc);

        //
        // Now make sure we have truly circular references.
        //
        assertTrue("Component should have template in dependencies",
                definitionService.getDependencies(compUid).contains(tempDesc));
        assertTrue("Template should have component in dependencies",
                definitionService.getDependencies(tempUid).contains(compDesc));

        // client has both component and templage
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newLinkedHashMap();
        clientLoaded.put(tempDesc, tempUid);
        clientLoaded.put(compDesc, compUid);
        context.setClientLoaded(clientLoaded);

        // check that both are loaded
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Component missing from loaded set", compUid, loaded.get(compDesc));
        assertEquals("Template missing from loaded set", tempUid, loaded.get(tempDesc));

        definitionService.updateLoaded(null);

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
        AuraContext context = contextService.startContext(Mode.PROD, Format.JSON,
                Authentication.AUTHENTICATED,
                laxSecurityApp);
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "", ""));
        DefDescriptor<?> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format("<%s/>", depDesc.getDescriptorName())));
        String uid = definitionService.getUid(null, cmpDesc);
        String depUid = definitionService.getUid(null, depDesc);

        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertNull("Parent should not be loaded initially", loaded.get(cmpDesc));
        assertNull("Dependency should not be loaded initially", loaded.get(depDesc));

        context.addLoaded(cmpDesc, uid);
        loaded = context.getLoaded();
        assertEquals("Parent was not added", uid, loaded.get(cmpDesc));
        assertNull("Dependency should not have been added", loaded.get(depDesc));

        definitionService.updateLoaded(cmpDesc);
        loaded = context.getLoaded();
        assertEquals("Parent was updated incorrectly", uid, loaded.get(cmpDesc));
        assertEquals("Dependency should have been added in update", depUid, loaded.get(depDesc));
    }

    /**
     * Test find() using a constant Descriptor Filter.
     */
    @Test
    public void testFindWithConstantFilter() throws Exception {
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.UNAUTHENTICATED);

        String qualifiedName = String.format("markup://%s", DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT);

        assertEquals("find() should find single match for " + qualifiedName, 1,
                definitionService.find(new DescriptorFilter(qualifiedName, DefType.COMPONENT)).size());
    }

    /**
     * Test find() using a Descriptor Filter with given DefType.
     */
    @Test
    public void testFindByFilterWithDefType() throws Exception {
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.UNAUTHENTICATED);

        assertEquals("find() fails with wildcard as namespace", 1,
                definitionService.find(new DescriptorFilter("markup://*:targetComponent", DefType.COMPONENT)).size());

        String prefixAsWildcard = String.format("*://%s", DEFINITION_SERVICE_IMPL_TEST_TARGET_COMPONENT);
        assertEquals("find() fails with wildcard as prefix", 1,
                definitionService.find(new DescriptorFilter(prefixAsWildcard, DefType.COMPONENT)).size());

        assertEquals("find() fails when filter with multiple def types", 2,
                definitionService.find(new DescriptorFilter(prefixAsWildcard, "COMPONENT,DOCUMENTATION")).size());
    }

    /**
     * Test find() using regex's and look in different DefRegistry's for results.
     */
    @Test
    public void testFindRegex() throws Exception {
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.UNAUTHENTICATED);

        String baseContents = "<aura:application></aura:application>";

        String nonce = getAuraTestingUtil().getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("house%sboat", nonce));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("house%sparty", nonce));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("pants%sparty", nonce));

        // Test wildcards with ANY type
        assertEquals("find() fails with wildcard as prefix", 1,
                definitionService.find(new DescriptorFilter("*://" + houseboat.getDescriptorName())).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                definitionService.find(new DescriptorFilter("markup://*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard in namespace", 1,
                definitionService.find(new DescriptorFilter("markup://str*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard as name", 1,
                definitionService.find(new DescriptorFilter(houseboat.getQualifiedName())).size());
        assertEquals("find() fails with wildcard at end of name", 2,
                definitionService.find(new DescriptorFilter(String.format("markup://string:house%s*", nonce))).size());
        assertEquals("find() fails with wildcard at beginning of name", 2,
                definitionService.find(new DescriptorFilter(String.format("markup://string:*%sparty*", nonce))).size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                definitionService.find(new DescriptorFilter("markup://string:*notherecaptain")).size());

        // Test wildcards with specified constant type
        assertEquals(
                "find() fails with wildcard as prefix",
                1,
                definitionService.find(
                        new DescriptorFilter("*://" + houseboat.getDescriptorName(), DefType.APPLICATION)).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                definitionService.find(new DescriptorFilter("markup://*:" + houseboat.getName(), DefType.APPLICATION))
                        .size());
        assertEquals(
                "find() fails with wildcard in namespace",
                1,
                definitionService.find(
                        new DescriptorFilter("markup://str*:" + houseboat.getName(), DefType.APPLICATION)).size());
        assertEquals("find() fails with wildcard as name", 1,
                definitionService.find(new DescriptorFilter(houseboat.getQualifiedName(), DefType.APPLICATION)).size());
        assertEquals(
                "find() fails with wildcard at end of name",
                2,
                definitionService.find(
                        new DescriptorFilter(String.format("markup://string:house%s*", nonce), DefType.APPLICATION))
                        .size());
        assertEquals(
                "find() fails with wildcard at beginning of name",
                2,
                definitionService.find(
                        new DescriptorFilter(String.format("markup://string:*%sparty*", nonce), DefType.APPLICATION))
                        .size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                definitionService.find(new DescriptorFilter("markup://string:*notherecaptain", DefType.APPLICATION))
                        .size());

        // Look in NonCachingDefRegistry
        assertTrue("find() should find results for markup://ui:outputNumber",
                definitionService.find(new DescriptorFilter("markup://ui:outputNumber")).size() > 0);
        assertTrue("find() should find results for markup://*:outputNumber",
                definitionService.find(new DescriptorFilter("markup://*:outputNumber")).size() > 0);
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
		DefDescriptor<StyleDef> CSSdesc = getAuraTestingUtil().getBundlePartDescriptor(StyleDef.class, appWithCss);
        addSourceAutoCleanup(appWithCss, baseContents);
        addSourceAutoCleanup(CSSdesc, ".THIS { background: blue }");

        // TODO: find() is not locating the StyleDef
        assertEquals("find() failed to find both markup and css file in same bundle", 2,
                definitionService.find(new DescriptorFilter("*://" + appWithCss.getDescriptorName())).size());
        assertEquals("find() did not find CSS file", 1,
                definitionService.find(new DescriptorFilter("css://" + appWithCss.getDescriptorName())).size());
        assertEquals("find() is finding non-existent CSS", 0,
                definitionService.find(new DescriptorFilter("css://*:doesntexist")).size());
    }
    
    /**
     * Test for W-3458425: checks DependencyEntry (DE) is added to the depsCache even if already in defsCache
     */
    @ThreadHostileTest("checking the state of caches")
    @Test
    public void testDependencyCaching() throws Exception {
        // problem was that compileDE was not adding the DE to depsCache when the definition was alredy in defsCache
        
        DefinitionServiceImpl definitionServiceImpl = (DefinitionServiceImpl)definitionService;
        
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED, laxSecurityApp);
        DefDescriptor<?> descriptor = definitionService.getDefDescriptor("markup://ui:button", ComponentDef.class);
        
        CachingService cachingService = definitionServiceImpl.getCachingService();
        Cache<String, DependencyEntry> depsCache = cachingService.getDepsCache();
        
        // first call to perform side effect of adding definition to defsCache
        String uid = definitionServiceImpl.getUid(null, descriptor);
        Boolean foundit = false;
        for(String key : depsCache.getKeySet()) {
            if(key.contains("markup://ui:button")) {
                foundit = true;
            }
        }
        assertTrue("markup://ui:button should have been added to depsCache", foundit);
        
        // remove DE from depsCache
        depsCache.invalidateAll();
        foundit = false;
        for(String key : depsCache.getKeySet()) {
            if(key.contains("markup://ui:button")) {
                foundit = true;
            }
        }
        assertFalse("markup://ui:button should not be in depsCache", foundit);
        
        // start new context to make sure DE is not found in "context.getLocalDependencyEntry()"
        contextService.endContext();
        contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED, laxSecurityApp);
        // perform another getUid()->compileDE() and verify DE is put in depsCache even though definition is already in defsCache
        definitionService.getUid(uid, descriptor);
        foundit = false;
        for(String key : depsCache.getKeySet()) {
            if(key.contains("markup://ui:button")) {
                foundit = true;
            }
        }
        assertTrue("markup://ui:button should have been added to depsCache again", foundit);
    }

    public static class AuraTestRegistryProviderWithNulls extends AbstractRegistryAdapterImpl {

        @Override
        public DefRegistry[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> extraLoaders) {
            return new DefRegistry[] { createDefRegistry(new TestTypeDefFactory(), DefType.TYPE, "test") };
        }

        public static class TestTypeDefFactory extends DefFactoryImpl<TypeDef> {

            @Override
            public TypeDef getDef(DefDescriptor<TypeDef> descriptor) throws QuickFixException {
                return new TestTypeDef(descriptor, null);
            }
        }

        public static class TestTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {
            private static final long serialVersionUID = 1L;

            public TestTypeDef(DefDescriptor<TypeDef> descriptor, Object object) {
                super(descriptor, null, new DefinitionAccessImpl(AuraContext.Access.GLOBAL));
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
