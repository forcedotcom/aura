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
package org.auraframework.components.auradocs;

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

/**
 * @since 0.0.196
 */
@Model
public class DefOverviewModel {

    private final DefDescriptor<?> descriptor;
    private final Definition definition;
    private final List<AttributeModel> attributes = Lists.newArrayList();
    private final List<AttributeModel> handledEvents = Lists.newArrayList();
    private final List<AttributeModel> events = Lists.newArrayList();
    private final String support;
    private final String theSuper;
    private final String type;
    private final boolean isExtensible;
    private final boolean isAbstract;
    private final List<String> interfaces = Lists.newArrayList();

    public DefOverviewModel() throws QuickFixException {

        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");

        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());
        descriptor = Aura.getDefinitionService().getDefDescriptor(desc, defType.getPrimaryInterface());
        definition = descriptor.getDef();
        String type = null;

        if (definition instanceof RootDefinition) {
            RootDefinition rootDef = (RootDefinition) definition;
            for (AttributeDef attribute : rootDef.getAttributeDefs().values()) {
                attributes.add(new AttributeModel(attribute));
            }
            if (definition instanceof BaseComponentDef) {
                BaseComponentDef cmpDef = (BaseComponentDef) definition;
                for (RegisterEventDef reg : cmpDef.getRegisterEventDefs().values()) {
                    events.add(new AttributeModel(reg));
                }
                for (EventHandlerDef handler : cmpDef.getHandlerDefs()) {
                    handledEvents.add(new AttributeModel(handler));
                }
                for (DefDescriptor<InterfaceDef> intf : cmpDef.getInterfaces()) {
                    interfaces.add(intf.getNamespace() + ":" + intf.getName());
                }
                DefDescriptor<?> superDesc = cmpDef.getExtendsDescriptor();
                if (superDesc != null) {
                    theSuper = superDesc.getNamespace() + ":" + superDesc.getName();
                } else {
                    theSuper = null;
                }
                isAbstract = cmpDef.isAbstract();
                isExtensible = cmpDef.isExtensible();

            } else if (definition instanceof EventDef) {
                EventDef eventDef = (EventDef) definition;
                DefDescriptor<?> superDesc = eventDef.getExtendsDescriptor();
                if (superDesc != null) {
                    theSuper = superDesc.getNamespace() + ":" + superDesc.getName();
                } else {
                    theSuper = null;
                }

                type = eventDef.getEventType().name();
                isExtensible = true;
                isAbstract = false;
            } else {
                theSuper = null;
                isExtensible = true;
                isAbstract = false;
            }
            support = rootDef.getSupport().name();
        } else {
            support = null;
            theSuper = null;
            isExtensible = false;
            isAbstract = false;
        }
        this.type = type;
    }

    @AuraEnabled
    public DefDescriptor<?> getDescriptor() {
        return descriptor;
    }

    @AuraEnabled
    public String getNamespace() {
        return descriptor.getNamespace();
    }

    @AuraEnabled
    public String getName() {
        return descriptor.getName();
    }

    @AuraEnabled
    public String getType() {
        return type;
    }

    @AuraEnabled
    public List<String> getInterfaces() {
        return this.interfaces;
    }

    @AuraEnabled
    public String getDefType() {
        return descriptor.getDefType().name().toLowerCase();
    }

    @AuraEnabled
    public String getDescription() {
        return definition.getDescription();
    }

    @AuraEnabled
    public List<AttributeModel> getAttributes() {
        return attributes;
    }

    @AuraEnabled
    public String getSuper() {
        return theSuper;
    }

    @AuraEnabled
    public List<AttributeModel> getHandledEvents() {
        return handledEvents;
    }

    @AuraEnabled
    public List<AttributeModel> getEvents() {
        return events;
    }

    @AuraEnabled
    public String getSupport() {
        return support;
    }

    @AuraEnabled
    public boolean isExtensible() {
        return isExtensible;
    }

    @AuraEnabled
    public boolean isAbstract() {
        return isAbstract;
    }

    public class AttributeModel implements JsonSerializable {

        private final String name;
        private final String description;
        private final String type;
        private final boolean required;
        private final String defaultValue;
        private final String parentName;
        private final String parentDefType;

        private AttributeModel(AttributeDef def) throws QuickFixException {
            this.name = def.getName();
            this.description = def.getDescription();
            this.type = def.getTypeDef().getName();
            this.required = def.isRequired();
            if (def.getDefaultValue() != null) {
                this.defaultValue = def.getDefaultValue().getValue().toString();
            } else {
                this.defaultValue = null;
            }
            DefDescriptor<?> parentDesc = def.getParentDescriptor();
            if (parentDesc == null || parentDesc.equals(DefOverviewModel.this.descriptor)) {
                this.parentName = null;
                this.parentDefType = null;
            } else {
                this.parentName = parentDesc.getNamespace() + ":" + parentDesc.getName();
                this.parentDefType = parentDesc.getDefType().name();
            }
        }

        private AttributeModel(RegisterEventDef def) throws QuickFixException {
            this.name = def.getAttributeName();
            this.description = def.getDescription();
            this.type = def.getDescriptor().getNamespace() + ":" + def.getDescriptor().getName();
            this.required = false;
            this.defaultValue = null;
            this.parentName = null;
            this.parentDefType = null;
        }

        private AttributeModel(EventHandlerDef def) throws QuickFixException {
            this.description = def.getDescription();
            if (def.getDescriptor() != null) {
                this.type = def.getDescriptor().getNamespace() + ":" + def.getDescriptor().getName();
            } else {
                this.type = null;
            }
            this.required = false;
            this.defaultValue = null;
            this.name = null;
            this.parentName = null;
            this.parentDefType = null;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("name", name);
            json.writeMapEntry("description", description);
            json.writeMapEntry("type", type);
            json.writeMapEntry("required", required);
            json.writeMapEntry("defaultValue", defaultValue);
            json.writeMapEntry("parentName", parentName);
            json.writeMapEntry("parentDefType", parentDefType);
            json.writeMapEnd();
        }

        @AuraEnabled
        public String getName() {
            return name;
        }

        @AuraEnabled
        public String getDescription() {
            return description;
        }

        @AuraEnabled
        public String getType() {
            return type;
        }

        @AuraEnabled
        public boolean isRequired() {
            return required;
        }

        @AuraEnabled
        public String getDefaultValue() {
            return defaultValue;
        }

        @AuraEnabled
        public String getParentName() {
            return parentName;
        }

        @AuraEnabled
        public String getParentDefType() {
            return parentDefType;
        }
    }
}
