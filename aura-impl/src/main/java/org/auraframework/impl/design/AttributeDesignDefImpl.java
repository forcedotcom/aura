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

import org.auraframework.builder.AttributeDesignDefBuilder;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class AttributeDesignDefImpl extends DefinitionImpl<AttributeDesignDef> implements AttributeDesignDef {
    private static final long serialVersionUID = 3290806856269872853L;
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

    protected AttributeDesignDefImpl(Builder builder) {
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
    public String getDescription() {
        return description;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<AttributeDesignDef> implements
            AttributeDesignDefBuilder {
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

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        public Builder() {
            super(AttributeDesignDef.class);
        }

        @Override
        public AttributeDesignDef build() throws QuickFixException {
            return new AttributeDesignDefImpl(this);
        }

        @Override
        public AttributeDesignDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setType(String type) {
            this.type = type;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setRequired(boolean required) {
            this.required = required;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setReadOnly(boolean readonly) {
            this.readonly = readonly;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setDependsOn(String dependency) {
            this.dependency = dependency;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setDataSource(String datasource) {
            this.datasource = datasource;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setMin(String min) {
            this.min = min;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setMax(String max) {
            this.max = max;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setPlaceholderText(String placeholder) {
            this.placeholder = placeholder;
            return this;
        }

    }
}
