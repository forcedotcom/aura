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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.ThemeList;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Event;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Unit tests for AuraContextImpl.
 * 
 * @hierarchy Aura.Basic
 * @priority high
 * @userStory a07B0000000DfxB
 */
public class AuraContextImplTest extends AuraImplTestCase {
    public AuraContextImplTest(String name) {
        super(name, false);
    }

    /**
     * Verify the serialized format of a ComponentDef when it was 'preloaded'.
     * 
     * Components which are 'preloaded' will be serialized as the descriptor. This allows the client to determine that
     * the component should be present easily, and give a more reasonable error message if it is not.
     */
    public void testComponentDefSerializedFormat() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "preloadTest:dependenciesApp", ApplicationDef.class);
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.HTML,
                Authentication.AUTHENTICATED, appDesc);
        DefinitionService ds = Aura.getDefinitionService();
        ApplicationDef appDef = ds.getDefinition("preloadTest:dependenciesApp", ApplicationDef.class);
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(appDesc, context.getDefRegistry().getUid(null, appDesc));
        context.setClientLoaded(clientLoaded);
        ds.updateLoaded(null);

        assertEquals("\"markup://preloadTest:dependenciesApp\"", Json.serialize(appDef));
    }

    /**
     * Verify we are able to check what DefDescriptors have been preloaded.
     */
    public void testIsPreloaded() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                "preloadTest:dependenciesApp", ApplicationDef.class);
        AuraContext context = Aura.getContextService()
                .startContext(Mode.UTEST, Format.HTML, Authentication.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> dd = vendor.makeComponentDefDescriptor("test:test_button");

        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        preloaded.add(appDesc);
        preloaded.add(dd);
        context.setPreloadedDefinitions(preloaded);

        // check def is preloaded
        assertTrue("Descriptor is a dependency and should be preloaded", context.isPreloaded(dd));

        // check dependency is not preloaded
        dd = vendor.makeComponentDefDescriptor("test:child1");
        assertTrue("Descriptor is not a dependency and should not be preloaded", !context.isPreloaded(dd));

        context.setPreloading(true);
        assertFalse("Descriptor is a dependency but should not be preloaded", context.isPreloaded(dd));
    }

    /**
     * Context app descriptor gets serialized.
     */
    @UnAdaptableTest
    public void testSerializeWithApp() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor("arbitrary:appname",
                ApplicationDef.class);

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED,
                desc);
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

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED,
                desc);
        ctx.setSerializeLastMod(false);
        String res = Json.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * App not serialized for context without descriptor.
     */
    @UnAdaptableTest
    public void testSerializeWithoutApp() throws Exception {
        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
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

        AuraContext ctx = Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
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
        AuraContext lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED);

        lc.addClientApplicationEvent(null);
        assertEquals("Should not be accepting null objects as events.", 0, lc.getClientEvents().size());
        Aura.getContextService().endContext();

        // Adding multiple contexts
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
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
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Event evt3 = Aura.getInstanceService().getInstance("markup://handleEventTest:applicationEvent", EventDef.class,
                null);
        lc.addClientApplicationEvent(evt3);
        Event evt3_dup = Aura.getInstanceService().getInstance("markup://handleEventTest:applicationEvent",
                EventDef.class, null);
        lc.addClientApplicationEvent(evt3_dup);
        assertEquals("Failed to add same event twice.", 2, evnts.size());
        Aura.getContextService().endContext();

        // Verify component events are not acceptable
        lc = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
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
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
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
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.setSerializeLastMod(false);
        context.getGlobalProviders().clear();

        DefDescriptor<?> added = DefDescriptorImpl.getInstance("auratest:iwasadded", EventDef.class);
        context.addLoaded(added, "somegenerateduid");
        String res = Json.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }

    public void testSerializeWithUnPreLoadedEvent() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.setSerializeLastMod(false);
        context.getGlobalProviders().clear();

        DefDescriptor<ComponentDef> added = DefDescriptorImpl.getInstance("auratest:iamloaded", ComponentDef.class);
        context.addLoaded(added, "somegenerateduid");

        DefDescriptor<EventDef> eventDesc = DefDescriptorImpl.getInstance("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        DefDescriptor<TypeDef> type = DefDescriptorImpl.getInstance("String", TypeDef.class);
        atts.put(DefDescriptorImpl.getInstance("testString", AttributeDef.class), new AttributeDefImpl(
                DefDescriptorImpl.getInstance("testString", AttributeDef.class), null, type, null, true,
                AttributeDef.SerializeToType.BOTH, null, null));
        EventDefImpl eventDef = vendor.makeEventDef(eventDesc, EventType.COMPONENT, atts, null, null);

        context.getDefRegistry().addLocalDef(eventDef);
        String res = Json.serialize(context, context.getJsonSerializationContext());
        assertTrue(res.contains("markup://fake:event"));
    }

    /**
     * Loaded map contains deleted descriptors.
     */
    public void testSerializeWithDroppedLoaded() throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.setSerializeLastMod(false);
        context.getGlobalProviders().clear();

        DefDescriptor<?> dropped = DefDescriptorImpl.getInstance("auratest:iwasdropped", EventDef.class);
        context.dropLoaded(dropped);
        String res = Json.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Verify that an app descriptor specified to startContext() is used to setup AuraContext.
     */
    public void testSettingAppDescriptorOnContext() {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor("test:laxSecurity",
                ApplicationDef.class);
        AuraContext cntx = Aura.getContextService().startContext(Mode.FTEST, Format.JSON, Authentication.AUTHENTICATED,
                appDesc);
        assertEquals(appDesc, cntx.getApplicationDescriptor());
    }

    /**
     * Verify that an cmp descriptor specified to startContext() is used to setup AuraContext.
     */
    public void testSettingAComponentAsAppDescriptorOnContext() {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("aura:text",
                ComponentDef.class);
        AuraContext cntx = Aura.getContextService().startContext(Mode.FTEST, Format.JSON, Authentication.AUTHENTICATED,
                cmpDesc);
        assertEquals(cmpDesc, cntx.getApplicationDescriptor());
    }

    public void testAddAppThemeDescriptors() throws Exception {
        DefDescriptor<ThemeDef> t = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");
        String src = String.format("<aura:application access='unauthenticated' theme='%s'/>", t.getDescriptorName());
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);

        AuraContext ctx = Aura.getContextService().startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED, app);

        ctx.addAppThemeDescriptors();

        ThemeList descriptors = ctx.getThemeList();
        assertEquals(1, descriptors.size());
        assertEquals(t, descriptors.get(0));
    }

    public void testGetThemeDescriptors() throws Exception {
        AuraContext ctx = Aura.getContextService()
                .startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED);

        DefDescriptor<ThemeDef> t1 = addSourceAutoCleanup(ThemeDef.class, "<aura:theme/>");
        DefDescriptor<ThemeDef> t2 = addSourceAutoCleanup(ThemeDef.class, "<aura:theme/>");
        DefDescriptor<ThemeDef> t3 = addSourceAutoCleanup(ThemeDef.class, "<aura:theme/>");
        ctx.appendThemeDescriptor(t1);
        ctx.appendThemeDescriptor(t2);
        ctx.appendThemeDescriptor(t3);

        ThemeList explicit = ctx.getThemeList();
        assertEquals(explicit.get(0), t1);
        assertEquals(explicit.get(1), t2);
        assertEquals(explicit.get(2), t3);
    }

    public void testSerializeWithThemes() throws Exception {
        // this app specifies test:fakeTheme
        DefDescriptor<ApplicationDef> app = DefDescriptorImpl.getInstance("test:fakeThemeApp", ApplicationDef.class);

        AuraContext ctx = Aura.getContextService()
                .startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED, app);
        ctx.setSerializeLastMod(false);
        ctx.setSerializeThemes(true);

        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeTheme2", ThemeDef.class));
        ctx.appendThemeDescriptor(DefDescriptorImpl.getInstance("test:fakeThemeWithMapProvider", ThemeDef.class));
        ctx.addAppThemeDescriptors();
        String res = getAuraTestingUtil().getSerializedAuraContext(ctx);
        // expected order
        // "test:fakeTheme" (app specified comes first)
        // "test:fakeTheme2" (explicit order)
        // "test:fakeThemeWithMapProvider" (explicit order)
        // also expect the vars hash to be present
        goldFileJson(res);
    }
}
