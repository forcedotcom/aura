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
package org.auraframework.impl.context;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Event;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.json.Json;
import org.junit.Ignore;

/**
 * Unit tests for AuraContextImpl.
 * 
 * @hierarchy Aura.Basic
 * @priority high
 * @userStory a07B0000000DfxB
 */
public class AuraContextImplTest extends AuraImplTestCase {
    public AuraContextImplTest(String name) {
        super(name);
    }

    /**
     * Verify the basic configuration in place for preloading namespaces. AuraContextImpl keeps track of namespaces
     * whose definitions should be preLoaded. This test would act like a gold file for namespaces selected to be
     * pre-loaded. Be sure to consider what namespaces you are specifying for pre-loading.
     * 
     * @userStory a07B0000000EYU4
     */
    public void testPreloadConfigurations() throws Exception {
        AuraContext lc = Aura.getContextService().getCurrentContext();

        Set<String> preloadNamespace = lc.getPreloads();
        // Verify that 'ui' and 'Aura' are always specified as standard preload
        // namespaces
        // don't verify anything else as more preloads could be injected through
        // adapters
        assertTrue("UI namespace not specified as standard preload namespace", preloadNamespace.contains("ui"));
        assertTrue("aura namespace not specified as standard preload namespace", preloadNamespace.contains("aura"));
    }

    /**
     * Verify methods on AuraContext to alter pre-load configurations.
     * 
     * @userStory a07B0000000EYU4
     */
    public void testPreloadConfigurationMethods() throws Exception {
        AuraContext lc = Aura.getContextService().getCurrentContext();
        lc.clearPreloads();
        Set<String> preloadNamespace = lc.getPreloads();
        assertTrue("Preload namespace configuration could not be reset", preloadNamespace.size() == 0);
        lc.addPreload("auratest");
        preloadNamespace = lc.getPreloads();
        assertTrue("Preload namespace configuration could not be changed", preloadNamespace.contains("auratest"));
    }

    /**
     * Verify the serialized format of a ComponentDef when it belongs to a pre-load namespace. Components which belong
     * to a pre-load namespace will only have the descriptor as part of their ComponentDef. This descriptor will be used
     * on the client side to obtain the full blown componentDef.
     */
    public void testComponentDefSerializedFormat() throws Exception {
        ApplicationDef cDef = Aura.getDefinitionService().getDefinition("preloadTest:test_Preload_Cmp_SameNameSpace",
                ApplicationDef.class);
        // Set<String> preloadNamespace = cDef.getPreloads();
        // assertTrue(preloadNamespace.contains("preloadTest"));
        AuraContext lc = Aura.getContextService().getCurrentContext();
        lc.addPreload("preloadTest");
        assertEquals("{\"descriptor\":\"markup://preloadTest:test_Preload_Cmp_SameNameSpace\"}", Json.serialize(cDef));
    }

    /**
     * Verify we are able to check what DefDescriptors have been preloaded.
     */
    public void testIsPreloaded() throws Exception {
        AuraContext lc = Aura.getContextService().getCurrentContext();
        lc.clearPreloads();
        lc.addPreload("auratest");

        // Check in preloaded namesapce
        DefDescriptor<ComponentDef> dd = vendor.makeComponentDefDescriptor("auratest:text");
        assertTrue("Descriptor in preloaded namespace not found", lc.isPreloaded(dd));

        // Check in namespace that is not preloaded
        dd = vendor.makeComponentDefDescriptor("aura:text");
        assertTrue("Descriptor in namespace *not* preloaded found", !lc.isPreloaded(dd));

        // Check after preloads cleared
        lc.clearPreloads();
        dd = vendor.makeComponentDefDescriptor("auratest:text");
        assertTrue("Descriptor found after preloads cleared", !lc.isPreloaded(dd));
    }

    /**
     * Verify clearing current preloads in AuraContext AuraContext.preloading indicates whether components defs are
     * currently being preloaded.
     */
    public void testClearPreloads() throws Exception {
        AuraContext lc = Aura.getContextService().getCurrentContext();
        lc.clearPreloads();
        Set<String> preloadNamespace = lc.getPreloads();
        assertEquals("Calling clearPreloads() should clear the context of all preload namespaces.", 0,
                preloadNamespace.size());
    }

    /**
     * Context app descriptor gets serialized.
     */
    @UnAdaptableTest
    public void testSerializeWithApp() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor("arbitrary:appname",
                ApplicationDef.class);

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.PUBLIC, desc);
        ctx.setSerializeLastMod(false);
        String res = Json.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Context app descriptor gets serialized.
     */
    @UnAdaptableTest
    public void testSerializeWithCmp() throws Exception {
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("arbitrary:cmpname",
                ComponentDef.class);

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.PUBLIC, desc);
        ctx.setSerializeLastMod(false);
        String res = Json.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * App not serialized for context without descriptor.
     */
    @UnAdaptableTest
    public void testSerializeWithoutApp() throws Exception {
        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.PUBLIC);
        ctx.setSerializeLastMod(false);
        String res = Json.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Verify setting a Context's DefDescriptor.
     */
    @UnAdaptableTest
    public void testSetApplicationDescriptor() throws Exception {
        DefDescriptor<ApplicationDef> descApp1 = Aura.getDefinitionService().getDefDescriptor("arbitrary:appnameApp1",
                ApplicationDef.class);
        DefDescriptor<ApplicationDef> descApp2 = Aura.getDefinitionService().getDefDescriptor("arbitrary:appnameApp2",
                ApplicationDef.class);
        DefDescriptor<ComponentDef> descCmp = Aura.getDefinitionService().getDefDescriptor("arbitrary:cmpname",
                ComponentDef.class);

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.PUBLIC);
        ctx.setSerializeLastMod(false);

        ctx.setApplicationDescriptor(descCmp);
        assertEquals("ComponentDef should override a Context's null DefDescriptor", descCmp,
                ctx.getApplicationDescriptor());

        ctx.setApplicationDescriptor(descApp1);
        assertEquals("ApplicationDef should override a Context's ComponentDef", descApp1,
                ctx.getApplicationDescriptor());

        ctx.setApplicationDescriptor(descApp2);
        assertEquals("ApplicationDef should override current Context's ApplicationDef", descApp2,
                ctx.getApplicationDescriptor());

        ctx.setApplicationDescriptor(descCmp);
        assertEquals("ComponentDef should not override current Context's ApplicationDef", descApp2,
                ctx.getApplicationDescriptor());
    }

    /**
     * Add events to context. Technique used by controllers to add events and send them down with action response.
     * 
     * @throws Exception
     */
    public void testAttachingEvents() throws Exception {
        // Verify that nulls are filtered
        AuraContext lc = Aura.getContextService().getCurrentContext();
        try {
            lc.addClientApplicationEvent(null);
            assertEquals("Should not be accepting null objects as events.", 0, lc.getClientEvents().size());
        } catch (Exception e) {
            fail("Context.addClientApplicationEvent() does not handle nulls.");
        }
        Aura.getContextService().endContext();

        // Adding multiple contexts
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        Event evt1 = Aura.getInstanceService().getInstance("markup://aura:applicationEvent", EventDef.class, null);
        lc.addClientApplicationEvent(evt1);
        Event evt2 = Aura.getInstanceService().getInstance("markup://aura:connectionLost", EventDef.class, null);
        lc.addClientApplicationEvent(evt2);
        List<Event> evnts = lc.getClientEvents();
        assertEquals("Found unexpected number of events on context", 2, evnts.size());
        assertEquals("markup://aura:applicationEvent", evnts.get(0).getDescriptor().getQualifiedName());
        assertEquals("markup://aura:connectionLost", evnts.get(1).getDescriptor().getQualifiedName());
        Aura.getContextService().endContext();

        // Adding same event again should not cause an error, same event can be
        // fired with different parameters.
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        Event evt3 = Aura.getInstanceService().getInstance("markup://handleEventTest:applicationEvent", EventDef.class,
                null);
        lc.addClientApplicationEvent(evt3);
        Event evt3_dup = Aura.getInstanceService().getInstance("markup://handleEventTest:applicationEvent",
                EventDef.class, null);
        lc.addClientApplicationEvent(evt3_dup);
        assertEquals("Failed to add same event twice.", 2, evnts.size());
        Aura.getContextService().endContext();

        // Verify component events are not acceptable
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        Event evt4 = Aura.getInstanceService().getInstance("markup://handleEventTest:event", EventDef.class, null);
        try {
            lc.addClientApplicationEvent(evt4);
            fail("Component events should not be allowed to be fired from server.");
        } catch (Exception e) {
            assertEquals("markup://handleEventTest:event is not an Application event. "
                    + "Only Application events are allowed to be fired from server.", e.getMessage());
        }
    }

    /**
     * Expect a map that doesn't include dropped descriptors.
     */
    public void testGetLoaded() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setApplicationDescriptor(laxSecurityApp);

        assertTrue("Nothing should be loaded", context.getLoaded().isEmpty());

        DefDescriptor<?> dropped = DefDescriptorImpl.getInstance("auratest:iwasdropped", EventDef.class);
        context.dropLoaded(dropped);
        assertTrue("Deletions should not be loaded", context.getLoaded().isEmpty());
        assertNull("Dropped descriptors should not return a uid", context.getUid(dropped));

        DefDescriptor<?> added = DefDescriptorImpl.getInstance("auratest:iwasadded", EventDef.class);
        context.addLoaded(added, "somegenerateduid");
        Map<DefDescriptor<?>, String> loaded = context.getLoaded();
        assertEquals("Unexpected load", 1, loaded.size());
        assertEquals("Unexpected loaded uid", "somegenerateduid", loaded.get(added));
        assertEquals("Unexpected loaded uid from getUid", "somegenerateduid", context.getUid(added));

        context.dropLoaded(added);
        assertTrue("Added descriptor was not dropped", context.getLoaded().isEmpty());
        assertNull("Dropped descriptors should not return a uid", context.getUid(added));
    }

    /**
     * Loaded map contains the loaded descriptor.
     */
    public void testSerializeWithLoaded() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setApplicationDescriptor(laxSecurityApp);
        context.setSerializeLastMod(false);
        context.setSerializePreLoad(false);
        context.getGlobalProviders().clear();

        DefDescriptor<?> added = DefDescriptorImpl.getInstance("auratest:iwasadded", EventDef.class);
        context.addLoaded(added, "somegenerateduid");
        String res = Json.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }
    
    /**
     * Loaded map contains deleted descriptors.
     */
    @Ignore("W-1560329")
    public void testSerializeWithDroppedLoaded() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setApplicationDescriptor(laxSecurityApp);
        context.setSerializeLastMod(false);
        context.setSerializePreLoad(false);
        context.getGlobalProviders().clear();

        DefDescriptor<?> dropped = DefDescriptorImpl.getInstance("auratest:iwasdropped", EventDef.class);
        context.dropLoaded(dropped);
        String res = Json.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }
}
