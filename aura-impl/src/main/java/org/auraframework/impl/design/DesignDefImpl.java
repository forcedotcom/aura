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
package org.auraframework.impl.design;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamException;

import org.auraframework.Aura;
import org.auraframework.builder.design.DesignDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.def.design.DesignLayoutDef;
import org.auraframework.def.design.DesignLayoutItemDef;
import org.auraframework.def.design.DesignOptionDef;
import org.auraframework.def.design.DesignSectionDef;
import org.auraframework.def.design.DesignTemplateDef;
import org.auraframework.def.design.DesignTemplateRegionDef;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {
    private static final long serialVersionUID = -8621907027705407577L;
    private final Map<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> attributeDesignDefs;
    private final Map<String, DesignLayoutDef> layoutDesignDefs;
    private final DesignTemplateDef template;
    private final Map<String, List<DesignOptionDef>> options;
    private final String label;


    protected DesignDefImpl(Builder builder) {
        super(builder);
        this.attributeDesignDefs = AuraUtil.immutableMap(builder.attributeDesignMap);
        this.layoutDesignDefs = AuraUtil.immutableMap(builder.layoutDesignMap);
        this.options = AuraUtil.immutableMap(builder.options);
        this.label = builder.label;
        this.template = builder.template;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        // Validate that any referenced interfaces exist as accessible definitions.
        // If the definition does not exist or isn't accessible, the template definition
        // will be considered invalid.
        if (template != null) {
            Map<DefDescriptor<DesignTemplateRegionDef>, DesignTemplateRegionDef> regions = template
                    .getDesignTemplateRegionDefs();
            MasterDefRegistry registry = Aura.getDefinitionService().getDefRegistry();
            for (DesignTemplateRegionDef region : regions.values()) {
                Set<DefDescriptor<InterfaceDef>> allowedInterfaces = region.getAllowedInterfaces();
                if (allowedInterfaces == null || allowedInterfaces.isEmpty()) {
                    continue;
                }
                for (DefDescriptor<InterfaceDef> intf : allowedInterfaces) {
                    InterfaceDef interfaze = intf.getDef();
                    if (interfaze == null) {
                        throw new DefinitionNotFoundException(intf, getLocation());
                    }
                    registry.assertAccess(descriptor, interfaze);
                }
            }
        }

        if (layoutDesignDefs != null) {
            //Ensure that only one item with the same name is defined in a layout.
            for (DesignLayoutDef layout : layoutDesignDefs.values()) {
                Set<String> items = Sets.newHashSet();
                for (DesignSectionDef section : layout.getSections()) {
                    for (DesignItemsDef itemsdef : section.getItems()) {
                        for (DesignLayoutItemDef item : itemsdef.getItems()) {
                            DefDescriptor<DesignAttributeDef> descriptor;
                            if (item.isAttribute()) {
                                String name = item.getAttribute().getName();
                                if (!items.add(name)) {
                                    throw new InvalidDefinitionException(String.format("Item %s defined multiple times", name), getLocation());
                                }
                                descriptor = Aura.getDefinitionService()
                                        .getDefDescriptor(name, DesignAttributeDef.class);
                                if (!attributeDesignDefs.containsKey(descriptor)) {
                                    throw new DefinitionNotFoundException(descriptor, getLocation());
                                }
                            }
                        }
                    }
                }
            }
        }

        for (DesignAttributeDef attr : attributeDesignDefs.values()) {
            attr.validateReferences();
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        for (DesignAttributeDef attr : getAttributeDesignDefs().values()) {
            attr.validateDefinition();
        }

        for (DesignLayoutDef layout : layoutDesignDefs.values()) {
            layout.validateDefinition();
        }

        if (template != null) {
            template.validateDefinition();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        DefDescriptor<ComponentDef> cmpDesc = DefDescriptorImpl.getInstance(this.descriptor.getQualifiedName(),
                ComponentDef.class);
        dependencies.add(cmpDesc);

        if (template != null) {
            template.appendDependencies(dependencies);
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain RegisterEventDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain AttributeDefs.");
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("DesignDef cannot contain RequiredVersionDefs.");
    }

    @Override
    public Map<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> getAttributeDesignDefs() {
        return attributeDesignDefs;
    }

    @Override
    public DesignAttributeDef getAttributeDesignDef(String name) {
        return getAttributeDesignDefs().get(DefDescriptorImpl.getInstance(name, DesignAttributeDef.class));
    }

    @Override
    public Map<String, DesignLayoutDef> getDesignLayoutDefs() {
        return layoutDesignDefs;
    }

    @Override
    public DesignLayoutDef getDefaultDesignLayoutDef() {
        return layoutDesignDefs.get("");
    }

    @Override
    public List<DesignOptionDef> getOption(String key) {
        return options.get(key);
    }

    @Override
    public String getLabel() {
        return label;
    }

    @Override
    public DesignTemplateDef getDesignTemplateDef() {
        return template;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends RootDefinitionImpl.Builder<DesignDef> implements DesignDefBuilder {
        private final LinkedHashMap<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> attributeDesignMap = new LinkedHashMap<>();
        private final LinkedHashMap<String, DesignLayoutDef> layoutDesignMap = Maps.newLinkedHashMap();
        private DesignTemplateDef template;
        private Map<String, List<DesignOptionDef>> options = Maps.newHashMap();
        private String label;

        public Builder() {
            super(DesignDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DesignDefImpl build() {
            return new DesignDefImpl(this);
        }

        @Override
        public DesignDefBuilder addAttributeDesign(DefDescriptor<DesignAttributeDef> desc,
                DesignAttributeDef attributeDesign) {
            if (attributeDesignMap.containsKey(desc)) {
                setParseError(new InvalidDefinitionException(String.format(
                        "Design attribute %s already defined", attributeDesign.getName()), getLocation()));
            } else {
                this.attributeDesignMap.put(desc, attributeDesign);
            }
            return this;
        }

        @Override
        public DesignDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }

        @Override
        public DesignDefBuilder setDesignTemplateDef(DesignTemplateDef template) {
            this.template = template;
            return this;
        }

        @Override
        public DesignDefBuilder addLayoutDesign(String desc, DesignLayoutDef layoutDesign) {
            if (layoutDesignMap.containsKey(desc)) {
                setParseError(new XMLStreamException(
                        String.format("Layout with name %s already defined", layoutDesign.getName())));
            }
            layoutDesignMap.put(desc, layoutDesign);
            return this;
        }

        @Override
        public DesignDefBuilder addOption(DesignOptionDef value) {
            String key = value.getKey();
            if (options.containsKey(key)) {
                options.get(key).add(value);
            } else {
                List<DesignOptionDef> option = Lists.newArrayList();
                option.add(value);
                options.put(key, option);
            }

            return this;
        }

        public DesignTemplateDef getDesignTemplateDef() {
            return template;
        }
    }
}
