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
package org.auraframework.impl.test.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.EventType;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.AttributeImpl;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.component.ComponentImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.root.event.EventHandlerDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

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

    public String getAttributeName() {
        return defaultAttributeName;
    }

    public DefDescriptor<AttributeDef> getAttributeDescriptor() {
        return DefDescriptorImpl.getInstance(defaultAttributeName, AttributeDef.class);
    }

    public String getAttributeValue() {
        return defaultAttributeValue;
    }

    public DefDescriptor<ControllerDef> getClientControllerDescriptor() {
        return DefDescriptorImpl.getInstance("javascript://client.controller", ControllerDef.class);
    }

    public DefDescriptor<RendererDef> getRendererDescriptor() {
        return DefDescriptorImpl.getInstance("javascript://client.controller", RendererDef.class);
    }

    public DefDescriptor<ThemeDef> getThemeDescriptor() {
        return DefDescriptorImpl.getInstance("css://test.fakeComponent", ThemeDef.class);
    }

    public DefDescriptor<ApplicationDef> getApplicationDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeApplication", ApplicationDef.class);
    }

    public DefDescriptor<ComponentDef> getComponentDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeComponent", ComponentDef.class);
    }

    public DefDescriptor<ComponentDef> getParentComponentDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeComponentParent", ComponentDef.class);
    }

    public DefDescriptor<ComponentDef> getChildComponentDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakecomponentChild", ComponentDef.class);
    }

    public String getComponentName() {
        return defaultComponentName;
    }

    public DefDescriptor<InterfaceDef> getInterfaceDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeInterface", InterfaceDef.class);
    }

    public DefDescriptor<InterfaceDef> getParentInterfaceDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeParentInterface", InterfaceDef.class);
    }

    public Location getLocation() {
        return new Location("filename1", 5, 5, defaultLastModified);
    }

    public DefDescriptor<TypeDef> getTypeDefDescriptor() {
        return DefDescriptorImpl.getInstance("String", TypeDef.class);
    }

    public TypeDef getTypeDef() {
        return new TypeDef() {

            private static final long serialVersionUID = -245212961854034916L;

            @Override
            public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
            }

            @Override
            public DefDescriptor<TypeDef> getDescriptor() {
                return DefDescriptorImpl.getInstance("String", TypeDef.class);
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
            public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
                return null;
            }

            @Override
            public void retrieveLabels() {

            }

            @Override
            public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) {
            }

            @Override
            public String getDescription() {
                return null;
            }
        };
    }

    public DefDescriptor<EventDef> getEventDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:anevent", EventDef.class);
    }

    public DefDescriptor<EventDef> getParentEventDefDescriptor() {
        return DefDescriptorImpl.getInstance("test:parentEvent", EventDef.class);
    }

    public EventType getEventType() {
        return defaultEventType;
    }

    public DefDescriptor<ControllerDef> getControllerDescriptor() {
        return DefDescriptorImpl.getInstance("java://org.auraframework.impl.java.controller.TestController",
                ControllerDef.class);
    }

    public DefDescriptor<ModelDef> getModelDescriptor() {
        return DefDescriptorImpl.getInstance("java://org.auraframework.impl.model.java.TestModel", ModelDef.class);
    }

    public AttributeImpl makeAttribute(String name) {
        return new AttributeImpl(DefDescriptorImpl.getInstance(name == null ? defaultAttributeName : name,
                AttributeDef.class));
    }

    public AttributeDefImpl makeAttributeDef() {
        return makeAttributeDef(null, null, null, false, null, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public AttributeDefImpl makeAttributeDef(String name, DefDescriptor<TypeDef> typeDefDescriptor,
            AttributeDefRefImpl defaultValue, boolean required, SerializeToType serializeTo, Location location) {
        return new AttributeDefImpl(DefDescriptorImpl.getInstance(name == null ? defaultAttributeName : name,
                AttributeDef.class), null,
                typeDefDescriptor == null ? getTypeDef().getDescriptor() : typeDefDescriptor,
                defaultValue == null ? makeAttributeDefRef(null, null, null) : defaultValue, required,
                serializeTo == null ? AttributeDef.SerializeToType.BOTH : serializeTo, location == null ? getLocation()
                        : location);
    }

    public AttributeDefImpl makeAttributeDefWithNulls(String name,
            DefDescriptor<? extends RootDefinition> parentDescriptor, DefDescriptor<TypeDef> typeDefDescriptor,
            AttributeDefRefImpl defaultValue, boolean required, SerializeToType serializeTo, Location location) {
        return new AttributeDefImpl(DefDescriptorImpl.getInstance(name, AttributeDef.class), parentDescriptor,
                typeDefDescriptor, defaultValue, required, serializeTo, location);
    }

    public DependencyDef makeDependencyDef(DefDescriptor<? extends RootDefinition> parentDescriptor, String resource,
            String type, Location location) {
        DependencyDefImpl.Builder builder;

        builder = new DependencyDefImpl.Builder();
        builder.setParentDescriptor(parentDescriptor);
        builder.setResource(resource);
        builder.setType(type);
        builder.setLocation(location);
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
        atBuilder.setDescriptor(DefDescriptorImpl.getInstance(name == null ? defaultAttributeName : name,
                AttributeDef.class));
        atBuilder.setLocation((location == null) ? getLocation() : location);
        atBuilder.setValue((value == null) ? defaultAttributeValue : value);

        return atBuilder.build();
    }

    public AttributeDefRefImpl makeAttributeDefRefWithNulls(String name, Object value, Location location) {
        AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
        atBuilder.setDescriptor(DefDescriptorImpl.getInstance(name, AttributeDef.class));
        atBuilder.setLocation(location);
        atBuilder.setValue(value);
        return atBuilder.build();
    }

    public ComponentImpl makeComponent(String name, String globalId) throws QuickFixException {
        return new ComponentImpl(DefDescriptorImpl.getInstance(name == null ? defaultComponentName : name,
                ComponentDef.class), null);
    }

    public ComponentDef makeComponentDef() {
        return makeComponentDef(null, null, null, null, null, null, null, null, null, null, null, null, false, false);
    }

    public ComponentDef makeComponentDef(DefDescriptor<ComponentDef> descriptor,
            DefDescriptor<ComponentDef> extendsDescriptor) {
        return makeComponentDef(descriptor, null, null, null, null, null, null, extendsDescriptor, null, null, false,
                false);
    }

    public ComponentDef makeComponentDef(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location, DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor, DefDescriptor<ComponentDef> extendsDescriptor) {

        if (attributeDefs == null) {
            attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }

        if (eventDefs == null) {
            eventDefs = new HashMap<String, RegisterEventDef>();
            eventDefs.put("fakey", makeRegisterEventDef(null, false, null));
        }

        if (children == null) {
            children = new ArrayList<ComponentDefRef>();
            children.add(makeComponentDefRef(getChildComponentDefDescriptor(), null, null));
        }

        return makeComponentDef(descriptor == null ? getComponentDefDescriptor() : descriptor, attributeDefs,
                eventDefs, children, location == null ? getLocation() : location,
                controllerDescriptor == null ? getControllerDescriptor() : controllerDescriptor,
                modelDescriptor == null ? getModelDescriptor() : modelDescriptor,
                extendsDescriptor == null ? getParentComponentDefDescriptor() : extendsDescriptor, null, null, false,
                false);
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
     */
    public ComponentDef makeComponentDef(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location, DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor, DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces, List<EventHandlerDef> eventHandlers, boolean isAbstract,
            boolean isExtensible) {

        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }
        addAttributes(builder, attributeDefs);

        if (eventDefs == null) {
            eventDefs = new HashMap<String, RegisterEventDef>();
            eventDefs.put("fakey", makeRegisterEventDef(null, false, null));
        }
        builder.events = eventDefs;

        if (interfaces == null) {
            interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
            interfaces.add(getInterfaceDefDescriptor());
        }
        builder.interfaces = interfaces;

        List<DefDescriptor<ControllerDef>> cd = new ArrayList<DefDescriptor<ControllerDef>>();
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

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public ComponentDef makeComponentDef(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location, DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor, DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces, List<EventHandlerDef> eventHandlers,
            DefDescriptor<ThemeDef> themeDescriptor, DefDescriptor<RendererDef> rendererDescriptor, boolean isAbstract,
            boolean isExtensible) {

        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }

        if (eventDefs == null) {
            eventDefs = new HashMap<String, RegisterEventDef>();
            eventDefs.put("fakey", makeRegisterEventDef(null, false, null));
        }

        if (children == null) {
            children = new ArrayList<ComponentDefRef>();
            children.add(makeComponentDefRef(getChildComponentDefDescriptor(), null, null));
        }

        if (interfaces == null) {
            interfaces = new HashSet<DefDescriptor<InterfaceDef>>();
            interfaces.add(getInterfaceDefDescriptor());
        }
        /*
         * }
         */
        List<DefDescriptor<ControllerDef>> cd = new ArrayList<DefDescriptor<ControllerDef>>();
        cd.add(controllerDescriptor == null ? getControllerDescriptor() : controllerDescriptor);

        builder.setDescriptor((descriptor == null) ? getComponentDefDescriptor() : descriptor);
        addAttributes(builder, attributeDefs);
        builder.events = eventDefs;
        builder.setLocation((location == null) ? getLocation() : location);
        builder.controllerDescriptors = cd;
        builder.modelDefDescriptor = modelDescriptor == null ? getModelDescriptor() : modelDescriptor;
        builder.extendsDescriptor = extendsDescriptor == null ? getParentComponentDefDescriptor() : extendsDescriptor;
        builder.interfaces = interfaces;
        builder.eventHandlers = eventHandlers;
        builder.themeDescriptor = themeDescriptor == null ? getThemeDescriptor() : themeDescriptor;
        builder.addRenderer(rendererDescriptor == null ? getRendererDescriptor().getQualifiedName()
                : rendererDescriptor.getQualifiedName());
        builder.isAbstract = isAbstract;
        builder.isExtensible = isExtensible;
        return builder.build();
    }

    public DefDescriptor<ComponentDef> makeComponentDefDescriptor(String tag) {
        return DefDescriptorImpl.getInstance(tag, ComponentDef.class);
    }

    public ComponentDef makeComponentDefWithNulls(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            List<ComponentDefRef> children, Location location, DefDescriptor<ControllerDef> controllerDescriptor,
            DefDescriptor<ModelDef> modelDescriptor, DefDescriptor<ComponentDef> extendsDescriptor,
            Set<DefDescriptor<InterfaceDef>> interfaces, List<EventHandlerDef> eventHandlers, boolean isAbstract,
            boolean isExtensible) {
        List<DefDescriptor<ControllerDef>> cd = new ArrayList<DefDescriptor<ControllerDef>>();
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
    public ComponentDefRef makeComponentDefRef(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues, Location location) {
        if (attributeValues == null) {
            attributeValues = new HashMap<DefDescriptor<AttributeDef>, AttributeDefRef>();
            attributeValues.put(getAttributeDescriptor(), makeAttributeDefRef(null, null, null));
        }

        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor((descriptor == null) ? getChildComponentDefDescriptor() : descriptor);
        addAttributes(builder, attributeValues);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public ComponentDefRef makeComponentDefRefWithNulls(DefDescriptor<ComponentDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues, Location location) {
        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor(descriptor);
        addAttributes(builder, attributeValues);
        builder.setLocation(location);
        return builder.build();
    }

    public EventDefImpl makeEventDef() {
        return makeEventDef(null, null, null, null, null);
    }

    public EventDefImpl makeEventDef(DefDescriptor<EventDef> descriptor, DefDescriptor<EventDef> extendsDescriptor) {
        return makeEventDef(descriptor, null, null, null, extendsDescriptor);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public EventDefImpl makeEventDef(DefDescriptor<EventDef> descriptor, EventType eventType,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Location location,
            DefDescriptor<EventDef> extendsDescriptor) {

        if (attributeDefs == null) {
            attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }

        EventDefImpl.Builder builder = new EventDefImpl.Builder();
        builder.setDescriptor((descriptor == null) ? getEventDefDescriptor() : descriptor);
        builder.eventType = eventType == null ? defaultEventType : eventType;
        addAttributes(builder, attributeDefs);
        builder.setLocation((location == null) ? getLocation() : location);
        builder.extendsDescriptor = extendsDescriptor == null ? getParentEventDefDescriptor() : extendsDescriptor;
        return builder.build();
    }

    public EventDefImpl makeEventDefWithNulls(DefDescriptor<EventDef> descriptor, EventType eventType,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Location location,
            DefDescriptor<EventDef> extendsDescriptor) {
        EventDefImpl.Builder builder = new EventDefImpl.Builder();
        builder.setDescriptor(descriptor);
        builder.eventType = eventType;
        addAttributes(builder, attributeDefs);
        builder.setLocation(location);
        builder.extendsDescriptor = extendsDescriptor;
        return builder.build();
    }

    public DefDescriptor<EventDef> makeEventDefDescriptor(String tag) {
        return DefDescriptorImpl.getInstance(tag, EventDef.class);
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
    public EventHandlerDef makeEventHandlerDef(DefDescriptor<EventDef> handledEvent, PropertyReference action,
            Location location) {
        EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();
        builder.setLocation(location);
        builder.setDescriptor(handledEvent);
        builder.setAction(action);
        return builder.build();
    }

    public EventHandlerDefImpl makeEventHandlerDefWithNulls(DefDescriptor<EventDef> handledEvent,
            PropertyReference action, Location location) {
        EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();
        builder.setLocation(location);
        builder.setDescriptor(handledEvent);
        builder.setAction(action);
        return builder.build();
    }

    public InterfaceDefImpl makeInterfaceDef() {
        return makeInterfaceDef(null, null, null, null, null);
    }

    public InterfaceDefImpl makeInterfaceDef(DefDescriptor<InterfaceDef> descriptor) {
        return makeInterfaceDef(descriptor, null, null, null, null);
    }

    public InterfaceDefImpl makeInterfaceDef(Set<DefDescriptor<InterfaceDef>> extendsDescriptors) {
        return makeInterfaceDef(null, null, null, null, extendsDescriptors);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public InterfaceDefImpl makeInterfaceDef(DefDescriptor<InterfaceDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            Location location, Set<DefDescriptor<InterfaceDef>> extendsDescriptors) {

        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();

        if (attributeDefs == null) {
            attributeDefs = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
            attributeDefs.put(getAttributeDescriptor(), makeAttributeDef(null, null, null, false, null, null));
        }
        addAttributes(builder, attributeDefs);

        builder.events = eventDefs;
        if (builder.events == null) {
            builder.events = new HashMap<String, RegisterEventDef>();
            builder.events.put("fakey", makeRegisterEventDef(null, false, null));
        }

        builder.extendsDescriptors = extendsDescriptors;
        if (builder.extendsDescriptors == null) {
            builder.extendsDescriptors = new HashSet<DefDescriptor<InterfaceDef>>();
            builder.extendsDescriptors.add(getParentInterfaceDefDescriptor());
        }

        builder.setDescriptor((descriptor == null) ? getInterfaceDefDescriptor() : descriptor);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public InterfaceDefImpl makeInterfaceDefWithNulls(DefDescriptor<InterfaceDef> descriptor,
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs, Map<String, RegisterEventDef> eventDefs,
            Location location, Set<DefDescriptor<InterfaceDef>> extendsDescriptors, String provider) {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        builder.setDescriptor(descriptor);
        addAttributes(builder, attributeDefs);
        builder.events = eventDefs;
        builder.setLocation(location);
        builder.extendsDescriptors = extendsDescriptors;
        if (provider != null) {
            builder.addProvider(provider);
        }
        return builder.build();
    }

    public DefDescriptor<InterfaceDef> makeInterfaceDefDescriptor(String tag) {
        return DefDescriptorImpl.getInstance(tag, InterfaceDef.class);
    }

    public Location makeLocation() {
        return makeLocation(defaultFileName, 5, 5, defaultLastModified);
    }

    public Location makeLocation(String fileName, int line, int column, long lastModified) {
        return new Location(fileName == null ? defaultFileName : fileName, line, column, lastModified);
    }

    public RegisterEventDefImpl makeRegisterEventDef() {
        return makeRegisterEventDef(null, false, null);
    }

    /**
     * A null parameter indicates you don't care what the value is, and thus it
     * replaces the parameter with a default object. If you want null values for
     * the parameter, you have to call the objects constructor directly.
     */
    public RegisterEventDefImpl makeRegisterEventDef(DefDescriptor<EventDef> eventDescriptor, boolean isGlobal,
            Location location) {
        RegisterEventDefImpl.Builder builder = new RegisterEventDefImpl.Builder();
        builder.setDescriptor(eventDescriptor == null ? getEventDefDescriptor() : eventDescriptor);
        builder.setAttName("fakey");
        builder.setIsGlobal(isGlobal);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

    public RegisterEventDefImpl makeRegisterEventDefWithNulls(DefDescriptor<EventDef> eventDescriptor,
            boolean isGlobal, Location location) {

        RegisterEventDefImpl.Builder builder = new RegisterEventDefImpl.Builder();
        builder.setDescriptor(eventDescriptor);
        builder.setAttName("fakey");
        builder.setIsGlobal(isGlobal);
        builder.setLocation((location == null) ? getLocation() : location);
        return builder.build();
    }

}
