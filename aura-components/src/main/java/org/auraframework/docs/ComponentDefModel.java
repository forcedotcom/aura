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
package org.auraframework.docs;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

/**
 * @since 0.0.196
 */
@ServiceComponentModelInstance
public class ComponentDefModel implements ModelInstance {

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
    private final List<DefModel> defs = Lists.newArrayList();
    private final List<IncludeDefModel> includeDefs = Lists.newArrayList();
    private final DocumentationDefModel doc;
    private final boolean showSource;
    private final DefinitionService definitionService;
    private final ConfigAdapter configAdapter;
    
    public ComponentDefModel(ContextService contextService, DefinitionService definitionService, ConfigAdapter configAdapter) throws QuickFixException {
    	this.definitionService = definitionService;
    	this.configAdapter = configAdapter;
    	
        AuraContext context = contextService.getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");

        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());
        descriptor = definitionService.getDefDescriptor(desc, defType.getPrimaryInterface());
        definition = definitionService.getDefinition(descriptor);

        assertAccess(definition);

        // Show source tab if there is no default namespace (e.g. running raw open source) or if the target and source namespace are the same
        String defaultNamespace = configAdapter.getDefaultNamespace();
        showSource = defaultNamespace == null || getReferencingDescriptor().getNamespace().equalsIgnoreCase(definition.getDescriptor().getNamespace());

        String type = null;
        if (definition instanceof RootDefinition) {
            RootDefinition rootDef = (RootDefinition) definition;
            for (AttributeDef attribute : rootDef.getAttributeDefs().values()) {
                if (hasAccess(attribute)) {
                    attributes.add(new AttributeModel(attribute));
                }
            }

            DocumentationDef docDef = rootDef.getDocumentationDef();
            doc = docDef != null ? new DocumentationDefModel(docDef) : null;

            if (definition instanceof BaseComponentDef) {
                BaseComponentDef cmpDef = (BaseComponentDef) definition;
                for (RegisterEventDef reg : cmpDef.getRegisterEventDefs().values()) {
                    if (hasAccess(reg)) {
                        events.add(new AttributeModel(reg));
                    }
                }

                for (EventHandlerDef handler : cmpDef.getHandlerDefs()) {
                    handledEvents.add(new AttributeModel(handler));
                }

                for (DefDescriptor<InterfaceDef> intf : cmpDef.getInterfaces()) {
                    if (hasAccess(definitionService.getDefinition(intf))) {
                        interfaces.add(intf.getNamespace() + ":" + intf.getName());
                    }
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
            } else if (definition instanceof LibraryDef) {
                theSuper = null;
                isExtensible = false;
                isAbstract = false;
            } else {
                theSuper = null;
                isExtensible = true;
                isAbstract = false;
            }

            support = rootDef.getSupport().name();

            if (definition instanceof RootDefinition) {
                Map<DefDescriptor<?>,Definition> bundled = ((RootDefinition) definition).getBundledDefs();
                List<DefDescriptor<?>> deps = ((RootDefinition) definition).getBundle();

                for (DefDescriptor<?> dep : deps) {
                    // we already surface the documentation--users don't need to see the source for it.
                    if (dep.getDefType() != DefType.DOCUMENTATION && !bundled.containsKey(dep)) {
                        Definition def = definitionService.getDefinition(dep);
                        if (hasAccess(def)) {
                            defs.add(new DefModel(dep));
                        }
                    }
                }
                for (Definition def : ((RootDefinition) definition).getBundledDefs().values()) {
                    if (def.getDescriptor().getDefType() != DefType.DOCUMENTATION && hasAccess(def)) {
                        defs.add(new DefModel(def.getDescriptor()));
                    }
                }
            }

            // Add all imported libraries AND their source to the documentation.
            if (definition instanceof ComponentDef) {
                Collection<LibraryDefRef> importDefs = ((ComponentDef) definition).getImports();

                for (LibraryDefRef importDef : importDefs) {
                    LibraryDef libraryDef = definitionService.getDefinition(importDef.getReferenceDescriptor());
                    if (definitionService.hasAccess(getReferencingDescriptor(), importDef)) {
                        defs.add(new DefModel(libraryDef.getDescriptor()));

                        // Treat the included js files specially because they load source differently:
                        for (IncludeDefRef includeDef : libraryDef.getIncludes()) {
                            includeDefs.add(new IncludeDefModel(includeDef.getDescriptor()));
                        }
                    }
                }
            }
        } else {
            support = null;
            theSuper = null;
            isExtensible = false;
            isAbstract = false;
            doc = null;
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

    @AuraEnabled
    public List<DefModel> getDefs() {
        return defs;
    }

    @AuraEnabled
    public List<IncludeDefModel> getIncludeDefs() {
        return includeDefs;
    }

    @AuraEnabled
    public DocumentationDefModel getDocumentation() {
        return doc;
    }

    @AuraEnabled
    public boolean getShowSource() {
        return showSource;
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
            this.type = def.getTypeDef().getName().toLowerCase();
            this.required = def.isRequired();
            if (def.getDefaultValue() != null) {
                this.defaultValue = def.getDefaultValue().getValue().toString();
            } else {
                this.defaultValue = null;
            }
            DefDescriptor<?> parentDesc = def.getParentDescriptor();
            if (parentDesc == null || parentDesc.equals(ComponentDefModel.this.descriptor)) {
                this.parentName = null;
                this.parentDefType = null;
            } else {
                this.parentName = parentDesc.getNamespace() + ":" + parentDesc.getName();
                this.parentDefType = parentDesc.getDefType().name().toLowerCase();
            }
        }

        private AttributeModel(RegisterEventDef def) throws QuickFixException {
            this.name = def.getDescriptor().getName();
            this.description = def.getDescription();
            this.type = def.getReference().getNamespace() + ":" + def.getReference().getName();
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

    private DefDescriptor<ApplicationDef> getReferencingDescriptor() {
        String defaultNamespace = configAdapter.getDefaultNamespace();
        if (defaultNamespace == null) {
            defaultNamespace = "aura";
        }

        return definitionService.getDefDescriptor(String.format("%s:application", defaultNamespace),
                ApplicationDef.class);
    }
	
    public boolean hasAccess(Definition def) throws QuickFixException {
        return definitionService.hasAccess(getReferencingDescriptor(), def);
    }

    public void assertAccess(Definition def) throws QuickFixException {
        definitionService.assertAccess(getReferencingDescriptor(), def);
    }

    public boolean isRunningInPrivilegedNamespace() {
        String ns = configAdapter.getDefaultNamespace();
        return ns != null ? configAdapter.isPrivilegedNamespace(ns) : true;
    }
}
