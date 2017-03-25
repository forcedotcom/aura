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

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;
import org.auraframework.Aura;
import org.auraframework.builder.design.DesignDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
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
import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.def.genericxml.GenericXmlValidator;
import org.auraframework.impl.root.GenericXmlElementImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import javax.annotation.Nonnull;
import javax.xml.stream.XMLStreamException;

import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {
    private static final long serialVersionUID = -8621907027705407577L;
    private final Map<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> attributeDesignDefs;
    private final Map<String, DesignLayoutDef> layoutDesignDefs;
    private final DesignTemplateDef template;
    private final Multimap<String, DesignOptionDef> options;
    private final String label;
    private final Multimap<Class<? extends GenericXmlValidator>, GenericXmlElement> tags;


    protected DesignDefImpl(Builder builder) {
        super(builder);
        this.attributeDesignDefs = AuraUtil.immutableMap(builder.attributeDesignMap);
        this.layoutDesignDefs = AuraUtil.immutableMap(builder.layoutDesignMap);
        this.tags = builder.tags;
        this.label = builder.label;
        this.template = builder.template;

        ImmutableMultimap.Builder<String, DesignOptionDef> optionsBuilder = ImmutableMultimap.builder();
        for (GenericXmlElement option : tags.get(DesignOptionsValidator.class)) {
            optionsBuilder.put(option.getAttribute(DesignOptionDef.NAME), new DesignOptionDefImpl(option));
        }

        this.options = optionsBuilder.build();

    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        DefinitionService definitionService = Aura.getDefinitionService();
        // I'm guessing that this should be in validateDefinition
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
                                descriptor = definitionService.getDefDescriptor(name, DesignAttributeDef.class);
                                if (!attributeDesignDefs.containsKey(descriptor)) {
                                    throw new DefinitionNotFoundException(descriptor, getLocation());
                                }
                            } else {
                                if (!definitionService.exists(item.getComponent().getComponentDef())) {
                                    throw new DefinitionNotFoundException(item.getComponent().getComponentDef(),
                                            getLocation());
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

        for (GenericXmlElement element : tags.values()) {
            element.validateDefinition();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor(this.descriptor.getQualifiedName(),
                ComponentDef.class);
        dependencies.add(cmpDesc);

        if (template != null) {
            template.appendDependencies(dependencies);
        }
        for (DesignAttributeDef attributeDef : attributeDesignDefs.values()) {
            attributeDef.appendDependencies(dependencies);
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
        return getAttributeDesignDefs().get(Aura.getDefinitionService().getDefDescriptor(name, DesignAttributeDef.class));
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
        return ImmutableList.copyOf(options.get(key));
    }

    @Override
    public String getLabel() {
        return label;
    }

    @Override
    public DesignTemplateDef getDesignTemplateDef() {
        return template;
    }

    @Nonnull
    @Override
    public Set<GenericXmlElement> getGenericTags() {
        return ImmutableSet.copyOf(tags.values());
    }

    @Nonnull
    @Override
    public Set<GenericXmlElement> getGenericTags(Class<? extends GenericXmlValidator> validatorClass) {
        return ImmutableSet.copyOf(tags.get(validatorClass));
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Collections.emptyList();
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends RootDefinitionImpl.Builder<DesignDef> implements DesignDefBuilder {
        private final LinkedHashMap<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> attributeDesignMap = new LinkedHashMap<>();
        private final LinkedHashMap<String, DesignLayoutDef> layoutDesignMap = Maps.newLinkedHashMap();
        private DesignTemplateDef template;
        private String label;
        private Multimap<Class<? extends GenericXmlValidator>, GenericXmlElement> tags = HashMultimap.create();

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

        public DesignTemplateDef getDesignTemplateDef() {
            return template;
        }

        public DesignDefBuilder addGenericElement(GenericXmlElementImpl tag) {
            if (this.tags.containsEntry(tag.getValidatorClass(), tag)) {
                setParseError(new InvalidDefinitionException(
                        String.format("Element <%s> already exists", tag.getName()), getLocation()));
            } else {
                this.tags.put(tag.getValidatorClass(), tag);
            }
            return this;
        }
    }
}
