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
package org.auraframework.impl.test.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.EventType;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.clientlibrary.ClientLibraryDefImpl;
import org.auraframework.impl.css.token.TokensDefImpl;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.AttributeImpl;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.auraframework.impl.root.component.BaseComponentDefImpl.Builder;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.root.event.EventHandlerDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

/**
 * Utility to easily get aura objects.
 */
public class AuraImplUnitTestingUtil {

    private static final String defaultAttributeName = "defaultAttribute";
    private static final String defaultComponentName = "defaultComponent";
    private static final String defaultAttributeValue = "defaultValue";
    private static final long defaultLastModified = 1000;
    private static final String defaultFileName = "filename1";
    private static final EventType defaultEventType = EventType.COMPONENT;

    private final DefinitionService definitionService;
    private final InstanceService instanceService;

    public AuraImplUnitTestingUtil(DefinitionService definitionService, InstanceService instanceService) {
        this.definitionService = definitionService;
        this.instanceService = instanceService;
    }

    public String getAttributeName() {
        return defaultAttributeName;
    }

    public DefDescriptor<AttributeDef> getAttributeDescriptor() {
        return definitionService.getDefDescriptor(defaultAttributeName, AttributeDef.class);
    }

    public String getAttributeValue() {
        return defaultAttributeValue;
    }

    public DefDescriptor<StyleDef> getStyleDescriptor() {
        return definitionService.getDefDescriptor("css://test.fakeComponent", StyleDef.class);
    }

    public DefDescriptor<ApplicationDef> getApplicationDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeApplication", ApplicationDef.class);
    }

    public DefDescriptor<ComponentDef> getComponentDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeComponent", ComponentDef.class);
    }

    public DefDescriptor<DocumentationDef> getDocumentationDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeDoc", DocumentationDef.class);
    }

    public DefDescriptor<ComponentDef> getParentComponentDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeComponentParent", ComponentDef.class);
    }

    public DefDescriptor<ComponentDef> getChildComponentDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakecomponentChild", ComponentDef.class);
    }

    public DefDescriptor<TokensDef> getTokensDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeTokens", TokensDef.class);
    }

    public DefDescriptor<ComponentDef> getFlavorableComponentDescriptor() {
        return definitionService.getDefDescriptor("test:flavorableFakeComponent", ComponentDef.class);
    }

    public DefDescriptor<FlavoredStyleDef> getFlavoredStyleDescriptor() {
        return Flavors.standardFlavorDescriptor(getFlavorableComponentDescriptor());
    }

    public String getComponentName() {
        return defaultComponentName;
    }

    public DefDescriptor<InterfaceDef> getInterfaceDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeInterface",
                InterfaceDef.class);
    }

    public DefDescriptor<InterfaceDef> getParentInterfaceDefDescriptor() {
        return definitionService.getDefDescriptor("test:fakeParentInterface", InterfaceDef.class);
    }

    public Location getLocation() {
        return new Location("filename1", 5, 5, defaultLastModified);
    }

    public DefDescriptor<TypeDef> getTypeDefDescriptor() {
        return definitionService.getDefDescriptor("String", TypeDef.class);
    }

    public DefDescriptor<TypeDef> getSimpleTypeDefDescriptor(String simpleType) {
        return definitionService.getDefDescriptor(simpleType, TypeDef.class);
    }

    public TypeDef getTypeDef() {
        return new TypeDef() {

            private static final long serialVersionUID = -245212961854034916L;

            @Override
            public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
            }

            @Override
            public DefDescriptor<TypeDef> getDescriptor() {
                return definitionService.getDefDescriptor("String", TypeDef.class);
            }

            @Override
            public Location getLocation() {
                return AuraImplUnitTestingUtil.this.getLocation();
            }

            @Override
            public String getName() {
                return "String";
            }

            @Override
            public void validateDefinition() {
            }

            @Override
            public void validateReferences() {
            }

            @Override
            public void markValid() {
            }

            @Override
            public boolean isValid() {
                return true;
            }

            @Override
            public void serialize(Json json) throws IOException {
                json.writeString(getName());
            }

            /**
             * @see java.lang.Object#hashCode()
             */
            @Override
            public int hashCode() {
                return AuraUtil.hashCode(getDescriptor());
            }

            @Override
            public boolean equals(Object obj) {
                if (obj instanceof TypeDef) {
                    return getDescriptor().equals(((TypeDef) obj).getDescriptor());
                }
                return false;
            }

            @Override
            public Object getExternalType(String prefix) {
                return null;
            }

            @Override
            public Object valueOf(Object stringRep) {
                return stringRep;
            }

            @Override
            public Object wrap(Object o) {
                return o;
            }

            @Override
            public Object initialize(Object config, BaseComponent<?, ?> valueProvider) {
                return config;
            }

            @Override
            public <D extends Definition> D getSubDefinition( SubDefDescriptor<D, ?> descriptor) {
                return null;
            }

            @Override
            public void retrieveLabels() {
            }

            @Override
            public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) {
            }

            @Override
            public String getAPIVersion() {
                return null;
            }

            @Override
            public String getDescription() {
                return null;
            }

            @Override
            public String getOwnHash() {
                return null;
            }

            @Override
            public DefinitionAccess getAccess() {
                return null;
            }

            @Override
            public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
            }
        };
    }

    public DefDescriptor<EventDef> getEventDefDescriptor() {
        return definitionService.getDefDescriptor("test:anevent", EventDef.class);
    }
    public DefDescriptor<EventDef> getParentEventDefDescriptor() {
        return definitionService.getDefDescriptor("test:parentEvent", EventDef.class);
    }

    public EventType getEventType() {
        return defaultEventType;
    }

    public DefDescriptor<ControllerDef> getControllerDescriptor() {
        return definitionService.getDefDescriptor(
                "java://org.auraframework.components.test.java.controller.TestController",
                ControllerDef.class);
    }

    public DefDescriptor<ModelDef> getModelDescriptor() {
        return definitionService.getDefDescriptor("java://org.auraframework.impl.model.java.TestModel", ModelDef.class);
    }

    public AttributeImpl makeAttribute(String name) {
        return new AttributeImpl(definitionService.getDefDescriptor(
                name == null ? defaultAttributeName : name, AttributeDef.class));
    }

    public AttributeDefImpl makeAttributeDef() {
        return makeAttributeDef(null, null, null, false, null, null);
    }

    public ClientLibraryDef makeClientLibraryDef(String name, ClientLibraryDef.Type type, Set<AuraContext.Mode> modes,
            DefDescriptor<? extends RootDefinition> parentDescriptor, Location location) {
        ClientLibraryDefImpl.Builder builder = new ClientLibraryDefImpl.Builder();

        builder.setName(name);
        builder.setType(type);
        builder.setModes(modes);

        builder.setParentDescriptor(parentDescriptor);
        builder.setLocation(location);

        return builder.build();
    }

    /**
     * Create and insert an attribute def in a map.
     */
    public void insertAttributeDef(Map<DefDescriptor<AttributeDef>, AttributeDef> map,
                                   DefDescriptor<? extends RootDefinition> parent, String name, String simpleType, boolean required,
                                   SerializeToType serializeTo, Location location, AuraContext.Access access) {
        AttributeDef attr = makeAttributeDefWithNulls(name, parent, getSimpleTypeDefDescriptor(name), null,
                required, serializeTo, location, new DefinitionAccessImpl(access));
        map.put(attr.getDescriptor(), attr);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public AttributeDefImpl makeAttributeDef(String name, DefDescriptor<TypeDef> typeDefDescriptor,
                                             AttributeDefRefImpl defaultValue, boolean required, SerializeToType serializeTo, Location location) {
        return makeAttributeDefWithNulls(
                name == null ? defaultAttributeName : name, null,
                typeDefDescriptor == null ? getTypeDef().getDescriptor() : typeDefDescriptor,
                defaultValue == null ? makeAttributeDefRef(null, null, null) : defaultValue, required,
                serializeTo == null ? AttributeDef.SerializeToType.BOTH : serializeTo,
                location == null ? getLocation() : location,
                new DefinitionAccessImpl(AuraContext.Access.PRIVATE));
    }

    public AttributeDefImpl makeAttributeDefWithNulls(String name,
                                                      DefDescriptor<? extends RootDefinition> parentDescriptor, DefDescriptor<TypeDef> typeDefDescriptor,
                                                      AttributeDefRefImpl defaultValue, boolean required, SerializeToType serializeTo, Location location) {
        return makeAttributeDefWithNulls(name, parentDescriptor, typeDefDescriptor, defaultValue, required, serializeTo,
                location, new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
    }

    public AttributeDefImpl makeAttributeDefWithNulls(String name,
                                                      DefDescriptor<? extends RootDefinition> parentDescriptor, DefDescriptor<TypeDef> typeDefDescriptor,
            AttributeDefRefImpl defaultValue, boolean required,
                                                      SerializeToType serializeTo, Location location, DefinitionAccess access) {
        return new AttributeDefImpl(definitionService.getDefDescriptor(name, AttributeDef.class),
                parentDescriptor, typeDefDescriptor, defaultValue, required, serializeTo, location, access);
    }

    public DependencyDef makeDependencyDef(DefDescriptor<? extends RootDefinition> parentDescriptor,
            String resource, String type, Location location) {
        DependencyDefImpl.Builder builder;

        builder = new DependencyDefImpl.Builder();
        builder.setParentDescriptor(parentDescriptor);
        builder.setResource(resource);
        builder.setLocation(location);
        builder.setType(type);
        return builder.build();
    }

    public AttributeDefRefImpl makeAttributeDefRef() {
        return makeAttributeDefRef(null, null, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public AttributeDefRefImpl makeAttributeDefRef(String name, Object value, Location location) {
        AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
        atBuilder.setDescriptor(definitionService.getDefDescriptor(name == null ? defaultAttributeName : name,
                AttributeDef.class));
        atBuilder.setLocation((location == null) ? getLocation() : location);
        atBuilder.setValue((value == null) ? defaultAttributeValue : value);

        return atBuilder.build();
    }

    public AttributeDefRefImpl makeAttributeDefRefWithNulls(String name, Object value, Location location) {
        AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
        atBuilder.setDescriptor(definitionService.getDefDescriptor(name, AttributeDef.class));
        atBuilder.setLocation(location);
        atBuilder.setValue(value);
        return atBuilder.build();
    }

    public Component makeComponent(String name, String globalId) throws QuickFixException {
        return instanceService.getInstance(definitionService.getDefDescriptor(name == null ? defaultComponentName : name,
                ComponentDef.class), null);
    }

    public ComponentDef makeComponentDef() throws QuickFixException {
        return makeComponentDef(null, null, null, null, null, null, null, null,
                null, null, null, null, false, false);
    }

    public ComponentDef makeComponentDef(DefDescriptor<ComponentDef> descriptor,
            DefDescriptor<ComponentDef> extendsDescriptor) throws QuickFixException {
        return makeComponentDef(descriptor, null, null, null, null, null, null,
                extendsDescriptor, null, null, false, false);
    }

    public ComponentDef makeComponentDef(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location,
            DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor,
            DefDescriptor<ComponentDef> extendsDescriptor) throws QuickFixException {

        if (attributeDefs == null) {
            attributeDefs = new HashMap<>();
            attributeDefs.put(getAttributeDescriptor(),
                    makeAttributeDef(null, null, null, false, null, null));
        }

        if (eventDefs == null) {
            eventDefs = new HashMap<>();
            eventDefs.put("fakey", makeRegisterEventDef(null, null, false, null));
        }

        if (children == null) {
            children = new ArrayList<>();
            children.add(makeComponentDefRef(getChildComponentDefDescriptor(),
                    null, null));
        }

        return makeComponentDef(
                descriptor == null ? getComponentDefDescriptor() : descriptor,
                        attributeDefs, eventDefs, children,
                        location == null ? getLocation() : location,
                                controllerDescriptor == null ? getControllerDescriptor()
                                        : controllerDescriptor,
                                        modelDescriptor == null ? getModelDescriptor()
                                                : modelDescriptor,
                                                extendsDescriptor == null ? getParentComponentDefDescriptor()
                                                        : extendsDescriptor, null, null, false, false);
    }

    private void addAttributes(RootDefinitionImpl.Builder<?> builder,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs) {
        if (attributeDefs == null) {
            return;
        }
        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDef> entry : attributeDefs.entrySet()) {
            builder.addAttributeDef(entry.getKey(), entry.getValue());
        }
    }

    private void addAttributes(ComponentDefRefImpl.Builder builder,
            Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeDefs) {
        if (attributeDefs == null) {
            return;
        }
        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : attributeDefs.entrySet()) {
            builder.setAttribute(entry.getKey(), entry.getValue());
        }
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     * @throws QuickFixException
     */
    public ComponentDef makeComponentDef(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location,
            DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor,
            DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces,
            List<EventHandlerDef> eventHandlers, boolean isAbstract,
            boolean isExtensible) throws QuickFixException {

        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }
        addAttributes(builder, attributeDefs);

        if (eventDefs == null) {
            eventDefs = new HashMap<>();
            eventDefs.put("fakey", makeRegisterEventDef(null, null, false, null));
        }
        builder.events = eventDefs;

        if (interfaces == null) {
            interfaces = new HashSet<>();
            interfaces.add(getInterfaceDefDescriptor());
        }
        builder.interfaces = interfaces;

        List<DefDescriptor<ControllerDef>> cd = new ArrayList<>();
        cd.add(controllerDescriptor == null ? getControllerDescriptor() : controllerDescriptor);
        builder.controllerDescriptors = cd;

        builder.setDescriptor((descriptor == null) ? getComponentDefDescriptor() : descriptor);
        builder.setLocation((location == null) ? getLocation() : location);
        builder.modelDefDescriptor = modelDescriptor == null ? getModelDescriptor() : modelDescriptor;
        builder.extendsDescriptor = extendsDescriptor == null ? getParentComponentDefDescriptor() : extendsDescriptor;
        builder.eventHandlers = eventHandlers;
        builder.isAbstract = isAbstract;
        builder.isExtensible = isExtensible;
        return builder.build();
    }

    public <T extends BaseComponentDef> T makeBaseComponentDefWithNulls(
            Class<T> defClass, String descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location,
            DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor,
            DefDescriptor<T> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces,
            List<DefDescriptor<RendererDef>> renderers,
            List<DefDescriptor<HelperDef>> helpers,
            List<EventHandlerDef> eventHandlers, boolean isAbstract,
            boolean isExtensible, Access access) throws QuickFixException {

        @SuppressWarnings("unchecked")
        BaseComponentDefImpl.Builder<T> builder = (Builder<T>) (defClass
                .equals(ComponentDef.class) ? new ComponentDefImpl.Builder()
        : new ApplicationDefImpl.Builder());

        if (descriptor != null) {
            builder.setDescriptor(descriptor);
        }
        if (location != null) {
            builder.setLocation(location);
        }
        if (attributeDefs != null) {
            addAttributes(builder, attributeDefs);
        }
        if (controllerDescriptor != null) {
            builder.controllerDescriptors = ImmutableList
                    .of(controllerDescriptor);
        }
        builder.isAbstract = isAbstract;
        builder.isExtensible = isExtensible;
        builder.extendsDescriptor = extendsDescriptor;
        builder.modelDefDescriptor = modelDescriptor;
        builder.eventHandlers = eventHandlers;
        builder.events = eventDefs;
        builder.interfaces = interfaces;
        builder.rendererDescriptors = renderers == null ? null : Lists.newArrayList(renderers);
        builder.helperDescriptors = helpers == null ? null : Lists.newArrayList(helpers);
        builder.setAccess(access != null ? new DefinitionAccessImpl(access) : null);
        return builder.build();
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     * @throws QuickFixException
     */
    public ComponentDef makeComponentDef(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location,
            DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor,
            DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces,
            List<EventHandlerDef> eventHandlers,
            DefDescriptor<StyleDef> styleDescriptor,
            DefDescriptor<RendererDef> rendererDescriptor, boolean isAbstract,
            boolean isExtensible) throws QuickFixException {
        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }

        if (eventDefs == null) {
            eventDefs = new HashMap<>();
            eventDefs.put("fakey", makeRegisterEventDef(null, null, false, null));
        }

        if (children == null) {
            children = new ArrayList<>();
            children.add(makeComponentDefRef(getChildComponentDefDescriptor(), null, null));
        }

        if (interfaces == null) {
            interfaces = new HashSet<>();
            interfaces.add(getInterfaceDefDescriptor());
        }

        List<DefDescriptor<ControllerDef>> cd = new ArrayList<>();
        cd.add(controllerDescriptor == null ? getControllerDescriptor() : controllerDescriptor);

        builder.setDescriptor((descriptor == null) ? getComponentDefDescriptor()
                : descriptor);
        addAttributes(builder, attributeDefs);
        builder.events = eventDefs;
        builder.setLocation((location == null) ? getLocation() : location);
        builder.controllerDescriptors = cd;
        builder.modelDefDescriptor = modelDescriptor == null ? getModelDescriptor()
                : modelDescriptor;
        builder.extendsDescriptor = extendsDescriptor == null ? getParentComponentDefDescriptor()
                : extendsDescriptor;
        builder.interfaces = interfaces;
        builder.eventHandlers = eventHandlers;
        //builder.styleDescriptor = styleDescriptor == null ? getStyleDescriptor()
        //        : styleDescriptor;
        builder.addRendererDescriptor(rendererDescriptor == null
                ? definitionService.getDefDescriptor("java://test.renderer", RendererDef.class) : rendererDescriptor);
        builder.isAbstract = isAbstract;
        builder.isExtensible = isExtensible;
        return builder.build();
    }

    public DefDescriptor<ComponentDef> makeComponentDefDescriptor(String tag) {
        return definitionService.getDefDescriptor(tag, ComponentDef.class);
    }

    public ComponentDef makeComponentDefWithNulls(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location,
            DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor,
            DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces,
            List<EventHandlerDef> eventHandlers, boolean isAbstract,
            boolean isExtensible) throws QuickFixException {
        List<DefDescriptor<ControllerDef>> cd = new ArrayList<>();
        if (controllerDescriptor != null) {
            cd.add(controllerDescriptor);
        }
        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();
        builder.setDescriptor(descriptor);
        addAttributes(builder, attributeDefs);
        builder.events = eventDefs;
        builder.setLocation(location);
        builder.controllerDescriptors = cd;
        builder.modelDefDescriptor = modelDescriptor;
        builder.extendsDescriptor = extendsDescriptor;
        builder.interfaces = interfaces;
        builder.eventHandlers = eventHandlers;
        builder.isAbstract = isAbstract;
        builder.isExtensible = isExtensible;
        return builder.build();
    }

    public ComponentDefRef makeComponentDefRef() {
        return makeComponentDefRef(null, null, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public ComponentDefRef makeComponentDefRef(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues,
            Location location) {
        if (attributeValues == null) {
            attributeValues = new HashMap<>();
            attributeValues.put(getAttributeDescriptor(), makeAttributeDefRef(null, null, null));
        }

        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor((descriptor == null) ? getChildComponentDefDescriptor() : descriptor);
        addAttributes(builder, attributeValues);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public ComponentDefRef makeComponentDefRefWithNulls(
            DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues,
            Location location) {
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor(descriptor);
        addAttributes(builder, attributeValues);
        builder.setLocation(location);
        return builder.build();
    }

    public EventDefImpl makeEventDef() {
        return makeEventDef(null, null, null, null, null, Access.INTERNAL);
    }

    public EventDefImpl makeEventDef(DefDescriptor<EventDef> descriptor, DefDescriptor<EventDef> extendsDescriptor) {
        return makeEventDef(descriptor, null, null, null, extendsDescriptor, Access.INTERNAL);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     * @param access TODO
     */
    public EventDefImpl makeEventDef(DefDescriptor<EventDef> descriptor,
            EventType eventType,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
                                     Location location, DefDescriptor<EventDef> extendsDescriptor, Access access) {

        if (attributeDefs == null) {
            attributeDefs = new HashMap<>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }

        EventDefImpl.Builder builder = new EventDefImpl.Builder();
        builder.setDescriptor((descriptor == null) ? getEventDefDescriptor() : descriptor);
        builder.eventType = eventType == null ? defaultEventType : eventType;
        addAttributes(builder, attributeDefs);
        builder.setLocation((location == null) ? getLocation() : location);
        builder.extendsDescriptor = extendsDescriptor == null ? getParentEventDefDescriptor() : extendsDescriptor;
        builder.setAccess(new DefinitionAccessImpl(access));
        return builder.build();
    }

    public EventDefImpl makeEventDefWithNulls(
            DefDescriptor<EventDef> descriptor, EventType eventType,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Location location, DefDescriptor<EventDef> extendsDescriptor) {
        EventDefImpl.Builder builder = new EventDefImpl.Builder();
        builder.setDescriptor(descriptor);
        builder.eventType = eventType;
        addAttributes(builder, attributeDefs);
        builder.setLocation(location);
        builder.extendsDescriptor = extendsDescriptor;
        builder.setAccess(new DefinitionAccessImpl(Access.PUBLIC));
        return builder.build();
    }

    public DefDescriptor<EventDef> makeEventDefDescriptor(String tag) {
        return definitionService.getDefDescriptor(tag, EventDef.class);
    }

    public EventHandlerDef makeEventHandlerDef() {
        return makeEventHandlerDef(null, null, null);
    }

    public EventHandlerDef makeEventHandlerDef(DefDescriptor<EventDef> handledEvent) {
        return makeEventHandlerDef(handledEvent, null, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public EventHandlerDef makeEventHandlerDef(
            DefDescriptor<EventDef> handledEvent, PropertyReference action,
            Location location) {
        EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();
        builder.setLocation(location);
        builder.setDescriptor(handledEvent);
        builder.setAction(action);
        return builder.build();
    }

    public EventHandlerDefImpl makeEventHandlerDefWithNulls(
            DefDescriptor<EventDef> handledEvent, PropertyReference action,
            Location location) {
        EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();
        builder.setLocation(location);
        builder.setDescriptor(handledEvent);
        builder.setAction(action);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        return builder.build();
    }

    public InterfaceDefImpl makeInterfaceDef() {
        return makeInterfaceDef(null, null, null, null, null, AuraContext.Access.INTERNAL);
    }

    public InterfaceDefImpl makeInterfaceDef(DefDescriptor<InterfaceDef> descriptor) {
        return makeInterfaceDef(descriptor, null, null, null, null, AuraContext.Access.INTERNAL);
    }

    public InterfaceDefImpl makeInterfaceDef(Set<DefDescriptor<InterfaceDef>> extendsDescriptors) {
        return makeInterfaceDef(null, null, null, null, extendsDescriptors, AuraContext.Access.INTERNAL);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     * @param access TODO
     */
    public InterfaceDefImpl makeInterfaceDef(
            DefDescriptor<InterfaceDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs, Location location,
            Set<DefDescriptor<InterfaceDef>> extendsDescriptors, Access access) {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }
        addAttributes(builder, attributeDefs);

        builder.events = eventDefs;
        if (builder.events == null) {
            builder.events = new HashMap<>();
            builder.events.put("fakey", makeRegisterEventDef(null, null, false, null));
        }

        builder.extendsDescriptors = extendsDescriptors;
        if (builder.extendsDescriptors == null) {
            builder.extendsDescriptors = new HashSet<>();
            builder.extendsDescriptors.add(getParentInterfaceDefDescriptor());
        }

        builder.setDescriptor((descriptor == null) ? getInterfaceDefDescriptor() : descriptor);
        builder.setLocation((location == null) ? getLocation() : location);
        builder.setAccess(new DefinitionAccessImpl(access));
        return builder.build();
    }

    public InterfaceDefImpl makeInterfaceDefWithNulls(
            DefDescriptor<InterfaceDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs,
            Map<String, RegisterEventDef> eventDefs, Location location,
            Set<DefDescriptor<InterfaceDef>> extendsDescriptors, String provider) {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        builder.setDescriptor(descriptor);
        addAttributes(builder, attributeDefs);
        builder.events = eventDefs;
        builder.setLocation(location);
        builder.extendsDescriptors = extendsDescriptors;
        builder.setAccess(new DefinitionAccessImpl(Access.INTERNAL));
        if (provider != null) {
            builder.addProvider(provider);
        }
        return builder.build();
    }

    public DefDescriptor<InterfaceDef> makeInterfaceDefDescriptor(String tag) {
        return definitionService.getDefDescriptor(tag, InterfaceDef.class);
    }

    public Location makeLocation() {
        return makeLocation(defaultFileName, 5, 5, defaultLastModified);
    }

    public Location makeLocation(String fileName, int line, int column, long lastModified) {
        return new Location(fileName == null ? defaultFileName : fileName, line, column, lastModified);
    }

    public RegisterEventDefImpl makeRegisterEventDef() {
        return makeRegisterEventDef(null, null, false, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public RegisterEventDefImpl makeRegisterEventDef(
            DefDescriptor<? extends RootDefinition> parentDescriptor,
            DefDescriptor<EventDef> eventDescriptor, boolean isGlobal,
            Location location) {
        RegisterEventDefImpl.Builder builder = new RegisterEventDefImpl.Builder();
        builder.setParentDescriptor(parentDescriptor == null ? getComponentDefDescriptor() : parentDescriptor);
        builder.setReference(eventDescriptor == null ? getEventDefDescriptor() : eventDescriptor);
        builder.setDescriptor(definitionService.getDefDescriptor("fakey", RegisterEventDef.class));
        DefinitionAccessImpl access;
        try {
            access = new DefinitionAccessImpl(null, isGlobal ? "global" : "public", false);
        } catch (InvalidAccessValueException e) {
            access = null;
        }
        builder.setAccess(access);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public RegisterEventDefImpl makeRegisterEventDefWithNulls(
            DefDescriptor<? extends RootDefinition> parentDescriptor,
            DefDescriptor<EventDef> eventDescriptor, boolean isGlobal,
            Location location) {
        RegisterEventDefImpl.Builder builder = new RegisterEventDefImpl.Builder();
        builder.setReference(eventDescriptor);
        builder.setParentDescriptor(parentDescriptor);
        builder.setDescriptor(definitionService.getDefDescriptor("fakey", RegisterEventDef.class));
        DefinitionAccessImpl access;
        try {
            access = new DefinitionAccessImpl(null, isGlobal ? "global" : "public", false);
        } catch (InvalidAccessValueException e) {
            access = null;
        }
        builder.setAccess(access);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public TokensDef makeTokensDef(Map<String, String> variables) {
        TokensDefImpl.Builder builder = new TokensDefImpl.Builder();
        for (Entry<String, String> entry : variables.entrySet()) {
            AttributeDefRefImpl value = makeAttributeDefRef(entry.getKey(), entry.getValue(), null);
            AttributeDefImpl attr = makeAttributeDef(entry.getKey(),
                    definitionService.getDefDescriptor("String", TypeDef.class), value, false, null, null);
            builder.addAttributeDef(attr.getDescriptor(), attr);
        }

        return builder.build();
    }

    @SuppressWarnings("unchecked")
    public <T extends BaseComponentDef> DefDescriptor<T> getBaseComponentPrototype( Class<T> defClass) {
        if (ComponentDef.class.equals(defClass)) {
            return (DefDescriptor<T>) ComponentDefImpl.PROTOTYPE_COMPONENT;
        } else if (ApplicationDef.class.equals(defClass)) {
            return (DefDescriptor<T>) ApplicationDefImpl.PROTOTYPE_APPLICATION;
        } else {
            return null;
        }
    }

    public DefDescriptor<HelperDef> getHelperDescriptor() {
        return definitionService.getDefDescriptor("js://aura.html", HelperDef.class);
    }
}
