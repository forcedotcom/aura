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

import com.google.common.collect.Sets;
import org.auraframework.Aura;
import org.auraframework.builder.design.DesignAttributeDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignAttributeDefaultDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.Set;

public class DesignAttributeDefImpl extends DefinitionImpl<DesignAttributeDef> implements DesignAttributeDef {
    private static final Set<String> VALID_DESIGN_ATTRIBUTE_TYPES = Sets.newHashSet("string", "integer", "boolean");
    private static final Set<String> VALID_DESIGN_ATTRIBUTE_TYPES_FOR_FACET = Sets.newHashSet("object[]", "aura.component[]");
    private static final Set<String> VALID_DATASOURCE_ATTRIBUTE_TYPES = Sets.newHashSet("string");
    private static final long serialVersionUID = 3290806856269872853L;

    private final boolean isInInternalNamespace;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;

    private final Boolean required;
    private final Boolean readonly;
    private final String name;
    private final String type;
    private final String dependency;
    private final String datasource;
    private final String min;
    private final String max;
    private final String label;
    private final String placeholder;
    private final String description;
    private final String defaultValue;
    //Privileged
    private final String minApi;
    private final String maxApi;
    private final boolean translatable;
    private final DesignAttributeDefaultDef defaultFacet;


    protected DesignAttributeDefImpl(Builder builder) {
        super(builder);
        this.required = builder.required;
        this.readonly = builder.readonly;
        this.name = builder.name;
        this.type = builder.type;
        this.dependency = builder.dependency;
        this.datasource = builder.datasource;
        this.min = builder.min;
        this.max = builder.max;
        this.label = builder.label;
        this.placeholder = builder.placeholder;
        this.description = builder.description;
        this.defaultValue = builder.defaultValue;
        this.minApi = builder.minApi;
        this.maxApi = builder.maxApi;
        this.translatable = builder.translatable;
        this.defaultFacet = builder.defaultFacet;
        this.isInInternalNamespace = builder.isInInternalNamespace;
        this.parentDescriptor = builder.parentDescriptor;
    }

    @Override
    public boolean isRequired() {
        return required;
    }

    @Override
    public boolean isReadOnly() {
        return readonly;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public String getDependsOn() {
        return dependency;
    }

    @Override
    public String getDataSource() {
        return datasource;
    }

    @Override
    public String getMin() {
        return min;
    }

    @Override
    public String getMax() {
        return max;
    }

    @Override
    public String getLabel() {
        return label;
    }

    @Override
    public String getPlaceholderText() {
        return placeholder;
    }

    @Override
    public String getDefaultValue() {
        return defaultValue;
    }

    @Override
    public DesignAttributeDefaultDef getAttributeDefault() {
        return defaultFacet;
    }

    @Override
    public String getMinApi() {
        return minApi;
    }

    @Override
    public String getMaxApi() {
        return maxApi;
    }

    @Override
    public boolean isTranslatable() {
        return translatable;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        DefinitionService definitionService = Aura.getDefinitionService();
        ComponentDef cmp = definitionService.getDefinition(getParentDescriptor().getQualifiedName(),ComponentDef.class);
        AttributeDef attr = cmp.getAttributeDef(getName());
        if (attr == null || !attr.getName().equals(getName())) {
        	throw new InvalidDefinitionException("The design file contains attribute '"+getName()+"' but the component doesn't.", getLocation());
        }
        if(!isInInternalNamespace && getDataSource() != null){
            if(!VALID_DATASOURCE_ATTRIBUTE_TYPES.contains(
                    attr.getTypeDef().getDescriptor().getDescriptorName().toLowerCase())){
                throw new InvalidDefinitionException("Only String attributes may have a datasource in the design file.", getLocation());
            }

        } else if(!isInInternalNamespace && !VALID_DESIGN_ATTRIBUTE_TYPES.contains(
                attr.getTypeDef().getDescriptor().getDescriptorName().toLowerCase())){
            throw new InvalidDefinitionException("Only Boolean, Integer or String attributes may be exposed in design files.", getLocation());
        }

        if (getAttributeDefault() != null &&
                !VALID_DESIGN_ATTRIBUTE_TYPES_FOR_FACET.contains(attr.getTypeDef().getDescriptor().getDescriptorName().toLowerCase())) {
            throw new InvalidDefinitionException("Only attributes of type Object[] or Aura.Component[] may have default blocks", getLocation());
        }

        if (defaultFacet != null && defaultValue != null) {
            throw new InvalidDefinitionException("Design attribute can not contain a default attribute and a default tag.",
                    getLocation());
        }
        if (defaultFacet != null) {
            defaultFacet.validateReferences();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (defaultFacet != null) {
            defaultFacet.appendDependencies(dependencies);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignAttributeDef> implements
            DesignAttributeDefBuilder {
        private boolean required;
        private boolean readonly;
        private String name;
        private String label;
        private String type;
        private String dependency;
        private String datasource;
        private String min;
        private String max;
        private String placeholder;
        private String defaultValue;
        private String minApi;
        private String maxApi;
        private boolean translatable;
        private DesignAttributeDefaultDef defaultFacet;
        private boolean isInInternalNamespace;
        private DefDescriptor<? extends RootDefinition> parentDescriptor;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        public Builder() {
            super(DesignAttributeDef.class);
        }

        @Override
        public DesignAttributeDef build() throws QuickFixException {
            return new DesignAttributeDefImpl(this);
        }

        @Override
        public DesignAttributeDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setType(String type) {
            this.type = type;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setRequired(boolean required) {
            this.required = required;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setReadOnly(boolean readonly) {
            this.readonly = readonly;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setDependsOn(String dependency) {
            this.dependency = dependency;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setDataSource(String datasource) {
            this.datasource = datasource;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setMin(String min) {
            this.min = min;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setMax(String max) {
            this.max = max;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setPlaceholderText(String placeholder) {
            this.placeholder = placeholder;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setDefault(String defaultValue) {
            this.defaultValue = defaultValue;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setDefault(DesignAttributeDefaultDef defaultValue) {
            this.defaultFacet = defaultValue;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setMinApi(String minApi) {
            this.minApi = minApi;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setMaxApi(String maxApi) {
            this.maxApi = maxApi;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setTranslatable(boolean translatable) {
            this.translatable = translatable;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setParentDescriptor(DefDescriptor<? extends RootDefinition> parent) {
            this.parentDescriptor = parent;
            return this;
        }

        @Override
        public DesignAttributeDefBuilder setIsInternalNamespace(boolean internalNamespace) {
            this.isInInternalNamespace = internalNamespace;
            return this;
        }
    }
}
