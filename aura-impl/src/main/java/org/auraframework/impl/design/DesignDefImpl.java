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

import org.auraframework.builder.DesignDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {
    private static final long serialVersionUID = -8621907027705407577L;
    private final LinkedHashMap<String, AttributeDesignDef> attributeDesignDefs;
    private final String label;

    protected DesignDefImpl(Builder builder) {
        super(builder);
        this.attributeDesignDefs = builder.attributeDesignMap;
        this.label = builder.label;
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
    public Map<String, AttributeDesignDef> getAttributeDesignDefs() {
        return attributeDesignDefs;
    }

    @Override
    public String getLabel() {
        return label;
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
        private final LinkedHashMap<String, AttributeDesignDef> attributeDesignMap = new LinkedHashMap<String, AttributeDesignDef>();
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
        public DesignDefBuilder addAttributeDesign(String name, AttributeDesignDef attributeDesign) {
            this.attributeDesignMap.put(name, attributeDesign);
            return this;
        }

        @Override
        public DesignDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }
    }
}
