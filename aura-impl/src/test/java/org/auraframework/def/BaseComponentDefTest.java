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
package org.auraframework.def;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.root.component.LazyComponentDefRef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonStreamReader;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public abstract class BaseComponentDefTest<T extends BaseComponentDef> extends RootDefinitionTest<T> {

    protected final String interfaceTag = "<aura:interface provider='%s'>%s</aura:interface>";

    public BaseComponentDefTest(String name, Class<T> defClass, String tag) {
        super(name, defClass, tag);
    }

    public void testGetDescriptor() throws Exception {
        DefDescriptor<T> desc = DefDescriptorImpl.getInstance(auraTestingUtil.getNonce("test:cmp"), getDefClass());
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc.getDescriptorName(), null, null, null, null, null, null, null, null, null, null, null, false,
                false);
        assertEquals(desc, bcd.getDescriptor());
    }

    public void testHashCode() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        attributeDefs.put(DefDescriptorImpl.getInstance(vendor.getAttributeName(), AttributeDef.class),
                vendor.makeAttributeDef());

        Map<String, RegisterEventDef> eventDefs = new HashMap<String, RegisterEventDef>();
        eventDefs.put("fakey", vendor.makeRegisterEventDef());

        List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
        children.add(vendor.makeComponentDefRef());

        Location location = vendor.makeLocation();

        DefDescriptor<ModelDef> modelDesc = vendor.getModelDescriptor();

        @SuppressWarnings("unchecked")
        DefDescriptor<T> extendsDesc = (DefDescriptor<T>) vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:parent", null, null, null, null, null, null, null, null, null, null, null, false, true)
                .getDescriptor();

        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.getInterfaceDefDescriptor());

        List<DefDescriptor<RendererDef>> renderers = new ArrayList<DefDescriptor<RendererDef>>();
        renderers.add(vendor.getRendererDescriptor());

        List<EventHandlerDef> eventHandlers = new ArrayList<EventHandlerDef>();
        eventHandlers.add(vendor.makeEventHandlerDef());

        List<DefDescriptor<HelperDef>> helpers = new ArrayList<DefDescriptor<HelperDef>>();
        helpers.add(vendor.getHelperDescriptor());

        BaseComponentDef bcdAll = vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                eventDefs, children, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                renderers, helpers, eventHandlers, false, false);
        int baseCode = bcdAll.hashCode();

        // ignore children and eventHandlers
        assertEquals(baseCode, vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                renderers, helpers, null, false, false).hashCode());

        assertFalse("descriptor not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test2", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, renderers, helpers, null, false, false).hashCode());

        assertFalse("attributes not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", null,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, renderers, helpers, null, false, false).hashCode());

        assertFalse("events not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        null, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                        renderers, helpers, null, false, false).hashCode());

        assertFalse("location not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, null, vendor.getControllerDescriptor(), modelDesc, extendsDesc, interfaces,
                        renderers, helpers, null, false, false).hashCode());

        assertFalse("controller not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, null, modelDesc, extendsDesc, interfaces, renderers, helpers, null,
                        false, false).hashCode());

        assertFalse("model not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), null, extendsDesc, interfaces,
                        renderers, helpers, null, false, false).hashCode());

        assertFalse("extends not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, null, interfaces,
                        renderers, helpers, null, false, false).hashCode());

        assertFalse("interfaces not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc, null,
                        renderers, helpers, null, false, false).hashCode());

        assertFalse("renderers not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, null, helpers, null, false, false).hashCode());

        assertFalse("helpers not included in hashCode",
                baseCode == vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", attributeDefs,
                        eventDefs, null, location, vendor.getControllerDescriptor(), modelDesc, extendsDesc,
                        interfaces, null, null, null, false, false).hashCode());
    }

    public void testEquals() throws Exception {
        String desc = auraTestingUtil.getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false);
        assertTrue("The BaseComponentDefs should have been equal", bcd1.equals(bcd2));
    }

    public void testEqualsWithDifferentObjects() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null, null, null, null, null, null, null, null,
                null, false, false);
        assertFalse("A BaseComponentDef shouldn't equal a ComponentDefRef",
                bcd.equals(vendor.makeComponentDefRef()));
    }

    public void testEqualsWithDifferentController() throws Exception {
        DefDescriptor<ControllerDef> controllerDesc = DefDescriptorImpl.getInstance("java://foo.bar2",
                ControllerDef.class);
        String desc = auraTestingUtil.getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, controllerDesc, null, null, null, null, null, null, false, false);
        assertFalse("A BaseComponentDef shouldn't be equal with different controllers", bcd1.equals(bcd2));
    }

    public void testEqualsWithDifferentParents() throws Exception {
        DefDescriptor<T> parentDesc = DefDescriptorImpl.getInstance("fake:componentParent2", getDefClass());
        String desc = auraTestingUtil.getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, parentDesc, null, null, null, null, false, false);
        assertFalse("A BaseComponentDef shouldn't be equal with different parents", bcd1.equals(bcd2));
    }

    public void testEqualsWithDifferentEvents() throws Exception {
        DefDescriptor<EventDef> eventDefDescriptor = DefDescriptorImpl.getInstance("fake:event2", EventDef.class);
        Map<String, RegisterEventDef> eventDefs = ImmutableMap.of("fakey2",
                (RegisterEventDef) vendor.makeRegisterEventDef(eventDefDescriptor, false, null));
        String desc = auraTestingUtil.getNonce("test:cmp");
        Location location = vendor.makeLocation("filename1", 5, 5, 0);
        BaseComponentDef bcd1 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, null, null, location, null, null, null, null, null, null, null, false, false);
        BaseComponentDef bcd2 = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                desc, null, eventDefs, null, location, null, null, null, null, null, null, null, false, false);
        assertFalse("A BaseComponentDef shouldn't be equal with different registered events", bcd1.equals(bcd2));
    }

    public void testSerialize() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDef> testAttributeDefs = ImmutableMap.of(
                DefDescriptorImpl.getInstance("testAttributeDescriptorName", AttributeDef.class),
                (AttributeDef) vendor.makeAttributeDefWithNulls(
                        "testAttributeDescriptorName",
                        null,
                        vendor.getTypeDefDescriptor(),
                        vendor.makeAttributeDefRef("testAttributeDescriptorName", "testValue",
                                vendor.makeLocation("filename1", 5, 5, 0)), false, null,
                                vendor.makeLocation("filename1", 5, 5, 0),null));
        List<ComponentDefRef> testChildren = ImmutableList.of(vendor.makeComponentDefRefWithNulls(
                vendor.makeComponentDefDescriptor("test:text"), null, vendor.makeLocation("filename2", 10, 10, 0)));
        serializeAndGoldFile(vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", testAttributeDefs, null, testChildren, vendor.makeLocation("filename1", 5, 5, 0), null,
                null, null, null, null, null, null, false, false));
    }

    public void testSerialize2() throws Exception {
        serializeAndGoldFile(vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "fake:component", null, null, null, vendor.makeLocation("filename2", 10, 10, 0), null,
                null, null, null, null, null, null, false, false));
    }

    public void testGetAttributeDefsSpidered() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<T> extendsDescriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:attribute name='parentAttribute' type='String'/>"));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", null, null, null, null, null, null, extendsDescriptor, interfaces, null, null, null,
                false, false);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributes = bcd.getAttributeDefs();
        assertEquals(3, attributes.size());
        assertTrue("mystring should be an attribute",
                attributes.containsKey(DefDescriptorImpl.getInstance("mystring", AttributeDef.class)));
        assertTrue("body should be an attribute",
                attributes.containsKey(DefDescriptorImpl.getInstance("body", AttributeDef.class)));
        assertTrue("parentAttribute should be an attribute",
                attributes.containsKey(DefDescriptorImpl.getInstance("parentAttribute", AttributeDef.class)));
    }

    public void testGetRegisteredEventDefs() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("test:testinterfaceparent"));
        DefDescriptor<T> extendsDescriptor = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:registerevent name='anotherParentEvent' type='test:parentEvent'/>"));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                "aura:test", null, null, null, null, null, null, extendsDescriptor, interfaces, null, null, null,
                false, false);
        Map<String, RegisterEventDef> registeredED = bcd.getRegisterEventDefs();
        assertEquals(2, registeredED.size());
        assertNotNull(registeredED.containsKey("parentEvent"));
        assertNotNull(registeredED.containsKey("anotherParentEvent"));
    }

    public void testAppendDependenciesWithNone() throws Exception {
        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(), "aura:test", null, null, null, null,
                null, null, null, null, null, null, null, false, false);
        bcd.appendDependencies(dependencies);

        assertFalse(dependencies.isEmpty());
        assertEquals(1, dependencies.size());
        assertTrue(dependencies.contains(vendor.getBaseComponentPrototype(getDefClass())));
    }

    public void testAppendDependenciesWithAllReferences() throws Exception {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true'", ""));
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<InterfaceDef> intfDesc = addSourceAutoCleanup(InterfaceDef.class, "<aura:interface/>");
        DefDescriptor<EventDef> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='component' support='GA'/>");
        DefDescriptor<ProviderDef> providerDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.ConcreteProvider", ProviderDef.class);

        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format("extends='%s' implements='%s' provider='%s'", parentDesc.getDescriptorName(),
                                intfDesc.getDescriptorName(), providerDesc), String.format(
                                        "<%s/><aura:registerevent name='evt' type='%s'/>", childDesc.getDescriptorName(),
                                        eventDesc.getDescriptorName())));

        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(modelDesc, "{obj:{}}");
        DefDescriptor<ControllerDef> controllerDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc,
                ControllerDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(controllerDesc, "{hi:function(){}}");

        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");

        DefDescriptor<HelperDef> helperDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, HelperDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(helperDesc, "({help:function(){}})");

        DefDescriptor<ThemeDef> themeDesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        ThemeDef.class);
        String className = cmpDesc.getNamespace()
                + StringUtils.capitalize(cmpDesc.getName());
        auraTestingUtil.addSourceAutoCleanup(themeDesc,
                String.format(".%s {font-style:italic;}", className));
        DefDescriptor<NamespaceDef> namespaceDesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s", DefDescriptor.MARKUP_PREFIX, themeDesc.getNamespace()), NamespaceDef.class);
        auraTestingUtil.addSourceAutoCleanup(namespaceDesc, "<aura:namespace/>");

        Set<DefDescriptor<?>> dependencies = new HashSet<DefDescriptor<?>>();
        cmpDesc.getDef().appendDependencies(dependencies);

        @SuppressWarnings("unchecked")
        Set<DefDescriptor<?>> expected = Sets.newHashSet(parentDesc, childDesc, intfDesc, providerDesc, modelDesc,
                controllerDesc, eventDesc, themeDesc, renderDesc, helperDesc);
        if (!dependencies.containsAll(expected)) {
            fail(String.format("missing dependencies - EXPECTED: %s, ACTUAL: %s", expected, dependencies));
        }
        if (!expected.containsAll(dependencies)) {
            fail(String.format("extra dependencies - EXPECTED: %s, ACTUAL: %s", expected, dependencies));
        }
    }

    /**
     * AuraRuntimeException if model is empty.
     */
    public void testModelEmpty() throws Exception {
        try {
            define(baseTag, "model=''", "");
            fail("Should not be able to load component with empty model");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if model is invalid.
     */
    public void testModelInvalid() throws Exception {
        try {
            define(baseTag, "model='oops'", "");
            fail("Should not be able to load component with invalid model");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No MODEL named java://oops found :");
        }
    }

    /**
     * Multiple models are not allowed.
     */
    public void testModelMultipleExplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "model='java://org.auraframework.impl.java.model.TestModel,js://test.jsModel'",
                        ""));
        try {
            compDesc.getDef();
            fail("Should not be able to load component with multiple models");
        } catch (AuraRuntimeException e) {
            checkExceptionFull(e, AuraRuntimeException.class,
                    "Invalid Descriptor Format: java://org.auraframework.impl.java.model.TestModel,js://test.jsModel");
        }
    }

    /**
     * W-1623475: Should throw QFE if multiple models are attempted.
     */
    public void _testModelExplicitAndImplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "model='java://org.auraframework.impl.java.model.TestModel'", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(modelDesc, "{obj:{}}");
        try {
            compDesc.getDef();
            fail("Should not be able to load component with explicit and implicit models");
        } catch (QuickFixException e) {
            checkExceptionFull(e, QuickFixException.class, "need to update this class and description when fixed");
        }
    }

    /**
     * AuraRuntimeException if controller is empty.
     */
    public void testControllerEmpty() throws Exception {
        try {
            define(baseTag, "controller=''", "");
            fail("Should not be able to load component with empty controller");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if controller is invalid.
     */
    public void testControllerInvalid() throws Exception {
        try {
            define(baseTag, "controller='oops'", "");
            fail("Should not be able to load component with invalid controller");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No CONTROLLER named java://oops found :");
        }
    }

    /**
     * AuraRuntimeException if renderer is empty.
     */
    public void testRendererEmpty() throws Exception {
        try {
            define(baseTag, "renderer=''", "");
            fail("Should not be able to load component with empty renderer");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if renderer is invalid.
     */
    public void testRendererInvalid() throws Exception {
        try {
            define(baseTag, "renderer='oops'", "");
            fail("Should not be able to load component with invalid renderer");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No RENDERER named js://oops found :");
        }
    }

    /**
     * AuraRuntimeException if provider is empty.
     */
    public void testProviderEmpty() throws Exception {
        try {
            define(baseTag, "provider=''", "");
            fail("Should not be able to load component with empty provider");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * DefinitionNotFoundException if provider is invalid.
     */
    public void testProviderInvalid() throws Exception {
        try {
            define(baseTag, "provider='oops'", "");
            fail("Should not be able to load component with invalid provider");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class, "No PROVIDER named java://oops found :");
        }
    }

    /**
     * getLocalModelDefDescriptor returns null if there are no models. Test method for
     * {@link BaseComponentDef#getLocalModelDefDescriptor()}.
     */
    public void testGetLocalModelDefDescriptorWithoutModels() throws Exception {
        DefDescriptor<ModelDef> dd = define(baseTag, "", "").getLocalModelDefDescriptor();
        assertNull(dd);
    }

    /**
     * getLocalModelDefDescriptor returns model if json model is implicitly defined. Test method for
     * {@link BaseComponentDef#getLocalModelDefDescriptor()}.
     */
    public void testGetLocalModelDefDescriptorWithImplicitJsonModel() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(modelDesc, "{obj:{}}");
        DefDescriptor<ModelDef> dd = compDesc.getDef().getLocalModelDefDescriptor();
        assertNotNull(dd);
        assertEquals(modelDesc.getQualifiedName(), dd.getQualifiedName());
    }

    /**
     * getLocalModelDefDescriptor returns model if json model is explicitly specified. Test method for
     * {@link BaseComponentDef#getLocalModelDefDescriptor()}.
     */
    public void testGetLocalModelDefDescriptorWithExplicitJsonModel() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel'", "").getDescriptor();
        DefDescriptor<ModelDef> dd = define(
                baseTag,
                "model='js://test.jsModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getLocalModelDefDescriptor();
        assertNotNull(dd);
        assertEquals("js://test.jsModel", dd.getQualifiedName());
    }

    /**
     * getLocalModelDefDescriptor returns model if java model is explicitly specified. Test method for
     * {@link BaseComponentDef#getLocalModelDefDescriptor()}.
     */
    public void testGetLocalModelDefDescriptorWithJavaModel() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        DefDescriptor<ModelDef> dd = define(
                baseTag,
                "model='java://org.auraframework.impl.java.model.TestModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getLocalModelDefDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.java.model.TestModel", dd.getQualifiedName());
    }

    /**
     * getModelDefDescriptors returns empty list if there are no models. Test method for
     * {@link BaseComponentDef#getModelDefDescriptors()}.
     */
    public void testGetModelDefDescriptorsWithoutModels() throws Exception {
        List<DefDescriptor<ModelDef>> dds = define(baseTag, "", "").getModelDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDefDescriptors()}.
     */
    public void testGetModelDefDescriptors() throws Exception {
        DefDescriptor<T> grandParentDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag,
                "extensible='true'", ""));
        DefDescriptor<ModelDef> grandParentModelDesc = DefDescriptorImpl.getAssociateDescriptor(grandParentDesc,
                ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(grandParentModelDesc, "{obj:{}}");

        DefDescriptor<T> parentDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format("extends='%s' extensible='true' model='js://test.jsModel'",
                                grandParentDesc.getDescriptorName()), ""));

        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(
                baseTag,
                String.format("extends='%s' model='java://org.auraframework.impl.java.model.TestModel'",
                        parentDesc.getDescriptorName()), ""));

        List<DefDescriptor<ModelDef>> dds = compDesc.getDef().getModelDefDescriptors();
        assertNotNull(dds);

        assertEquals(3, dds.size());
        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        Set<String> expected = ImmutableSet.of("java://org.auraframework.impl.java.model.TestModel",
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
    public void testGetModelDefWithoutModels() throws Exception {
        ModelDef d = define(baseTag, "", "").getModelDef();
        assertNull(d);
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    public void testGetModelDefWithJavaModel() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        ModelDef d = define(
                baseTag,
                "model='java://org.auraframework.impl.java.model.TestModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getModelDef();
        assertNotNull(d);
        assertEquals("TestModel", d.getName());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    public void testGetModelDefWithJsonModel() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        ModelDef d = define(
                baseTag,
                "model='js://test.jsModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getModelDef();
        assertNotNull(d);
        assertEquals("jsModel", d.getName());
    }

    /**
     * Test method for {@link BaseComponentDef#getModelDef()}.
     */
    public void testGetModelDefWithImplicitJsonModel() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(modelDesc, "{obj:{}}");

        ModelDef d = compDesc.getDef().getModelDef();
        assertNotNull(d);
        assertEquals(modelDesc, d.getDescriptor());
    }

    /**
     * Implicit model is ignored if explicit model is specified. Test method for {@link BaseComponentDef#getModelDef()}.
     */
    public void testGetModelDefWithImplicitAndExplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "model='java://org.auraframework.impl.java.model.TestModel'", ""));
        DefDescriptor<ModelDef> modelDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, ModelDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(modelDesc, "{obj:{}}");

        ModelDef d = compDesc.getDef().getModelDef();
        assertNotNull(d);
        assertEquals("java://org.auraframework.impl.java.model.TestModel", d.getDescriptor().getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDefDescriptors()}.
     */
    public void testGetControllerDefDescriptorsWithoutControllers() throws Exception {
        List<DefDescriptor<ControllerDef>> dds = define(baseTag, "", "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDefDescriptors()}.
     */
    public void testGetControllerDefDescriptors() throws Exception {
        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' controller='java://org.auraframework.impl.java.controller.TestController2'", "")
                .getDescriptor();
        List<DefDescriptor<ControllerDef>> dds = define(
                baseTag,
                "controller='java://org.auraframework.impl.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'", "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertEquals(2, dds.size());
        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        assertTrue(names.containsAll(ImmutableSet.of("java://org.auraframework.impl.java.controller.TestController",
                "java://org.auraframework.impl.java.controller.TestController2")));
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDef()}.
     */
    public void testGetControllerDefWithoutControllers() throws Exception {
        ControllerDef d = define(baseTag, "", "").getControllerDef();
        assertNull(d);
    }

    /**
     * Test method for {@link BaseComponentDef#getControllerDef()}.
     */
    public void testGetControllerDef() throws Exception {
        DefDescriptor<? extends BaseComponentDef> ddParent = define(baseTag,
                "extensible='true' controller='java://org.auraframework.impl.java.controller.TestController2'", "")
                .getDescriptor();
        ControllerDef d = define(
                baseTag,
                "controller='java://org.auraframework.impl.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'", "").getControllerDef();
        assertNotNull(d);
        String name = d.getDescriptor().getQualifiedName();
        assertTrue("Unexpected name: " + name, name.matches("compound://string\\..*"));
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptorWithoutRenderer() throws Exception {
        DefDescriptor<RendererDef> dd = define(baseTag, "", "").getRendererDescriptor();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptorExplicit() throws Exception {
        DefDescriptor<? extends BaseComponentDef> ddParent = define(
                baseTag,
                "extensible='true' renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer'",
                "").getDescriptor();
        DefDescriptor<RendererDef> dd = define(
                baseTag,
                String.format(
                        "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer' extends='%s'",
                        ddParent.getDescriptorName()), "").getRendererDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer",
                dd.getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptorImplicit() throws Exception {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<RendererDef> dd = cmpDesc.getDef().getRendererDescriptor();
        assertNotNull(dd);
        assertEquals(renderDesc, dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptorExplicitAndImplicit() throws Exception {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag,
                        "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer'",
                        ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<RendererDef> dd = cmpDesc.getDef().getRendererDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer",
                dd.getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptorExplicitRemoteAndLocal() throws Exception {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer,%s'",
                                renderDesc.getQualifiedName()), ""));
        DefDescriptor<RendererDef> dd = cmpDesc.getDef().getRendererDescriptor();
        assertNotNull(dd);
        assertEquals(renderDesc, dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getRendererDescriptor()}.
     */
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
    public void testGetLocalRendererDefExplicitRemote() throws Exception {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        RendererDef dd = define(baseTag, String.format("renderer='%s'", renderDesc.getQualifiedName()), "")
                .getLocalRendererDef();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getLocalRendererDef()}.
     */
    public void testGetLocalRendererDefImplicit() throws Exception {
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(cmpDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        RendererDef dd = cmpDesc.getDef().getLocalRendererDef();
        assertNull(dd);
    }

    /**
     * Test method for {@link BaseComponentDef#getLocalRendererDef()}.
     */
    public void testGetLocalRendererDefExplicitRemoteAndLocal() throws Exception {
        DefDescriptor<ComponentDef> otherDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<RendererDef> renderDesc = DefDescriptorImpl.getAssociateDescriptor(otherDesc, RendererDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(renderDesc, "({render:function(c){return this.superRender();}})");
        DefDescriptor<T> cmpDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(
                        baseTag,
                        String.format(
                                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer,%s'",
                                renderDesc.getQualifiedName()), ""));
        RendererDef dd = cmpDesc.getDef().getLocalRendererDef();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer", dd
                .getDescriptor().getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getHandlerDefs()}.
     */
    public void testGetHandlerDefsWithNoHandlers() throws Exception {
        // Verify no handlers for empty component
        T def = define(baseTag, "", "");
        Collection<EventHandlerDef> handlerDefs = def.getHandlerDefs();
        assertEquals("Should have no handlers for empty component", 0, handlerDefs.size());
    }

    /**
     * Test method for {@link BaseComponentDef#getHandlerDefs()}.
     */
    public void testGetHandlerDefs() throws Exception {
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

    /**
     * Test method for {@link BaseComponentDef#getThemeDescriptor()}.
     */
    public void testGetThemeDescriptorWithoutTheme() throws Exception {
        T def = define(baseTag, "", "");
        DefDescriptor<ThemeDef> themeDef = def.getThemeDescriptor();
        assertNull("ThemeDescriptor for component without theme should be null", themeDef);
    }

    /**
     * Test method for {@link BaseComponentDef#getThemeDescriptor()}.
     */
    public void testGetThemeDescriptor() throws Exception {
        T def = define(baseTag, "theme=\"templateCss://test.themeTestTemplate\"", "");
        DefDescriptor<ThemeDef> themeDef = def.getThemeDescriptor();
        assertNotNull("ThemeDescriptor not found on component", themeDef);
        assertEquals("Wrong ThemeDescriptor found on component", "templateCss://test.themeTestTemplate",
                themeDef.getQualifiedName());
    }

    /**
     * IllegalArgumentException if render is empty.
     */
    public void testRenderEmpty() throws Exception {
        try {
            define(baseTag, "render=''", "");
            fail("Should not be able to load component with empty render value");
        } catch (Exception e) {
            checkExceptionFull(e, IllegalArgumentException.class,
                    "No enum const class org.auraframework.def.BaseComponentDef$RenderType.");
        }
    }

    /**
     * IllegalArgumentException if render is invalid.
     */
    public void testRenderInvalid() throws Exception {
        try {
            define(baseTag, "render='typo'", "");
            fail("Should not be able to load component with invalid render value");
        } catch (Exception e) {
            checkExceptionFull(e, IllegalArgumentException.class,
                    "No enum const class org.auraframework.def.BaseComponentDef$RenderType.TYPO");
        }
    }

    /**
     * Verify the render attribute specified on a component tag. By default the rendering logic is turned on. Test
     * method for {@link BaseComponentDef#getRender()}.
     */
    public void testGetRenderDefault() throws Exception {
        RenderType defaultRender = define(baseTag, "", "").getRender();
        assertEquals("By default, rendering detection logic should be on.", RenderType.AUTO, defaultRender);
    }

    /**
     * Verify the render attribute specified as server. Test method for {@link BaseComponentDef#getRender()}.
     */
    public void testGetRenderServer() throws Exception {
        T serverRenderedComponentDef = define(baseTag, " render='server'", "");
        assertEquals("Rendering detection logic was expected to be forced to be serverside.", RenderType.SERVER,
                serverRenderedComponentDef.getRender());
        assertTrue("A component which wishes to be rendered server side cannot be locally renderable?",
                serverRenderedComponentDef.isLocallyRenderable());
    }

    /**
     * Verify the render attribute specified as client. Test method for {@link BaseComponentDef#getRender()}.
     */
    public void testGetRenderClient() throws Exception {
        T clientRenderedComponentDef = define(baseTag, " render='client'", "");
        assertEquals("Rendering detection logic was expected to be forced to be clientside.", RenderType.CLIENT,
                clientRenderedComponentDef.getRender());
        assertFalse("A component which wishes to be rendered client side can be locally renderable?",
                clientRenderedComponentDef.isLocallyRenderable());

    }

    /**
     * IllegalArgumentException thrown for invalid whitespace attribute.
     */
    public void testWhitespaceInvalid() throws Exception {
        try {
            define(baseTag, " whitespace='bogus'", "");
            fail("IllegalArgumentException should have been thrown for bad whitespace value.");
        } catch (Exception e) {
            checkExceptionFull(e, IllegalArgumentException.class,
                    "No enum const class org.auraframework.def.BaseComponentDef$WhitespaceBehavior.BOGUS");
        }
    }

    /**
     * Verify the whitespace attribute specified on a component tag. By default the whitespace logic is optimize, which
     * removes all non-necessary whitespace. Test method for {@link aura.def.BaseComponentDef#getWhitespace()}.
     */
    public void testGetWhitespaceDefault() throws Exception {
        WhitespaceBehavior defaultWhitespaceBehavior = define(baseTag, "", "").getWhitespaceBehavior();
        assertEquals("By default, whitespace optimize should be true.", BaseComponentDef.DefaultWhitespaceBehavior,
                defaultWhitespaceBehavior);
    }

    /**
     * Verify the whitespace attribute specified as preserve. Test method for
     * {@link aura.def.BaseComponentDef#getWhitespace()}.
     */
    public void testGetWhitespacePreserve() throws Exception {
        T preserveWhitespaceComponentDef = define(baseTag, " whitespace='preserve'", "");
        assertEquals("Whitespace behavior was expected to be forced to be preserve.", WhitespaceBehavior.PRESERVE,
                preserveWhitespaceComponentDef.getWhitespaceBehavior());
    }

    /**
     * Verify the whitespace attribute specified as optimize. Test method for
     * {@link aura.def.BaseComponentDef#getWhitespace()}.
     */
    public void testGetWhitespaceOptimize() throws Exception {
        T optimizeWhitespaceComponentDef = define(baseTag, " whitespace='optimize'", "");
        assertEquals("Whitespace behavior was expected to be forced to be optimize.", WhitespaceBehavior.OPTIMIZE,
                optimizeWhitespaceComponentDef.getWhitespaceBehavior());
    }

    /**
     * No dependencies by default. Test method for {@link aura.def.BaseComponentDef#getDependencies()}.
     */
    public void testGetDependenciesWithoutDependencies() throws Exception {
        T baseComponentDef = define(baseTag, "", "");
        assertTrue("Dependencies should not be present if not specified on component", baseComponentDef
                .getDependencies().isEmpty());
    }

    /**
     * Dependency returned for default namespace. Test method for {@link aura.def.BaseComponentDef#getDependencies()}.
     */
    public void testGetDependenciesDefaultNamespace() throws Exception {
        T baseComponentDef = define(baseTag, "", "<aura:dependency resource=\"*://aura:*\" type=\"EVENT\"/>");
        assertEquals("Dependency not found", "[*://aura:*[EVENT]]", baseComponentDef.getDependencies().toString());
    }

    /**
     * Dependency returned for non-default namespace. Test method for
     * {@link aura.def.BaseComponentDef#getDependencies()}.
     */
    public void testGetDependenciesNonDefaultNamespace() throws Exception {
        T baseComponentDef = define(baseTag, "", "<aura:dependency resource=\"*://auratest:*\" type=\"EVENT\"/>");
        assertEquals("Dependency not found", "[*://auratest:*[EVENT]]", baseComponentDef.getDependencies().toString());
    }

    /**
     * InvalidDefinitionException for nonexistent dependency.
     */
    public void testDependencyNonExistent() throws Exception {
        try {
            define(baseTag, "", "<aura:dependency resource=\"*://idontexist:*\"/>");
            fail("Should not be able to load non-existant resource as dependency");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Invalid dependency *://idontexist:*[COMPONENT]");
        }
    }

    /**
     * InvalidDefinitionException for invalid dependency.
     */
    public void testDependencyInvalid() throws Exception {
        // Invalid descriptor pattern
        try {
            define(baseTag, "", "<aura:dependency resource=\"*://auratest.*\"/>");
            fail("Should not be able to load resource, bad DefDescriptor format");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Illegal namespace in *://auratest.*");
        }

        // Another invalid descriptor pattern
        try {
            define(baseTag, "", "<aura:dependency resource=\"*:auratest:*\"/>");
            fail("Should not be able to load resource, bad DefDescriptor format");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Illegal name in *:auratest:*");
        }
    }

    /**
     * isLocallyRenderable is false when component has a Javascript Renderer. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithClientsideRenderer() throws Exception {
        T baseComponentDef = define(baseTag, "renderer='js://test.testJSRenderer'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has client renderers, the component should not be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is true when component includes an interface as facet, the interface has a Javascript
     * provider. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithOnlyServersideRenderers() throws Exception {
        T baseComponentDef = define(baseTag, "", "Body: Has just text. Text component has a java renderer.");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertTrue("When a component has only server renderers, the component should be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when component includes an interface as facet and the interface has a Javascript
     * provider. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithClientsideFacet() throws Exception {
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
    public void testIsLocallyRenderableWithClientsideProvider() throws Exception {
        T baseComponentDef = define(baseTag, "provider='js://test.test_JSProvider_Interface'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has client renderers, the component should not be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when component includes a Javascript controller. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithClientsideController() throws Exception {
        T baseComponentDef = define(baseTag, "", "Body: Includes a component with a client controller. "
                + " <test:testJSController/>");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has dependency on a controller, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when a component includes a Theme. Test method for
     * {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithTheme() throws Exception {
        T baseComponentDef = define(baseTag, "theme='css://test.testValidCSS'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has a theme, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());
    }

    /**
     * isLocallyRenderable is false when a facet of a component has a component marked for LAZY loading, the component
     * should always be rendered client side. Test method for {@link BaseComponentDef#isLocallyRenderable()}.
     */
    public void testIsLocallyRenderableWithLazyLoadedFacet() throws Exception {
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
    public void testIsLocallyRenderableWithInheritedLazyLoadedFacet() throws Exception {
        DefDescriptor<ComponentDef> parentDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'> <aura:text aura:load='LAZY'/></aura:component>");
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s'></aura:component>", parentDesc.getDescriptorName()));
        assertFalse("Lazy loading information is not chained through inheritance.", childDesc.getDef()
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
    public void testHasLocalDependenciesWithServersideModel() throws Exception {
        T baseComponentDef = define(baseTag, "model='java://org.auraframework.impl.java.model.TestJavaModel'", "");
        assertTrue("When a component has a model, the component has server dependencies .",
                baseComponentDef.hasLocalDependencies());
        assertEquals(true, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));
    }

    /**
     * hasLocalDependencies is true if component has serverside renderer. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesWithServersideRenderer() throws Exception {
        T baseComponentDef = define(baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'", "");
        assertTrue("When a component has a server renderer only, the component has server dependencies.",
                baseComponentDef.hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false if component has clientside renderer. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesWithClientsideRenderer() throws Exception {
        T baseComponentDef = define(
                baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer,js://test.testJSRenderer'",
                "");
        assertFalse("When a component has a client renderer, the component does not have server dependencies.",
                baseComponentDef.hasLocalDependencies());
        assertEquals(null, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));
    }

    /**
     * hasLocalDependencies is false if component has clientside provider. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesWithClientsideProvider() throws Exception {
        T baseComponentDef = define(baseTag, "abstract='true'", "");
        DefDescriptor<ProviderDef> providerDesc = Aura.getDefinitionService().getDefDescriptor(
                baseComponentDef.getDescriptor(), DefDescriptor.JAVASCRIPT_PREFIX, ProviderDef.class);
        auraTestingUtil.addSourceAutoCleanup(providerDesc,
                "({provide:function Provider(component){return 'aura:text';}})");
        assertFalse("Abstract Component with client provider should not have any server dependencies.",
                definitionService.getDefinition(baseComponentDef.getDescriptor()).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is true if component has clientside provider. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesWithServersideProvider() throws Exception {
        T baseComponentDef = define(baseTag,
                "abstract='true' provider='java://org.auraframework.impl.java.provider.TestProviderAbstractBasic'", "");
        assertTrue("Abstract Component with serverside providers have server dependecies.", definitionService
                .getDefinition(baseComponentDef.getDescriptor()).hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is true if super has local dependencies. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesInherited() throws Exception {
        String parentContent = String.format(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestJavaModel' ", "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertTrue(
                "When a component's parent has serverside dependency, the component should be marked as server dependent.",
                child.getDef().hasLocalDependencies());
    }

    /**
     * hasLocalDependencies is false even if facet has local dependencies. Test method for
     * {@link BaseComponentDef#hasLocalDependencies()}.
     */
    public void testHasLocalDependenciesWithFacetWithLocalDependencies() throws Exception {
        T baseComponentDef = define(
                baseTag,
                "",
                "Body: Includes an interface which has a Java provider. "
                        + "<aura:attribute name='facet' type='Aura.Component'><test:test_Provider_AbstractBasic/></aura:attribute>");
        assertFalse(
                "When a component's facet has serverside dependency, should the component also be marked as server dependent?",
                baseComponentDef.hasLocalDependencies());
    }

    public void testExtendsSelf() {
        DefDescriptor<T> extendsSelf = addSourceAutoCleanup(getDefClass(), "");
        Source<T> source = auraTestingUtil.getSource(extendsSelf);
        source.addOrUpdate(String.format(baseTag,
                "extensible='true' extends='" + extendsSelf.getDescriptorName() + "'", ""));
        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            extendsSelf.getDef();
            fail(defType + " should not be able to extend itself.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, extendsSelf.getQualifiedName()
                    + " cannot extend itself", extendsSelf.getQualifiedName());
        }
    }

    public void testExtendsNonExtensible() {
        DefDescriptor<T> nonExtensible = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", ""));
        DefDescriptor<T> extendsCmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + nonExtensible.getDescriptorName() + "'", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            extendsCmp.getDef();
            fail(defType + " should not be able to extend a non-extensible component");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, extendsCmp.getQualifiedName()
                    + " cannot extend non-extensible component " + nonExtensible.getQualifiedName(),
                    extendsCmp.getQualifiedName());
        }
    }

    /**
     * Verify extending a non-existent component throws correct Exception
     */
    public void testExtendsNonExistent() {
        DefDescriptor<T> cmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='aura:iDontExist'", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            cmp.getDef();
            fail(defType + " should throw Exception when extending non-existent component");
        } catch (Exception e) {
            checkExceptionFull(e, DefinitionNotFoundException.class, "No " + defType
                    + " named markup://aura:iDontExist found : " + cmp.getQualifiedName(), cmp.getQualifiedName());
        }
    }

    /**
     * Verify extending a non-existent component throws correct Exception
     */
    public void testExtendsEmpty() {
        DefDescriptor<T> cmp = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends=''", ""));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            cmp.getDef();
            fail(defType + " should throw Exception when extends is empty");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * Test method for {@link BaseComponentDef#isInstanceOf()}.
     */
    public void testIsInstanceOfAbstract() throws Exception {
        // Test cases for Abstract Component extensions
        DefDescriptor<T> grandParent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' abstract='true'", ""));
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + grandParent.getDescriptorName() + "'", ""));
        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + parent.getDescriptorName() + "'", ""));

        assertTrue("Failed to assert inheritance across one level.", parent.getDef().isInstanceOf(grandParent));
        assertTrue("Failed to assert inheritance across one level.", child.getDef().isInstanceOf(parent));
        assertTrue("Failed to assert inheritance across multiple levels.", child.getDef().isInstanceOf(grandParent));
    }

    /**
     * Test method for {@link BaseComponentDef#isInstanceOf()}.
     */
    public void testIsInstanceOfInterface() throws Exception {
        // Test cases for Interface inheritance and implementations
        String interfaceTag = "<aura:interface %s> </aura:interface>";
        DefDescriptor<InterfaceDef> grandParentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, ""));
        DefDescriptor<InterfaceDef> parentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, "extends='" + grandParentInterface.getDescriptorName() + "'"));
        DefDescriptor<T> interfaceImpl = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='" + parentInterface.getDescriptorName() + "'", ""));

        assertTrue("Failed to assert interface implementation one level.",
                interfaceImpl.getDef().isInstanceOf(parentInterface));
        assertTrue("Failed to assert inherface extension across one level.",
                parentInterface.getDef().isInstanceOf(grandParentInterface));
        assertTrue("Failed to assert inheritance implementation across multiple levels.", interfaceImpl.getDef()
                .isInstanceOf(grandParentInterface));

    }

    /**
     * When a facet is marked for Lazy/Exclusive loading, parentDef has a LazyComponentDefRef
     */
    public void testFacetLazyLoaded() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='LAZY'/>"));
        T def = desc.getDef();
        AttributeDefRef body = getBodyAttributeFromDef(def);
        assertTrue(body.getValue() instanceof List);
        List<?> bodyCmps = (List<?>) body.getValue();
        assertEquals(1, bodyCmps.size());
        assertTrue(bodyCmps.get(0) instanceof LazyComponentDefRef);
        assertEquals("markup://aura:text", ((DefDescriptor<?>) ((LazyComponentDefRef) bodyCmps.get(0))
                .getAttributeDefRef("refDescriptor").getValue()).getQualifiedName());
    }

    /**
     * When a facet is marked for Lazy/Exclusive loading, parentDef has a LazyComponentDefRef.
     */
    public void testFacetExclusivelyLoaded() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='Exclusive'/>"));
        T def = desc.getDef();
        AttributeDefRef body = getBodyAttributeFromDef(def);
        assertTrue(body.getValue() instanceof List);
        List<?> bodyCmps = (List<?>) body.getValue();
        assertEquals(1, bodyCmps.size());
        assertTrue(bodyCmps.get(0) instanceof LazyComponentDefRef);
        assertEquals(true, ((LazyComponentDefRef) bodyCmps.get(0)).getAttributeDefRef("exclusive").getValue());
    }

    /**
     * Should not be able to lazy load a non-existing component.
     */
    public void testFacetLazyLoadNonExistentComponent() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:fooBar999 aura:load='LAZY'/>"));
        try {
            desc.getDef();
            fail("should not be able to use a non-existing component by marking it to be lazy loaded");
        } catch (DefinitionNotFoundException e) {
            assertTrue(e.getMessage().contains("No COMPONENT named markup://aura:fooBar999"));
        }
    }

    /**
     * Should not be able to lazy load a component with an invalid attribute.
     */
    public void testFacetLazyLoadWithNonExistentAttribute() throws Exception {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='LAZY' fooBar999='hoze'/>"));
        try {
            desc.getDef();
            fail("should not be able to use a non-existing attribute by marking it to be lazy loaded");
        } catch (InvalidReferenceException e) {
            assertTrue(e.getMessage().contains("Attribute fooBar999 does not exist"));
        }
    }

    /**
     * Should not be able to lazy load a component with an invalid attribute.
     */
    public void testFacetLazyLoadWithNonBasicAttribute() throws Exception {
        DefDescriptor<ComponentDef> cmpAttr = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='cmps' type='Aura.Component'/> </aura:component>");
        DefDescriptor<T> desc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "",
                        "<" + cmpAttr.getDescriptorName() + " aura:load='LAZY'>" + "<aura:set attribute='cmps'>"
                                + "<aura:text/>" + "</aura:set>" + "</" + cmpAttr.getDescriptorName() + ">"));
        try {
            desc.getDef();
            fail("should not be able to use a non-basic attribute type in lazy loaded component");
        } catch (Exception e) {
            checkExceptionFull(
                    e,
                    InvalidReferenceException.class,
                    "Lazy Component References can only have attributes of simple types passed in (cmps is not simple)",
                    desc.getQualifiedName());
        }
    }

    public void testGetLocation() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null,
                vendor.makeLocation("filename1", 5, 5, 0), null, null,
                null, null, null, null, null, false, false);
        assertEquals(
                vendor.makeLocation("filename1", 5, 5, 0),
                bcd.getLocation());
    }

    /**
     * InvalidDefinitionException if component specifies wider support level than super.
     */
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
            parentDesc.getDef();
            fail("A child cannot widen the support level of its parent.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            parentDesc.getQualifiedName(), grandParentDesc.getQualifiedName()),
                            parentDesc.getQualifiedName());
        }
    }

    /**
     * InvalidDefinitionException if component has facet that specifies wider support level than super.
     */
    public void testSupportLevelFacetWiderThanSuper() throws Exception {
        // Including a component, that violates support level restriction, as facet
        DefDescriptor<ComponentDef> parentCmp = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true' support='BETA'></aura:component>", "validateReferences_parentCmp");
        DefDescriptor<ComponentDef> childCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component extends='"
                + parentCmp.getDescriptorName() + "' support='GA'></aura:component>", "validateReferences_childCmp");
        DefDescriptor<T> testDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<" + childCmp.getDescriptorName() + "/>"), "validateReferences_testCmp");
        try {
            testDesc.getDef();
            fail("Test component's facet has a component which tries to widen the support level of its parent.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            childCmp.getQualifiedName(), parentCmp.getQualifiedName()), childCmp.getQualifiedName());
        }
    }

    /**
     * Verify a component cannot have an attribute and event with the same name.
     */
    public void testAttributeAndeEventNameConflict() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:registerEvent name='dupeAttrEvent' type='test:parentEvent'/>"
                        + "<aura:attribute name='dupeAttrEvent' type='String'/>"));

        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            dd.getDef();
            fail(defType + " should not be able to have attribute and event with same name");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Cannot define an attribute and register an event with the same name: dupeAttrEvent",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify an abstract component must also be extensible.
     */
    public void testAbstractNotExtensible() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "abstract='true' extensible='false'", ""));
        try {
            dd.getDef();
            fail(DefType.getDefType(getDefClass()) + " must be extensible if abstract");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Abstract component " + dd.getQualifiedName() + " must be extensible.",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify component cannot implement root component (aura:rootComponent).
     */
    public void testImplementsRootComponent() {
        DefDescriptor<T> dd = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='aura:rootComponent'", ""));
        try {
            dd.getDef();
            fail(DefType.getDefType(getDefClass())
                    + " should not be able to implement rootComponent if not in aura namespace");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Component " + dd.getQualifiedName()
                    + " cannot implement the rootComponent interface because it is not in the aura namespace",
                    dd.getQualifiedName());
        }
    }

    /**
     * Verify cannot reference an inner component that does not exist.
     */
    public void testInnerComponentNonExistent() {
        try {
            define(baseTag, "", "<aura:iDontExist/>");
            fail(DefType.getDefType(getDefClass())
                    + " should not be able to reference inner component that does not exist");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No COMPONENT named markup://aura:iDontExist found :");
        }
    }

    /**
     * Verify component cannot implement a non-existent component
     */
    public void testImplementsEmpty() {
        try {
            define(baseTag, "implements=''", "");
            fail(DefType.getDefType(getDefClass()) + " should throw Exception when implements is empty");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "QualifiedName is required for descriptors");
        }
    }

    /**
     * Verify component cannot implement a non-existent component
     */
    public void testImplementsNonExistent() {
        try {
            define(baseTag, "implements='aura:iDontExist'", "");
            fail(DefType.getDefType(getDefClass()) + " should throw Exception when implementing non-existent interface");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No INTERFACE named markup://aura:iDontExist found :");
        }
    }

    /**
     * Test method for {@link BaseComponentDef#isAbstract()}.
     */
    public void testIsAbstractDefault() throws Exception {
        assertFalse(define(baseTag, "", "").isAbstract());
    }

    /**
     * Test method for {@link BaseComponentDef#isAbstract()}.
     */
    public void testIsAbstract() throws Exception {
        checkBoolean(String.format(baseTag, "abstract='%s'", ""));
    }

    public void testBuildWithNullDescriptor() throws Exception {
        try {
            vendor.makeBaseComponentDefWithNulls(getDefClass(), null, null, null, null,
                    null, null, null, null, null, null, null, null, false, false);
            fail("Should have thrown AuraException for null AuraDescriptor");
        } catch (AuraRuntimeException e) {
            checkExceptionFull(e, AuraRuntimeException.class, "descriptor is null");
        }
    }

    /**
     * Test method for {@link Definition#validateDefinition()}.
     */
    public void testValidateDefinitionNonExtensibleAbstract() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null, null, null,
                null, null, null, null, null, null, true, false);
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
    public void testValidateReferencesWithNonExistentParent() throws Exception {
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null, null, null,
                null, DefDescriptorImpl.getInstance("test:nonExistentComponentParent", getDefClass()), null, null,
                null, null, false, false);
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
    public void testValidateReferencesWithNonExtensibleParent() throws Exception {
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null, null, null,
                null, parentDesc, null, null, null, null, false, false);
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
     * Test method for {@link Definition#validateReferences()}.
     */
    public void testValidateReferencesWithNonExistentInterface() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new
                HashSet<DefDescriptor<InterfaceDef>>();
        interfaces.add(vendor.makeInterfaceDefDescriptor("say:what"));
        BaseComponentDef bcd = vendor.makeBaseComponentDefWithNulls(getDefClass(),
                auraTestingUtil.getNonce("test:cmp"), null, null, null, null, null,
                null, null, interfaces, null, null, null, false, false);
        try {
            bcd.validateReferences();
            fail("Should have thrown AuraException because the parent isn't extensible.");
        } catch (DefinitionNotFoundException e) {
            checkExceptionFull(
                    e,
                    DefinitionNotFoundException.class,
                    String.format("No INTERFACE named markup://say:what found",
                            bcd.getDescriptor().getQualifiedName()));
        }
    }

    /**
     * Test method for {@link BaseComponentDef#getHelperDef()}.
     */
    public void testGetHelperDefDefault() throws Exception {
        HelperDef d = define(baseTag, "", "").getHelperDef();
        assertNull(d);
    }

    /**
     * Test method for {@link BaseComponentDef#getHelperDef()}.
     */
    public void testGetHelperDefImplicit() throws Exception {
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", ""));
        DefDescriptor<HelperDef> helperDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, HelperDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(helperDesc, "({help:function(){}})");

        HelperDef d = compDesc.getDef().getHelperDef();
        assertNotNull(d);
        assertEquals(helperDesc, d.getDescriptor());
    }

    /**
     * Test method for {@link BaseComponentDef#getHelperDef()}.
     */
    public void testGetHelperDefExplicit() throws Exception {
        DefDescriptor<HelperDef> helperDesc = vendor.getHelperDescriptor();
        HelperDef d = define(baseTag, String.format("helper='%s'", helperDesc), "").getHelperDef();
        assertNotNull(d);
        assertEquals(helperDesc, d.getDescriptor());
    }

    /**
     * Test method for {@link BaseComponentDef#getHelperDef()}.
     */
    public void testGetHelperDefImplicitAndExplicit() throws Exception {
        DefDescriptor<HelperDef> helperDesc = vendor.getHelperDescriptor();
        DefDescriptor<T> compDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, String.format("helper='%s'", helperDesc), ""));
        DefDescriptor<HelperDef> implicitDesc = DefDescriptorImpl.getAssociateDescriptor(compDesc, HelperDef.class,
                DefDescriptor.JAVASCRIPT_PREFIX);
        auraTestingUtil.addSourceAutoCleanup(implicitDesc, "({help:function(){}})");

        HelperDef d = compDesc.getDef().getHelperDef();
        assertNotNull(d);
        assertEquals(helperDesc, d.getDescriptor());
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
        JsonStreamReader jsonStreamReader = new JsonStreamReader(Json.serialize(def));
        jsonStreamReader.next();
        Object temp = jsonStreamReader.getValue();
        assertTrue(temp instanceof Map);
        Map<Object, Object> cmpConfig = (HashMap<Object, Object>) temp;
        return cmpConfig.containsKey(property) ? cmpConfig.get(property) : null;
    }
}