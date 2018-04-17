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
package org.auraframework.integration.test.context;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.auraframework.css.StyleContext;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.util.json.AuraJsonContext;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.GlobalValue;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.RegistrySet;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializerFactory;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceType;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;
import org.mockito.Mockito;

import javax.inject.Inject;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ThreadHostileTest("Tests modify if locker service is enabled")
public class AuraContextIntegrationTest extends AuraImplTestCase {

    @Inject
    private JsonSerializerFactory jsonSerializerFactory;

    public AuraContextIntegrationTest() {
    	this.setShouldSetupContext(false);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // Force LockerService to be enabled for consistency between environments
        getMockConfigAdapter().setLockerServiceEnabled(true);
    }

    /**
     * Verify the serialized format of a ComponentDef when it was 'preloaded'.
     *
     * Components which are 'preloaded' will be serialized as the descriptor. This allows the client to determine that
     * the component should be present easily, and give a more reasonable error message if it is not.
     */
    @Test
    public void testComponentDefSerializedFormat() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "preloadTest:dependenciesApp", ApplicationDef.class);
        AuraContext context = contextService.startContext(Mode.UTEST, Format.HTML,
                Authentication.AUTHENTICATED, appDesc);
        ApplicationDef appDef = definitionService.getDefinition("preloadTest:dependenciesApp", ApplicationDef.class);
        Map<DefDescriptor<?>, String> clientLoaded = Maps.newHashMap();
        clientLoaded.put(appDesc, definitionService.getUid(null, appDesc));
        context.setClientLoaded(clientLoaded);
        definitionService.updateLoaded(null);

        assertEquals("{\"descriptor\":\"markup://preloadTest:dependenciesApp\"}", JsonEncoder.serialize(appDef));
    }

    /**
     * Verify we are able to check what DefDescriptors have been preloaded.
     */
    @Test
    public void testIsPreloaded() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor(
                "preloadTest:dependenciesApp", ApplicationDef.class);
        AuraContext context = contextService
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
    @Test
    public void testSerializeWithApp() throws Exception {
        DefDescriptor<ApplicationDef> desc = definitionService.getDefDescriptor("arbitrary:appname",
                ApplicationDef.class);

        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED,
                desc);
        ctx.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Find uid in serialized cmp.
     *
     * Don't use a gold file here, the nonce changes often.
     */
    @Test
    public void testSerializeNonceWithCmp() throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("arbitrary:cmpname",
                ComponentDef.class);

        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED,
                desc);
        String expected = getMockConfigAdapter().getAuraFrameworkNonce();
        ctx.setFrameworkUID(null);
        String res = JsonEncoder.serialize(ctx, ctx.getJsonSerializationContext());
        // can't be the first character....
        assertTrue("should find the framework nonce in the serialized context", res.indexOf(expected) > 0);
    }

    /**
     * Context app descriptor gets serialized.
     */
    @UnAdaptableTest
    @Test
    public void testSerializeWithCmp() throws Exception {
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("arbitrary:cmpname",
                ComponentDef.class);

        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED,
                desc);
        ctx.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * App not serialized for context without descriptor.
     */
    @UnAdaptableTest
    @Test
    public void testSerializeWithoutApp() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Verify setting a Context's DefDescriptor.
     */
    @UnAdaptableTest
    @Test
    public void testSetApplicationDescriptor() throws Exception {
        DefDescriptor<ApplicationDef> descApp1 = definitionService.getDefDescriptor("arbitrary:appnameApp1",
                ApplicationDef.class);
        DefDescriptor<ApplicationDef> descApp2 = definitionService.getDefDescriptor("arbitrary:appnameApp2",
                ApplicationDef.class);
        DefDescriptor<ComponentDef> descCmp = definitionService.getDefDescriptor("arbitrary:cmpname",
                ComponentDef.class);

        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
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
    @Test
    public void testAttachingEvents() throws Exception {
        // Verify that nulls are filtered
        AuraContext lc = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED);

        lc.addClientApplicationEvent(null);
        assertEquals("Should not be accepting null objects as events.", 0, lc.getClientEvents().size());
        contextService.endContext();

        // Adding multiple contexts
        lc = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Event evt1 = instanceService.getInstance("markup://aura:applicationEvent", EventDef.class, null);
        lc.addClientApplicationEvent(evt1);
        Event evt2 = instanceService.getInstance("markup://aura:connectionLost", EventDef.class, null);
        lc.addClientApplicationEvent(evt2);
        List<Event> evnts = lc.getClientEvents();
        assertEquals("Found unexpected number of events on context", 2, evnts.size());
        assertEquals("markup://aura:applicationEvent", evnts.get(0).getDescriptor().getQualifiedName());
        assertEquals("markup://aura:connectionLost", evnts.get(1).getDescriptor().getQualifiedName());
        contextService.endContext();

        // Adding same event again should not cause an error, same event can be
        // fired with different parameters.
        lc = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Event evt3 = instanceService.getInstance("markup://handleEventTest:applicationEvent", EventDef.class,
                null);
        lc.addClientApplicationEvent(evt3);
        Event evt3_dup = instanceService.getInstance("markup://handleEventTest:applicationEvent",
                EventDef.class, null);
        lc.addClientApplicationEvent(evt3_dup);
        assertEquals("Failed to add same event twice.", 2, evnts.size());
        contextService.endContext();

        // Verify component events are not acceptable
        lc = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Event evt4 = instanceService.getInstance("markup://handleEventTest:event", EventDef.class, null);
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
    @Test
    public void testGetLoaded() throws Exception {
        AuraContext context = contextService.startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);

        assertTrue("Nothing should be loaded", context.getLoaded().isEmpty());

        DefDescriptor<?> dropped = definitionService.getDefDescriptor("auratest:iwasdropped", EventDef.class);
        context.dropLoaded(dropped);
        assertTrue("Deletions should not be loaded", context.getLoaded().isEmpty());
        assertNull("Dropped descriptors should not return a uid", context.getUid(dropped));

        DefDescriptor<?> added = definitionService.getDefDescriptor("auratest:iwasadded", EventDef.class);
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
    @Test
    public void testSerializeWithLoaded() throws Exception {
        AuraContext context = contextService.startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.getGlobalProviders().clear();

        DefDescriptor<?> added = definitionService.getDefDescriptor("auratest:iwasadded", EventDef.class);
        context.addLoaded(added, "somegenerateduid");
        context.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }

    @Test
    public void testSerializeWithUnPreLoadedEvent() throws Exception {
        AuraContext context = contextService.startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.getGlobalProviders().clear();

        DefDescriptor<ComponentDef> added = definitionService.getDefDescriptor("auratest:iamloaded", ComponentDef.class);
        context.addLoaded(added, "somegenerateduid");

        DefDescriptor<EventDef> eventDesc = definitionService.getDefDescriptor("fake:event", EventDef.class);
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = new HashMap<>();
        DefDescriptor<TypeDef> type = definitionService.getDefDescriptor("String", TypeDef.class);
        atts.put(definitionService.getDefDescriptor("testString", AttributeDef.class), new AttributeDefImpl(
                definitionService.getDefDescriptor("testString", AttributeDef.class), null, type, null, true,
                AttributeDef.SerializeToType.BOTH, null, new DefinitionAccessImpl(AuraContext.Access.PUBLIC)));
        EventDefImpl eventDef = vendor.makeEventDef(eventDesc, EventType.COMPONENT, atts, null, null, AuraContext.Access.INTERNAL);

        context.addDynamicDef(eventDef);
        String res = JsonEncoder.serialize(context, context.getJsonSerializationContext());
        assertTrue(res.contains("markup://fake:event"));
    }

    /**
     * Loaded map contains deleted descriptors.
     */
    @Test
    public void testSerializeWithDroppedLoaded() throws Exception {
        AuraContext context = contextService.startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED);
        context.setApplicationDescriptor(laxSecurityApp);
        context.getGlobalProviders().clear();

        DefDescriptor<?> dropped = definitionService.getDefDescriptor("auratest:iwasdropped", EventDef.class);
        context.dropLoaded(dropped);
        context.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(context, context.getJsonSerializationContext());
        goldFileJson(res);
    }

    /**
     * Verify that an app descriptor specified to startContext() is used to setup AuraContext.
     */
    @Test
    public void testSettingAppDescriptorOnContext() {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("test:laxSecurity",
                ApplicationDef.class);
        AuraContext cntx = contextService.startContext(Mode.FTEST, Format.JSON, Authentication.AUTHENTICATED,
                appDesc);
        assertEquals(appDesc, cntx.getApplicationDescriptor());
    }

    /**
     * Verify that an cmp descriptor specified to startContext() is used to setup AuraContext.
     */
    @Test
    public void testSettingAComponentAsAppDescriptorOnContext() {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ComponentDef> cmpDesc = definitionService.getDefDescriptor("aura:text",
                ComponentDef.class);
        AuraContext cntx = contextService.startContext(Mode.FTEST, Format.JSON, Authentication.AUTHENTICATED,
                cmpDesc);
        assertEquals(cmpDesc, cntx.getApplicationDescriptor());
    }

    @Test
    public void testStyleContext() throws Exception {
        DefDescriptor<TokensDef> t = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        String src = String.format("<aura:application access='unauthenticated' tokens='%s'/>", t.getDescriptorName());
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);

        AuraContext ctx = contextService.startContext(Mode.UTEST, Format.JSON,
                Authentication.UNAUTHENTICATED, app);

        ctx.setStyleContext();
        StyleContext sc = ctx.getStyleContext();
        assertNotNull(sc);
        assertEquals(1, sc.getTokens().size());
        assertEquals(t, Iterables.get(sc.getTokens(), 0));
    }

    /**
     * Verify contextPath property in JSON is set when contextPath present.
     */
    @Test
    public void testSerializeWithContextPath() throws Exception {
        DefDescriptor<ApplicationDef> app = definitionService.getDefDescriptor("test:fakeTokensApp", ApplicationDef.class);

        AuraContext ctx = contextService
                .startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED, app);
        ctx.setContextPath("/cool");
        String res = ctx.serialize(AuraContext.EncodingStyle.Full);

        assertTrue(res.contains("\"contextPath\":\"/cool\""));
    }

    private void registerGlobal(final String name, boolean writable, Object defaultValue) {
        addTearDownStep(new Runnable() {
            @Override
            public void run() {
                try {
                    Map<String, GlobalValue> values = AuraPrivateAccessor.get(AuraContextImpl.class, "allowedGlobalValues");
                    values.remove(name);
                } catch (Exception e) {
                    throw new Error(String.format("Failed to unregister the global value '%s'", name), e);
                }
            }
        });
        contextService.registerGlobal(name, writable, defaultValue);
    }

    @UnAdaptableTest("Browser in context's GVP is different in OSS")
    @Test
    public void testSerializeWithRegisteredGlobal() throws Exception {
        final String name = "someNewValue";
        registerGlobal(name, true, "some default value");

        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setFrameworkUID("#FAKEUID#");
        String res = JsonEncoder.serialize(ctx, ctx.getJsonSerializationContext());
        goldFileJson(res);
    }

    @Test
    public void testValidateGlobalRegistered() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        assertEquals(true, ctx.validateGlobal("isVoiceOver"));
    }

    @Test
    public void testValidateGlobalUnregistered() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        assertEquals(false, ctx.validateGlobal("unknown"));
    }

    @Test
    public void testValidateGlobalNull() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        assertEquals(false, ctx.validateGlobal(null));
    }

    @Test
    public void testSetGlobalUnregistered() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        try {
            ctx.setGlobalDefaultValue("unknown", "irrelevant");
            fail("expected to throw if global unregistered");
        } catch (Throwable t) {
            this.assertExceptionMessage(t, AuraRuntimeException.class,
                    "Attempt to set unknown $Global variable: unknown");
        }
    }

    @Test
    public void testSetGlobalNullName() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        try {
            ctx.setGlobalDefaultValue(null, "irrelevant");
            fail("expected to throw if global unregistered");
        } catch (Throwable t) {
            this.assertExceptionMessage(t, AuraRuntimeException.class,
                    "Attempt to set unknown $Global variable: null");
        }
    }

    @Test
    public void testSetGlobal() throws Exception {
        final String name = getName();
        registerGlobal(name, true, "some default value");
        Object expected = new Object();
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setGlobalDefaultValue(name, expected);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testSetGlobalNullValue() throws Exception {
        final String name = getName();
        registerGlobal(name, true, "some default value");
        Object expected = null;
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setGlobalDefaultValue(name, expected);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testGetGlobalUnregistered() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        try {
            ctx.getGlobal("unknown");
            fail("expected to throw if global unregistered");
        } catch (Throwable t) {
            this.assertExceptionMessage(t, AuraRuntimeException.class,
                    "Attempt to retrieve unknown $Global variable: unknown");
        }
    }

    @Test
    public void testGetGlobalNull() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        try {
            ctx.getGlobal(null);
            fail("expected to throw if global null");
        } catch (Throwable t) {
            this.assertExceptionMessage(t, AuraRuntimeException.class,
                    "Attempt to retrieve unknown $Global variable: null");
        }
    }

    @Test
    public void testGetGlobalDefault() throws Exception {
        final String name = getName();
        Object expected = new Object();
        registerGlobal(name, true, expected);
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testGetGlobalDefaultNull() throws Exception {
        final String name = getName();
        Object expected = null;
        registerGlobal(name, true, expected);
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testGetGlobalSetValue() throws Exception {
        final String name = getName();
        Object defaultValue = new Object();
        Object expected = new Object();
        registerGlobal(name, true, defaultValue);
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setGlobalDefaultValue(name, expected);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testGetGlobalSetNull() throws Exception {
        final String name = getName();
        Object defaultValue = new Object();
        Object expected = null;
        registerGlobal(name, true, defaultValue);
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setGlobalDefaultValue(name, expected);
        assertEquals(expected, ctx.getGlobal(name));
    }

    @Test
    public void testGetGlobals() throws Exception {
        String name1 = getName() + "first";
        String name2 = getName() + "second";
        Object defaultValue = new Object();
        Object setValue = new Object();
        registerGlobal(name1, true, defaultValue);
        registerGlobal(name2, true, defaultValue);
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setGlobalDefaultValue(name2, setValue);

        ImmutableMap<String, GlobalValue> globals = ctx.getGlobals();
        assertEquals("missing first registered value", true, globals.containsKey(name1));
        assertEquals("missing second registered value", true, globals.containsKey(name2));
        assertEquals("unexpected first value", defaultValue, globals.get(name1).getValue());
        assertEquals("unexpected second value", setValue, globals.get(name2).getValue());
    }

    @Test
    public void testGetAccessVersion() throws Exception {
        AuraContext ctx = contextService.startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);
        String descr = "java://org.auraframework.components.test.java.controller.VersionTestController/ACTION$getContextAccessVersion";
        Action action = (Action) instanceService.getInstance(descr, ActionDef.class);
        DefDescriptor<ComponentDef> callingDescriptor = definitionService.getDefDescriptor("markup://auratest:requireWithServerAction", ComponentDef.class);
        action.setCallingDescriptor(callingDescriptor);
        action.setCallerVersion("2.0");
        ctx.setCurrentAction(action);
        ctx.setApplicationDescriptor(
                definitionService.getDefDescriptor("markup://componentTest:versionInServer", ComponentDef.class));

        String version = ctx.getAccessVersion();
        assertEquals("2.0", version);
    }

    /**
     * Some data that should serialize a reference ID.
     */
    @Serialization(referenceType = ReferenceType.IDENTITY)
    private class DataWithRef implements JsonSerializable {
        @Override
        public void serialize(Json json) throws IOException {
            json.writeValue("identity");
        }
    }

    /**
     * Some data that should not serialize a reference ID.
     */
    @Serialization(referenceType = ReferenceType.NONE)
    private class DataWithoutRef implements JsonSerializable {
        @Override
        public void serialize(Json json) throws IOException {
            json.writeValue("none");
        }
    }

    /**
     * A simple configurable GlobalValueProvider
     */
    private class TestValueProvider implements GlobalValueProvider {
        private String prefix;
        private boolean refSupport;
        private Map<String, ?> data;

        @Override
        public Object getValue(PropertyReference key) throws QuickFixException {
            throw new UnsupportedOperationException("Not expecting to getValue");
        }

        @Override
        public ValueProviderType getValueProviderKey() {
            return new ValueProviderType() {
                @Override
                public String getPrefix() {
                    return prefix;
                }

                @Override
                public boolean isGlobal() {
                    return true;
                }
            };
        }

        @Override
        public DefDescriptor<TypeDef> getReturnTypeDef() {
            return null;
        }

        @Override
        public void validate(PropertyReference expr) throws InvalidExpressionException {
        }

        @Override
        public boolean isEmpty() {
            return false;
        }

        @Override
        public boolean refSupport() {
            return refSupport;
        }

        @Override
        public Map<String, ?> getData() {
            return data;
        }
    }

    /**
     * GVP with refSupport should serialize reference IDs of data that supports references.
     *
     * RefSupport for GVP has been deprecated so GVPs will not have refs because AuraContext serialization
     * has no refs
     */
    @Test
    public void testSerializeGlobalValueProviderWithRefSupport() throws Exception {
        TestValueProvider provider = new TestValueProvider();
        provider.prefix = "$REFS";
        provider.data = ImmutableMap.of("data", new DataWithRef());
        provider.refSupport = true;

        Map<String, GlobalValueProvider> globalProviders = Maps.newHashMap();
        globalProviders.put(provider.prefix, provider);

        Mode mode = Mode.PROD;
        RegistrySet rs = Mockito.mock(RegistrySet.class);
        AuraJsonContext serCtx = AuraJsonContext.createContext(mode, jsonSerializerFactory);
        AuraContext ctx = new AuraContextImpl(mode, rs, null, Format.JSON, Authentication.AUTHENTICATED, serCtx,
                globalProviders, configAdapter, definitionService, testContextAdapter);
        ctx.setFrameworkUID("#FAKEUID#");

        String res = JsonEncoder.serialize(ctx, serCtx);
        goldFileJson(res);
    }

    /**
     * GVP without refSupport should serialize data, that supports references, as-is (without reference IDs).
     *
     * RefSupport for GVP has been deprecated so GVPs will not have refs because AuraContext serialization
     * has no refs
     */
    @Test
    public void testSerializeGlobalValueProviderWithoutRefSupport() throws Exception {
        TestValueProvider provider = new TestValueProvider();
        provider.prefix = "$NONE";
        provider.data = ImmutableMap.of("data", new DataWithRef());
        provider.refSupport = false;

        Map<String, GlobalValueProvider> globalProviders = Maps.newHashMap();
        globalProviders.put(provider.prefix, provider);

        Mode mode = Mode.PROD;
        RegistrySet rs = Mockito.mock(RegistrySet.class);
        AuraJsonContext serCtx = AuraJsonContext.createContext(mode, jsonSerializerFactory);
        AuraContext ctx = new AuraContextImpl(mode, rs, null, Format.JSON, Authentication.AUTHENTICATED, serCtx,
                globalProviders, configAdapter, definitionService, testContextAdapter);
        ctx.setFrameworkUID("#FAKEUID#");

        String res = JsonEncoder.serialize(ctx, serCtx);
        goldFileJson(res);
    }

    /**
     * GVP with refSupport should handle data without references.
     *
     * RefSupport for GVP has been deprecated so GVPs will not have refs because AuraContext serialization
     * has no refs
     */
    @Test
    public void testSerializeGlobalValueProviderWithRefSupportWithoutAReference() throws Exception {
        TestValueProvider provider = new TestValueProvider();
        provider.prefix = "$REFS";
        provider.data = ImmutableMap.of("data", new DataWithoutRef());
        provider.refSupport = true;

        Map<String, GlobalValueProvider> globalProviders = Maps.newHashMap();
        globalProviders.put(provider.prefix, provider);

        Mode mode = Mode.PROD;
        RegistrySet rs = Mockito.mock(RegistrySet.class);
        AuraJsonContext serCtx = AuraJsonContext.createContext(mode, jsonSerializerFactory);
        AuraContext ctx = new AuraContextImpl(mode, rs, null, Format.JSON, Authentication.AUTHENTICATED, serCtx,
                globalProviders, configAdapter, definitionService, testContextAdapter);
        ctx.setFrameworkUID("#FAKEUID#");

        String res = JsonEncoder.serialize(ctx, serCtx);
        goldFileJson(res);
    }

    /**
     * GVPs with mixed refSupport should handle respective data with and without references. Note: ordering of
     * serialized providers is not guaranteed, but should be consistent.
     *
     * RefSupport for GVP has been deprecated so GVPs will not have refs because AuraContext serialization
     * has no refs
     */
    @Test
    public void testSerializeGlobalValueProvidersWithMixedRefSupport() throws Exception {
        TestValueProvider provider1 = new TestValueProvider();
        provider1.prefix = "$REFS1";
        provider1.data = ImmutableMap.of("yes", new DataWithRef(), "no", new DataWithoutRef());
        provider1.refSupport = true;

        TestValueProvider provider2 = new TestValueProvider();
        provider2.prefix = "$NONE2";
        provider2.data = ImmutableMap.of("yes", new DataWithRef(), "no", new DataWithoutRef());
        provider2.refSupport = false;

        TestValueProvider provider3 = new TestValueProvider();
        provider3.prefix = "$REFS3";
        provider3.data = ImmutableMap.of("yes", new DataWithRef(), "no", new DataWithoutRef());
        provider3.refSupport = true;

        TestValueProvider provider4 = new TestValueProvider();
        provider4.prefix = "$NONE4";
        provider4.data = ImmutableMap.of("yes", new DataWithRef(), "no", new DataWithoutRef());
        provider4.refSupport = false;

        Map<String, GlobalValueProvider> globalProviders = Maps.newHashMap();
        globalProviders.put(provider1.prefix, provider1);
        globalProviders.put(provider2.prefix, provider2);
        globalProviders.put(provider3.prefix, provider3);
        globalProviders.put(provider4.prefix, provider4);

        Mode mode = Mode.PROD;
        RegistrySet rs = Mockito.mock(RegistrySet.class);
        AuraJsonContext serCtx = AuraJsonContext.createContext(mode, jsonSerializerFactory);
        AuraContext ctx = new AuraContextImpl(mode, rs, null, Format.JSON, Authentication.AUTHENTICATED, serCtx,
                globalProviders, configAdapter, definitionService, testContextAdapter);
        ctx.setFrameworkUID("#FAKEUID#");

        String res = JsonEncoder.serialize(ctx, serCtx);
        goldFileJson(res);
    }

    /**
     * Verify action-public-caching-enabled (acpe) and action-public-cache-key properties are added to JSON when action 
     * public caching is enabled in Full encoding style
     */
    @ThreadHostileTest("Tests modify if public action caching enabled")
    @Test
    public void testSerializeWithActionPublicCaching() throws Exception {
        getMockConfigAdapter().setActionPublicCachingEnabled(true);

        AuraContext ctx = contextService.startContext(Mode.UTEST, Format.JSON, Authentication.UNAUTHENTICATED);
        ctx.setActionPublicCacheKey("someKey");

        String res = ctx.serialize(AuraContext.EncodingStyle.Full);

        assertTrue(res.contains("\"apce\":1"));
        assertTrue(res.contains("\"apck\":\"someKey\""));

        res = ctx.serialize(AuraContext.EncodingStyle.Normal);

        assertTrue(!res.contains("\"apce\":1"));
        assertTrue(!res.contains("\"apck\":\"someKey\""));
    }
}
