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
    private Boolean required;
    private Boolean readonly;
    private String name;
    private String type;
    private String dependency;
    private String datasource;
    private String min;
    private String max;
    
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
    }
    
    public Boolean getRequired() {
        return required;
    }
    
    public Boolean getReadOnly() {
        return readonly;
    }
    
    @Override
    public String getName() {
        return name;
    }
    
    public String getType() {
        return type;
    }
    
    public String getDependency() {
        return dependency;
    }
    
    public String getDataSource() {
        return datasource;
    }
    
    public String getMin() {
        return min;
    }
    
    public String getMax() {
        return max;
    }
    
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        // TODO validation
    }
    
    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<AttributeDesignDef> implements AttributeDesignDefBuilder {
        private Boolean required;
        private Boolean readonly;
        private String name;
        private String type;
        private String dependency;
        private String datasource;
        private String min;
        private String max;
        
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
        public AttributeDesignDefBuilder setType(String type) {
            this.type = type;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setRequired(Boolean required) {
            this.required = required;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setReadOnly(Boolean readonly) {
            this.readonly = readonly;
            return this;
        }

        @Override
        public AttributeDesignDefBuilder setDependency(String dependency) {
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
        
    }
}
