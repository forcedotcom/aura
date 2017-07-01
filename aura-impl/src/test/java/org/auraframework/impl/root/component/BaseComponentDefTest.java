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
package org.auraframework.impl.root.component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.root.RootDefinitionTest;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.CompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public abstract class BaseComponentDefTest<T extends BaseComponentDef> extends RootDefinitionTest<T> {
    @Inject
    protected CompilerService compilerService;

    public BaseComponentDefTest(Class<T> defClass, String tag) {
        super(defClass, tag);
    }

    @Test
    public void testHashCode() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = new HashMap<>();
        attributeDefs.put(definitionService.getDefDescriptor(vendor.getAttributeName(), AttributeDef.class),
                vendor.makeAttributeDef());

        Map<String, RegisterEventDef> eventDefs = new HashMap<>();
        eventDefs.put("fakey", vendor.makeRegisterEventDef());

        List<ComponentDefRef> children = new ArrayList<>();
        children.add(vendor.makeComponentDefRef());

        Location location = vendor.makeLocation();

        DefDescriptor<ModelDef> modelDesc = vendor.getModelDescriptor();

        @SuppressWarnings("unchecked")
        DefDescriptor<T> extendsDesc = (DefDescriptor<T>) vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:parent", null, null, null, null, null, null, null, null, null, null, null, false, true, AuraContext.Access.INTERNAL)
                .getDescriptor();

        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<>();
        interfaces.add(vendor.getInterfaceDefDescriptor());

        List<DefDescriptor<RendererDef>> renderers = new ArrayList<>();
        renderers.add(definitionService.getDefDescriptor("java://test.renderer", RendererDef.class));

        List<EventHandlerDef> eventHandlers = new ArrayList<>();
        eventHandlers.add(vendor.makeEventHandlerDef());

        List<DefDescriptor<HelperDef>> helpers = new ArrayList<>();
        helpers.add(vendor.getHelperDescriptor());

        BaseComponentDef bcdAll = vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                eventDefs, children, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                renderers, helpers, eventHandlers, false, false, AuraContext.Access.INTERNAL);
        int baseCode = bcdAll.hashCode();

        // ignore children and eventHandlers
        assertEquals(baseCode, vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("descriptor not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test2", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("attributes not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", null,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("events not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        null, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                        renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("location not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, null, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                        renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("controller not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, null, modelDesc, extendsDesc, interfaces, renderers, helpers, null,
                        false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("model not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), null, extendsDesc, interfaces,
                        renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("extends not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, null, interfaces,
                        renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("interfaces not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, null,
                        renderers, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("renderers not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, null, helpers, null, false, false, AuraContext.Access.INTERNAL).hashCode());

        assertFalse("helpers not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, null, null, null, false, false, AuraContext.Access.INTERNAL).hashCode());
    }

    @Test
    public void testEquals() throws Exception {
        String desc = getAuraTestingUtil().getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        assertTrue("The BaseComponentDefs should have been equal", bcd1.equals(bcd2));
    }

    @Test
    public void testEqualsWithDifferentObjects() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                getAuraTestingUtil().getNonce("test:cmp"), null, null, null, null, null, null, null, null, null, null,
                null, false, false, AuraContext.Access.INTERNAL);
        assertFalse("A BaseComponentDef shouldn't equal a ComponentDefRef",
                bcd.equals(vendor.makeComponentDefRef()));
    }

    @Test
    public void testEqualsWithDifferentController() throws Exception {
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor("java://foo.bar2",
                ControllerDef.class);
        String desc = getAuraTestingUtil().getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, controllerDesc, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        assertFalse("A BaseComponentDef shouldn't be equal with different controllers", bcd1.equals(bcd2));
    }

    @Test
    public void testEqualsWithDifferentParents() throws Exception {
        DefDescriptor<T> parentDesc = definitionService.getDefDescriptor("fake:componentParent2", getDefClass());
        String desc = getAuraTestingUtil().getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, parentDesc, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        assertFalse("A BaseComponentDef shouldn't be equal with different parents", bcd1.equals(bcd2));
    }

    @Test
    public void testEqualsWithDifferentEvents() throws Exception {
        DefDescriptor<EventDef> eventDefDescriptor = definitionService.getDefDescriptor("fake:event2", EventDef.class);
        String desc = getAuraTestingUtil().getNonce("test:cmp");
        Map<String, RegisterEventDef> eventDefs = ImmutableMap.of("fakey2",
                (RegisterEventDef) vendor.makeRegisterEventDef(definitionService.getDefDescriptor(desc, ComponentDef.class), eventDefDescriptor, false, null));
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, eventDefs, null, location, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        assertFalse("A BaseComponentDef shouldn't be equal with different registered events", bcd1.equals(bcd2));
    }

    @Test
    public void testSerializeWithAttributes() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> testAttributeDefs = ImmutableMap.of(
                definitionService.getDefDescriptor("testAttributeDescriptorName", AttributeDef.class),
                (AttributeDef) vendor.makeAttributeDefWithNulls(
                        "testAttributeDescriptorName",
                        null,
                        vendor.getTypeDefDescriptor(),
                        vendor.makeAttributeDefRef("testAttributeDescriptorName", "testValue",
                                vendor.makeLocation("filename1", 5, 5, 0)),
                        false, null,
                        vendor.makeLocation("filename1", 5, 5, 0)));
        serializeAndGoldFile(vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", testAttributeDefs, null, null, vendor.makeLocation("filename1", 5, 5, 0), null,
                null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL));
    }

    @Test
    public void testSerializeBasic() throws Exception {
        serializeAndGoldFile(vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null,
                null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL));
    }

    @Test
    @UnAdaptableTest("Checks for running this test in core are different so will not be in Locker")
    public void testSerializeInLocker() throws Exception {
        // Using a non-internal namespace will put the component in the Locker
        serializeAndGoldFile(vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "nonInternal:component", null, null, null, vendor.makeLocation("filename3", 10, 10, 0), null,
                null, null, null, null, null, null, false, false, AuraContext.Access.PUBLIC));
    }

    /**
     * RendererDefs are sent to client as part of component classes so do not need to be serialized as part of the
     * ComponentDef
     */
    @Test
    public void testRendererDefsNotSerialized() throws Exception {
        List<DefDescriptor<RendererDef>> rendererList = new ArrayList<>();
        DefDescriptor<RendererDef> renderer = definitionService.getDefDescriptor(
                "js://aura.html", RendererDef.class);
        rendererList.add(renderer);
        Object cmpDef = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:if", null, null, null, null, null, null, null, null,
                rendererList, null, null, false, false, AuraContext.Access.INTERNAL);

        Map<?, ?> json = (Map<?, ?>) new JsonReader().read(toJson(cmpDef));
        Map<?, ?> rendererDef = (Map<?, ?>) json.get("rendererDef");

        assertNull("RendererDef should not be serialized with ComponentDef",
                rendererDef);
    }

    /**
     * HeleprDefs are sent to client as part of component classes so do not need to be serialized as part of the
     * ComponentDef
     */
    @Test
    public void testHelperDefNotSerialized() throws Exception {
        List<DefDescriptor<HelperDef>> helperList = new ArrayList<>();
        DefDescriptor<HelperDef> helper = definitionService.getDefDescriptor(
                "js://aura.label", HelperDef.class);
        helperList.add(helper);
        Object cmpDef = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:if", null, null, null, null, null, null, null, null,
                null, helperList, null, false, false, AuraContext.Access.INTERNAL);

        Map<?, ?> json = (Map<?, ?>) new JsonReader().read(toJson(cmpDef));
        Map<?, ?> helperDef = (Map<?, ?>) json.get("helperDef");

        assertNull("HelperDef should not be serialized with ComponentDef",
                helperDef);
    }

    @Test
    public void testComponentClassSerialized() throws Exception {
        Object cmpDef = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:text", null, null, null, null, null, null, null, null,
                null, null, null, false, false, AuraContext.Access.INTERNAL);

        Map<?, ?> json = (Map<?, ?>) new JsonReader().read(toJson(cmpDef));
        String componentClass = (String) json.get(Json.ApplicationKey.COMPONENTCLASS.toString());

        assertNotNull(componentClass);
    }

    @Test
    public void testGetAttributeDefsSpidered() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<T> extendsDescriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:attribute name='parentAttribute' type='String'/>"));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", null, null, null, null, null, null, extendsDescriptor, interfaces, null, null, null,
                false, false, AuraContext.Access.INTERNAL);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = bcd.getAttributeDefs();
        //assertEquals(4  , attributes.size());
        assertTrue("mystring should be an attribute",
                attributes.containsKey(definitionService.getDefDescriptor("mystring", AttributeDef.class)));
        assertTrue("body should be an attribute",
                attributes.containsKey(definitionService.getDefDescriptor("body", AttributeDef.class)));
        assertTrue("parentAttribute should be an attribute",
                attributes.containsKey(definitionService.getDefDescriptor("parentAttribute", AttributeDef.class)));
    }

    @Test
    public void testGetRegisteredEventDefs() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<T> extendsDescriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:registerevent name='anotherParentEvent' type='test:parentEvent'/>"));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", null, null, null, null, null, null, extendsDescriptor, interfaces, null, null, null,
                false, false, AuraContext.Access.INTERNAL);
        Map<String, RegisterEventDef> registeredED = bcd.getRegisterEventDefs();
        assertEquals(2, registeredED.size());
        assertNotNull(registeredED.containsKey("parentEvent"));
        assertNotNull(registeredED.containsKey("anotherParentEvent"));
    }

    @Test
    public void testAppendDependenciesWithNone() throws Exception {
        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", null, null, null, null,
                null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        bcd.appendDependencies(dependencies);

        assertFalse(dependencies.isEmpty());
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(vendor.getBaseComponentPrototype(getDefClass())));
    }

    @Test
    public void testAppendDependenciesDoesNotIncludeBundledParts() throws QuickFixException {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true'", ""));
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<InterfaceDef> intfDesc = addSourceAutoCleanup(InterfaceDef.class, "<aura:interface/>");
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='component' support='GA'/>");

        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format("extends='%s' implements='%s'", parentDesc.getDescriptorName(),
                                intfDesc.getDescriptorName()),
                        String.format(
                                "<%s/><aura:registerevent name='evt' type='%s'/>", childDesc.getDescriptorName(),
                                eventDesc.getDescriptorName())));

        DefDescriptor<ProviderDef> providerDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, ProviderDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(providerDesc, "{provide:function(){}}");
        
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(modelDesc, "{obj:{}}");
        DefDescriptor<ControllerDef> controllerDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc,
                ControllerDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(controllerDesc, "{hi:function(){}}");

        DefDescriptor<RendererDef> rendererDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(rendererDesc, "({render:function(c){return this.superRender();}})");

        DefDescriptor<HelperDef> helperDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, HelperDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(helperDesc, "({help:function(){}})");

        DefDescriptor<StyleDef> styleDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        StyleDef.class);
        addSourceAutoCleanup(styleDesc, ".THIS {}");

        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        definitionService.getDefinition(cmpDesc).appendDependencies(dependencies);

        Set<DefDescriptor<?>> expected = Sets.newHashSet(parentDesc, childDesc, intfDesc, eventDesc, styleDesc);
        if (!dependencies.containsAll(expected)) {
            StringBuilder msg = new StringBuilder("missing dependencies:");
            expected.removeAll(dependencies);
            expected.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
        if (!expected.containsAll(dependencies)) {
            StringBuilder msg = new StringBuilder("extra dependencies:");
            dependencies.removeAll(expected);
            dependencies.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
    }

    @Test
    public void testAppendDependenciesWithServerDependencies() throws QuickFixException {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true'", ""));
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<InterfaceDef> intfDesc = addSourceAutoCleanup(InterfaceDef.class, "<aura:interface/>");
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='component' support='GA'/>");
        DefDescriptor<?> providerDesc = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.java.provider.ConcreteProvider", ProviderDef.class);
        DefDescriptor<?> modelDesc = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.java.model.TestModel", ModelDef.class);
        DefDescriptor<?> controllerDesc = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.java.controller.ComponentTestController", ControllerDef.class);
        DefDescriptor<?> rendererDesc = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", RendererDef.class);

        
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "extends='%s' implements='%s' provider='%s' model='%s' controller='%s' renderer='%s'",
                                parentDesc.getDescriptorName(), intfDesc.getDescriptorName(), providerDesc, modelDesc,
                                controllerDesc, rendererDesc),
                        String.format(
                                "<%s/><aura:registerevent name='evt' type='%s'/>", childDesc.getDescriptorName(),
                                eventDesc.getDescriptorName())));

        DefDescriptor<StyleDef> styleDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        StyleDef.class);
        addSourceAutoCleanup(styleDesc, ".THIS {}");

        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        definitionService.getDefinition(cmpDesc).appendDependencies(dependencies);

        Set<DefDescriptor<?>> expected = Sets.newHashSet(parentDesc, childDesc, intfDesc, providerDesc, modelDesc,
                controllerDesc, eventDesc, styleDesc, rendererDesc);
        if (!dependencies.containsAll(expected)) {
            StringBuilder msg = new StringBuilder("missing dependencies:");
            expected.removeAll(dependencies);
            expected.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
        if (!expected.containsAll(dependencies)) {
            StringBuilder msg = new StringBuilder("extra dependencies:");
            dependencies.removeAll(expected);
            dependencies.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
    }

    @Test
    public void testAppendDependenciesWithExternalDependencies() throws QuickFixException {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true'", ""));
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<InterfaceDef> intfDesc = addSourceAutoCleanup(InterfaceDef.class, "<aura:interface/>");
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='component' support='GA'/>");

        DefDescriptor<ProviderDef> providerDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, ProviderDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(providerDesc, "{provide:function(){}}");
        
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(modelDesc, "{obj:{}}");
        DefDescriptor<ControllerDef> controllerDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc,
                ControllerDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(controllerDesc, "{hi:function(){}}");

        DefDescriptor<RendererDef> rendererDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(rendererDesc, "({render:function(c){return this.superRender();}})");

        DefDescriptor<HelperDef> helperDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, HelperDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(helperDesc, "({help:function(){}})");

        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "extends='%s' implements='%s' provider='%s' model='%s' controller='%s' renderer='%s'",
                                parentDesc.getDescriptorName(), intfDesc.getDescriptorName(), providerDesc, modelDesc,
                                controllerDesc, rendererDesc, helperDesc),
                        String.format(
                                "<%s/><aura:registerevent name='evt' type='%s'/>", childDesc.getDescriptorName(),
                                eventDesc.getDescriptorName())));

        DefDescriptor<StyleDef> styleDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        StyleDef.class);
        addSourceAutoCleanup(styleDesc, ".THIS {}");

        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        definitionService.getDefinition(cmpDesc).appendDependencies(dependencies);

        Set<DefDescriptor<?>> expected = Sets.newHashSet(parentDesc, childDesc, intfDesc, eventDesc, styleDesc);
        if (!dependencies.containsAll(expected)) {
            StringBuilder msg = new StringBuilder("missing dependencies:");
            expected.removeAll(dependencies);
            expected.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
        if (!expected.containsAll(dependencies)) {
            StringBuilder msg = new StringBuilder("extra dependencies:");
            dependencies.removeAll(expected);
            dependencies.forEach((desc) -> {
                msg.append(" " + desc.getDefType() + "-" + desc);
            });
            fail(msg.toString());
        }
    }

    /**
     * InvalidDefinitionException if model is empty.
     */
    @Test
    public void testModelEmpty() throws Exception {
        try {
            define(baseTag, "model=''", "");
            fail("Should not be able to load component with empty model");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if model is invalid.
     */
    @Test
    public void testModelInvalid() throws Exception {
        try {
            define(baseTag, "model='oops'", "");
            fail("Should not be able to load component with invalid model");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No MODEL named java://oops found");
        }
    }

    /**
     * Multiple models are not allowed.
     */
    @Test
    public void testModelMultipleExplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag,
                        "model='java://org.auraframework.components.test.java.model.TestModel,js://test.jsModel'",
                        ""));
        try {
            definitionService.getDefinition(compDesc);
            fail("Should not be able to load component with multiple models");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Invalid Descriptor Format: java://org.auraframework.components.test.java.model.TestModel,js://test.jsModel[MODEL]");
        }
    }

    /**
     * W-1623475: Should throw QFE if multiple models are attempted.
     */
    public void _testModelExplicitAndImplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "model='java://org.auraframework.components.test.java.model.TestModel'", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(modelDesc, "{obj:{}}");
        try {
            definitionService.getDefinition(compDesc);
            fail("Should not be able to load component with explicit and implicit models");
        } catch (QuickFixException e) {
            checkExceptionFull(e, QuickFixException.class, "need to update this class and description when fixed");
        }
    }

    /**
     * InvalidDefinitionException if controller is empty.
     */
    @Test
    public void testControllerEmpty() throws Exception {
        try {
            define(baseTag, "controller=''", "");
            fail("Should not be able to load component with empty controller");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if controller is invalid.
     */
    @Test
    public void testControllerInvalid() throws Exception {
        try {
            define(baseTag, "controller='oops'", "");
            fail("Should not be able to load component with invalid controller");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No CONTROLLER named java://oops found");
        }
    }

    /**
     * InvalidDefinitionException if renderer is empty.
     */
    @Test
    public void testRendererEmpty() throws Exception {
        try {
            define(baseTag, "renderer=''", "");
            fail("Should not be able to load component with empty renderer");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if renderer is invalid.
     */
    @Test
    public void testRendererInvalid() throws Exception {
        try {
            define(baseTag, "renderer='oops'", "");
            fail("Should not be able to load component with invalid renderer");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No RENDERER named js://oops found");
        }
    }

    /**
     * InvalidDefinitionException if provider is empty.
     */
    @Test
    public void testProviderEmpty() throws Exception {
        try {
            define(baseTag, "provider=''", "");
            fail("Should not be able to load component with empty provider");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if provider is invalid.
     */
    @Test
    public void testProviderInvalid() throws Exception {
        try {
            define(baseTag, "provider='oops'", "");
            fail("Should not be able to load component with invalid provider");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No PROVIDER named java://oops found");
        }
    }

    /**
     * getModelDefDescriptors returns empty list if there are no models. Test method for
     * {@link BaseComponentDef#getModelDefDescriptors()}.
     */
    @Test
    public void testGetModelDefDescriptorsWithoutModels() throws QuickFixException {
        List<DefDescriptor<ModelDef>> dds = define(baseTag, "", "").getModelDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDefDescriptors()}.
     */
    @Test
    public void testGetModelDefDescriptors() throws QuickFixException {
        DefDescriptor<T> grandParentDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag,
                "extensible='true'", ""));
        DefDescriptor<ModelDef> grandParentModelDesc = DefDescriptorImpl.getAssociateDescriptor(grandParentDesc,
                ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(grandParentModelDesc, "{obj:{}}");

        DefDescriptor<T> parentDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format("extends='%s' extensible='true' model='js://test.jsModel'",
                                grandParentDesc.getDescriptorName()),
                        ""));

        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(
                baseTag,
                String.format("extends='%s' model='java://org.auraframework.components.test.java.model.TestModel'",
                        parentDesc.getDescriptorName()),
                ""));

        List<DefDescriptor<ModelDef>> dds = definitionService.getDefinition(compDesc).getModelDefDescriptors();
        assertNotNull(dds);

        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        Set<String> expected = ImmutableSet.of("java://org.auraframework.components.test.java.model.TestModel",
                "js://test.jsModel", grandParentModelDesc.getQualifiedName());
        if (!names.containsAll(expected)) {
            fail("Missing expected models. Expected: " + expected + ", Actual: " + names);
        }
        if (!expected.containsAll(names)) {
            fail("Unexpected models. Expected: " + expected + ", Actual: " + names);
        }
    }

    /**
     * getModelDef returns null if there are no models Test method for {@link BaseComponentDef#getModelDef()}.
     */
    @Test
    public void testGetModelDefWithoutModels() throws QuickFixException {
        ModelDef d = define(baseTag, "", "").getModelDef();
        assertNull(d);
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    @Test
    public void testGetModelDefWithJavaModel() throws QuickFixException {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.components.test.java.model.TestModel2'", "")
                        .getDescriptor();
        ModelDef d = define(
                baseTag,
                "model='java://org.auraframework.components.test.java.model.TestModel' extends='"
                        + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'",
                "").getModelDef();
        assertNotNull(d);
        assertEquals("TestModel", d.getName());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    @Test
    public void testGetModelDefWithJsonModel() throws QuickFixException {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.components.test.java.model.TestModel2'", "")
                        .getDescriptor();
        ModelDef d = define(
                baseTag,
                "model='js://test.jsModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'",
                "").getModelDef();
        assertNotNull(d);
        assertEquals("jsModel", d.getName());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    @Test
    public void testGetModelDefWithImplicitJsonModel() throws QuickFixException {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(modelDesc, "{obj:{}}");

        ModelDef d = definitionService.getDefinition(compDesc).getModelDef();
        assertNotNull(d);
        assertEquals(modelDesc, d.getDescriptor());
    }

    /**
     * Implicit model is ignored if explicit model is specified. Test method for {@link BaseComponentDef#getModelDef()}.
     */
    @Test
    public void testGetModelDefWithImplicitAndExplicit() throws QuickFixException {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "model='java://org.auraframework.components.test.java.model.TestModel'", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(modelDesc, "{obj:{}}");

        ModelDef d = definitionService.getDefinition(compDesc).getModelDef();
        assertNotNull(d);
        assertEquals("java://org.auraframework.components.test.java.model.TestModel",
                d.getDescriptor().getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDefDescriptors()}.
     */
    @Test
    public void testGetControllerDefDescriptorsWithoutControllers() throws QuickFixException {
        List<DefDescriptor<ControllerDef>> dds = define(baseTag, "", "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDefDescriptors()}.
     */
    @Test
    public void testGetControllerDefDescriptors() throws QuickFixException {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' controller='java://org.auraframework.components.test.java.controller.JavaTestController'", "")
                        .getDescriptor();
        List<DefDescriptor<ControllerDef>> dds = define(
                baseTag,
                "controller='java://org.auraframework.components.test.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'",
                "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertEquals(2, dds.size());
        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        assertTrue(names.containsAll(ImmutableSet.of(
                "java://org.auraframework.components.test.java.controller.TestController",
                "java://org.auraframework.components.test.java.controller.JavaTestController")));
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDef()}.
     */
    @Test
    public void testGetControllerDefWithoutControllers() throws QuickFixException {
        ControllerDef d = define(baseTag, "", "").getControllerDef();
        assertNull(d);
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDef()}.
     */
    @Test
    public void testGetControllerDef() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> ddParent = define(baseTag,
                "extensible='true' controller='java://org.auraframework.components.test.java.controller.TestController'", "")
                        .getDescriptor();
        ControllerDef d = define(
                baseTag,
                "controller='java://org.auraframework.components.test.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'",
                "").getControllerDef();
        assertNotNull(d);
        String name = d.getDescriptor().getQualifiedName();
        assertTrue("Unexpected name: " + name, name.matches("compound://string\\..*"));
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetRendererDescriptorWithoutRenderer() throws QuickFixException {
        DefDescriptor<RendererDef> dd = define(baseTag, "", "").getRendererDescriptor();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetRendererDescriptorExplicit() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> ddParent = define(
                baseTag,
                "extensible='true' renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer'",
                "").getDescriptor();
        DefDescriptor<RendererDef> dd = define(
                baseTag,
                String.format(
                        "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer' extends='%s'",
                        ddParent.getDescriptorName()),
                "").getRendererDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer",
                dd.getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetRendererDescriptorImplicit() throws QuickFixException {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<RendererDef> dd = definitionService.getDefinition(cmpDesc).getRendererDescriptor();
        assertNotNull(dd);
        assertEquals(renderDesc, dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetRendererDescriptorExplicitAndImplicit() throws Exception {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag,
                        "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer'",
                        ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<RendererDef> dd = definitionService.getDefinition(cmpDesc).getRendererDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer",
                dd.getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetRendererDescriptorExplicitRemoteAndLocal() throws Exception {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer,%s'",
                                renderDesc.getQualifiedName()),
                        ""));
        DefDescriptor<RendererDef> dd = definitionService.getDefinition(cmpDesc).getRendererDescriptor();
        assertNotNull(dd);
        assertEquals(renderDesc, dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetLocalRendererDefExplicitLocal() throws Exception {
        RendererDef dd = define(baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'", "")
                        .getLocalRendererDef();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", dd
                .getDescriptor().getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    @Test
    public void testGetLocalRendererDefExplicitRemote() throws QuickFixException {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        RendererDef dd = define(baseTag, String.format("renderer='%s'", renderDesc.getQualifiedName()), "")
                .getLocalRendererDef();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getLocalRendererDef()}.
     */
    @Test
    public void testGetLocalRendererDefImplicit() throws QuickFixException {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        RendererDef dd = definitionService.getDefinition(cmpDesc).getLocalRendererDef();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getLocalRendererDef()}.
     */
    @Test
    public void testGetLocalRendererDefExplicitRemoteAndLocal() throws QuickFixException {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer,%s'",
                                renderDesc.getQualifiedName()),
                        ""));
        RendererDef dd = definitionService.getDefinition(cmpDesc).getLocalRendererDef();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer", dd
                .getDescriptor().getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getHandlerDefs()}.
     */
    @Test
    public void testGetHandlerDefsWithNoHandlers() throws QuickFixException {
        // Verify no handlers for empty component
        T def = define(baseTag, "", "");
        Collection<EventHandlerDef> handlerDefs = def.getHandlerDefs();
        assertEquals("Should have no handlers for empty component", 0, handlerDefs.size());
    }

    /**
     * Test method for {@link BaseComponentDef#getHandlerDefs()}.
     */
    @Test
    public void testGetHandlerDefs() throws QuickFixException {
        // Verify multiple handlers can be added
        T def = define(baseTag, "", "<aura:handler event=\"aura:doneWaiting\" action=\"{!c.empty}\"/>"
                + "<aura:handler event=\"aura:doneRendering\" action=\"{!c.empty}\"/>");
        Collection<EventHandlerDef> handlerDefs = def.getHandlerDefs();
        assertEquals("Wrong number of handlers", 2, handlerDefs.size());
        for (EventHandlerDef handlerDef : handlerDefs) {
            assertTrue("Wrong handlers added to definiton", handlerDef.toString().equals("markup://aura:doneWaiting")
                    || handlerDef.toString().equals("markup://aura:doneRendering"));
        }
    }

    @Test
    public void testGetStyleDefWithoutStyle() throws QuickFixException {
        T def = define(baseTag, "", "");
        StyleDef styleDef = def.getStyleDef();
        assertNull("StyleDescriptor for component without style should be null", styleDef);
    }

    @Test
    public void testGetStyleDef() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> descriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", ""));
        DefDescriptor<StyleDef> styleDesc = definitionService.getDefDescriptor(descriptor, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, ".THIS {}");
        BaseComponentDef def = definitionService.getDefinition(descriptor);
        StyleDef styleDef = def.getStyleDef();
        
        assertNotNull("StyleDescriptor not found on component", styleDef);
        assertEquals("Wrong StyleDescriptor found on component", styleDesc, styleDef.getDescriptor());
    }

    /**
     * InvalidDefinitionException if render is empty.
     */
    @Test
    public void testRenderEmpty() throws QuickFixException {
        try {
            define(baseTag, "render=''", "");
            fail("Should not be able to load component with empty render value");
        } catch (Exception e) {
            checkExceptionRegex(e, InvalidDefinitionException.class,
                    "No enum const(ant)? (class )?org\\.auraframework\\.def\\.BaseComponentDef.RenderType\\.");
        }
    }

    /**
     * InvalidDefinitionException if render is invalid.
     */
    @Test
    public void testRenderInvalid() throws QuickFixException {
        try {
            define(baseTag, "render='typo'", "");
            fail("Should not be able to load component with invalid render value");
        } catch (Exception e) {
            checkExceptionRegex(e, InvalidDefinitionException.class,
                    "No enum const(ant)? (class )?org\\.auraframework\\.def\\.BaseComponentDef.RenderType\\.TYPO");
        }
    }

    /**
     * Verify the render attribute specified on a component tag. By default the rendering logic is turned on. Test
     * method for {@link BaseComponentDef#getRender()}.
     */
    @Test
    public void testGetRenderDefault() throws QuickFixException {
        RenderType defaultRender = define(baseTag, "", "").getRender();
        assertEquals("By default, rendering detection logic should be on.", RenderType.AUTO, defaultRender);
    }

    /**
     * Verify the render attribute specified as server. Test method for {@link BaseComponentDef#getRender()}.
     */
    @Test
    public void testGetRenderServer() throws QuickFixException {
        T serverRenderedComponentDef = define(baseTag, " render='server'", "");
        assertEquals("Rendering detection logic was expected to be forced to be serverside.", RenderType.SERVER,
                serverRenderedComponentDef.getRender());
        assertTrue("A component which wishes to be rendered server side cannot be locally renderable?",
                serverRenderedComponentDef.isLocallyRenderable());
    }

    /**
     * Verify the render attribute specified as client. Test method for {@link BaseComponentDef#getRender()}.
     */
    @Test
    public void testGetRenderClient() throws QuickFixException {
        T clientRenderedComponentDef = define(baseTag, " render='client'", "");
        assertEquals("Rendering detection logic was expected to be forced to be clientside.", RenderType.CLIENT,
                clientRenderedComponentDef.getRender());
        assertFalse("A component which wishes to be rendered client side can be locally renderable?",
                clientRenderedComponentDef.isLocallyRenderable());

    }

    /**
     * No dependencies by default. Test method for {@link org.auraframework.def.BaseComponentDef#getDependencies()}.
     */
    @Test
    public void testGetDependenciesWithoutDependencies() throws QuickFixException {
        T baseComponentDef = define(baseTag, "", "");
        assertTrue("Dependencies should not be present if not specified on component", baseComponentDef
                .getDependencies().isEmpty());
    }

    /**
     * Dependency returned for default namespace. Test method for
     * {@link org.auraframework.def.BaseComponentDef#getDependencies()}.
     */
    @Test
    public void testGetDependenciesDefaultNamespace() throws QuickFixException {
        T baseComponentDef = define(baseTag, "", "<aura:dependency resource=\"*://aura:*\" type=\"EVENT\"/>");
        assertEquals("Dependency not found", "[markup://aura:*[EVENT]]", baseComponentDef.getDependencies().toString());
    }

    /**
     * Dependency returned for non-default namespace. Test method for
     * {@link org.auraframework.def.BaseComponentDef#getDependencies()}.
     */
    @Test
    public void testGetDependenciesNonDefaultNamespace() throws QuickFixException {
        T baseComponentDef = define(baseTag, "", "<aura:dependency resource=\"*://auratest:*\" type=\"EVENT\"/>");
        assertEquals("Dependency not found", "[markup://auratest:*[EVENT]]", baseComponentDef.getDependencies().toString());
    }

    /**
     * InvalidDefinitionException for nonexistent dependency.
     */
    @Test
    @Ignore("this is no longer thrown")
    public void testDependencyNonExistent() {
        try {
            define(baseTag, "", "<aura:dependency resource=\"*://idontexist:*\"/>");
            fail("Should not be able to load non-existant resource as dependency");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Invalid dependency ://idontexist:*[COMPONENT]");
        }
    }

    /**
     * InvalidDefinitionException for invalid dependency.
     */
    @Test
    public void testDependencyInvalid() {
        // Invalid descriptor pattern
        try {
            define(baseTag, "", "<aura:dependency resource=\"*://auratest.*\"/>");
            fail("Should not be able to load resource, bad DefDescriptor format");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Illegal namespace in *://auratest.*");
        }

        // Another invalid descriptor pattern
        try {
            define(baseTag, "", "<aura:dependency resource=\"*:auratest:*\"/>");
            fail("Should not be able to load resource, bad DefDescriptor format");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Illegal name in *:auratest:*");
        }
    }

    @Test
    public void testLabelUnspecificed() {
        // Invalid descriptor pattern
        try {
            define(baseTag, "", "{!$Label}");
            fail("Should not be able to load resource, bad Label referece");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidExpressionException.class, "Expression didn't have enough terms: $Label");
        }
    }

    /**
     * isLocallyRenderable is false when component has a Javascript Renderer. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithClientsideRenderer() throws QuickFixException {
        DefDescriptor<?> rendererDesc = addSourceAutoCleanup(RendererDef.class, "({render:function(){}})");
        String rendererAttributeStr = String.format("renderer='%s'", rendererDesc.getQualifiedName());
        T baseComponentDef = define(baseTag, rendererAttributeStr, "");

        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has client renderers, the component should not be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is true when component includes an interface as facet, the interface has a Javascript
     * provider. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithOnlyServersideRenderers() throws QuickFixException {
        T baseComponentDef = define(baseTag, "", "Body: Has just text. Text component has a java renderer.");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertTrue("When a component has only server renderers, the component should be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when component includes an interface as facet and the interface has a Javascript
     * provider. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithClientsideFacet() throws QuickFixException {
        T baseComponentDef = define(baseTag, "", "Body: Includes an interface which has a JS provider. "
                + " <test:test_JSProvider_Interface/>");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse(
                "When a component has dependency on a clienside provider, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when component has a Javascript Provider. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithClientsideProvider() throws QuickFixException {
        T baseComponentDef = define(baseTag, "provider='js://test.test_JSProvider_Interface'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has client renderers, the component should not be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when component includes a Javascript controller. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithClientsideController() throws QuickFixException {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor(cmpDesc,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);
        addSourceAutoCleanup(controllerDesc, "({ function1: function(cmp) {} })");

        T baseComponentDef = define(baseTag, "", String.format("<%s/>", cmpDesc.getDescriptorName()));

        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has dependency on a controller, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when a component includes a Style. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithStyle() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> descriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", ""));
        DefDescriptor<StyleDef> styleDesc = definitionService.getDefDescriptor(descriptor, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, ".THIS {}");
        BaseComponentDef baseComponentDef = definitionService.getDefinition(descriptor);
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has a style, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when a facet of a component has a component marked for LAZY loading, the component
     * should always be rendered client side. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithLazyLoadedFacet() throws QuickFixException {
        DefDescriptor<ComponentDef> facetDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component> <aura:text aura:load='LAZY'/></aura:component>");
        T baseComponentDef = define(baseTag, "", String.format("<%s/>", facetDesc.getDescriptorName()));
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse(
                "When a component has a inner component set to lazy load, the parent should be rendered clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when lazy loading specification in parent is reflected in child and components which
     * use the child. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    @Test
    public void testIsLocallyRenderableWithInheritedLazyLoadedFacet() throws QuickFixException {
        DefDescriptor<ComponentDef> parentDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'> <aura:text aura:load='LAZY'/></aura:component>");
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s'></aura:component>", parentDesc.getDescriptorName()));
        assertFalse("Lazy loading information is not chained through inheritance.",
                definitionService.getDefinition(childDesc)
                        .isLocallyRenderable());
        T baseComponentDef = define(baseTag, "", String.format("<%s/>", childDesc.getDescriptorName()));
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("Lazy loading information is not chained through inheritance.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * hasLocalDependencies is true if component has serverside model. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithServersideModel() throws Exception {
        T baseComponentDef = define(baseTag,
                "model='java://org.auraframework.components.test.java.model.TestJavaModel'", "");
        assertTrue("When a component has a model, the component has server dependencies .",
                baseComponentDef.hasLocalDependencies());
        assertEquals(true, this.serializeAndReadAttributeFromDef(baseComponentDef, Json.ApplicationKey.HASSERVERDEPENDENCIES.toString()));
    }

    /**
     * hasLocalDependencies is true if component has serverside renderer. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithServersideRenderer() throws QuickFixException {
        T baseComponentDef = define(baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'", "");
        assertTrue("When a component has a server renderer only, the component has server dependencies.",
                baseComponentDef.hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false if component has clientside renderer. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithClientsideRenderer() throws Exception {
        DefDescriptor<?> rendererDesc = addSourceAutoCleanup(RendererDef.class, "({render:function(){}})");
        String rendererAttributeStr = String.format("renderer='%s'", rendererDesc.getQualifiedName());
        T baseComponentDef = define(baseTag, rendererAttributeStr, "");

        assertFalse("When a component has a client renderer, the component does not have server dependencies.",
                baseComponentDef.hasLocalDependencies());
        assertEquals(null, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));
    }

    /**
     * hasLocalDependencies is false if component has clientside and serverside renderers. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithClientsideAndServersideRenderers() throws Exception {
        DefDescriptor<?> rendererDesc = addSourceAutoCleanup(RendererDef.class, "({render:function(){}})");
        String rendererAttributeStr = String.format(
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer,%s'",
                rendererDesc.getQualifiedName());
        T baseComponentDef = define(baseTag, rendererAttributeStr, "");

        assertFalse("When a component has a client renderer, the component does not have server dependencies.",
                baseComponentDef.hasLocalDependencies());
        assertEquals(null, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));
    }

    /**
     * hasLocalDependencies is false if component has clientside provider. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithClientsideProvider() throws QuickFixException {
        T baseComponentDef = define(baseTag, "abstract='true'", "");
        DefDescriptor<ProviderDef> providerDesc = definitionService.getDefDescriptor(
                baseComponentDef.getDescriptor(), DefDescriptor.JAVASCRIPT_PREFIX, ProviderDef.class);
        addSourceAutoCleanup(providerDesc,
                "({provide:function Provider(component){return 'aura:text';}})");
        assertFalse("Abstract Component with client provider should not have any server dependencies.",
                definitionService.getDefinition(baseComponentDef.getDescriptor()).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is true if component only has serverside provider. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithServersideProvider() throws QuickFixException {
        T baseComponentDef = define(baseTag,
                "abstract='true' provider='java://org.auraframework.impl.java.provider.TestProviderAbstractBasic'", "");
        assertTrue("Abstract Component with serverside providers have server dependecies.", definitionService
                .getDefinition(baseComponentDef.getDescriptor()).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is true if super has local model dependency. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesInheritedServersideModel() throws QuickFixException {
        String parentContent = String.format(baseTag,
                "extensible='true' model='java://org.auraframework.components.test.java.model.TestJavaModel'", "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertTrue(
                "When a component's parent has a serverside model dependency, the component should be marked as server dependent.",
                definitionService.getDefinition(child).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is true if super has local renderer dependency. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesInheritedServersideRenderer() throws QuickFixException {
        String parentContent = String
                .format(baseTag,
                        "extensible='true' renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'",
                        "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertTrue(
                "When a component's parent has a serverside renderer dependency, the component should be marked as server dependent.",
                definitionService.getDefinition(child).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false if super has local and remote renderer dependency. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesInheritedClientsideAndServersideRenderers() throws QuickFixException {
        String parentContent = String
                .format(baseTag,
                        "extensible='true' renderer='js://aura.html,java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'",
                        "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertFalse(
                "When a component's parent has a clientside renderer dependency, the component should not be marked as server dependent.",
                definitionService.getDefinition(child).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false if super has local provider dependency. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesInheritedServersideProvider() throws QuickFixException {
        String parentContent = String.format(baseTag,
                "extensible='true' provider='java://org.auraframework.impl.java.provider.TestProviderAbstractBasic'",
                "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertFalse(
                "When a component's parent has serverside provider dependency, the component should not be marked as server dependent.",
                definitionService.getDefinition(child).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false even if facet has local dependencies. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    @Test
    public void testHasLocalDependenciesWithFacetWithLocalDependencies() throws QuickFixException {
        T baseComponentDef = define(
                baseTag,
                "",
                "Body: Includes an interface which has a Java provider. "
                        + "<aura:attribute name='facet' type='Aura.Component'><test:test_Provider_AbstractBasic/></aura:attribute>");
        assertFalse(
                "When a component's facet has serverside dependency, should the component also be marked as server dependent?",
                baseComponentDef.hasLocalDependencies());
    }

    @Test
    public void testExtendsSelf() {
        DefDescriptor<T> extendsSelf = addSourceAutoCleanup(getDefClass(), "");
        getAuraTestingUtil().updateSource(extendsSelf, String.format(baseTag,
                    "extensible='true' extends='" + extendsSelf.getDescriptorName() + "'", ""));
        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            definitionService.getDefinition(extendsSelf);
            fail(defType + " should not be able to extend itself.");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, extendsSelf.getQualifiedName()
                    + " cannot extend itself", extendsSelf.getQualifiedName());
        }
    }

    @Test
    public void testExtendsNonExtensible() {
        DefDescriptor<T> nonExtensible = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", ""));
        DefDescriptor<T> extendsCmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + nonExtensible.getDescriptorName() + "'", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            definitionService.getDefinition(extendsCmp);
            fail(defType + " should not be able to extend a non-extensible component");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, extendsCmp.getQualifiedName()
                    + " cannot extend non-extensible component " + nonExtensible.getQualifiedName(),
                    extendsCmp.getQualifiedName());
        }
    }

    /**
     * Verify extending a non-existent component throws correct Exception
     */
    @Test
    public void testExtendsNonExistent() {
        DefDescriptor<T> cmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='aura:iDontExist'", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            definitionService.getDefinition(cmp);
            fail(defType + " should throw Exception when extending non-existent component");
        } catch (QuickFixException e) {
            checkExceptionFull(e, DefinitionNotFoundException.class,
                    "No " + defType + " named markup://aura:iDontExist found : [" + cmp.getQualifiedName() + "]",
                    cmp.getQualifiedName());
        }
    }

    /**
     * Verify extending a non-existent component throws correct Exception
     */
    @Test
    public void testExtendsEmpty() {
        DefDescriptor<T> cmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends=''", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            definitionService.getDefinition(cmp);
            fail(defType + " should throw Exception when extends is empty");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * Test method for {@link BaseComponentDef#isInstanceOf(DefDescriptor)}.
     */
    @Test
    public void testIsInstanceOfAbstract() throws QuickFixException {
        // Test cases for Abstract Component extensions
        DefDescriptor<T> grandParent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' abstract='true'", ""));
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + grandParent.getDescriptorName() + "'", ""));
        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + parent.getDescriptorName() + "'", ""));

        assertTrue("Failed to assert inheritance across one level.",
                definitionService.getDefinition(parent).isInstanceOf(grandParent));
        assertTrue("Failed to assert inheritance across one level.",
                definitionService.getDefinition(child).isInstanceOf(parent));
        assertTrue("Failed to assert inheritance across multiple levels.",
                definitionService.getDefinition(child).isInstanceOf(grandParent));
    }

    /**
     * Test method for {@link BaseComponentDef#isInstanceOf(DefDescriptor)}.
     */
    @Test
    public void testIsInstanceOfInterface() throws QuickFixException {
        // Test cases for Interface inheritance and implementations
        String interfaceTag = "<aura:interface %s> </aura:interface>";
        DefDescriptor<InterfaceDef> grandParentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, ""));
        DefDescriptor<InterfaceDef> parentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, "extends='" + grandParentInterface.getDescriptorName() + "'"));
        DefDescriptor<T> interfaceImpl = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='" + parentInterface.getDescriptorName() + "'", ""));

        assertTrue("Failed to assert interface implementation one level.",
                definitionService.getDefinition(interfaceImpl).isInstanceOf(parentInterface));
        assertTrue("Failed to assert inherface extension across one level.",
                definitionService.getDefinition(parentInterface).isInstanceOf(grandParentInterface));
        assertTrue("Failed to assert inheritance implementation across multiple levels.",
                definitionService.getDefinition(interfaceImpl)
                        .isInstanceOf(grandParentInterface));

    }

    /**
     * When a facet is marked for Lazy/Exclusive loading, parentDef has a LazyComponentDefRef
     */
    @Test
    public void testFacetLazyLoaded() throws QuickFixException {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='LAZY'/>"));
        T def = definitionService.getDefinition(desc);
        AttributeDefRef body = getBodyAttributeFromDef(def);
        assertTrue(body.getValue() instanceof List);
        List<?> bodyCmps = (List<?>) body.getValue();
        assertEquals(1, bodyCmps.size());
        assertTrue(bodyCmps.get(0) instanceof DefinitionReference);
        assertEquals("markup://aura:text", ((DefDescriptor<?>) ((DefinitionReference) bodyCmps.get(0))
                .getAttributeDefRef("refDescriptor").getValue()).getQualifiedName());
    }

    /**
     * When a facet is marked for Lazy/Exclusive loading, parentDef has a LazyComponentDefRef.
     */
    @Test
    public void testFacetExclusivelyLoaded() throws QuickFixException {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='Exclusive'/>"));
        T def = definitionService.getDefinition(desc);
        AttributeDefRef body = getBodyAttributeFromDef(def);
        assertTrue(body.getValue() instanceof List);
        List<?> bodyCmps = (List<?>) body.getValue();
        assertEquals(1, bodyCmps.size());
        assertTrue(bodyCmps.get(0) instanceof DefinitionReference);
        assertEquals(true, ((DefinitionReference    ) bodyCmps.get(0)).getAttributeDefRef("exclusive").getValue());
    }

    /**
     * Should not be able to lazy load a non-existing component.
     */
    @Test
    public void testFacetLazyLoadNonExistentComponent() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:fooBar999 aura:load='LAZY'/>"));
        try {
            definitionService.getDefinition(desc);
            fail("should not be able to use a non-existing component by marking it to be lazy loaded");
        } catch (DefinitionNotFoundException e) {
            assertTrue(e.getMessage().contains("No COMPONENT named markup://aura:fooBar999"));
        }
    }

    /**
     * Should not be able to lazy load a component with an invalid attribute.
     */
    @Test
    public void testFacetLazyLoadWithNonExistentAttribute() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='LAZY' fooBar999='hoze'/>"));
        try {
            definitionService.getDefinition(desc);
            fail("should not be able to use a non-existing attribute by marking it to be lazy loaded");
        } catch (InvalidReferenceException e) {
            assertTrue(e.getMessage().contains("Attribute fooBar999 does not exist"));
        }
    }

    /**
     * Should not be able to lazy load a component with an invalid attribute.
     */
    @Test
    public void testFacetLazyLoadWithNonBasicAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmpAttr = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='cmps' type='Aura.Component'/> </aura:component>");
        DefDescriptor<T> desc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "",
                        "<" + cmpAttr.getDescriptorName() + " aura:load='LAZY'>" + "<aura:set attribute='cmps'>"
                                + "<aura:text/>" + "</aura:set>" + "</" + cmpAttr.getDescriptorName() + ">"));
        try {
            definitionService.getDefinition(desc);
            fail("should not be able to use a non-basic attribute type in lazy loaded component");
        } catch (QuickFixException e) {
            checkExceptionFull(
                    e,
                    InvalidReferenceException.class,
                    "Lazy Component References can only have attributes of simple types passed in (cmps is not simple)",
                    desc.getQualifiedName());
        }
    }

    @Test
    public void testGetLocation() throws QuickFixException {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                getAuraTestingUtil().getNonce("test:cmp"), null, null, null,
                vendor.makeLocation("filename1", 5, 5, 0), null, null,
                null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        assertEquals(
                vendor.makeLocation("filename1", 5, 5, 0),
                bcd.getLocation());
    }

    /**
     * InvalidDefinitionException if component specifies wider support level than super.
     */
    @Test
    public void testSupportLevelWiderThanSuper() throws Exception {
        // Grand parent with BETA support
        DefDescriptor<T> grandParentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' support='BETA'", ""));
        // Parent with GA support
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + grandParentDesc.getDescriptorName()
                        + "' support='GA'", ""));
        try {
            definitionService.getDefinition(parentDesc);
            fail("A child cannot widen the support level of its parent.");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            parentDesc.getQualifiedName(), grandParentDesc.getQualifiedName()),
                    parentDesc.getQualifiedName());
        }
    }

    /**
     * InvalidDefinitionException if component has facet that specifies wider support level than super.
     */
    @Test
    public void testSupportLevelFacetWiderThanSuper() throws Exception {
        // Including a component, that violates support level restriction, as facet
        DefDescriptor<ComponentDef> parentCmp = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true' support='BETA'></aura:component>", "validateReferences_parentCmp");
        DefDescriptor<ComponentDef> childCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component extends='"
                + parentCmp.getDescriptorName() + "' support='GA'></aura:component>", "validateReferences_childCmp");
        DefDescriptor<T> testDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<" + childCmp.getDescriptorName() + "/>"), "validateReferences_testCmp");
        try {
            definitionService.getDefinition(testDesc);
            fail("Test component's facet has a component which tries to widen the support level of its parent.");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            childCmp.getQualifiedName(), parentCmp.getQualifiedName()),
                    childCmp.getQualifiedName());
        }
    }

    /**
     * Verify a component cannot have an attribute and event with the same name.
     */
    @Test
    public void testAttributeAndeEventNameConflict() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:registerEvent name='dupeAttrEvent' type='test:parentEvent'/>"
                        + "<aura:attribute name='dupeAttrEvent' type='String'/>"));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            definitionService.getDefinition(dd);
            fail(defType + " should not be able to have attribute and event with same name");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Cannot define an attribute and register an event with the same name: dupeAttrEvent",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify an abstract component must also be extensible.
     */
    @Test
    public void testAbstractNotExtensible() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "abstract='true' extensible='false'", ""));
        try {
            definitionService.getDefinition(dd);
            fail(DefType.getDefType(getDefClass()) + " must be extensible if abstract");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Abstract component " + dd.getQualifiedName() + " must be extensible.",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify component cannot implement root component (aura:rootComponent).
     */
    @Test
    public void testImplementsRootComponent() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='aura:rootComponent'", ""));
        try {
            definitionService.getDefinition(dd);
            fail(DefType.getDefType(getDefClass())
                    + " should not be able to implement rootComponent if not in aura namespace");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Component " + dd.getQualifiedName()
                            + " cannot implement the rootComponent interface because it is not in the aura namespace",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify cannot reference an inner component that does not exist.
     */
    @Test
    public void testInnerComponentNonExistent() {
        try {
            define(baseTag, "", "<aura:iDontExist/>");
            fail(DefType.getDefType(getDefClass())
                    + " should not be able to reference inner component that does not exist");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No COMPONENT named markup://aura:iDontExist found :");
        }
    }

    /**
     * Verify component cannot implement a non-existent component
     */
    @Test
    public void testImplementsEmpty() {
        try {
            define(baseTag, "implements=''", "");
            fail(DefType.getDefType(getDefClass()) + " should throw Exception when implements is empty");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * Verify component cannot implement a non-existent component
     */
    @Test
    public void testImplementsNonExistent() {
        try {
            define(baseTag, "implements='aura:iDontExist'", "");
            fail(DefType.getDefType(getDefClass())
                    + " should throw Exception when implementing non-existent interface");
        } catch (QuickFixException e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No INTERFACE named markup://aura:iDontExist found :");
        }
    }

    /**
     * Test method for {@link BaseComponentDef#isAbstract()}.
     */
    @Test
    public void testIsAbstractDefault() throws QuickFixException {
        assertFalse(define(baseTag, "", "").isAbstract());
    }

    /**
     * Test method for {@link BaseComponentDef#isAbstract()}.
     */
    @Test
    public void testIsAbstract() throws Exception {
        checkBoolean(String.format(baseTag, "abstract='%s'", ""));
    }

    @Test
    public void testBuildWithNullDescriptor() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(), null, null, null, null,
                null, null, null, null, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        try {
            bcd.validateDefinition();
            fail("Should have thrown AuraRuntimeException for null descriptor");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "No descriptor");
        }
    }

    /**
     * Test method for {@link Definition#validateDefinition()}.
     */
    @Test
    public void testValidateDefinitionNonExtensibleAbstract() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                getAuraTestingUtil().getNonce("test:cmp"), null, null, null, null, null,
                null, null, null, null, null, null, true, false, AuraContext.Access.INTERNAL);
        try {
            bcd.validateDefinition();
            fail("Should have thrown AuraException because an abstract component isn't extensible.");
        } catch (InvalidDefinitionException e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    String.format("Abstract component %s must be extensible.", bcd.getDescriptor().getQualifiedName()));
        }
    }

    /**
     * Test method for {@link Definition#validateReferences()}.
     */
    @Test
    public void testValidateReferencesWithNonExistentParent() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                getAuraTestingUtil().getNonce("test:cmp"), null, null, null, null, null,
                null, definitionService.getDefDescriptor("test:nonExistentComponentParent", getDefClass()), null, null,
                null, null, false, false, AuraContext.Access.INTERNAL);
        try {
            bcd.validateReferences();
            fail("Should have thrown AuraException because the parent doesn't exist.");
        } catch (DefinitionNotFoundException e) {
            checkExceptionFull(
                    e,
                    DefinitionNotFoundException.class,
                    String.format("No %s named markup://test:nonExistentComponentParent found",
                            DefType.getDefType(getDefClass())));
        }
    }

    /**
     * Test method for {@link Definition#validateReferences()}.
     */
    @Test
    public void testValidateReferencesWithNonExtensibleParent() throws Exception {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                getAuraTestingUtil().getNonce("test:cmp"), null, null, null, null, null,
                null, parentDesc, null, null, null, null, false, false, AuraContext.Access.INTERNAL);
        try {
            bcd.validateReferences();
            fail("Should have thrown AuraException because the parent isn't extensible.");
        } catch (InvalidDefinitionException e) {
            checkExceptionFull(
                    e,
                    InvalidDefinitionException.class,
                    String.format("%s cannot extend non-extensible component %s", bcd.getDescriptor()
                            .getQualifiedName(), parentDesc.getQualifiedName()));
        }
    }

    /**
     * Verify getHelper returns null when no HelperDef
     */
    @Test
    public void testGetHelperDefDefault() throws Exception {
        HelperDef helperDef = define(baseTag, "", "").getHelperDef();
        assertNull(helperDef);
    }

    /**
     * Verify getHelper returns HelperDef when component has auto-wired helper
     */
    @Test
    public void testGetHelperDefWithAutoWiredHelper() throws Exception {
        DefDescriptor<T> cmpDescriptor = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<HelperDef> expectedHelperDescriptor = DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor,
                HelperDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(expectedHelperDescriptor, "({help:function(){}})");
        HelperDef helperDef = definitionService.getDefinition(cmpDescriptor).getHelperDef();

        assertNotNull(helperDef);
        DefDescriptor<HelperDef> actualHelperDescriptor = helperDef.getDescriptor();
        assertEquals(expectedHelperDescriptor, actualHelperDescriptor);
    }

    /**
     * Verify getHelper returns HelperDef when component has helper from other bundle
     */
    @Test
    public void testGetHelperDefWithExplicitHelper() throws Exception {
        String helperJS = "({})";
        DefDescriptor<HelperDef> expectedHelperDescriptor = addSourceAutoCleanup(HelperDef.class, helperJS);
        String helperAttribute = String.format("helper='%s'", expectedHelperDescriptor.getQualifiedName());
        HelperDef helperDef = define(baseTag, helperAttribute, "").getHelperDef();

        assertNotNull(helperDef);
        DefDescriptor<HelperDef> actualHelperDescriptor = helperDef.getDescriptor();
        assertEquals(expectedHelperDescriptor, actualHelperDescriptor);
    }

    /**
     * Verify getHelper returns explicit HelperDef when component has auto-wired helper and helper from other bundle
     */
    @Test
    public void testGetHelperDefWithExplicitAndAutoWiredHelper() throws Exception {
        String helperJS = "({})";
        DefDescriptor<HelperDef> explicitHelperDescriptor = addSourceAutoCleanup(HelperDef.class, helperJS);
        String helperAttribute = String.format("helper='%s'", explicitHelperDescriptor.getQualifiedName());
        DefDescriptor<T> cmpDescriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, helperAttribute, ""));
        DefDescriptor<HelperDef> autoWiredHelperDescriptor = DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor,
                HelperDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        addSourceAutoCleanup(autoWiredHelperDescriptor, "({help:function(){}})");

        HelperDef helperDef = definitionService.getDefinition(cmpDescriptor).getHelperDef();
        assertNotNull(helperDef);
        assertEquals(explicitHelperDescriptor, helperDef.getDescriptor());
    }

    private AttributeDefRef getBodyAttributeFromDef(T def) {
        assertNotNull(def);
        List<AttributeDefRef> facet = def.getFacets();
        assertEquals(1, facet.size());
        AttributeDefRef body = facet.get(0);
        assertEquals("body", body.getName());
        return body;
    }

    @SuppressWarnings("unchecked")
    private Object serializeAndReadAttributeFromDef(T def, String property) throws Exception {
        JsonStreamReader jsonStreamReader = new JsonStreamReader(JsonEncoder.serialize(def));
        jsonStreamReader.next();
        Object temp = jsonStreamReader.getValue();
        assertTrue(temp instanceof Map);
        Map<Object, Object> cmpConfig = (HashMap<Object, Object>) temp;
        return cmpConfig.containsKey(property) ? cmpConfig.get(property) : null;
    }

    @Test
    public void testClientLibraryDefValidationNoName() throws Exception {
        DefDescriptor<T> missingRequiredAttr = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:clientLibrary type='JS' />"));
        try {
            definitionService.getDefinition(missingRequiredAttr);
            fail("Failed to validate client library type which didn't specify a name attribute.");
        } catch (InvalidDefinitionException e) {
            assertEquals("Must have a name", e.getMessage());
        }
    }

    // FIXME: we probably should have a test for this.
    public void _testClientLibraryDefValidationBadName() throws Exception {
        DefDescriptor<T> invalidResource = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:clientLibrary name='doesntExist' type='js'/>"));
        try {
            definitionService.getDefinition(invalidResource);
            fail("Failed to validate client library type which specified non existing component resource.");
        } catch (QuickFixException e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "No resource named js://foo.bar found");
        }
    }
}
